import * as vscode from 'vscode'
import { urlsNodeManager } from '../menus/UrlsNodeManager'
import { THTreeDataProvider } from '../menus/UrlsTreeDataProvider'
import { THDecorationProvider } from '../menus/UrlsDecorationProvider'
import { ConfViewProvider, WeaViewProvider } from '../menus/ConfViewProvider'
import { urlIframe } from '../common/ttiframe'
import { KeyViews as kv, keyCommands as kc } from '../common/ttenum'

export function getLeftTree(context: vscode.ExtensionContext) {
  THTreeDataProvider.refresh()
  THTreeDataProvider.initialize(context)
  context.subscriptions.push(
    urlsNodeManager,
    vscode.window.registerFileDecorationProvider(THDecorationProvider),
    vscode.window.createTreeView(kv.url, {
      treeDataProvider: THTreeDataProvider,
      showCollapseAll: true
    }),
    vscode.commands.registerCommand(kc.preview, (node) => {
      vscode.window.showInformationMessage(`Open ${node.name} (${node.url})`)
      // vscode.ViewColumn.Active: 表示当前选中的面板
      const webView = urlIframe(context, vscode.ViewColumn.Active, node)
      context.subscriptions.push(webView)
    })
  )
}

export function getConfView(context: vscode.ExtensionContext) {
  const provider = new ConfViewProvider(context.extensionUri)
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(kv.conf, provider)
  )
}

export function getWeaView(context: vscode.ExtensionContext) {
  const provider = new WeaViewProvider(context.extensionUri)
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(kv.wea, provider)
  )
}
