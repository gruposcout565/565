import Link from 'next/link'
import { getUsuariosApp } from '@/lib/data'
import { deleteEducador } from '@/lib/actions'
import { DeleteButton } from '@/components/DeleteButton'

const ROL_LABEL: Record<string, string> = {
  admin: 'Administrador',
  educador: 'Educador',
  readonly: 'Solo lectura',
}
const ROL_STYLE: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  educador: 'bg-primary-light text-primary',
  readonly: 'bg-slate-100 text-slate-600',
}

export default async function EducadoresPage() {
  const usuarios = await getUsuariosApp()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Educadores</h1>
          <p className="text-slate-500 mt-1 text-sm">Usuarios con acceso al sistema</p>
        </div>
        <Link
          href="/educadores/nuevo"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          + Nuevo Educador
        </Link>
      </div>

      {usuarios.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <p className="text-slate-400">No hay educadores registrados</p>
          <Link href="/educadores/nuevo" className="mt-3 inline-block text-primary hover:underline text-sm">
            Agregar el primero →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100">
          {usuarios.map((u) => {
            const deleteWithId = deleteEducador.bind(null, u.id)
            return (
              <div key={u.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{u.nombre}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROL_STYLE[u.rol] ?? 'bg-slate-100 text-slate-600'}`}>
                      {ROL_LABEL[u.rol] ?? u.rol}
                    </span>
                    {!u.activo && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Inactivo
                      </span>
                    )}
                  </div>
                  {u.rama && (
                    <p className="text-xs text-slate-400 mt-0.5">Rama: {u.rama}</p>
                  )}
                </div>
                <DeleteButton
                  action={deleteWithId}
                  label="Eliminar"
                  confirmMessage={`¿Eliminar a ${u.nombre}? Esta acción también revocará su acceso al sistema.`}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
