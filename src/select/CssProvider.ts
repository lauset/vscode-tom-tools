import * as path from 'path'
import * as fs from 'fs'
import * as vscode from 'vscode'
import { explorer, tomhub } from '../common/ttenum'
import { exec } from 'child_process'

const tomhubEx = vscode.extensions.getExtension(tomhub)
const version = tomhubEx?.packageJSON.version
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

  private filePath = path.join(
    path.dirname((require.main as NodeModule).filename),
    'vs', 'workbench', cssName)

  private imagePath = ''
  private imageLinearTop = ''
  private imageLinearLeft = ''
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
      let o = 0
      if(this.imageOpacity === 0 || this.imageOpacity === 1) {
        o = this.imageOpacity
      } else {
        o = this.imageOpacity / 2
      }
      this.imageLinearTop = `
        -webkit-linear-gradient(
          top,
          rgba(255, 255, 255, ${o}) 0%,
          rgba(255, 255, 255, ${o}) 100%
        )
      `
      this.imageLinearLeft = `
        -webkit-linear-gradient(
          top,
          rgba(255, 255, 255, ${o}) 0%,
          rgba(255, 255, 255, ${o}) 100%
        )
      `
    } else {
      bgColor = '#000000'
      let o = 0
      if(this.imageOpacity === 0 || this.imageOpacity === 1) {
        o = this.imageOpacity
      } else {
        o = this.imageOpacity / 2
      }
      this.imageLinearTop = `
        -webkit-linear-gradient(
          top,
          rgba(33, 34, 44, ${o}) 0%,
          rgba(33, 34, 44, ${o}) 100%
        )
      `
      this.imageLinearLeft = `
        -webkit-linear-gradient(
          top,
          rgba(33, 34, 44, ${o}) 0%,
          rgba(33, 34, 44, ${o}) 100%
        )
      `
    }
    return `
    /*ext-${explorer}-start*/
    /*ext.${explorer}.ver.${version}*/
    div#workbench\\.view\\.extension\\.${explorer}.composite.viewlet>div {
      /*background-color: ${bgColor}${opStr};*/
    }
    div#workbench\\.view\\.extension\\.${explorer}.composite.viewlet .monaco-list-rows {
      /*background-color: ${bgColor}80;*/
      backdrop-filter: blur(3px);
    }
    div#workbench\\.view\\.extension\\.${explorer}.composite.viewlet {
      /*background-image: linear-gradient(221deg, #b100ff15 20%,#00b3ff15 80%); */
      /*opacity:${this.imageOpacity};*/
      /*background-image:url('${this.imagePath}');*/
      background: ${this.imageLinearTop},${this.imageLinearLeft}, url('${this.imagePath}');
      background-size: cover;
      background-position: center;
    } 
    /*ext-${explorer}-end*/
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
    // fs.writeFileSync(this.filePath, content, 'utf-8')
    fs.writeFile(this.filePath, content, { encoding: 'utf-8' }, (error) => {
      if (error) {
        // 对文件没有读写权限则提示输入管理员密码以继续写入样式
        if (error.message.startsWith('EACCES: permission denied')) {
          const option: vscode.InputBoxOptions = {
            ignoreFocusOut: true,
            password: false,
            placeHolder: 
              'Please enter the root password for access / 请输入 ROOT 密码用于获取权限',
            prompt: '请输入管理员密码'
          }
          vscode.window.showInputBox(option).then((value) => {
            if (!value) {
              vscode.window.showWarningMessage(
                'Please enter password / 请输入密码！'
              )
              return
            }
            // 回调中无法返回标识，所以授权后异步写入样式并自动重启程序
            this.saveContentMac(value, content)
          })
        }
      }
    })
  }

  // 执行授权命令并写入样式
  public saveContentMac(password: string, content: string) {
    // SUDO+密码对css文件进行'读与写'授权
    exec(
      `echo "${password}" | sudo -S chmod a+rwx "${this.filePath}"`,
      (error) => {
        console.log('Chmod error:', error?.message)
        if (error) {
          vscode.window.showWarningMessage(
            `${error.name}: 密码可能输入有误，请重新尝试！`
          )
        }
        // 写入样式并自动重启程序
        fs.writeFileSync(this.filePath, content, 'utf-8')
        vscode.commands.executeCommand('workbench.action.reloadWindow')
      }
    )
  }

  // 清除旧样式
  private clearCssContent(content: string): string {
    const re = new RegExp(`\\/\\*ext-${explorer}-start\\*\\/[\\s\\S]*?\\/\\*ext-${explorer}-end\\*` + '\\/', 'g')
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
