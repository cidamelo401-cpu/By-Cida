'use client';

import { useState, type FormEvent } from 'react';
import type { LeadInfo } from '@/lib/quizSession';
import { formatPhoneBR } from '@/lib/phone';

type LeadCaptureProps = {
  onSubmit: (lead: LeadInfo) => void;
};

export function LeadCapture({ onSubmit }: LeadCaptureProps) {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [autorizo, setAutorizo] = useState(false);

  const podeEnviar = nome.trim().length > 1 && whatsapp.replace(/\D/g, '').length >= 10 && email.includes('@') && autorizo;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!podeEnviar) return;
    onSubmit({ nome: nome.trim(), whatsapp: whatsapp.trim(), email: email.trim() });
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-noite-900 md:text-3xl">Seu direcionamento está pronto.</h1>
      <p className="mt-2 font-body text-sm font-light text-tinta-700">
        Para receber seu resultado, conta pra gente quem é você.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="nome" className="label-margin mb-1.5 block text-tinta-500">
            Nome
          </label>
          <input
            id="nome"
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-field border border-noite-900/15 bg-nevoa-0 px-4 py-3 font-body text-sm text-noite-900 outline-none focus-visible:border-horizonte-500"
          />
        </div>

        <div>
          <label htmlFor="whatsapp" className="label-margin mb-1.5 block text-tinta-500">
            WhatsApp
          </label>
          <input
            id="whatsapp"
            type="tel"
            inputMode="numeric"
            required
            placeholder="(11) 90000-0000"
            value={whatsapp}
            onChange={(e) => setWhatsapp(formatPhoneBR(e.target.value))}
            className="w-full rounded-field border border-noite-900/15 bg-nevoa-0 px-4 py-3 font-body text-sm text-noite-900 outline-none focus-visible:border-horizonte-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="label-margin mb-1.5 block text-tinta-500">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-field border border-noite-900/15 bg-nevoa-0 px-4 py-3 font-body text-sm text-noite-900 outline-none focus-visible:border-horizonte-500"
          />
        </div>

        <label className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            checked={autorizo}
            onChange={(e) => setAutorizo(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-horizonte-500"
          />
          <span className="font-body text-xs font-light leading-relaxed text-tinta-700">
            Autorizo o contato da equipe da Bruna sobre meu resultado e atendimentos.
          </span>
        </label>

        <button
          type="submit"
          disabled={!podeEnviar}
          className="mt-4 w-full rounded-pill bg-horizonte-500 px-8 py-3 font-body text-sm font-medium text-nevoa-0 transition-colors duration-150 hover:bg-horizonte-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Ver meu resultado
        </button>
      </form>
    </div>
  );
}
