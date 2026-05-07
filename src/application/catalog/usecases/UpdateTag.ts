import { Tag } from '@/domain/catalog/entities/Tag'
import type { ITagRepository } from '@/domain/catalog/repositories/ITagRepository'
import type { IFocusSessionRepository } from '@/domain/focus/repositories/IFocusSessionRepository'
import { UseCaseError } from '@/application/shared/errors/UseCaseError'
import { ok, err, type Result } from '@/domain/shared/types/Result'
import type { UUID } from '@/domain/shared/types/UUID'
import type { TagDto } from './ListTags'

export type UpdateTagInput = {
  userId: UUID
  tagId: UUID
  name: string
  color: string
}

export async function updateTag(
  input: UpdateTagInput,
  deps: {
    tagRepo: ITagRepository
    focusSessionRepo: IFocusSessionRepository
  }
): Promise<Result<TagDto, UseCaseError>> {
  try {
    const tag = await deps.tagRepo.findById(input.tagId)
    if (!tag) return err(new UseCaseError('TAG_NOT_FOUND'))
    if (tag.userId !== input.userId) return err(new UseCaseError('UNAUTHORIZED'))
    if (tag.isArchived) return err(new UseCaseError('TAG_NOT_AVAILABLE'))

    const activeSession = await deps.focusSessionRepo.findActiveByUserId(input.userId)
    if (activeSession?.tagId === tag.id) {
      return err(new UseCaseError('TAG_IN_ACTIVE_SESSION'))
    }

    const existing = await deps.tagRepo.findActiveByUserId(input.userId)
    const duplicate = existing.find(
      (t) => t.name.trim() === input.name.trim() && t.id !== input.tagId
    )
    if (duplicate) {
      return err(new UseCaseError('INVALID_REQUEST', '同名のタグが既に存在します'))
    }

    const updated = await deps.tagRepo.update(
      new Tag(
        tag.id,
        tag.userId,
        input.name.trim(),
        input.color,
        tag.archivedAt,
        tag.createdAt,
        new Date()
      )
    )
    return ok({ id: updated.id, name: updated.name, color: updated.color })
  } catch (e) {
    if (e instanceof UseCaseError) return err(e)
    return err(new UseCaseError('UNKNOWN_ERROR'))
  }
}
