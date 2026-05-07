import { DomainError } from '@/domain/shared/errors/DomainError'

export const TARGET_DURATION_MIN_SECONDS = 60
export const TARGET_DURATION_MAX_SECONDS = 43200

export class TargetDuration {
  private constructor(public readonly seconds: number) {}

  static create(seconds: number): TargetDuration {
    if (
      !Number.isInteger(seconds) ||
      seconds < TARGET_DURATION_MIN_SECONDS ||
      seconds > TARGET_DURATION_MAX_SECONDS
    ) {
      throw new DomainError(
        'INVALID_TARGET_DURATION',
        `TargetDuration must be between ${TARGET_DURATION_MIN_SECONDS} and ${TARGET_DURATION_MAX_SECONDS} seconds. Got: ${seconds}`
      )
    }
    return new TargetDuration(seconds)
  }

  equals(other: TargetDuration): boolean {
    return this.seconds === other.seconds
  }
}
