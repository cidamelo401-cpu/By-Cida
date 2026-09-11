'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

function ShieldIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M28 4L48 12V26C48 38.7 39.7 48.9 28 52C16.3 48.9 8 38.7 8 26V12L28 4Z"
        fill="#1B5E20"
      />
      <path
        d="M28 4L48 12V26C48 38.7 39.7 48.9 28 52C16.3 48.9 8 38.7 8 26V12L28 4Z"
        stroke="#0F3D12"
        strokeWidth="1.5"
      />
      {/* football pentagon pattern */}
      <path
        d="M28 18L33.5 22L31.5 28.5H24.5L22.5 22L28 18Z"
        fill="#F5F5F0"
      />
      <path
        d="M28 18L22.5 22M28 18L33.5 22M22.5 22L24.5 28.5M33.5 22L31.5 28.5M24.5 28.5H31.5"
        stroke="#1B5E20"
        strokeWidth="0.75"
      />
      <path
        d="M28 30L31 32.5L29.8 36H26.2L25 32.5L28 30Z"
        fill="#F5F5F0"
        opacity="0.85"
      />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M10.6 5.1C11.05 5.04 11.52 5 12 5C18.5 5 22 12 22 12C22 12 21 13.9 19.1 15.7M6.5 6.5C3.6 8.4 2 12 2 12C2 12 5.5 19 12 19C13.6 19 15 18.6 16.2 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 9.9C9.35 10.45 9 11.2 9 12C9 13.66 10.34 15 12 15C12.8 15 13.55 14.65 14.1 14.1"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'recover'>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [keepConnected, setKeepConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  const [recoverEmail, setRecoverEmail] = useState('')
  const [recoverLoading, setRecoverLoading] = useState(false)

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Preencha e-mail e senha.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(traduzErro(error.message))
        return
      }

      toast.success('Login realizado com sucesso!')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Erro inesperado ao entrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRecover(e: FormEvent) {
    e.preventDefault()
    if (!recoverEmail) {
      toast.error('Informe o seu e-mail.')
      return
    }

    setRecoverLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoverEmail, {
        redirectTo: window.location.origin + '/auth/callback?next=/reset-password',
      })

      if (error) {
        toast.error(traduzErro(error.message))
        return
      }

      toast.success('Enviamos um link de recuperação para o seu e-mail.')
      setMode('login')
      setRecoverEmail('')
    } catch {
      toast.error('Erro inesperado ao enviar o link. Tente novamente.')
    } finally {
      setRecoverLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F5F0] px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <ShieldIcon />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#1B5E20]">
            DMS Sports
          </h1>
          <p className="mt-1 text-sm text-gray-500">Gestão de Estoque & Vendas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-5" noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 pr-11 text-sm text-gray-900 outline-none transition focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition rounded-md"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between -mt-1">
                <label className="flex items-center gap-2 text-sm text-gray-600 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepConnected}
                    onChange={(e) => setKeepConnected(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]/30 accent-[#1B5E20]"
                  />
                  Permanecer conectado
                </label>

                <button
                  type="button"
                  onClick={() => setMode('recover')}
                  className="text-sm font-medium text-[#1B5E20] hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-lg bg-[#1B5E20] py-2.5 text-sm font-semibold text-white transition hover:bg-[#164a1a] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRecover} className="flex flex-col gap-5" noValidate>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Recuperar senha
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Informe seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="recover-email" className="text-sm font-medium text-gray-700">
                  E-mail
                </label>
                <input
                  id="recover-email"
                  type="email"
                  autoComplete="email"
                  value={recoverEmail}
                  onChange={(e) => setRecoverEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={recoverLoading}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={recoverLoading}
                className="w-full rounded-lg bg-[#1B5E20] py-2.5 text-sm font-semibold text-white transition hover:bg-[#164a1a] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {recoverLoading && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {recoverLoading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sm font-medium text-gray-500 hover:text-[#1B5E20] transition text-center"
              >
                Voltar para o login
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <a
            href="https://www.instagram.com/dmssports.oficial"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#1B5E20] transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            @dmssports.oficial
          </a>
        </div>
      </div>
    </div>
  )
}

function traduzErro(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha inválidos.',
    'Email not confirmed': 'E-mail ainda não confirmado.',
    'User not found': 'Usuário não encontrado.',
  }
  return map[message] ?? message
}
