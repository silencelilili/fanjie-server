const moment = require('moment')
const mongoose = require('../mongoose')
const Product = mongoose.model('Product')
const Banner = mongoose.model('Banner')
const marked = require('marked')

/**
 * 前台获得banner图片
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getBannerList = (req, res) => {
    
    Banner.find({is_show:true})
    .then(result=>{
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
/**
 * 前台获得推荐列表
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getHotList = (req, res) => {
  const { by, id, key } = req.query
  let { limit, page } = req.query
  page = parseInt(page, 10)
  limit = parseInt(limit, 10)
  
  if (!page) page = 1
  if (!limit) limit = 10

  const data = {
    is_marketable: true,
        is_hot: true
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
      'title full_name introduction category category_name visit like img spec price num likes image intro_image spec price stock is_hot creat_date update_date is_marketable timestamp'

  Promise.all([
      Product.find(data, filds)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(),
      Product.countAsync(data)
  ])
      .then(([data, total]) => {
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
 * 获得列表
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getList = (req, res) => {
  const { by, id, key } = req.query
  let { limit, page , category} = req.query
  page = parseInt(page, 10)
  limit = parseInt(limit, 10)
  if (!page) page = 1
  if (!limit) limit = 10
  const data = {
          is_marketable: true,
          category
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
 * 获取单个商品
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */

exports.getItem = (req, res) => {
  const _id = req.query.id
  const user_id = req.cookies.userid || req.headers.userid
  if (!_id) {
      res.json({
          code: -200,
          message: '参数错误'
      })
  }
  Promise.all([Product.findOneAsync({ _id, is_marketable: true }), Product.updateAsync({ _id }, { $inc: { visit: 1 } })])
      .then(value => {
          let json
          if (!value[0]) {
              json = {
                  code: -200,
                  message: '没有找到该商品'
              }
          } else {
              if (user_id) value[0]._doc.like_status = value[0].likes && value[0].likes.indexOf(user_id) > -1
              else value[0]._doc.like_status = false
              value[0].likes = []
              json = {
                  code: 200,
                  data: value[0]
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

