import * as vscode from 'vscode'
import * as path from 'path'
import {
  keyConfig,
  keyCommands,
  tomhub,
  configExplorer
} from '../common/ttenum'
import { SelectList } from '../select/SelectList'
import { showInfo } from '../utils/message'
import utils from '../utils'

const cmdSo = (textEditor) => {
  const text = textEditor.document.getText(textEditor.selection)
  let url = vscode.workspace.getConfiguration().get<string>(keyConfig.searchUrl)
  if (!url) url = 'https://www.baidu.com/s?wd=%s'
  const rurl = url.replace('%s', text)
  utils.openUrlInBrowser(rurl)
}

const cmdMenuShow = () => {
  showInfo('Tom Tools已经启用了!')
}

const cmdGetFilePath = async (uri) => {
  const msg = `Path: ${uri ? uri.fsPath : 'None'}`
  const selection = await vscode.window.showInformationMessage(
    msg,
    'Open In OS',
    'Close'
  )
  if (selection !== undefined) {
    if (selection === 'Open In OS') {
      utils.openFileInFinder(uri.fsPath)
    }
  }
}

export function initCmds(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(keyCommands.so, (textEditor) =>
      cmdSo(textEditor)
    ),
    vscode.commands.registerCommand(keyCommands.show, () => cmdMenuShow()),
    vscode.commands.registerCommand(keyCommands.filePath, (uri) =>
      cmdGetFilePath(uri)
    ),
    vscode.commands.registerCommand(keyCommands.menu, () =>
      SelectList.initList()
    )
  )
}

export function initPath(time: number) {
  console.log(`启动时间：${new Date()} ${time}`)
  const tt: any = vscode.extensions.getExtension(tomhub)
  const uPath = vscode.workspace.getConfiguration().get(keyConfig.urlsPath)
  const sPath = vscode.workspace.getConfiguration().get(keyConfig.searchPath)
  const dir = path.join(tt.extensionPath, configExplorer)
  console.log(`本地配置文件路径：${dir}`)
  if (!uPath) {
    vscode.workspace.getConfiguration().update(keyConfig.urlsPath, dir, true)
  }
  if (!sPath) {
    vscode.workspace.getConfiguration().update(keyConfig.searchPath, dir, true)
  }
}
