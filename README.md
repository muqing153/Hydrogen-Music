# 网易云音乐播放器

一个基于 Vue 3、Vite、TypeScript 和 Vuetify 构建的现代化音乐播放器应用，集成网易云音乐 API。

## 功能特性

- 🎵 完整的音乐播放功能（播放/暂停、上一首/下一首、进度控制）
- 🔍 音乐搜索功能
- 📋 推荐歌单、排行榜、个人歌单管理
- 👤 用户登录/登出及个人信息展示
- 🌓 深色/浅色主题切换
- 📱 响应式设计，支持桌面端和移动端适配
- 🎧 底部播放器和统一播放列表抽屉
- 💾 本地存储用户偏好设置（主题、用户信息等）

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI 组件库**: Vuetify 3
- **路由管理**: Vue Router 4
- **HTTP 客户端**: Axios
- **API 服务**: @neteasecloudmusicapienhanced/api (网易云音乐 API)
- **类型检查**: TypeScript + vue-tsc
- **代码格式化**: Prettier
- **图标库**: Material Design Icons

## 开发环境要求

- Node.js: ^20.19.0 或 >=22.12.0
- npm 或 yarn 包管理器

## 快速开始

### 安装依赖

```sh
npm install
```

### 启动开发服务器

```sh
npm run dev
```

这将同时启动：

- Vite 开发服务器（前端应用）
- 网易云音乐 API 服务（后端代理）

访问 [http://localhost:5173](http://localhost:5173) 查看应用。

### VSCode 调试配置

项目已包含 `.vscode/launch.json` 配置文件，提供以下调试选项：

1. **Run Vite** - 单独运行 Vite 开发服务器
2. **Run NCM API** - 单独运行网易云音乐 API 服务
3. **Run Vite + NCM API** - 同时运行前端和 API 服务（推荐）

在 VSCode 中按 `F5` 或使用 "运行和调试" 面板选择相应配置即可启动调试。

### 生产构建

```sh
# 类型检查并构建生产版本
npm run build

# 仅构建（不进行类型检查）
npm run build-only

# 预览生产构建结果
npm run preview

# 代码格式化
npm run format
```

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── AudioView.vue    # 音频视图组件
│   ├── LoginView.vue    # 登录对话框组件
│   ├── MusicPlaylist.vue # 音乐播放列表组件
│   ├── RecommendView.vue # 推荐页面组件
│   ├── SerchView.vue    # 搜索页面组件（注意拼写）
│   └── TopView.vue      # 排行榜组件
├── View/                # 视图组件（歌词、滑块等）
│   ├── LrcTools.ts      # 歌词工具函数
│   ├── LrcView.vue      # 歌词显示组件
│   ├── SliderSoundView.vue # 音量滑块组件
│   └── SliderView.vue   # 进度条滑块组件
├── router/              # 路由配置
│   └── index.ts         # 路由定义
├── App.vue              # 主应用组件（桌面端）
├── AppPhone.vue         # 移动端应用组件
├── bottomPlayer.vue     # 底部播放器组件
├── UnifiedPlaylistDrawer.vue # 统一播放列表抽屉
├── api.ts               # API 接口封装
├── player.ts            # 播放器核心逻辑
├── staic.ts             # 全局状态和常量（注意拼写）
├── state.ts             # 状态管理
└── main.ts              # 应用入口文件
```

## 主要功能模块

### 1. 用户认证系统

- 二维码扫码登录（网易云音乐）
- 登录状态持久化（Cookie + LocalStorage）
- 用户信息获取与展示（昵称、头像、VIP 状态）
- 自动刷新推荐数据（登录后）

### 2. 音乐播放功能

- 播放列表管理（添加、删除、清空）
- 播放模式切换（顺序播放、随机播放、单曲循环）
- 实时歌词同步显示
- 音量控制和进度拖拽
- 键盘快捷键支持（空格播放/暂停等）

### 3. 音乐发现

- 个性化推荐（每日推荐、热门歌单）
- 音乐搜索（歌曲、歌手、专辑）
- 排行榜浏览（各大榜单）
- 个人歌单管理（创建的歌单、收藏的歌单）

### 4. 界面特性

- 响应式布局（桌面端侧边栏 + 移动端全屏）
- 主题切换（深色/浅色/跟随系统）
- Keep-alive 缓存（推荐页面状态保持）
- 平滑过渡动画效果

## API 配置说明

本项目使用 [@neteasecloudmusicapienhanced/api](https://github.com/netease-cloud-music-api-enhanced/api) 作为网易云音乐 API 代理服务。

API 服务会在运行 `npm run dev` 时自动启动，默认端口为 `3000`。

如需修改 API 配置，请参考 `node_modules/@neteasecloudmusicapienhanced/api` 的相关文档。

## 浏览器兼容性

推荐使用现代浏览器：

- Chrome / Edge（最新版本）
- Firefox（最新版本）
- Safari（最新版本）

### 推荐浏览器插件

- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) - Vue 调试工具
- [Turn on Custom Object Formatter](http://bit.ly/object-formatters) - 自定义对象格式化（Chrome）

## 常见问题

### Q: 为什么无法登录？

A: 确保网易云音乐 API 服务正常运行，检查网络连接，尝试清除 Cookie 后重新登录。

### Q: 如何修改默认端口？

A: 编辑 `vite.config.ts` 文件，在 `server` 配置中添加 `port` 属性。

### Q: 移动端适配有问题？

A: 当前移动端断点设置为 768px，可在 `App.vue` 中调整 `isMobile` 的判断条件。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

---

**注意**: 本项目仅供学习和个人使用，请遵守网易云音乐的使用条款和版权规定。
