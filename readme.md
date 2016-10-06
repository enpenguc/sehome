# se website

se home website

1.使用less和pug开发，用gulp构建，构建后的代码在dist目录。se.css为整站打包样式，每一个页面分别在pages下，详细见后面的目录结构说明

2.接入后端java,可以直接使用dist目录下的构建好的文件，直接拷贝过去使用即可。

3.也可以使用src来重新构建，亦或者直接使用src接入express(koa)做web端。

## 环境依赖

开发环境依赖nodejs，需要安装nodejs。详细见https://nodejs.org/zh-cn/

## 查看已构建静态页面效果

在当前目录下，cmd运行下面命令，再用浏览器查看页面效果

```bash
// 启动服务
$ npm run server
// 浏览器访问
http://127.0.0.1:3008
```

## 启动开发调试

如果开发，则需要按照开发环境依赖，再运行命令

```bash
// 安装依赖
$ npm install

// 启动开发调试
$ npm start

// 编译构建代码
$ npm run build
```

## 目录结构

当前使用的是前段工程化的方式开发，标准脚手架改进，具体如下：

```
.
├── bin                  # server运行命令目录
├── dist                 # 构建输出的文件会在这里
├── node_modules         # nodejs依赖第三方类库和工具
├── gulp-plugin          # gulp插件目录
├── src                  # 源代码
│   ├── img              # 图片
│   ├── js               # js源代码
│   ├── less             # less样式
│   │   ├── common       # 公共样式目录
│   │   ├── core         # 核心基础样式目录
│   │   ├── mixins       # mixins样式
│   │   ├── pages        # 各自页面的样式
│   │   │   ├── home     # 首页页面的样式，比较多分开多个文件
│   │   │   ├── about.less  # 关于我们页面的样式
│   │   │   └── ...      # 其他页面的样式
│   │   ├── themes       # 主题
│   │   ├── common.less  # common目录样式打包文件
│   │   ├── core.less    # core目录样式打包文件
│   │   └── se.less      # 合并所有样式打包为一个文件
│   └── pages            # html页面代码
│       ├── components   # 公共控件
│       ├── layout       # 模板页面
│       ├── about.pug    # 关于我们页面
│       └── ...          # 其他页面
├── vendor               # 依赖的第三方类库目录
│ ├── jquery             # jquery
│ └── unslider           # 轮播图片插件unslider
├── gulpfile.js          # gulp自动化编译构建命令
├── pagkage.json         # 工程配置文件，配置入口文件、依赖和 scripts
└── readme.md            # 说明文件
```

## 技术及查考

* [nodejs](http://www.runoob.com/nodejs/nodejs-tutorial.html) -- nodejs是啥，能干嘛，谁适合
* [nodejs](http://nodejs.cn/) -- nodejs官方中文站
* [less](http://lesscss.cn/) -- Less简介、如何下载并使用、案例
* [pug](https://pugjs.org/api/getting-started.html) -- pug模板官方开发文档
* [gulp](http://www.gulpjs.com.cn/) -- gulp中文网
* [browsersync](http://www.browsersync.cn/) -- 如何让浏览器实时、快速响应您的文件更改
* [gulp-rev](https://github.com/sindresorhus/gulp-rev) -- 静态资源MD5版本化处理
