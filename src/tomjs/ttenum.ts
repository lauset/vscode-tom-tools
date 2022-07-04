import type * as vscode from 'vscode'

export interface IQuickItemEx<T> extends vscode.QuickPickItem {
  value: T;
}

/**
 * 用户状态
 */
export enum UserStatus {
  SignedIn = 1,
  SignedOut = 2,
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

export interface IProblem {
  isUrl: boolean;
  isCmd: boolean;
  state: ProblemState;
  id: string;
  name: string;
  url: string;
  type: string;
  tags: string[];
}

/**
 * 网址构造
 */
export const defaultProblem: IProblem = {
  isUrl: false,
  isCmd: false,
  state: ProblemState.Unknown,
  id: '',
  name: '',
  url: '',
  type: '',
  tags: [] as string[]
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
  Cmd = '命令'
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

export const supportedPlugins: string[] = [
  'company',
  'solution.discuss',
  'tomhub.cn'
]

export enum DescriptionConfiguration {
  InWebView = 'In Webview',
  InFileComment = 'In File Comment',
  Both = 'Both',
  None = 'None',
}

export enum keyConfig {
  owner = 'tomtools.owner',
  welcome = 'tomtools.welcome.enabled',
  welcomeUrl = 'tomtools.welcome.url',
  urlsEnabled = 'tomtools.urls.enabled',
  urlsPath = 'tomtools.urls.path',
  urlsFile = 'tomtools.urls.file',
  imgEnabled = 'tomtools.image.enabled',
  imgPath = 'tomtools.image.path',
  imgOpacity = 'tomtools.image.opacity'
}

export enum keyCommands {
  hello = 'tt.hello',
  welcome = 'tt.welcome',
  doclist = 'tt.doc',
  menuShow = 'tt.menuShow',
  filePath = 'tt.getFilePath',
  config = 'tt.configShow',
}

export const hasInited = 'tt.hasInited'

