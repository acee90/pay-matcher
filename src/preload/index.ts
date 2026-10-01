import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronApi, InputKind, MatchSummary, SelectedFile } from '../shared/types'

const api: ElectronApi = {
  selectExcelFile: (kind: InputKind) => ipcRenderer.invoke('files:select-excel', kind),
  runMatching: (files: { receivables: SelectedFile; deposits: SelectedFile }) =>
    ipcRenderer.invoke('matching:run', files),
  saveResult: (summary: MatchSummary) => ipcRenderer.invoke('files:save-result', summary)
}

contextBridge.exposeInMainWorld('api', api)
