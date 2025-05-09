const events = require('events');
var ProgressBar = require('progress');
const WebMWriterClass = require('../webm-writer');
const fs = require('fs');
const path = require('path');

var videoWriter = null;
var fd = null

class Page extends events.EventEmitter {
    constructor (props) {
    }
    async init () {
    }
    async startCut () {
    }
    stopCut () {
    }
    updateCanvas () {
    }
    /**
     * 视频转换成功后，关闭tab页
     */
    async close () {
    }
  }
  
  module.exports = Page;
