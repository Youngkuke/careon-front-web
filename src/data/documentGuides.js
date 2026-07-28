const OFFICIAL_LINKS = {
  government24: 'https://www.gov.kr',
  residentRegistration: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13100000015',
  familyRegistration: 'https://efamily.scourt.go.kr',
  hometax: 'https://www.hometax.go.kr',
  nhis: 'https://www.nhis.or.kr/nhis/index.do',
  incomeCertificate: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=12100000021',
  disabilityCertificate: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=14600000273',
  beneficiary: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=14600000280',
  singleParent: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=10601000001',
  nearPoverty: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13520000098',
  medicalAidCard: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=14600000078&tp_seq=01',
  adoptionFact: 'https://www.ncrc.or.kr/ncrc/na/ntt/selectNttInfo.do?bbsId=1021&mi=1053&nttSn=9089',
  businessRegistrationCertificate: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=12100000016',
}

export const DOCUMENT_ALIASES = {
  '통장 사본': '통장사본',
  '예금통장 사본': '통장사본',
  '주민등록표등본': '주민등록등본',
  '주민등록표 등본': '주민등록등본',
  '가족관계증명서 (일반)': '가족관계증명서',
  '개인정보 동의서': '개인정보동의서',
  '개인정보 수집 이용 동의서': '개인정보동의서',
  '개인정보 수집 이용 제공 동의서': '개인정보동의서',
  '개인정보 수집 이용 및 제공 동의서': '개인정보동의서',
  '금융정보 등 제공동의서': '금융정보 등 제공 동의서',
  '소득 재산 신고서': '소득·재산 신고서',
  소득재산신고서: '소득·재산 신고서',
  '소득 재산신고서': '소득·재산 신고서',
  '한부모가족 증명서': '한부모가족증명서',
  한부모가정증명서: '한부모가족증명서',
  차상위증명서: '차상위계층확인서',
  소득금액증명원: '소득금액증명',
  '소득금액증명원 (세무서 발급)': '소득금액증명',
  '의료급여증 사본': '의료급여증',
  '입양 사실 확인서': '입양사실확인서',
  '사회보장급여 신청(변경)서': '사회보장급여신청서',
  사업자등록증명원: '사업자등록증명',
  '사업자등록 증명원': '사업자등록증명',
}

function compactName(name = '') {
  return String(name)
    .replace(/\.(?:pdf|hwp|hwpx|docx?|xlsx?|pptx?|txt)$/i, '')
    .replace(/[\s·ㆍㆍ·,()[\]{}]/g, '')
    .trim()
}

const compactAliases = Object.fromEntries(
  Object.entries(DOCUMENT_ALIASES).map(([alias, canonical]) => [compactName(alias), canonical]),
)

export function normalizeDocumentName(name) {
  const trimmedName = String(name || '').trim()
  return DOCUMENT_ALIASES[trimmedName] || compactAliases[compactName(trimmedName)] || trimmedName
}

const issueGuide = (displayName, description, issuer, steps, url) => ({
  displayName,
  description,
  issuer,
  preparationType: 'issue',
  steps,
  actionLabel: '온라인 발급하기',
  url,
})

export const DOCUMENT_GUIDES = {
  신분증: {
    displayName: '신분증',
    description: '신청하는 사람이 본인인지 확인하는 자료예요.',
    issuer: '본인이 보관한 주민등록증, 운전면허증 또는 여권',
    preparationType: 'prepare_existing',
    steps: [
      '제출처에서 인정하는 신분증 종류를 확인해요.',
      '실물 신분증을 준비하거나, 온라인 제출이라면 필요한 면이 선명하게 보이도록 촬영해요.',
      '주민등록번호 뒷자리는 제출처 안내가 없으면 가려도 되는지 확인해요.',
    ],
  },
  주민등록등본: issueGuide(
    '주민등록등본',
    '주소와 같은 세대에 등록된 사람을 확인하는 서류예요.',
    '정부24 또는 주민센터',
    [
      '정부24에서 주민등록표 등본 발급을 검색해요.',
      '본인 인증 후 발급할 내용을 확인해요.',
      '온라인으로 발급하거나 주민센터에서 받아요.',
    ],
    OFFICIAL_LINKS.residentRegistration,
  ),
  주민등록초본: issueGuide(
    '주민등록초본',
    '개인의 주소 변동 등 주민등록 사항을 확인하는 서류예요.',
    '정부24 또는 주민센터',
    [
      '정부24에서 주민등록표 초본 발급을 검색해요.',
      '제출처가 요구한 주소 변동 이력 등 표시 항목을 확인해요.',
      '온라인으로 발급하거나 주민센터에서 받아요.',
    ],
    OFFICIAL_LINKS.residentRegistration,
  ),
  가족관계증명서: issueGuide(
    '가족관계증명서',
    '가족관계를 확인하는 법원 발급 서류예요.',
    '대한민국 법원 전자가족관계등록시스템 또는 주민센터',
    [
      '전자가족관계등록시스템에서 본인 인증을 해요.',
      '가족관계증명서를 선택하고 제출처가 요구한 일반·상세 종류를 확인해요.',
      '발급 내용을 확인한 뒤 제출 방식에 맞춰 발급해요.',
    ],
    OFFICIAL_LINKS.familyRegistration,
  ),
  '가족관계증명서(상세)': issueGuide(
    '가족관계증명서(상세)',
    '가족관계를 상세하게 확인하는 법원 발급 서류예요.',
    '대한민국 법원 전자가족관계등록시스템 또는 주민센터',
    [
      '전자가족관계등록시스템에서 본인 인증을 해요.',
      '증명서 종류에서 가족관계증명서와 상세 발급을 선택해요.',
      '제출처가 요구한 대상자와 표시 항목을 확인한 뒤 발급해요.',
    ],
    OFFICIAL_LINKS.familyRegistration,
  ),
  기본증명서: issueGuide(
    '기본증명서',
    '출생·국적 등 개인의 기본 신분 사항을 확인하는 법원 발급 서류예요.',
    '대한민국 법원 전자가족관계등록시스템 또는 주민센터',
    ['전자가족관계등록시스템에서 본인 인증을 해요.', '기본증명서를 선택하고 일반·상세 발급 여부를 확인해요.', '제출처 요구에 맞는 내용으로 발급해요.'],
    OFFICIAL_LINKS.familyRegistration,
  ),
  혼인관계증명서: issueGuide(
    '혼인관계증명서',
    '혼인 관계와 변동 사항을 확인하는 법원 발급 서류예요.',
    '대한민국 법원 전자가족관계등록시스템 또는 주민센터',
    ['전자가족관계등록시스템에서 본인 인증을 해요.', '혼인관계증명서를 선택해 필요한 발급 종류를 확인해요.', '제출처 요구에 맞는 내용으로 발급해요.'],
    OFFICIAL_LINKS.familyRegistration,
  ),
  소득금액증명: issueGuide(
    '소득금액증명',
    '종합소득 등 신고된 소득 금액을 확인하는 국세 증명서예요.',
    '정부24, 국세청 홈택스 또는 세무서',
    ['정부24나 홈택스에서 소득금액증명을 찾아요.', '귀속연도와 제출처를 확인해요.', '본인 인증 후 발급하거나 세무서에서 받아요.'],
    OFFICIAL_LINKS.incomeCertificate,
  ),
  건강보험료납부확인서: issueGuide(
    '건강보험료 납부확인서',
    '건강보험료 납부 내역을 확인하는 서류예요.',
    '국민건강보험공단',
    ['국민건강보험공단 홈페이지에서 보험료 납부확인서를 찾아요.', '제출처가 요구한 기간과 가입자 정보를 확인해요.', '본인 인증 후 발급하거나 지사에서 받아요.'],
    OFFICIAL_LINKS.nhis,
  ),
  건강보험자격득실확인서: issueGuide(
    '건강보험 자격득실확인서',
    '건강보험 가입·상실 이력을 확인하는 서류예요.',
    '국민건강보험공단',
    ['국민건강보험공단 홈페이지에서 자격득실확인서를 찾아요.', '제출처가 요구한 이력 표시 여부를 확인해요.', '본인 인증 후 발급하거나 지사에서 받아요.'],
    OFFICIAL_LINKS.nhis,
  ),
  장애인증명서: issueGuide(
    '장애인증명서',
    '장애인 등록 사실을 확인하는 정부 발급 증명서예요.',
    '정부24 또는 주민센터',
    ['정부24에서 장애인증명서를 검색해요.', '본인 인증 후 제출처와 발급 용도를 확인해요.', '온라인으로 발급하거나 주민센터에서 받아요.'],
    OFFICIAL_LINKS.disabilityCertificate,
  ),
  수급자증명서: issueGuide(
    '수급자증명서',
    '국민기초생활 보장 수급 사실을 확인하는 정부 발급 증명서예요.',
    '정부24 또는 주민센터',
    ['정부24에서 수급자증명서를 검색해요.', '본인 인증 후 제출처와 발급 용도를 확인해요.', '온라인으로 발급하거나 주민센터에서 받아요.'],
    OFFICIAL_LINKS.beneficiary,
  ),
  한부모가족증명서: issueGuide(
    '한부모가족증명서',
    '한부모가족 지원 대상자임을 확인하는 정부 발급 증명서예요.',
    '정부24 또는 주민센터',
    ['정부24에서 한부모가족증명서를 검색해요.', '본인 인증 후 제출처와 발급 용도를 확인해요.', '온라인으로 발급하거나 주민센터에서 받아요.'],
    OFFICIAL_LINKS.singleParent,
  ),
  차상위계층확인서: issueGuide(
    '차상위계층확인서',
    '여러 차상위 자격 중 ‘차상위계층 확인’ 자격을 보유한 대상자임을 확인하는 정부 발급 증명서예요.',
    '정부24 또는 주민센터',
    ['정부24에서 차상위계층확인서를 검색해요.', '내 차상위 자격 유형으로 이 확인서를 발급할 수 있는지 확인해요.', '온라인으로 발급하거나 주민센터에서 받아요.'],
    OFFICIAL_LINKS.nearPoverty,
  ),
  의료급여증: issueGuide(
    '의료급여증',
    '의료급여 수급권자가 의료급여를 받을 때 자격을 확인하는 증명서예요.',
    '정부24 또는 시·군·구',
    ['정부24에서 의료급여증 발급을 검색해요.', '신규·추가·재발급 중 필요한 신청 유형을 확인해요.', '온라인으로 신청하거나 관할 시·군·구에서 발급받아요.'],
    OFFICIAL_LINKS.medicalAidCard,
  ),
  입양사실확인서: {
    displayName: '입양사실확인서',
    description: '입양 사실을 공식적으로 확인하기 위해 발급받는 서류예요.',
    issuer: '아동권리보장원 또는 입양 사실을 확인할 수 있는 관계 기관',
    preparationType: 'request_from_official_agency',
    steps: [
      '제출처에서 입양사실확인서가 필요한지, 법원의 확정증명원으로 대신할 수 있는지 먼저 확인해요.',
      '아동권리보장원의 최신 안내에서 신청 대상과 준비서류를 확인해요.',
      '안내된 방법으로 발급을 신청해요.',
    ],
    actionLabel: '공식 안내 보기',
    url: OFFICIAL_LINKS.adoptionFact,
  },
  통장사본: {
    displayName: '통장사본',
    description: '지원금을 받을 계좌 정보를 확인하는 자료예요.',
    issuer: '사용하는 은행 앱·인터넷뱅킹 또는 영업점',
    preparationType: 'prepare_existing',
    steps: ['사용하는 은행 앱이나 인터넷뱅킹에 접속해요.', '통장사본 또는 계좌개설확인서 메뉴를 찾아요.', '예금주와 계좌번호가 보이도록 저장해요.'],
  },
  개인정보동의서: {
    displayName: '개인정보동의서',
    description: '신청 처리에 필요한 개인정보 수집과 이용에 동의하는 양식이에요.',
    issuer: '온라인 신청 화면 또는 신청기관',
    preparationType: 'download_and_fill',
    steps: ['온라인 신청 화면이나 신청기관에서 양식을 받아요.', '수집 항목과 이용 목적을 확인해요.', '동의 여부와 신청자 정보를 작성해 제출해요.'],
  },
  '금융정보 등 제공 동의서': {
    displayName: '금융정보 등 제공 동의서',
    description: '소득·재산 확인을 위해 금융정보 제공에 동의하는 양식이에요.',
    issuer: '신청기관 또는 온라인 신청 화면',
    preparationType: 'download_and_fill',
    steps: ['신청기관이나 온라인 신청 화면에서 최신 양식을 받아요.', '정보 제공 범위와 이용 목적을 확인해요.', '신청자와 필요한 가구원의 동의를 작성해 제출해요.'],
  },
  신청서: {
    displayName: '신청서',
    description: '이 제도에 지원하기 위해 작성하는 기본 양식이에요.',
    issuer: '제도별 신청기관 또는 공식 신청 화면',
    preparationType: 'download_and_fill',
    steps: ['제도 안내에 있는 최신 신청서를 확인해요.', '신청자 정보와 지원 내용을 빠짐없이 작성해요.', '필요한 첨부자료와 함께 신청 안내에 맞춰 제출해요.'],
  },
  사회보장급여신청서: {
    displayName: '사회보장급여 신청서',
    description: '사회보장급여를 신청할 때 작성하는 공식 양식이에요.',
    issuer: '읍면동 주민센터 또는 제도별 신청기관',
    preparationType: 'download_and_fill',
    steps: ['신청기관에서 최신 양식을 받거나 공식 첨부파일을 확인해요.', '신청자와 가구 정보를 작성해요.', '안내된 필요서류와 함께 제출해요.'],
  },
  '소득·재산 신고서': {
    displayName: '소득·재산 신고서',
    description: '가구의 소득과 재산을 확인하기 위해 작성하는 양식이에요.',
    issuer: '신청기관 또는 공식 신청 화면',
    preparationType: 'download_and_fill',
    steps: ['신청기관에서 최신 양식을 받아요.', '가구원의 소득·재산 항목을 안내에 맞춰 작성해요.', '증빙자료가 필요한 항목을 함께 확인해 제출해요.'],
  },
  진단서: {
    displayName: '진단서',
    description: '질병이나 건강 상태에 대한 의학적 판단을 확인하는 서류예요.',
    issuer: '진료받은 의료기관',
    preparationType: 'request_from_hospital',
    steps: ['진료받은 병원 원무과나 해당 진료과에 진단서 발급을 요청해요.', '제출처가 요구한 진단명, 발급일, 병원급 등 기준을 확인해요.', '발급받은 원본 또는 제출 방법을 신청기관 안내에 맞춰 준비해요.'],
  },
  의사소견서: {
    displayName: '의사소견서',
    description: '현재 상태와 필요한 치료·돌봄 등에 대한 의사의 의견을 확인하는 서류예요.',
    issuer: '진료받은 의료기관',
    preparationType: 'request_from_hospital',
    steps: ['진료받은 병원에 제출처용 소견서 발급을 요청해요.', '제출처가 정한 양식이나 기재 항목이 있는지 먼저 확인해요.', '발급일과 원본 제출 여부를 확인해 준비해요.'],
  },
  임대차계약서: {
    displayName: '임대차계약서',
    description: '현재 거주 중인 집의 계약 내용을 확인하는 자료예요.',
    issuer: '본인이 보관한 계약서',
    preparationType: 'prepare_existing',
    steps: ['임대인과 체결한 계약서 원본을 확인해요.', '주소, 임대료, 계약 기간, 임대인·임차인 정보가 보이도록 준비해요.', '사본 제출 방식은 신청기관 안내를 따라요.'],
  },
  재직증명서: {
    displayName: '재직증명서',
    description: '현재 재직 중인 사실을 확인하는 회사 발급 서류예요.',
    issuer: '재직 중인 회사',
    preparationType: 'request_from_employer',
    steps: ['회사 인사·총무 담당자에게 제출처용 재직증명서 발급을 요청해요.', '제출처가 요구한 재직 기간과 직인 여부를 확인해요.', '발급일 기준이 있다면 신청 직전에 받아요.'],
  },
  재학증명서: {
    displayName: '재학증명서',
    description: '현재 학교에 재학 중인 사실을 확인하는 학교 발급 서류예요.',
    issuer: '재학 중인 학교',
    preparationType: 'request_from_school',
    steps: ['학교 행정실 또는 증명서 발급 시스템에서 재학증명서를 신청해요.', '제출처가 요구한 학년·학과 표시 여부를 확인해요.', '발급일 기준이 있다면 신청 직전에 받아요.'],
  },
  위임장: {
    displayName: '위임장',
    description: '대리인이 신청하거나 서류를 처리할 권한을 확인하는 양식이에요.',
    issuer: '신청기관 또는 제도별 공식 안내',
    preparationType: 'download_and_fill',
    steps: ['신청기관이 지정한 위임장 양식이 있는지 확인해요.', '위임하는 사람과 대리인의 정보를 작성해요.', '신분증 사본 등 함께 필요한 자료를 신청기관 안내에 맞춰 준비해요.'],
  },
  사업자등록증: {
    displayName: '사업자등록증',
    description: '사업자 등록 사실을 확인하는 자료예요.',
    issuer: '본인이 보관한 사업자등록증 또는 세무서',
    preparationType: 'prepare_existing',
    steps: ['보관 중인 사업자등록증을 확인해요.', '제출처가 사업자등록증 사본과 사업자등록증명 중 무엇을 요구하는지 확인해요.', '사업자등록증명을 요구한다면 정부24나 홈택스에서 새로 발급해요.'],
  },
  사업자등록증명: issueGuide(
    '사업자등록증명',
    '현재 사업자 등록 사실과 사업 내용을 증명하는 국세 증명서예요.',
    '정부24, 국세청 홈택스 또는 세무서',
    ['정부24나 홈택스에서 사업자등록증명을 찾아요.', '제출처와 발급 용도를 확인해요.', '본인 인증 후 발급하거나 세무서에서 받아요.'],
    OFFICIAL_LINKS.businessRegistrationCertificate,
  ),
}

const FORM_DOCUMENT_PATTERN = /신청(?:\(변경\))?서|신고서|동의서|위임장|서약서|조사표|계획서|청구서|자가진단표|확약서/

function getFormDocumentGuide() {
  return {
    description: '제도 신청 또는 확인 절차에서 작성하는 양식이에요.',
    issuer: '신청기관 또는 제도별 공식 안내',
    preparationType: 'download_and_fill',
    steps: ['제도 안내에서 최신 양식과 작성 방법을 확인해요.', '신청자 정보와 필요한 내용을 빠짐없이 작성해요.', '다른 필요서류와 함께 신청 안내에 맞춰 제출해요.'],
  }
}

function getTypedDocumentGuide(name) {
  if (FORM_DOCUMENT_PATTERN.test(name)) {
    return getFormDocumentGuide()
  }
  if (/진단서|소견서|진료비|진료기록|처방전|출생증명|사산증명|입퇴원확인|입원확인|진료확인/.test(name)) {
    return {
      description: '의료기관이나 관련 기관에서 발급 또는 확인받아 준비하는 자료예요.',
      issuer: '관련 의료기관 또는 발급 기관',
      preparationType: 'request_from_hospital',
      steps: ['자료를 발급할 기관에 제출처와 필요한 기간을 알려요.', '제출처가 요구한 기재 내용과 발급일 기준을 확인해요.', '발급받은 자료를 신청 안내에 맞춰 제출해요.'],
    }
  }
  if (/재직|경력증명|근로계약|급여명세|급여대장|임금|고용보험|출근부|육아휴직\s*확인|퇴직증명|원천징수/.test(name)) {
    return {
      description: '근무·고용 상태를 확인하기 위해 회사나 관련 기관에서 받는 자료예요.',
      issuer: '재직 중이거나 이전에 근무한 회사 또는 관련 기관',
      preparationType: 'request_from_employer',
      steps: ['회사 담당자나 관련 기관에 제출처용 자료 발급을 요청해요.', '제출처가 요구한 기간과 기재 항목을 확인해요.', '발급일 기준이 있다면 신청 직전에 받아요.'],
    }
  }
  if (/재학|학교|졸업|학력|생활기록|학자금|학생증/.test(name)) {
    return {
      description: '학교 재학·학력 또는 교육 활동을 확인하기 위해 준비하는 자료예요.',
      issuer: '재학·졸업 학교 또는 교육기관',
      preparationType: 'request_from_school',
      steps: ['학교 행정실이나 증명서 발급 시스템에서 필요한 자료를 확인해요.', '제출처가 요구한 학년·학과·발급일 기준을 확인해요.', '발급받은 자료를 신청 안내에 맞춰 제출해요.'],
    }
  }
  if (/통장|계약서|영수증|거래내역|신분증|등록증|카드|고지서/.test(name)) {
    return {
      description: '신청 내용이나 지출·계약 사실을 확인하기 위해 직접 준비하는 자료예요.',
      issuer: '본인이 보관한 자료 또는 해당 발급 기관',
      preparationType: 'prepare_existing',
      steps: ['보관 중인 자료가 제출처 기준에 맞는지 확인해요.', '이름, 날짜, 금액 등 필요한 정보가 보이도록 준비해요.', '사본 또는 원본 제출 방법은 신청기관 안내를 따라요.'],
    }
  }
  return null
}

const fallbackGuide = {
  displayName: '기타 확인서류',
  description: '신청 내용이나 지원 조건을 확인하기 위해 제출하는 자료예요.',
  issuer: '제도별 신청기관 또는 관련 발급 기관',
  preparationType: 'unknown',
  steps: ['제도 상세 안내에서 정확한 서류명과 발급 기준을 확인해요.', '발급일이나 인정 기간이 정해져 있는지 확인해요.', '안내된 신청기관에 제출해요.'],
}

export function getDocumentGuide(document = {}) {
  const name = String(document.name || '').trim()
  const canonicalName = normalizeDocumentName(name)
  const exactGuide = Object.entries(DOCUMENT_GUIDES).find(([guideName]) => (
    compactName(guideName) === compactName(canonicalName)
  ))?.[1]
  const typedGuide = exactGuide ? null : getTypedDocumentGuide(canonicalName)
  const guide = exactGuide || typedGuide || fallbackGuide
  const providedUrl = isTrustedOfficialUrl(document.url) ? document.url : null
  const actionUrl = document.urlType === 'certificate_issuance'
    ? providedUrl || guide.url || null
    : guide.url || providedUrl
  const actionLabel = document.urlType === 'certificate_issuance'
    ? '온라인 발급하기'
    : document.urlType === 'official_guide'
      ? '공식 발급처 보기'
      : guide.actionLabel
        || (guide.preparationType === 'download_and_fill' ? '공식 양식 보기' : '공식 발급처 보기')

  return {
    ...guide,
    displayName: name || guide.displayName,
    actionUrl,
    actionLabel: actionUrl ? actionLabel : null,
  }
}

export function classifyRequiredForm(name = '') {
  if (/규칙|조례|법률|지침|매뉴얼|개정전문|고시|안내서/.test(name)) return 'reference'
  if (/신청서|동의서|서식|양식/.test(name)) return 'application_form'
  return 'attachment'
}

export function isDisplayableRequiredForm(name = '') {
  return Boolean(String(name).trim()) && !/첨부\s*파일\s*없음|첨부파일없음/i.test(name)
}

export function getRequiredFormGuide(form = {}) {
  const name = String(form.name || '').trim()
  const formType = form.formType || classifyRequiredForm(name)
  const actionUrl = isTrustedOfficialUrl(form.url) ? form.url : null
  const guides = {
    application_form: {
      label: '신청 양식 안내',
      description: '이 제도를 신청할 때 작성하는 공식 양식이에요.',
      steps: ['파일을 내려받아 내용을 확인해요.', '신청 안내에 맞춰 작성하고 필요한 서류와 함께 제출해요.'],
      actionLabel: '양식 열기',
    },
    reference: {
      label: '관련 자료 안내',
      description: '제도의 운영 기준과 처리 절차를 설명하는 관련 자료예요. 신청자가 발급받거나 작성해서 제출하는 서류는 아니에요.',
      steps: ['파일을 열어 제도 운영 기준과 안내 내용을 확인해요.', '신청에 필요한 항목은 제도 상세 안내를 함께 확인해요.'],
      actionLabel: '관련 자료 보기',
    },
    attachment: {
      label: '첨부자료 안내',
      description: '제도와 함께 제공되는 첨부자료예요. 신청자가 별도로 발급받아 제출해야 하는 서류인지 여부는 제도 안내를 확인해요.',
      steps: ['파일을 열어 용도와 내용을 확인해요.', '신청에 활용해야 하는 경우 제도 상세 안내에 맞춰 준비해요.'],
      actionLabel: '첨부파일 보기',
    },
  }

  return {
    ...guides[formType],
    displayName: isDisplayableRequiredForm(name) ? name : '관련 첨부자료',
    actionUrl,
  }
}

function isSafeExternalUrl(value) {
  try {
    return ['https:', 'http:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function isTrustedOfficialUrl(value) {
  if (!isSafeExternalUrl(value)) return false

  const hostname = new URL(value).hostname.toLowerCase()
  return hostname === 'gov.kr'
    || hostname.endsWith('.gov.kr')
    || hostname.endsWith('.go.kr')
    || hostname === 'nhis.or.kr'
    || hostname.endsWith('.nhis.or.kr')
    || hostname === 'ncrc.or.kr'
    || hostname.endsWith('.ncrc.or.kr')
}
