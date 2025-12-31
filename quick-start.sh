#!/bin/bash

# webRocord 快速启动脚本
# 用于 macOS 系统

echo "🚀 webRocord 快速启动脚本"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 未找到 Node.js，请先安装 Node.js${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 版本: $(node --version)${NC}"

# 检查 Chrome
if [ ! -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    echo -e "${YELLOW}⚠️  未找到 Google Chrome，视频转换功能可能无法使用${NC}"
else
    echo -e "${GREEN}✅ 找到 Google Chrome${NC}"
fi

echo ""
echo "📦 检查依赖..."

# 函数：安装包依赖
install_package() {
    local pkg_name=$1
    local pkg_path=$2
    
    if [ ! -d "$pkg_path/node_modules" ]; then
        echo -e "${YELLOW}正在安装 $pkg_name 依赖...${NC}"
        cd "$pkg_path"
        npm install --cache /tmp/npm-cache-$pkg_name --prefer-online
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ $pkg_name 依赖安装成功${NC}"
        else
            echo -e "${RED}❌ $pkg_name 依赖安装失败${NC}"
            return 1
        fi
        cd - > /dev/null
    else
        echo -e "${GREEN}✅ $pkg_name 依赖已存在${NC}"
    fi
}

# 安装各个包的依赖
PROJECT_ROOT=$(pwd)

install_package "application" "$PROJECT_ROOT/package/application"
install_package "rrweb" "$PROJECT_ROOT/package/rrweb"
install_package "rrwebToMp4" "$PROJECT_ROOT/package/rrwebToMp4"

echo ""
echo -e "${GREEN}🎉 所有依赖安装完成！${NC}"
echo ""
echo "📱 启动选项："
echo "  1) 启动前端应用 (推荐)"
echo "  2) 测试视频转换功能"
echo "  3) 退出"
echo ""
read -p "请选择 (1-3): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}🚀 启动前端应用...${NC}"
        echo ""
        cd package/application
        npm run dev
        ;;
    2)
        echo ""
        echo -e "${GREEN}🎬 测试视频转换...${NC}"
        echo ""
        cd package/rrwebToMp4
        npm test
        ;;
    3)
        echo -e "${YELLOW}👋 再见！${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

