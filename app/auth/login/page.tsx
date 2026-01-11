/**
 * Legacy Auth Login Route - Redirects to Enterprise Login
 * 
 * This route redirects to the new enterprise /login page
 * to maintain a single, consistent authentication flow using
 * authService + Keycloak OAuth instead of next-auth
 */

'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LegacyAuthLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const error = searchParams.get('error')

  useEffect(() => {
    // Redirect to enterprise login page with preserved params
    const params = new URLSearchParams()
    if (callbackUrl && callbackUrl !== '/dashboard') {
      params.set('redirect', callbackUrl)
    }
    if (error) {
      params.set('error', error)
    }
    
    const destination = params.toString() 
      ? `/login?${params.toString()}` 
      : '/login'
    
    router.replace(destination)
  }, [router, callbackUrl, error])

  useEffect(() => {
    // Redirect to enterprise login page with preserved params
    const params = new URLSearchParams()
    if (callbackUrl && callbackUrl !== '/dashboard') {
      params.set('redirect', callbackUrl)
    }
    if (error) {
      params.set('error', error)
    }
    
    const destination = params.toString() 
      ? `/login?${params.toString()}` 
      : '/login'
    
    router.replace(destination)
  }, [router, callbackUrl, error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Redirecting to login...
        </p>
      </div>
    </div>
  )
}
