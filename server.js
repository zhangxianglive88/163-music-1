var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]
var qiniu = require("qiniu")

if (!port) {
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url
  var queryString = ''
  if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)

  if (path === '/uptoken') {
    var qiniuKey = fs.readFileSync("./qiniu-key.json")
    let {accessKey, secretKey} = JSON.parse(qiniuKey)
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    var bucket = "163-music-demo"
    var options = {
      scope: bucket,
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken=putPolicy.uploadToken(mac);
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/json; charset=utf-8')
    response.setHeader("Access-Control-Allow-Origin", "*")
    response.write(`
    {
      "uptoken":"${uploadToken}"
    }
    `)
    response.end()
  } else {
    response.statusCode = 404
    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    response.write(`
    {
      "error":"失败！"
    }
    `)
    response.end()
  }
})


/******** 代码结束，下面不要看 ************/
// 获取客户端传来的第四部分数据
function readBody(request) {
  let body = [] // 请求体
  return new Promise((resolve, reject) => {
    request.on('data', (chunk) => {  //request监听data事件，每次客户端传来一小块数据
      body.push(chunk)
    }).on('end', () => {  //当数据全部上传之后，就可以得到传递过来的所有数据啦
      body = Buffer.concat(body).toString()
      resolve(body)
    })
  })
}

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)


