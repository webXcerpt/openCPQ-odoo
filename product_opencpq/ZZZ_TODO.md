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
- `demo.xml`:  Demo data.


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
odoo/openCPQ integration code that might be reused by other openCPQ
integrations?


Phone Call Sebastian/Tim/Heribert, 2016-03-29
--------------------------------------------------------

- Prices
  - Start from button "Variant Prices" to see how per-variant prices work.
  - See also setting "Adv. pricing based on formula"
- Bugs
  - Button "Variants" should always appear for products with openCPQ-based
    configuration.
  - Button "Configure" should be of class "primary" (and thus blue) when
    activated.
- Notes from looking through the Odoo code:
  - Button "Variant Prices" is visible upon multiple variants.  (See below.)
    **Make visible for openCPQ products.**
  - `product_template` has a computed field `product_variant_count`
    - 27 occurrences in std Odoo addons:
      - 15 in "product":
        - 3 in `product.py`, class/table `product_template`:
          - 1 declaration as a computed field using function
            `_get_product_variant_count`, which actually gets the length of
            `product_variant_ids`
          - 1 test for == 1 in function `_compute_product_template_field`,
            reading the computed fields `standard_price`, `volume`, and `weight`
            from the variant if there is a single one.
          - 1 test for == 1 in function `_set_product_template_field`, writing
            the same computed fields to a single variant.
        - 1 in `pricelist.py`, class/table `product_pricelist`:
          - 1 test for > 1 in function `_price_rule_get_multi`
            ignore a pricing rule if we have multiple variants
            and/or other conditions hold.
            - *[This line seems to assume that there is always at least
              one variant.  This might lead to exceptions!]*
        - 11 in `product_view.xml`:
          - 3 occurrences as form fields (`product_template_kanban_view`,
            `product_template_only_form_view`, and `product_template_form_view`,
            the first one being invisible, the second one using widget
            `statinfo`)
          - 6 occurrences in invisibility tests
            - 2 visible on multiple variants:
              - line 78:
                button "Variant Prices" in `product_template_form_view`
              - line 323:
                button/field "Variants" in `product_template_only_form_view`
            - 4 visible on a single variant (or none):
              - lines 129, 130:
                field inventory group weight in `product_template_form_view`
              - lines 316, 317:
                fields `default_code` and `barcode` in
                `product_template_only_form_view`
          - 2 occurrences in conditional output
            - lines 369, 371: display # of variants only for multiple variants
      - 12 in "stock":
        - 8 occurrences just for passing around the value
        - 2 occurrences as invisible fields
        - 2 occurences using these invisible fields, making field
          `product_id` readonly if there is exactly 1 product variant.
          - I guess that in the case of multiple variants you can select another
            variant (via its product_id) from a menu.  If there's only one
            variant, there is no point to display a menu here.
    - What to do?
      - Change some/all of the tests on `product_variant_count`?
      - Or add dummy variants for openCPQ-configurable templates?
      - Or tweak the computation of the computed field, returning infinity
      for openCPQ-configurable products?

  - **Current Problems (2016-04-07 evening)**
    - My overridden price-calculation methods are not invoked.
      (Even when I add `print` statements to the original code, they are not
      executed.  But in some other methods it does work.  So the problem is
      not about writing to stdout.)
      - Am I displaying the wrong price?  Which one should I use?
      - Notice that Python-side code will only be invoked upon "save".
    - How to make field `configuration_price_extra` readonly but write it back
      to the server nevertheless?
      (There are quite a few posts and bug reports on this problem on the web.
      These people usually don't have a widget with multiple outputs, but just
      want a read-only field to be recomputed and stored upon changes of another
      field.)

- Allow to set the "internal reference" from the config dialog?
- Product name (in product-variant form)
  *[What did this note mean?]*
- Demo instructions
- Upload to Odoo app store (https://www.odoo.com/apps/upload)
