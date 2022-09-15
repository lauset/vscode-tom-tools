

/**
 * 全局日志开关，发布时可以注释掉日志输出
 */
function log(...args: any[]) {
  console.log(...args)
}
/**
 * 全局日志开关，发布时可以注释掉日志输出
 */
function error(...args: any[]) {
  console.error(...args)
}

export {
  log, error
}