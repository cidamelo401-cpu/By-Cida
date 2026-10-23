type QuizProgressProps = {
  current: number; // 1-based
  total: number;
};

export function QuizProgress({ current, total }: QuizProgressProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="label-margin text-tinta-500">
          Pergunta {current} de {total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-pill bg-nevoa-300">
        <div
          className="h-full rounded-pill bg-horizonte-500 transition-[width] duration-200 ease-[cubic-bezier(.22,.61,.36,1)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
