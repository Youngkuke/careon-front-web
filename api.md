# 웹 API 명세

## 공통 규칙

- Base URL은 환경별로 다르며, 문서에는 API path만 표기합니다.
- 인증이 필요한 API는 `Authorization: Bearer {accessToken}` 헤더를 사용합니다.
- 웹 `accessToken` 유효 시간은 6시간입니다. 만료되면 재로그인이 필요합니다.
- 날짜는 별도 표기가 없으면 `YYYY-MM-DD` 형식입니다.
- 빈 목록은 에러가 아니라 `200 OK`와 빈 배열 `[]`로 응답합니다.

### 공통 에러 응답

```json
{
  "timestamp": "2026-07-03T15:49:07.014+09:00",
  "status": 400,
  "error": "Bad Request",
  "message": "에러 메시지",
  "path": "/api/web/..."
}
```

## 엔드포인트 요약

| 분류 | 이름 | Method | Path | 인증 | 상태 |
| --- | --- | --- | --- | --- | --- |
| 유저 관리 | 로그인 | POST | `/api/web/users/login` | 불필요 | 검토 완료 |
| 유저 관리 | 회원가입 | POST | `/api/web/users/register` | 불필요 | 검토 완료 |
| 유저 관리 | 비밀번호 재설정 링크 발송 | POST | `/api/web/users/password/reset-link` | 불필요 | 검토 완료 |
| 유저 관리 | 비밀번호 재설정 | POST | `/api/web/users/password/reset` | 불필요 | 검토 완료 |
| 유저 관리 | 내 정보 조회 | GET | `/api/web/users/me` | 필요 | 검토 완료 |
| 유저 관리 | 회원정보 수정 | PATCH | `/api/web/users/me` | 필요 | 검토 완료 |
| 유저 관리 | 회원 탈퇴 | DELETE | `/api/web/users/me` | 필요 | 검토 완료 |
| 유저 관리 | 앱 설치 상태 응답 | PATCH | `/api/web/users/me/app-install-status` | 필요 | 검토 완료 |
| 유저 관리 | 2단계 진단 완료 처리 | TBD | TBD | 필요 | 검토 전 |
| 제도 관리 | 대안 복지 조회 | GET | `/api/web/policies/alternatives` | 불필요 | 검토 완료 |
| 맞춤 지원 제도 관리 | 맞춤 지원 제도 목록 조회 | GET | `/api/web/policies/matched` | 필요 | 검토 완료 |
| 맞춤 지원 제도 관리 | 제도 상세 조회 | GET | `/api/web/policies/{policyId}` | 불필요 | 검토 완료 |
| 맞춤 지원 제도 관리 | 제도 저장 | POST | `/api/web/users/me/saved-policies` | 필요 | 검토 완료 |
| 맞춤 지원 제도 관리 | 저장한 제도 목록 조회 | GET | `/api/web/users/me/saved-policies` | 필요 | 검토 완료 |
| 맞춤 지원 제도 관리 | 제도 저장 취소 | DELETE | `/api/web/users/me/saved-policies/{savedPolicyId}` | 필요 | 검토 완료 |

## 유저 관리

### 로그인

이메일과 비밀번호로 로그인합니다. 응답의 `diagnosisCompleted` 값에 따라 다음 화면을 결정합니다.

- `diagnosisCompleted: false`: 2단계 자가 진단 페이지로 이동
- `diagnosisCompleted: true`: 맞춤 지원 제도 페이지로 이동

**Request**

`POST /api/web/users/login`

```json
{
  "email": "pjs123@gmail.com",
  "password": "abcd1234!"
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| email | String | Y | 로그인용 이메일 |
| password | String | Y | 로그인용 비밀번호 |

**Response `200 OK`**

```json
{
  "userId": 1,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "diagnosisCompleted": true
}
```

**Errors**

| Status | message | 조건 |
| --- | --- | --- |
| 400 | `이메일과 비밀번호를 입력해주세요.` | 이메일 또는 비밀번호 누락 |
| 401 | `이메일 또는 비밀번호가 일치하지 않습니다.` | 이메일 없음 또는 비밀번호 불일치 |

### 회원가입

웹에서 신규 유저를 생성합니다. 성공 시 자동 로그인 처리를 위해 `accessToken`을 함께 반환합니다.

**Request**

`POST /api/web/users/register`

```json
{
  "name": "영크케",
  "email": "pjs123@gmail.com",
  "password": "abcd1234!",
  "region": "관악구",
  "termsAgreed": true,
  "interestPolicyTypeIds": [1, 3]
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| name | String | Y | 이름 또는 닉네임. 최대 50자 |
| email | String | Y | 이메일. 최대 255자, 중복 불가 |
| password | String | Y | 8~20자, 영문+숫자 포함 |
| region | String | Y | 거주 지역(서울시 구). 최대 20자 |
| termsAgreed | Boolean | Y | 이용약관/개인정보처리방침 동의 여부. `true`만 가능 |
| interestPolicyTypeIds | Integer[] | Y | 관심 제도 유형 ID. 최소 1개, 최대 4개 |

**Response `201 Created`**

```json
{
  "userId": 1,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "diagnosisCompleted": false
}
```

**Errors**

| Status | message | 조건 |
| --- | --- | --- |
| 400 | `모든 항목을 입력해주세요.` | 필수 입력값 누락 |
| 400 | `이메일 형식이 올바르지 않습니다.` | 이메일 형식 오류 |
| 400 | `비밀번호는 영문과 숫자를 포함하여 8~20자여야 합니다.` | 비밀번호 형식 오류 |
| 400 | `이용약관 및 개인정보처리방침에 동의해야 합니다.` | 약관 미동의 |
| 400 | `관심 제도 유형을 1개 이상 선택해주세요.` | 관심 제도 유형 누락 |
| 404 | `존재하지 않는 제도 유형입니다.` | 관심 제도 유형 ID 없음 |
| 409 | `이미 사용 중인 이메일입니다.` | 이메일 중복 |

### 비밀번호 재설정 링크 발송

비밀번호 재설정 링크를 이메일로 발송합니다. 계정 존재 여부 노출을 막기 위해 가입 여부와 무관하게 동일한 성공 응답을 사용합니다.

**Request**

`POST /api/web/users/password/reset-link`

```json
{
  "email": "pjs123@gmail.com"
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| email | String | Y | 가입 시 등록한 이메일 |

**Response `200 OK`**

```json
{
  "message": "비밀번호 재설정을 위해 이메일을 확인해보세요."
}
```

**Errors**

| Status | message | 조건 |
| --- | --- | --- |
| 400 | `이메일을 입력해주세요.` | 이메일 누락 |
| 400 | `이메일 형식이 올바르지 않습니다.` | 이메일 형식 오류 |

### 비밀번호 재설정

이메일 링크에 포함된 `resetToken`과 새 비밀번호로 비밀번호를 재설정합니다. 링크는 발송 후 30분간 유효합니다.

**Request**

`POST /api/web/users/password/reset`

```json
{
  "resetToken": "a1b2c3d4e5f6g7h8",
  "newPassword": "newpass1234!"
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| resetToken | String | Y | 이메일 링크에 담긴 토큰 |
| newPassword | String | Y | 새 비밀번호. 8~20자, 영문+숫자 포함 |

**Response `200 OK`**

```json
{
  "message": "비밀번호가 재설정되었습니다."
}
```

**Errors**

| Status | message | 조건 |
| --- | --- | --- |
| 400 | `잘못된 접근입니다.` | `resetToken` 누락 |
| 400 | `비밀번호는 영문과 숫자를 포함하여 8~20자여야 합니다.` | 새 비밀번호 형식 오류 |
| 400 | `유효하지 않거나 만료된 링크입니다. 다시 시도해주세요.` | 토큰 만료, 무효, 이미 사용됨 |

### 내 정보 조회

로그인한 유저의 프로필과 웹 화면 제어용 상태를 조회합니다.

**Request**

`GET /api/web/users/me`

Request Body 없음.

**Response `200 OK`**

```json
{
  "userId": 1,
  "name": "영크케",
  "email": "pjs123@gmail.com",
  "district": "동작구",
  "diagnosisCompleted": true,
  "appInstalled": false,
  "installPromptCount": 1
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| userId | Integer | 유저 ID |
| name | String | 이름 또는 닉네임 |
| email | String | 이메일 |
| district | String | 거주 지역(서울시 구) |
| diagnosisCompleted | Boolean | 2단계 진단 완료 여부 |
| appInstalled | Boolean | 앱 설치 완료 처리 여부 |
| installPromptCount | Integer | 앱 설치 권유를 미룬 횟수 |

**Errors**

| Status | message | 조건 |
| --- | --- | --- |
| 401 | `로그인이 필요합니다.` | accessToken 없음, 만료, 유효하지 않음 |

### 회원정보 수정

로그인한 유저 본인의 정보를 수정합니다. 모든 필드는 optional이며, 보낸 필드만 수정됩니다.

**Request**

`PATCH /api/web/users/me`

```json
{
  "name": "영크케",
  "email": "pjs123@gmail.com",
  "password": "abcd1234!",
  "region": "관악구"
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| name | String | N | 이름 또는 닉네임. 최대 50자 |
| email | String | N | 이메일. 최대 255자, 본인 제외 중복 불가 |
| password | String | N | 새 비밀번호. 8~20자, 영문+숫자 포함 |
| region | String | N | 거주 지역(서울시 구). 최대 20자 |

**Response `200 OK`**

```json
{
  "message": "회원 정보가 수정되었습니다."
}
```

**Errors**

| Status | message | 조건 |
| --- | --- | --- |
| 400 | `이메일 형식이 올바르지 않습니다.` | 이메일 형식 오류 |
| 400 | `비밀번호는 영문과 숫자를 포함하여 8~20자여야 합니다.` | 비밀번호 형식 오류 |
| 401 | `로그인이 필요합니다.` | 인증 실패 |
| 409 | `이미 사용 중인 이메일입니다.` | 이메일 중복 |

### 회원 탈퇴

로그인한 유저의 계정을 삭제합니다. 저장 제도, 투두, 알림, 관심 유형 연결 데이터도 함께 정리됩니다.

**Request**

`DELETE /api/web/users/me`

Request Body 없음.

**Response `200 OK`**

```json
{
  "message": "회원 탈퇴가 완료되었습니다."
}
```

**Errors**

| Status | message | 조건 |
| --- | --- | --- |
| 401 | `로그인이 필요합니다.` | 인증 실패 |

### 앱 설치 상태 응답

웹의 앱 설치 유도 모달에서 사용자가 선택한 값을 저장합니다.

- `installed: true`: 앱 설치 완료로 기록하고 이후 모달 미노출
- `installed: false`: 설치 권유 횟수 증가. 프론트는 최대 2회까지만 노출

**Request**

`PATCH /api/web/users/me/app-install-status`

```json
{
  "installed": false
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| installed | Boolean | Y | `[설치했어요]`면 `true`, `[나중에 할게요]`면 `false` |

**Response `200 OK`**

```json
{
  "message": "처리되었습니다."
}
```

**Errors**

| Status | message | 조건 |
| --- | --- | --- |
| 400 | `값이 누락되었습니다.` | `installed` 누락 |
| 400 | `값이 올바르지 않습니다.` | Boolean이 아닌 값 |
| 401 | `로그인이 필요합니다.` | 인증 실패 |

### 2단계 진단 완료 처리

상태: 검토 전

아직 Method, Path, 요청/응답 형식이 확정되지 않았습니다.

## 제도 관리

### 대안 복지 조회

가족돌봄청년에 해당하지 않거나, 회원가입/로그인을 나중에 하기로 한 사용자에게 관심 유형에 맞는 대안 복지 목록을 보여줍니다.

- 서버는 `targetCategory`를 별도 파라미터로 받지 않고 `GENERAL`로 고정 조회합니다.
- 로그인 여부와 무관하게 동일한 응답을 반환합니다.
- 저장 여부, D-day 같은 유저별 상태값은 포함하지 않습니다.

**Request**

`GET /api/web/policies/alternatives?interestTypeIds=1,2`

| Query | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| interestTypeIds | String | Y | 관심 유형 ID를 쉼표로 구분한 값. 예: `1,2` |

**Response `200 OK`**

```json
[
  {
    "policyId": 12,
    "name": "보건복지부 일상돌봄서비스",
    "organization": "보건복지부",
    "content": "전국 공통 신청 가능",
    "sourceUrl": "https://..."
  },
  {
    "policyId": 13,
    "name": "국민기초생활보장",
    "organization": "보건복지부",
    "content": "거주지 무관 신청 가능",
    "sourceUrl": "https://..."
  }
]
```

**Errors**

| Status | message | 조건 |
| --- | --- | --- |
| 400 | `조회 조건 (interestTypeIds) 이 필요합니다.` | `interestTypeIds` 누락 |
| 400 | `값이 올바르지 않습니다.` | `interestTypeIds` 형식 오류 |

## 맞춤 지원 제도 관리

### 맞춤 지원 제도 목록 조회

로그인한 유저의 2단계 챗봇 매칭 결과를 바탕으로 가족돌봄청년 전용 제도 목록을 유형별로 그룹핑해 조회합니다.

- 파라미터 없이 로그인한 유저 기준으로 조회합니다.
- 매칭된 제도가 있는 유형만 응답에 포함합니다.
- 매칭된 제도가 없으면 `[]`를 반환합니다.

**Request**

`GET /api/web/policies/matched`

Request Body 없음.

**Response `200 OK`**

```json
[
  {
    "policyTypeId": 2,
    "policyTypeName": "돌봄·가사 지원",
    "policies": [
      {
        "policyId": 12,
        "name": "보건복지부 일상돌봄서비스",
        "organization": "보건복지부",
        "content": "전국 공통 신청 가능",
        "sourceUrl": "https://..."
      }
    ]
  },
  {
    "policyTypeId": 4,
    "policyTypeName": "심리·청년 특화",
    "policies": [
      {
        "policyId": 20,
        "name": "제도명",
        "organization": "주관기관",
        "content": "핵심요약",
        "sourceUrl": "https://..."
      }
    ]
  }
]
```

**Errors**

| Status | message | 조건 |
| --- | --- | --- |
| 401 | `로그인이 필요합니다.` | 인증 실패 |

### 제도 상세 조회

제도 상세 화면에 필요한 정보를 `policyId`로 조회합니다.

**Request**

`GET /api/web/policies/{policyId}`

| Path Variable | 타입 | 설명 |
| --- | --- | --- |
| policyId | Integer | 조회할 제도 ID |

**Response `200 OK`**

```json
{
  "policyId": 5,
  "name": "가족돌봄청년 자기돌봄비 지원",
  "policyType": "돌봄·가사 지원",
  "organization": "서울시",
  "supportPeriod": "2026.01.23 ~ 2026.01.28",
  "selfPayment": "없음",
  "deadline": "2026-01-28",
  "applicationMethod": "서울복지포털에서 온라인 신청",
  "duration": "약 2주 소요",
  "resultDate": "2026-08-15",
  "contact": "02-1234-5678",
  "documents": [
    {
      "documentId": 1,
      "name": "가족관계증명서",
      "issuers": [
        {
          "issuer": "정부24",
          "site": "https://..."
        }
      ]
    }
  ]
}
```

**Errors**

| Status | message | 조건 |
| --- | --- | --- |
| 404 | `존재하지 않는 제도입니다.` | 해당 `policyId` 없음 |

### 제도 저장

제도 상세 화면의 `[마감일 알림 받기]` 버튼을 눌렀을 때 제도를 저장합니다.

- 저장 성공 시 서버가 해당 제도의 필요 서류를 조회해 투두 항목을 자동 생성합니다.

**Request**

`POST /api/web/users/me/saved-policies`

```json
{
  "policyId": 5
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| policyId | Integer | Y | 저장할 제도 ID |

**Response `200 OK`**

```json
{
  "savedPolicyId": 42,
  "message": "제도가 저장되었습니다."
}
```

**Errors**

| Status | message | 조건 |
| --- | --- | --- |
| 400 | `값이 누락되었습니다.` | `policyId` 누락 |
| 401 | `로그인이 필요합니다.` | 인증 실패 |
| 404 | `존재하지 않는 제도입니다.` | 해당 `policyId` 없음 |
| 409 | `이미 저장한 제도입니다.` | 이미 저장한 제도 |

### 저장한 제도 목록 조회

로그인한 유저가 저장한 제도 목록을 조회합니다. 웹의 `내가 선택한 제도` 섹션에서 사용합니다.

**Request**

`GET /api/web/users/me/saved-policies`

Request Body 없음.

**Response `200 OK`**

```json
[
  {
    "savedPolicyId": 42,
    "policyId": 5,
    "name": "가족돌봄청년 자기돌봄비 지원",
    "policyType": "돌봄·가사 지원",
    "organization": "서울시",
    "content": "서울시 청년 대상",
    "deadline": "2026-01-28",
    "resultDate": "2026-08-15",
    "documents": [
      {
        "documentId": 1,
        "name": "가족관계증명서",
        "issuers": [
          {
            "issuer": "정부24",
            "site": "https://..."
          }
        ]
      }
    ]
  }
]
```

**Errors**

| Status | message | 조건 |
| --- | --- | --- |
| 401 | `로그인이 필요합니다.` | 인증 실패 |

### 제도 저장 취소

저장한 제도를 취소합니다. `savedPolicyId`가 로그인한 본인의 저장 항목인지 확인 후 삭제합니다.

- 저장 취소 시 해당 저장 항목에 연결된 투두 항목도 함께 삭제됩니다.

**Request**

`DELETE /api/web/users/me/saved-policies/{savedPolicyId}`

| Path Variable | 타입 | 설명 |
| --- | --- | --- |
| savedPolicyId | Integer | 삭제할 저장 항목 ID |

**Response `200 OK`**

```json
{
  "message": "저장이 취소되었습니다."
}
```

**Errors**

| Status | message | 조건 |
| --- | --- | --- |
| 401 | `로그인이 필요합니다.` | 인증 실패 |
| 404 | `존재하지 않는 저장 항목입니다.` | 저장 항목 없음 또는 본인 소유 아님 |
