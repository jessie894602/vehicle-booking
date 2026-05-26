FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package.json .
RUN npm install --production

# 复制项目文件
COPY . .

# 创建数据目录
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "backend.js"]
