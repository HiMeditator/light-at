<div align="center" >
    <img src="assets/icons/light-at.png" width="90px" height="90px"/>
    <h1 align="center">light-at</h1>
    <p>轻亮是一个面向 VS Code 的智能助手插件。比起代码能力，轻亮更注重 IDE 内的大模型聊天体验。</p>
    <p>
        | <b>简体中文</b>
        | <a href="https://github.com/HiMeditator/light-at/blob/main/README_en.md">English</a>
        | <a href="https://github.com/HiMeditator/light-at/blob/main/README_ja.md">日本語</a> |
    </p>
</div>

<hr>

## 📥 下载

<a href="https://github.com/HiMeditator/light-at/blob/main/packages/extension/CHANGELOG.md">变更日志</a>

- [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=himeditator.light-at)

- [Github Release](https://github.com/HiMeditator/light-at/releases)

## 📚 用户手册

- [用户手册](docs/user-manual_zh-cn.md)
- [User Manual](docs/user-manual_en.md)
- [ユーザーマニュアル](docs/user-manual_ja.md)

## ✨ 特性

- **数学公式渲染:** 弥补了大多数智能助手没有数学公式渲染的缺点。

- **方便的模型配置:** 通过表格或修改配置文件管理模型。

- **选择聊天上下文:** 选择 IDE 中打开过的文本文件作为上下文

- **聊天记录管理:** 管理历史聊天，删除聊天中的内容

### ♾️ 数学公式渲染

![](assets/media/render.gif)

### 📝 模型配置

![](assets/media/model.gif)

### 📋 聊天上下文选择

![](assets/media/context.gif)

### 💬 聊天记录管理

![](assets/media/history.gif)

## 🚀 项目运行

本项目基于 [light-assistant](https://github.com/HiMeditator/light-assistant) 重构，优化了项目结构并使用 Vue 3 重构了前端。

如果想要更深入的了解项目具体结构，可参考 [技术文档](./docs/technical/)。

### 安装依赖

如果环境没有 `pnpm` 先执行 `npm install -g pnpm` 安装。

```bash
pnpm install
```

### 运行前端

通过此命令运行的前端没有接入 VS Code，无法进行交互。

```bash
pnpm dev
```

### 打包前端内容到插件

每次修改完前端部分需要执行该命令才能将内容更新到插件中。

```bash
pnpm build
```

### 运行插件

使用 VS Code，找到 `运行 > 启动调试` 运行插件。Windows 用户可以通过快捷键 `F5` 运行插件。

### 打包插件

打包前请确保前端更改已经通过 `pnpm build` 更新到插件中。

```bash
pnpm package
```

## 👏 致谢

插件图标修改自 [Duetone](assets/icons/credits.md) 的作品。
