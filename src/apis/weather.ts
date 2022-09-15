import { httpFetch } from '../utils/request'
const appid = '75437651'
const appsecret = 'Pf48jMz8'

export async function getTianQiSeven() {
  // https://www.tianqiapi.com/api?version=v1
  // &appid=21375891&appsecret=fTYv7v5E

  // https://www.tianqiapi.com/free/week?unescape=1
  // &appid=75437651&appsecret=Pf48jMz8

  let result = {}
  const searchRequest = httpFetch(
    `https://www.tianqiapi.com/free/week?unescape=1
      &appid=${appid}&appsecret=${appsecret}`,
    { method: 'get' }
  )
  const resp = await searchRequest.promise
  if (resp.statusCode === 200) {
    result = resp.body
  }
  return result
}

// 天气API 实况
export async function getTianQiNow() {
  // https://www.tianqiapi.com/free/day?
  // appid=75437651&appsecret=Pf48jMz8&unescape=1

  let result = {}
  const searchRequest = httpFetch(
    `https://www.tianqiapi.com/free/day?unescape=1
      &appid=${appid}&appsecret=${appsecret}`,
    { method: 'get' }
  )
  const resp = await searchRequest.promise
  if (resp.statusCode === 200) {
    result = resp.body
  }
  return result
}

// 查询网易疫情统计接口
export async function getYiQing163() {
  let result = {}
  const searchRequest = httpFetch(
    'https://c.m.163.com/ug/api/wuhan/app/data/list-total',
    {
      method: 'get',
      headers: {
        // 'User-Agent':
        //   'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
        //   '(KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
        origin: 'https://wp.m.163.com'
      }
    }
  )
  const resp = await searchRequest.promise
  if (resp.body.code === 10000) {
    result = resp.body.data
    delete result['areaTree']
  }
  return result
}
