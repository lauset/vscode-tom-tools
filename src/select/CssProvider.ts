import * as path from 'path'
import * as fs from 'fs'
import * as vscode from 'vscode'

const version = vscode.workspace.getConfiguration('tomtools').version

const cssName: string = vscode.version >= '1.38' ?
  'workbench.desktop.main.css' : 'workbench.main.css'

// 当前所选主题配色名称
// const themeName = vscode.workspace.getConfiguration('workbench').colorTheme

// 是否为亮色主题
const themeLight = vscode.window.activeColorTheme.kind === 1

/**
 * CSS辅助
 */
export class CssProvider {

  // eslint-disable-next-line prettier/prettier
  private filePath = path.join(
    path.dirname((require.main as NodeModule).filename),
    'vs', 'workbench', cssName)

  private extName = 'tomHubTools'
  private imagePath = ''
  private imageOpacity = 0

  constructor(imagePath: string, opacity: number) {
    this.imagePath = imagePath
    this.imageOpacity = opacity
  }

  public install(): boolean {
    // 去除末尾空白
    const content: any = this.getCss().replace(/\s*$/, '')
    if (content === '') {
      return false
    }
    // 添加新样式，并努力地去清除旧样式
    let newContent = this.getContent()
    newContent = this.clearCssContent(newContent)
    newContent += content
    this.saveContent(newContent)
    return true
  }

  private getCss(): string {

    // let opacity = this.imageOpacity
    // opacity = opacity <= 0.1 ? 0.1 : opacity >= 1 ? 1 : opacity
    // opacity = 0.59 + (0.4 - ((opacity * 4) / 10))

    const opNum = this.imageOpacity * 100
    let opStr = ''
    if (opNum === 100) {
      opStr = ''
    } else if (opNum < 10) {
      opStr = `0${opNum}`
    } else {
      opStr = `${opNum}`
    }
    // 返回侧边栏样式，需要根据主题亮暗返回
    let bgColor = ''
    if (themeLight) {
      bgColor = '#FFFFFF'
    } else {
      bgColor = '#000000'
    }
    return `
    /*ext-${this.extName}-start*/
    /*ext.${this.extName}.ver.${version}*/
    div#workbench\\.view\\.extension\\.${this.extName}.composite.viewlet {
      /*background-image: linear-gradient(221deg, #b100ff15 20%,#00b3ff15 80%); */
      /*opacity:${this.imageOpacity};*/
      background-size: cover;
      background-position: center;
      background-image:url('${this.imagePath}');
    }
    div#workbench\\.view\\.extension\\.${this.extName}.composite.viewlet>div {
      background-color: ${bgColor}${opStr};
    }
    div#workbench\\.view\\.extension\\.${this.extName}.composite.viewlet .monaco-list-rows {
      background-color: ${bgColor}80;
      backdrop-filter: blur(1px);
    }
    /*ext-${this.extName}-end*/
    `
  }

  private getContent(): string {
    return fs.readFileSync(this.filePath, 'utf-8')
  }

  // 转换本地图片
  public imageToBase64(){
    try{
      let extname    = path.extname(this.imagePath)
      extname        = extname.substr(1)
      this.imagePath =
        fs.readFileSync(path.resolve(this.imagePath)).toString('base64')
      this.imagePath = `data:image/${extname};base64,${this.imagePath}`
    }catch(e){
      return false
    }
    return true
  }

  // 保存样式
  private saveContent(content: string): void {
    fs.writeFileSync(this.filePath, content, 'utf-8')
  }

  // 清除旧样式
  private clearCssContent(content: string): string {
    const re = new RegExp(`\\/\\*ext-${  this.extName  }-start\\*\\/[\\s\\S]*?\\/\\*ext-${  this.extName  }-end\\*` + '\\/', 'g')
    content = content.replace(re, '')
    content = content.replace(/\s*$/, '')
    return content
  }

  // 卸载样式
  public uninstall(): boolean {
    try {
      let content = this.getContent()
      content = this.clearCssContent(content)
      this.saveContent(content)
      return true
    } catch (ex) {
      // console.log(ex);
      return false
    }
  }
}
