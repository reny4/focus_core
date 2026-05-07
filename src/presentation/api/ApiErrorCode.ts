export const API_ERROR_CODES = {
  UNAUTHENTICATED:               'UNAUTHENTICATED',
  UNAUTHORIZED:                  'UNAUTHORIZED',
  INVALID_REQUEST:               'INVALID_REQUEST',
  FOCUS_TASK_NOT_FOUND:          'FOCUS_TASK_NOT_FOUND',
  FOCUS_TASK_NOT_AVAILABLE:      'FOCUS_TASK_NOT_AVAILABLE',
  FOCUS_TASK_IN_ACTIVE_SESSION:  'FOCUS_TASK_IN_ACTIVE_SESSION',
  TAG_NOT_FOUND:                 'TAG_NOT_FOUND',
  TAG_NOT_AVAILABLE:             'TAG_NOT_AVAILABLE',
  TAG_IN_ACTIVE_SESSION:         'TAG_IN_ACTIVE_SESSION',
  ACTIVE_SESSION_ALREADY_EXISTS: 'ACTIVE_SESSION_ALREADY_EXISTS',
  ACTIVE_SESSION_NOT_FOUND:      'ACTIVE_SESSION_NOT_FOUND',
  DOMAIN_RULE_VIOLATION:         'DOMAIN_RULE_VIOLATION',
  PERSISTENCE_FAILED:            'PERSISTENCE_FAILED',
  UNKNOWN_ERROR:                 'UNKNOWN_ERROR',
} as const

export type ApiErrorCode =
  typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES]

export type ApiErrorResponse = {
  code: ApiErrorCode
  message: string
}

export type ApiResult<T> =
  | { ok: true;  value: T }
  | { ok: false; error: ApiErrorResponse }
