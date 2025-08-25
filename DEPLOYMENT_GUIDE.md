# 服务器部署指南

## 📋 概述

本指南介绍如何将构建后的Vue项目部署到服务器上运行。项目支持多种部署方式，包括Nginx、Docker等。

## 🚀 构建项目

### 1. 构建所有应用
```bash
# 在项目根目录执行
pnpm build
```

### 2. 构建特定应用
```bash
# 构建Ant Design版本
pnpm run build:antd

# 构建Element Plus版本  
pnpm run build:ele

# 构建Naive UI版本
pnpm run build:naive

# 构建演示应用
pnpm run build:play
```

构建完成后，会在各应用目录下生成 `dist` 文件夹，例如：
- `apps/web-antd/dist/`
- `apps/web-ele/dist/`
- `apps/web-naive/dist/`
- `playground/dist/`

## 🌐 方式一：Nginx部署（推荐）

### 1. 上传文件到服务器
将构建后的 `dist` 文件夹内容上传到服务器的指定目录，例如：
```bash
# 上传到服务器目录
scp -r apps/web-antd/dist/* user@server:/var/www/vben-admin/
```

### 2. Nginx配置

#### 基础配置
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为您的域名
    
    # 网站根目录
    root /var/www/vben-admin;
    index index.html;
    
    # 处理Vue Router的history模式
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML文件不缓存
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

#### 带API代理的配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/vben-admin;
    index index.html;
    
    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理到后端服务器
    location /api {
        proxy_pass http://49.233.169.30:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 解决跨域
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE';
        add_header Access-Control-Allow-Headers 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
        
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # 静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. 启用Gzip压缩
```nginx
http {
    # 开启gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
```

## 🐳 方式二：Docker部署

### 1. 使用项目提供的Dockerfile
```bash
# 构建Docker镜像
./scripts/deploy/build-local-docker-image.sh

# 或者手动构建
docker build -f scripts/deploy/Dockerfile -t vben-admin .
```

### 2. 运行Docker容器
```bash
# 运行容器
docker run -d -p 8080:8080 --name vben-admin vben-admin

# 访问地址
http://localhost:8080
```

### 3. 自定义Docker配置
```dockerfile
FROM nginx:stable-alpine

# 复制构建产物
COPY apps/web-antd/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 📁 方式三：静态文件服务器

### 1. 使用Node.js静态服务器
```bash
# 安装serve
npm install -g serve

# 在dist目录运行
cd apps/web-antd/dist
serve -s . -l 3000
```

### 2. 使用Python简单服务器
```bash
# Python 3
cd apps/web-antd/dist
python -m http.server 8000

# Python 2
cd apps/web-antd/dist
python -m SimpleHTTPServer 8000
```

### 3. 使用PHP内置服务器
```bash
cd apps/web-antd/dist
php -S localhost:8000
```

## 🔧 环境配置

### 1. 生产环境变量
确保生产环境使用正确的API地址：
```bash
# 已在vite.config.mts中配置
VITE_GLOB_API_URL=http://49.233.169.30:5000
```

### 2. 路由模式配置
```bash
# 使用hash模式（推荐，无需服务器配置）
VITE_ROUTER_HISTORY=hash

# 使用history模式（需要服务器配置）
VITE_ROUTER_HISTORY=history
```

## 📊 性能优化

### 1. 启用压缩
```bash
# 在vite.config.mts中配置
VITE_COMPRESS=gzip,brotli
```

### 2. 静态资源CDN
将静态资源上传到CDN，修改资源路径：
```bash
VITE_BASE=https://cdn.your-domain.com/
```

### 3. 缓存策略
```nginx
# 长期缓存静态资源
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 短期缓存HTML
location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

## 🚨 常见问题

### 1. 路由404错误
**问题**: 刷新页面出现404
**解决**: 确保Nginx配置了 `try_files $uri $uri/ /index.html;`

### 2. 静态资源路径错误
**问题**: CSS/JS文件加载失败
**解决**: 检查 `VITE_BASE` 配置和服务器路径

### 3. API跨域问题
**问题**: 前端无法访问后端API
**解决**: 使用Nginx代理或后端开启CORS

### 4. 构建文件过大
**解决**: 使用 `pnpm run build:analyze` 分析包大小，优化依赖

## 📝 部署检查清单

- [ ] 项目构建成功
- [ ] 静态文件上传到服务器
- [ ] Nginx配置正确
- [ ] 路由配置正确
- [ ] API地址配置正确
- [ ] 静态资源路径正确
- [ ] 启用Gzip压缩
- [ ] 配置缓存策略
- [ ] 测试所有功能正常
- [ ] 配置HTTPS（可选）
- [ ] 设置监控和日志

## 🔗 相关链接

- [Vite部署指南](https://vitejs.dev/guide/static-deploy.html)
- [Vue Router部署指南](https://router.vuejs.org/guide/essentials/history-mode.html)
- [Nginx官方文档](https://nginx.org/en/docs/)
- [Docker官方文档](https://docs.docker.com/) 
