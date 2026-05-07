import { NextResponse } from 'next/server'
import type { ApiResult, ApiErrorCode } from './ApiErrorCode'
import { toHttpStatus, toUserMessage } from './errorMapping'
import type { UseCaseError } from '@/application/shared/errors/UseCaseError'

export function successResponse<T>(value: T, status = 200) {
  const result: ApiResult<T> = { ok: true, value }
  return NextResponse.json(result, { status })
}

export function errorResponse(code: ApiErrorCode, status?: number) {
  const result: ApiResult<never> = {
    ok: false,
    error: { code, message: toUserMessage(code) },
  }
  return NextResponse.json(result, {
    status: status ?? toHttpStatus(code),
  })
}

export function useCaseErrorResponse(e: UseCaseError) {
  return errorResponse(e.code as ApiErrorCode)
}
