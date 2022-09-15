import * as vscode from 'vscode'

function showInfo(msg: string, opts?) {
  vscode.window.showInformationMessage(msg, opts)
}

function showWarn(msg: string, opts?) {
  vscode.window.showWarningMessage(msg, opts)
}

function showError(msg: string, opts?) {
  vscode.window.showErrorMessage(msg, opts)
}

export { showInfo, showWarn, showError }
