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
    /* Approach -
		start: function() {
        this.$el.append("<div>Test!</div>");
        this.$el.append('<div><iframe src="/opencpq/static/optical-transport/index.html" width="100%" height="100%" marginwidth="0" marginheight="0" frameborder="no" scrolling="no" style="border-width:0px;"> </iframe></div>');
    },
    */

		start: function() {
        this._super();
        this.field_manager.on("field_changed:configurator_type", this, this.display_configurator);
        this.display_configurator();
    },

    display_configurator: function() {
        this.$el.html(QWeb.render("WidgetConfigurator", {
            "configurator": this.field_manager.get_field_value("configurator_type") || 0,
        }));
    }

		/*
		get iframe id
		provide embedding API for the iframe
		use get_field_value for the url_tag in the iframe
		use set_field_value for the configuration_result
		*/


});

core.form_custom_registry.add('product_configurator', ProductConfigurator);

});
