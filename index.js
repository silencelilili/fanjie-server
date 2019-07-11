const express = require('express')
const app = express()
const http = require('http');
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const hostname = '0.0.0.0';
const port = 8082;

const options = {
  key: fs.readFileSync('./ssl/2461664_app.lixuedan.cn.key'),
  cert: fs.readFileSync('./ssl/2461664_app.lixuedan.cn.pem'),
  // ca: fs.readFileSync('./ssl/ca-cert.pem'),
  passphrase: '123456'
};

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    // res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// body 解析中间件
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// cookie 解析中间件
app.use(cookieParser())

// 引入 mongoose 相关模型
require('./models/user')
require('./models/cart')
require('./models/address')
require('./models/coupon')
require('./models/product')
require('./models/order')
require('./models/banner')
require('./models/category')

// 引入 api 路由
const routes = require('./routes/index')
// api 路由
app.use('/api', routes)

//配置服务端口
// const server = app.listen(8082, '172.18.4.45', function () {
//   let host = server.address().address;
//   let port = server.address().port;
//   console.log(host, port);
// })
http.createServer(app).listen(port, hostname, function () {
  console.log('Https server listening on port ' + 8082);
});
// https.createServer(options, app).listen(8082, '172.18.4.45', function () {
//   console.log('Https server listening on port ' + 8082);
// });