#!/bin/bash

echo "🧪 测试 Admin API 接口"
echo "===================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 服务器地址
SERVER="http://localhost:3000"

echo -e "${BLUE}1. 测试健康检查...${NC}"
curl -s "$SERVER/health" | jq . || echo -e "${RED}❌ 健康检查失败${NC}"
echo ""

echo -e "${BLUE}2. 测试获取录制列表...${NC}"
curl -s "$SERVER/api/recording/list?page=1&limit=10" | jq '.success, .data | length' || echo -e "${RED}❌ 获取列表失败${NC}"
echo ""

echo -e "${BLUE}3. 测试获取统计信息...${NC}"
curl -s "$SERVER/api/recording/stats/summary" | jq '.' || echo -e "${RED}❌ 获取统计失败${NC}"
echo ""

echo -e "${BLUE}4. 测试搜索功能...${NC}"
curl -s "$SERVER/api/recording/search?q=表单&page=1&limit=10" | jq '.success' || echo -e "${RED}❌ 搜索失败${NC}"
echo ""

echo -e "${GREEN}===================="
echo "✅ API 测试完成"
echo "====================${NC}"

