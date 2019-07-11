const moment = require('moment')
const mongoose = require('../mongoose')

const general = require('./general')
const Category = mongoose.model('Category')
const User = mongoose.model('User')
const Banner = mongoose.model('Banner')
const Coupon = mongoose.model('Coupon')
const Product = mongoose.model('Product')
const Address = mongoose.model('Address')
const Cart = mongoose.model('Cart')
const Order = mongoose.model('Order')
const multiparty = require('multiparty')

const { item, modify, deletes, recover } = general

/**
 * 上传banner图片
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */

exports.uploadBanner = (req,res) => {
    
  //生成multiparty对象，并配置上传目标路径
 const form = new multiparty.Form({uploadDir: './file/banner'});

 form.parse(req,(err, fields, files)=>{
     if(err){
         console.log(err);
     }else{
         var inputFile = files.inputFile[0];
         let data = {
             img_url:inputFile.path,        //图片地址
             href:fields.href[0],           //跳转地址
             name:fields.name[0],           //名称
             is_show:fields.is_show[0],       //是否显示
             effective:fields.effective[0].split(','),       //有效期
         }
         return Banner.createAsync(data).then(result => {
             res.json({
                 code: 200,
                 message: '添加成功',
                 data: result
             })
         }).catch(err => {
             res.json({
                 code: -200,
                 message: err.toString()
             })
         })
     }
 })
}

/**
* 更新banner图片
* @method
* @param  {[type]} req [description]
* @param  {[type]} res [description]
* @return {[type]}     [description]
*/

exports.updateBanner = (req,res) => {
 
 //生成multiparty对象，并配置上传目标路径
const form = new multiparty.Form({uploadDir: './file/banner'});

form.parse(req,(err, fields, files)=>{
    if(err){
        console.log(err);
    }else{
        var inputFile = files.inputFile[0];
        let data = {
            img_url:inputFile.path,        //图片地址
            href:fields.href[0],           //跳转地址
            name:fields.name[0],           //名称
            is_show:fields.is_show[0],       //是否显示
            effective:fields.effective[0].split(','),       //有效期
        }
        return Banner.createAsync(data).then(result => {
            res.json({
                code: 200,
                message: '添加成功',
                data: result
            })
        }).catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
    }
})
}

/*************************************************************************************************/

/**
 * 获取所有商品
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.allProductList = (req, res) =>{
    const { by, id, key, is_marketable} = req.query
  let { limit, page , category} = req.query
  page = parseInt(page, 10)
  limit = parseInt(limit, 10)
  if (!page) page = 1
  if (!limit) limit = 10
  const data = {
          is_marketable
        },
      skip = (page - 1) * limit
  if (id) {
      data.category = id
  }
  if (key) {
      const reg = new RegExp(key, 'i')
      data.title = { $regex: reg }
  }
  let sort = '-update_date'
  if (by) {
      sort = '-' + by
  }

  const filds =
      'title full_name introduction category category_name visit like image intro_image spec price stock is_hot creat_date update_date is_marketable timestamp'

  Promise.all([
      Product.find(data, filds)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(),
      Product.countAsync(data)
  ])
      .then(([data, total]) => {
          console.log(data, total)
          const totalPage = Math.ceil(total / limit)
          const user_id = req.cookies.userid || req.headers.userid
          const json = {
              code: 200,
              data: {
                  total,
                  hasNext: totalPage > page ? 1 : 0,
                  hasPrev: page > 1
              }
          }
          if (user_id) {
              data = data.map(item => {
                  item._doc.like_status = item.likes && item.likes.indexOf(user_id) > -1
                  item.content = item.content
                  item.likes = []
                  return item
              })
              json.data.list = data
              res.json(json)
          } else {
              data = data.map(item => {
                  item._doc.like_status = false
                  item.content = item.content
                  item.likes = []
                  return item
              })
              json.data.list = data
              res.json(json)
          }
      })
      .catch(err => {
          res.json({
              code: -200,
              message: err.toString()
          })
      })
}

/**
 * 添加商品
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.addItem = (req, res) => {
    // const { 
    //   category,
    //   content, 
    //   title,
    //   img,
    //   spec,
    //   price,
    //   num,
    //   is_hot
    // } = req.body
    const { 
      title,  // 商品名称
      full_name, // 商品全称
      categoryType,       //分类{id,名称}
      stock, // 库存
      cost,  // 成本价
      price, // 销售价
      image, //商品图片
      intro_image, //商品详情图片
      introduction, // 商品介绍
      memo,   // 备注
      is_marketable, // 是否立即上架
      is_hot,         //是否推荐
    } = req.body
    
    
    // const html = marked(content)
    // const arr_category = categoryType.split('|')
    const data = {
        title,
        full_name,
        stock,
        cost,
        price,
        memo,
        category: categoryType._id,
        category_name: categoryType.cate_name,
        introduction,
        creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        is_hot,
        is_marketable,
        timestamp: moment().format('X'),
        image,
        intro_image
    }
    Product.createAsync(data)
    .then(result => {
        return Category.updateAsync({ _id: categoryType._id }, { $inc: { cate_num: 1 } }).then(() => {
            return res.json({
                code: 200,
                message: '发布成功',
                data: result
            })
        })
    })
    .catch(err => {
        res.json({
            code: -200,
            message: err.toString()
        })
    })
}
  
  /**
  * 删除商品
  * is_marketable: false 未上架的商品
  * @method
  * @param  {[type]} req [description]
  * @param  {[type]} res [description]
  * @return {[type]}     [description]
  */
  exports.delItem = (req, res) => {
    const _id = req.query.id
    Product.find({_id},{"is_marketable": false}).then(result=>{
        let _list = result[0]
        Product.removeAsync({ "_id": _list._id })
        .then(() => {
            return Category.updateAsync({ "_id": _list._id }, { $inc: { cate_num: -1 } })
            .then(result => {
                res.json({
                    code: 200,
                    message: '删除成功',
                    data: result
                })
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
    })
    
  }
   /**
  * 下架商品
  * @method
  * @param  {[type]} req [description]
  * @param  {[type]} res [description]
  * @return {[type]}     [description]
  */
 exports.soldoutItem = (req, res) => {
    const _id = req.query.id;
    Product.find({_id},{'is_marketable': true})
    .then(result => {
        let _list = result[0]
        Product.updateAsync({ "_id": _list._id },{'is_marketable': false})
        .then(result => {
            res.json({
                code: 200,
                message: '下架成功',
                data: result
            })
        })
    })
    .catch(err => {
        res.json({
            code: -200,
            message: err.toString()
        })
    })
    
 }

   /**
  * 上架商品
  * @method
  * @param  {[type]} req [description]
  * @param  {[type]} res [description]
  * @return {[type]}     [description]
  */
 exports.putawayItem = (req, res) => {
    const _id = req.query.id;
    Product.find({_id},{'is_marketable': false})
    .then(result => {
        let _list = result[0]
        Product.updateAsync({ "_id": _list._id },{'is_marketable': true})
        .then(result => {
            res.json({
                code: 200,
                message: '上架成功',
                data: result
            })
        })
    })
    .catch(err => {
        res.json({
            code: -200,
            message: err.toString()
        })
    })
 }

  /*************************************************************************************************/
  /**
  * 获取所有用户
  * @method
  * @param  {[type]} req [description]
  * @param  {[type]} res [description]
  * @return {[type]}     [description]
  */
 exports.allUserList = (req, res) => {
    User.find()
    .then(result => {
        const json = {
            code: 200,
            data: result
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

  /**
  * 删除用户
  * @method
  * @param  {[type]} req [description]
  * @param  {[type]} res [description]
  * @return {[type]}     [description]
  */
  
  exports.delUser = (req, res) => {
    const _id = req.query.id
    User.find({_id}).then(result=>{
        let user = result[0]
        User.removeAsync({"openid":user.openid})
        .then((result) => { //删除关联数据
            Address.removeAsync({"openid":user.openid}).catch(err => {
                console.log(err.toString())
            })
            Cart.removeAsync({"openid":user.openid}).catch(err => {
                console.log(err.toString())
            })
            res.json({
                code: -200,
                message: '删除成功',
                data: result
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
    })
    
  }

  /*************************************************************************************************/
/**
* 添加分类
* @method
* @param  {[type]} req [description]
* @param  {[type]} res [description]
* @return {[type]}     [description]
*/
exports.addClass = (req, res) => {
 const { cate_name, cate_order, cate_desc, is_delete } = req.body
 if (!cate_name || !cate_order) {
     res.json({
         code: -200,
         message: '请填写分类名称和排序'
     })
 } else {
     return Category.createAsync({
         cate_name, // 类别名称
         cate_order, // 类别排序
         cate_desc, // 类别描述
         is_delete, // 是否显示
         creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
         update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
         timestamp: moment().format('X')
     }).then(result => {
         res.json({
             code: 200,
             message: '添加成功',
             data: result._id
         })
     }).catch(err => {
         res.json({
             code: -200,
             message: err.toString()
         })
     })
 }
}


/**
 * 删除分类
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.delClass = (req, res) => {
    deletes(req, res, Category)
}

/**
 * 编辑分类
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.editClass = (req, res) => {
    const { cate_name, cate_order, cate_desc, creat_date, is_delete, _id } = req.body
    let data = {
        cate_name, // 类别名称
         cate_order, // 类别排序
         cate_desc, // 类别描述
         is_delete, // 是否显示
         creat_date,
         _id,
         update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
         timestamp: moment().format('X')
    }
    let id = _id;
    modify(res, Category, id, data)
}

/**
 * 获取全部分类列表
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getAllClassList = (req, res) => {
    Category.find()
        .then(result => {
            const json = {
                code: 200,
                data: result
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

/*************************************************************************************************/
/**
 * 添加优惠券
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.addCoupon = (req,res) => {
  
  const {money,name,effective,category,category_name,condition } = req.body

  let data = {
      money,
      name,
      effective,
      category,
      category_name,
      condition,
      state:1
  }
  Coupon.createAsync(data)
  .then(result => {
      res.json({
          code: 200,
          message: '添加成功',
          data: result
      })
  })
  .catch(err => {
      res.json({
          code: -200,
          message: err.toString()
      })
  })
}

/** 
 * 删除优惠券
 * 
 */
exports.delCoupon = (req, res) => {
    deletes(req, res, Coupon)
}

/**
 * 编辑优惠券
 */
exports.editCoupon = (req, res) => {
    const {money, name, effective, category, category_name, condition, _id, state } = req.body
    let data = {
        money,
        name,
        effective,
        category,
        category_name,
        condition,
        _id,
        state
    }
    let id = _id;
    modify(res, Coupon, id, data)
}

/**
 * 全部优惠券列表
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.couponList = (req,res) => {
  Coupon.find()
  .then(result => {
      res.json({
          code: 200,
          data: result
      })
  })
  .catch(err => {
      res.json({
          code: -200,
          message: err.toString()
      })
  })
}

//*************************************************************************************************/

/**
 * 全部订单列表
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.orderList = (req,res) => {
    const { id, key, state} = req.query
    let { limit, page , category} = req.query
    page = parseInt(page, 10)
    limit = parseInt(limit, 10)
    if (!page) page = 1
    if (!limit) limit = 10
    const data = {
        state
    },
    skip = (page - 1) * limit
    if (id) {
        data.category = id
    }
    if (key) {
        const reg = new RegExp(key, 'i')
        data.title = { $regex: reg }
    }
    
    Promise.all([
        Order.find(data)
            .skip(skip)
            .limit(limit)
            .exec(),
            Order.countAsync(data)
    ])
    .then(result => {
        res.json({
            code: 200,
            data: result
        })
    })
    .catch(err => {
        res.json({
            code: -200,
            message: err.toString()
        })
    })
  }