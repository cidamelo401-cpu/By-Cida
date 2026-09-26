import type { ProductModel, ProductSize, ProductStatus, ProductVersion } from '@/types/database'

export const MODEL_LABELS: Record<ProductModel, string> = {
  titular: 'Home',
  reserva: 'Away',
  terceiro: 'Third',
  goleiro: 'Goalkeeper',
  treino: 'Training',
}

export const VERSION_LABELS: Record<ProductVersion, string> = {
  torcedor: 'Fan',
  jogador: 'Player',
}

export const SIZE_OPTIONS: ProductSize[] = ['AD', 'T20', 'T22', 'T24', 'T26', 'T28', 'P', 'M', 'G', 'GG', '2XG', '3XG']

/** Faixa completa de tamanhos exibida no catálogo (adulto), mesmo sem estoque cadastrado ainda */
export const CATALOG_ADULT_SIZES: ProductSize[] = ['P', 'M', 'G', 'GG', '2XG', '3XG']

/** Faixa completa de tamanhos exibida no catálogo (infantil), mesmo sem estoque cadastrado ainda */
export const CATALOG_KIDS_SIZES: ProductSize[] = ['T20', 'T22', 'T24', 'T26', 'T28']

export const STATUS_LABELS: Record<ProductStatus, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  esgotado: 'Esgotado',
  sob_encomenda: 'Sob Encomenda',
}

export const STATUS_BADGE: Record<ProductStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  disponivel: 'success',
  reservado: 'warning',
  esgotado: 'danger',
  sob_encomenda: 'info',
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
  AD: 'A definir',
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
export const COLLECTION_IMAGES: Record<string, string> = {}

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  entrada: 'Entrada',
  venda: 'Venda',
  troca: 'Troca',
  devolucao: 'Devolução',
  perda: 'Perda',
  avaria: 'Avaria',
  ajuste: 'Ajuste',
}
