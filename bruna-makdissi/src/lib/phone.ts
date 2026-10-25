/**
 * Máscara de telefone, aplicada enquanto a pessoa digita.
 *
 * Padrão BR (DDD + número): cresce progressivamente — (11 → (11) 9123 →
 * (11) 9123-4567 (8 dígitos, fixo) → (11) 91234-5678 (9 dígitos, celular).
 *
 * Número de fora do Brasil: quem começa digitando "+" sai do padrão BR — só
 * limpa caracteres inválidos, sem forçar DDD (cada país tem seu próprio
 * formato; não dá pra advinhar).
 */
export function formatPhoneBR(value: string): string {
  if (value.trimStart().startsWith('+')) {
    return '+' + value.replace(/[^\d\s]/g, '').replace(/\s{2,}/g, ' ').trimStart();
  }

  const digitos = value.replace(/\D/g, '').slice(0, 11);

  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

/** true se o número tem dígitos suficientes pra ser válido, BR ou internacional. */
export function isPhoneValido(value: string): boolean {
  const digitos = value.replace(/\D/g, '').length;
  return value.trim().startsWith('+') ? digitos >= 8 : digitos >= 10;
}
