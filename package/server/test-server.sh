#!/bin/bash

echo "🧪 测试 Server..."
echo ""

# 启动服务器（后台）
echo "📦 启动服务器..."
cd /Users/huangxing/projects/super/webRocord/package/server
npm start > /tmp/server-output.log 2>&1 &
SERVER_PID=$!

echo "等待服务器启动..."
sleep 3

# 测试健康检查
echo ""
echo "1️⃣  测试健康检查..."
curl -s http://localhost:3000/health | python3 -m json.tool || echo "❌ 服务器未响应"

# 停止服务器
echo ""
echo "🛑 停止服务器..."
kill $SERVER_PID 2>/dev/null

echo ""
echo "✅ 测试完成！"
echo ""
echo "查看服务器日志："
echo "cat /tmp/server-output.log"



