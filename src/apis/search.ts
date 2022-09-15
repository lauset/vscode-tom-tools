import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { httpGet } from '../utils/request'
import { keyConfig as kc, KeyUrls as ku } from '../common/ttenum'
import type { ISearch } from '../common/models'
import { defaultSearch } from '../common/models'

const errorUrls = {
  list: [defaultSearch]
}

export function getSearchConfig() {
  const enabled = vscode.workspace.getConfiguration().get(kc.searchEnabled)
  const path = vscode.workspace.getConfiguration().get(kc.searchPath)
  const file = vscode.workspace.getConfiguration().get(kc.searchFile)
  const urlsGitee = ku.search
  return {
    enabled,
    path,
    file,
    urlsGitee,
    example: defaultSearch
  }
}

export async function getSearchList(_message) {
  const tEnabled = vscode.workspace.getConfiguration().get(kc.searchEnabled)
  const tPath: string | undefined = vscode.workspace
    .getConfiguration()
    .get(kc.searchPath)
  const tFile: string | undefined = vscode.workspace
    .getConfiguration()
    .get(kc.searchFile)
  const urlsGitee = ku.search
  let problems: ISearch[] = []
  try {
    if (tEnabled && tPath && tFile) {
      await getListFromLocal(
        path.join(tPath, tFile),
        path.join(tPath, `backup/bk_${tFile}`)
      ).then((resp: any) => {
        problems = resp.list
      })
    } else {
      await getListFromGitee(urlsGitee).then((resp: any) => {
        problems = resp.list
      })
    }
  } catch (error) {
    console.log(error)
  }
  if (!problems) problems = errorUrls.list
  return problems
}

export async function addSearch(urlsData: ISearch): Promise<any> {
  const urlpath: string =
    vscode.workspace.getConfiguration().get(kc.searchPath) || ''
  const urlfile: string =
    vscode.workspace.getConfiguration().get(kc.searchFile) || ''
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

export async function delSearch(urlsData: ISearch): Promise<any> {
  const urlpath: string =
    vscode.workspace.getConfiguration().get(kc.searchPath) || ''
  const urlfile: string =
    vscode.workspace.getConfiguration().get(kc.searchFile) || ''
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

async function getListFromLocal(url: string, bkurl: string) {
  return new Promise((resolve) => {
    fs.readFile(url, 'utf8', (err, data) => {
      if (err) resolve(errorUrls)
      const body = JSON.parse(data)
      body._update = new Date()
      body._online = 'local'
      fs.writeFileSync(bkurl, JSON.stringify(body))
      resolve(body)
    })
  })
}

async function getListFromGitee(url: string) {
  return new Promise((resolve) => {
    httpGet(url, {}, (err: any, _resp: any, body: any) => {
      if (!err && !body.list) err = new Error(JSON.stringify(body))
      if (err) resolve(errorUrls)
      resolve(body)
    })
  })
}
