odoo.define('product_opencpq.dialog_basti', function (require) {
"use strict";

var Dialog = require('web.Dialog');

Dialog.include({
    init: function (parent, options) {
        this._super.apply(this, arguments);
        var self = this;
        switch(options.size) {
            case 'fullscreen':
                this.$modal.find('.modal-dialog').addClass('modal-fullscreen');
                break;
        }
    }
});

});
