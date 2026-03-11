## 说明

前端和插件通过 vscode 提供的接口进行通信。

在插件端通过 `MessageSender.ts` 中实现的类发送消息给前端，通过 `RequestHandler.ts` 中实现的类接收前端消息。

在前端分别通过 `listener.ts` 和  `sender.ts` 来接收和发送消息。

## 前端

### `init.ready`

前端组件挂载完成后发送，表示可以正常接收数据了

无参数

### `modelID.update`

用户选择了新的模型，向插件端确认

参数：

- `modelID: string` 新选择的模型 ID

### `config.update`

请求插件发送最新的配置信息

无参数

### `model.add`

添加新的模型

参数：

- `model: string` 模型配置

  > 该字符串在 `JSON.parse` 后得到的对象类型为：
  >
  > ```typescript
  > interface ModelConfig {
  >     type: 'openai' | 'ollama';
  >     model: string;
  >     title?: string;
  >     baseURL?: string;
  >     apiKey?: string;
  >     system?: string;
  > }
  > ```

### `model.delete`

删除对应 ID 的模型

参数：

- `modelID: string` 待删除的模型的 ID

### `request.send`

发送用户请求

参数：

- `request: string` 用户请求内容

### `dialog.delete`

删除一条对话（包含用户输入和模型输出）

参数：

- `requestID: string` 对话的请求 ID

- `context: string` 上下文列表

  > 该字符串在 `JSON.parse` 后得到的对象类型为字符串列表，其中 `[selected]` 特指选中的内容。

### `response.stop`

让大模型停止当前回答的生成

无参数

### `context.get`

获取上下文列表

无参数

### `context.goto`

跳转到对应的上下文文件

- `path` 对应的路径

## 插件端

### `language.set`

设置语言

参数：

- `lang: string` 需要设置的语言

### `settings.update`

插件刚启动是或者对应设置更新时发送。其中 `codeTheme` 只会在插件启动时发送。

参数：

- `settings: string` 设置信息的字符串

  > 该字符串在 `JSON.parse` 后得到的对象类型为：
  >
  > ```typescript
  > interface {
  >     welcomeInfo: boolean;
  >     sendShortcut: 'Ctrl+Enter' | 'Enter';
  >     codeTheme?: string;
  > }
  > ```

### `models.update`

发送最新模型列表和当前选择的模型的 ID

参数：

- `models: string` 模型配置的字符串

  > 该字符串在 `JSON.parse` 后得到的对象类型为：
  >
  > ```typescript
  > interface Model {
  >     id: string;
  >     type: 'openai' | 'ollama';
  >     name: string;
  > }
  > ```

- `modelID: string` 选择的模型的 ID

### `modelID.updated`

插件端确认了新选择的模型，通知前端修改

参数：

- `modelID: string` 新选择的模型 ID

### `request.load`

发送用户请求内容给前端，让前端在聊天记录中加载该内容。

参数：

- `requestID: string` 请求 ID，也是本轮对话 ID

- `content: string` 用户请求内容

- `context: string` 上下文列表

  > 该字符串在 `JSON.parse` 后得到的对象类型为字符串列表，其中 `[selected]` 特指选中的内容。

### `response.new`

大模型开始应答用户请求，让前端在聊天记录中新增回答条目。

参数：

- `requestID` 对应的请求 ID
- `type: string` 模型的类型
- `name: string` 模型的展示名称

### `response.stream`

大模型流式回答，发送增量内容给前端。

参数：

- `data: string` 新增的回答内容
- `requestID` 对应的请求 ID

### `response.end`

大模型对本次请求回答完毕。

参数：

- `requestID: string` 对应的请求 ID
- `prompt_tokens?: number` 用户输入消耗的 tokens
- `completion_tokens?: number` 模型回复消耗的 tokens

### `response.load`

加载聊天记录，无需实时更新

参数：

- `requestID` 对应的请求 ID
- `type: string` 模型的类型
- `name: string` 模型的展示名称
- `content: string` 全部内容

### `chat.new`

新建聊天，通知前端清空当前聊天内容。

无参数

### `dialog.deleted`

插件删除的对应聊天记录，前端进行更新

参数：

- `requestID: string` 对话的请求 ID

### `context.send`

发送上下文列表

参数：

- `context: string` 上下文列表

  > 该字符串在 `JSON.parse` 后得到的对象类型为字符串列表，其中 `[selected]` 特指选中的内容。
