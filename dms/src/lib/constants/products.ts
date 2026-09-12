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
  'Borussia Dortmund',
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
  'Manchester United',
  'México',
  'Napoli',
  'Noruega',
  'PSV',
  'Palmeiras',
  'Real Madrid',
  'Portugal',
  'Santos',
  'São Paulo',
  'USA',
  'Valência',
  'Vasco',
]

/** Display labels for sizes in the public catalog (international naming) */
export const CATALOG_SIZE_LABELS: Record<ProductSize, string> = {
  T20: 'T20',
  T22: 'T22',
  T24: 'T24',
  T26: 'T26',
  T28: 'T28',
  PP: 'XS',
  P: 'S',
  M: 'M',
  G: 'L',
  GG: 'XL',
  '2XG': '2XL',
  '3XG': '3XL',
}

/** Collection header images for the catalog */
export const COLLECTION_IMAGES: Record<string, string> = {
  'Copa do Mundo': '/copa-do-mundo-2026.png',
  'Copa do Mundo 2026': '/copa-do-mundo-2026.png',
}

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  entrada: 'Entrada',
  venda: 'Venda',
  troca: 'Troca',
  devolucao: 'Devolução',
  perda: 'Perda',
  avaria: 'Avaria',
  ajuste: 'Ajuste',
}
