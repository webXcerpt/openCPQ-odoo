# -*- coding: utf-8 -*-
{
    'name': "product_opencpq",

    'summary': """
        Integrate & manage your product variants with the openCPQ
        product configurator""",

    'description': """
openCPQ - Odoo Integration
==========================

* Integrate & manage your product variants with the openCPQ product configurator

* It's more scalable and flexible than the handling of product configuration in odoo-core
    """,

    'author': "webXcerpt Software GmbH, Sebastian Schmidt",
    'website': "www.webxcerpt.com",

    'category': 'Sales',
    'version': '9.0',

    # any module necessary for this one to work correctly
    'depends': ['base','sale'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        'views.xml',
        'templates.xml',
    ],
    # only loaded in demonstration mode
    'demo': [],

    'qweb': ['static/src/xml/product_opencpq.xml',],
}
