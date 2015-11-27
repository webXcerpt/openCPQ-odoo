# -*- coding: utf-8 -*-
from openerp import http

# class Snowing8(http.Controller):
#     @http.route('/snowing8/snowing8/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/snowing8/snowing8/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('snowing8.listing', {
#             'root': '/snowing8/snowing8',
#             'objects': http.request.env['snowing8.snowing8'].search([]),
#         })

#     @http.route('/snowing8/snowing8/objects/<model("snowing8.snowing8"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('snowing8.object', {
#             'object': obj
#         })