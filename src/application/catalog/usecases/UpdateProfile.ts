import { UseCaseError } from '@/application/shared/errors/UseCaseError'
import { ok, err, type Result } from '@/domain/shared/types/Result'
import type { IProfileRepository } from '@/domain/profile/repositories/IProfileRepository'
import type { UUID } from '@/domain/shared/types/UUID'

export type UpdateProfileInput = {
  userId: UUID
  displayName: string
}

export async function updateProfile(
  input: UpdateProfileInput,
  deps: { profileRepo: IProfileRepository }
): Promise<Result<void, UseCaseError>> {
  const trimmed = input.displayName.trim()
  if (!trimmed) {
    return err(new UseCaseError('INVALID_REQUEST', 'display_nameは空にできません'))
  }
  if (trimmed.length > 50) {
    return err(new UseCaseError('INVALID_REQUEST', 'display_nameは50文字以内で入力してください'))
  }

  try {
    await deps.profileRepo.updateDisplayName(input.userId, trimmed)
    return ok(undefined)
  } catch {
    return err(new UseCaseError('PERSISTENCE_FAILED'))
  }
}
