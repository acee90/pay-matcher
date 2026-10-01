export type InputKind = 'receivables' | 'deposits'

export interface SelectedFile {
  kind: InputKind
  path: string
  name: string
}

export interface MatchSummary {
  totalReceivables: number
  totalDeposits: number
  autoMatched: number
  needsReview: number
  unmatched: number
  message: string
}

export interface ElectronApi {
  selectExcelFile: (kind: InputKind) => Promise<SelectedFile | null>
  runMatching: (files: {
    receivables: SelectedFile
    deposits: SelectedFile
  }) => Promise<MatchSummary>
  saveResult: (summary: MatchSummary) => Promise<string | null>
}
