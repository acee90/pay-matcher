import { useState } from 'react'
import type { MatchSummary, SelectedFile } from '../../shared/types'

const initialSummary: MatchSummary = {
  totalReceivables: 0,
  totalDeposits: 0,
  autoMatched: 0,
  needsReview: 0,
  unmatched: 0,
  message: '두 파일을 선택하면 준비가 완료됩니다.'
}

function FileCard({
  kind,
  label,
  description,
  file,
  onSelect
}: {
  kind: 'receivables' | 'deposits'
  label: string
  description: string
  file: SelectedFile | null
  onSelect: (kind: 'receivables' | 'deposits') => void
}) {
  return (
    <section className="file-card">
      <div className="file-card-heading">
        <div className={`file-icon ${kind}`}>{kind === 'receivables' ? '청' : '입'}</div>
        <div>
          <h2>{label}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className={`file-drop ${file ? 'selected' : ''}`}>
        {file ? (
          <>
            <span className="status-dot" />
            <span className="file-name" title={file.path}>{file.name}</span>
            <button className="text-button" onClick={() => onSelect(kind)}>변경</button>
          </>
        ) : (
          <button className="select-button" onClick={() => onSelect(kind)}>
            파일 선택 <span>→</span>
          </button>
        )}
      </div>
    </section>
  )
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  )
}

export default function App() {
  const [receivables, setReceivables] = useState<SelectedFile | null>(null)
  const [deposits, setDeposits] = useState<SelectedFile | null>(null)
  const [summary, setSummary] = useState<MatchSummary>(initialSummary)
  const [isRunning, setIsRunning] = useState(false)
  const [savedPath, setSavedPath] = useState<string | null>(null)

  const selectFile = async (kind: 'receivables' | 'deposits') => {
    const file = await window.api.selectExcelFile(kind)
    if (!file) return
    if (kind === 'receivables') setReceivables(file)
    else setDeposits(file)
    setSavedPath(null)
  }

  const run = async () => {
    if (!receivables || !deposits) return
    setIsRunning(true)
    setSavedPath(null)
    try {
      setSummary(await window.api.runMatching({ receivables, deposits }))
    } finally {
      setIsRunning(false)
    }
  }

  const save = async () => {
    const path = await window.api.saveResult(summary)
    if (path) setSavedPath(path)
  }

  const ready = Boolean(receivables && deposits)

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">P</div>
        <div>
          <div className="brand-name">Pay Matcher</div>
          <div className="brand-caption">로컬 입금 매칭 도구</div>
        </div>
        <div className="privacy-badge"><span /> 모든 데이터는 이 컴퓨터에만 저장됩니다</div>
      </header>

      <div className="content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">MATCHING WORKSPACE</p>
            <h1>이번 달 입금 매칭</h1>
            <p className="intro">받아야 할 금액과 실제 입금 내역을 불러오면, 확실한 건 자동으로 연결하고 검토가 필요한 건 따로 표시합니다.</p>
          </div>
          <div className="step-pill"><b>01</b><span>파일 준비</span><i /> <b className={ready ? 'active' : ''}>02</b><span>매칭 실행</span></div>
        </div>

        <div className="file-grid">
          <FileCard kind="receivables" label="받아야 할 요청서" description="기업별 청구 금액이 있는 엑셀 파일" file={receivables} onSelect={selectFile} />
          <FileCard kind="deposits" label="계좌이체 내역서" description="실제로 입금된 거래 내역이 있는 엑셀 파일" file={deposits} onSelect={selectFile} />
        </div>

        <div className="action-row">
          <span className={`ready-message ${ready ? 'visible' : ''}`}>{ready ? '두 파일이 준비되었습니다.' : '엑셀 파일 2개를 선택해주세요.'}</span>
          <button className="primary-button" disabled={!ready || isRunning} onClick={run}>{isRunning ? '읽는 중…' : '매칭 시작'} <span>→</span></button>
        </div>

        <section className="result-panel">
          <div className="result-header">
            <div><p className="eyebrow">RESULT OVERVIEW</p><h2>매칭 결과</h2></div>
            <button className="outline-button" disabled={!summary.totalReceivables && !summary.totalDeposits} onClick={save}>결과 엑셀 저장</button>
          </div>
          <div className="metrics">
            <Metric label="받아야 할 건" value={summary.totalReceivables} />
            <Metric label="입금 거래" value={summary.totalDeposits} />
            <Metric label="자동 매칭" value={summary.autoMatched} tone="green" />
            <Metric label="검토 필요" value={summary.needsReview} tone="yellow" />
            <Metric label="미매칭" value={summary.unmatched} tone="red" />
          </div>
          <div className="result-note"><span className="note-icon">i</span><span>{savedPath ? `저장 완료: ${savedPath}` : summary.message}</span></div>
        </section>
      </div>

      <footer><span>v0.1.0 · 초기 스캐폴드</span><span>ExcelJS 매칭 엔진 연결 예정</span></footer>
    </main>
  )
}
