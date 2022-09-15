/* eslint-disable no-undef */

const ctx = document.getElementById('weaChart').getContext('2d')

let LineChart

const maxTemp = []
const minTemp = []
const labelTemp = []

function resetTemp() {
  maxTemp.splice(0, maxTemp.length)
  minTemp.splice(0, minTemp.length)
  labelTemp.splice(0, labelTemp.length)
}

function handleSeven(resp) {
  resetTemp()
  const { nums, cityid, city, data } = resp
  data.forEach((d) => {
    labelTemp.push(d.date.substring(5))
    maxTemp.push(d.tem_day)
    minTemp.push(d.tem_night)
  })
  LineChart = new Chart(
    ctx,
    getSevenOptions({
      maxTemp,
      minTemp,
      labelTemp
    })
  )
}

function handleNow(resp) {
  const { city, date, week, wea, tem, win, air, pressure, humidity } = resp
  const nowCity = document.getElementById('now-city')
  const nowTem = document.getElementById('now-tem')
  const nowWea = document.getElementById('now-wea')
  const nowWin = document.getElementById('now-win')
  const nowWeek = document.getElementById('now-week')
  nowCity.innerText = city
  nowTem.innerText = `${tem} ℃`
  nowWea.innerText = wea
  nowWin.innerText = win
  nowWeek.innerText = week
}

function handleYQ163(resp) {
  const { chinaTotal, chinaDayList, lastUpdateTime, overseaLastUpdateTime } =
    resp

  const { today, total, extData } = chinaTotal
  /**
   * data.chinaTotal
   *
   * 现有确诊 total.confirm - total.heal
   *
   * 累计确诊 total.confirm
   *
   * 累计治愈 total.heal
   * 新增治愈 today.heal
   *
   * 累计死亡 total.dead
   * 新增死亡 today.dead
   *
   * 累计境外 total.input
   * 新增境外 today.input
   *
   * 现有无症状 extData.noSymptom
   * 新增无症状 extData.incrNoSymptom
   */
  const yqInput = document.getElementById('yq-input')
  const yqNo = document.getElementById('yq-no')
  const yqHeal = document.getElementById('yq-heal')
  const yqDead = document.getElementById('yq-dead')
  const yqConfirm = document.getElementById('yq-confirm')
  const yqStore = document.getElementById('yq-store')

  yqInput.innerText = total.input
  yqNo.innerText = extData.noSymptom
  yqHeal.innerText = total.heal
  yqDead.innerText = total.dead
  yqConfirm.innerText = total.confirm
  yqStore.innerText = total.confirm - total.heal

  const yqInputAdd = document.getElementById('yq-input-add')
  const yqNoAdd = document.getElementById('yq-no-add')
  const yqHealAdd = document.getElementById('yq-heal-add')
  const yqDeadAdd = document.getElementById('yq-dead-add')
  // const yqConfirmAdd = document.getElementById('yq-confirm-add')
  // const yqStoreAdd = document.getElementById('yq-store-add')

  yqInputAdd.innerText = `+ ${today.input}`
  yqNoAdd.innerText = `+ ${extData.incrNoSymptom}`
  yqHealAdd.innerText = `+ ${today.heal}`
  yqDeadAdd.innerText = `+ ${today.dead}`
  // yqConfirmAdd.innerText = total.confirm
  // yqStoreAdd.innerText = total.confirm - total.heal
}

function handleData(resp) {
  if (resp.now) {
    handleNow(resp.now)
  }
  if (resp.seven) {
    handleSeven(resp.seven)
  }
  if (resp.yq163) {
    handleYQ163(resp.yq163)
  }
  setTimeout(() => {
    const loader = document.getElementById('loader-outer')
    loader.style.display = 'none'
  }, 500)
}

function initData() {
  callVscode({ cmd: 'vsGetWeaData' }, (resp) => {
    handleData(resp)
  })
}

function getSevenOptions({ maxTemp, minTemp, labelTemp }) {
  const commonOptions = {
    borderJoinStyle: 'round',
    cubicInterpolationMode: 'monotone',
    pointStyle: 'rectRot',
    pointRadius: 3,
    pointHoverRadius: 9
  }
  const data = {
    labels: labelTemp,
    datasets: [
      {
        label: 'Max',
        data: maxTemp,
        borderColor: '#ff6384',
        backgroundColor: '#ffb0c1',
        ...commonOptions
      },
      {
        label: 'Min',
        data: minTemp,
        borderColor: '#36a2eb',
        backgroundColor: '#9ad0f5',
        ...commonOptions
      }
    ]
  }
  const config = {
    type: 'line',
    data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: '七日温度'
        }
      }
    }
  }
  return config
}

function weaChartResize(w, h) {
  // console.log(w, h)
}

(function () {
  initData()
  // handleData(res)
})()
