import { CHAVE_PIX, PRECO_MASSAGEM_CENTAVOS } from './eventData';

/** Minutos que a reserva de massagem fica presa esperando pagamento. */
export const RESERVA_EXPIRA_MIN = 20;

/** Gera o payload Pix BR Code / EMV (simplificado — copia-e-cola). */
export function pixCopiaCola(valor: number, chave: string, nome: string, cidade: string): string {
  // Payload simplificado para copia-e-cola. QR real precisa de CRC16.
  // Por enquanto retorna a chave para copiar.
  return chave;
}

export function chavePix(): string {
  return CHAVE_PIX;
}

export function precoMassagemFormatado(): string {
  return 'R$ ' + (PRECO_MASSAGEM_CENTAVOS / 100);
}
