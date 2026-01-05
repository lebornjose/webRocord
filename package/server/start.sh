#!/bin/bash

# Server 快速启动脚本

echo "🚀 启动 rrweb Recording Server..."
echo ""

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install --cache /tmp/npm-cache-server --prefer-online
    echo ""
fi

# 检查 data 目录
if [ ! -d "data" ]; then
    echo "📁 创建数据目录..."
    mkdir -p data/recordings
    echo ""
fi

# 启动服务器
echo "✨ 启动服务器..."
npm run dev



