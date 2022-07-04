import * as vscode from 'vscode'
import * as path from 'path'
import { keyConfig, keyCommands } from '../tomjs/ttenum'
import { SelectList } from '../select/SelectList'

const cmdHelloWorld = () => {
  vscode.window.showInformationMessage('你好鸭!')
}

const cmdMenuShow = () => {
  vscode.window.showInformationMessage('你点我干啥，我长得很帅吗？')
}

const cmdGetFilePath = (uri) => {
  vscode.window.showInformationMessage(`路径：${uri ? uri.path : '空'}`)
}

export function initCmds(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(keyCommands.hello, () => cmdHelloWorld),
    vscode.commands.registerCommand(keyCommands.menuShow, () => cmdMenuShow),
    vscode.commands.registerCommand(keyCommands.filePath, () => cmdGetFilePath),
    vscode.commands.registerCommand(keyCommands.config, () => {
      SelectList.initList()
    }),
  )
}

export function setDefaultPath(time: number) {
  console.log(`启动时间：${time}`)
  const tt: any = vscode.extensions.getExtension('lauset.tomhub-tools')
  const pathDir = path.join(tt.extensionPath, 'data')
  console.log(pathDir)
  console.log(`文档配置：${pathDir}`)
  vscode.workspace.getConfiguration().update(keyConfig.urlsPath, pathDir, true)
}
