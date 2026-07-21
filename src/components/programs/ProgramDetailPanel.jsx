import { useState } from 'react'
import { SUPPORT_TYPE_MAP } from '../../constants/supportTypes'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'

const DOCUMENT_GUIDES = {
  신분증: {
    description: '주민등록증, 운전면허증, 여권처럼 본인을 확인할 수 있는 서류를 준비해 주세요.',
    steps: [
      '실물 신분증을 촬영하거나 스캔해 온라인 신청 파일로 준비해 주세요.',
      '분실했거나 재발급이 필요하다면 정부24에서 주민등록증 재발급 신청을 확인할 수 있어요.',
    ],
    linkLabel: '정부24 열기',
    url: 'https://www.gov.kr',
  },
  가족관계증명서: {
    description: '가족관계를 확인하기 위한 기본 서류예요. 온라인으로 발급받아 PDF로 저장할 수 있어요.',
    steps: [
      '대한민국 법원 전자가족관계등록시스템에 접속해 본인 인증을 진행해 주세요.',
      '증명서 종류에서 가족관계증명서를 선택하고 제출처 요구에 맞춰 일반/상세 여부를 확인해 주세요.',
    ],
    linkLabel: '전자가족관계등록시스템 열기',
    url: 'https://efamily.scourt.go.kr',
  },
  '가족관계 확인 서류': {
    description: '가족관계를 확인할 수 있는 가족관계증명서 또는 주민등록등본 계열 서류를 준비해 주세요.',
    steps: [
      '가족관계증명서는 전자가족관계등록시스템에서 발급할 수 있어요.',
      '주민등록등본이 필요한 경우 정부24에서 온라인 발급을 확인해 주세요.',
    ],
    linkLabel: '정부24 열기',
    url: 'https://www.gov.kr',
  },
  '진료비 영수증': {
    description: '병원에서 실제 납부한 진료비를 확인하는 서류예요.',
    steps: [
      '진료받은 병원 원무과 또는 수납 창구에 진료비 영수증 발급을 요청해 주세요.',
      '온라인 병원 앱이 있다면 증명서/서류 발급 메뉴에서도 받을 수 있어요.',
    ],
  },
  '진료비 세부내역서': {
    description: '진료비 항목별 금액을 확인하는 서류로, 의료비 지원 심사에서 자주 필요해요.',
    steps: [
      '진료받은 병원 원무과에 진료비 세부내역서 발급을 요청해 주세요.',
      '입원, 외래, 약제비 등 필요한 기간이 있다면 신청 전 기간을 함께 확인해 주세요.',
    ],
  },
  '통장 사본': {
    description: '지원금 지급 계좌를 확인하기 위한 서류예요.',
    steps: [
      '사용 중인 은행 앱 또는 인터넷뱅킹에서 통장사본 저장/출력 메뉴를 찾아 주세요.',
      '예금주 이름과 계좌번호가 잘 보이는 파일로 준비하면 좋아요.',
    ],
  },
  신청서: {
    description: '해당 제도 신청에 필요한 기본 양식이에요.',
    steps: [
      '공식 신청 페이지나 주민센터에서 최신 신청서를 받아 작성해 주세요.',
      '온라인 신청이라면 입력한 내용이 신청서로 자동 생성되는 경우도 있어요.',
    ],
    linkLabel: '제도 공식 페이지 열기',
    url: 'program',
  },
  '소득 확인 자료': {
    description: '소득 기준 확인을 위해 필요한 서류예요.',
    steps: [
      '건강보험료 납부확인서, 소득금액증명 등 제도에서 요구하는 항목을 확인해 주세요.',
      '정부24나 국민건강보험에서 필요한 증명서 발급 메뉴를 찾을 수 있어요.',
    ],
    linkLabel: '정부24 열기',
    url: 'https://www.gov.kr',
  },
  '소득 및 재산 확인 자료': {
    description: '가구의 소득과 재산 기준을 확인하기 위한 서류예요.',
    steps: [
      '건강보험료 납부확인서, 소득금액증명, 재산 관련 자료 중 안내받은 항목을 준비해 주세요.',
      '발급 가능한 서류는 정부24 또는 국민건강보험 홈페이지에서 확인할 수 있어요.',
    ],
    linkLabel: '정부24 열기',
    url: 'https://www.gov.kr',
  },
  '건강 상태 확인 서류': {
    description: '돌봄이나 간병 필요성을 보여주는 진단서, 소견서, 장기요양 관련 서류예요.',
    steps: [
      '진료받은 병원이나 기관에 현재 건강 상태를 확인할 수 있는 서류 발급을 요청해 주세요.',
      '제출처에서 요구하는 발급일 기준이 있을 수 있으니 신청 전 확인해 주세요.',
    ],
  },
  '돌봄 상황 확인 자료': {
    description: '가족을 실제로 돌보고 있다는 상황을 설명하거나 증명하는 자료예요.',
    steps: [
      '진단서, 장기요양 인정서, 돌봄 일정표, 상담 기록 등 상황을 보여줄 수 있는 자료를 모아 주세요.',
      '정해진 양식이 있는 경우 담당 기관 안내에 맞춰 작성하는 것이 좋아요.',
    ],
  },
  '위기 사유 확인 서류': {
    description: '긴급 지원이 필요한 사유를 확인하는 자료예요.',
    steps: [
      '실직, 휴폐업, 질병, 화재 등 위기 상황을 설명할 수 있는 증빙을 준비해 주세요.',
      '정확한 인정 서류는 관할 시군구청이나 보건복지상담센터 안내를 확인해 주세요.',
    ],
  },
  임대차계약서: {
    description: '현재 거주 중인 집의 계약 내용을 확인하는 서류예요.',
    steps: [
      '임대인과 체결한 계약서 원본을 촬영하거나 스캔해 주세요.',
      '주소, 임대료, 계약 기간, 임대인/임차인 정보가 잘 보이도록 준비해 주세요.',
    ],
  },
  '월세 이체 증빙': {
    description: '실제로 월세를 납부했다는 기록을 확인하는 자료예요.',
    steps: [
      '은행 앱이나 인터넷뱅킹에서 월세 이체 내역을 조회해 주세요.',
      '이체 날짜, 금액, 받는 사람 정보가 보이도록 PDF 저장 또는 캡처해 주세요.',
    ],
  },
  '우선순위 증빙 서류': {
    description: '제도별 우선 지원 대상에 해당하는지 확인하는 서류예요.',
    steps: [
      '지역 공고문에서 우선순위 항목과 필요한 증빙을 먼저 확인해 주세요.',
      '해당되는 항목이 있다면 공식 신청 페이지 안내에 맞춰 서류를 준비해 주세요.',
    ],
    linkLabel: '제도 공식 페이지 열기',
    url: 'program',
  },
}

const getDocumentGuide = (document, program) => {
  const guide = DOCUMENT_GUIDES[document] || {
    description: `${document}는 이 제도 신청 과정에서 확인이 필요한 서류예요.`,
    steps: [
      program.documentGuide,
      '제출처마다 인정되는 서류 형식이 다를 수 있으니 신청 전 공식 안내를 확인해 주세요.',
    ].filter(Boolean),
    linkLabel: '제도 공식 페이지 열기',
    url: 'program',
  }

  return {
    ...guide,
    url: guide.url === 'program' ? program.url : guide.url,
  }
}

export function ProgramDetailPanel({ program, saved, user, onBack, onSave }) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)

  if (!program) return null

  const rows = [
    ['지원 기간', program.period],
    ['신청 방법', program.method],
    ['신청 기간', program.deadline],
    ['결과 발표일', program.resultTime],
    ['문의처', program.agency],
  ]
  const selectedDocumentGuide = selectedDocument ? getDocumentGuide(selectedDocument, program) : null

  const handleSaveClick = () => {
    if (saved) {
      setShowCancelConfirm(true)
      return
    }

    onSave(program.id)
  }

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false)
    onSave(program.id)
  }

  return (
    <article className="detail-panel">
      <div className="detail-panel__topbar">
        <Button variant="ghost" size="small" onClick={onBack}>
          ← 목록으로
        </Button>
        {saved ? <span className="detail-panel__saved">알림 저장됨</span> : null}
      </div>
      <header className="detail-panel__title">
        <div className="detail-panel__badges">
          <span>{SUPPORT_TYPE_MAP[program.type]?.label}</span>
          <span>{program.status}</span>
        </div>
        <h1>{program.title}</h1>
        <p>{program.agency}</p>
      </header>
      <p className="detail-panel__summary">{program.summary}</p>
      <dl className="detail-list">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <section className="detail-section">
        <h2>필요 서류</h2>
        <div className="detail-document-list">
          {program.documents.map((document) => (
            <button
              className="detail-document-card"
              type="button"
              key={document}
              aria-haspopup="dialog"
              onClick={() => setSelectedDocument(document)}
            >
              <strong>{document}</strong>
              <span>발급 방법 보기</span>
            </button>
          ))}
        </div>
      </section>
      {selectedDocumentGuide ? (
        <div className="document-guide-backdrop" role="presentation" onClick={() => setSelectedDocument(null)}>
          <section
            className="document-guide-dialog"
            role="dialog"
            aria-labelledby="document-guide-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="document-guide-dialog__header">
              <span>서류 발급 안내</span>
              <h2 id="document-guide-title">{selectedDocument}</h2>
            </div>
            <p>{selectedDocumentGuide.description}</p>
            <ol>
              {selectedDocumentGuide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="document-guide-dialog__actions">
              {selectedDocumentGuide.url ? (
                <a href={selectedDocumentGuide.url} target="_blank" rel="noreferrer">
                  {selectedDocumentGuide.linkLabel || '공식 링크 열기'}
                </a>
              ) : null}
              <Button variant="secondary" size="small" onClick={() => setSelectedDocument(null)}>
                닫기
              </Button>
            </div>
          </section>
        </div>
      ) : null}
      <div className="detail-panel__actions">
        <Button className={`detail-save-button ${saved ? 'is-saved' : ''}`} disabled={!user} onClick={handleSaveClick}>
          {saved ? '마감일 알림 받는 중' : '마감일 알림 받기'}
        </Button>
        {!user ? <span className="detail-login-note">로그인 후 마감일 알림을 받을 수 있어요.</span> : null}
        <a className="detail-official-link" href={program.url} target="_blank" rel="noreferrer">
          공식 사이트 열기
        </a>
      </div>
      <Modal
        open={showCancelConfirm}
        title="마감일 알림을 끌까요?"
        primaryLabel="계속 받을게요"
        secondaryLabel="알림 끄기"
        className="save-cancel-modal"
        onPrimary={() => setShowCancelConfirm(false)}
        onSecondary={handleConfirmCancel}
      >
        <p>
          <strong>{program.title}</strong>의 알림이 저장 목록에서 사라져요.
        </p>
        <p>필요해지면 언제든 다시 저장해서 마감일 알림을 받을 수 있어요.</p>
      </Modal>
    </article>
  )
}
