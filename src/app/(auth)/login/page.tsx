'use client'

// HIG: Clarity — フォームはシンプル。余白を広く取り、数字より文字が主役
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/infrastructure/supabase/client'

const signInSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
})

const signUpSchema = signInSchema.extend({
  displayName: z.string().optional(),
})

type SignInFields = z.infer<typeof signInSchema>
type SignUpFields = z.infer<typeof signUpSchema>

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [serverError, setServerError] = useState('')
  const [signUpDone, setSignUpDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpFields>({
    resolver: zodResolver(mode === 'signin' ? signInSchema : signUpSchema),
  })

  function switchMode(next: 'signin' | 'signup') {
    setMode(next)
    setServerError('')
    reset()
  }

  async function onSubmit(values: SignUpFields) {
    setServerError('')
    const supabase = createClient()

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (error) {
        setServerError('メールアドレスまたはパスワードが正しくありません。')
        return
      }
      router.push('/')
      router.refresh()
    } else {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { display_name: values.displayName || '' },
        },
      })
      if (error) {
        setServerError(error.message)
        return
      }
      setSignUpDone(true)
    }
  }

  if (signUpDone) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight">確認メールを送信しました</h1>
          <p className="text-sm text-muted-foreground">
            登録したメールアドレスに確認リンクを送りました。リンクをクリックしてサインインしてください。
          </p>
          <Button
            variant="ghost"
            className="text-sm"
            onClick={() => { setSignUpDone(false); switchMode('signin') }}
          >
            サインイン画面に戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* App name — Large Title */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Focus Core</h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'signin' ? 'アカウントにサインイン' : '新規アカウントを作成'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Display name (sign up only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <Label htmlFor="displayName">表示名（任意）</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="例: 田中"
                autoComplete="name"
                className="rounded-lg h-11"
                {...register('displayName')}
              />
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              autoComplete={mode === 'signin' ? 'email' : 'email'}
              className="rounded-lg h-11"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="rounded-lg h-11"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <p className="text-sm text-destructive" role="alert">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full h-11 rounded-lg font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? '処理中...'
              : mode === 'signin'
              ? 'サインイン'
              : 'アカウントを作成'}
          </Button>
        </form>

        {/* Mode switch — text link, not tab */}
        <p className="text-center text-sm text-muted-foreground">
          {mode === 'signin' ? (
            <>
              アカウントをお持ちでない方は{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="text-primary font-medium hover:underline"
              >
                新規登録
              </button>
            </>
          ) : (
            <>
              すでにアカウントをお持ちの方は{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-primary font-medium hover:underline"
              >
                サインイン
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
