export const DIAGNOSIS_QUESTIONS = [
  {
    id: 'age',
    text: '본인의 나이가 9세 이상 39세 이하에 해당하나요?',
    positiveLabel: '네, 해당돼요',
    negativeLabel: '아니요, 해당하지 않아요',
    failReason: '가족돌봄청년 지원은 보통 만 9세 이상 39세 이하를 기준으로 살펴봅니다.',
  },
  {
    id: 'seoul',
    text: '본인이 현재 서울시에 주민등록을 두고 거주하고 있나요?',
    positiveLabel: '네, 서울에 살고 있어요',
    negativeLabel: '아니요, 다른 지역에 살아요',
    failReason: '서울시 사업은 거주지가 서울인 경우를 우선 대상으로 합니다.',
  },
  {
    id: 'dailyDifficulty',
    text: '돌봄 받는 사람이 장애, 정신·신체의 질병으로 혼자 일상생활 하는데 어려움이 있나요? (필요 시 질병명이 확인 가능한 진단서 또는 의사소견서를 제출하여야 하며, 독립적인 일상생활이 불가능하거나 곤란함이 명시되어야 해요)',
    positiveLabel: '네, 일상생활에 큰 어려움이 있으세요',
    negativeLabel: '아니요, 혼자서 일상생활이 가능하세요',
    failReason: '돌봄 대상자의 일상생활 어려움 여부가 주요 확인 조건입니다.',
  },
  {
    id: 'legalFamily',
    text: '돌봄 받는 사람이 민법상 가족에 해당하나요? (부모·조부모·형제자매·배우자·배우자의 부모·형제자매 등을 포함해요)',
    positiveLabel: '네, 안내된 가족에 해당해요',
    negativeLabel: '아니요, 해당하지 않아요',
    failReason: '대상 사업은 주로 민법상 가족 돌봄 상황을 기준으로 합니다.',
  },
  {
    id: 'careResponsibility',
    text: '본인이 가족 돌봄(직접 돌봄 또는 생계 책임)을 행하고 있나요?',
    positiveLabel: '네, 직접 챙기고 있어요',
    negativeLabel: '아니요, 직접 하진 않아요',
    failReason: '직접 돌봄 또는 생계 책임이 있는지가 중요한 판단 기준입니다.',
  },
  {
    id: 'lifeDifficulty',
    text: '본인은 가족 돌봄으로 인해 경제적 어려움, 학업 및 진로 또는 생계활동 유지의 어려움, 개인생활의 제한, 문화·여가활동의 제한 등을 겪고 있나요?',
    positiveLabel: '네, 여러모로 포기해야 하는 것들이 있어요',
    negativeLabel: '아니요, 아직은 감당할 수 있어요',
    failReason: '돌봄으로 인해 본인의 삶에 어려움이 생겼는지도 함께 확인합니다.',
  },
]

export const REQUIRED_DIAGNOSIS_IDS = DIAGNOSIS_QUESTIONS.map((question) => question.id)
