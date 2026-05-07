import { DomainError } from '@/domain/shared/errors/DomainError'

export class SessionSnapshot {
  private constructor(
    public readonly focusTaskName: string,
    public readonly tagName: string,
    public readonly tagColor: string
  ) {}

  static create(
    focusTaskName: string,
    tagName: string,
    tagColor: string
  ): SessionSnapshot {
    if (!focusTaskName.trim()) {
      throw new DomainError('INVALID_SNAPSHOT', 'focusTaskName cannot be empty')
    }
    if (!tagName.trim()) {
      throw new DomainError('INVALID_SNAPSHOT', 'tagName cannot be empty')
    }
    if (!tagColor.trim()) {
      throw new DomainError('INVALID_SNAPSHOT', 'tagColor cannot be empty')
    }
    return new SessionSnapshot(focusTaskName, tagName, tagColor)
  }
}
