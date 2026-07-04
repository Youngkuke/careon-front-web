export const DIAGNOSIS_QUESTIONS = [
  {
    id: 'age',
    text: '현재 만 9세 이상 39세 이하인가요?',
    positiveLabel: '네, 해당돼요',
    negativeLabel: '아니요',
    failReason: '가족돌봄청년 지원은 보통 만 9세 이상 39세 이하를 기준으로 살펴봅니다.',
  },
  {
    id: 'seoul',
    text: '현재 서울시에 살고 있나요?',
    positiveLabel: '서울시에 살아요',
    negativeLabel: '아니요',
    failReason: '서울시 사업은 거주지가 서울인 경우를 우선 대상으로 합니다.',
  },
  {
    id: 'dailyDifficulty',
    text: '돌봄이 필요한 가족이 일상생활에 어려움을 겪고 있나요?',
    positiveLabel: '네, 도움이 필요해요',
    negativeLabel: '아니요',
    failReason: '돌봄 대상자의 일상생활 어려움 여부가 주요 확인 조건입니다.',
  },
  {
    id: 'legalFamily',
    text: '돌보고 있는 분은 민법상 가족에 해당하나요?',
    positiveLabel: '네, 가족이에요',
    negativeLabel: '아니요',
    failReason: '대상 사업은 주로 민법상 가족 돌봄 상황을 기준으로 합니다.',
  },
  {
    id: 'careResponsibility',
    text: '직접 돌봄을 하거나 생계를 함께 책임지고 있나요?',
    positiveLabel: '네, 제가 맡고 있어요',
    negativeLabel: '아니요',
    failReason: '직접 돌봄 또는 생계 책임이 있는지가 중요한 판단 기준입니다.',
  },
  {
    id: 'lifeDifficulty',
    text: '돌봄 때문에 학업, 일, 건강, 생활에 어려움을 겪고 있나요?',
    positiveLabel: '네, 영향이 있어요',
    negativeLabel: '아니요',
    failReason: '돌봄으로 인해 본인의 삶에 어려움이 생겼는지도 함께 확인합니다.',
  },
]

export const REQUIRED_DIAGNOSIS_IDS = DIAGNOSIS_QUESTIONS.map((question) => question.id)
