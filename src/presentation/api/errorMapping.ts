import type { ApiErrorCode } from './ApiErrorCode'

export function toHttpStatus(code: ApiErrorCode): number {
  const map: Record<ApiErrorCode, number> = {
    UNAUTHENTICATED:               401,
    UNAUTHORIZED:                  403,
    INVALID_REQUEST:               400,
    DOMAIN_RULE_VIOLATION:         400,
    FOCUS_TASK_NOT_FOUND:          404,
    TAG_NOT_FOUND:                 404,
    ACTIVE_SESSION_NOT_FOUND:      404,
    FOCUS_TASK_NOT_AVAILABLE:      409,
    TAG_NOT_AVAILABLE:             409,
    FOCUS_TASK_IN_ACTIVE_SESSION:  409,
    TAG_IN_ACTIVE_SESSION:         409,
    ACTIVE_SESSION_ALREADY_EXISTS: 409,
    PERSISTENCE_FAILED:            500,
    UNKNOWN_ERROR:                 500,
  } satisfies Record<ApiErrorCode, number>

  return map[code]
}

export function toUserMessage(code: ApiErrorCode): string {
  const map: Record<ApiErrorCode, string> = {
    UNAUTHENTICATED:               'ログインが必要です。',
    UNAUTHORIZED:                  'この操作を行う権限がありません。',
    INVALID_REQUEST:               '入力内容が正しくありません。',
    DOMAIN_RULE_VIOLATION:         '操作を完了できませんでした。状態を確認してください。',
    FOCUS_TASK_NOT_FOUND:          '選択されたタスクが見つかりません。',
    FOCUS_TASK_NOT_AVAILABLE:      'このタスクは現在利用できません。',
    FOCUS_TASK_IN_ACTIVE_SESSION:  '進行中のセッションで使用中のタスクは変更できません。',
    TAG_NOT_FOUND:                 '紐づくタグが見つかりません。',
    TAG_NOT_AVAILABLE:             'このタスクに紐づくタグは現在利用できません。',
    TAG_IN_ACTIVE_SESSION:         '進行中のセッションで使用中のタグは変更できません。',
    ACTIVE_SESSION_ALREADY_EXISTS: 'すでに進行中の集中セッションがあります。',
    ACTIVE_SESSION_NOT_FOUND:      '進行中の集中セッションが見つかりません。',
    PERSISTENCE_FAILED:            '保存に失敗しました。時間をおいて再度お試しください。',
    UNKNOWN_ERROR:                 '予期しないエラーが発生しました。',
  } satisfies Record<ApiErrorCode, string>

  return map[code]
}
