import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { AppShell } from '@/components/AppShell'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Niño Jesús de Praga — Grupo 565',
  description: 'Sistema de gestión de membresías',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className={`${geist.variable} font-sans bg-slate-50 h-full flex flex-col`}>
        <Navbar />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
