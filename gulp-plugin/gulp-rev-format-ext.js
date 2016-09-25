/**
 * gulp-rev自定义版本格式扩展
 */
'use strict'
var gutil = require('gulp-util')
var through = require('through2')

module.exports = function (opts) {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file)
      return;
    }

    // Search for file.revOrigPath and file.revHash that would have been added by gulp-rev
    if ((typeof file.revOrigPath === 'undefined') || (typeof file.revHash === 'undefined')) {
      cb(new gutil.PluginError('gulp-rev-manifest-ext', 'File was not passed through "gulp-rev"'))
      return
    }
    file.path = file.revOrigPath + "?v=" + file.revHash;
    // send back to stream
    cb(null, file)
  }, function (cb) {
    cb()
  })
}
