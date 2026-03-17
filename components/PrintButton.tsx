'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
    >
      Imprimir / Guardar PDF
    </button>
  )
}
