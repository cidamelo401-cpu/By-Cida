'use client';

import Link from 'next/link';
import HeroImage from '@/components/HeroImage';
import { EVENTO, FACILITADORAS, FOTO_LIMPA, CHECKLIST, PROGRAMA, INCLUI } from '@/services/eventData';
import { ROUTES } from '@/lib/navigation';
import { useParticipante } from '@/lib/useParticipante';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { participante, sair } = useParticipante();
  const router = useRouter();

  function handleSair() {
    sair();
    router.replace('/cadastro');
  }

  return (
    <div className="pb-3.5">
      <HeroImage
        src={FOTO_LIMPA.src}
        alt={FOTO_LIMPA.alt}
        posicao="42%"
        altura={380}
        gradiente="linear-gradient(178deg,rgba(20,38,22,.5) 0%,rgba(20,38,22,0) 32%,rgba(20,38,22,.86) 100%)"
      >
        <div className="absolute bottom-6 left-[22px] right-[22px] flex flex-col gap-3">
          <div className="flex gap-2">
            <span className="rounded-chip bg-amber px-[11px] py-[7px] text-[10px] font-bold uppercase leading-none tracking-[.16em] text-forest">
              {EVENTO.edicao}ª edição
            </span>
          </div>
          <h1 className="font-display text-[40px] font-bold leading-[.96] text-white [text-wrap:balance]">
            Mães, Conexão
            <br />e Natureza
          </h1>
          <p className="text-sm font-semibold leading-[1.45] text-white/[.88]">
            17 de outubro · 10h às 17h
            <br />
            Sítio Anju · Mata Atlântica
          </p>
        </div>
      </HeroImage>

      <div className="flex flex-col gap-3 px-[18px] pt-5">
        {/* Saudação */}
        {participante && (
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-bold text-forest">
              Olá, {participante.nome.split(' ')[0]} 🌿
            </p>
            <button
              onClick={handleSair}
              className="text-[11px] font-semibold text-terracotta/70 transition-colors hover:text-terracotta"
            >
              Sair
            </button>
          </div>
        )}

        {/* Minha vaga */}
        <Link
          href={ROUTES.inscricao}
          className="flex flex-col gap-[15px] rounded-card-lg bg-forest p-5"
        >
          <div className="flex flex-col gap-[3px]">
            <span className="text-[10px] font-semibold uppercase leading-none tracking-[.18em] text-sage">
              Minha vaga
            </span>
            <span className="font-display text-[22px] font-bold leading-tight text-cream">
              {participante?.nome ?? 'Participante'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {INCLUI.map((item) => (
              <span key={item} className="rounded-chip bg-cream/[.1] px-2.5 py-[5px] text-[10px] font-semibold text-cream/70">
                {item}
              </span>
            ))}
          </div>
          <span className="self-start rounded-chip bg-moss-light/20 px-3 py-1.5 text-xs font-bold text-moss-light">
            Vaga confirmada ✓
          </span>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href={ROUTES.programa}
            className="flex flex-col gap-6 rounded-card border border-forest/[.08] bg-white p-4 transition-colors hover:border-forest/30"
          >
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-mint font-display text-[15px] font-bold leading-none text-moss-dark">
              17
            </span>
            <span>
              <span className="block font-display text-[15px] font-bold leading-tight text-forest">Programação</span>
              <span className="block text-xs font-medium leading-[1.3] text-forest/50">
                {PROGRAMA.length} momentos do dia
              </span>
            </span>
          </Link>
          <Link
            href={ROUTES.massagem}
            className="flex flex-col gap-6 rounded-card border border-forest/[.08] bg-white p-4 transition-colors hover:border-forest/30"
          >
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-blush font-display text-sm font-bold leading-none text-terracotta-dark">
              30&apos;
            </span>
            <span>
              <span className="block font-display text-[15px] font-bold leading-tight text-forest">Massagem</span>
              <span className="block text-xs font-medium leading-[1.3] text-forest/50">Agendar horário</span>
            </span>
          </Link>
        </div>

        <Link
          href={ROUTES.facilitadoras}
          className="flex items-center gap-3.5 rounded-card border border-forest/[.08] bg-white px-[18px] py-[15px] transition-colors hover:border-forest/30"
        >
          <span className="flex">
            {FACILITADORAS.map((f, i) => (
              <span
                key={f.id}
                className="h-9 w-9 rounded-full border-2 border-white text-center font-display text-[13px] font-bold leading-8 text-white"
                style={{ background: f.cor, marginLeft: i === 0 ? 0 : -12 }}
              >
                {f.iniciais}
              </span>
            ))}
          </span>
          <span className="flex-1">
            <span className="block font-display text-[15px] font-bold leading-tight text-forest">
              {FACILITADORAS.length} facilitadoras
            </span>
            <span className="block text-xs font-medium leading-[1.3] text-forest/50">
              Quem conduz cada momento
            </span>
          </span>
          <span className="text-xl font-semibold leading-none text-forest/30">›</span>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link href={ROUTES.local} className="relative h-[130px] overflow-hidden rounded-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FOTO_LIMPA.src}
              alt="Cachoeira e mata ao fundo do gramado do sítio"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: '50% 26%' }}
            />
            <span
              className="absolute inset-0"
              style={{ background: 'linear-gradient(0deg,rgba(20,38,22,.82),rgba(20,38,22,.05))' }}
            />
            <span className="absolute bottom-3 left-3.5 font-display text-[15px] font-bold leading-[1.15] text-white">
              Local e
              <br />
              como chegar
            </span>
          </Link>
          <Link
            href={ROUTES.checklist}
            className="flex h-[130px] flex-col justify-between rounded-card bg-moss p-3.5"
          >
            <span className="font-display text-[22px] font-bold leading-none text-white/55">
              {CHECKLIST.length}
            </span>
            <span className="font-display text-[15px] font-bold leading-[1.15] text-white">
              O que levar
              <br />
              na mochila
            </span>
          </Link>
        </div>

        <Link href={ROUTES.galeria} className="flex min-h-[44px] items-center gap-3 px-1 pb-2.5 pt-1.5">
          <span className="flex-1 text-[13px] font-semibold leading-none text-moss-dark">
            Fotos das edições anteriores
          </span>
          <span className="text-lg font-semibold leading-none text-moss-dark">→</span>
        </Link>
      </div>
    </div>
  );
}
