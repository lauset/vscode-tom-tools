import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import util from './index'

/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
const getWebViewContent = (
  context: vscode.ExtensionContext,
  templatePath: string
) => {
  const resourcePath = util.getExtensionFileAbsolutePath(context, templatePath)
  const dirPath = path.dirname(resourcePath)
  let html = fs.readFileSync(resourcePath, 'utf-8')
  // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
  html = html.replace(
    /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
    (m, $1, $2) =>
      `${
        $1 +
        vscode.Uri.file(path.resolve(dirPath, $2))
          .with({ scheme: 'vscode-resource' })
          .toString()
      }"`
  )
  return html
}

/**
 * 执行回调函数
 * @param {*} panel
 * @param {*} message
 * @param {*} resp
 */
const invokeCallback = (panel: any, message: any, resp: any) => {
  // console.log('回调消息：', resp)
  // 错误码在400-600之间的，默认弹出错误提示
  if (
    typeof resp == 'object' &&
    resp.code &&
    resp.code >= 400 &&
    resp.code < 600
  ) {
    util.showError(resp.message || '发生未知错误！')
  }
  panel.webview.postMessage({
    cmd: 'vscodeTTCallback',
    cbid: message.cbid,
    data: resp
  })
}

export { getWebViewContent, invokeCallback }
