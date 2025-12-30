# npm/pnpm 配置修复指南

## 问题
pnpm 安装时出现 `ERR_INVALID_THIS` 错误，可能与公司内网 registry 配置冲突。

## 解决方案

### 1. 查看当前配置
```bash
# 查看 npm registry
npm config get registry

# 查看 pnpm registry  
pnpm config get registry

# 查看所有配置
npm config list
pnpm config list
```

### 2. 重置为官方源
```bash
# npm 使用官方源
npm config set registry https://registry.npmjs.org/

# pnpm 使用官方源
pnpm config set registry https://registry.npmjs.org/

# 或者使用淘宝镜像（国内更快）
npm config set registry https://registry.npmmirror.com/
pnpm config set registry https://registry.npmmirror.com/
```

### 3. 清理缓存
```bash
# 清理 npm 缓存（如果有权限问题，跳过此步）
npm cache clean --force

# 清理 pnpm 缓存
pnpm store prune
```

### 4. 删除旧的 lockfile 和 node_modules
```bash
cd /Users/huangxing/projects/super/webRocord

# 删除根目录的 lockfile
rm -f pnpm-lock.yaml

# 删除 rrwebToMp4 的 node_modules
rm -rf package/rrwebToMp4/node_modules
```

### 5. 重新安装（使用 npm 而不是 pnpm）
```bash
# 进入 rrwebToMp4 目录
cd package/rrwebToMp4

# 使用 npm 安装（绕过 pnpm 6.35.1 的兼容性问题）
npm install

# 测试
npm test
```

## 如果需要恢复公司源
如果公司项目需要使用内网源，可以在项目根目录创建 `.npmrc` 文件：

```bash
# 在项目根目录创建 .npmrc
echo "registry=http://khome-rsfe.ksjgs.com/" > .npmrc

# 或者只为特定 scope 设置
echo "@your-company:registry=http://khome-rsfe.ksjgs.com/" > .npmrc
```

## 推荐做法
对于 `rrwebToMp4` 这个子包：
1. 不依赖 pnpm workspace 功能
2. 直接使用 npm 管理依赖
3. 避免 pnpm 6.35.1 的兼容性问题

## 补充说明
- npm 缓存权限问题需要运行：`sudo chown -R $(whoami) ~/.npm`
- pnpm 版本太老（6.35.1），建议升级到 8.x：`npm install -g pnpm@latest`

