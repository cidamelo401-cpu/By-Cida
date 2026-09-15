'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParticipante } from '@/lib/useParticipante';
import { EVENTO, FOTO_LIMPA } from '@/services/eventData';

function formatarTelefone(valor: string): string {
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return nums;
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
}

export default function CadastroPage() {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const { entrar, participante, sair } = useParticipante();
  const router = useRouter();

  const nomeValido = nome.trim().length >= 3;
  const telLimpo = whatsapp.replace(/\D/g, '');
  const whatsappValido = telLimpo.length >= 10;
  const podeEntrar = nomeValido && whatsappValido;

  function handleEntrar() {
    if (!podeEntrar) return;
    entrar(nome, whatsapp);
    router.push('/');
  }

  // Se já está cadastrada, mostra opção de limpar
  if (participante) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-[340px] flex-col items-center gap-6 text-center">
          <p className="text-sm font-medium text-forest/60">
            Você está cadastrada como <strong className="text-forest">{participante.nome}</strong>
          </p>
          <button
            onClick={() => { sair(); setNome(''); setWhatsapp(''); }}
            className="min-h-[44px] rounded-tile border border-terracotta/20 bg-blush px-6 py-3 text-sm font-bold text-terracotta transition-colors hover:bg-terracotta/10"
          >
            Limpar cadastro
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-sm font-semibold text-moss underline"
          >
            Voltar para o app
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Hero compacto */}
      <div className="relative h-[220px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FOTO_LIMPA.src}
          alt={FOTO_LIMPA.alt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: '50% 42%' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(178deg,rgba(20,38,22,.5) 0%,rgba(20,38,22,0) 32%,rgba(20,38,22,.92) 100%)' }}
        />
        <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-2">
          <span className="rounded-chip self-start bg-amber px-[11px] py-[7px] text-[10px] font-bold uppercase leading-none tracking-[.16em] text-forest">
            {EVENTO.edicao}ª edição
          </span>
          <h1 className="font-display text-[32px] font-bold leading-[.96] text-white">
            Mães, Conexão<br />e Natureza
          </h1>
          <p className="text-xs font-semibold text-white/80">
            17 de outubro · Sítio Anju
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex flex-1 flex-col gap-5 px-5 pt-6 pb-8">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-lg font-bold text-forest">Bem-vinda!</h2>
          <p className="text-sm font-medium leading-[1.5] text-forest/60">
            Para acessar o app do evento, preencha seus dados abaixo.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nome" className="text-xs font-bold uppercase tracking-[.1em] text-forest/50">
              Seu nome
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Como quer ser chamada"
              autoComplete="name"
              className="min-h-[48px] rounded-tile border border-forest/10 bg-white px-4 py-3 text-[15px] font-medium text-forest outline-none transition-colors placeholder:text-forest/30 focus:border-moss"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="whatsapp" className="text-xs font-bold uppercase tracking-[.1em] text-forest/50">
              WhatsApp
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatarTelefone(e.target.value))}
              placeholder="(11) 99999-9999"
              autoComplete="tel"
              inputMode="numeric"
              className="min-h-[48px] rounded-tile border border-forest/10 bg-white px-4 py-3 text-[15px] font-medium text-forest outline-none transition-colors placeholder:text-forest/30 focus:border-moss"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!podeEntrar}
          onClick={handleEntrar}
          className="mt-2 flex min-h-[52px] items-center justify-center rounded-[18px] bg-terracotta px-4 py-4 text-center text-base font-bold leading-none text-white transition-all disabled:opacity-40"
        >
          Entrar no app
        </button>

        <p className="text-center text-[11px] font-medium leading-[1.45] text-forest/40">
          Seus dados são usados apenas para o evento
        </p>
      </div>
    </div>
  );
}
