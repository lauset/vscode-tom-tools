/* eslint-disable */
const testMode = false // 为true时可以在浏览器打开不报错
// vscode webview 网页和普通网页的唯一区别：多了一个acquireVsCodeApi方法
const vscode = testMode ? {} : acquireVsCodeApi()
const callbacks = {}

/**
 * 调用vscode原生api
 * @param data 可以是类似 {cmd: 'xxx', param1: 'xxx'}，也可以直接是 cmd 字符串
 * @param cb 可选的回调函数
 */
function callVscode(data, cb) {
  if (typeof data === 'string') {
    data = { cmd: data }
  }
  if (cb) {
    // 时间戳加上5位随机数
    const cbid = `${Date.now()}${Math.round(Math.random() * 100000)}`
    callbacks[cbid] = cb
    data.cbid = cbid
  }
  vscode.postMessage(data)
}

window.addEventListener('message', (event) => {
  const message = event.data
  switch (message.cmd) {
    case 'vscodeTTCallback':
      console.log('vscodeTTCallback', message.data)
        ; (callbacks[message.cbid] || function () { })(message.data)
      delete callbacks[message.cbid]
      break;
    default:
      break
  }
})

new Vue({
  el: '#app-weather',
  data: {
    projectName: '加载中',
    urlsConfig: {},
    urlsAllList: [],
    urlsList: [],
    localFlag: false, 
    addFlag: true,
    addUrls: {},
    delData: {},
    searchData: {
      pageNo: 1,
      pageSize: 5,
      total: 0,
      page: 0,
    }
  },
  created() {
    let loading = document.getElementById('loader-outer')
    if (loading != null) {
      document.body.removeChild(loading)
    }
  },
  mounted() {
    callVscode(
      { cmd: "getUrlsConfig", key: "" },
      urlsConfig => {
        this.urlsConfig = urlsConfig
      }
    );
    callVscode(
      { cmd: "getMenuList", key: "" },
      urlsList => {
        if (urlsList?.length) {
          this.urlsAllList = urlsList
          this.searchData.total = urlsList.length
          this.searchData.page = Math.ceil(urlsList.length / this.searchData.pageSize)
          this.urlsList = this.urlsPage(
            this.searchData.pageNo, 
            this.searchData.pageSize, 
            urlsList)
        }
      }
    );
    // this.error('ERROR，哈哈')
  },
  watch: {
    urlsConfig: {
      handler: function() {
        if (this.urlsConfig.urlsEnabled &&
          this.urlsConfig.urlsPath && 
          this.urlsConfig.urlsFile) {
            this.localFlag = true
          } else {
            this.localFlag = false
          }
      },
      deep: true
    }
  },
  methods: {
    alert(info) {
      callVscode({ cmd: 'alert', info }, null)
    },
    // 弹出错误提示
    error(info) {
      callVscode({ cmd: 'error', info }, null)
    },
    openFileInFinder() {
      callVscode({ cmd: 'openFileInFinder', file: '' },
      resp => {
        if (resp.code === 200) {
          this.alert(resp.message)
        }
      })
    },
    openFileInVscode() {
      callVscode({ cmd: 'openFileInVscode', text: 'list' }, 
      resp => {
        if (resp.code === 200) {
          this.alert(resp.message)
        }
      })
    },
    openUrlInBrowser() {
      callVscode(
        { cmd: 'openUrlInBrowser', url: 'https://github.com/lauset/vscode-tom-tools' },
        () => {
          this.alert('打开成功！')
        })
    },
    refreshTree() {
      callVscode({ cmd: 'refreshTree' }, null)
    },
    // 分页
    changePage(pageNo) {
      let currentPage = this.searchData.pageNo
      if (pageNo == 0) {
        // 查询下一页
        currentPage++
      } else {
        currentPage = pageNo
      }
      this.searchData.pageNo = currentPage
      this.urlsList = this.urlsPage(currentPage, this.searchData.pageSize, this.urlsAllList)
    },
    urlsPage(pageNo, pageSize, array) {
      let offset = (pageNo - 1) * pageSize
      return (offset + pageSize >= array.length) ? 
        array.slice(offset, array.length) : 
        array.slice(offset, offset + pageSize)
    },
    // 新增与删除
    addOpen() {
      this.addUrls = {
        "id": 0,
        "isUrl": true,
        "state": 3,
        "name": "Baidu",
        "url": "https://www.baidu.com/",
        "type": "Documents",
        "tag": "",
        "tags": [
          "tools",
          "docs"
        ]
      }
      this.addUrls.tag = this.addUrls.tags.join(',')
    },
    saveUrls() {
      this.addUrls.tags = this.addUrls.tag.split(',')
      callVscode({ cmd: 'addUrlsData', data: this.addUrls }, 
      resp => {
        if (resp.code === 200) {
          this.urlsAllList.push(this.addUrls)
          this.changePage(this.searchData.pageNo)
        }
        this.alert(resp.message)
        this.refreshTree()
      })
    },
    setDelData(data) {
      this.delData = data
    },
    delUrls(data) {
      data = this.delData
      callVscode({ cmd: 'delUrlsData', data }, 
      resp => {
        if (resp.code === 200) {
          for (let i = 0; i < this.urlsAllList.length; i++){
            if (this.urlsAllList[i].id == data.id){
              this.urlsAllList.splice(i, 1)
            }
          }
          this.changePage(this.searchData.pageNo)
        } 
        this.alert(resp.message)
        this.refreshTree()
      })
    }
  }
})
