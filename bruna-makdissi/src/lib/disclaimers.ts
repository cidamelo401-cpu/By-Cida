import type { RecommendationResult } from '@/data/types';

/**
 * Disclaimers públicos curados — texto pronto para o visitante ler, escrito
 * seguindo as instruções internas do catálogo (campo `cuidadosLinguagem`),
 * nunca copiando esse campo direto. Ver claims-e-safety.md da skill de marca.
 */
const DISCLAIMER_TEXT: Record<NonNullable<RecommendationResult['disclaimerKind']>, string> = {
  saude:
    'Esse é um trabalho energético e integrativo. Ele complementa, mas não substitui acompanhamento médico, nutricional ou psicológico.',
  saude_mental:
    'Ansiedade é um tema de saúde mental. Esse trabalho complementa, mas não substitui acompanhamento profissional — se você estiver em crise, procure apoio especializado.',
  veterinario: 'Esse trabalho complementa, mas não substitui acompanhamento veterinário.',
  luto: 'Esse é um trabalho energético para ajudar a atravessar o luto. Ele complementa, mas não substitui acompanhamento psicológico especializado.',
};

export function getDisclaimerText(kind: RecommendationResult['disclaimerKind']): string | null {
  if (!kind) return null;
  return DISCLAIMER_TEXT[kind];
}
