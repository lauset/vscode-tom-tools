import * as vscode from 'vscode'
import { getWebViewContent } from '../utils/webview'
import messageHandler from '../common/events'
import { keyCommands as kcs } from '../common/ttenum'

export default function (context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(kcs.search, function (_uri) {
      const panel = vscode.window.createWebviewPanel(
        'tomtools.searchView', // 视图类型
        '快搜配置', // 视图标题
        vscode.ViewColumn.One, // 显示在编辑器的哪个部位
        {
          enableScripts: true, // 启用JS，默认禁用
          retainContextWhenHidden: true // webview被隐藏时保持状态，避免被重置
        }
      )
      const global = { panel }
      panel.webview.html = getWebViewContent(context, 'webviews/search.html')
      panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.type) {
            case 'vscodeTTCall': {
              if (messageHandler[message.cmd])
                messageHandler[message.cmd](global, message)
              else messageHandler['notFoundCmd'](message.cmd)
              break
            }
          }
        },
        undefined,
        context.subscriptions
      )
    })
  )
}
