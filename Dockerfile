# 使用官方Node.js镜像
FROM node:16

# 创建应用目录
WORKDIR /usr/src/app

# 安装应用依赖
COPY package*.json ./
RUN npm install

# 安装Chromium依赖
RUN apt-get update && apt-get install -y \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libxcomposite1 \
    libxrandr2 \
    libxtst6 \
    xdg-utils

# 拷贝应用源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 运行应用
CMD ["node", "server.js"]
