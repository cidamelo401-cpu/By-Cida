'use client';

import type { QuizOption } from '@/data/types';
import { OptionCard } from './OptionCard';

type QuestionCardProps<T extends string> = {
  pergunta: string;
  opcoes: QuizOption<T>[];
  value: T | undefined;
  onAnswer: (value: T) => void;
};

export function QuestionCard<T extends string>({ pergunta, opcoes, value, onAnswer }: QuestionCardProps<T>) {
  return (
    <div>
      <h1 className="font-display text-2xl text-noite-900 md:text-3xl">{pergunta}</h1>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {opcoes.map((opcao) => (
          <OptionCard
            key={opcao.id}
            label={opcao.label}
            emoji={opcao.emoji}
            selected={value === opcao.id}
            onSelect={() => onAnswer(opcao.id)}
          />
        ))}
      </div>
    </div>
  );
}
