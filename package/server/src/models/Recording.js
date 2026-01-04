const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  // 录制唯一标识
  recordingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // rrweb 事件数据
  events: {
    type: [mongoose.Schema.Types.Mixed],
    required: true
  },
  
  // 元数据
  metadata: {
    title: {
      type: String,
      default: '未命名录制'
    },
    url: String,
    userAgent: String,
    userId: String,
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    eventCount: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 0
    },
    tags: [String],
    description: String
  },
  
  // 统计信息
  stats: {
    viewCount: {
      type: Number,
      default: 0
    },
    lastViewedAt: Date
  },
  
  // 状态
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt
  collection: 'recordings'
});

// 索引
recordingSchema.index({ 'metadata.recordedAt': -1 });
recordingSchema.index({ 'metadata.title': 'text' });
recordingSchema.index({ 'metadata.tags': 1 });

// 虚拟字段：格式化的录制时间
recordingSchema.virtual('formattedRecordedAt').get(function() {
  return this.metadata.recordedAt.toLocaleString('zh-CN');
});

// 实例方法：增加查看次数
recordingSchema.methods.incrementViewCount = function() {
  this.stats.viewCount += 1;
  this.stats.lastViewedAt = new Date();
  return this.save();
};

// 静态方法：查找最近的录制
recordingSchema.statics.findRecent = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'metadata.recordedAt': -1 })
    .limit(limit)
    .select('-events'); // 不返回 events 以提高性能
};

// 静态方法：搜索
recordingSchema.statics.search = function(keyword, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  
  return this.find({
    $text: { $search: keyword },
    status: 'active'
  })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit)
    .select('-events');
};

// 中间件：保存前自动计算统计信息
recordingSchema.pre('save', function(next) {
  if (this.isNew) {
    this.metadata.eventCount = this.events.length;
    
    // 计算时长
    if (this.events.length > 0) {
      const firstEvent = this.events[0];
      const lastEvent = this.events[this.events.length - 1];
      if (firstEvent.timestamp && lastEvent.timestamp) {
        this.metadata.duration = lastEvent.timestamp - firstEvent.timestamp;
      }
    }
  }
  next();
});

const Recording = mongoose.model('Recording', recordingSchema);

module.exports = Recording;

