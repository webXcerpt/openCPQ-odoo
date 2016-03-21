Functionality and Data Model
============================

- A product template can be declared to support openCPQ.
  - The new boolean field `configurator_ok` says whether instances will be
    configurable with openCPQ.
  - The new string ("char") field `configurator_type` says which configurator
    should be used to configure instances.
    - Only relevant if `configurator_ok` is true.
    - Contents is an URL referencing the configurator page.
    - *[For security we might add a mechanism allowing only particular URLs.
      OTOH, it might be sufficient if only certain persons may create
      (configurable) products.]*
  - Both new fields are immutable after the object creation.
    *[Is this true?]*
- Odoo automatically creates product variants for all the possible combinations
  of attribute values.  This is suppressed for product templates using openCPQ.
- Product variants are configurable if their template says so.
  The configurator is taken from the template.
  - The new boolean field `template_ok` says whether the product variant should
    be configurable with openCPQ.
    - If `template_ok` is true, then the product template can be chosen from the
      ones with `configurator_ok` set to true.
    - If `template_ok` is false, then the product template can not be chosen.
      (It would be analogous to the previous case if the user could
      choose from the templates with `configuration_ok` set to false.  But
      notice that for those templates the product variants are created
      automatically rather than interactively.)
    - *[Shouldn't `template_ok` become immutable after object creation?]*
  - The new text field `configuration_text` holds the configuration in a
    way that's opaque to odoo and the odoo/openCPQ integration.  This value is
    only understood by the openCPQ configurator.
  - The new HTML field `configuration_html` holds the HTML result from the
    configurator.
- The "easy view" for product variants (used when viewing the variants of a
  particular product template) is also extended to include the configuration.


Code Structure
==============

Server Side
-----------

- `__init__.py`: Python's module entry point; loads `models.py`.
- `models.py`:
  - extends product templates (`product.template`) and product
    variants (`product.product`) as described above;
  - suppresses the automatic creation of variants from openCPQ-configurable
    templates;
- `__openerp__.py`: Odoo's entry point; addon declaration and structure.<br>
  Refers to
  - `views.xml`
  - `templates.xml`
  - `demo.xml` (used only in demo mode)
  - `static/src/xml/product_opencpq.xml`
- `demo.xml`:  Demo data, nothing there yet.


Contributions to Client-Side Code<br>(Managed on the Server Side)
-----------------------------------------------------------------

- `views.xml`:
  contributes various records to table `ir.ui.view`
  - `product_template_only_form_view2`:
	extends the view for `product.template`
  - `product_normal_form_view3`:
	- extends the view for `product.product` (i.e., product variants)
	- contributes the "Configuration" tab and more
  - `product_variant_easy_edit_view5`:
	 - extends the "easy view" for `product.product` (i.e., product variants)
- `templates.xml`:
  contributes links to our static resources (JS and styling, but not
  `product_opencpq.xml`) to a top-level odoo page:
  - `static/src/less/product_opencpq.less`
  - `static/src/js/product_opencpq.js`
- `static/src/xml/product_opencpq.xml`:
  templates for dynamic content
  - `opencpq_configure`: (used in `product_opencpq.js`)
  - `OpenCPQConfigurator`: (used in `product_opencpq.js`)


Client Side
-----------

- `static/src/js/product_opencpq.js`:
  - dialog `ConfigurationDialog`: a dialog with specific styling, opened by
    `ConfigurationWidget`
  - form widget `ConfigurationWidget`:
    contents of the configuration tab for product variants
    (used in `product_normal_form_view3` in `views.xml`),
    opens the dialog holding the configuration iframe
- `static/src/less/product_opencpq.less`: styling


Dependency Chains
=================

- Product template form:
  - odoo standard view `product.product_template_only_form_view`
  - extended by view `product_template_only_form_view2` (`views.xml`)
- Product variant form:
  - odoo standard view `product.product_normal_form_view`
  - extended by view `product_normal_form_view3` (`views.xml`)
  - uses widget `configuration_widget` (`product_opencpq.js`)
  - implemented as form widget `ConfigurationWidget` (`product_opencpq.js`)
  - uses dialog `ConfigurationDialog` (`product_opencpq.js`)
  - uses template `opencpq_configure`
    (`product_opencpq.xml`; configuration tab)
    <br>and template `OpenCPQConfigurator`
    (`product_opencpq.xml`; configurator dialog)
- Product variant "easy view":
  - odoo standard view `product.product_variant_easy_edit_view`
  - extended by view `product_variant_easy_edit_view5` (`views.xml`)
  - uses widget `configuration_widget` (see above for dependencies)


Bugs
====

- Product variants derived from the same template seem to share their price.
  Reproduce: Configure a new variant.  All variants will get the new price.

To Do
=====

- Translate German comments to English. [Mostly done.]
- Refactorings:
  - Rename views, QWeb templates, JS classes, ...,
    keeping `../product_opencpq_layout` compatible.
    (Apparently the only name from `product_opencpq` used by
    `product_opencpq_layout` is `configuration_html`, at least for now.)
    - `configurator_type` should be renamed to `configurator_url`.
- Add demo data to `demo.xml`.
- Add files `LICENSE` (containing the LGPLv3) and `COPYRIGHT`.
  Add a note that Odoo is the copyright holder of `create_variant_ids`.

Open Questions
--------------

### Parent-side communication code

Should there be a utility lib provided by openCPQ with an API that's more
comfortable than raw messaging?  In other words: Is there some subset of the
odoo/openCPQ integration code that might be reused by other openCPQ integrations?
