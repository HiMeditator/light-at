export default {
    input: {
        selected: "「選択された内容」",
        searchConext: "コンテキストを検索",
        noContextInfo: "コンテキストがありません。必要なテキストファイルをエディタで開いてからお試しください。",
        stopGeneration: "生成を停止",
        addContext: "コンテキストを追加",
        textarea: "ここに入力内容を入力してください...",
        selectModel: "モデルを選択",
        addModel: "モデルを追加",
        loadConfig: "コンフィグを読み込む"
    },
    popup: {
        addModel: "モデルを追加",
        deleteModel: "モデルを削除",
        openaiNote: "提供するモデルは{a}OpenAIライブラリ{_a}のAPIと互換性がある必要があります。主要なモデルプロバイダーの多くがこのインターフェース標準をサポートしています。",
        ollamaNote: "{a}Ollama{_a}がローカルにインストールされ、正しく設定されていることを確認し、必要なモデルが実行されていることをご確認ください。",
        openrouterNote: "{a}OpenRouter{_a}からAPIキーを取得してください。OpenRouterは複数のLLMプロバイダーへの統一アクセスを提供します。",
        deleteNote: "このモデルを削除してもよろしいですか。",
        hostNote: "Ollama サービスのアドレスを入力してください。ポート番号付きの URL、または localhost のポート番号を指定できます。",
        yes: "はい",
        no: "いいえ",
        submit: "送信",
        cancel: "キャンセル"
    },
    dialog: {
        pluginName: "ライトアット",
        thinking: "思考内容",
        copy: "コピー",
        delete: "削除する",
        prompt_tokens: "入力で消費されたトークン数",
        completion_tokens: "出力で消費されたトークン数",
        welcomeMessage: "{think}\n一部のモデル（DeepSeek など）は、質問に答える前に思考プロセスの内容を生成する場合があります。生成された思考内容は、右上の「思考内容」オプションをクリックして表示または非表示にすることができます。\n{_think}\n\nLight At（ライトアット）へようこそ。VS Code 向けのスマートアシスタントプラグインです。個人開発によるIDEアシスタントとして、Light At はシンプルでパーソナライズされた開発支援体験を提供することを目指しています。\n\n- モデルの自由な設定\n- チャット履歴管理\n- 数式レンダリング\n- チャットコンテキスト選択\n\n---\n\n詳細については、[ユーザーマニュアル]({manual}) を参照するか、[GitHub ページ]({github}) を訪問してください。\n"
    }
}
