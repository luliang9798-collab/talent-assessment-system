# 生产环境配置

## 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 最低配置: 2核CPU, 4GB内存, 20GB磁盘
- 推荐配置: 4核CPU, 8GB内存, 50GB磁盘

## 快速部署

### Linux/Mac
```bash
cd talent-assessment-system
chmod +x scripts/deploy-prod.sh
./scripts/deploy-prod.sh
```

### Windows
```bash
cd talent-assessment-system
scripts\deploy-prod.bat
```

## 访问地址

- 前端: http://your-server-ip
- 后端API: http://your-server-ip/api
- 默认账号: admin / admin123

## 配置HTTPS

1. 获取SSL证书（Let's Encrypt或商业证书）
2. 将证书放到 `docker/nginx/ssl/` 目录
3. 修改 `docker/nginx/nginx.conf`，启用HTTPS服务器配置
4. 重启服务: `docker-compose -f docker-compose.prod.yml restart`

## 数据库备份

### 自动备份
系统已配置自动每日备份，备份文件保存在 `backups/` 目录

### 手动备份
```bash
# 备份数据库
cp data/talent_assessment.db backups/talent_assessment_$(date +%Y%m%d).db

# 恢复数据库
cp backups/talent_assessment_20241201.db data/talent_assessment.db
docker-compose -f docker-compose.prod.yml restart backend
```

## 日志管理

### 查看日志
```bash
# 所有服务
docker-compose -f docker-compose.prod.yml logs -f

# 后端服务
docker-compose -f docker-compose.prod.yml logs -f backend

# 前端服务
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### 日志位置
- 后端日志: `logs/` 目录
- Nginx日志: Docker容器内 `/var/log/nginx/`

## 性能优化

### 1. 数据库优化
- 定期VACUUM数据库
- 创建索引（如需要）

### 2. 应用优化
- 启用Node.js集群模式
- 配置Redis缓存（如需要）

### 3. Nginx优化
- 已启用Gzip压缩
- 已配置静态文件缓存

## 安全加固

### 1. 修改默认密码
登录后立即修改admin密码

### 2. 配置防火墙
```bash
# 只开放80和443端口
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 3. 定期更新
定期更新Docker镜像和系统补丁

## 监控和告警

### 健康检查
- 后端: http://localhost:3000/api/health
- 前端: http://localhost/health

### 监控建议
- 使用Prometheus + Grafana监控
- 配置日志监控（ELK Stack）
- 设置告警规则

## 故障排查

### 服务无法启动
```bash
# 查看日志
docker-compose -f docker-compose.prod.yml logs

# 检查端口占用
netstat -tulpn | grep :80
netstat -tulpn | grep :3000

# 重启服务
docker-compose -f docker-compose.prod.yml restart
```

### 数据库损坏
```bash
# 从备份恢复
cp backups/talent_assessment_YYYYMMDD.db data/talent_assessment.db
docker-compose -f docker-compose.prod.yml restart backend
```

## 升级指南

### 升级到新版本
```bash
# 1. 备份数据库
cp data/talent_assessment.db backups/backup_before_upgrade.db

# 2. 拉取最新代码
git pull origin main

# 3. 重新构建并部署
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 4. 验证服务
curl http://localhost/api/health
```

## 技术支持

如有问题，请联系技术支持团队。
