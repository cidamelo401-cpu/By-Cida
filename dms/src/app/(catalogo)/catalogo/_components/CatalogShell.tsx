'use client'

import CatalogHeader from './CatalogHeader'
import CatalogFooter from './CatalogFooter'
import WhatsAppFloat from './WhatsAppFloat'

export default function CatalogShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <CatalogHeader />
      {children}
      <CatalogFooter />
      <WhatsAppFloat />
    </div>
  )
}
