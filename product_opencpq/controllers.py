# -*- coding: utf-8 -*-
from openerp import http

# class ProductOpencpq(http.Controller):
#     @http.route('/product_opencpq/product_opencpq/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/product_opencpq/product_opencpq/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('product_opencpq.listing', {
#             'root': '/product_opencpq/product_opencpq',
#             'objects': http.request.env['product_opencpq.product_opencpq'].search([]),
#         })

#     @http.route('/product_opencpq/product_opencpq/objects/<model("product_opencpq.product_opencpq"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('product_opencpq.object', {
#             'object': obj
#         })