'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useClerk } from '@clerk/nextjs'
import { toast } from 'sonner'

type VerificationResult = {
  status: 'complete' | 'expired' | 'failed'
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { handleEmailLinkVerification } = useClerk()
  const redirectUrl = searchParams.get('redirect_url') || '/'

  useEffect(() => {
    async function verifyEmail() {
      try {
        const result = await handleEmailLinkVerification({
          redirectUrl,
          redirectUrlComplete: redirectUrl
        }) as VerificationResult
        
        if (result.status === 'complete') {
          toast.success('Email verified successfully!')
          router.push(redirectUrl)
        } else if (result.status === 'expired') {
          toast.error('Verification link has expired. Please try signing up again.')
          router.push('/signup')
        } else if (result.status === 'failed') {
          toast.error('Verification failed. Please try again.')
          router.push('/signup')
        }
      } catch (err) {
        console.error('Error verifying email:', err)
        toast.error('An error occurred during verification. Please try again.')
        router.push('/signup')
      }
    }
    verifyEmail()
  }, [handleEmailLinkVerification, redirectUrl, router])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Verifying Your Email</h2>
        <p className="text-gray-600 mb-8">
          Please wait while we verify your email address...
        </p>
        <p className="text-sm text-gray-500">
          You will be redirected automatically
        </p>
      </div>
    </div>
  )
} 