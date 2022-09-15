import * as vscode from 'vscode'
import { getWebViewContent } from '../utils/webview'
import { keyCommands as kcs } from '../common/ttenum'
import { showError } from '../utils/message'
import messageHandler from '../common/events'

export default function (context: vscode.ExtensionContext) {
  // 注册命令，可以给命令配置快捷键或者右键菜单
  // 回调函数参数uri：当通过资源管理器右键执行命令时会自动把所选资源URI带过来，当通过编辑器中菜单执行命令时，会将当前打开的文档URI传过来
  context.subscriptions.push(
    vscode.commands.registerCommand(kcs.doclist, function (_uri) {
      // 工程目录一定要提前获取，因为创建了webview之后activeTextEditor会不准确
      // const projectPath = util.getProjectPath(uri)
      // if (!projectPath) return
      const panel = vscode.window.createWebviewPanel(
        'tomtools.doclistView', // viewType
        '文档配置', // 视图标题
        vscode.ViewColumn.One, // 显示在编辑器的哪个部位
        {
          enableScripts: true, // 启用JS，默认禁用
          retainContextWhenHidden: true // webview被隐藏时保持状态，避免被重置
        }
      )
      const global = { panel }
      panel.webview.html = getWebViewContent(context, 'webviews/doclist.html')
      panel.webview.onDidReceiveMessage(
        (message) => {
          if (messageHandler[message.cmd]) {
            messageHandler[message.cmd](global, message)
          } else {
            showError(`未找到名为 ${message.cmd} 回调方法!`)
          }
        },
        undefined,
        context.subscriptions
      )
    })
  )
}
