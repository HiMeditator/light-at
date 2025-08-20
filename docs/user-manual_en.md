# Light At User Manual

For plugin version v0.1.1

- [简体中文版](user-manual_zh-cn.md)
- [日本語版](user-manual_ja.md)

![](img/01.png)

## 📝 Configuring Models

### Configuring Models via Configuration File

Click the `Open Config` option in the upper right corner of the plugin interface to navigate to the plugin configuration file, where you can quickly configure chat models.

The configuration format is as follows:

```json
{
  "models": [
    {
      "id": "p_Xb-FcE7SeVgSG6SfdWB",
      "type": "ollama/openai",
      "model": "model name",
      "title": "display name",
      "baseURL": "https://model_base_url",
      "host": "Ollama serve host",
      "apiKey": "sk-********************************"
    }
  ]
}
```
- `id`: Required. A unique identifier for the model. Customize it to ensure it is different from other `id`s.
- `type`: Required. The type of the model, with possible values being `ollama` or `openai`. The former uses a locally configured model from [Ollama](https://github.com/ollama/ollama), while the latter uses the OpenAI library in node.js to call cloud-based models.
- `model`: Required. The name of the model, e.g., `llama3.3-70b-instruct`.
- `title`: Optional. The display name of the model. If not set, it defaults to the value of `model`.
- `baseURL`: Required if `type` is `openai`. The base URL for API requests, which depends on your model provider.
- `host`: Optional. The host address of the Ollama server, or the localhost port number.
- `apiKey`: Required if `type` is `openai`. The API key, obtained from your model provider.

> **Note:** For the `apiKey` field, you can use environment variables. The format is: `env@API_KEY_NAME`, where `API_KEY_NAME` is the name of your actual API key as stored in the environment variables. The environment variable you just set may not take effect immediately. Generally, you need to restart your computer for it to work.

Here are some `baseURL`s for various providers:
- OpenAI: https://api.openai.com/v1
- DeepSeek: https://api.deepseek.com
- Alibaba Cloud: https://dashscope.aliyuncs.com/compatible-mode/v1

Here is a specific example:

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
      "model": "deepseek-r1"
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

After creating the configuration file, hover over the `Select Model` option and click the `Load Config` option that appears to load the configured models.

### Configuring Models via Plugin

In the lower left corner of the plugin, hover over the `Select Model` option and click the `Add Model` option that appears. This will bring up an add model dialog. Fill in the relevant information and submit to add a model.

## 💬 Chatting

### Chat Options

Once the models are configured, you can start chatting. Enter content in the input box and press `Ctrl+Enter / Enter` or click the send option to send the chat content.

Click the `Add Context` option above the input box to add the content of files within the IDE as context. **Only files opened in the code editor are supported.**

Click on a file already added to the context to deselect it.

For file tags in chat messages (excluding `[Selected Content]`), you can click on the tag to quickly open the corresponding file in the editor.

### Chat Management

Click the `Chat History` option in the upper right corner of the plugin interface to view the chat history files.

Click the `New Chat` option in the upper right corner of the plugin interface to start a new conversation.

### Chat Content

While the large model is generating content, you can click the `Stop Generation` option in the upper left corner of the input box to stop receiving the current response.

## ⚙️ Settings

Click the `Open Settings` option in the upper right corner of the plugin interface to access the plugin settings page.

- `Light At: Load Last Chat Session` Default is off. When enabled, the plugin will automatically load the last chat session each time it is opened.
- `Light At: Continuous Chat` Default is on. When disabled, after each message sent, the model will only receive the current request content, losing its memory within the same conversation. This can reduce the number of input `tokens`.
- `Light At: Display Info Message` Default is on. When disabled, new conversations will no longer display a welcome message.
- `Light At: Display Tokens Usage` Default is on. When disabled, the usage of `tokens` by the online model will not be displayed.
- `Light At: Max Chat History` Default is $128$. Sets the maximum number of chat history records to be saved. The range is from $-1$ to $255$, where $-1$ indicates no limit. Excessive chat history may slightly slow down the startup speed of the plugin.
- `Light At: Send Request Shortcut` Default is `Ctrl+Enter`. Sets the shortcut key for sending requests. In this case, multi-line input is allowed. Choosing `Enter` will not allow line breaks, but you can paste content with line breaks.
- `Light At: Code Highlight Theme` Default is `github`. Sets the code highlight theme in the chat. The first three are light themes, and the last three are dark themes. The change will take effect after restarting the plugin.
