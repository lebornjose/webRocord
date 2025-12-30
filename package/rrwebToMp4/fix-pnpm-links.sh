#!/bin/bash

# 修复 pnpm 的符号链接问题
# 用于解决 node_modules/.ignored 目录中的包无法被找到的问题

cd "$(dirname "$0")/node_modules"

echo "正在修复 pnpm 符号链接..."

# 为 .ignored 目录中的每个包创建符号链接
if [ -d ".ignored" ]; then
  for pkg in .ignored/*; do
    if [ -d "$pkg" ]; then
      pkgname=$(basename "$pkg")
      if [ ! -e "$pkgname" ]; then
        ln -sf "$pkg" "$pkgname"
        echo "✓ 已链接: $pkgname"
      fi
    fi
  done
fi

# 查找所有二级依赖并创建符号链接
find .ignored -mindepth 2 -maxdepth 2 -type d -name "node_modules" | while read nm_dir; do
  parent_dir=$(dirname "$nm_dir")
  parent_name=$(basename "$parent_dir")
  
  if [ -d "$nm_dir" ]; then
    cd "$nm_dir"
    for dep in *; do
      if [ -d "$dep" ] && [ ! -L "$dep" ]; then
        # 检查是否在根 node_modules 中存在
        if [ -d "../../$dep" ] && [ ! -L "../../$dep" ]; then
          # 相对路径链接
          target="../../$dep"
          if [ ! -e "$dep" ]; then
            ln -sf "$target" "$dep"
            echo "  ✓ 已链接依赖: $parent_name -> $dep"
          fi
        fi
      fi
    done
    cd - > /dev/null
  fi
done

echo ""
echo "✅ 符号链接修复完成！"
echo ""
echo "现在可以运行: npm test"

