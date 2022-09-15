export interface ISearch {
  id: number
  isDefault: boolean
  enabled: boolean
  name: string
  desc: string
  url: string
  icon: string
}

export const defaultSearch: ISearch = {
  id: 1,
  isDefault: true,
  enabled: true,
  name: '百度',
  desc: '百度一下，你就知道',
  url: 'https://www.baidu.com/s?wd=%s',
  icon: ''
}

export enum UrlState {
  AC = 1,
  NotAC = 2,
  Unknown = 3,
}

export interface IUrl {
  id: string
  isUrl: boolean
  isCmd: boolean
  state: UrlState
  name: string
  url: string
  type: string
  tags: string[]
}

export const defaultUrl: IUrl = {
  id: '3',
  isUrl: true,
  isCmd: false,
  state: UrlState.Unknown,
  name: 'Vue.js',
  url: 'https://cn.vuejs.org/',
  type: '开发文档',
  tags: ['framework', 'vue']
}

export const objectUrl: IUrl = {
  id: '',
  isUrl: false,
  isCmd: false,
  state: UrlState.Unknown,
  name: '',
  url: '',
  type: '',
  tags: [] as string[]
}
