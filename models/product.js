var mongoose = require('../mongoose')
var Schema = mongoose.Schema
var Promise = require('bluebird')

var ProductSchema = new Schema({
  title: String,  // 商品名称
  full_name: String, // 商品全称
  category: String,       //分类id
  category_name: String,  //分类名称
  stock: Number, // 库存
  cost: Number,  // 成本价
  price: Number, // 销售价
  image: Array, //商品图片
  intro_image: Array, //商品详情图片
  introduction: String, // 商品介绍
  memo: String,   // 备注
  is_marketable: Boolean, // 是否立即上架
  is_hot:Boolean,         //是否推荐
  timestamp: Number,      //时间戳
  creat_date: String,     //创建日期
  update_date: String,    //更新日期
  is_freight:Boolean      //是否包邮
})


// const data = {
//   title: String,          //名称
//   img: String,            //图片
//   spec:String,            //规格
//   price:String,           //价格
//   num:Number,             //数量
//   content: String,        //内容
//   html: String,           //html
//   category: String,       //分类id
//   category_name: String,  //分类名称
//   visit: Number,          //购买次数
//   like: Number,           //收藏
//   comment_count: Number,  //评价次数
//   creat_date: String,     //创建日期
//   update_date: String,    //更新日期
//   is_delete: Number,      //是否显示
//   timestamp: Number,      //时间戳
//   is_hot:Boolean,         //是否推荐
//   is_freight:Boolean      //是否包邮
// }

var Product = mongoose.model('Product', ProductSchema)
Promise.promisifyAll(Product)
Promise.promisifyAll(Product.prototype)

module.exports = Product
