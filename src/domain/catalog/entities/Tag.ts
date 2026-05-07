import type { UUID } from '@/domain/shared/types/UUID'

export class Tag {
  constructor(
    public readonly id: UUID,
    public readonly userId: UUID,
    public readonly name: string,
    public readonly color: string,
    public readonly archivedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  get isArchived(): boolean {
    return this.archivedAt !== null
  }

  get isActive(): boolean {
    return this.archivedAt === null
  }
}
