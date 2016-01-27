odoo.define('product_opencpq.configuration_dialog', function (require) {
"use strict";

var core = require('web.core');
var Dialog = require('web.Dialog');
var form_common = require('web.form_common');
require('web.DataModel'); //not sure why necessary

var QWeb = core.qweb;
var _t = core._t;

var FullscreenDialog = Dialog.extend({
    init: function (parent, options) {
        this._super.apply(this, arguments);
        this.$modal.find('.modal-dialog').addClass('modal-fullscreen');
    }
});

var ConfigurationDialog = form_common.FormWidget.extend({

	events: {
		"click .opencpq_button_class": "display_dialog",
	},

	start: function() {
        this._super();
        this.$el.html(QWeb.render("opencpq_configure", {}));
		this.display_html();
		this.field_manager.on("field_changed:configuration_html", this, this.display_html);

        this.on("change:effective_readonly", this, this.check_readonly);
        this.check_readonly();
	},

    check_readonly: function() {
        var ro = this.get("effective_readonly");
        this.$el.find(".opencpq_button_class").prop('disabled', ro);
    },

	display_html: function() {
		var html = this.field_manager.get_field_value("configuration_html");
		this.$el.find(".opencpq_html_class").html(html);
	},

    display_dialog: function() {
        var self = this;
        self.dialog = new FullscreenDialog(this, {
            title: _t('Product Configuration'),
            buttons: [
                    {
                        text: _t("OK"),
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
                "configurator": this.field_manager.get_field_value("configurator_type") || "not_configurable",
                "configuration_text": this.field_manager.get_field_value("configuration_text"),
                "configuration_html": this.field_manager.get_field_value("configuration_html") || "(not configured)",
            }),
        }).open();
    },

    save_configuration: function() {
        this.field_manager.set_values({
            "configuration_text": $(".opencpq_input_text").val(),
            "configuration_html": $(".opencpq_input_html").val(),
        });
    }

});

core.form_custom_registry.add('configuration_dialog', ConfigurationDialog);

});
