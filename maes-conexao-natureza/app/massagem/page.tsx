'use client';

import { useState } from 'react';
import ScreenHeader from '@/components/ScreenHeader';
import { SLOTS_MASSAGEM, PRECO_MASSAGEM_CENTAVOS, CHAVE_PIX, MASSAGISTAS } from '@/services/eventData';
import { formatBRL } from '@/lib/format';
import { RESERVA_EXPIRA_MIN } from '@/services/payments';
import { ROUTES } from '@/lib/navigation';

type Selecao = { faixa: string; massagista: string } | null;

export default function MassagemPage() {
  const [selecao, setSelecao] = useState<Selecao>(null);
  const [copiado, setCopiado] = useState(false);
  const [confirmou, setConfirmou] = useState(false);
  const preco = formatBRL(PRECO_MASSAGEM_CENTAVOS);

  function handleSelect(faixa: string, massagista: string) {
    setSelecao({ faixa, massagista });
    setConfirmou(false);
  }

  function copiarChave() {
    navigator.clipboard.writeText(CHAVE_PIX).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }).catch(() => {});
  }

  const slotsLivres = SLOTS_MASSAGEM.reduce((n, s) => {
    if (!s.denise && s.denise !== 'almoço') n++;
    if (!s.ligia && s.ligia !== 'almoço') n++;
    return n;
  }, 0);

  return (
    <div>
      <ScreenHeader titulo="Massagem" kicker="30 min · relaxamento" voltarPara={ROUTES.home} />

      <div className="flex flex-col gap-3.5 px-[18px] pb-6 pt-3">
        {/* Info cards */}
        <div className="flex gap-2.5">
          <div className="flex flex-1 flex-col gap-[3px] rounded-tile border border-forest/[.07] bg-white p-3.5">
            <span className="font-display text-lg font-bold leading-none text-forest">30 min</span>
            <span className="text-[11px] font-medium leading-none text-forest/50">duração</span>
          </div>
          <div className="flex flex-1 flex-col gap-[3px] rounded-tile border border-forest/[.07] bg-white p-3.5">
            <span className="font-display text-lg font-bold leading-none text-forest">{preco}</span>
            <span className="text-[11px] font-medium leading-none text-forest/50">à parte da vaga</span>
          </div>
        </div>

        <p className="text-xs font-medium leading-[1.55] text-forest/[.62]">
          Atendimento individual na tenda ao lado das redes. {slotsLivres} horários disponíveis.
        </p>

        {/* Grade de horários: duas massagistas */}
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-[13px] font-bold leading-none text-forest">Escolha o horário</h2>

          {/* Cabeçalho */}
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[.1em] text-forest/40 py-1.5" />
            {MASSAGISTAS.map((m) => (
              <span key={m} className="text-center text-[11px] font-bold text-forest/60 py-1.5">
                {m}
              </span>
            ))}
          </div>

          {/* Linhas */}
          {SLOTS_MASSAGEM.map((slot) => {
            const isAlmoco = slot.denise === 'almoço';
            return (
              <div key={slot.faixa} className="grid grid-cols-[1fr_1fr_1fr] gap-1.5">
                <span className="flex items-center text-[11px] font-semibold leading-tight text-forest/55 py-1">
                  {slot.faixa.replace(' às ', '\n→ ').split('\n').map((l, i) => (
                    <span key={i}>{i > 0 && ' → '}{l.replace('→ ', '')}</span>
                  ))}
                </span>
                {(['denise', 'ligia'] as const).map((col) => {
                  const valor = slot[col];
                  const livre = valor === '';
                  const almoco = valor === 'almoço';
                  const selecionadoAqui = selecao?.faixa === slot.faixa && selecao?.massagista === col;

                  if (almoco) {
                    return (
                      <span key={col} className="flex min-h-[44px] items-center justify-center rounded-xl bg-amber/10 text-[10px] font-semibold text-amber-dark">
                        Almoço
                      </span>
                    );
                  }

                  if (!livre) {
                    return (
                      <span key={col} className="flex min-h-[44px] items-center justify-center rounded-xl bg-forest/[.04] px-1.5 text-center text-[10px] font-medium text-forest/30">
                        {valor}
                      </span>
                    );
                  }

                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => handleSelect(slot.faixa, col)}
                      className="flex min-h-[44px] items-center justify-center rounded-xl border-2 text-xs font-bold transition-all"
                      style={{
                        background: selecionadoAqui ? '#1E3123' : '#fff',
                        borderColor: selecionadoAqui ? '#1E3123' : 'rgba(30,49,35,.1)',
                        color: selecionadoAqui ? '#F6F1E6' : '#5C7A2E'
                      }}
                    >
                      {selecionadoAqui ? '✓' : 'Livre'}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Resumo + Pix */}
        {selecao && !confirmou && (
          <section className="flex flex-col gap-4 rounded-card bg-forest p-[18px]">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-[3px]">
                <span className="text-[10px] font-semibold uppercase leading-none tracking-[.16em] text-sage">
                  Seu horário · {selecao.massagista === 'denise' ? 'Denise' : 'Ligia'}
                </span>
                <span className="font-display text-xl font-bold leading-none text-cream">
                  {selecao.faixa}
                </span>
              </div>
              <span className="font-display text-xl font-bold leading-none text-amber">{preco}</span>
            </div>

            <div className="flex flex-col gap-2.5 rounded-tile bg-cream/[.08] p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-[.12em] text-sage">
                Pague via Pix
              </span>
              <div className="flex items-center gap-2">
                <span className="flex-1 break-all text-sm font-semibold text-cream/80">
                  {CHAVE_PIX}
                </span>
                <button
                  onClick={copiarChave}
                  className="flex-none rounded-xl bg-cream/[.12] px-3 py-2 text-[11px] font-bold text-cream transition-colors hover:bg-cream/[.2]"
                >
                  {copiado ? 'Copiada!' : 'Copiar'}
                </button>
              </div>
              <p className="text-[11px] font-medium leading-[1.4] text-cream/50">
                Valor: {preco} · Envie o comprovante para a organizadora
              </p>
            </div>

            <button
              onClick={() => setConfirmou(true)}
              className="flex min-h-[48px] items-center justify-center rounded-[18px] bg-terracotta px-4 py-[15px] text-[15px] font-bold text-white transition-colors hover:bg-terracotta-dark"
            >
              Já fiz o pagamento
            </button>

            <p className="text-center text-[11px] font-medium leading-[1.4] text-cream/50">
              O horário fica reservado por {RESERVA_EXPIRA_MIN} minutos
            </p>
          </section>
        )}

        {/* Estado "Em conferência" */}
        {selecao && confirmou && (
          <section className="flex flex-col items-center gap-3 rounded-card bg-mint p-[18px] text-center">
            <span className="font-display text-lg font-bold text-olive-deep">Em conferência ⏳</span>
            <p className="text-xs font-medium leading-[1.55] text-forest/65">
              {selecao.faixa} com {selecao.massagista === 'denise' ? 'Denise' : 'Ligia'}
            </p>
            <p className="text-xs font-medium leading-[1.55] text-forest/50">
              A organizadora vai confirmar o pagamento. Você receberá um aviso no grupo do WhatsApp.
            </p>
          </section>
        )}

        {!selecao && (
          <p className="rounded-card bg-forest/[.05] p-[18px] text-center text-xs font-medium leading-[1.5] text-forest/50">
            Toque em um horário livre para reservar
          </p>
        )}
      </div>
    </div>
  );
}
