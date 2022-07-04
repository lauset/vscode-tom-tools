import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import { CssProvider } from './CssProvider'
import { Option } from './Option'

/**
 * 右下角弹框提示
 * @param content 提示内容
 */
function showInfo(content: string): Thenable<string | undefined> {
  return vscode.window.showInformationMessage(content)
}

export class SelectList {
  public static itemList: SelectList | undefined

  // 下拉列表
  private readonly quickPick: vscode.QuickPick<Option> | any

  private _disposables: vscode.Disposable[] = []

  // 当前插件配置
  private config: vscode.WorkspaceConfiguration

  // 当前配置文件路径
  private jsonFilePath: string

  // 当前配置文件名称
  private jsonFileName: string

  // 类型 1:本地文件，2：https
  private jsonFileType: number

  // 背景图路径
  private imgPath: string

  // 背景图透明度
  private imgOpacity: number

  // 背景图来源类型
  private imgType: number

  // 欢迎页网链地址
  private welcomeUrl: string

  // 初始化下拉列表
  public static initList() {
    const config: vscode.WorkspaceConfiguration 
      = vscode.workspace.getConfiguration('tomtools')
    const list: vscode.QuickPick<Option> 
      = vscode.window.createQuickPick<Option>()
    list.placeholder = 'Please choose configuration! / 请开始您的选择'
    const items: Option[] = [
      {
        label: '$(symbol-misc)    Select a configuration file ',
        description: '选择一个文档列表的配置文件',
        type: 1
      },
      {
        label: '$(file-directory)    Set configuration file directory ',
        description: '设置文档列表的配置文件的目录',
        type: 2
      },
      {
        label: '$(symbol-color)    Input : opacity ',
        description: '调整侧栏菜单背景图不透明度',
        type: 5
      },
      {
        label: '$(jersey)    Input : path/https ',
        description: '更换侧栏菜单背景图（支持本地和https形式路径）',
        type: 6
      },
      {
        label: '$(eye-closed)    Close background ',
        description: '关闭侧栏菜单背景图',
        type: 7
      },
      {
        label: '$(symbol-keyword)    Update Welcome Url ',
        description: '修改欢迎页URL路径',
        type: 12
      }
    ]
    list.items = items
    SelectList.itemList = new SelectList(config, list)
  }

  // 开启背景图
  public static startBackground() {
    const config = vscode.workspace.getConfiguration('tomtools')
    if (!config.image.path || !config.image.enabled) {
      return false
    }
    SelectList.itemList = new SelectList(config)
    SelectList.itemList.startBackground()
    return (SelectList.itemList = undefined)
  }

  // 启动时自动更新背景
  private startBackground() {
    const imageFullPath = this.config.image.path
    if (imageFullPath) {
      this.listChange(11, imageFullPath)
    }
    return true
  }

  // 列表构造方法
  private constructor(
    config: vscode.WorkspaceConfiguration,
    selectList?: vscode.QuickPick<Option>
  ) {
    this.config = config
    this.jsonFilePath = config.urls.path
    this.jsonFileName = config.urls.file
    this.imgPath = config.image.path
    this.imgOpacity = config.image.opacity
    this.welcomeUrl = config.welcome.url
    if (!this.imgType) this.imgType = 1
    if (!this.jsonFileType) this.jsonFileType = 1
    if (selectList) {
      this.quickPick = selectList
      this.quickPick.onDidAccept(() =>
        this.listChange(
          this.quickPick.selectedItems[0].type,
          this.quickPick.selectedItems[0].path
        )
      )
      this.quickPick.onDidHide(
        () => {
          this.dispose()
        },
        null,
        this._disposables
      )
      this.quickPick.show()
    }
  }

  // 列表点击事件
  private listChange(type: number, path?: string) {
    switch (type) {
      case 1:
        if (!this.config.urls.path) {
          vscode.window.showWarningMessage(
            'Please add a directory! / 请设置配置文件目录后再来操作'
          )
        } else {
          this.jsonList() // 展示配置文件目录下的配置文件列表
        }
        break
      case 2:
        this.openFieldDialog(2) // 弹出选择文件夹对话框
        break
      case 3:
        this.openFieldDialog(1) // 弹出选择文件对话框
        break
      case 4:
        this.updateFile(path) // 选择列表内文件，更新背景css
        break
      case 5:
        this.showInputBox(2) // 更改背景图透明度
        break
      case 6:
        this.showInputBox(1) // 输入背景图路径
        break
      case 7:
        this.updateCss(true) // 关闭背景图片展示
        break
      case 8:
        this.openFile() // 打开并编辑配置文件
        break
      case 9:
        // 重新加载窗口，使设置生效
        vscode.commands.executeCommand('workbench.action.reloadWindow')
        break
      case 10:
        // 隐藏设置弹窗
        this.quickPick.hide()
        break
      case 11:
        // 更新背景图
        this.updateBackground(path)
        break
      case 12:
        // 更新欢迎页URL
        this.showWelcomeInput()
        break
      default:
        break
    }
  }

  // 释放资源
  private dispose() {
    SelectList.itemList = undefined
    this.quickPick.hide()
    while (this._disposables.length) {
      const x = this._disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }

  // 根据配置录展示出json文件列表
  private jsonList(folderPath?: string) {
    let items: Option[] = [
      {
        label: '$(folder-opened)  Open folder',
        description: '打开文件夹选择配置文件',
        type: 3
      }
    ]
    const fileListDir: any = folderPath ? folderPath : this.config.urls.path
    if (this.checkFolder(fileListDir)) {
      const files: string[] = this.getFolderJsonList(fileListDir)
      if (files.length > 0) {
        items = items.concat(
          files.map(
            (e) => new Option(`$(tag) ${e}`, e, 4, path.join(fileListDir, e))
          )
        )
      }
    }
    this.quickPick.items = items
    this.quickPick.show()
  }

  // 获取目录下的所有配置文件
  private getFolderJsonList(pathUrl: string): string[] {
    if (!pathUrl || pathUrl === '') {
      return []
    }
    // 获取目录下的所有图片
    const files: string[] = fs
      .readdirSync(path.resolve(pathUrl))
      .filter((s) => s.endsWith('.json') || s.endsWith('.txt'))
    return files
  }

  // 检查选择的文件及目录是否正确
  private checkFolder(folderPath: string) {
    if (!folderPath) {
      return false
    }
    // 判断路径是否存在
    const fsStatus = fs.existsSync(path.resolve(folderPath))
    if (!fsStatus) {
      return false
    }
    // 判断是否为目录路径
    const stat = fs.statSync(folderPath)
    if (!stat.isDirectory()) {
      return false
    }
    return true
  }

  // 输入框
  private showInputBox(type: number): any {
    if (type <= 0 || type > 2) return false

    const placeString =
      type === 2
        ? `Opacity ranges：0.00 - 1,current:(${this.imgOpacity})`
        : 'Please enter the image path to support local and HTTPS'

    const promptString =
      type === 2
        ? '设置透明度：0(图片最明显)-1(图片最不明显)'
        : '请输入图片路径，支持本地及https'

    const option: vscode.InputBoxOptions = {
      ignoreFocusOut: true,
      password: false,
      placeHolder: placeString,
      prompt: promptString
    }

    vscode.window.showInputBox(option).then((value): any => {
      // 未输入值返回false
      if (!value) {
        vscode.window.showWarningMessage(
          'Please enter parameters / 请输入内容！'
        )
        return
      }
      if (type === 1) {
        // 判断路径是否存在
        const fsStatus = fs.existsSync(path.resolve(value))
        const isUrl = value.substr(0, 8).toLowerCase() === 'https://'
        if (!fsStatus && !isUrl) {
          vscode.window.showWarningMessage(
            'The file does not exist! / 无权限访问文件或文件不存在！'
          )
          return false
        }
        // 如果为https连接图片，则更新图片类型
        if (isUrl) {
          this.imgType = 2
        }
        this.imgPath = value
      } else {
        const isOpacity = parseFloat(value)
        if (isOpacity < 0 || isOpacity > 1 || isNaN(isOpacity)) {
          vscode.window.showWarningMessage('Opacity ranges in：0 - 1！')
          return false
        }
        this.imgOpacity = isOpacity
      }
      this.setConfigValue(
        type === 1 ? 'image.path' : 'image.opacity',
        type === 1 ? value : parseFloat(value),
        false,
        true
      )
    })
  }

  private showWelcomeInput(): any {
    console.log(`welcome old url: ${this.welcomeUrl}`)
    const placeString = 
      'Please enter an HTTP or HTTPS URL link'
    const promptString =
        '请输入网链地址，支持http 或 https 格式'
    const option: vscode.InputBoxOptions = {
      ignoreFocusOut: true,
      password: false,
      placeHolder: placeString,
      prompt: promptString
    }
    vscode.window.showInputBox(option).then((value): any => {
      // 未输入值返回false
      if (!value) {
        vscode.window.showWarningMessage(
          'Please enter parameters / 请输入内容！'
        )
        return
      }
      const fsStatus = fs.existsSync(path.resolve(value))
      const isHttps = value.toLowerCase().startsWith('https://')
      const isHttp = value.toLowerCase().startsWith('http://')
      if (!fsStatus && !isHttp && !isHttps) {
        vscode.window.showWarningMessage(
          'Incorrect format! / 格式不正确！'
        )
        return
      }
      this.welcomeUrl = value
      this.setConfigValue(
        'welcome.url',
        value,
        false,
        false
      )
    })
  }

  // 更新配置
  private updateFile(filePath?: string): any {
    if (!filePath) return showInfo('未获取到路径')
    // 从目录获取文件名
    const fileName = path.basename(`${filePath}`)
    this.setConfigValue('urls.file', fileName)
  }

  // 文件、目录选择
  private async openFieldDialog(type: number) {
    const isFolders = type === 1 ? false : true
    const isFiles = type === 2 ? false : true
    const filters = type === 1 ? { Json: ['json', 'txt'] } : undefined
    const folderUris = await vscode.window.showOpenDialog({
      canSelectFolders: isFolders,
      canSelectFiles: isFiles,
      canSelectMany: false,
      openLabel: 'Select folder',
      filters
    })
    if (!folderUris) {
      return false
    }
    const fileUri = folderUris[0]
    if (type === 2) {
      this.setConfigValue('urls.path', fileUri.fsPath, false)
      return this.jsonList(fileUri.fsPath)
    }
    if (type === 1) {
      return this.setConfigValue('urls.file', path.basename(fileUri.fsPath))
    }
    return false
  }

  // 更新配置
  private setConfigValue(
    name: string,
    value: any,
    edit = true,
    update = false
  ) {
    // 更新变量
    this.config.update(name, value, vscode.ConfigurationTarget.Global)
    switch (name) {
      case 'urls.path':
        this.jsonFilePath = value
        break
      case 'urls.file':
        this.jsonFileName = value
        break
      default:
        break
    }
    // 是否继续编辑配置文件
    if (edit) {
      if (this.quickPick) {
        this.quickPick.placeholder =
          'Edit Or Restart? / 编辑配置文件或重启软件？'
        this.quickPick.items = [
          {
            label: '$(edit)   Edit',
            description:
              '设置成功，打开并编辑（编辑完需要手动重启软件才能生效哦）',
            type: 8
          },
          {
            label: '$(repo-sync)   Restart',
            description: '设置成功，重启软件生效',
            type: 9
          }
        ]
        this.quickPick.ignoreFocusOut = true
        this.quickPick.show()
      }
    }
    // 是否更新背景图
    if (update) {
      this.updateCss()
    }
    return true
  }

  // 打开编辑配置文件
  private openFile(): any {
    if (!this.jsonFilePath || !this.jsonFileName)
      return showInfo('无法打开，路径有错误哦')
    const fileFullPath = path.join(this.jsonFilePath, this.jsonFileName)
    vscode.window.showTextDocument(vscode.Uri.file(fileFullPath)).then(() => {
      this.quickPick.hide()
      showInfo(`文件打开成功：${fileFullPath}`)
    })
  }

  // 触发CSS更新
  private updateBackground(imgPath?: string): any {
    if (!imgPath) return showInfo('未获取到图片路径')
    this.updateCss()
  }

  // CSS更新
  private updateCss(uninstall = false) {
    const dom: CssProvider = new CssProvider(this.imgPath, this.imgOpacity)
    let result = false
    if (uninstall) {
      result = dom.uninstall()
    } else {
      // 是否需要转base64，本地文件需要
      if (this.imgPath.indexOf('https') !== 0) {
        dom.imageToBase64()
      }
      result = dom.install()
    }
    if (result && this.quickPick) {
      this.quickPick.placeholder = 'Reloading takes effect? / 重启窗口生效？'
      this.quickPick.items = [
        { label: '$(check)   YES', description: '立即重启窗口生效', type: 9 },
        { label: '$(x)   NO', description: '稍后手动重启', type: 10 }
      ]
      this.quickPick.ignoreFocusOut = true
      this.quickPick.show()
    }
  }
}
