import * as vscode from 'vscode'
import { keyConfig } from '../tomjs/ttenum'

export function helloWorld(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('tt.hello', () => {
    vscode.window.showInformationMessage('你好鸭!')
  })
  context.subscriptions.push(disposable)
}

export function setDefaultPath(time: number) {
  console.log(`启动时间：${time}`)
  const tt: any = vscode.extensions.getExtension('lauset.tomhub-tools')
  const path = `${tt.extensionPath}\\data`
  console.log(`文档配置：${path}`)
  vscode.workspace.getConfiguration().update(keyConfig.urlsPath, path, true)
}
