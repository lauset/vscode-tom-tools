/* eslint-disable no-undef */

new Vue({
  el: '#app-doclist',
  data: {
    projectName: '加载中',
    reloadFlag: true,
    urlsConfig: {},
    urlsAllList: [],
    urlsList: [],
    urlsIds: [],
    urlText: '网链（例如：https://www.github.com）',
    localFlag: false,
    addFlag: true,
    addUrls: {},
    delData: {},
    searchData: {
      pageNo: 1,
      pageSize: 5,
      total: 0,
      page: 0
    }
  },
  mounted() {
    this.initData()
    // const loading = document.getElementById('loader-outer')
    // if (loading != null) {
    //   document.body.removeChild(loading)
    // }
  },
  watch: {
    urlsConfig: {
      handler() {
        if (
          this.urlsConfig.enabled &&
          this.urlsConfig.path &&
          this.urlsConfig.file
        ) {
          this.localFlag = true
        } else {
          this.localFlag = false
        }
      },
      deep: true
    },
    addUrls: {
      handler() {
        if (this.addUrls.type === 'Commands') {
          this.urlText = '命令（例如：tt.welcome）'
        } else {
          this.urlText = '网链（例如：https://www.github.com）'
        }
      },
      deep: true
    }
  },
  methods: {
    updateConfig(enabled) {
      this.reloadFlag = false
      callVscode(
        {
          cmd: 'vsUpdateConfig',
          key: 'tomtools.urls.enabled',
          value: enabled,
          entry: 'doclist'
        }
      )
      setTimeout(() => {
        this.initData()
        this.reloadFlag = true
      }, 800)
    },
    initData() {
      this.urlsConfig = {}
      this.urlsAllList = []
      this.urlsList = []
      this.urlsIds = [] 
      callVscode({ cmd: 'vsGetDocConfig' }, (resp) => {
        this.urlsConfig = resp
      })
      callVscode({ cmd: 'vsGetDocList' }, (urlsList) => {
        if (urlsList?.length) {
          this.urlsAllList = urlsList
          this.urlsIds = urlsList.map((url) => url.id)
          this.setPageSize(urlsList)
          this.urlsList = this.urlsPage(
            this.searchData.pageNo,
            this.searchData.pageSize,
            urlsList
          )
        }
      })
    },
    openFileInFinder() {
      callVscode({ cmd: 'openFileInFinder', entry: 'doclist' }, (_resp) => {
        // if (resp.code === 200) info(resp.message)
      })
    },
    openFileInVscode() {
      callVscode(
        { cmd: 'openFileInVscode', entry: 'doclist', text: 'list' },
        (_resp) => {
          // if (resp.code === 200) info(resp.message)
        }
      )
    },
    openUrlInBrowser(url) {
      if (!url) url = 'https://github.com/lauset/vscode-tom-tools'
      callVscode({ cmd: 'openUrlInBrowser', url })
    },
    refreshTree() {
      callVscode({ cmd: 'vsRefreshTree' })
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
      this.urlsList = this.urlsPage(
        currentPage,
        this.searchData.pageSize,
        this.urlsAllList
      )
    },
    setPageSize(list) {
      this.searchData.total = list.length
      this.searchData.page = Math.ceil(
        list.length / this.searchData.pageSize
      )
    },
    urlsPage(pageNo, pageSize, array) {
      const offset = (pageNo - 1) * pageSize
      return offset + pageSize >= array.length
        ? array.slice(offset, array.length)
        : array.slice(offset, offset + pageSize)
    },
    // 新增与删除
    addOpen() {
      this.addUrls = {
        id: 0,
        isUrl: true,
        isCmd: false,
        state: 3,
        name: 'VueJS',
        url: 'https://vuejs.org/',
        type: 'Documents',
        tag: '',
        tags: ['tools', 'docs']
      }
      this.addUrls.tag = this.addUrls.tags.join(',')
    },
    saveUrls() {
      const id = this.addUrls.id
      const tag = this.addUrls.tag
      if (this.urlsIds.includes(id)) {
        error(`ID (${id}) 已存在`, { modal: true })
        return
      }
      {
        this.addUrls.tags = this.addUrls.tag.split(',')
        delete this.addUrls.tag
      }
      if (this.addUrls.type === 'Commands') {
        delete this.addUrls.isUrl
        this.addUrls.isCmd = true
      } else {
        delete this.addUrls.isCmd
      }
      callVscode({ cmd: 'vsAddDoc', data: this.addUrls }, (resp) => {
        if (resp.code === 200) {
          this.urlsAllList.push(this.addUrls)
          this.urlsIds.push(id)
          this.setPageSize(this.urlsAllList)
          this.changePage(this.searchData.pageNo)
        }
        this.addUrls.tag = tag
        info(resp.message, { modal: true })
        this.refreshTree()
      })
    },
    setDelData(data) {
      this.delData = data
    },
    delUrls(data) {
      data = this.delData
      const id = data.id
      callVscode({ cmd: 'vsDelDoc', data }, (resp) => {
        if (resp.code === 200) {
          for (let i = 0; i < this.urlsAllList.length; i++) {
            if (this.urlsAllList[i].id == id) {
              this.urlsAllList.splice(i, 1)
            }
          }
          this.urlsIds.splice(this.urlsIds.indexOf(id), 1)
          this.setPageSize(this.urlsAllList)
          this.changePage(this.searchData.pageNo)
        }
        info(resp.message, { modal: true })
        this.refreshTree()
      })
    }
  }
})
