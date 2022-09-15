import * as vscode from 'vscode'
import * as path from 'path'
import { invokeCallback } from '../utils/webview'
import {
  getSearchList,
  getSearchConfig,
  addSearch,
  delSearch
} from '../apis/search'
import {
  getDocConfig,
  getDocList,
  addDocToLocal,
  delDocToLocal
} from '../apis/docurls'
import { getTianQiNow, getTianQiSeven, getYiQing163 } from '../apis/weather'
import { THTreeDataProvider } from '../menus/UrlsTreeDataProvider'
import { keyConfig as kc } from './ttenum'
import util from '../utils'
import { showInfo, showWarn, showError } from '../utils/message'

const messageHandler = {
  notFound(cmd: string) {
    showError(`未找到名为 ${cmd} 回调方法!`)
  },
  test(global: any, message: any) {
    const resp = {
      code: 500,
      message: '服务器错误（测试）'
    }
    invokeCallback(global.panel, message, resp)
  },
  info(_g, message) {
    showInfo(message.info, message.options)
  },
  warn(_g, message) {
    showWarn(message.info, message.options)
  },
  error(_g, message) {
    showError(message.info, message.options)
  },
  vsUpdateConfig(global, message) {
    vscode.workspace.getConfiguration().update(message.key, message.value, true)
    invokeCallback(global.panel, message, {
      code: 0,
      message: 'OK',
      data: {
        key: message.key,
        value: message.value
      }
    })
  },
  vsRefreshTree() {
    THTreeDataProvider.refresh()
  },
  vsExecuteCommand(global, message) {
    const command = message.command
    if (!command) return
    vscode.commands.executeCommand(command)
    invokeCallback(global.panel, message, { code: 0, message: 'OK' })
  },
  // 侧栏控制面板
  vsGetWelcomeConfig(global, message) {
    const enabled = vscode.workspace.getConfiguration().get(kc.welcome)
    const path = vscode.workspace.getConfiguration().get(kc.welcomeUrl)
    invokeCallback(global.panel, message, { enabled, path })
  },
  // 天气疫情数据
  async vsGetWeaData(global, message) {
    const now = await getTianQiNow()
    const seven = await getTianQiSeven()
    const yq163 = await getYiQing163()
    const resp = { code: 0, now, seven, yq163 }
    invokeCallback(global.panel, message, resp)
  },

  // 快搜配置部分
  vsGetSearchConfig(global, message) {
    invokeCallback(global.panel, message, getSearchConfig())
  },
  vsGetSearchList(global, message) {
    getSearchList(message).then((resp) => {
      invokeCallback(global.panel, message, resp)
    })
  },
  vsAddSearch(global: any, message: any) {
    addSearch(message.data).then((resp: any) => {
      invokeCallback(global.panel, message, resp)
    })
  },
  vsDelSearch(global: any, message: any) {
    delSearch(message.data).then((resp: any) => {
      invokeCallback(global.panel, message, resp)
    })
  },
  // 文档配置部分
  vsGetDocConfig(global, message) {
    invokeCallback(global.panel, message, getDocConfig())
  },
  vsGetDocList(global: any, message: any) {
    const listPromise = getDocList()
    listPromise.then((resp: any) => {
      invokeCallback(global.panel, message, resp)
    })
  },
  vsAddDoc(global: any, message: any) {
    addDocToLocal(message.data).then((resp: any) => {
      invokeCallback(global.panel, message, resp)
    })
  },
  vsDelDoc(global: any, message: any) {
    delDocToLocal(message.data).then((resp: any) => {
      invokeCallback(global.panel, message, resp)
    })
  },
  // 打开操作
  checkEnabled(message) {
    const t = message.entry
    let enabled: string | undefined = ''
    let paths: string | undefined = ''
    let fileName: string | undefined = ''
    let enabledText = ''
    let pathText = ''
    let fileText = ''
    if (t === 'doclist') {
      enabled = vscode.workspace.getConfiguration().get(kc.urlsEnabled)
      paths = vscode.workspace.getConfiguration().get(kc.urlsPath)
      fileName = vscode.workspace.getConfiguration().get(kc.urlsFile)
      enabledText = kc.urlsEnabled
      pathText = kc.urlsPath
      fileText = kc.urlsFile
    } else if (t === 'search') {
      enabled = vscode.workspace.getConfiguration().get(kc.searchEnabled)
      paths = vscode.workspace.getConfiguration().get(kc.searchPath)
      fileName = vscode.workspace.getConfiguration().get(kc.searchFile)
      enabledText = kc.searchEnabled
      pathText = kc.searchPath
      fileText = kc.searchFile
    }
    return {
      t,
      enabled,
      paths,
      fileName,
      enabledText,
      pathText,
      fileText
    }
  },
  openFileInFinder(global: any, message: any) {
    const { enabled, paths, enabledText, pathText } = this.checkEnabled(message)
    if (!enabled) {
      invokeCallback(global.panel, message, {
        code: 500,
        message: `请先启用配置 ${enabledText}: true`
      })
      return
    }
    if (!paths) {
      invokeCallback(global.panel, message, {
        code: 500,
        message: `本地文档列表配置文件路径 ${pathText} 不能为空`
      })
      return
    }
    try {
      if (message.file) {
        util.openFileInFinder(path.join(paths || '', message.file))
      } else {
        util.openFileInFinder(paths)
      }
      invokeCallback(global.panel, message, {
        code: 200,
        message: `打开成功：${paths}`
      })
    } catch (error: any) {
      invokeCallback(global.panel, message, {
        code: 500,
        message: error.message
      })
    }
  },
  openFileInVscode(global: any, message: any) {
    const { enabled, paths, fileName, enabledText, pathText, fileText } =
      this.checkEnabled(message)
    if (!enabled) {
      invokeCallback(global.panel, message, {
        code: 500,
        message: `请先启用配置 ${enabledText}: true`
      })
      return
    }
    if (!paths || !fileName) {
      invokeCallback(global.panel, message, {
        code: 500,
        message: `配置文件路径 ${pathText} 与名称 ${fileText} 不能为空`
      })
      return
    }
    try {
      util.openFileInVscode(path.join(paths, fileName), message.text)
      invokeCallback(global.panel, message, {
        code: 200,
        message: `打开成功：${fileName}`
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
  }
}

export default messageHandler
