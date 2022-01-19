import * as vscode from 'vscode'

export default function getFilePath(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'tt.getFilePath',
    (uri) => {
      vscode.window.showInformationMessage(`路径：${uri ? uri.path : '空'}`)
    }
  )
  context.subscriptions.push(disposable)
}
