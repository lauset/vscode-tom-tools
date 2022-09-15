import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as vscode from 'vscode'
import { exec } from 'child_process'
import { showError } from './message'

const utils = {
  /**
   * 获取当前所在工程根目录，有3种使用方法：<br>
   * getProjectPath(uri) uri 表示工程内某个文件的路径<br>
   * getProjectPath(document) document 表示当前被打开的文件document对象<br>
   * getProjectPath() 会自动从 activeTextEditor 拿document对象，如果没有拿到则报错
   * @param {*} document
   */
  getProjectPath(document: any) {
    if (!document) {
      document = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document
        : null
    }
    if (!document) {
      showError('当前激活的编辑器不是文件或者没有文件被打开！')
      return ''
    }
    const currentFile = (document.uri ? document.uri : document).fsPath
    let projectPath = null
    const wf: any = vscode.workspace.workspaceFolders
    if (!wf) {
      showError('请先保存工作空间再操作吧！')
      return ''
    }

    let workspaceFolders = wf.map((item: any) => item.uri.fsPath)
    // 由于存在Multi-root工作区，暂时没有特别好的判断方法，先这样粗暴判断
    // 如果发现只有一个根文件夹，读取其子文件夹作为 workspaceFolders
    if (workspaceFolders.length == 0) {
      showError('请先在工作空间添加文件夹再操作吧！')
      return ''
    }
    if (
      workspaceFolders.length == 1 &&
      workspaceFolders[0] === vscode.workspace.rootPath
    ) {
      const rootPath = workspaceFolders[0]
      const files = fs.readdirSync(rootPath)
      workspaceFolders = files
        .filter((name) => !/^\./g.test(name))
        .map((name) => path.resolve(rootPath, name))
      // vscode.workspace.rootPath会不准确，且已过时
      // return vscode.workspace.rootPath + '/'
      //+ this._getProjectName(vscode, document);
    }
    // 替换Windows '/D:/Code' 为 Linux 'd:\\Code' 路径
    workspaceFolders.forEach((folder: any) => {
      if (currentFile.indexOf(folder) === 0) {
        projectPath = folder
      }
      projectPath = folder
    })
    if (!projectPath) {
      showError('获取工程根路径异常！')
      return ''
    }
    return projectPath
  },
  /**
   * 获取当前工程名
   */
  getProjectName(projectPath: string) {
    return path.basename(projectPath)
  },
  // getPluginPath() {},
  /**
   * 将一个单词首字母大写并返回
   * @param {*} word 某个字符串
   */
  upperFirstLetter(word: string) {
    return (word || '').replace(/^\w/, (m) => m.toUpperCase())
  },
  /**
   * 将一个单词首字母转小写并返回
   * @param {*} word 某个字符串
   */
  lowerFirstLeter(word: string) {
    return (word || '').replace(/^\w/, (m) => m.toLowerCase())
  },
  reloadVscode() {
    vscode.commands.executeCommand('workbench.action.reloadWindow')
  },
  // findStrInFolder(folderPath, str) {},
  /**
   * 从某个文件里面查找某个字符串，返回第一个匹配处的行与列，未找到返回第一行第一列
   * @param filePath 要查找的文件
   * @param reg 正则对象，最好不要带g，也可以是字符串
   */
  findStrInFile(filePath: number | fs.PathLike, reg: string | RegExp) {
    const content = fs.readFileSync(filePath, 'utf-8')
    reg = typeof reg === 'string' ? new RegExp(reg, 'm') : reg
    // 没找到直接返回
    if (content.search(reg) < 0) return { row: 0, col: 0 }
    const rows = content.split(os.EOL)
    // 分行查找只为了拿到行
    for (let i = 0; i < rows.length; i++) {
      const col = rows[i].search(reg)
      if (col >= 0) {
        return { row: i, col }
      }
    }
    return { row: 0, col: 0 }
  },
  /**
   * 获取某个字符串在文件里第一次出现位置的范围，
   */
  getStrRangeInFile(filePath: any, str: any) {
    const pos = this.findStrInFile(filePath, str)
    return new vscode.Range(
      new vscode.Position(pos.row, pos.col),
      new vscode.Position(pos.row, pos.col + str.length)
    )
  },
  /**
   * 简单的检测版本大小
   */
  checkVersion(version1: any, version2: any) {
    version1 = parseInt(version1.replace(/\./g, ''))
    version2 = parseInt(version2.replace(/\./g, ''))
    return version1 > version2
  },
  /**
   * 获取某个扩展文件绝对路径
   * @param context 上下文
   * @param relativePath 扩展中某个文件相对于根目录的路径，如 images/test.jpg
   */
  getExtensionFileAbsolutePath(
    context: { extensionPath: string },
    relativePath: string
  ) {
    return path.join(context.extensionPath, relativePath)
  },
  /**
   * 获取某个扩展文件相对于webview需要的一种特殊路径格式
   * 形如：vscode-resource:/Users/toonces/projects/vscode-cat-coding/media/cat.gif
   * @param context 上下文
   * @param relativePath 扩展中某个文件相对于根目录的路径，如 images/test.jpg
   */
  getExtensionFileVscodeResource(
    context: { extensionPath: string },
    relativePath: string
  ) {
    const diskPath = vscode.Uri.file(
      path.join(context.extensionPath, relativePath)
    )
    return diskPath.with({ scheme: 'vscode-resource' }).toString()
  },
  getOSType() {
    const osType = os.type()
    let resType = ''
    switch (osType) {
      case 'Windows_NT':
        resType = 'windows'
        break
      case 'Darwin':
        resType = 'macos'
        break
      case 'Linux':
        resType = 'linux'
        break
      default:
        break
    }
    return resType
  },
  /**
   * 在Finder中浏览
   */
  openFileInFinder(filePath: any) {
    if (!filePath) return
    if (!fs.existsSync(filePath)) {
      showError(`文件不存在：${filePath}`)
      return
    }
    const isDirectory = fs.statSync(filePath).isDirectory()
    const dirName = path.dirname(filePath)
    // const fileName = path.basename(filePath)
    // 去除首【/】，替换【/】为windows分隔符【\】
    // if (filePath.indexOf('/') === 0) {
    //   filePath = filePath.substring(1, filePath.length)
    // }
    // filePath = filePath.replaceAll('/', '\\')
    // 如果是目录则直接打开
    const osType = this.getOSType()
    if (osType === 'windows') {
      if (isDirectory) exec(`explorer ${filePath}`)
      else exec(`explorer ${dirName}`)
    } else if (osType === 'macos') {
      if (isDirectory) exec(`open ${filePath}`)
      else exec(`open ${dirName}`)
    } else {
      if (isDirectory) exec(`open ${filePath}`)
      else exec(`open ${dirName}`)
    }
  },
  /**
   * 在vscode中打开某个文件
   * @param {*} path 文件绝对路径
   * @param {*} text 可选，如果不为空，则选中第一处匹配的对应文字
   */
  openFileInVscode(path: string, text: string) {
    let options
    if (text) {
      const selection = this.getStrRangeInFile(path, text)
      options = { selection }
    }
    vscode.window.showTextDocument(vscode.Uri.file(path), options)
  },
  /**
   * 用JD-GUI打开jar包
   */
  openJarByJdGui(jarPath: any) {
    // 如何选中文件有待完善
    const jdGuiPath: any = vscode.workspace
      .getConfiguration()
      .get('eggHelper.jdGuiPath')
    if (!jdGuiPath) {
      showError('JD-GUI路径不能为空！')
      return
    }
    if (!fs.existsSync(jdGuiPath)) {
      showError(
        '您还没有安装JD-GUI，请安装完后到vscode设置里面找到HSF助手并进行路径配置。'
      )
      return
    }
    if (!fs.existsSync(jarPath)) {
      showError(`jar包未找到：${jarPath}`)
      return
    }
    exec(`open ${jarPath} -a ${jdGuiPath}`)
  },
  /**
   * 使用默认浏览器中打开某个URL
   */
  openUrlInBrowser(url: string) {
    const osType = this.getOSType()
    if (osType === 'windows') {
      exec(`start ${url}`)
    } else if (osType === 'macos') {
      exec(`open ${url}`)
    } else {
      exec(`open ${url}`)
    }
  },
  /**
   * 递归遍历清空某个资源的require缓存
   * @param {*} absolutePath
   */
  clearRequireCache(absolutePath: string) {
    const root = require.cache[absolutePath]
    if (!root) return
    if (root.children) {
      // 如果有子依赖项，先清空依赖项的缓存
      root.children.forEach((item) => {
        this.clearRequireCache(item.id)
      })
    }
    delete require.cache[absolutePath]
  },
  /**
   * 动态require，和普通require不同的是，加载之前会先尝试删除缓存
   * @param {*} modulePath
   */
  dynamicRequire(modulePath: string) {
    this.clearRequireCache(modulePath)
    return require(modulePath)
  },
  /**
   * 读取properties文件
   * @param {*} filePath
   */
  readProperties(filePath: number) {
    const content = fs.readFileSync(filePath, 'utf-8')
    let rows = content.split(os.EOL)
    rows = rows.filter((row) => row && row.trim() && !/^#/.test(row))
    const result: any = {}
    rows.forEach((row) => {
      const temp = row.split('=')
      result[temp[0].trim()] = temp[1].trim()
    })
    return result
  }
  /**
   * 比较2个对象转JSON字符串后是否完全一样
   * 特别注意，由于JS遍历对象的无序性（部分浏览器是按照添加顺序遍历的）导致同样的对象，
   * 转成JSON串之后反而不一样，所以这里采用其它方式实现。
   * @param {*} obj1
   * @param {*} obj2
   */
  // jsonEquals(obj1: any, obj2: any) {
  //   const s1 = this.formatToSpecialJSON(obj1, '', true)
  //   const s2 = this.formatToSpecialJSON(obj2, '', true)
  //   return s1 === s2
  // }
}

export default utils
