import type { IFocusTaskRepository } from '@/domain/catalog/repositories/IFocusTaskRepository'
import type { ITagRepository } from '@/domain/catalog/repositories/ITagRepository'
import { UseCaseError } from '@/application/shared/errors/UseCaseError'
import { ok, err, type Result } from '@/domain/shared/types/Result'
import type { UUID } from '@/domain/shared/types/UUID'

export type FocusTaskDto = {
  id: string
  name: string
  tagId: string
  tagName: string
  tagColor: string
}

export type ListFocusTasksOutput = { focusTasks: FocusTaskDto[] }

export async function listFocusTasks(
  input: { userId: UUID },
  deps: {
    focusTaskRepo: IFocusTaskRepository
    tagRepo: ITagRepository
  }
): Promise<Result<ListFocusTasksOutput, UseCaseError>> {
  try {
    const [tasks, tags] = await Promise.all([
      deps.focusTaskRepo.findActiveByUserId(input.userId),
      deps.tagRepo.findActiveByUserId(input.userId),
    ])

    const tagMap = new Map(tags.map((t) => [t.id, t]))

    const focusTasks: FocusTaskDto[] = tasks
      .filter((t) => tagMap.has(t.tagId))
      .map((t) => {
        const tag = tagMap.get(t.tagId)!
        return { id: t.id, name: t.name, tagId: t.tagId, tagName: tag.name, tagColor: tag.color }
      })

    return ok({ focusTasks })
  } catch (e) {
    if (e instanceof UseCaseError) return err(e)
    return err(new UseCaseError('UNKNOWN_ERROR'))
  }
}
