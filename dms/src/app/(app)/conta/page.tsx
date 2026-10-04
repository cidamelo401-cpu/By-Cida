'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

type MigrationResult = {
  migratedProducts: number
  migratedFiles: number
  failedFiles: number
  failures: string[]
}

export default function ContaPage() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [migrating, setMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | { error: string } | null>(null)

  async function handleMigratePhotos() {
    setMigrating(true)
    setMigrationResult(null)
    try {
      const res = await fetch('/api/admin/migrate-photos', { method: 'POST' })
      const data = await res.json()
      setMigrationResult(res.ok ? data : { error: data.error ?? 'Erro desconhecido.' })
    } catch {
      setMigrationResult({ error: 'Erro de conexão. Tente novamente.' })
    } finally {
      setMigrating(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' })
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()

      // Verify current password by re-signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email ?? '',
        password: currentPassword,
      })

      if (signInError) {
        setMessage({ type: 'error', text: 'Senha atual incorreta.' })
        setSaving(false)
        return
      }

      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao alterar senha. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie seus dados e senha de acesso</p>
      </div>

      {/* User info */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white font-bold text-lg">
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile?.full_name ?? 'Usuário'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Alterar senha</h2>

        {message && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha atual
            </label>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
              Nova senha
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar nova senha
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {saving ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </div>

      {/* Admin: migração de fotos para o Cloudflare R2 */}
      {isAdmin && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Migrar fotos antigas (R2)</h2>
          <p className="text-sm text-gray-500 mb-4">
            Reenvia as fotos de produto que ainda estão no armazenamento antigo (Supabase) para o
            novo (Cloudflare R2), sem limite de tráfego. Pode rodar mais de uma vez: fotos já
            migradas são puladas automaticamente. Pode levar alguns minutos.
          </p>
          <button
            onClick={handleMigratePhotos}
            disabled={migrating}
            className="px-6 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {migrating ? 'Migrando...' : 'Migrar fotos agora'}
          </button>

          {migrationResult && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
              {'error' in migrationResult ? (
                <p className="text-red-600 font-medium">Erro: {migrationResult.error}</p>
              ) : (
                <>
                  <p className="text-green-700 font-medium">
                    {migrationResult.migratedFiles} foto(s) migrada(s) em {migrationResult.migratedProducts} produto(s).
                  </p>
                  {migrationResult.failedFiles > 0 && (
                    <div className="mt-2 text-red-600">
                      <p className="font-medium">{migrationResult.failedFiles} falha(s):</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        {migrationResult.failures.map((f, i) => (
                          <li key={i} className="text-xs break-all">{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sign out */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h2 className="text-lg font-bold text-red-700 mb-2">Sair da conta</h2>
        <p className="text-sm text-red-600 mb-4">Você será redirecionado para a tela de login.</p>
        <button
          onClick={signOut}
          className="px-6 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          Sair
        </button>
      </div>
    </div>
  )
}
