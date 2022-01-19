import * as vscode from 'vscode'

export default function menuShow(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('tt.menuShow', () => {
    vscode.window.showInformationMessage('你点我干啥，我长得很帅吗？')
  })
  context.subscriptions.push(disposable)
}
