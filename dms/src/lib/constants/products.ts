import type { ProductModel, ProductSize, ProductStatus, ProductVersion } from '@/types/database'

export const MODEL_LABELS: Record<ProductModel, string> = {
  titular: 'Titular',
  reserva: 'Reserva',
  terceiro: 'Terceiro Uniforme',
  goleiro: 'Goleiro',
  treino: 'Treino',
}

export const VERSION_LABELS: Record<ProductVersion, string> = {
  torcedor: 'Torcedor',
  jogador: 'Jogador',
}

export const SIZE_OPTIONS: ProductSize[] = ['T20', 'T22', 'T24', 'T26', 'T28', 'PP', 'P', 'M', 'G', 'GG', '2XG', '3XG']

export const STATUS_LABELS: Record<ProductStatus, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  esgotado: 'Esgotado',
}

export const STATUS_BADGE: Record<ProductStatus, 'success' | 'warning' | 'danger'> = {
  disponivel: 'success',
  reservado: 'warning',
  esgotado: 'danger',
}

export const COMMON_TEAMS = [
  'Alemanha',
  'Al-Hilal',
  'Arsenal',
  'Barcelona',
  'Bayern',
  'Benfica',
  'Boca Juniors',
  'Brasil',
  'Bélgica',
  'Chelsea',
  'Corinthians',
  'Espanha',
  'França',
  'Inter Miami',
  'Itália',
  'Japão',
  'Juventus',
  'Liverpool',
  'Manchester City',
  'México',
  'Napoli',
  'Noruega',
  'PSV',
  'Palmeiras',
  'Portugal',
  'Santos',
  'USA',
  'Valência',
  'Vasco',
]

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  entrada: 'Entrada',
  venda: 'Venda',
  troca: 'Troca',
  devolucao: 'Devolução',
  perda: 'Perda',
  avaria: 'Avaria',
  ajuste: 'Ajuste',
}
