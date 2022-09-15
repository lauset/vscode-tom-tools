import type * as vscode from 'vscode'
import { initCmds, initPath } from './commands/cmds'
import { getLeftTree, getConfView, getWeaView } from './commands/sidebar'
import welcome from './commands/welcome'
import doclist from './commands/doclist'
import search from './commands/search'

export function activate(context: vscode.ExtensionContext) {
  console.log('祝贺 "Tom Tools" 插件启动成功!')

  // 注册命令（你好，获取文件路径、展示菜单、欢迎页）
  initCmds(context)

  // 设置自定义文档与快搜配置文件默认路径
  initPath(new Date().getTime())

  // 自定义欢迎界面
  welcome(context)

  // 文档配置页面
  doclist(context)

  // 快搜配置页面
  search(context)

  // 侧边栏树形菜单与视图
  getLeftTree(context)
  getConfView(context)
  getWeaView(context)
}

export function deactivate() {
  console.log('Tom Tools 插件已禁用!')
}
