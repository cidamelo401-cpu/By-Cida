'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'

type LeadStatus = 'novo' | 'em_negociacao' | 'vendido' | 'desistiu'

type Lead = {
  id: string
  name: string
  whatsapp: string
  product_id: string | null
  team: string
  model: string | null
  size: string | null
  sell_price: number | null
  status: LeadStatus
  notes: string | null
  created_at: string
  updated_at: string
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  novo: { label: 'Novo', color: 'text-blue-700', bg: 'bg-blue-50' },
  em_negociacao: { label: 'Em negociação', color: 'text-amber-700', bg: 'bg-amber-50' },
  vendido: { label: 'Vendido', color: 'text-green-700', bg: 'bg-green-50' },
  desistiu: { label: 'Desistiu', color: 'text-gray-500', bg: 'bg-gray-100' },
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<LeadStatus | 'todos'>('todos')

  useEffect(() => {
    loadLeads()
  }, [])

  async function loadLeads() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    setLeads(data ?? [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: LeadStatus) {
    const supabase = createClient()
    await supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
  }

  const filtered = filter === 'todos' ? leads : leads.filter((l) => l.status === filter)
  const counts = {
    todos: leads.length,
    novo: leads.filter((l) => l.status === 'novo').length,
    em_negociacao: leads.filter((l) => l.status === 'em_negociacao').length,
    vendido: leads.filter((l) => l.status === 'vendido').length,
    desistiu: leads.filter((l) => l.status === 'desistiu').length,
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads do Catálogo</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pessoas que demonstraram interesse em camisas pelo catálogo
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
          <p className="text-2xl font-bold text-blue-700">{counts.novo}</p>
          <p className="text-xs text-blue-600 font-medium">Novos</p>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
          <p className="text-2xl font-bold text-amber-700">{counts.em_negociacao}</p>
          <p className="text-xs text-amber-600 font-medium">Em negociação</p>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-100 p-4">
          <p className="text-2xl font-bold text-green-700">{counts.vendido}</p>
          <p className="text-xs text-green-600 font-medium">Vendidos</p>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-500">{counts.desistiu}</p>
          <p className="text-xs text-gray-500 font-medium">Desistiram</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(['todos', 'novo', 'em_negociacao', 'vendido', 'desistiu'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === s
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'todos' ? 'Todos' : STATUS_CONFIG[s].label} ({counts[s]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">Nenhum lead encontrado.</p>
          <p className="text-gray-400 text-xs mt-1">Leads aparecem aqui quando alguém demonstra interesse no catálogo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const cfg = STATUS_CONFIG[lead.status]
            const date = new Date(lead.created_at)
            const whatsappUrl = `https://wa.me/${lead.whatsapp}`
            return (
              <div key={lead.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{lead.name}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cfg.color} ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline font-medium"
                    >
                      📱 {lead.whatsapp}
                    </a>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 flex-wrap">
                      <span>⚽ {lead.team}</span>
                      {lead.size && <span>· Tam. {lead.size}</span>}
                      {lead.sell_price != null && <span>· {formatCurrency(lead.sell_price)}</span>}
                      <span>· {date.toLocaleDateString('pt-BR')} {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  >
                    <option value="novo">Novo</option>
                    <option value="em_negociacao">Em negociação</option>
                    <option value="vendido">Vendido</option>
                    <option value="desistiu">Desistiu</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
