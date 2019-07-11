
const moment = require('moment')
const mongoose = require('../mongoose')
const Product = mongoose.model('Product')
const Category = mongoose.model('Category')
const User = mongoose.model('User')

/**
 * 获取展示的分类列表
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getClassList = (req, res) => {
    Category.find({is_delete: true})
        .sort('+cate_order')
        .exec()
        .then(result => {
            const json = {
                code: 200,
                data: {
                    list: result
                }
            }
            res.json(json)
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}