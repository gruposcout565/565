import { GiFleurDeLys } from 'react-icons/gi'
import { signIn } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center text-primary">
          <GiFleurDeLys size={56} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mt-3">Niño Jesús de Praga</h1>
        <p className="text-slate-500 text-sm mt-1">Grupo Scout 565</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-lg font-semibold text-slate-700 mb-6">Iniciar sesión</h2>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={signIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
              placeholder="educador@scouts565.org"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium mt-2"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}
