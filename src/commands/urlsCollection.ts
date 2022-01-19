import * as vscode from 'vscode'
import { urlsNodeManager } from '../menus/UrlsNodeManager'
import { THTreeDataProvider } from '../menus/UrlsTreeDataProvider'
import { THDecorationProvider } from '../menus/UrlsDecorationProvider'
import { urlIframe } from '../tomjs/ttiframe'

export function getTree(context: vscode.ExtensionContext) {
  THTreeDataProvider.refresh()
  THTreeDataProvider.initialize(context)
  context.subscriptions.push(
    urlsNodeManager,
    vscode.window.registerFileDecorationProvider(THDecorationProvider),
    vscode.window.createTreeView('tomHubExplorer', {
      treeDataProvider: THTreeDataProvider,
      showCollapseAll: true
    }),
    vscode.commands.registerCommand('tt.previewUrls', (node) => {
      vscode.window.showInformationMessage(`Open ${node.name} (${node.url})`)
      // vscode.ViewColumn.Active: 表示当前选中的面板
      const webView = urlIframe(context, vscode.ViewColumn.Active, node)
      context.subscriptions.push(webView)
    })
  )
}
