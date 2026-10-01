import ExcelJS from 'exceljs'
import type { MatchSummary, SelectedFile } from '../../shared/types'

async function countRows(file: SelectedFile): Promise<number> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(file.path)
  const worksheet = workbook.worksheets[0]
  return worksheet ? Math.max(worksheet.rowCount - 1, 0) : 0
}

/**
 * Matching engine entry point.
 *
 * The workbook loading is already wired here so the next step can add the
 * column mapping and confidence-scored matching rules without changing the UI
 * or IPC contract.
 */
export async function runMatching(
  receivables: SelectedFile,
  deposits: SelectedFile
): Promise<MatchSummary> {
  const [totalReceivables, totalDeposits] = await Promise.all([
    countRows(receivables),
    countRows(deposits)
  ])

  return {
    totalReceivables,
    totalDeposits,
    autoMatched: 0,
    needsReview: 0,
    unmatched: totalReceivables,
    message: '엑셀 파일을 읽었습니다. 다음 단계에서 매칭 규칙을 연결합니다.'
  }
}

export async function saveSummaryWorkbook(
  filePath: string,
  summary: MatchSummary
): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  const overview = workbook.addWorksheet('매칭 요약')
  overview.columns = [
    { header: '항목', key: 'label', width: 24 },
    { header: '건수', key: 'value', width: 14 }
  ]
  overview.addRows([
    { label: '받아야 할 건', value: summary.totalReceivables },
    { label: '입금 거래', value: summary.totalDeposits },
    { label: '자동 매칭', value: summary.autoMatched },
    { label: '검토 필요', value: summary.needsReview },
    { label: '미매칭', value: summary.unmatched }
  ])
  overview.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  overview.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B4840' } }

  const results = workbook.addWorksheet('매칭 결과')
  results.columns = [
    { header: '상태', key: 'status', width: 16 },
    { header: '기업명', key: 'company', width: 24 },
    { header: '입금자명', key: 'payer', width: 24 },
    { header: '금액', key: 'amount', width: 16 },
    { header: '매칭 근거', key: 'reason', width: 36 }
  ]
  results.addRow({
    status: '스캐폴드',
    company: '',
    payer: '',
    amount: '',
    reason: '다음 단계에서 매칭 규칙과 결과 행을 연결합니다.'
  })
  results.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  results.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B4840' } }
  await workbook.xlsx.writeFile(filePath)
}
