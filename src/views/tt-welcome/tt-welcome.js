/* eslint-disable */
/**
 * 需要使用js和ts格式化选项
 * 确保 callVscode 中 cb 参数形式为 show => this.show = show
 */
const testMode = true // 为true时可以在浏览器打开不报错
// vscode webview 网页和普通网页的唯一区别：多了一个acquireVsCodeApi方法
const vscode = testMode ? {
  postMessage: (d) => {
    console.log(d)
  }
} : acquireVsCodeApi()
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
      ;(callbacks[message.cbid] || function () {})(message.data)
      delete callbacks[message.cbid]
      break
    default:
      break
  }
})

const App = {
  data() {
    return {
      drawer: false,
      userName: '',
      time: '',
      show: null,
      loadingYiq: true,
      loadingWea: true,
      loadingChart: true,
      tianQiSeven: {},
      tianQiNow: {},
      yiQing163: {
        lastUpdateTime: '',
        chinaTotal: {
          today: {
            confirm: 0,
            dead: 0,
            heal: 0,
          },
          total: {
            confirm: 0,
            dead: 0,
            heal: 0,
          },
        },
      },
      chartData: {
        columns: ['日期', '最高气温', '最低气温'],
        rows: [],
      },
    }
  },
  mounted() {
    let self = this
    self.time = self.getTime()
    // callVscode(
    //   { cmd: 'getConfig', key: 'tomtools.owner' },
    //   (userName) => (self.userName = userName)
    // )
    // callVscode(
    //   { cmd: 'getConfig', key: 'tomtools.welcome' },
    //   (show) => (self.show = show)
    // )
    // callVscode({ cmd: 'getYiQing163', key: 'k163' }, (yiQing163) => {
    //   self.yiQing163 = yiQing163
    //   self.loadingYiq = false
    // })
    // callVscode({ cmd: 'getTianQiNow', key: 'k165' }, (tianQiNow) => {
    //   self.tianQiNow = tianQiNow
    //   self.loadingWea = false
    // })
  },
  watch: {
    show(nv, ov) {
      callVscode({ cmd: 'setConfig', key: 'tomtools.welcome.enabled', value: nv }, null)
    },
  },
  created() {
    let self= this
    // callVscode({ cmd: 'getTianQiSeven', key: 'k164' }, (tianQiSeven) => {
    //   self.tianQiSeven = tianQiSeven
    //   self.getChartData(tianQiSeven)
    // })
  },
  methods: {
    toggleShowTip() {
      this.show = !this.show
    },
    getTime() {
      const hour = new Date().getHours()
      if (hour <= 8) return '早上'
      else if (hour < 12) return '上午'
      else if (hour < 14) return '中午'
      else if (hour < 18) return '下午'
      return '晚上'
    },
    getChartData(e) {
      let data = e.data
      let rows = []
      data.forEach((d, i) => {
        rows.push({
          日期: d.date,
          最高气温: d.tem_day,
          最低气温: d.tem_night,
        })
      })
      this.chartData.rows = rows
      setTimeout(() => {
        this.loadingChart = false
      }, 1000)
    },
  },
}
const app = Vue.createApp(App)
app.use(ElementPlus)
app.mount('#app')

// new Vue({
//   el: "#app",
//   components: { VeLine },
//   data: {
//     userName: "",
//     time: "",
//     show: null,
//     loadingYiq: true,
//     loadingWea: true,
//     loadingChart: true,
//     tianQiSeven: {},
//     tianQiNow: {},
//     yiQing163: {
//       lastUpdateTime: '',
//       chinaTotal: {
//         today: {
//           confirm: 0,
//           dead: 0,
//           heal: 0
//         },
//         total: {
//           confirm: 0,
//           dead: 0,
//           heal: 0
//         }
//       }
//     },
//     chartData: {
//       columns: ['日期', '最高气温', '最低气温'],
//       rows: []
//     }
//   },
//   mounted() {
//     this.time = this.getTime()
//     callVscode(
//       { cmd: "getConfig", key: "tomtools.owner" },
//       userName => this.userName = userName
//     );
//     callVscode(
//       { cmd: "getConfig", key: "tomtools.welcome" },
//       show => this.show = show
//     );
//     callVscode(
//       { cmd: "getYiQing163", key: "k163" },
//       yiQing163 => {
//         this.yiQing163 = yiQing163
//         this.loadingYiq = false
//       }
//     );
//     callVscode(
//       { cmd: "getTianQiNow", key: "k165" },
//       tianQiNow => {
//         this.tianQiNow = tianQiNow
//         this.loadingWea = false
//       }
//     );
//   },
//   watch: {
//     show(nv, ov) {
//       callVscode(
//         { cmd: "setConfig", key: "tomtools.welcome", value: nv },
//         null
//       );
//     }
//   },
//   created() {
//     callVscode(
//       { cmd: "getTianQiSeven", key: "k164" },
//       tianQiSeven => {
//         this.tianQiSeven = tianQiSeven
//         this.getChartData(tianQiSeven)
//       }
//     );
//   },
//   methods: {
//     toggleShowTip() {
//       this.show = !this.show;
//     },
//     getTime() {
//       const hour = new Date().getHours();
//       if (hour <= 8) return "早上";
//       else if (hour < 12) return "上午";
//       else if (hour < 14) return "中午";
//       else if (hour < 18) return "下午";
//       return "晚上";
//     },
//     getChartData(e) {
//       let data = e.data
//       let rows = []
//       data.forEach((d, i) => {
//         rows.push({
//           '日期': d.date,
//           '最高气温': d.tem_day,
//           '最低气温': d.tem_night
//         })
//       })
//       this.chartData.rows = rows
//       setTimeout(() => {
//         this.loadingChart = false
//       }, 1000)
//     }
//   },
// });
