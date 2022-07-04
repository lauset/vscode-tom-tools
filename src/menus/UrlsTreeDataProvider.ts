import * as os from 'os'
import * as path from 'path'
import * as vscode from 'vscode'
import { Category, ProblemState } from '../tomjs/ttenum'
import { urlsNodeManager } from './UrlsNodeManager'
import type { TomHubNode } from './TomHubNode'

export class UrlsTreeDataProvider
implements vscode.TreeDataProvider<TomHubNode>
{
  private context!: vscode.ExtensionContext

  private onDidChangeTreeDataEvent: vscode.EventEmitter<
    TomHubNode | undefined | null
  > = new vscode.EventEmitter<TomHubNode | undefined | null>()

  public readonly onDidChangeTreeData: vscode.Event<any> =
    this.onDidChangeTreeDataEvent.event

  public initialize(context: vscode.ExtensionContext): void {
    this.context = context
  }

  public async refresh(): Promise<void> {
    await urlsNodeManager.refreshCache()
    this.onDidChangeTreeDataEvent.fire(null)
  }

  public getTreeItem(
    element: TomHubNode
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    const contextValue = element.id.toLowerCase()
    let cmd: vscode.Command | undefined
    let label: string
    if (element.isUrl) {
      if (element.IsCmd) {
        cmd = element.handleCommand
        label = element.name
      } else {
        cmd = element.previewCommand
        label = `[${element.id}] ${element.name}`
      }
    } else {
      cmd = undefined
      label = element.name
    }
    return {
      label,
      tooltip: this.getSubCategoryTooltip(element),
      collapsibleState: element.isUrl
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Collapsed,
      iconPath: this.parseIconPathFromState(element),
      command: cmd,
      resourceUri: element.uri,
      contextValue
    }
  }

  public getChildren(
    element?: TomHubNode | undefined
  ): vscode.ProviderResult<TomHubNode[]> {
    // if (true) {
    //   return [
    //     new TomHubNode(Object.assign({}, defaultProblem, {
    //       id: 'notSignIn',
    //       name: 'Nothing 😄'
    //     }), false)
    //   ]
    // }
    if (!element) {
      // Root view
      return urlsNodeManager.getRootNodes()
    } else {
      switch (element.id) {
        // First-level
        case Category.All:
          return urlsNodeManager.getAllNodes()
        case Category.Doc:
          return urlsNodeManager.getAllDocNodes()
        case Category.Tags:
          return urlsNodeManager.getAllTagsNodes()
        case Category.Tools:
          return urlsNodeManager.getAllToolsNodes()
        case Category.Video:
          return urlsNodeManager.getAllVideoNodes()
        case Category.Pic:
          return urlsNodeManager.getAllPicNodes()
        case Category.Cmd:
          return urlsNodeManager.getAllCmdNodes()
        default:
          if (element.isUrl) {
            return []
          }
          return urlsNodeManager.getChildrenNodesById(element.id)
      }
    }
  }

  private parseIconPathFromState(element: TomHubNode): string {
    if (!element.isUrl) {
      return ''
    }
    switch (element.state) {
      case ProblemState.AC:
        return this.context.asAbsolutePath(
          path.join('resources/menus', 'blank.png')
        )
      case ProblemState.NotAC:
        return this.context.asAbsolutePath(
          path.join('resources/menus', 'tt-cmd-gray.png')
        )
      case ProblemState.Unknown:
        return this.context.asAbsolutePath(
          path.join('resources/menus', 'tt-url.png')
        )
      default:
        return ''
    }
  }

  private getSubCategoryTooltip(element: TomHubNode): string {
    if (element.id === 'ROOT' || element.id in Category) {
      return ''
    }
    if (element.isUrl) {
      return [`Title: ${element.name}`].join(os.EOL)
    }

    const childernNodes: TomHubNode[] = urlsNodeManager.getChildrenNodesById(
      element.id
    )

    let ac = 0
    let notAc = 0
    for (const node of childernNodes) {
      switch (node.state) {
        case ProblemState.AC:
          ac++
          break
        case ProblemState.NotAC:
          notAc++
          break
        default:
          break
      }
    }
    console.log(`ac num: ${ac}, not ac num ${notAc}`)
    return [`Title: ${element.name}`, `Total: ${childernNodes.length}`].join(
      os.EOL
    )
  }
}

export const THTreeDataProvider: UrlsTreeDataProvider =
  new UrlsTreeDataProvider()
