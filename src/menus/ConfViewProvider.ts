import * as vscode from 'vscode'
import messageHandler from '../common/events'
import { getWebViewContent } from '../utils/webview'

export class ConfViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView
  constructor(private readonly _extensionUri: vscode.Uri) {}
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(this._extensionUri.fsPath),
        vscode.Uri.joinPath(this._extensionUri, 'libs')
      ]
    }
    const global = { panel: this._view }
    webviewView.webview.html = getWebViewContent(
      {
        extensionPath: this._extensionUri.fsPath,
        extensionUri: this._extensionUri
      },
      'webviews/configs.html'
    )
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.type) {
        case 'vscodeTTCall': {
          if (messageHandler[message.cmd])
            messageHandler[message.cmd](global, message)
          else messageHandler['notFoundCmd'](message.cmd)
          break
        }
      }
    })
  }
}

export class WeaViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView
  constructor(private readonly _extensionUri: vscode.Uri) {}
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    }    
    const global = { panel: this._view }
    webviewView.webview.html = getWebViewContent(
      {
        extensionPath: this._extensionUri.fsPath,
        extensionUri: this._extensionUri
      },
      'webviews/weather.html'
    )
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.type) {
        case 'vscodeTTCall': {
          if (messageHandler[message.cmd])
            messageHandler[message.cmd](global, message)
          else messageHandler['notFoundCmd'](message.cmd)
          break
        }
      }
    })
  }
}
