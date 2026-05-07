import { DomainError } from '@/domain/shared/errors/DomainError'

export const ACTUAL_DURATION_MAX_SECONDS = 43200

export class ActualDuration {
  private constructor(public readonly seconds: number) {}

  static fromElapsed(elapsedSeconds: number): ActualDuration {
    if (elapsedSeconds < 0) {
      throw new DomainError(
        'INVALID_ACTUAL_DURATION',
        `ActualDuration cannot be negative. Got: ${elapsedSeconds}`
      )
    }
    const capped = Math.min(elapsedSeconds, ACTUAL_DURATION_MAX_SECONDS)
    return new ActualDuration(capped)
  }

  get isOverTarget(): boolean {
    return this.seconds === ACTUAL_DURATION_MAX_SECONDS
  }
}
