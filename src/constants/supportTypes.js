export const SUPPORT_TYPES = [
  {
    id: 'living',
    label: '생계 · 주거 지원',
    shortLabel: '생계·주거',
    description: '생활비, 주거비, 긴급 지원처럼 당장 숨통을 틔우는 제도',
  },
  {
    id: 'care',
    label: '돌봄 · 가사 지원',
    shortLabel: '돌봄·가사',
    description: '가족 돌봄, 병원 동행, 가사 부담을 나눠주는 서비스',
  },
  {
    id: 'medical',
    label: '의료 · 건강 지원',
    shortLabel: '의료·건강',
    description: '치료비, 건강관리, 재활과 병원 이용을 돕는 지원',
  },
  {
    id: 'mental',
    label: '심리 · 청년 특화',
    shortLabel: '심리·청년',
    description: '상담, 진로, 학업, 자립 준비를 함께 보는 청년 맞춤 지원',
  },
]

export const SUPPORT_TYPE_MAP = SUPPORT_TYPES.reduce((map, type) => {
  map[type.id] = type
  return map
}, {})
