import type * as vscode from 'vscode'

/**
 * 选项类
 */
export class Option implements vscode.QuickPickItem {
  label: string
  description: string
  type: number
  path?: string | undefined

  constructor(
    label: string,
    description: string,
    type: number,
    path?: string | undefined
  ) {
    this.label = label
    this.description = description
    this.type = type
    this.path = path
  }
}
