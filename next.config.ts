import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/beneficiarios',
        destination: '/protagonistas',
        permanent: true,
      },
      {
        source: '/beneficiarios/nuevo',
        destination: '/protagonistas/nuevo',
        permanent: true,
      },
      {
        source: '/beneficiarios/:id',
        destination: '/protagonistas/:id',
        permanent: true,
      },
      {
        source: '/beneficiarios/:id/editar',
        destination: '/protagonistas/:id/editar',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
