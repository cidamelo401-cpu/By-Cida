import type { PaymentMethod, PaymentStatus, SaleStatus } from '@/types/database'

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  orcamento: 'Orçamento',
  reservada: 'Reservada',
  aguardando_pagamento: 'Aguardando Pagamento',
  paga: 'Paga',
  enviada: 'Enviada',
  entregue: 'Entregue',
  cancelada: 'Cancelada',
}

export const SALE_STATUS_COLORS: Record<SaleStatus, string> = {
  orcamento: 'bg-gray-100 text-gray-800',
  reservada: 'bg-yellow-100 text-yellow-800',
  aguardando_pagamento: 'bg-orange-100 text-orange-800',
  paga: 'bg-green-100 text-green-800',
  enviada: 'bg-blue-100 text-blue-800',
  entregue: 'bg-primary-100 text-primary-900',
  cancelada: 'bg-red-100 text-red-800',
}

export const SALE_STATUS_BADGE: Record<SaleStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'> = {
  orcamento: 'neutral',
  reservada: 'warning',
  aguardando_pagamento: 'warning',
  paga: 'success',
  enviada: 'info',
  entregue: 'primary',
  cancelada: 'danger',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendente: 'Pendente',
  parcial: 'Parcial',
  pago: 'Pago',
}

export const PAYMENT_STATUS_BADGE: Record<PaymentStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'> = {
  pendente: 'danger',
  parcial: 'warning',
  pago: 'success',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  credito: 'Cartão de Crédito',
  debito: 'Cartão de Débito',
  transferencia: 'Transferência',
  outro: 'Outro',
}

export const SALE_CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
}

// Allowed next statuses for each current sale status
export const SALE_STATUS_TRANSITIONS: Record<SaleStatus, SaleStatus[]> = {
  orcamento: ['reservada', 'aguardando_pagamento', 'cancelada'],
  reservada: ['aguardando_pagamento', 'paga', 'cancelada'],
  aguardando_pagamento: ['paga', 'cancelada'],
  paga: ['enviada', 'cancelada'],
  enviada: ['entregue'],
  entregue: [],
  cancelada: [],
}

export const SALE_STATUS_TRANSITION_MESSAGES: Record<SaleStatus, string> = {
  orcamento: 'A venda voltará a ser um orçamento.',
  reservada: 'O(s) produto(s) será(ão) reservado(s) e o estoque será baixado como reservado.',
  aguardando_pagamento: 'A venda ficará aguardando a confirmação do pagamento.',
  paga: 'Ao confirmar como Paga, o estoque será baixado definitivamente.',
  enviada: 'O pedido será marcado como enviado. Não esqueça de informar o código de rastreio.',
  entregue: 'O pedido será marcado como entregue ao cliente.',
  cancelada: 'Ao cancelar, o estoque reservado/baixado será devolvido automaticamente.',
}
