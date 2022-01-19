import * as vscode from 'vscode'
import util from '../utils'
import { httpFetch } from '../utils/request'
import { getWebViewContent, invokeCallback } from '../utils/webview'

/**
 * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
 */
const messageHandler: any = {
  getConfig(global: any, message: any) {
    const result = vscode.workspace.getConfiguration().get(message.key)
    invokeCallback(global.panel, message, result)
  },
  setConfig(global: any, message: any) {
    // 写入配置文件，注意，默认写入工作区配置，而不是用户配置，最后一个true表示写入全局用户配置
    vscode.workspace.getConfiguration().update(message.key, message.value, true)
    // util.showInfo('修改成功！')
  },
  // 天气API 七日
  getTianQiSeven(global: any, message: any) {
    // https://www.tianqiapi.com/api?version=v1
    // &appid=21375891&appsecret=fTYv7v5E

    // https://www.tianqiapi.com/free/week?unescape=1
    // &appid=75437651&appsecret=Pf48jMz8

    let result = {}
    const searchRequest = httpFetch(
      'https://www.tianqiapi.com/free/week?unescape=1' +
        '&appid=75437651&appsecret=Pf48jMz8&unescape=1',
      { method: 'get' }
    )
    searchRequest.promise.then((resp: any) => {
      if (resp.statusCode === 200) {
        result = resp.body
        invokeCallback(global.panel, message, result)
      }
    })
  },
  // 天气API 实况
  getTianQiNow(global: any, message: any) {
    // https://www.tianqiapi.com/free/day?
    // appid=75437651&appsecret=Pf48jMz8&unescape=1
    let result = {}
    const searchRequest = httpFetch(
      'https://www.tianqiapi.com/free/day?' +
        'appid=75437651&appsecret=Pf48jMz8&unescape=1',
      { method: 'get' }
    )
    searchRequest.promise.then((resp: any) => {
      if (resp.statusCode === 200) {
        result = resp.body
        invokeCallback(global.panel, message, result)
      }
    })
  },
  // 查询网易疫情统计接口
  getYiQing163(global: any, message: any) {
    let result = {}
    const searchRequest = httpFetch(
      'https://c.m.163.com/ug/api/wuhan/app/data/list-total',
      {
        method: 'get',
        headers: {
          // 'User-Agent':
          //   'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
          //   '(KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
          origin: 'https://wp.m.163.com'
        }
      }
    )
    searchRequest.promise.then((resp: any) => {
      if (resp.body.code === 10000) {
        result = resp.body.data
        // util.showInfo('疫情163信息查询成功！')
        invokeCallback(global.panel, message, result)
      }
      // return body && body.code === 200
      //   ? musicDetailApi.getList(body.result.songs.map(s => s.id))
      //   .then(({ list }) => {
      //     this.total = body.result.songCount || 0
      //     this.page = page
      //     this.allPage = Math.ceil(this.total / limit)
      //     return {
      //       code: 200,
      //       data: {
      //         list,
      //         allPage: this.allPage,
      //         limit,
      //         total: this.total,
      //         source: 'wy',
      //       },
      //     }
      //   })
      //   : body
    })
  }
}

export default function (context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('tt.welcome', function (uri) {
      const panel = vscode.window.createWebviewPanel(
        'ttWelcome', // viewType
        'TomHub欢迎页', // 视图标题
        vscode.ViewColumn.One, // 显示在编辑器的哪个部位
        {
          enableScripts: true // 启用JS，默认禁用
        }
      )
      const global = { panel }
      panel.webview.html = getWebViewContent(
        context,
        'src/views/tt-welcome/tt-welcome.html'
      )
      panel.webview.onDidReceiveMessage(
        (message) => {
          if (messageHandler[message.cmd]) {
            messageHandler[message.cmd](global, message)
          } else {
            util.showError(`未找到名为 ${message.cmd} 回调方法!`)
          }
        },
        undefined,
        context.subscriptions
      )
    })
  )

  const key = 'tomtools.welcome'
  // 如果设置里面开启了欢迎页显示，启动欢迎页
  if (vscode.workspace.getConfiguration().get(key)) {
    vscode.commands.executeCommand('tt.welcome')
  }
}
