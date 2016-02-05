# -*- coding: utf-8 -*-
{
    'name': "product_opencpq_layout",

    'summary': """
        Short (1 phrase/line) summary of the module's purpose, used as
        subtitle on modules listing or apps.openerp.com""",

    'description': """
        Long description of module's purpose
    """,

    'author': "My Company",
    'website': "http://www.yourcompany.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/master/openerp/addons/base/module/module_data.xml
    # for the full list
    'category': 'Uncategorized',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base','product_opencpq'],

    # always loaded
    'data': [
        'views/report_invoice.xml',
        'views/report_saleorder.xml',
        'views/saleorder_view.xml',
        'views/invoice_view.xml',
        'views/res_config_view.xml',
    ],

}
