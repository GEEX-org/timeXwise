'use client'

import { SignInForm } from "@/components/auth/SignInForm"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function SignInPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/home')
    }
  }, [session, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 sm:py-16 bg-[#EFE9D5] px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg text-center">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          Welcome to <span className="text-[#7fb236]">timeXwise</span>
        </h2>
        <p className="mt-4 text-lg sm:text-xl text-gray-600">
          Let&apos;s get started with your study journey
        </p>
      </div>

      <div className="mt-10 sm:mt-12 w-full max-w-lg">
        <div className="bg-white px-8 sm:px-12 py-10 sm:py-12 shadow-xl rounded-2xl border-2 border-gray-100">
          <SignInForm />
          <p className="mt-6 text-center text-sm sm:text-base text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-[#7fb236] hover:text-[#6a9a2d] hover:underline transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}