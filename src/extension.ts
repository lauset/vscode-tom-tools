// eslint-disable-next-line prettier/prettier
import type * as vscode from 'vscode'
import { helloWorld, setDefaultPath } from './commands/helloWorld'
import getFilePath from './commands/getFilePath'
import menuShow from './commands/menuShow'
import { getTree } from './commands/urlsCollection'
import selectInit from './commands/configShow'
import welcome from './tomjs/welcome'
import weather from './tomjs/weather'

export function activate(context: vscode.ExtensionContext) {
  console.log('祝贺 "TomHub Tools" 插件启动成功!')

  // 注册命令（你好，获取文件路径、展示菜单、欢迎页）
  helloWorld(context)

  // 设置自定义文档配置文件默认路径
  setDefaultPath(new Date().getTime())

  // 右键菜单 [右下角提示：获取当前文件路径]
  getFilePath(context)

  // 右键菜单 [右下角提示：消息内容]
  menuShow(context)

  // 自定义欢迎界面
  welcome(context)

  // 天气监测页面
  weather(context)

  // 侧栏树形菜单
  getTree(context)

  // 下拉配置菜单
  selectInit(context)
}

export function deactivate() {
  console.log('TomHub Tools 插件已禁用!')
}
