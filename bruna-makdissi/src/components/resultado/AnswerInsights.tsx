type AnswerInsightsProps = {
  bullets: string[];
};

export function AnswerInsights({ bullets }: AnswerInsightsProps) {
  return (
    <div className="mt-10 border-t border-noite-900/10 pt-8">
      <p className="label-margin mb-4 text-horizonte-600">O que apareceu nas suas respostas</p>
      <ul className="space-y-2.5">
        {bullets.map((b) => (
          <li key={b} className="flex gap-3 font-body text-sm font-light leading-relaxed text-tinta-700">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ouro-500" aria-hidden />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
