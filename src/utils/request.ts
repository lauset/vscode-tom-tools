import * as needle from 'needle'
// import progress from 'request-progress'
// import { requestMsg } from './message'
// import { deflateRaw, InputType } from 'zlib'
// import { getProxyInfo } from './index'
// import fs from 'fs'

const debugRequest = true
const requestMsg = {
  fail: '请求异常😮，可以多试几次',
  unachievable: '哦No😱...接口无法访问了！',
  timeout: '请求超时',
  notConnectNetwork: '无法连接到服务器',
  cancelRequest: '取消http请求'
}
const defaultHeaders = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
}

// var proxyUrl = "http://" + user + ":" + password + "@" + host + ":" + port;
// var proxiedRequest = request.defaults({'proxy': proxyUrl});

const request = (url: string, options: any, callback: any) => {
  let data
  if (options.body) {
    data = options.body
  } else if (options.form) {
    data = options.form
    // data.content_type = 'application/x-www-form-urlencoded'
    options.json = false
  } else if (options.formData) {
    data = options.formData
    // data.content_type = 'multipart/form-data'
    options.json = false
  }
  options.response_timeout = options.timeout
  const nrequest: any = needle.request(
    options.method || 'get',
    url,
    data,
    options,
    (err, resp, body) => {
      if (!err) {
        body = resp.body = resp.raw.toString()
        try {
          resp.body = JSON.parse(resp.body)
        } catch (_) {}
        body = resp.body
      }
      callback(err, resp, body)
    }
  )
  return nrequest.request
}

/**
 * promise 形式的请求方法
 * @param {*} url
 * @param {*} options
 */
const buildHttpPromose = (url: string, options: any) => {
  const obj: any = {
    isCancelled: false
  }
  obj.promise = new Promise((resolve, reject) => {
    obj.cancelFn = reject
    debugRequest && console.log(`-----pro    url] ${url}`)
    fetchData(
      url,
      options.method,
      options,
      (err: any, resp: any, body: any) => {
        // options.isShowProgress && window.api.hideProgress()
        debugRequest && console.log('-----pro   body]', body)
        obj.requestObj = null
        obj.cancelFn = null
        if (err) return reject(err)
        resolve(resp)
      }
    ).then((ro) => {
      obj.requestObj = ro
      if (obj.isCancelled) obj.cancelHttp()
    })
  })
  obj.cancelHttp = () => {
    if (!obj.requestObj) return (obj.isCancelled = true)
    cancelHttp(obj.requestObj)
    obj.requestObj = null
    obj.promise = obj.cancelHttp = null
    obj.cancelFn(new Error(requestMsg.cancelRequest))
    obj.cancelFn = null
  }
  return obj
}

/**
 * 请求超时自动重试
 * @param {*} url
 * @param {*} options
 */
export const httpFetch = (url: string, options: any = { method: 'get' }) => {
  const requestObj = buildHttpPromose(url, options)
  requestObj.promise = requestObj.promise.catch((err: any) => {
    console.log('-----FetchError]', err)
    if (err.message === 'socket hang up') {
      return Promise.reject(new Error(requestMsg.unachievable))
    }
    switch (err.code) {
      case 'TIMEDOUT':
      case 'SOCKETTIMEDOUT':
        return Promise.reject(new Error(requestMsg.timeout))
      case 'NOTFOUND':
        return Promise.reject(new Error(requestMsg.notConnectNetwork))
      default:
        return Promise.reject(err)
    }
  })
  return requestObj
}

/**
 * 取消请求
 * @param {*} index
 */
export const cancelHttp = (requestObj: any) => {
  // console.log(requestObj)
  if (!requestObj) return
  // console.log('cancel:', requestObj)
  if (!requestObj.abort) return
  requestObj.abort()
}

/**
 * http 请求
 * @param {*} url 地址
 * @param {*} options 选项
 * @param {*} cb 回调
 * @return {Number} index 用于取消请求
 */
export const http = (url: string, options: any, cb: any) => {
  if (typeof options === 'function') {
    cb = options
    options = {}
  }
  // 默认选项
  if (options.method == null) options.method = 'get'
  debugRequest && console.log(`-----http   url] ${url}`)
  return fetchData(
    url,
    options.method,
    options,
    (err: any, resp: any, body: any) => {
      // options.isShowProgress && window.api.hideProgress()
      debugRequest && console.log('-----http  body]', body)
      if (err) {
        debugRequest && console.log(JSON.stringify(err))
      }
      cb(err, resp, body)
    }
  )
}

/**
 * http get 请求
 * @param {*} url 地址
 * @param {*} options 选项
 * @param {*} callback 回调
 * @return {Number} index 用于取消请求
 */
export const httpGet = (url: string, options: any, callback: any) => {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  // options.isShowProgress && window.api.showProgress({
  //   title: options.progressMsg || '请求中',
  //   modal: true,
  // })

  debugRequest && console.log(`-----get    url] ${url}`)
  return fetchData(
    url,
    'get',
    options,
    function (err: any, resp: any, body: any) {
      // options.isShowProgress && window.api.hideProgress()
      debugRequest && console.log('-----get   body]', body)
      if (err) {
        debugRequest && console.log(JSON.stringify(err))
      }
      callback(err, resp, body)
    }
  )
}

/**
 * http post 请求
 * @param {*} url 请求地址
 * @param {*} data 提交的数据
 * @param {*} options 选项
 * @param {*} callback 回调
 * @return {Number} index 用于取消请求
 */
export const httpPost = (
  url: string,
  data: any,
  options: any,
  callback: any
) => {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  options.data = data

  // options.isShowProgress && window.api.showProgress({
  //   title: options.progressMsg || '请求中',
  //   modal: true,
  // })

  debugRequest && console.log(`-----post   url] ${url}`)
  return fetchData(
    url,
    'post',
    options,
    function (err: any, resp: any, body: any) {
      // options.isShowProgress && window.api.hideProgress()
      debugRequest && console.log('-----post  body]', body)
      if (err) {
        debugRequest && console.log(JSON.stringify(err))
      }
      callback(err, resp, body)
    }
  )
}

/**
 * http jsonp 请求
 * @param {*} url 请求地址
 * @param {*} options 选项
 *             options.jsonpCallback 回调
 * @param {*} callback 回调
 * @return {Number} index 用于取消请求
 */
export const httpJsonp = (url: string, options: any, callback: any) => {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  const jsonpCallback = 'jsonpCallback'
  if (url.indexOf('?') < 0) url += '?'
  url += `&${options.jsonpCallback}=${jsonpCallback}`
  options.format = 'script'

  // options.isShowProgress && window.api.showProgress({
  //   title: options.progressMsg || '请求中',
  //   modal: true,
  // })

  debugRequest && console.log(`-----jsonp  url] ${url}`)
  return fetchData(
    url,
    'get',
    options,
    function (err: any, resp: any, body: any) {
      // options.isShowProgress && window.api.hideProgress()
      debugRequest && console.log('-----jsonp body]', body)
      if (err) {
        debugRequest && console.log(JSON.stringify(err))
      } else {
        body = JSON.parse(
          body.replace(new RegExp(`^${jsonpCallback}\\(({.*})\\)$`), '$1')
        )
      }

      callback(err, resp, body)
    }
  )
}

// const handleDeflateRaw = (data: any) =>
//   new Promise((resolve, reject) => {
//     deflateRaw(data, (err, buf) => {
//       if (err) return reject(err)
//       resolve(buf)
//     })
//   })

const regx = /(?:\d\w)+/g

const fetchData = async (
  url: string,
  method: string,
  {
    headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) ' +
        'Gecko/20100101 Firefox/94.0'
    },
    format = 'json',
    timeout = 15000,
    ...options
  },
  callback: any
) => {
  headers = Object.assign({}, headers)
  debugRequest && console.log('-----start     ]', url)
  debugRequest && console.log('-----headers   ]', headers)
  debugRequest && console.log('-----options   ]', options)
  return request(
    url,
    {
      ...options,
      method,
      headers: Object.assign({}, defaultHeaders, headers),
      timeout,
      //   proxy: getProxyInfo(),
      json: format === 'json'
    },
    (err: any, resp: any, body: any) => {
      if (err) return callback(err, null)
      callback(null, resp, body)
    }
  )
}
