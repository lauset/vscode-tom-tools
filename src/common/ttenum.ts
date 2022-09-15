import type * as vscode from 'vscode'

export interface IQuickItemEx<T> extends vscode.QuickPickItem {
  value: T
}

export const loginArgsMapping: Map<string, string> = new Map([
  ['Cookie', '-c'],
  ['GitHub', '-g']
])

export const languages: string[] = [
  'bash',
  'c',
  'cpp',
  'csharp',
  'golang',
  'java',
  'javascript',
  'kotlin',
  'mysql',
  'php',
  'python',
  'python3',
  'ruby',
  'rust',
  'scala',
  'swift',
  'typescript'
]

export const langExt: Map<string, string> = new Map([
  ['bash', 'sh'],
  ['c', 'c'],
  ['cpp', 'cpp'],
  ['csharp', 'cs'],
  ['golang', 'go'],
  ['java', 'java'],
  ['javascript', 'js'],
  ['kotlin', 'kt'],
  ['mysql', 'sql'],
  ['php', 'php'],
  ['python', 'py'],
  ['python3', 'py'],
  ['ruby', 'rb'],
  ['rust', 'rs'],
  ['scala', 'scala'],
  ['swift', 'swift'],
  ['typescript', 'ts']
])

/**
 * 网址状态
 */
export enum ProblemState {
  AC = 1,
  NotAC = 2,
  Unknown = 3,
}

export enum Endpoint {
  TomHub = 'tomub',
  TomHubCN = 'tomhub-cn',
}

/**
 * 网址分类
 */
export enum Category {
  All = 'All',
  Doc = 'Documents',
  Tags = 'Tags',
  Tools = 'Tools',
  Video = 'Videos',
  Pic = 'Pictures',
  Cmd = 'Commands',
}

/**
 * 排序
 */
export enum SortingStrategy {
  None = 'None',
  Asc = 'Asc (Ascending)',
  Desc = 'Desc (Descending)',
  FrequencyAsc = 'Frequency (Ascending)',
  FrequencyDesc = 'Frequency (Descending)',
}

export enum keyConfig {
  owner = 'tomtools.owner',
  welcome = 'tomtools.welcome.enabled',
  welcomeUrl = 'tomtools.welcome.url',
  urlsEnabled = 'tomtools.urls.enabled',
  urlsPath = 'tomtools.urls.path',
  urlsFile = 'tomtools.urls.file',
  searchEnabled = 'tomtools.search.enabled',
  searchPath = 'tomtools.search.path',
  searchFile = 'tomtools.search.file',
  searchUrl = 'tomtools.search.url',
  imgEnabled = 'tomtools.image.enabled',
  imgPath = 'tomtools.image.path',
  imgOpacity = 'tomtools.image.opacity',
}

export enum keyCommands {
  hello = 'tt.hello',
  so = 'tt.so',
  welcome = 'tt.welcome',
  doclist = 'tt.doc',
  search = 'tt.search',
  show = 'tt.show',
  filePath = 'tt.path',
  menu = 'tt.menu',
  preview = 'tt.preview',
}

export enum KeyViews {
  url = 'tomtools.urllist',
  wea = 'tomtools.weaview',
  conf = 'tomtools.confview',
}

export enum KeyUrls {
  urls = 'https://cdn.jsdelivr.net/gh/lauset/vscode-tom-tools/data/weburls.json',
  search = 'https://cdn.jsdelivr.net/gh/lauset/vscode-tom-tools/data/websearch.json',
}

export const hasInited = 'tt.hasInited'
export const tomhub = 'lauset.tomhub-tools'
export const extName = 'tomHubTools'
export const explorer = 'tomtoolsExplorer'
export const configExplorer = 'config'
