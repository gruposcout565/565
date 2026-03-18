'use client'

import { useState, useTransition } from 'react'
import { useFormStatus } from 'react-dom'
import { MdUpload, MdDelete, MdPictureAsPdf, MdImage, MdOpenInNew } from 'react-icons/md'
import { uploadDocumento, deleteDocumento } from '@/lib/actions'

type Doc = {
  id: string
  nombre: string
  storage_path: string
  tipo: 'pdf' | 'imagen'
  created_at: string
  url: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium disabled:opacity-50"
    >
      {pending ? 'Subiendo...' : 'Subir'}
    </button>
  )
}

export function DocumentosSection({
  protagonistaId,
  documentos,
}: {
  protagonistaId: string
  documentos: Doc[]
}) {
  const [isPending, startTransition] = useTransition()
  const [fileName, setFileName] = useState('')

  function handleDelete(id: string, storagePath: string) {
    startTransition(async () => {
      await deleteDocumento(id, storagePath, protagonistaId)
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
        Documentación
      </h2>

      <form action={uploadDocumento} className="mb-4">
        <input type="hidden" name="protagonista_id" value={protagonistaId} />
        <div className="flex gap-2">
          <label className="flex-1 flex items-center gap-2 border border-dashed border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:border-primary hover:bg-primary-light transition-colors text-sm text-slate-500 min-w-0">
            <MdUpload size={18} className="shrink-0 text-slate-400" />
            <span className="truncate">{fileName || 'Seleccionar PDF o imagen...'}</span>
            <input
              type="file"
              name="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
              className="hidden"
              required
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f && f.size > 50 * 1024 * 1024) {
                  alert('El archivo no puede superar los 50 MB')
                  e.target.value = ''
                  setFileName('')
                  return
                }
                setFileName(f?.name ?? '')
              }}
            />
          </label>
          <SubmitButton />
        </div>
      </form>

      {documentos.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">No hay documentos cargados</p>
      ) : (
        <div className="space-y-2">
          {documentos.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg"
            >
              {doc.tipo === 'pdf' ? (
                <MdPictureAsPdf size={20} className="text-red-500 shrink-0" />
              ) : (
                <MdImage size={20} className="text-blue-500 shrink-0" />
              )}
              <span className="flex-1 text-sm text-slate-700 truncate">{doc.nombre}</span>
              <span className="text-xs text-slate-400 shrink-0">
                {new Date(doc.created_at).toLocaleDateString('es-AR')}
              </span>
              {doc.url && (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir documento"
                  className="text-slate-400 hover:text-primary transition-colors"
                >
                  <MdOpenInNew size={18} />
                </a>
              )}
              <button
                onClick={() => handleDelete(doc.id, doc.storage_path)}
                disabled={isPending}
                title="Eliminar documento"
                className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <MdDelete size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
