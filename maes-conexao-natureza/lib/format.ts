export function formatBRL(centavos: number): string {
  const reais = centavos / 100;
  const inteiro = Number.isInteger(reais) ? String(reais) : reais.toFixed(2).replace('.', ',');
  return 'R$ ' + inteiro;
}

export function percentual(parte: number, total: number): number {
  if (!total) return 0;
  return Math.round((parte / total) * 100);
}
