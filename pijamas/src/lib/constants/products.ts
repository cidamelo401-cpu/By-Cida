import type { ProductModel, ProductSize, ProductStatus, ProductFabric } from '@/types/database'

export const MODEL_LABELS: Record<ProductModel, string> = {
  conjunto: 'Conjunto',
  camisola: 'Camisola',
  short_doll: 'Short Doll',
  baby_doll: 'Baby Doll',
  roupao: 'Roupão',
}

export const FABRIC_LABELS: Record<ProductFabric, string> = {
  algodao: 'Algodão',
  seda: 'Seda',
  cetim: 'Cetim',
  fleece: 'Fleece',
  malha: 'Malha',
}

export const PATTERN_OPTIONS = ['Liso', 'Listrado', 'Floral', 'Xadrez', 'Estampado', 'Personalizado']

export const SIZE_OPTIONS: ProductSize[] = ['PP', 'P', 'M', 'G', 'GG', '2XG', '3XG', '2', '4', '6', '8', '10', '12', '14']

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

export const COMMON_COLLECTIONS = [
  'Verão 2025',
  'Inverno 2025',
  'Primavera 2025',
  'Natal 2024',
  'Dia das Mães 2025',
  'Noivas',
]

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
