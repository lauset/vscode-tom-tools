/* eslint-disable no-undef */
const { createApp, reactive, onMounted, watch } = Vue

const app = {
  setup() {
    const data = reactive({
      alllist: [],
      list: [],
      ids: [],
      config: {},
      reloadFlag: true,
      localFlag: false,
      addFlag: true,
      addUrls: {},
      delData: {}
    })

    const searchData = reactive({
      pageNo: 1,
      pageSize: 5,
      total: 0,
      page: 0
    })

    watch(
      () => data.config,
      (newValue, _oldValue) => {
        if (
          newValue.enabled &&
          newValue.path &&
          newValue.file
        ) {
          data.localFlag = true
        } else {
          data.localFlag = false
        }
      },
      { deep: true }
    )
    
    const setQuickPath = (data) => {
      const url = data.url || '%s'
      const name = data.name
      callVscode(
        {
          cmd: 'vsUpdateConfig',
          key: 'tomtools.search.url',
          value: url,
          entry: 'search'
        }, (resp) => {
          if (resp.code === 0) 
            info(`快速搜索已设置为【${name}】`, { modal: true })
        }
      )
    }

    const addOpen = () => {
      data.addUrls = {
        id: 1,
        isDefault: false,
        enabled: false,
        name: '百度',
        desc: '百度一下，你就知道',
        url: 'https://www.baidu.com/s?wd=%s',
        icon: ''
      }
    }

    const saveUrls = () => {
      const addUrls = JSON.parse(JSON.stringify(data.addUrls))
      const id = addUrls.id
      if (data.ids.includes(id)) {
        error(`ID (${id}) 已存在`, { modal: true })
        return
      }
      callVscode({ cmd: 'vsAddSearch', data: addUrls }, (resp) => {
        if (resp.code === 200) {
          data.alllist.push(addUrls)
          data.ids.push(id)
          setPageSize(data.alllist)
          changePage(searchData.pageNo)
        }
        info(resp.message, { modal: true })
      })
    }

    const setDelData = (d) => {
      data.delData = d
    }

    const delUrls = (d) => {
      d = JSON.parse(JSON.stringify(data.delData))
      const id = d.id
      callVscode({ cmd: 'vsDelSearch', data: d }, (resp) => {
        if (resp.code === 200) {
          for (let i = 0; i < data.alllist.length; i++) {
            if (data.alllist[i].id == id) {
              data.alllist.splice(i, 1)
            }
          }
          data.ids.splice(data.ids.indexOf(id), 1)
          setPageSize(data.alllist)
          changePage(searchData.pageNo)
        }
        info(resp.message, { modal: true })
      })
    }

    const updateConfig = (enabled) => {
      data.reloadFlag = false
      callVscode(
        {
          cmd: 'vsUpdateConfig',
          key: 'tomtools.search.enabled',
          value: enabled,
          entry: 'search'
        }
      )
      setTimeout(() => {
        initData()
        data.reloadFlag = true
      }, 800)
    }

    const initData = () => {
      data.config = {}
      data.alllist = []
      data.list = []
      data.ids = []
      callVscode({ cmd: 'vsGetSearchConfig' }, (resp) => {
        data.config = resp
      })
      callVscode({ cmd: 'vsGetSearchList' }, (urlsList) => {
        if (urlsList?.length) {
          data.alllist = urlsList
          data.ids = urlsList.map((url) => url.id)
          setPageSize(urlsList)
          data.list = urlsPage(
            searchData.pageNo,
            searchData.pageSize,
            urlsList
          )
        }
      })
    }

    const changePage = (pageNo) => {
      let currentPage = searchData.pageNo
      if (pageNo == 0) {
        currentPage++
      } else {
        currentPage = pageNo
      }
      searchData.pageNo = currentPage
      data.list = urlsPage(
        currentPage,
        searchData.pageSize,
        data.alllist
      )
    }

    const setPageSize = (list) => {
      searchData.total = list.length
      searchData.page = Math.ceil(
        list.length / searchData.pageSize
      )
    }

    const urlsPage = (pageNo, pageSize, array) => {
      const offset = (pageNo - 1) * pageSize
      return offset + pageSize >= array.length
        ? array.slice(offset, array.length)
        : array.slice(offset, offset + pageSize)
    }

    const openFileInFinder = () => {
      callVscode({ cmd: 'openFileInFinder', entry: 'search' }, (_resp) => {
        // if (resp.code === 200) info(resp.message)
      })
    }

    const openFileInVscode = () => {
      callVscode(
        { cmd: 'openFileInVscode', entry: 'search', text: 'list' },
        (_resp) => {
          // if (resp.code === 200) info(resp.message)
        }
      )
    }

    const openUrlInBrowser = (url) => {
      if (!url) url = 'https://github.com/lauset/vscode-tom-tools'
      callVscode({ cmd: 'openUrlInBrowser', url })
    }

    onMounted(() => {
      initData()
    })

    return {
      data,
      searchData,
      setQuickPath,
      addOpen,
      saveUrls,
      setDelData,
      delUrls,
      changePage,
      updateConfig,
      openFileInFinder,
      openFileInVscode,
      openUrlInBrowser 
    }
  }
}

createApp(app).mount('#app-search')
