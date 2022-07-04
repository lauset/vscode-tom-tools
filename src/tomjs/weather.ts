import * as vscode from 'vscode'
import * as path from 'path'
import util from '../utils'
import { getWebViewContent, invokeCallback } from '../utils/webview'
import { getList, addDataToLocal, delDataToLocal } from '../menus/TomHubList'
import { THTreeDataProvider } from '../menus/UrlsTreeDataProvider'
import { keyConfig as kc, keyCommands as kcs } from './ttenum'

/**
 * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
 */
const messageHandler: any = {
  getMenuList(global: any, message: any) {
    const listPromise = getList()
    listPromise.then((resp: any) => {
      invokeCallback(global.panel, message, resp)
    })
  },
  addUrlsData(global: any, message: any) {
    addDataToLocal(message.data).then((resp: any) => {
      invokeCallback(global.panel, message, resp)
    })
  },
  delUrlsData(global: any, message: any) {
    delDataToLocal(message.data).then((resp: any) => {
      invokeCallback(global.panel, message, resp)
    })
  },
  // 获取文档列表配置文件的有关配置信息
  getUrlsConfig(global: any, message: any) {
    const urlsEnabled = vscode.workspace.getConfiguration().get(kc.urlsEnabled)
    const urlsPath = vscode.workspace.getConfiguration().get(kc.urlsPath)
    const urlsFile = vscode.workspace.getConfiguration().get(kc.urlsFile)
    invokeCallback(global.panel, message, {
      urlsEnabled,
      urlsPath,
      urlsFile
    })
  },
  // 弹出提示
  alert(_global: any, message: any) {
    util.showInfo(message.info)
  },
  // 显示错误提示
  error(_global: any, message: any) {
    util.showError(message.info)
  },
  // 获取工程名
  getProjectName(global: any, message: any) {
    invokeCallback(
      global.panel,
      message,
      util.getProjectName(global.projectPath)
    )
  },
  openFileInFinder(global: any, message: any) {
    const urlsEnabled = vscode.workspace.getConfiguration().get(kc.urlsEnabled)
    const urlsPath: string | undefined = vscode.workspace
      .getConfiguration()
      .get(kc.urlsPath)
    if (!urlsEnabled) {
      invokeCallback(global.panel, message, {
        code: 500,
        message: '请先启用配置 tomtools.urls.enabled: true'
      })
      return
    }
    if (!urlsPath) {
      invokeCallback(global.panel, message, {
        code: 500,
        message: '本地文档列表配置文件路径 tomtools.urls.path 不能为空'
      })
      return
    }
    try {
      if (message.file) {
        util.openFileInFinder(path.join(urlsPath, message.file))
      } else {
        util.openFileInFinder(urlsPath)
      }
      invokeCallback(global.panel, message, {
        code: 200,
        message: `打开成功：${urlsPath}`
      })
    } catch (error: any) {
      invokeCallback(global.panel, message, {
        code: 500,
        message: error.message
      })
    }
  },
  // 打开配置中定义的文件
  openFileInVscode(global: any, message: any) {
    const urlsEnabled = vscode.workspace.getConfiguration().get(kc.urlsEnabled)
    const urlsPath: string | undefined = vscode.workspace
      .getConfiguration()
      .get(kc.urlsPath)
    const urlsFile: string | undefined = vscode.workspace
      .getConfiguration()
      .get(kc.urlsFile)
    if (!urlsEnabled) {
      invokeCallback(global.panel, message, {
        code: 500,
        message: '请先启用配置 tomtools.urls.enabled: true'
      })
      return
    }
    if (!urlsPath || !urlsFile) {
      invokeCallback(global.panel, message, {
        code: 500,
        message:
          '配置文件路径 tomtools.urls.path 与名称 tomtools.urls.file 不能为空'
      })
      return
    }
    try {
      util.openFileInVscode(path.join(urlsPath, urlsFile), message.text)
      invokeCallback(global.panel, message, {
        code: 200,
        message: `打开成功：${urlsFile}`
      })
    } catch (error: any) {
      invokeCallback(global.panel, message, {
        code: 500,
        message: error.message
      })
    }
  },
  openUrlInBrowser(global: any, message: any) {
    const url = message.url
    if (!url) return
    util.openUrlInBrowser(url)
    invokeCallback(global.panel, message, { code: 0, text: '成功' })
  },
  // 刷新左侧工具栏
  refreshTree() {
    THTreeDataProvider.refresh()
  }
}

export default function (context: vscode.ExtensionContext) {
  // 注册命令，可以给命令配置快捷键或者右键菜单
  // 回调函数参数uri：当通过资源管理器右键执行命令时会自动把所选资源URI带过来，当通过编辑器中菜单执行命令时，会将当前打开的文档URI传过来
  context.subscriptions.push(
    vscode.commands.registerCommand(kcs.doclist, function (uri) {
      // 工程目录一定要提前获取，因为创建了webview之后activeTextEditor会不准确
      const projectPath = util.getProjectPath(uri)
      if (!projectPath) return
      const panel = vscode.window.createWebviewPanel(
        'ttWeather', // viewType
        '文档列表', // 视图标题
        vscode.ViewColumn.One, // 显示在编辑器的哪个部位
        {
          enableScripts: true, // 启用JS，默认禁用
          retainContextWhenHidden: true // webview被隐藏时保持状态，避免被重置
        }
      )
      const global = { projectPath, panel }
      panel.webview.html = getWebViewContent(
        context,
        'src/views/tt-weather.html'
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
}
