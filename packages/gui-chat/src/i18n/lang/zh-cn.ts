export default {
    input: {
        selected: "『选中的内容』",
        searchConext: "搜索上下文",
        noContextInfo: "暂无上下文，在编辑器中打开需要的文本文件后再试",
        stopGeneration: "停止生成",
        addContext: "添加上下文",
        textarea: "在此处输入内容...",
        selectModel: "选择模型",
        addModel: "添加模型",
        loadConfig: "加载配置"
    },
    popup: {
        addModel: "添加模型",
        deleteModel: "删除模型",
        openaiNote: "您提供的模型需兼容{a}OpenAI库{_a}的API，大多数主流模型提供商都支持该接口标准。",
        ollamaNote: "请确保您已在本地安装并正确配置了{a}Ollama{_a}，且需要使用的模型正在运行。",
        openrouterNote: "请从{a}OpenRouter{_a}获取您的 API 密钥。OpenRouter 提供对多个大模型提供商的统一访问。",
        i_model: "模型实际名称，例如 gpt-5.2",
        i_title: "模型显示名称，例如 code-helper",
        i_baseURL: "模型 API 地址，例如 https://api.openai.com/v1",
        i_host: "自定义 Ollama 接口地址，例如 http://localhost:11434",
        i_apiKey: "API 密钥，例如 ",
        i_system: "自定义系统提示词",
        i_params: "自定义模型调用参数，例如 ",
        deleteNote: "你确定要删除该模型吗？",
        yes: "是",
        no: "否",
        submit: "提交",
        cancel: "取消"
    },
    dialog: {
        pluginName: "轻亮",
        thinking: "思考内容",
        copy: "复制",
        delete: "删除",
        prompt_tokens: "输入消耗的 Tokens 数量",
        completion_tokens: "输出消耗的 Tokens 数量",
        welcomeMessage: "{think}\n\n部分模型（比如 DeepSeek）可能会在回答问题之前生成思考过程内容。生成的推思考内容可以点击右上角的“思考内容”选项查看或隐藏。\n\n{_think}\n\n欢迎使用 Light At（轻亮），一个面向 VS Code 的智能助手插件。作为一个个人开发的 IDE 智能助手，Light At 旨在为您提供简洁、个性化的开发辅助体验。\n\n- 自由配置模型\n- 聊天记录管理\n- 数学公式渲染\n- 聊天上下文选择\n\n---\n\n更多信息请参考[用户手册]({manual})或访问[GitHub页面]({github})。\n"
    }
}
