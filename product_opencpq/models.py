# -*- coding: utf-8 -*-

''' Old API '''

from openerp import api
from openerp.osv import fields, osv

class product_template(osv.osv):
    _inherit = 'product.template'
    _columns = {
        'configurator_ok': fields.boolean('Enable the openCPQ Product Configurator', help='Can this product be configured with the openCPQ product configurator? This field cannot be changed after creation.'),
        # TODO rename to 'configurator_url'
        'configurator_type': fields.char('Configurator URL', help='Reference to the configurator to be used for this product.'),
    }

    # Copied from [odoo]/addons/product/product.py and adapted.
    # (Unfortunately that function is quite monolithic.  So we were not able to
    # add our functionality without copying the original code.)
    #
    # Idea: Copy create_variant_ids to another addon, on which the current one
    # depends.  There the function just provides a hook allowing to skip the
    # expansion for certain product templates (and a default implementation of
    # the hook returning that the expansion should not be skipped).  Here we
    # would just implement the hook, returning that the expansion should be
    # skipped for openCPQ-configurable product templates.
    def create_variant_ids(self, cr, uid, ids, context=None):
        product_obj = self.pool.get("product.product")
        ctx = context and context.copy() or {}
        if ctx.get("create_product_variant"):
            return None

        ctx.update(active_test=False, create_product_variant=True)

        tmpl_ids = self.browse(cr, uid, ids, context=ctx)
        for tmpl_id in tmpl_ids:

            # -- openCPQ --
            # If the current product template is configurable with openCPQ,
            # skip the automatic generation of product variants.
            if tmpl_id.configurator_ok:
                continue
            # - end openCPQ --

            # list of values combination
            variant_alone = []
            all_variants = [[]]
            for variant_id in tmpl_id.attribute_line_ids:
                if len(variant_id.value_ids) == 1:
                    variant_alone.append(variant_id.value_ids[0])
                temp_variants = []
                for variant in all_variants:
                    for value_id in variant_id.value_ids:
                        temp_variants.append(sorted(variant + [int(value_id)]))
                if temp_variants:
                    all_variants = temp_variants

            # adding an attribute with only one value should not recreate product
            # write this attribute on every product to make sure we don't lose them
            for variant_id in variant_alone:
                product_ids = []
                for product_id in tmpl_id.product_variant_ids:
                    if variant_id.id not in map(int, product_id.attribute_value_ids):
                        product_ids.append(product_id.id)
                product_obj.write(cr, uid, product_ids, {'attribute_value_ids': [(4, variant_id.id)]}, context=ctx)

            # check product
            variant_ids_to_active = []
            variants_active_ids = []
            variants_inactive = []
            for product_id in tmpl_id.product_variant_ids:
                variants = sorted(map(int,product_id.attribute_value_ids))
                if variants in all_variants:
                    variants_active_ids.append(product_id.id)
                    all_variants.pop(all_variants.index(variants))
                    if not product_id.active:
                        variant_ids_to_active.append(product_id.id)
                else:
                    variants_inactive.append(product_id)
            if variant_ids_to_active:
                product_obj.write(cr, uid, variant_ids_to_active, {'active': True}, context=ctx)

            # create new product
            for variant_ids in all_variants:
                values = {
                    'product_tmpl_id': tmpl_id.id,
                    'attribute_value_ids': [(6, 0, variant_ids)]
                }
                id = product_obj.create(cr, uid, values, context=ctx)
                variants_active_ids.append(id)

            # unlink or inactive product
            for variant_id in map(int,variants_inactive):
                try:
                    with cr.savepoint(), tools.mute_logger('openerp.sql_db'):
                        product_obj.unlink(cr, uid, [variant_id], context=ctx)
                #We catch all kind of exception to be sure that the operation doesn't fail.
                except (psycopg2.Error, except_orm):
                    product_obj.write(cr, uid, [variant_id], {'active': False}, context=ctx)
                    pass
        return True

    '''
    # Not needed since the view already makes sure that the value of
    # configuration_ok cannot be edited once it has been stored.
    def write(self, cr, uid, ids, vals, context=None):
        res = super(product_template, self).write(cr, uid, ids, vals, context=context)
        if 'attribute_line_ids' in vals or vals.get('active') or 'configuration_ok' in vals:
            #                                                 =============================
            # openCPQ: Changes to configuration_ok also require recomputation of variants.
            self.create_variant_ids(cr, uid, ids, context=context)
        if 'active' in vals and not vals.get('active'):
            ctx = context and context.copy() or {}
            ctx.update(active_test=False)
            product_ids = []
            for product in self.browse(cr, uid, ids, context=ctx):
                product_ids = map(int,product.product_variant_ids)
            self.pool.get("product.product").write(cr, uid, product_ids, {'active': vals.get('active')}, context=ctx)
        return res
    '''


class product_product(osv.osv):
    _inherit = 'product.product'
    _columns = {
        'template_ok': fields.boolean('Use an openCPQ-template for this product', help='...'),
        'configuration_text': fields.text('Configuraton Text', help='...'),
        'configuration_html': fields.html('Configuration Html'),
        #'configuration_html': fields.html('Configuration Html', sanitize=True, strip_style=True),
    }
