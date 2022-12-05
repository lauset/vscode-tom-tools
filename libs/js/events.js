const testMode = false // 为true时可以在浏览器打开不报错
const callbacks = {}
const vscodeapi = testMode ? {} : acquireVsCodeApi()

/**
 * 调用vscode原生api
 *
 * @param data 可以是类似 {cmd: 'showInfo', param1: 'msg1'}，也可以直接是 cmd 字符串
 * @param cb 可选的回调函数
 */
function callVscode(data, cb) {
  if (typeof data === 'string') data = { cmd: data }
  if (cb) {
    // 时间戳加上5位随机数
    const cbid = `${Date.now()}${Math.round(Math.random() * 100000)}`
    callbacks[cbid] = cb
    data.cbid = cbid
  }
  data.type = 'vscodeTTCall'
  vscodeapi.postMessage(data)
}

function info(info, options) {
  callVscode({ cmd: 'info', info, options }, null)
}
function warn(info, options) {
  callVscode({ cmd: 'warn', info, options }, null)
}
function error(info, options) {
  callVscode({ cmd: 'error', info, options }, null)
}

/**
 * 监听vscode回调
 */
window.addEventListener('message', (event) => {
  const message = event.data
  switch (message.type) {
    case 'vscodeTTCallback': {
      // console.log('vscodeTTCallback', message.data)
        ; (callbacks[message.cbid] || function () { })(message.data)
      delete callbacks[message.cbid]
      break
    }
  }
})
