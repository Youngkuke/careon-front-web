export const SUPPORT_TYPES = [
  {
    id: 'living',
    apiId: 1,
    label: '생계 · 주거 지원',
    shortLabel: '생계·주거',
    description: '돌봄 때문에 생활이 어려워진 부분을 도와드려요',
  },
  {
    id: 'care',
    apiId: 2,
    label: '돌봄 · 가사 지원',
    shortLabel: '돌봄·가사',
    description: '혼자 감당하는 돌봄을 함께 나눌 수 있어요',
  },
  {
    id: 'medical',
    apiId: 3,
    label: '의료 · 건강 지원',
    shortLabel: '의료·건강',
    description: '돌보는 분과 본인의 건강을 챙길 수 있어요',
  },
  {
    id: 'mental',
    apiId: 4,
    label: '심리 · 청년 특화',
    shortLabel: '심리·청년',
    description: '나의 삶을 되찾을 수 있어요',
  },
]

export const SUPPORT_TYPE_MAP = SUPPORT_TYPES.reduce((map, type) => {
  map[type.id] = type
  return map
}, {})
