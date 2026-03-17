'use client'

import { useTransition } from 'react'

interface DeleteButtonProps {
  action: () => Promise<void>
  label?: string
  confirmMessage?: string
}

export function DeleteButton({
  action,
  label = 'Eliminar Protagonista',
  confirmMessage = '¿Estás seguro de que deseas eliminar este protagonista? Esta acción no se puede deshacer.',
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm(confirmMessage)) {
          startTransition(() => action())
        }
      }}
      className="w-full text-brand-red border border-brand-red/30 py-2 rounded-lg hover:bg-brand-red-light transition-colors text-sm disabled:opacity-50"
    >
      {isPending ? 'Eliminando...' : label}
    </button>
  )
}
