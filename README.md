# QQ 农场多账号挂机 + Web 面板(提高安全性版本)  
## 注意：本项目是基于 [Penty-d/qq-farm-bot-ui](https://github.com/Penty-d/qq-farm-bot-ui) 项目进行了安全性方面的升级优化(具体优化项详见[Update_security.log](./Update_security.log))，本项目会尽可能地及时同步原项目的其它功能更新，同时也会将相关优化修改内容作为PR提交给原项目进行合并，但不保证原项目会采纳同意。本项目的代码同步过程中可能会产生新的bug，如果遇到问题，请提 issue，会尽量解决，但不排除后续因两个代码改动差异太大无法继续同步原项目的功能更新，大家自行选择  
## 分支说明  
main分支：默认分支，基于原项目进行安全性优化，可直接clone使用  

feature/password-security-enhancement分支：原个人开发测试分支，已停用，后续移除，不建议使用  
  
security-enhancement-pr分支：用于提交PR到原项目的分支，与main分支基本一致，可直接clone使用
  
## 本项目的说明介绍  
说一下个人对于项目安全的看法：  

现阶段采取HTTPS传输是最直接有效的安全手段，无论如何都强烈建议你采用HTTPS的模式进行部署使用。  

虽然论安全性在部署的时候采用HTTPS传输信息相比通过这些手段加密肯定是最好的，但也不能完全解决安全性问题，网络上就没有绝对安全的东西，在这种情况下，只能尽可能地提高攻击门槛，从而“提高”项目安全而不是“解决”项目安全问题。

考虑到部署本项目的朋友中确实有一部分对技术并不是特别了解，且直接部署到云服务器暴露在公网环境并有可能通过一些公共环境设备如网吧之类的访问，原项目对安全问题并没有很认真的考虑对待，密码是明文传输、项目启动默认admin密码需要主动手动修改、后端校验密码的代码存在逻辑BUG，这些特性造成了这个项目的攻击门槛低的可以说没有，直接抓浏览器的请求就能获取到明文管理密码，一方面可以直接登录执行毁号等恶意操作（已经有许多人中招），另一方面明文密码可能是用户的常用密码，被获取到后可能会被拿去撞库（尝试其它场景的登录），所以特地fork了原项目进行修改优化。

现阶段确实如原项目作者所说的一样，前后端之间的数据传输如果不走HTTPS的话仍然可以拿到加密后的哈希然后模拟发请求去后端实现验证拿到token，仍然不安全

但是我觉得作为一个长期更新维护的公开项目，不能说解决不了安全问题就干脆放任安全问题不管，虽然采取HTTPS SSL的方式确实是一个很有效的方法，但是其所需的技术能力水平多数的项目使用者都无法自己做到，所以能在代码功能层面尽可能地提高哪怕一点点的安全性，我认为也是有价值有意义的，因此特地开了这个分支来优化提升安全性问题。

后续相关优化升级的内容我也会尝试提PR到原项目，但是原项目作者是否接受PR取决于他个人对安全问题的看法，我无权干涉，同时我的项目main分支会及时同步原项目的更新并加入我修改优化后功能，大家按需选择使用

# 以下为原项目的说明介绍内容  

基于 Node.js 的 QQ 农场自动化工具，支持多账号管理、Web 控制面板、实时日志与数据分析。

[Discord](https://discord.gg/zTEhed5qpc)

## 技术栈

**后端**

[<img src="https://skillicons.dev/icons?i=nodejs" height="48" title="Node.js 20+" />](https://nodejs.org/)
[<img src="https://skillicons.dev/icons?i=express" height="48" title="Express 4" />](https://expressjs.com/)
[<img src="https://skillicons.dev/icons?i=socketio" height="48" title="Socket.io 4" />](https://socket.io/)

**前端**

[<img src="https://skillicons.dev/icons?i=vue" height="48" title="Vue 3" />](https://vuejs.org/)
[<img src="https://skillicons.dev/icons?i=vite" height="48" title="Vite 7" />](https://vitejs.dev/)
[<img src="https://skillicons.dev/icons?i=ts" height="48" title="TypeScript 5" />](https://www.typescriptlang.org/)
[<img src="https://cdn.simpleicons.org/pinia/FFD859" height="48" title="Pinia 3" />](https://pinia.vuejs.org/)
[<img src="https://skillicons.dev/icons?i=unocss" height="48" title="UnoCSS" />](https://unocss.dev/)

**部署**

[<img src="https://skillicons.dev/icons?i=docker" height="48" title="Docker Compose" />](https://docs.docker.com/compose/)
[<img src="https://skillicons.dev/icons?i=pnpm" height="48" title="pnpm 10" />](https://pnpm.io/)
[<img src="https://skillicons.dev/icons?i=githubactions" height="48" title="GitHub Actions" />](https://github.com/features/actions)

---

## 功能特性

### 多账号管理
- 账号新增、编辑、删除、启动、停止
- 手动输入 Code
- 账号被踢下线自动删除
- 账号连续离线超时自动删除
- 账号离线推送通知（支持 Bark、自定义 Webhook 等）

### 自动化能力
- 农场：收获、种植、浇水、除草、除虫、铲除、土地升级
- 仓库：收获后自动出售果实
- 好友：自动偷菜 / 帮忙 / 捣乱
- 任务：自动检查并领取
- 好友黑名单：跳过指定好友
- 静默时段：指定时间段内不执行好友操作

### Web 面板
- 概览 / 农场 / 背包 / 好友 / 分析 / 账号 / 设置页面
- 实时日志，支持按账号、模块、事件、级别、关键词、时间范围筛选
- 深色 / 浅色主题切换

### 分析页
支持按以下维度排序作物：
- 经验效率 / 普通肥经验效率
- 净利润效率 / 普通肥净利润效率
- 等级要求

---

## 环境要求

- 源码运行：Node.js 20+，pnpm（推荐通过 `corepack enable` 启用）
- 二进制发布版：无需安装 Node.js

## 安装与启动（源码方式）

### Windows

```powershell
# 1. 安装 Node.js 20+（https://nodejs.org/）并启用 pnpm
node -v
corepack enable
pnpm -v

# 2. 安装依赖并构建前端
cd D:\Projects\qq-farm-bot-ui
pnpm install
pnpm build:web

# 3. 启动
pnpm dev:core

# （可选）设置管理密码后启动
$env:ADMIN_PASSWORD="你的强密码"
pnpm dev:core
```

### Linux（Ubuntu/Debian）

```bash
# 1. 安装 Node.js 20+
sudo apt update && sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
corepack enable

# 2. 安装依赖并构建前端
cd /path/to/qq-farm-bot-ui
pnpm install
pnpm build:web

# 3. 启动
pnpm dev:core

# （可选）设置管理密码后启动
ADMIN_PASSWORD='你的强密码' pnpm dev:core
```

启动后访问面板：
- 本机：`http://localhost:3000`
- 局域网：`http://<你的IP>:3000`

---

## Docker 部署

```bash
# 构建并后台启动
docker compose up -d --build

# 查看日志
docker compose logs -f

# 停止并移除容器
docker compose down
```

### 数据持久化

`docker-compose.yml` 已将数据目录挂载：

| 宿主机路径 | 容器内路径 |
|-----------|-----------|
| `./data`  | `/app/core/data` |

账号与配置数据保存在 `./data/accounts.json` 和 `./data/store.json`。

### 设置管理密码

在 `docker-compose.yml` 的 `environment` 中配置：

```yaml
environment:
  ADMIN_PASSWORD: 你的强密码
```

修改后执行 `docker compose up -d` 重启生效。

---

## 二进制发布版（无需 Node.js）

### 构建

```bash
pnpm install
pnpm package:release
```

产物输出在 `dist/` 目录：

| 平台 | 文件名 |
|------|--------|
| Windows x64 | `qq-farm-bot-win-x64.exe` |
| Linux x64 | `qq-farm-bot-linux-x64` |
| macOS Intel | `qq-farm-bot-macos-x64` |
| macOS Apple Silicon | `qq-farm-bot-macos-arm64` |

### 运行

```bash
# Windows：双击 exe 或在终端执行
.\qq-farm-bot-win-x64.exe

# Linux / macOS
chmod +x ./qq-farm-bot-linux-x64 && ./qq-farm-bot-linux-x64
```

程序会在可执行文件同级目录自动创建 `data/` 并写入 `store.json`、`accounts.json`。

---

## 登录与安全

- 面板首次访问需要登录
- 默认管理密码：`admin`
- **建议部署后立即修改为强密码**

---

## 项目结构

```
qq-farm-bot-ui/
├── core/                  # 后端（Node.js 机器人引擎）
│   ├── src/
│   │   ├── config/        # 配置管理
│   │   ├── controllers/   # HTTP API
│   │   ├── gameConfig/    # 游戏静态数据
│   │   ├── models/        # 数据模型与持久化
│   │   ├── proto/         # Protobuf 协议定义
│   │   ├── runtime/       # 运行时引擎与 Worker 管理
│   │   └── services/      # 业务逻辑（农场、好友、任务等）
│   ├── data/              # 运行时数据（accounts.json、store.json）
│   └── client.js          # 主进程入口
├── web/                   # 前端（Vue 3 + Vite）
│   ├── src/
│   │   ├── api/           # API 客户端
│   │   ├── components/    # Vue 组件
│   │   ├── stores/        # Pinia 状态管理
│   │   └── views/         # 页面视图
│   └── dist/              # 构建产物
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

---

## 特别感谢

- 核心功能：[linguo2625469/qq-farm-bot](https://github.com/linguo2625469/qq-farm-bot)
- 部分功能：[QianChenJun/qq-farm-bot](https://github.com/QianChenJun/qq-farm-bot)

## 免责声明

本项目仅供学习与研究用途。使用本工具可能违反游戏服务条款，由此产生的一切后果由使用者自行承担。
