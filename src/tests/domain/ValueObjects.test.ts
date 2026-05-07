import { describe, it, expect } from 'vitest'
import { TargetDuration } from '@/domain/focus/value-objects/TargetDuration'
import { ActualDuration, ACTUAL_DURATION_MAX_SECONDS } from '@/domain/focus/value-objects/ActualDuration'
import { DomainError } from '@/domain/shared/errors/DomainError'

describe('TargetDuration', () => {
  it('60秒で作成できる', () => {
    expect(TargetDuration.create(60).seconds).toBe(60)
  })

  it('43200秒で作成できる', () => {
    expect(TargetDuration.create(43200).seconds).toBe(43200)
  })

  it('59秒は拒否される', () => {
    expect(() => TargetDuration.create(59)).toThrow(DomainError)
  })

  it('43201秒は拒否される', () => {
    expect(() => TargetDuration.create(43201)).toThrow(DomainError)
  })

  it('小数は拒否される', () => {
    expect(() => TargetDuration.create(1500.5)).toThrow(DomainError)
  })
})

describe('ActualDuration', () => {
  it('通常の経過時間を保持する', () => {
    expect(ActualDuration.fromElapsed(1500).seconds).toBe(1500)
  })

  it('43200秒を超える場合は 43200 に丸める', () => {
    expect(ActualDuration.fromElapsed(50000).seconds).toBe(43200)
  })

  it('負数は拒否される', () => {
    expect(() => ActualDuration.fromElapsed(-1)).toThrow(DomainError)
  })
})
