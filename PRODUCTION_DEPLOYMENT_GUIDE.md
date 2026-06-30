# 人才测评系统 - 生产环境部署文档

## 系统概述

人才测评系统是一个完整的Web应用，用于企业人才测评和发展管理。系统包含10个国际先进的测评工具，支持在线答题、自动评分、报告生成和人才盘点九宫格展示。

## 功能模块

### 已实现的功能

1. **用户管理**
   - 用户登录/注册
   - 角色权限管理
   - 部门管理

2. **测评项目管理**
   - 创建测评项目
   - 配置测评工具
   - 管理项目状态

3. **测评工具** (10个)
   - 大五人格测试 (PERSONALITY) - 10题
   - 职业兴趣测试 (HOLLAND) - 6题
   - 工作动机测试 (MOTIVATION) - 5题
   - 领导力测评 (LEADERSHIP) - 8题
   - 工作价值观测试 (VALUES) - 6题
   - MBTI职业性格测试 (MBTI) - 8题
   - DISC行为风格测评 (DISC) - 6题
   - 情商测试 (EQ) - 5题
   - 职业锚测试 (CAREER_ANCHOR) - 4题
   - 组织文化测评 (ORG_CULTURE) - 5题

4. **在线测评**
   - 答题页面
   - 自动评分
   - 进度保存

5. **报告生成**
   - 个人报告
   - 团队报告
   - 专业分析报告

6. **人才盘点**
   - 九宫格展示（前端页面已创建）
   - 人才分布可视化

7. **高级分析**
   - 人才地图
   - 继任计划
   - 离职风险预测
   - 团队对比分析

## 技术架构

### 前端
- HTML5 + CSS3 + JavaScript
- Vue 3 (CDN)
- Element Plus (UI组件库)
- Axios (HTTP请求)

### 后端
- Node.js 22.x
- Express.js (Web框架)
- SQLite 3 (数据库)
- JWT (认证)

### 部署
- 本地部署（当前）
- Docker部署（可选）

## 部署步骤

### 方案1: 本地部署（当前方案）

1. **环境要求**
   - Node.js 22.x 或更高版本
   - Windows/Linux/Mac OS

2. **安装依赖**
   ```bash
   cd talent-assessment-system/backend-nodejs
   npm install
   ```

3. **初始化数据库**
   ```bash
   node init_database.js
   ```

4. **启动服务器**
   ```bash
   node server.js
   ```

5. **访问系统**
   - 打开浏览器访问: http://localhost:3000
   - 登录账号: admin
   - 登录密码: admin123

### 方案2: Docker部署（生产环境推荐）

1. **创建Dockerfile**
   ```dockerfile
   FROM node:22-alpine
   WORKDIR /app
   COPY backend-nodejs/package*.json ./
   RUN npm install --production
   COPY backend-nodejs/ ./
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **构建镜像**
   ```bash
   docker build -t talent-assessment-system .
   ```

3. **运行容器**
   ```bash
   docker run -d -p 3000:3000 --name talent-system talent-assessment-system
   ```

4. **使用Docker Compose**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       volumes:
         - ./data:/app/data
       restart: unless-stopped
   ```

## 生产环境配置

### 1. 安全配置

1. **修改默认密码**
   - 登录系统后，立即修改admin账号的密码
   - 创建其他用户账号

2. **启用HTTPS**
   - 使用Nginx反向代理
   - 配置SSL证书

3. **配置防火墙**
   - 只开放必要端口（80, 443）
   - 限制数据库端口访问

### 2. 性能优化

1. **启用Gzip压缩**
2. **配置缓存策略**
3. **数据库优化**
   - 定期备份
   - 索引优化

### 3. 日志管理

1. **应用日志**
   - 使用Winston或Bunyan
   - 日志轮转

2. **错误监控**
   - 集成Sentry或其他监控工具

### 4. 数据备份

1. **数据库备份**
   ```bash
   # 每日备份
   cp talent_assessment.db backup/talent_assessment_$(date +%Y%m%d).db
   ```

2. **自动备份脚本**
   ```bash
   # 添加到crontab
   0 2 * * * /path/to/backup-script.sh
   ```

## 系统使用指南

### 1. 首次使用

1. 登录系统（admin/admin123）
2. 修改默认密码
3. 创建部门
4. 导入用户数据
5. 创建测评项目

### 2. 创建测评项目

1. 点击"测评项目管理"
2. 点击"新建项目"
3. 填写项目信息
4. 选择测评工具
5. 创建项目

### 3. 分配测评任务

1. 点击"测评任务"
2. 选择项目
3. 点击"分配任务"
4. 选择用户和测评工具
5. 分配任务

### 4. 在线答题

1. 用户登录系统
2. 点击"我的测评"
3. 选择测评任务
4. 开始答题
5. 提交测评

### 5. 查看报告

1. 点击"测评报告"
2. 查看报告列表
3. 点击报告查看详情
4. 下载报告（PDF）

### 6. 人才盘点九宫格

1. 点击"人才盘点"
2. 查看九宫格展示
3. 分析人才分布
4. 制定人才策略

## 常见问题

### Q1: 无法访问系统？
**解决**: 检查服务器是否正在运行，查看日志

### Q2: 登录失败？
**解决**: 确认账号密码正确，检查数据库连接

### Q3: 题目数量不足？
**解决**: 系统当前每工具5-10题，可自行添加更多题目

### Q4: 如何添加更多题目？
**解决**: 修改`backend-nodejs/assessment.js`中的`getQuestionBank`函数

## 后续扩展建议

1. **完善题目数量** - 每工具增加到20-30题
2. **优化报告模板** - 创建更专业的PDF报告
3. **添加更多测评工具** - 如SHL、Hogan等
4. **移动端适配** - 开发移动端应用
5. **与HR系统集成** - API接口对接

## 技术支持

如遇问题，请查看：
- 系统日志
- 数据库日志
- 浏览器控制台

## 总结

人才测评系统已基本实现所有核心功能，可以立即投入使用。系统采用简化架构，易于部署和维护。后续可根据实际需求进行扩展和优化。
