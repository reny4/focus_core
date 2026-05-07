import { DomainError } from '@/domain/shared/errors/DomainError'
import { TargetDuration } from '../value-objects/TargetDuration'
import { ActualDuration } from '../value-objects/ActualDuration'
import { SessionSnapshot } from '../value-objects/SessionSnapshot'
import type { UUID } from '@/domain/shared/types/UUID'

export type SessionStatus = 'active' | 'finished' | 'discarded'

export type TimerPhase = 'idle' | 'counting_down' | 'counting_up'

export type ActiveFocusSession = FocusSession & {
  status: 'active'
  endedAt: null
  actualDuration: null
}

export type FinishedFocusSession = FocusSession & {
  status: 'finished'
  endedAt: Date
  actualDuration: ActualDuration
}

export type DiscardedFocusSession = FocusSession & {
  status: 'discarded'
  endedAt: Date
  actualDuration: null
}

export class FocusSession {
  private constructor(
    public readonly id: UUID,
    public readonly userId: UUID,
    public readonly focusTaskId: UUID,
    public readonly tagId: UUID,
    public readonly snapshot: SessionSnapshot,
    public readonly targetDuration: TargetDuration,
    public readonly startedAt: Date,
    public readonly status: SessionStatus,
    public readonly endedAt: Date | null,
    public readonly actualDuration: ActualDuration | null
  ) {}

  static reconstruct(params: {
    id: UUID
    userId: UUID
    focusTaskId: UUID
    tagId: UUID
    snapshot: SessionSnapshot
    targetDuration: TargetDuration
    startedAt: Date
    status: SessionStatus
    endedAt: Date | null
    actualDuration: ActualDuration | null
  }): FocusSession {
    return new FocusSession(
      params.id,
      params.userId,
      params.focusTaskId,
      params.tagId,
      params.snapshot,
      params.targetDuration,
      params.startedAt,
      params.status,
      params.endedAt,
      params.actualDuration
    )
  }

  static startNew(params: {
    id: UUID
    userId: UUID
    focusTaskId: UUID
    tagId: UUID
    snapshot: SessionSnapshot
    targetDuration: TargetDuration
    startedAt: Date
  }): ActiveFocusSession {
    return new FocusSession(
      params.id,
      params.userId,
      params.focusTaskId,
      params.tagId,
      params.snapshot,
      params.targetDuration,
      params.startedAt,
      'active',
      null,
      null
    ) as ActiveFocusSession
  }

  finish(endedAt: Date): FinishedFocusSession {
    if (this.status !== 'active') {
      throw new DomainError(
        'INVALID_STATE_TRANSITION',
        `Cannot finish a session with status: ${this.status}`
      )
    }
    const elapsedSeconds = Math.floor(
      (endedAt.getTime() - this.startedAt.getTime()) / 1000
    )
    const actualDuration = ActualDuration.fromElapsed(elapsedSeconds)

    return new FocusSession(
      this.id,
      this.userId,
      this.focusTaskId,
      this.tagId,
      this.snapshot,
      this.targetDuration,
      this.startedAt,
      'finished',
      endedAt,
      actualDuration
    ) as FinishedFocusSession
  }

  discard(endedAt: Date): DiscardedFocusSession {
    if (this.status !== 'active') {
      throw new DomainError(
        'INVALID_STATE_TRANSITION',
        `Cannot discard a session with status: ${this.status}`
      )
    }
    return new FocusSession(
      this.id,
      this.userId,
      this.focusTaskId,
      this.tagId,
      this.snapshot,
      this.targetDuration,
      this.startedAt,
      'discarded',
      endedAt,
      null
    ) as DiscardedFocusSession
  }

  deriveTimerPhase(now: Date): Exclude<TimerPhase, 'idle'> {
    const elapsedSeconds = Math.floor(
      (now.getTime() - this.startedAt.getTime()) / 1000
    )
    return elapsedSeconds < this.targetDuration.seconds
      ? 'counting_down'
      : 'counting_up'
  }

  isActive(): this is ActiveFocusSession {
    return this.status === 'active'
  }

  isFinished(): this is FinishedFocusSession {
    return this.status === 'finished'
  }

  isDiscarded(): this is DiscardedFocusSession {
    return this.status === 'discarded'
  }
}
