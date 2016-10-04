var path = require('path');
var fs = require('fs');
var yargs = require('yargs').argv;
var gulp = require('gulp');
var changed = require('gulp-changed');
var debug = require('gulp-debug');
var plumber = require('gulp-plumber');
var header = require('gulp-header');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
// var tap = require('gulp-tap');
// css处理
var less = require('gulp-less');
var postcss = require('gulp-postcss');
var base64 = require('gulp-css-base64')
var autoprefixer = require('autoprefixer');
var nano = require('gulp-cssnano');
// 图片
var imagemin = require('gulp-imagemin');
// js
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var del = require('del');
// pug
var pug = require('gulp-pug');
// 版本处理
var rev = require('gulp-rev');
var revFormatExt = require('./gulp-plugin/gulp-rev-format-ext');
var revReplace = require('gulp-rev-replace');
// 代理
var httpProxy = require("http-proxy-middleware");
var url = require('url');


var pkg = require('./package.json');

var option = {
  base: './src'
};
var dist = __dirname + '/dist';

var paths = {
  scripts: 'src/js/**/*.js',
  styles: 'src/less/*.less',
  images: 'src/img/**/*',
  html: 'src/pages/**/*.html',
  vendor: 'vendor/**/*',
  pugs: 'src/pages/**/*.pug'
};

var banner = [
  '/*!',
  ' * <%= pkg.name %> v<%= pkg.version %> - build @<%= (new Date()).toLocaleDateString() %> ',
  ' * <%= pkg.description %>',
  ' * Author: <%= pkg.author %> ',
  // ' * Licensed under the <%= pkg.license %> license',
  ' * <%= pkg.homepage %>',
  ' */',
  ''
].join('\n');

// 编译脚本
gulp.task('build:scripts', function() {
  // 合并压缩js
  return gulp.src(paths.scripts, option)
    .pipe(changed(dist))
    .pipe(debug({
      title: 'debug build:scripts:'
    }))
    .pipe(sourcemaps.init())
    .pipe(concat('js/all.js'))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(sourcemaps.write())
    // .pipe(rev())
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(uglify())
    .pipe(rename(function(path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest(dist))
    // .pipe(rev.manifest({
    //   merge: true
    // }))
    // .pipe(gulp.dest(dist))
});

// 编译样式
gulp.task('build:style', function() {
  return gulp.src(paths.styles, {
      base: './src/less'
    })
    // .pipe(plumber())
    .pipe(changed("./dist/css", {
      extension: '.css',
      // https://www.npmjs.com/package/gulp-changed#example
      // https://github.com/gulpjs/vinyl#filerelative
      hasChanged: function(stream, cb, sourceFile, newPath) {
        if (sourceFile.relative === "se.less") {
          stream.push(sourceFile);
          cb();
        } else {
          changed.compareLastModifiedTime(stream, cb, sourceFile, newPath);
        }
      }
    }))
    .pipe(debug({
      title: 'debug build:style:'
    }))
    .pipe(sourcemaps.init())
    .pipe(less().on('error', function(e) {
      console.error(e.message);
      this.emit('end');
    }))
    .pipe(postcss([autoprefixer]).on('error', function(e) {
      console.error(e.message);
      this.emit('end');
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(base64({
      maxWeightResource: 10 * 1024,
      extensionsAllowed: ['.gif', '.jpg', ".png"]
    }))
    .pipe(sourcemaps.write())
    // .pipe(rename(function(path) {
    //   path.dirname = path.dirname.replace('less', 'css');
    // }))
    // .pipe(rev())
    .pipe(gulp.dest("./dist/css"))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(nano())
    .pipe(rename(function(path) {
      path.basename += '.min';
    }), {
      // dirname: 'css'
    })
    .pipe(gulp.dest("./dist/css"))
    // .pipe(concat('all.css'))
    // .pipe(gulp.dest("./dist/css"))
    // .pipe(rev.manifest({
    //   merge: true
    // }))
    // .pipe(gulp.dest(dist))
});

// 图片处理
gulp.task('build:img', function() {
  return gulp.src(paths.images, option)
    .pipe(changed(dist))
    .pipe(debug({
      title: 'debug build:img:'
    }))
    // .pipe(imagemin())
    .pipe(gulp.dest(dist));
});

// 复制依赖的第三方插件
gulp.task('copy:vendor', function() {
  return gulp.src(paths.vendor, {
      base: "./"
    })
    .pipe(changed(dist))
    .pipe(debug({
      title: 'debug copy:vendor:'
    }))
    .pipe(gulp.dest(dist));
});

// 处理版本
gulp.task("revision", ['build:scripts', 'build:style', 'build:img', 'copy:vendor'], function() {
  return gulp.src(["dist/**/*.css", "dist/**/*.js"], {
      // base: "./dist"
    })
    .pipe(changed(dist))
    .pipe(debug({
      title: 'debug revision:'
    }))
    .pipe(rev())
    .pipe(revFormatExt())
    .pipe(rev.manifest())
    .pipe(gulp.dest(dist))
})

// 页面处理
gulp.task('build:html', ['revision'], function() {
  var manifest = gulp.src(path.join(dist, "rev-manifest.json"));
  return gulp.src(paths.html, option)
    .pipe(changed(dist))
    .pipe(debug({
      title: 'debug build:html:'
    }))
    // 替换静态资源
    .pipe(revReplace({
      manifest: manifest
    }))
    .pipe(gulp.dest(dist));
});

// 页面处理
gulp.task('build:pug', ['revision'], function() {
  gulp.start("watch:pug");
});

gulp.task('watch:pug', function() {
  var manifest = gulp.src(path.join(dist, "rev-manifest.json"));
  return gulp.src(paths.pugs, option)
    .pipe(changed(dist, {
      extension: '.html'
    }))
    .pipe(debug({
      title: 'debug build:pug:'
    }))
    .pipe(pug({
      pretty: true
    }).on('error', function(e) {
      console.error(e.message);
      this.emit('end');
    }))
    // .pipe(pug().on('error', pug.logError))
    // 替换静态资源
    .pipe(revReplace({
      manifest: manifest
    }))
    .pipe(gulp.dest(dist));
})

// 清空图片、样式、js
gulp.task('clean', function() {
  return del.sync('./dist');
});

// 定义release任务
gulp.task('release', ['clean', 'build:scripts', 'build:style', 'build:img', 'revision', 'copy:vendor', 'build:html', 'build:pug']);

// 定义watch任务
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['build:scripts']);
  gulp.watch('src/less/**/*.less', ['build:style']);
  gulp.watch(paths.images, ['build:img']);
  gulp.watch(paths.html, ['build:html']);
  gulp.watch(paths.pugs, ['watch:pug']);
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
    startPath: '/pages/index.html'
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
