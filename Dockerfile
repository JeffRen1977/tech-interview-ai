# 使用官方 Node.js 18 镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 文件
COPY backend/package*.json ./backend/

# 安装依赖
RUN cd backend && npm install --production

# 复制源代码
COPY backend/ ./backend/

# 暴露端口
EXPOSE 3000

# 启动命令
WORKDIR /app/backend
CMD ["npm", "start"] 