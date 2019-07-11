const mongoose = require('mongoose')
// mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb
// mongodb://admin:silence@mongod@59.110.164.143:27017/demo
// mongodb://localhost/wxapp
// mongodb://appuser2:fanjie2@localhost/wxapp
mongoose.connect('mongodb://appuser:fanjie@59.110.164.143/wxapp', { useNewUrlParser: true })
mongoose.Promise = global.Promise
module.exports = mongoose