from openerp import models, fields, api

class Wizard(models.TransientModel):
    _name = 'product_opencpq.wizard'

    def _default_opencpq_product(self):
        return self.env['product.product'].browse(self._context.get('active_id'))

    product_id = fields.Many2one('product.product',
        string="Proooduct", required=True, default=_default_opencpq_product)
    configurator_type = fields.Char(string='Type of Configurator', related='product_id.configurator_type')
    configuration_result = fields.Text(string='Configuraton', help='This is the result of the configuration',related='product_id.configuration_result')

    @api.multi
    def subscribe(self):
        #self.product_id.configuration_result |= self.configuration_result
        self.product_id.configuration_result = self.configuration_result
        return {}
