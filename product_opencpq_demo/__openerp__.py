# -*- coding: utf-8 -*-
{
    'name': "product_opencpq_demo",

    'summary': """
        Demo data for the openCPQ integration into Odoo
        """,

    'description': """
openCPQ Integration: Demo Data
==============================

Configurable products and configured products.

To use this demo data the openCPQ configurator demo from
https://github.com/webXcerpt/openCPQ-example-optical-transport
must be available at http://localhost:8080/.
    """,

    'author': "webXcerpt Software GmbH",
    'website': "www.webxcerpt.com",

    'category': 'Sales',
    'version': '9.0',

    # any module necessary for this one to work correctly
    'depends': ['product_opencpq'],

    # always loaded
    'data': [],

    # only loaded in demonstration mode
    'demo': [
        'demo.xml',
    ],

    'qweb': [],
}
