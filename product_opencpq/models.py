# -*- coding: utf-8 -*-

from openerp import api
from openerp.osv import fields, osv

class product_template(osv.osv):
    _inherit = 'product.template'
    _columns = {
        'configurator_ok': fields.boolean('Enable the openCPQ Product Configurator', help='Determine if a product can be configured with the openCPQ product configurator.'),
        'configurator_type': fields.char('Type of Configurator', help='Type a valid configurator name. It must be the same name as the Folder name in the static directory'),    
    }