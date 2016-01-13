from openerp import models, fields, api

class Wizard(models.TransientModel):
    _name = 'product_opencpq.wizard'

    def _default_opencpq_product(self):
        return self.env['product.product'].browse(self._context.get('active_id'))

    product_id = fields.Many2one('product.product',
        string="Product", required=True, default=_default_opencpq_product)
    configurator_type = fields.Char(string='Type of Configurator', related='product_id.configurator_type')
    configuration_text = fields.Text(string='Configuraton', related='product_id.configuration_text')
    configuration_html = fields.Html(string='Configuration Html', related='product_id.configuration_html')


    @api.multi
    def configuration_save(self):
        #self.product_id.configuration_result |= self.configuration_result
        self.product_id.configuration_text = self.configuration_text
        self.product_id.configuration_html = self.configuration_html
        return {}
