export default {
    input: {
        selected: "[Selected Content]",
        searchConext: "Search Context",
        noContextInfo: "No context available. Please open the required text file in the editor and try again.",
        stopGeneration: "Stop Generation",
        addContext: "Add Context",
        textarea: "Enter content here...",
        selectModel: "Select Model",
        addModel: "Add Model",
        loadConfig: "Load Config"
    },
    popup: {
        addModel: "Add Model",
        deleteModel: "Delete Model",
        openaiNote: "The model you provided needs to be compatible with the {a}OpenAI API{_a}.",
        ollamaNote: "Please confirm that you have installed {a}Ollama{_a} locally and configured the corresponding model.",
        deleteNote: "Are you sure you want to delete this model?",
        hostNote: "Please enter the address of the Ollama service, which can be a URL with a port number or a localhost port number.",
        yes: "Yes",
        no: "No",
        submit: "Submit",
        cancel: "Cancel"
    },
    dialog: {
        pluginName: "Light At",
        reasoning: "reasoning content",
        copy: "copy",
        delete: "delete",
        prompt_tokens: "Number of Tokens consumed by the input",
        completion_tokens: "Number of Tokens consumed by the output",
        welcomeMessage: "{think}\n\nSome models (such as DeepSeek) may generate reasoning content before answering questions. The generated reasoning content can be viewed or hidden by clicking the \"reasoning content\" option in the upper right corner.\n\n{_think}\n\nWelcome to Light At, an intelligent assistant plugin for VS Code. As a personally developed IDE assistant, Light At aims to provide you with a simple and personalized development assistance experience.\n\n- Flexible Model Configuration\n- Chat History Management\n- Mathematical Formula Rendering\n- Chat context selection\n\n---\n\nFor more information, please refer to [User Manual]({manual}) or visit the [GitHub page]({github}).\n"
    }
}