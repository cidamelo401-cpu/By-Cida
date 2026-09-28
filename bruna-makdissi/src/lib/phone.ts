/**
 * Máscara de telefone BR (DDD + número), aplicada enquanto a pessoa digita.
 * Cresce progressivamente: (11 → (11) 9123 → (11) 9123-4567 (8 dígitos,
 * fixo) → (11) 91234-5678 (9 dígitos, celular).
 */
export function formatPhoneBR(value: string): string {
  const digitos = value.replace(/\D/g, '').slice(0, 11);

  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}
