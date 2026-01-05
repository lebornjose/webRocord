const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rrweb_recordings';
      
      console.log('🔌 正在连接 MongoDB...');
      
      this.connection = await mongoose.connect(mongoUri, {
        // 连接选项
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log('✅ MongoDB 连接成功!');
      console.log(`   数据库: ${mongoose.connection.name}`);
      console.log(`   主机: ${mongoose.connection.host}`);
      
      // 监听连接事件
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB 连接错误:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB 连接断开');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB 重新连接成功');
      });

      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB 连接失败:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('👋 MongoDB 连接已关闭');
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = new Database();


