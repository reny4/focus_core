import type { ITagRepository } from '@/domain/catalog/repositories/ITagRepository'
import { UseCaseError } from '@/application/shared/errors/UseCaseError'
import { ok, err, type Result } from '@/domain/shared/types/Result'
import type { UUID } from '@/domain/shared/types/UUID'

export type TagDto = {
  id: string
  name: string
  color: string
}

export type ListTagsOutput = { tags: TagDto[] }

export async function listTags(
  input: { userId: UUID },
  deps: { tagRepo: ITagRepository }
): Promise<Result<ListTagsOutput, UseCaseError>> {
  try {
    const tags = await deps.tagRepo.findActiveByUserId(input.userId)
    return ok({ tags: tags.map((t) => ({ id: t.id, name: t.name, color: t.color })) })
  } catch (e) {
    if (e instanceof UseCaseError) return err(e)
    return err(new UseCaseError('UNKNOWN_ERROR'))
  }
}
