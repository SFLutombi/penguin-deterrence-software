import { headers } from 'next/headers'
import Link from 'next/link'

export default async function NotFound() {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
} 