import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import type { IUrl } from '../common/models'
import { defaultUrl } from '../common/models'
import { httpGet } from '../utils/request'
import { keyConfig as kc, KeyUrls as ku } from '../common/ttenum'

const errorUrls = {
  list: [defaultUrl]
}

export function getDocConfig() {
  const enabled = vscode.workspace.getConfiguration().get(kc.urlsEnabled)
  const path = vscode.workspace.getConfiguration().get(kc.urlsPath)
  const file = vscode.workspace.getConfiguration().get(kc.urlsFile)
  const urlsGitee = ku.urls
  return {
    enabled,
    path,
    file,
    urlsGitee,
    example: defaultUrl
  }
}

/**
 * 查询文档列表数据接口
 */
export async function getDocList(): Promise<IUrl[]> {
  // 用户是否开启本地文档配置文件的使用
  const urlsEnabled = vscode.workspace.getConfiguration().get(kc.urlsEnabled)
  const urlsPath: string | undefined = vscode.workspace
    .getConfiguration()
    .get(kc.urlsPath)
  const urlsFile: string | undefined = vscode.workspace
    .getConfiguration()
    .get(kc.urlsFile)
  const urlsGitee = ku.urls
  try {
    let problems: IUrl[] = []

    // 使用 httpFetch 方式请求文档列表数据
    // const hg: any = httpFetch(urlsGitee)
    // const { body, statusCode } = await hg.promise
    // if (statusCode == 200) {
    //   problems = body.list
    //   return problems
    // } else {
    //   return errorUrls.list
    // }

    // 使用 httpGet 方式请求文档列表数据
    if (urlsEnabled && urlsPath && urlsFile) {
      // 获取当前插件的文件路径，并默认给给文档配置文件路径
      // const tt: any =
      //   vscode.extensions.getExtension('lauset.vscode-tom-tools')
      // console.log(tt.extensionPath)
      // const extensionPath = `${tt.extensionPath}\\data`
      // vscode.workspace.getConfiguration().update(key2, extensionPath, true)

      // 从本地获取文档列表
      await getListFromLocal(
        path.join(urlsPath, urlsFile),
        path.join(urlsPath, `backup/bk_${urlsFile}`)
      ).then((resp: any) => {
        problems = resp.list
      })
    } else {
      await getListFromGitee(urlsGitee).then((resp: any) => {
        problems = resp.list
      })
    }
    return problems
  } catch (error) {
    return []
  }
}

/**
 * 从本地文档配置文件获取文档列表数据
 *
 * @param url 本地列表配置文件位置
 * @param bkurl 本地列表配置文件备份位置
 * @returns
 */
async function getListFromLocal(url: string, bkurl: string) {
  return new Promise((resolve) => {
    fs.readFile(url, 'utf8', (err, data) => {
      if (err) resolve(errorUrls)
      const body = JSON.parse(data)
      body.update = new Date()
      body.online = 'local'
      fs.writeFileSync(bkurl, JSON.stringify(body))
      resolve(body)
    })
  })
}

/**
 * 获取GITEE上的文档配置文件列表数据，可用于重置本地配置
 *
 * @param url
 * @returns
 */
async function getListFromGitee(url: string) {
  return new Promise((resolve) => {
    httpGet(url, {}, (err: any, _resp: any, body: any) => {
      if (!err && !body.list) err = new Error(JSON.stringify(body))
      if (err) resolve(errorUrls)
      resolve(body)
    })
  })
}

/**
 * 本地配置文件添加数据
 */
export async function addDocToLocal(urlsData: IUrl): Promise<any> {
  const urlpath: string =
    vscode.workspace.getConfiguration().get(kc.urlsPath) || ''
  const urlfile: string =
    vscode.workspace.getConfiguration().get(kc.urlsFile) || ''
  if (!urlpath || !urlfile) return
  const url = path.join(urlpath, urlfile)
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(url, 'utf8', (err, data) => {
        if (err) {
          reject({
            code: 500,
            message: err
          })
        }
        let haveFlag = false
        const oldData = JSON.parse(data)
        oldData._update = new Date()
        oldData._online = 'local'
        const newData = oldData
        const id = urlsData.id
        for (let i = 0; i < newData.list.length; i++) {
          if (id === newData.list[i].id) {
            haveFlag = true
          }
        }
        if (haveFlag) {
          resolve({
            code: 201,
            message: '该ID已存在，请更换ID重新尝试'
          })
        } else {
          newData.list.push(urlsData)
          fs.writeFileSync(url, JSON.stringify(newData, null, '\t'))
          resolve({
            code: 200,
            message: '添加成功'
          })
        }
      })
    } catch (error: any) {
      reject({
        code: 500,
        message: error.message
      })
    }
  })
}

/**
 * 本地配置文件删除数据
 *
 * @returns
 */
export async function delDocToLocal(urlsData: any): Promise<any> {
  const urlpath: string =
    vscode.workspace.getConfiguration().get(kc.urlsPath) || ''
  const urlfile: string =
    vscode.workspace.getConfiguration().get(kc.urlsFile) || ''
  if (!urlpath || !urlfile) return
  const url = path.join(urlpath, urlfile)
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(url, 'utf8', (err, data) => {
        if (err) {
          reject({
            code: 500,
            message: err
          })
        }
        const oldData = JSON.parse(data)
        oldData._update = new Date()
        oldData._online = 'local'
        const newData = oldData
        const id = urlsData.id
        for (let i = 0; i < newData.list.length; i++) {
          if (id === newData.list[i].id) {
            newData.list.splice(i, 1)
          }
        }
        fs.writeFileSync(url, JSON.stringify(newData, null, '\t'))
        resolve({
          code: 200,
          message: '删除成功'
        })
      })
    } catch (error: any) {
      reject({
        code: 500,
        message: error.message
      })
    }
  })
}

// function parseState(stateOutput: string): ProblemState {
//   return ProblemState.Unknown
//   if (!stateOutput) {
//     return ProblemState.Unknown
//   }
//   switch (stateOutput.trim()) {
//     case 'v':
//     case '✔':
//     case '√':
//       return ProblemState.AC
//     case 'X':
//     case '✘':
//     case '×':
//       return ProblemState.NotAC
//     default:
//       return ProblemState.Unknown
//   }
// }
