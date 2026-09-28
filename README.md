# 电力配网抢修工单系统

面向供电所的配网故障报修、抢修派工、备件领用和停电恢复跟踪平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20104>

后端健康检查：<http://localhost:21104/health>

### 复电与备件核销联动

- 备件领用逐项审批：`POST /api/spare-part-usage/:id/approve`（仓管角色），通过后按**实发数量** `issued_quantity` 扣减仓库余量；余量不足返回 `409 PART_STOCK_INSUFFICIENT`，该领用单挂为「数量不足」，同一领用单重复提交沿用第一次结果，不会二次扣减。
- 退回：`POST /api/spare-part-usage/:id/return`，已通过的领用单按实发数量**补回余量**；重复退回幂等。
- 班组长确认复电：`POST /api/repair-ticket/:id/restore`（班组长角色）。存在「待审批」或「数量不足」的备件时拒绝复电（`409 RESTORE_PENDING_PARTS`），并在 `detail.pending_approval_codes / insufficient_codes` 中列出未处理编码；全部处理完（通过或退回）后复电成功，重复确认幂等。
- 请求头携带 `x-role`（`DISPATCHER/LEADER/WAREHOUSE_KEEPER/AUDITOR`）模拟 RBAC 身份；前端左下角可切换角色，备件审批仅仓管可见，复电按钮仅班组长可见。


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia |
| 后端 | Node.js + Express + TypeScript + Prisma |
| 数据库 | MySQL 8.0 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `grid-repair`
- `FRONTEND_PORT`: 前端端口，默认 `20104`
- `BACKEND_PORT`: 后端端口，默认 `21104`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: grid-repair`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-grid-repair}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FaultType: constants/FaultType、types/FaultType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- TicketStatus: constants/TicketStatus、types/TicketStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- AssetHealthStatus: constants/AssetHealthStatus、types/AssetHealthStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- SparePartUsageStatus（PENDING/APPROVED/RETURNED/STOCK_INSUFFICIENT）: 前后端 constants/SparePartUsageStatus、types/SparePartUsage、constructors、logTemplates（approve/return/deduct/refund）、errorCodes/errorMessages、RepairTicketService.restore 的拦截判断、ApprovalPanel 与备件页/工单页展示均有引用。
- Role（DISPATCHER/LEADER/WAREHOUSE_KEEPER/AUDITOR）: 前后端 constants/Role、rbacMiddleware、各写接口路由、api/http 请求头、SessionStore、角色切换器与按钮显隐均有引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
