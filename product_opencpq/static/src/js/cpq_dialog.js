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
    if (currentConfigurationDialog)
        currentConfigurationDialog.handleMessageEvent(event);
});

var ConfigurationDialog = Dialog.extend({
    init: function (parent) {
        var fm = parent.field_manager;
        this.configuratorReady = false;
        this.configuratorURL = resolveURL(fm.get_field_value("configurator_type") || "not_configurable"), // #### URL as fallback value!
        this.configuratorURLWithoutFragment = this.configuratorURL.replace(/#.*/, '');
        this.configuratorTag = "cfg_" + nextConfiguratorTag++;

        var options = {
            title: _t('Configuration: ' + (fm.get_field_value("name") || _t("unnamed product"))),
            // No buttons here.  They live inside the configuration iframe.
            buttons: [],
            $content: $(QWeb.render('OpenCPQConfigurator', {
                "configurator_url": this.configuratorURL
            })),
        };
        this._super(parent, options);
        this.$modal.find('.modal-dialog').addClass('modal-fullscreen');
    },

    open: function() {
        currentConfigurationDialog = this;
        this._super.apply(this, arguments);
        this.configuratorWindow = this.$modal.find(".oe_opencpq_iframe")[0].contentWindow;
    },

    destroy: function() {
        currentConfigurationDialog = null;
        this._super.apply(this, arguments);
    },

    set_buttons: function() {
        this._super.apply(this, arguments);
        // Buttons are provided by the configurator inside the iframe rather
        // than by this dialog.  So we don't need the footer.
        this.$footer.remove();
    },

    sendToConfigurator: function(action, args) {
        this.configuratorWindow.postMessage(
            {
                url: this.configuratorURLWithoutFragment,
                tag: this.configuratorTag,
                action: action,
                args: args
            },
            getOrigin(this.configuratorURLWithoutFragment)
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
        if (data.url !== this.configuratorURLWithoutFragment) {
            alert("Received message with unexpected configurator URL:\n" + data.url);
            return;
        }
        if (this.configuratorReady) {
            if (data.tag !== this.configuratorTag) {
                if (data.tag === undefined && data.action === "ready") {
                    alert(
                        "It looks like you reloaded the configurator frame. " +
                        "The configurator will be re-initialized."
                    );
                }
                else {
                    alert(
                        "Received message with tag '" + this.configuratorTag + "' from configurator. " +
                        "Expected '" + data.tag + "'.");
                    return;
                }
            }
        }
        else {
            if (data.tag !== undefined) {
                alert("Did not expect a tag ('" + data.tag + "') from a newly loaded configurator.");
                return;
            }
        }
        // If we come here, the message should be valid.  Handle it.
        switch(data.action) {
            case "ready":
                this.configuratorReady = true;
                this.sendToConfigurator("init", {
                    config: this.getParent().field_manager.get_field_value("configuration_text"),
                    embedderOrigin: getOrigin(document.URL)
                });
                break;
            case "close": {
                var args = data.args;
                if (args) {
                    var newValues = {};
                    if (args.hasOwnProperty("value"))
                        newValues.configuration_text = args.value;
                    if (args.hasOwnProperty("html"))
                        newValues.configuration_html = args.html
                    if (args.hasOwnProperty("price"))
                        newValues.lst_price = args.price;
                    var fm = this.getParent().field_manager;
                    fm.set_values(newValues);
                    // Mark form as dirty.  Apparently this is not being done by
                    // fm.set_values(...).
                    fm.do_notify_change();
                }
                this.destroy();
                break;
            }
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
        this._super.apply(this, arguments);
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
