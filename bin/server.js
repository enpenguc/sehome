var http = require('http');
var url = require('url');
var fs = require('fs');
var mine = require('./modules/mime').types;
var path = require('path');
var childProcess = require('child_process');
// var spawn = require('child_process').spawn;

var options = {
  port: 3008,
  baseDir: "./dist",
  startPath: "/pages/home.html"
}

if (options.baseDir) {
  if (!fs.existsSync(options.baseDir)) {
    console.error("debug can't find basePath " + options.baseDir);
    return;
  }
  process.chdir(options.baseDir);
}

var server = http.createServer(function(request, response) {
  var pathname = url.parse(request.url).pathname;
  // console.log(pathname)
  var realPath = pathname.substr(1); //path.join("assets", pathname);
  // console.log(realPath);
  var ext = path.extname(realPath);
  ext = ext ? ext.slice(1) : 'unknown';
  if (realPath === "" || realPath === "/" && options.startPath !== realPath) {
    response.writeHead(302, {
      'Location': options.startPath
    });
    response.end();
    return;
  }
  fs.exists(realPath, function(exists) {
    if (!exists) {
      response.writeHead(404, {
        'Content-Type': 'text/plain'
      });
      console.warn("error can't find file: " + path.resolve(realPath));
      response.write(`This request URL ${pathname} was not found on this server.`);
      response.end();
    } else {
      fs.readFile(realPath, "binary", function(err, file) {
        if (err) {
          response.writeHead(500, {
            'Content-Type': 'text/plain'
          });
          response.end(err);
        } else {
          var contentType = mine[ext] || "text/plain";
          response.writeHead(200, {
            'Content-Type': contentType
          });
          response.write(file, "binary");
          response.end();
        }
      });
    }
  });
});

server.listen(options.port);
console.info(`当前http服务已经启动，目录: ${process.cwd()},端口: ${options.port}`);
console.log(`服务已经启动，请打开浏览器访问访问127.0.0.1:${options.port}。`);
// 打开网址
childProcess.exec(`start http://127.0.0.1:${options.port}`);
