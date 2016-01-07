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

function configurator_url(configurator_type) {
	if (!configurator_type)
		configurator_type = "no-configurator";
	return "/product_opencpq/static/" + configurator_type + "/index.html";
}

var ProductConfigurator = form_common.FormWidget.extend({
	start: function() {
        this._super();

		var $iframe = $("<iframe width='100%' height='400px'></iframe>");
		this.$el.empty().append($iframe);
		var iframe = $iframe.get(0);

		var url = configurator_url(null);
		iframe.src = url;

		var field_manager = this.field_manager;

		function getConfig() {
			return JSON.parse(
				field_manager.get_field_value("configuration_result")
			);
		}

		field_manager.on("view_content_has_changed", this, function() {
			console.log("VC");
			var new_url = configurator_url(
				field_manager.get_field_value("configurator_type")
			);
			if (new_url !== url) {
				console.log("URL changed", url, new_url);
				iframe.openCPQEmbeddingAPI = {
					config: getConfig(),
					outwardValue: function(value) {
						console.log("outwardValue",
							this.get("effective_readonly") ? "ro" : "r/w",
							JSON.stringify(value));
						if (this.get("effective_readonly"))
							alert("Use edit mode for changing the configuration.")
						else {
							field_manager.set_values({
								configuration_result: JSON.stringify(value)
							});
						}
					}.bind(this),
				}
				iframe.src = url = new_url;
			}
			else {
				var value = getConfig();
				console.log("inward", value,
					iframe.openCPQEmbeddingAPI &&
					iframe.openCPQEmbeddingAPI.inward
				);
				iframe.openCPQEmbeddingAPI &&
				iframe.openCPQEmbeddingAPI.inward &&
				iframe.openCPQEmbeddingAPI.inward(value);
			}
		});
	},
});

core.form_custom_registry.add('product_configurator', ProductConfigurator);

});
