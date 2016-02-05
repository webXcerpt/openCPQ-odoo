# -*- coding: utf-8 -*-
from openerp import fields, models

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    print_inline_saleorder = fields.Boolean(string="Print configuration inline", help="Print the configuration inline")
    print_appendix_saleorder = fields.Boolean(string="Print configuration to an appendix", help="Print the configuration to an appendix")

class AccountInvoice(models.Model):
    _inherit = "account.invoice"

    print_inline_invoice = fields.Boolean(string="Print configuration inline", help="Print the configuration inline")
    print_appendix_invoice = fields.Boolean(string="Print configuration to an appendix", help="Print the configuration to an appendix")

class OpencpqSettings(models.TransientModel):
    _name="product_opencpq_layout.opencpq_settings"
    _inherit = 'res.config.settings'

    default_print_inline_saleorder = fields.Boolean(default_model="sale.order", string="Sale Order/ Quotation: Print configuration inline (as default setting for new quotations/sale orders)", help="Print the configuration inline")
    default_print_appendix_saleorder = fields.Boolean(default_model="sale.order", string="Sale Order/ Quotation: Print configuration to an appendix (as default setting for new quotations/sale orders)", help="Print the configuration to an appendix")

    default_print_inline_invoice = fields.Boolean(default_model="account.invoice", string="Invoice: Print configuration inline (as default setting for new quotations/sale orders)", help="Print the configuration inline")
    default_print_appendix_invoice = fields.Boolean(default_model="account.invoice", string="Invoice: Print configuration to an appendix (as default setting for new quotations/sale orders)", help="Print the configuration to an appendix")
