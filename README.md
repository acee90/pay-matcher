# Pay Matcher

로컬에서 두 개의 엑셀 파일을 읽어 입금 매칭을 돕는 Electron 데스크톱 앱입니다.

## 시작하기

```bash
npm install
npm run dev
```

## 실행 파일 만들기

플랫폼별로 별도 패키지를 생성합니다.

```bash
# macOS: .dmg 및 .zip
npm run package:mac

# Windows: 설치 프로그램(.exe) 및 포터블 실행 파일
npm run package:win
```

macOS 빌드는 현재 실행 중인 Mac의 아키텍처를 기준으로 생성됩니다. Windows 빌드는 Windows 환경 또는 CI에서 실행하는 것을 권장합니다.

## 현재 스캐폴드 범위

- Electron 메인 프로세스와 React 렌더러 분리
- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` 보안 기본값
- 파일 선택 및 IPC 브리지
- ExcelJS로 첫 워크시트의 데이터 행 수 읽기
- 매칭 결과 요약 화면과 결과 저장 IPC 자리

다음 구현 단계에서는 입력 열 매핑, 이름 정규화, 금액 기준 후보 생성, 확정/검토/미매칭 상태와 결과 엑셀 서식을 연결합니다.
