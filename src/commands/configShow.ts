import * as vscode from 'vscode'
import { SelectList } from '../select/SelectList'

export default function selectInit(context: vscode.ExtensionContext) {
  SelectList.startBackground()
  const disposable = vscode.commands.registerCommand('tt.configShow', () => {
    SelectList.createItemLIst()
  })
  context.subscriptions.push(disposable)
}
