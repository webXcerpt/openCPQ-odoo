# -*- coding: utf-8 -*-
from openerp import http

# class Opencpq(http.Controller):
#     @http.route('/opencpq/opencpq/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/opencpq/opencpq/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('opencpq.listing', {
#             'root': '/opencpq/opencpq',
#             'objects': http.request.env['opencpq.opencpq'].search([]),
#         })

#     @http.route('/opencpq/opencpq/objects/<model("opencpq.opencpq"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('opencpq.object', {
#             'object': obj
#         })