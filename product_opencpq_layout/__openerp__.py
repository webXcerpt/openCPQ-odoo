# -*- coding: utf-8 -*-
{
    'name': "product_opencpq_layout",

    'summary': """
        Print your openCPQ configurations to the invoice, saleorder
        and quotation reports""",

    'description': """
Print your openCPQ configurations to the invoice, saleorder and quotation reports
=================================================================================

* Available locations are inline or to an appendix

* The module also adds a menuitem which gives the user the possibility to set the default printing options for new invoices,saleorders and quotations
    """,

    'author': "webXcerpt Software GmbH, Sebastian Schmidt",
    'website': "www.webxcerpt.com",

    'category': 'Sales',
    'version': '9.0',

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
