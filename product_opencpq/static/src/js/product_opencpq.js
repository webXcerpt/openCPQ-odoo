odoo.define('product.product', function (require) {
"use strict";

var core = require('web.core');
var data = require('web.data'); // unused
var form_common = require('web.form_common');
var formats = require('web.formats'); // unused
var Model = require('web.DataModel'); // `Model` is unused, but we might still need to require it.
var time = require('web.time'); // unused
var utils = require('web.utils'); // unused

var QWeb = core.qweb;
var _t = core._t;

// Contents of the configuration dialog ### Is this used?  From the easy view?
var ProductConfigurator = form_common.FormWidget.extend({

	events: {
		"click .oe_opencpq_button": "button_clicked",
	},

	start: function() {
        this._super();
        this.field_manager.on("field_changed:configurator_type", this, this.display_configurator);
        this.display_configurator();
    },

    display_configurator: function() {
        this.$el.html(QWeb.render("WidgetConfigurator", {
            "configurator_url": this.field_manager.get_field_value("configurator_type") || 0,
        }));
		// Display fullscreen button only when in edit mode - this is primarily meant as an example
        //this.$("button").toggle(! this.get("effective_readonly"));
    },

	button_clicked: function() {
		this.$el.toggleClass('oe_opencpq_fullscreen');
		this.$el.find('.oe_opencpq_button').toggleClass('fa-expand fa-compress');
		//this.$el.find('.oe_opencpq_button span').toggleClass('glyphicon-resize-full glyphicon-resize-small');
		this.view.$el.find('.oe_chatter').toggle();
		$('#oe_main_menu_navbar').toggle();
	}

});

core.form_custom_registry.add('product_configurator', ProductConfigurator);

});
