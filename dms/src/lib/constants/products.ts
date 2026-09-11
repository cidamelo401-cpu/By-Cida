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

export const SIZE_OPTIONS: ProductSize[] = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

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
  'Flamengo',
  'Corinthians',
  'São Paulo',
  'Palmeiras',
  'Vasco da Gama',
  'Fluminense',
  'Grêmio',
  'Internacional',
  'Santos',
  'Cruzeiro',
  'Atlético Mineiro',
  'Botafogo',
  'Real Madrid',
  'Barcelona',
  'Manchester United',
  'Manchester City',
  'Liverpool',
  'Chelsea',
  'Arsenal',
  'Juventus',
  'Milan',
  'Inter de Milão',
  'PSG',
  'Bayern de Munique',
  'Seleção Brasileira',
  'Seleção Argentina',
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
