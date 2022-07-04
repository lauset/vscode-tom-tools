import type { ExtensionContext, ViewColumn, WebviewPanel } from 'vscode'
import { window } from 'vscode'
import type { TomHubNode } from '../menus/TomHubNode'
let webviewPanel: WebviewPanel | undefined

export function urlIframe(
  _context: ExtensionContext,
  viewColumn: ViewColumn, // 窗口编辑器
  node: TomHubNode
) {
  if (webviewPanel === undefined) {
    webviewPanel = window.createWebviewPanel(
      `${node.url}`, // 标识
      `${node.name}`, // 面板标题
      viewColumn, // 展示在哪个面板上
      {
        retainContextWhenHidden: true, // 控制是否保持webview面板的内容（iframe），即使面板不再可见。
        enableScripts: true // 下面的 html 页可以使用 Scripts
      }
    )
    webviewPanel.webview.html = getIframeHtml(node.url)
  } else {
    // 如果面板已经存在，重新设置标题
    webviewPanel.title = node.name
    // 重新修改指向的目录
    webviewPanel.webview.html = getIframeHtml(node.url)
    // Webview面板一次只能显示在一列中。如果它已经显示，则此方法将其移动到新列
    webviewPanel.reveal()
  }

  // 关闭该面板将 webviewPanel 置为 undefined
  webviewPanel.onDidDispose(() => {
    webviewPanel = undefined
  })

  return webviewPanel
}

export function getIframeHtml(url: string, elements?: string) {
  if (url) {
    if (url.indexOf('?') > -1) {
      url += '&embedded=true'
    } else {
      url += '?embedded=true'
    }
  }
  if (!elements) elements = ''
  return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
            height: 100%;
          }
          .iframeDiv {
            width: 100%;
            height: 100%;
            border-width: 0;
          }
          .iframe-loader-div {
            width: 50px;
            height: 50px;
            margin: 0 auto;
            position: relative;
            top: 50%;
          }
          .demo3 {
            width: 4px;
            height: 4px;
            border-radius: 2px;
            background: #c4c4c4;
            position: absolute;
            animation: demo3 linear 0.8s infinite;
            -webkit-animation: demo3 linear 0.8s infinite;
          }
          .demo3:nth-child(1){
            left: 24px;
            top: 2px;
            animation-delay:0s;
          }
          .demo3:nth-child(2){
            left: 40px;
            top: 8px;
            animation-delay:0.1s;
          }
          .demo3:nth-child(3){
            left: 47px;
            top: 24px;
            animation-delay:0.1s;
          }
          .demo3:nth-child(4){
            left: 40px;
            top: 40px;
            animation-delay:0.2s;
          }
          .demo3:nth-child(5){
            left: 24px;
            top: 47px;
            animation-delay:0.4s;
          }
          .demo3:nth-child(6){
            left: 8px;
            top: 40px;
            animation-delay:0.5s;
          }
          .demo3:nth-child(7){
            left: 2px;
            top: 24px;
            animation-delay:0.6s;
          }
          .demo3:nth-child(8){
            left: 8px;
            top: 8px;
            animation-delay:0.7s;
          }
          @keyframes demo3
          {
            0%,40%,100% {transform: scale(1);}
            20% {transform: scale(3);}
          }
          @-webkit-keyframes demo3
          {
            0%,40%,100% {transform: scale(1);}
            20% {transform: scale(3);}
          }
        </style>
        </head>
        <body>
          <iframe
            id='iframe1'
            class="iframeDiv"
            src="${url}"
            scrolling="auto"
            onreadystatechange="stateChangeIE(this)"
            onload="stateChangeFirefox(this)"
            style="display:none"
          ></iframe>
          <div id="LoadDiv" class="iframe-loader-div" align="center">
            <div class="demo3"></div>
            <div class="demo3"></div>
            <div class="demo3"></div>
            <div class="demo3"></div>
            <div class="demo3"></div>
            <div class="demo3"></div>
            <div class="demo3"></div>
            <div class="demo3"></div>
          </div>
          <script type="text/javascript">
            function stateChangeIE(_frame) {
              //state: loading, interactive, complete
              if (_frame.readyState == "complete")
              {
                var loader = document.getElementById("LoadDiv");
                loader.style.display = "none";
                _frame.style.visibility = "visible";
                _frame.style.display = "block"
              }
            }
            function stateChangeFirefox(_frame) {
              var loader = document.getElementById("LoadDiv");
              loader.style.display = "none";
              _frame.style.visibility = "visible";
              _frame.style.display = "block"
            }
          </script>
          ${elements}
        </body>
    </html>
    `
}
