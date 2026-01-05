#!/bin/bash

# rrweb 项目快速启动脚本

echo "🚀 rrweb 项目启动脚本"
echo "===================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 MongoDB
echo -e "${BLUE}1. 检查 MongoDB...${NC}"
if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}✅ MongoDB 正在运行${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB 未运行，尝试启动...${NC}"
    brew services start mongodb-community@7.0 2>/dev/null || \
    docker start mongodb 2>/dev/null || \
    echo -e "${RED}❌ 无法启动 MongoDB，请手动启动${NC}"
fi
echo ""

# 检查并启动后端服务器
echo -e "${BLUE}2. 启动后端服务器...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  端口 3000 已被占用${NC}"
else
    echo -e "${GREEN}✅ 在新终端启动后端服务器${NC}"
    osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/package/server && npm run dev"'
fi
echo ""

# 检查并启动 Admin 后台
echo -e "${BLUE}3. 启动 Admin 管理后台...${NC}"
if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  端口 5174 已被占用，Vite 将自动选择其他端口${NC}"
fi
echo -e "${GREEN}✅ 在新终端启动 Admin 后台${NC}"
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/package/admin && npm run dev"'
echo ""

# 检查并启动前端应用（可选）
echo -e "${BLUE}4. 启动前端应用（可选）...${NC}"
read -p "是否启动前端应用？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  端口 5173 已被占用${NC}"
    else
        echo -e "${GREEN}✅ 在新终端启动前端应用${NC}"
        osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/package/application && npm run dev"'
    fi
fi
echo ""

# 等待服务启动
echo -e "${BLUE}等待服务启动...${NC}"
sleep 3
echo ""

# 显示访问地址
echo -e "${GREEN}===================="
echo "🎉 启动完成！"
echo "===================="
echo ""
echo "📱 访问地址:"
echo "   - Admin 后台: ${BLUE}http://localhost:5175${NC}"
echo "   - 前端应用:   ${BLUE}http://localhost:5173${NC}"
echo "   - API 服务:   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "📚 快速测试:"
echo "   1. 打开 Admin 后台查看数据统计"
echo "   2. 打开前端应用进行录制"
echo "   3. 在 Admin 后台查看录制记录"
echo ""
echo "🛑 停止服务:"
echo "   使用 Ctrl+C 在各个终端窗口中停止服务"
echo -e "${GREEN}===================="${NC}

