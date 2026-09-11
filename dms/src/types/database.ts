export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProductModel = 'titular' | 'reserva' | 'terceiro' | 'goleiro' | 'treino'
export type ProductVersion = 'torcedor' | 'jogador'
export type ProductSize = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XGG'
export type ProductStatus = 'disponivel' | 'reservado' | 'esgotado'

export type SaleChannel = 'whatsapp' | 'instagram'
export type PaymentMethod = 'pix' | 'dinheiro' | 'credito' | 'debito' | 'transferencia' | 'outro'
export type PaymentStatus = 'pendente' | 'parcial' | 'pago'
export type SaleStatus =
  | 'orcamento'
  | 'reservada'
  | 'aguardando_pagamento'
  | 'paga'
  | 'enviada'
  | 'entregue'
  | 'cancelada'

export type StockMovementType =
  | 'entrada'
  | 'venda'
  | 'troca'
  | 'devolucao'
  | 'perda'
  | 'avaria'
  | 'ajuste'

export type UserRole = 'admin' | 'user'

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          team: string
          country_league: string | null
          season: string | null
          model: ProductModel
          version: ProductVersion
          size: ProductSize
          quantity: number
          cost_price: number
          sell_price: number
          supplier: string | null
          photo_url: string | null
          notes: string | null
          min_stock: number
          status: ProductStatus
          sku: string | null
          archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team: string
          country_league?: string | null
          season?: string | null
          model: ProductModel
          version: ProductVersion
          size: ProductSize
          quantity?: number
          cost_price: number
          sell_price: number
          supplier?: string | null
          photo_url?: string | null
          notes?: string | null
          min_stock?: number
          status?: ProductStatus
          sku?: string | null
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team?: string
          country_league?: string | null
          season?: string | null
          model?: ProductModel
          version?: ProductVersion
          size?: ProductSize
          quantity?: number
          cost_price?: number
          sell_price?: number
          supplier?: string | null
          photo_url?: string | null
          notes?: string | null
          min_stock?: number
          status?: ProductStatus
          sku?: string | null
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          name: string
          whatsapp: string | null
          instagram: string | null
          city: string | null
          state: string | null
          favorite_team: string | null
          preferred_size: ProductSize | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          whatsapp?: string | null
          instagram?: string | null
          city?: string | null
          state?: string | null
          favorite_team?: string | null
          preferred_size?: ProductSize | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          whatsapp?: string | null
          instagram?: string | null
          city?: string | null
          state?: string | null
          favorite_team?: string | null
          preferred_size?: ProductSize | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          id: string
          code: string
          customer_id: string | null
          channel: SaleChannel
          discount: number
          shipping: number
          total: number
          amount_paid: number
          amount_pending: number
          payment_method: PaymentMethod | null
          payment_status: PaymentStatus
          sale_status: SaleStatus
          tracking_code: string | null
          due_date: string | null
          notes: string | null
          reservation_deadline: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code?: string
          customer_id?: string | null
          channel: SaleChannel
          discount?: number
          shipping?: number
          total?: number
          amount_paid?: number
          payment_method?: PaymentMethod | null
          payment_status?: PaymentStatus
          sale_status?: SaleStatus
          tracking_code?: string | null
          due_date?: string | null
          notes?: string | null
          reservation_deadline?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          customer_id?: string | null
          channel?: SaleChannel
          discount?: number
          shipping?: number
          total?: number
          amount_paid?: number
          payment_method?: PaymentMethod | null
          payment_status?: PaymentStatus
          sale_status?: SaleStatus
          tracking_code?: string | null
          due_date?: string | null
          notes?: string | null
          reservation_deadline?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string | null
          quantity: number
          unit_price: number
          cost_price: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id?: string | null
          quantity: number
          unit_price: number
          cost_price: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
          cost_price?: number
          created_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          sale_id: string
          amount: number
          method: PaymentMethod
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          amount: number
          method: PaymentMethod
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          amount?: number
          method?: PaymentMethod
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          id: string
          product_id: string
          type: StockMovementType
          quantity: number
          previous_quantity: number
          new_quantity: number
          reason: string | null
          sale_id: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          type: StockMovementType
          quantity: number
          previous_quantity: number
          new_quantity: number
          reason?: string | null
          sale_id?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          type?: StockMovementType
          quantity?: number
          previous_quantity?: number
          new_quantity?: number
          reason?: string | null
          sale_id?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      sale_status_history: {
        Row: {
          id: string
          sale_id: string
          previous_status: SaleStatus | null
          new_status: SaleStatus
          changed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          previous_status?: SaleStatus | null
          new_status: SaleStatus
          changed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          previous_status?: SaleStatus | null
          new_status?: SaleStatus
          changed_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
