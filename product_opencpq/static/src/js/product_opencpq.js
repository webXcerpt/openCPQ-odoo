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
		var field_manager = this.field_manager;
		var configurator =
			this.field_manager.get_field_value("configurator_type")
			|| "no-configurator";
		var url = "/product_opencpq/static/" + configurator + "/index.html";
		// Creating iframe with jQuery instead of QWeb so that we can tweak it.
		var $iframe = $("<iframe width='100%' height='400px' />");
        this.$el.empty().html($iframe);
		$iframe[0].openCPQEmbeddingAPI = {
			config: JSON.parse(
				field_manager.get_field_value("configuration_result")
			),
			outward: function(ctx) {
				var value = ctx.value;
				if (value === undefined)
					value = null;
				field_manager.set_values({
					configuration_result: JSON.stringify(value)
				});
			}
		};
		// Set property openCPQEmbeddingAPI **before** src attribute so that
		// it is available in time to JS code inside the iframe.
		$iframe.attr("src", url);
    }
});

core.form_custom_registry.add('product_configurator', ProductConfigurator);

});
