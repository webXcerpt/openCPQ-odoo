Functionality and Data Model
============================

- A product template can be declared to support openCPQ.
  - The new boolean field `configurator_ok` says whether instances will be
    configurable with openCPQ.
  - The new string ("char") field `configurator_type` says which configurator
    should be used to configure instances.
    - Only relevant if `configurator_ok` is true.
    - *[Should become a URL rather than a URL segment!]*
  - Both new fields are immutable after the object creation.
    *[Is this true?]*
- Odoo automatically creates product variants for all the possible combinations
  of attribute values.  This is suppressed for product templates using openCPQ.
- Product variants are configurable if their template says so.
  The configurator is taken from the template.
  - The new boolean field `template_ok` says whether the product variant should
    be configurable with openCPQ.
    - If `template_ok` is true, then the product template can be chosen from the
      ones that have `configurator_ok` set to true.
    - If `template_ok` is false, then the product template can not be chosen.
      (It would appear to be consistent with the previous case if the user could
      choose from the templates that have `configuration_ok` set to false.  But
      notice that for those templates the product variants are created
      automatically rather than interactively.)
    - *[Shouldn't `template_ok` become immutable after object creation?]*
  - The new text field `configuration_text` holds the configuration in a
    way that's opaque to odoo and the odoo/openCPQ integration.  This value is
    only understood by the openCPQ configurator.
  - The new HTML field `configuration_html` holds the HTML result from the
    configurator.
- *[What about the "easy view" for product variants?]*


Code Structure
==============

Server Side
-----------

- `__init__.py`: just boilerplate<br>
  refers to
  - `controllers.py`
  - `models.py`
  - `wizard.py`
- `controllers.py`: empty
- `models.py`:
  - extends product templates (`product.template`) and product
    variants (`product.product`) as described above;
  - suppresses the automatic creation of variants from openCPQ-configurable
    templates;
- `wizard.py`: *[probably unused old code]*
- `__openerp__.py`: addon declaration and structure<br>
  refers to
  - `views.xml`
  - `templates.xml`
  - `demo.xml` (used only in demo mode)
  - `static/src/xml/product_opencpq.xml`
- `demo.xml`:  Demo data, nothing there yet.


Contributions to Client-Side Code<br>(Managed on the Server Side)
-----------------------------------------------------------------

- `views.xml`:
  contributes various records to table `ir.ui.view`
  - `wizard_form_view_opencpq`
	*[Probably old stuff.  The same goes for the action
	`launch_opencpq_wizard` whose only reference further down the file is
	commented out]*
  - `product_template_only_form_view2`:
	extends the view for `product.template`
  - `product_normal_form_view3`:
	- extends the view for `product.product` (i.e., product variants)
	-  contributes the "Configuration" tab and more
  - `product_variant_easy_edit_view5`:
	  extends the "easy view" for `product.product` (i.e., product variants)
- `templates.xml`:
  contributes links to our static resources (JS and styling, but not
  `product_opencpq.xml`) to a top-level odoo page:
  - `static/src/css/product_opencpq.css`
  - `static/src/js/product_opencpq.js`
  - `static/src/less/cpq_dialog.less`
  - `static/src/js/cpq_dialog.js`
- `static/src/xml/product_opencpq.xml`:
  templates for dynamic content
  *[For consistency with the JS and style files, some of these templates might
  go to a new file `cpq_dialog.xml`.]*
  - `opencpq_configure`: (used in `cpq_dialog.js`)
  - `OpenCPQConfigurator`: (used in `cpq_dialog.js`)
  - `WidgetConfigurator`: (used in `product_opencpq.js`)


Client Side
-----------

- `static/src/js/product_opencpq.js`:
  - form widget `ProductConfigurator`:
    using template `WidgetConfigurator`, used by two entries in `views.xml`
    *[one of them wizard-related and probably outdated]*
- `static/src/js/cpq_dialog.js`:
  - dialog `FullscreenDialog`: a dialog with specific styling, used in
    `ConfigurationDialog`
  - form widget `ConfigurationDialog`:
    *[should be renamed, because it's not a dialog]*
    contents of the configuration tab for product variants
    (used in `product_normal_form_view3` in `views.xml`),
    opens the dialog holding the configuration iframe
- `static/src/css/product_opencpq.css` and `static/src/less/cpq_dialog.less`:
  styling
  *[We should probably use LESS in both cases.]*


Dependency Chains
=================

- Product template form:
  - odoo standard view `product.product_template_only_form_view`
  - extended by view `product_template_only_form_view2` (`views.xml`)
- Product variant form:
  - odoo standard view `product.product_normal_form_view`
  - extended by view `product_normal_form_view3` (`views.xml`)
  - uses widget `configuration_widget` (`cpq_dialog.js`)
  - uses form widget `ConfigurationWidget` (`cpq_dialog.js`)
  - used dialog `ConfigurationDialog` (`cpq_dialog.js`)
  - uses template `opencpq_configure`
    (`product_opencpq.xml`; configuration tab)
    <br>and template `OpenCPQConfigurator`
    (`product_opencpq.xml`; configurator dialog)
- Product variant "easy view" *[Where is this used?]*:
  - odoo standard view `product.product_variant_easy_edit_view`
  - extended by view `product_variant_easy_edit_view5` (`views.xml`)
  - uses widget `product_configurator` (`product_opencpq.js`)
  - uses form widget `ProductConfigurator`  (`product_opencpq.js`)
  - uses template `WidgetConfigurator` (`product_opencpq.xml`)


To Do
=====

- Integrate with openCPQ
  - Store the full URL for a configurator, not just an identifier that will become
    a segment of the full URL.
    - static/src/xml/product_opencpq.js: attributes `t-attf-src` of the two
      iframes *[Why do we have two iframes?]*
  - Use the new message-passing interface of openCPQ.
  - FIXME: After changing the configuration we can move to another object using
    [ < | > ] without being asked whether we want to save the changes.
    (Changes are apparently not saved.) *[might work now]*
  - FIXME: consistent state representation (String/JSON/stuctured clone)
    *[should work now, but not really nice]*
  - Configuration-dependent prices *[later]*
- Make it more robust against broken data coming from the database or the
  configurator.  Also handle exceptions in the message handler.  (Both on the
  odoo side and on the openCPQ side!)
- Translate German comments to English.
- Do we need the "wizard"-related code or is this garbage from an earlier
  approach?
- Refactorings:
  - File structure:
    - Merge the two JS files.
    - Merge the CSS file into the LESS file.
    - *Or split `views.xml` and `product_opencpq.xml` into multiple files?
      Probably that's not worthwhile in our small code base.*
    - Remove `controllers.py`.
    - Move odoo-served configurators to a subdir `configurators` in `static`.
      (For now I have removed them completely since we serve configurators
      elsewhere, at least during development.)
  - Rename files, views, QWeb templates, JS classes, ...,
    keeping `../product_opencpq_layout` compatible.
    (Apparently the only name from `product_opencpq` used by
    `product_opencpq_layout` is `configuration_html`, at least for now.)
- Add demo data to `demo.xml`.
- Add files `LICENSE` (containing the LGPLv3) and `COPYRIGHT`.
  Add a note that Odoo is the copyright holder of `create_variant_ids`.
