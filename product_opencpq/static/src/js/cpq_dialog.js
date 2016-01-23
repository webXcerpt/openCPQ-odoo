odoo.define('product.product', function (require) {
"use strict";

var core = require('web.core');
var data = require('web.data');
var Dialog = require('web.Dialog');
var form_common = require('web.form_common');
var formats = require('web.formats');
var Model = require('web.DataModel');
var utils = require('web.utils');

var QWeb = core.qweb;
var _t = core._t;

var ConfigurationDialog = form_common.FormWidget.extend({

	events: {
		"click .opencpq_button_class": "display_dialog",
	},

	start: function() {
        this._super();
        this.display_dialogbutton();
    },

    display_dialogbutton: function() {
        this.$el.html(QWeb.render("opencpq_button", {
        }));
    },

    display_configurator: function() {
        this.$el.html(QWeb.render("WidgetConfigurator", {
            "configurator": this.field_manager.get_field_value("configurator_type") || 0,
        }));
    },

    display_dialog: function() {
        var self = this;
        self.dialog = new Dialog(this, {
            size: 'fullscreen',  // ToDo: Dialog widget erweitern, damits den case fullscreen auch gibt
            title: _t('Product Configuration'),
            buttons: [
                    {
                        text: _t("Apply"),
                        classes: 'btn-primary',
                        click: function () {
                            self.save_configuration();
                        },
                        close: true
                    },
                    {
                        text: _t("Cancel"),
                        close: true,
                    },
                ],
            $content: QWeb.render('OpencpqConfigurator', {
                "configurator": this.field_manager.get_field_value("configurator_type") || 0,
            }),
        }).open();
    },


    save_configuration: function() {
        var configuration_html_local = $(".opencpq_input_html").val();
        var configuration_text_local = $(".opencpq_input_text").val();
        this.field_manager.set_values({
            "configuration_text": configuration_text_local,
            //"configuration_html": "<h1>TEST</h1><div>tests</div>",
            "configuration_html": configuration_html_local,
        });
    }

    //Klappt soweit, aber Felder werden nur gesetzt, nicht gespeichert..
    //  Das ist problematisch, wenn man configure_button auch im readonly-mode erlauben würde
    //  Aber auch dann, wenn Zielfelder auch im edit-mode readonly sind(wie bei uns!)..dann speichert es die neuen werte nicht mit ab

		/*
		get iframe id
		provide embedding API for the iframe
		use get_field_value for the url_tag in the iframe
		use set_field_value for the configuration_result
		*/


});

core.form_custom_registry.add('configuration_dialog', ConfigurationDialog);

});
