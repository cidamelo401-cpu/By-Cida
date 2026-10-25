'use client';

type OptionCardProps = {
  label: string;
  emoji?: string;
  selected: boolean;
  onSelect: () => void;
};

export function OptionCard({ label, emoji, selected, onSelect }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-card border px-5 py-4 text-left font-body text-[15px] transition-colors duration-150 ${
        selected
          ? 'border-horizonte-500 bg-horizonte-100 text-noite-900'
          : 'border-noite-900/10 bg-nevoa-0 text-noite-900 hover:border-horizonte-300 hover:bg-horizonte-100/40'
      }`}
    >
      {emoji && (
        <span className="text-xl" aria-hidden>
          {emoji}
        </span>
      )}
      <span className="flex-1">{label}</span>
      <span
        className={`h-5 w-5 shrink-0 rounded-full border-2 transition-colors duration-150 ${
          selected ? 'border-horizonte-500 bg-horizonte-500' : 'border-noite-900/20 bg-transparent'
        }`}
        aria-hidden
      />
    </button>
  );
}
