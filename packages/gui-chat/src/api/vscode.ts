declare const acquireVsCodeApi: () => {
    postMessage: (message: any) => undefined;
};

export const vscode = (typeof acquireVsCodeApi === 'function') ? acquireVsCodeApi() : undefined;
