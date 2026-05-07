import { v4 as uuidv4 } from 'uuid'
import { Tag } from '@/domain/catalog/entities/Tag'
import type { ITagRepository } from '@/domain/catalog/repositories/ITagRepository'
import { UseCaseError } from '@/application/shared/errors/UseCaseError'
import { ok, err, type Result } from '@/domain/shared/types/Result'
import type { UUID } from '@/domain/shared/types/UUID'
import type { TagDto } from './ListTags'

export type CreateTagInput = {
  userId: UUID
  name: string
  color: string
}

export async function createTag(
  input: CreateTagInput,
  deps: { tagRepo: ITagRepository }
): Promise<Result<TagDto, UseCaseError>> {
  try {
    const existing = await deps.tagRepo.findActiveByUserId(input.userId)
    const duplicate = existing.find(
      (t) => t.name.trim() === input.name.trim()
    )
    if (duplicate) {
      return err(new UseCaseError('INVALID_REQUEST', '同名のタグが既に存在します'))
    }

    const now = new Date()
    const saved = await deps.tagRepo.save(
      new Tag(
        uuidv4() as UUID,
        input.userId,
        input.name.trim(),
        input.color,
        null,
        now,
        now
      )
    )
    return ok({ id: saved.id, name: saved.name, color: saved.color })
  } catch (e) {
    if (e instanceof UseCaseError) return err(e)
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('23505')) {
      return err(new UseCaseError('INVALID_REQUEST', '同名のタグが既に存在します'))
    }
    return err(new UseCaseError('UNKNOWN_ERROR'))
  }
}
