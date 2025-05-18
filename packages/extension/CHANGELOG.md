# Change Log

All notable changes to the "extension" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## v0.1.0

2025-04-07

项目基于 [light-assistant](https://github.com/HiMeditator/light-assistant) 重构，优化了项目结构并使用 Vue 3 重构了前端。

The project has been refactored based on [light-assistant](https://github.com/HiMeditator/light-assistant), optimizing the project structure and rebuilding the frontend using Vue 3.

## v0.1.1

2025-04-07

- 增加使用环境变量作为 `apiKey` 的特性（见用户手册）。
- 提升交互体验。

## v0.1.2

2025-04-08

- 修复了数学公式渲染的问题。

## v0.1.3

2025-04-14

- 增加 vscode 兼容版本（1.90.0 -> 1.80.0）。
- 修复了一级标题显示的问题。
- 优化历史聊天记录概览更新逻辑。

## v0.1.4

2025-04-21

- 修复英语环境下弹出信息不完整的问题
- 修复删除正在回答的信息时的逻辑问题
- 优化部分输入框颜色

## v0.1.5

2025-05-05

- 非连续对话改为也引入系统提示词
- 对于用户输入内容不再进行渲染
- 删除图片资源，减少插件大小

## v0.1.6

2025-05-??

- 不再显示输入内容前后的空白字符
- 修复保存含推理内容的聊天记录时，添加大量“null”字符串的问题