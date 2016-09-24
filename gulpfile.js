var path = require('path');
var fs = require('fs');
var yargs = require('yargs').argv;
var gulp = require('gulp');
var less = require('gulp-less');
var header = require('gulp-header');
var tap = require('gulp-tap');
var nano = require('gulp-cssnano');
var postcss = require('gulp-postcss');
var base64 = require('gulp-css-base64')
var autoprefixer = require('autoprefixer');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var changed = require('gulp-changed');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var browserSync = require('browser-sync');
var del = require('del');
var imagemin = require('gulp-imagemin');
var httpProxy = require("http-proxy-middleware");
var url = require('url');

var pkg = require('./package.json');


var option = {
  base: './src',
};
var dist = __dirname + '/dist';

var paths = {
  scripts: ['src/js/**/*.js'],
  styles: 'src/less/**/*',
  images: 'src/img/**/*',
  html: 'src/pages/**/*',
  lib: 'lib/**/*',
};

var banner = [
  '/*!',
  ' * <%= pkg.name %> v<%= pkg.version %> - <%= new Date() %> ',
  ' * <%= pkg.description %>',
  ' * Author: <%= pkg.author %> ',
  // ' * Licensed under the <%= pkg.license %> license',
  ' * <%= pkg.homepage %>',
  ' */',
  ''
].join('\n');

// 编译脚本
gulp.task('build:scripts', ['clean'], function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts, option)
    .pipe(sourcemaps.init())
    .pipe(concat('js/all.js'))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(uglify())
    .pipe(rename(function(path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest(dist));
});

// 编译样式
gulp.task('build:style', ['clean'], function() {
  gulp.src(paths.styles, option)
    .pipe(sourcemaps.init())
    .pipe(less().on('error', function(e) {
      console.error(e.message);
      this.emit('end');
    }))
    .pipe(postcss([autoprefixer]))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(base64({
      maxWeightResource: 10 * 1024,
      extensionsAllowed: ['.gif', '.jpg', ".png"]
    }))
    .pipe(sourcemaps.write())
    .pipe(rename({
      dirname: 'css'
    }))
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(nano())
    .pipe(rename(function(path) {
      path.basename += '.min';
    }), {
      dirname: 'css'
    })
    .pipe(gulp.dest(dist));
});


// 图片处理
gulp.task('build:img', ['clean'], function() {
  gulp.src(paths.images, option)
    .pipe(changed(dist))
    // .pipe(imagemin())
    .pipe(gulp.dest(dist));
});

// 页面处理
gulp.task('build:html', ['clean'], function() {
  gulp.src(paths.html, option)
    .pipe(changed(dist))
    .pipe(gulp.dest(dist));
});

gulp.task('copy:lib', ['clean'], function() {
  gulp.src(paths.lib, {
      base: "./"
    })
    .pipe(gulp.dest(dist));
});


// 清空图片、样式、js
gulp.task('clean', function() {
  return del.sync('./dist', {
    force: true
  });
});

// 定义release任务
gulp.task('release', ['clean', 'build:scripts', 'build:style', "build:img", 'build:html', 'copy:lib']);

// 定义watch任务
gulp.task('watch', function() {
  gulp.watch(paths.styles, ['build:style']);
  gulp.watch(paths.images, ['build:img']);
  gulp.watch(paths.html, ['build:html']);
  gulp.watch(paths.lib, ['copy:lib']);
});

// 定义server服务
gulp.task('server', function() {
  var middleware;
  if (yargs.proxy) {
    middleware = httpProxy('/api', {
      target: yargs.proxy || "http://127.0.0.1",
      changeOrigin: true, // needed for virtual hosted sites
      onProxyReq: function(proxyReq, req, res) {
        console.log("proxyReq", proxyReq.path);
      },
      onError: function(err, req, res) {
        console.log("onError", req.path);
        res.writeHead(500, {
          'Content-Type': 'text/plain'
        });
        res.end('Something went wrong. And we are reporting a custom error message.');
      },
      // ws: true, // proxy websockets
      // pathRewrite: {
      //     '^/old/api': '/new/api', // rewrite path
      //     '^/remove/api': '/api' // remove path
      // },
      // proxyTable: {
      //     // when request.headers.host == 'dev.localhost:3000',
      //     // override target 'http://www.example.org' to 'http://localhost:8000'
      //     'dev.localhost:3000': 'http://localhost:8000'
      // },
    });
  } else {
    middleware = function(req, res, next) {
      var urlObj = url.parse(req.url, true);
      if (/\.json$/.test(urlObj.pathname)) {
        var data = fs.readFileSync(path.join("mock", urlObj.pathname), 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
      }
      next();
    }

  }
  // middleware = yargs.mock ? mockMiddleware :
  yargs.p = yargs.p || 8880;
  browserSync.init({
    server: {
      baseDir: "./dist", //"./dist"
      middleware: middleware
    },
    // proxy: {
    //     target: "http://127.0.0.1/",
    //     middleware: function(req, res, next) {
    //         console.log(req.url);
    //         next();
    //     }
    // },
    //
    // files:[]
    // https: true,
    ui: {
      port: yargs.p + 1,
      weinre: {
        port: yargs.p + 2
      }
    },
    port: yargs.p,
    startPath: '/pages/index.htm'
  });
});

// 参数说明
//  -w: 实时监听
//  -s: 启动服务器
//  -p: 服务器启动端口，默认8080
gulp.task('default', ['release'], function() {
  if (yargs.s) {
    gulp.start('server');
  }

  if (yargs.w) {
    gulp.start('watch');
  }
});
