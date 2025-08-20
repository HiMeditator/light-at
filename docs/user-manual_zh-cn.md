# Light At 用户手册

适用于插件版本 v0.1.1

- [English Version](user-manual_en.md)
- [日本語版](user-manual_ja.md)

![](img/01.png)

## 📝 配置模型

### 通过配置文件配置模型

点击插件界面右上角 `配置文件` 选项，跳转到插件配置文件，可以在这里快速配置聊天模型。

配置格式如下：

```json
{
  "models": [
    {
      "id": "p_Xb-FcE7SeVgSG6SfdWB",
      "type": "ollama | openai",
      "model": "model name",
      "title": "display name",
      "baseURL": "https://model_base_url",
      "host": "Ollama serve host",
      "apiKey": "sk-* | env@API_KEY"
    }
  ]
}
```
- `id`：必须。模型唯一标识符，可以自定义，保证和其他 `id` 不同即可。
- `type`：必须。模型类型，可选值：`ollama` 或 `openai`。前者使用本地 [Ollama](https://github.com/ollama/ollama) 配置的模型，后者使用 node.js 的 OpenAI 库调用云端模型。
- `model`：必须。模型名称，例如：`llama3.3-70b-instruct`。
- `title`：可选。模型显示名称，如果不设置，默认为 `model` 的值。
- `baseURL`：若 `type` 为 `openai` 则必须。API 请求的基础 URL，取决于您的模型服务商。
- `host`: 可选。Ollama 服务器的主机地址，或者 localhost 的端口号。
- `apiKey`：若 `type` 为 `openai` 则必须。API 密钥，从您的模型服务商获取。

> **注意:** 对于 `apiKey` 字段，您可以使用环境变量。设置格式为：`env@API_KEY_NAME` 其中 `API_KEY_NAME` 为您实际的 API 密钥在环境变量中对应的名称。刚设置的环境变量可能不生效，一般需要重启电脑后生效。

以下是一些提供商的 `baseURL`：
- OpenAI: https://api.openai.com/v1
- DeepSeek：https://api.deepseek.com
- 阿里云：https://dashscope.aliyuncs.com/compatible-mode/v1

以下是一个具体示例：

```json
{
  "models": [
    {
      "id": "qwen2.5-no.001",
      "type": "ollama",
      "model": "qwen2.5",
      "title": "qwen2.5-7b"
    },
    {
      "id": "deepseek-r1-no.002",
      "type": "ollama",
      "model": "deepseek-r1",
      "host": "http://localhost:12345"
    },
    {
      "id": "WyCSP4M3CZluzoNgNCm2k",
      "type": "openai",
      "model": "qwen-max",
      "baseURL": "https://dashscope.aliyuncs.com/compatible-mode/v1",
      "apiKey": "sk-********************************"
    },
    {
      "id": "uXPF7fCW2paRZcVyfjURO",
      "model": "gpt-4o",
      "type": "openai",
      "baseURL": "https://api.openai.com/v1",
      "apiKey": "env@OPENAI_API_KEY"
    }
  ]
}
```

编写好配置文件后，鼠标悬浮到 `选择模型` 选项上，点击出现的 `载入配置` 选项，即可载入配置的模型。

### 通过插件配置模型

在插件左下方，鼠标悬浮到 `选择模型` 选项上，点击出现的 `添加模型` 选项，即出现添加模型弹窗。填写相关信息后提交即可添加一个模型。

## 💬 聊天

### 聊天选项

在配置好模型后即可开始聊天。在输入框输入内容后，按 `Ctrl+Enter / Enter` 或点击发送选项，即可发送聊天内容。

点击输入框上方的 `添加上下文` 选项可以添加 IDE 内文件内容作为上下文。**仅支持添加在代码编辑器中打开过的文件。**

点击已经添加到上下文的文件，即可取消选择该文件。

对于聊天消息中的文件标签（不包含`『选中的内容』`），可以点击标签从而在编辑器中快速打开对应文件。

### 对话管理

可点击插件界面右上角 `对话历史` 选项查看聊天记录文件。

可点击插件界面右上角 `新建对话` 选项新建一个会话。

### 聊天内容

在大模型生成内容的过程中，可点击输入框左上角的 `停止生成` 选项停止接收当前回答。

## ⚙️ 设置

可点击插件界面右上角 `设置` 进入插件设置页面。

- `Light At: Load Last Chat Session` 默认关闭，启用后，每次打开插件时，都会自动加载上次聊天记录。
- `Light At: Continuous Chat` 默认开启，禁用后，每次发送消息后，模型只会接收当前请求内容，失去在同一个对话中的记忆能力。可以减少模型的输入 `tokens` 数量。
- `Light At: Display Info Message` 默认开启，禁用后，新对话将不再显示欢迎消息。
- `Light At: Display Tokens Usage` 默认开启，禁用后，不会显示在线模型的 `tokens` 使用情况。
- `Light At: Max Chat History` 默认 $128$。设置聊天记录保存的最大数量。范围在 $-1~255$，其中 $-1$ 表示无限制。过多的聊天记录可能小幅度减慢插件的启动速度。
- `Light At: Send Request Shortcut` 默认 `Ctrl+Enter`。设置发送请求的快捷键。在此情况下可以多行输入。选择 `Enter` 将不能换行，但可以粘贴带有换行的内容。
- `Light At: Code Highlight Theme` 默认 `github`。设置聊天中代码高亮主题。前三个是亮色主题，后三个是暗色主题。切换后要重启插件才能生效。