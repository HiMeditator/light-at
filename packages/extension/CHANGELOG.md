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

2025-05-18

- 不再显示输入内容前后的空白字符
- 修复保存含推理内容的聊天记录时，添加大量“null”字符串的问题

## v0.1.7

2025-06-26

- 修复载入历史记录时，没有载入推理内容的问题
- 优化推理内容展示逻辑，双击可展开推理内容
- 用户聊天提问增加复制功能

## v0.1.7

2025-08-20

- 添加 Ollma 模型服务 host 配置项
- 推理内容为空时不显示推理内容框

## v0.2.0

2026-02-08

- 添加默认系统提示词
- 优化上下文信息提示词

## v0.3.0

2026-03-01

- 优化默认系统提示词
- 添加 OpenRouter 模型服务
- 优化界面和模型图标

## v0.4.0

2026-04-23

- 添加自定义模型参数配置
- 为“添加模型”页面新增表单说明文字
- 优化模型流式输出的渲染效率
- 在模型输出时自动滚动到最新内容

## v0.5.0

2026-04-26

- 使用 Ollama 模型时支持使用图片作为上下文
- 添加新项目 [Light Mate](https://github.com/HiMeditator/light-mate) 的链接
