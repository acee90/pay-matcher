import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { join } from 'node:path'
import type { InputKind, MatchSummary, SelectedFile } from '../shared/types'
import { runMatching, saveSummaryWorkbook } from './services/matching'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 960,
    minHeight: 680,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  mainWindow.once('ready-to-show', () => mainWindow?.show())

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpc() {
  ipcMain.handle('files:select-excel', async (_event, kind: InputKind) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: kind === 'receivables' ? '받아야 할 요청서 선택' : '계좌이체 내역서 선택',
      properties: ['openFile'],
      filters: [{ name: 'Excel 파일', extensions: ['xlsx', 'xlsm'] }]
    })

    const filePath = result.filePaths[0]
    if (result.canceled || !filePath) return null

    return {
      kind,
      path: filePath,
      name: filePath.split(/[\\/]/).pop() ?? filePath
    } satisfies SelectedFile
  })

  ipcMain.handle(
    'matching:run',
    async (_event, files: { receivables: SelectedFile; deposits: SelectedFile }) =>
      runMatching(files.receivables, files.deposits)
  )

  ipcMain.handle('files:save-result', async (_event, summary: MatchSummary) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: '매칭 결과 저장',
      defaultPath: '입금매칭_결과.xlsx',
      filters: [{ name: 'Excel 파일', extensions: ['xlsx'] }]
    })

    if (result.canceled || !result.filePath) return null
    await saveSummaryWorkbook(result.filePath, summary)
    return result.filePath
  })
}

app.whenReady().then(() => {
  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
