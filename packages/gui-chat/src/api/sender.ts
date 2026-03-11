import { vscode } from './vscode';

export function initReady(){
    vscode?.postMessage({command: 'init.ready'});
}

export function modelIDUpdate(newID: string){
    vscode?.postMessage({
        command: 'modelID.update',
        modelID: newID
    });
}

export function configUpdate(){
    vscode?.postMessage({command: 'config.update'});
}

export function modelAdd(model: string){
    vscode?.postMessage({
        command: 'model.add',
        model: model
    });
}

export function modelDelete(modelID: string){
    vscode?.postMessage({
        command: 'model.delete',
        modelID: modelID
    });
}

export function requestSend(request: string, context: string){
    vscode?.postMessage({
        command: 'request.send',
        request: request,
        context: context
    });
}

export function dialogDelete(requestID: string){
    vscode?.postMessage({
        command: 'dialog.delete',
        requestID: requestID
    });
}

export function responseStop(){
    vscode?.postMessage({command: 'response.stop'});
}

export function contextGet(){
    vscode?.postMessage({command: 'context.get'});
}

export function contextGoto(path: string){
    vscode?.postMessage({
        command: 'context.goto',
        path: path
    });
}
