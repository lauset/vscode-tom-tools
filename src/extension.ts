import type * as vscode from 'vscode'
import { initCmds, setDefaultPath } from './commands/cmds'
import { getTree } from './commands/urlsCollection'
import welcome from './tomjs/welcome'
import weather from './tomjs/weather'

export function activate(context: vscode.ExtensionContext) {
  console.log('祝贺 "TomHub Tools" 插件启动成功!')

  // 注册命令（你好，获取文件路径、展示菜单、欢迎页）
  initCmds(context)

  // 设置自定义文档配置文件默认路径
  setDefaultPath(new Date().getTime())

  // 自定义欢迎界面
  welcome(context)

  // 天气监测页面
  weather(context)

  // 侧栏树形菜单
  getTree(context)
}

export function deactivate() {
  console.log('TomHub Tools 插件已禁用!')
}
