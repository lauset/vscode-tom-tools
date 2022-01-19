import * as _ from 'lodash'
import type { Disposable } from 'vscode'
import * as list from './TomHubList'
import {
  Category,
  defaultProblem,
  ProblemState,
  SortingStrategy } from '../tomjs/ttenum'
import { TomHubNode } from './TomHubNode'

class UrlsNodeManager implements Disposable {
  // eslint-disable-next-line prettier/prettier
  private urlNodeMap: Map<string, TomHubNode> =
    new Map<string, TomHubNode>()
  private tagSet: Set<string> = new Set<string>()

  // 刷新设置数据
  public async refreshCache(): Promise<void> {
    this.dispose()
    for (const problem of await list.getList()) {
      // 可以判断数据项是否启用，然后获取所有数据
      //   if (shouldHideSolved && problem.state === ProblemState.AC) {
      //     continue
      //   }
      this.urlNodeMap.set(problem.id, new TomHubNode(problem))
      // 存放所有标签
      for (const tag of problem.tags) {
        this.tagSet.add(tag)
      }
    }
  }

  // 获取所有根目录节点，也就是获取所有一级文件目录
  public getRootNodes(): TomHubNode[] {
    return [
      new TomHubNode(Object.assign({}, defaultProblem, {
        id: Category.All,
        name: Category.All
      }), false),
      new TomHubNode(Object.assign({}, defaultProblem, {
        id: Category.Doc,
        name: Category.Doc
      }), false),
      new TomHubNode(Object.assign({}, defaultProblem, {
        id: Category.Tools,
        name: Category.Tools
      }), false),
      new TomHubNode(Object.assign({}, defaultProblem, {
        id: Category.Video,
        name: Category.Video
      }), false),
      new TomHubNode(Object.assign({}, defaultProblem, {
        id: Category.Tags,
        name: Category.Tags
      }), false),
      new TomHubNode(Object.assign({}, defaultProblem, {
        id: Category.Pic,
        name: Category.Pic
      }), false),
      new TomHubNode(Object.assign({}, defaultProblem, {
        id: Category.Cmd,
        name: Category.Cmd
      }), false)
      // 开始新增固定命令行菜单
      // new TomHubNode(Object.assign({}, defaultProblem, {
      //   id: '101',
      //   isCmd: true,
      //   isUrl: true,
      //   state: 2,
      //   type: '命令',
      //   name: '打开欢迎页',
      //   url: 'tt.welcome'
      // }), false)
    ]
  }

  // 获取 [All: 所有] 一级文件目录内的数据项
  public getAllNodes(): TomHubNode[] {
    return this.applySortingStrategy(
      Array.from(this.urlNodeMap.values()),
    )
    // return Array.from(this.urlNodeMap.values())
  }

  // 获取 [Doc: 文档类] 一级文件目录内的数据项
  public getAllDocNodes(): TomHubNode[] {
    // const res: TomHubNode[] = []
    // res.push(
    //   new TomHubNode(Object.assign({}, defaultProblem, {
    //     id: `${Category.Difficulty}.Easy`,
    //     name: 'Easy'
    //   }), false),
    //   new TomHubNode(Object.assign({}, defaultProblem, {
    //     id: `${Category.Difficulty}.Medium`,
    //     name: 'Medium'
    //   }), false),
    //   new TomHubNode(Object.assign({}, defaultProblem, {
    //     id: `${Category.Difficulty}.Hard`,
    //     name: 'Hard'
    //   }), false),
    // )
    // this.sortSubCategoryNodes(res, Category.Difficulty)
    const list = Array.from(this.urlNodeMap.values())
    return list.filter((m) => m.type == Category.Doc)
  }

  // 获取 [Tools: 工具类] 一级文件目录内的数据项
  public getAllToolsNodes(): TomHubNode[] {
    const list = Array.from(this.urlNodeMap.values())
    return list.filter((m) => m.type == Category.Tools)
  }

  // 获取 [Video: 视频类] 一级文件目录内的数据项
  public getAllVideoNodes(): TomHubNode[] {
    const list = Array.from(this.urlNodeMap.values())
    return list.filter((m) => m.type == Category.Video)
  }

  // 获取 [Pic: 素材类] 一级文件目录内的数据项
  public getAllPicNodes(): TomHubNode[] {
    const list = Array.from(this.urlNodeMap.values())
    return list.filter((m) => m.type == Category.Pic)
  }

  // 获取 [CMD: 命令类] 一级文件目录内的数据项
  public getAllCmdNodes(): TomHubNode[] {
    // const list = Array.from(this.urlNodeMap.values())
    // return list.filter((m) => m.type == Category.Cmd)
    // 命令下所有选项都是固定的，用来代替命令输入
    const node1 = new TomHubNode(Object.assign({}, defaultProblem, {
      id: '101',
      isCmd: true,
      isUrl: true,
      state: 2,
      type: '命令',
      name: '查看欢迎页',
      url: 'tt.welcome'
    }), false)
    const node2 = new TomHubNode(Object.assign({}, defaultProblem, {
      id: '102',
      isCmd: true,
      isUrl: true,
      state: 2,
      type: '命令',
      name: '查看文档列表',
      url: 'tt.weather'
    }), false)
    const node3 = new TomHubNode(Object.assign({}, defaultProblem, {
      id: '103',
      isCmd: true,
      isUrl: true,
      state: 2,
      type: '命令',
      name: '文档配置菜单',
      url: 'tt.configShow'
    }), false)
    return [node1, node2, node3]
  }

  // 获取 [Tags: 标签分类] 一级文件目录内的二级目录并排序
  public getAllTagsNodes(): TomHubNode[] {
    const res: TomHubNode[] = []
    for (const tag of this.tagSet.values()) {
      res.push(new TomHubNode(Object.assign({}, defaultProblem, {
        id: `${Category.Tags}.${tag}`,
        name: _.startCase(tag)
      }), false))
    }
    this.sortSubCategoryNodes(res, Category.Tags)
    return res
  }

  public getNodeById(id: string): TomHubNode | undefined {
    return this.urlNodeMap.get(id)
  }

  // 个人最爱类，待制作，先返回空数组
  public getFavoriteNodes(): TomHubNode[] {
    const res: TomHubNode[] = []
    // for (const node of this.urlNodeMap.values()) {
    //   if (node.isFavorite) {
    //     res.push(node)
    //   }
    // }
    return this.applySortingStrategy(res)
  }

  // 获取二级文件目录内的数据项
  public getChildrenNodesById(id: string): TomHubNode[] {
    // The sub-category node's id is named as {Category.SubName}
    const metaInfo: string[] = id.split('.')
    const res: TomHubNode[] = []
    for (const node of this.urlNodeMap.values()) {
      switch (metaInfo[0]) {
      //   case Category.Company:
      //     if (node.companies.indexOf(metaInfo[1]) >= 0) {
      //       res.push(node)
      //     }
      //     break
      //   case Category.Difficulty:
      //     if (node.difficulty === metaInfo[1]) {
      //       res.push(node)
      //     }
      //     break
        case Category.Tags:
          if (node.tags.indexOf(metaInfo[1]) >= 0) {
            res.push(node)
          }
          break
        default:
          break
      }
    }
    return this.applySortingStrategy(res)
  }

  public dispose(): void {
    this.urlNodeMap.clear()
    this.tagSet.clear()
  }

  // 二级目录排序
  private sortSubCategoryNodes(
    subCategoryNodes: TomHubNode[],
    category: Category
  ): void {
    switch (category) {
    // case Category.Difficulty:
    //   subCategoryNodes.sort((a: LeetCodeNode, b: LeetCodeNode): number => {
    //     function getValue(input: LeetCodeNode): number {
    //       switch (input.name.toLowerCase()) {
    //       case 'easy':
    //         return 1
    //       case 'medium':
    //         return 2
    //       case 'hard':
    //         return 3
    //       default:
    //         return Number.MAX_SAFE_INTEGER
    //       }
    //     }
    //     return getValue(a) - getValue(b)
    //   })
    //   break
      case Category.Tags:
        subCategoryNodes.sort((a: TomHubNode, b: TomHubNode): number => {
          if (a.name === 'Unknown') {
            return 1
          } else if (b.name === 'Unknown') {
            return -1
          } else {
            return Number(a.name > b.name) - Number(a.name < b.name)
          }
        })
        break
      default:
        break
    }
  }

  // 数据按照ID排序
  private applySortingStrategy(nodes: TomHubNode[]): TomHubNode[] {
    const strategy: SortingStrategy = SortingStrategy.Asc
    switch (strategy) {
      case SortingStrategy.Asc:
        return nodes.sort(
          (x: TomHubNode, y: TomHubNode) => Number(x.id) - Number(y.id))
        // case SortingStrategy.AcceptanceRateDesc:
        //   return nodes.sort(
        //     (x: TomHubNode, y: TomHubNode) => Number(y.id) - Number(x.id))
      default: return nodes
    }
  }
}

export const urlsNodeManager: UrlsNodeManager = new UrlsNodeManager()
