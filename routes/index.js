const express = require('express')
const router = express.Router()
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart({})
const intercept = require('../routes/intercept')

const userApi = require('../api/user-api.js')
const adminApi = require('../api/admin-api.js')
const orderApi = require('../api/order-api.js')
const homeApi = require('../api/home-api.js')
const publicApi = require('../api/public-api.js')


// ------- 微信 -------
router.get('/fanjie/wx/getUser', userApi.getWxUser) //获取微信用户信息

// ------- 首页 -------
router.get('/fanjie/home/bannerList',homeApi.getBannerList) //获取banner

router.get('/fanjie/home/getHotList',homeApi.getHotList) //获取上架中的推荐列表

router.get('/fanjie/home/getList',homeApi.getList) //获取上架中的商品列表
router.get('/fanjie/home/getItem',homeApi.getItem) //获取商品详情

// ------- 管理 -------

router.get('/fanjie/admin/userList', intercept.admin, adminApi.allUserList) //获取所有用户

router.get('/fanjie/admin/delUser', intercept.admin, adminApi.delUser) //删除用户


router.get('/fanjie/admin/productList', intercept.admin, adminApi.allProductList) //获取所有商品
router.get('/fanjie/admin/delItem', intercept.admin, adminApi.delItem) //删除商品
router.post('/fanjie/admin/addItem',intercept.admin, multipartMiddleware, adminApi.addItem) //添加商品
router.get('/fanjie/admin/soldoutItem',intercept.admin, multipartMiddleware, adminApi.soldoutItem) //下架商品
router.get('/fanjie/admin/putawayItem',intercept.admin, multipartMiddleware, adminApi.putawayItem) //上架商品


router.post('/fanjie/admin/addClass',intercept.admin, adminApi.addClass) //添加分类
router.get('/fanjie/admin/delClass',intercept.admin, adminApi.delClass) //删除分类
router.post('/fanjie/admin/editClass',intercept.admin, adminApi.editClass) //编辑分类
router.get('/fanjie/admin/classList',intercept.admin, adminApi.getAllClassList) //所有分类

router.post('/fanjie/admin/addCoupon',intercept.admin, adminApi.addCoupon) //添加优惠券
router.get('/fanjie/admin/delCoupon',intercept.admin, adminApi.delCoupon) //删除优惠券
router.post('/fanjie/admin/editCoupon',intercept.admin, adminApi.editCoupon) //编辑优惠券
router.get('/fanjie/admin/couponList',intercept.admin, adminApi.couponList) //所有优惠券

router.post('/fanjie/admin/uploadBanner',intercept.admin, adminApi.uploadBanner) //上传banner

router.get('/fanjie/admin/orderList',intercept.admin, adminApi.orderList) //获取所有订单


// ------- 通用 -------
router.get('/fanjie/public/getClassList',publicApi.getClassList) //获取分类列表

// ------- 用户 -------
router.post('/fanjie/user/bindMobile',intercept.user, userApi.bindMobile) //绑定手机号

router.post('/fanjie/user/addCity', intercept.user, userApi.addCity) //添加地址
router.post('/fanjie/user/editCity',intercept.user,userApi.editCity) //更新地址
router.get('/fanjie/user/delCity',intercept.user,userApi.delCity) //删除地址
router.post('/fanjie/user/defaultCity',intercept.user,userApi.defaultCity) //设置默认地址
router.get('/fanjie/user/cityList', intercept.user, userApi.cityList) //地址列表

router.post('/fanjie/user/getCoupon', intercept.user, userApi.getCoupon) //用户获取优惠券
router.get('/fanjie/user/couponList', intercept.user, userApi.couponList) //获取拥有的优惠券列表


// ------- 订单 -------
router.post('/fanjie/order/set',intercept.user,orderApi.setOrder) //创建订单

router.post('/fanjie/order/get',intercept.user,orderApi.getOrder) //获取订单详情

router.get('/fanjie/order/list',intercept.user,orderApi.getList) //订单列表

router.post('/fanjie/order/update',intercept.user,orderApi.updateOrder) //更新订单

// ------- 购物车 -------
router.post('/fanjie/order/addCart',intercept.user,orderApi.addCart) //加入购物车

router.get('/fanjie/order/cartList',intercept.user,orderApi.cartList) //购物车列表

router.post('/fanjie/order/delIetm',intercept.user,orderApi.cartDel) //购物车删除商品

router.post('/fanjie/order/editCart',intercept.user,orderApi.editCart) //编辑购物车

router.get('*', (req, res) => {
  res.json({
      code: 404,
      message: '没有找到该接口'
  })
})

module.exports = router