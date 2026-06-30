# 人才测评系统 - 部署检查清单

## ✅ 部署前检查

- [ ] Docker已安装 (版本 >= 20.10)
- [ ] Docker Compose已安装 (版本 >= 2.0)
- [ ] 端口80、8080、3306未被占用
- [ ] 磁盘空间充足 (至少5GB)

## 📋 部署步骤

1. **准备项目文件**
   ```bash
   # 确保所有文件已创建
   ls -la talent-assessment-system/
   ```

2. **构建后端应用**
   ```bash
   cd talent-assessment-system/backend
   mvn clean package -DskipTests
   cd ..
   ```

3. **启动Docker容器**
   ```bash
   docker-compose up -d
   ```

4. **检查服务状态**
   ```bash
   docker-compose ps
   ```

5. **查看日志**
   ```bash
   # 查看后端日志
   docker-compose logs -f backend
   
   # 查看前端日志
   docker-compose logs -f frontend
   
   # 查看数据库日志
   docker-compose logs -f mysql
   ```

## 🔍 验证部署

### 1. 检查数据库

```bash
# 连接数据库
docker exec -it talent-mysql mysql -uroot -p123456 talent_assessment

# 检查表是否创建
SHOW TABLES;

# 检查初始化数据
SELECT * FROM users;
SELECT * FROM roles;
```

### 2. 检查后端API

```bash
# 测试API是否可访问
curl http://localhost:8080/api/projects

# 测试登录接口
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. 检查前端页面

在浏览器中访问: http://localhost

应该看到登录页面。

## 🎯 首次使用

1. **登录系统**
   - 用户名: `admin`
   - 密码: `admin123`

2. **创建第一个测评项目**
   - 点击"测评项目管理"
   - 点击"新建项目"
   - 填写项目信息
   - 点击"创建"

3. **验证功能**
   - 检查项目是否创建成功
   - 检查首页统计数据是否更新

## 🐛 常见问题排查

### 问题1: 后端启动失败

**症状**: `docker-compose logs backend` 显示数据库连接失败

**解决**:
```bash
# 检查MySQL是否正常运行
docker-compose ps mysql

# 检查MySQL日志
docker-compose logs mysql

# 重启MySQL
docker-compose restart mysql

# 等待MySQL完全启动后，重启后端
docker-compose restart backend
```

### 问题2: 前端无法访问后端API

**症状**: 登录时显示"网络错误"

**解决**:
- 检查后端是否正常运行: http://localhost:8080/api/projects
- 检查Nginx配置: `docker-compose logs frontend`
- 检查CORS配置: 确保后端允许前端域名的请求

### 问题3: 登录失败

**症状**: 使用admin/admin123登录失败

**解决**:
```bash
# 手动插入管理员用户
docker exec -it talent-mysql mysql -uroot -p123456 talent_assessment

# 在MySQL中执行
INSERT INTO users (username, password, real_name, status) 
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '管理员', 1);

INSERT INTO user_roles (user_id, role_id) 
SELECT 1, id FROM roles WHERE role_code = 'ROLE_ADMIN';
```

## 📝 部署记录

- **部署时间**: ___________
- **部署人员**: ___________
- **部署环境**: ___________
- **遇到的问题**: ___________
- **解决方案**: ___________

---

**提示**: 部署成功后，建议立即修改admin账户的默认密码！
