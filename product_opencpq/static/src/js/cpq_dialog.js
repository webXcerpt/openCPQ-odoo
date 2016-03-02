odoo.define('product_opencpq.configuration_dialog', function (require) {
"use strict";

var core = require('web.core');
var Dialog = require('web.Dialog');
var form_common = require('web.form_common');
require('web.DataModel'); //not sure why necessary

var QWeb = core.qweb;
var _t = core._t;

// =============================================================================

// See https://gist.github.com/jlong/2428561
// for the idea of using an anchor element as an URL parser.
var urlParser = document.createElement("a");

function resolveURL(url) {
    urlParser.href = url;
    return urlParser.href;
}

function getOrigin(url) {
    urlParser.href = url;
    var origin = urlParser.origin;
    // File URLs are supported for development and test situations.
    // According to
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
    // targetOrigin "file://" does not work (currently) and must therefore be
    // replaced with "*".
    return origin === "file://" ? "*" : origin;
}

// =============================================================================

var nextConfiguratorTag = 0;
var currentConfigurationDialog = null;

window.addEventListener("message", function(event) {
    console.log({event});
    if (currentConfigurationDialog)
        currentConfigurationDialog.handleMessageEvent(event);
});

var ConfigurationDialog = Dialog.extend({
    init: function (parent) {
        this.field_manager = parent.field_manager;

        console.log(this.field_manager.get_field_value("configuration_text"));
        this.configuration_text = JSON.parse(this.field_manager.get_field_value("configuration_text"));
        this.configuration_html = this.field_manager.get_field_value("configuration_html");
        this.configuratorReady = false;
        this.configuratorURL = this.field_manager.get_field_value("configurator_type") || "not_configurable", // #### full URL as fallback value!
        this.configuratorTag = "cfg_" + nextConfiguratorTag++;

        var self = this;
        var options = {
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
                    close: true
                },
                {
                    text: _t("Undo (#### unimplemented)")
                },
                {
                    text: _t("Redo (#### unimplemented)")
                },
            ],
            $content: QWeb.render('OpenCPQConfigurator', {
                "configurator_url": this.configuratorURL
            }),
        };
        this._super(parent, options);
        this.$modal.find('.modal-dialog').addClass('modal-fullscreen');
    },

    open: function() {
        currentConfigurationDialog = this;
        this._super();
        this.configuratorWindow = this.$modal.find(".oe_opencpq_iframe")[0].contentWindow;
    },

    close: function() {
        currentConfigurationDialog = null;
        this._super.apply(this, arguments);
    },

    save_configuration: function() {
        this.field_manager.set_values({
            configuration_text: JSON.stringify(this.configuration_text),
            configuration_html: this.configuration_html,
        });
    },

    sendToConfigurator: function(action, args) {
        this.configuratorWindow.postMessage(
            {
                url: this.configuratorURL,
                tag: this.configuratorTag,
                action,
                args
            },
            getOrigin(this.configuratorURL)
        );
    },

    handleMessageEvent: function(event) {
        var data = event.data;
        if (event.source !== this.configuratorWindow) {
            // In this case we might ignore the message silently because it might
            // be a legitimate message for some other subsystem of the embedding
            // application.  If this is possible, deactivate the following statement:
            alert("Received message from unexpected window.");
            return;
        }
        if (data.url !== this.configuratorURL) {
            // Actually we should no more come here since we suppress history recording
            // in `loadConfigurator()`.
            // ### And for now this file does not support configurator switching anyway.
            alert(
                "Received message from configurator with unexpected URL. " +
                "(This may have been caused by using your browser's \"back\" button.) \n" +
                "The appropriate configurator will be loaded."
            );
            loadConfigurator(); // ####
            return;
        }
        if (this.configuratorReady) {
            if (data.tag !== this.configuratorTag) {
                if (data.tag === undefined && data.action === "ready") {
                    alert(
                        "It looks like you reloaded the configurator frame. " +
                        "The configurator will be set to the current configuration."
                    );
                }
                else {
                    alert(
                        `Received message with tag ${this.configuratorTag} from configurator. ` +
                        `Expected: ${data.tag}.`);
                    return;
                }
            }
        }
        else {
            if (data.tag !== undefined) {
                alert(`Did not expect a tag (${data.tag}) from a newly loaded configurator.`);
                return;
            }
        }
        // If we come here, the message should be valid.  Handle it.
        switch(data.action) {
            case "ready":
                this.configuratorReady = true;
                console.log(this.configuration_text);
                this.sendToConfigurator("init", {
                    config: this.configuration_text,
                    embedderOrigin: getOrigin(document.URL)
                });
                break;
            case "value":
                this.configuration_text = data.args;
                this.sendToConfigurator("value", data.args);
                break;
            case "results":
                this.configuration_html = data.args.html;
                break;
            default:
                throw "unexpected message action: " + data.action;
        }
    }

});

// Contents of the "Configuration" tab ("notebook page" in odoo terminology)
// of the product variant (product.product) form
var ConfigurationWidget = form_common.FormWidget.extend({

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
        new ConfigurationDialog(this).open();
    }
});

core.form_custom_registry.add('configuration_widget', ConfigurationWidget);

});
