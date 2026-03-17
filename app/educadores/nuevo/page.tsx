import Link from 'next/link'
import { MdArrowBack } from 'react-icons/md'
import { EducadorForm } from '@/components/EducadorForm'

export default function NuevoEducadorPage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <Link href="/educadores" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm">
          <MdArrowBack size={16} /> Volver a Educadores
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">Nuevo Educador</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Los educadores con rol Educador o Administrador podrán iniciar sesión en el sistema.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <EducadorForm />
      </div>
    </div>
  )
}
