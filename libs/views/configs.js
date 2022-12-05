/* eslint-disable no-undef */

function openDoc() {
  callVscode({ cmd: 'vsExecuteCommand', command: 'tt.doc' })
}

function openSearch() {
  callVscode({ cmd: 'vsExecuteCommand', command: 'tt.search' })
}

function openWelcome() {
  callVscode({ cmd: 'vsExecuteCommand', command: 'tt.welcome' }) 
}

function openMenu() {
  callVscode({ cmd: 'vsExecuteCommand', command: 'tt.menu' })  
}

function saveConfig() {
  const domInput = document.getElementById('welcomePath')
  const domCheck = document.getElementById('welcomeEnabled')
  const path = domInput.value
  const enabled = domCheck.checked
  let code1 = 500
  let code2 = 500
  callVscode({ 
    cmd: 'vsUpdateConfig',
    key: 'tomtools.welcome.enabled',
    value: enabled
  }, (resp) => {
    code1 = resp.code
  })  
  callVscode({ 
    cmd: 'vsUpdateConfig',
    key: 'tomtools.welcome.url',
    value: path
  }, (resp) => {
    code2 = resp.code
  })
  setTimeout(() => {
    if (code1 === 0 && code2 === 0) info('保存成功', { modal: true })
  }, 500)
}

function initData() {
  const domInput = document.getElementById('welcomePath')
  const domCheck = document.getElementById('welcomeEnabled')
  callVscode({ cmd: 'vsGetWelcomeConfig' }, 
    (resp) => {
      const { enabled, path } = resp
      domInput.value = path
      domCheck.checked = enabled
    })  
}

(function(){
  initData()
})()