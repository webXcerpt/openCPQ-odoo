odoo.define('product.product', function (require) {
"use strict";

var core = require('web.core');
var data = require('web.data');
var form_common = require('web.form_common');
var formats = require('web.formats');
var Model = require('web.DataModel');
var time = require('web.time');
var utils = require('web.utils');

var QWeb = core.qweb;
var _t = core._t;

var ProductConfigurator = form_common.FormWidget.extend({
	start: function() {
        this._super();
        this.field_manager.on("field_changed:configurator_type", this, this.display_configurator);
        this.display_configurator();
    },

    display_configurator: function() {
		var tagNo = (window.openCPQTagCount || 0) + 1;
		window.openCPQTagCount = tagNo;
		var tag = "tag_" + tagNo;
		var field_manager = this.field_manager;
		window.getOpenCPQEmbeddingAPI = function(tagFromChild) {
			// With some non-standard user behavior (such as using "back" and
			// "reload" in the browser) it might happen that a configurator in
			// an iframe tries to retrieve its embedding API when we already
			// provide an embedding API for some other iframe.  We detect such
			// cases by checking the tag passed via the iframe URL.
			if (tagFromChild !== tag) {
				alert(
					"Error (configurator embedding): " +
					"Unexpected tag: '" + tagFromChild + "' " +
					"(expected: '" + tag + "')"
				);
				return {
					outward: function() {
						alert("Error: Configurator not embedded properly.");
					}
				}
			}
			return {
				config: JSON.parse(field_manager.get_field_value("configuration_result")),
				outward: function(ctx) {
					var value = ctx.value;
					if (value === undefined)
						value = null;
					field_manager.set_values({configuration_result: JSON.stringify(value)});
				}
			};
		};
        this.$el.html(QWeb.render("WidgetConfigurator", {
			"tag": tag,
            "configurator": this.field_manager.get_field_value("configurator_type") || "no-configurator",
        }));
    }
});

core.form_custom_registry.add('product_configurator', ProductConfigurator);

});
