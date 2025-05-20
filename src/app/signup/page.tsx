'use client'

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none",
              headerTitle: "text-2xl font-semibold text-center text-gray-900",
              headerSubtitle: "text-center text-gray-600",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
              footerActionLink: "text-blue-600 hover:text-blue-700",
              formFieldInput: "rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500",
              formFieldLabel: "text-sm font-medium text-gray-700",
              identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
              formFieldAction: "text-sm text-blue-600 hover:text-blue-700",
              footerAction: "text-sm text-gray-600",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-500",
              socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
              socialButtonsBlockButtonText: "text-gray-700",
              formFieldInputShowPasswordButton: "text-gray-500 hover:text-gray-700",
              alertText: "text-sm text-red-600",
              alertIcon: "text-red-600",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              privacyPageUrl: "/privacy",
              termsPageUrl: "/terms",
            }
          }}
          routing="path"
          path="/signup"
          signInUrl="/login"
          redirectUrl="/"
          afterSignUpUrl="/"
        />
      </div>
    </div>
  )
} 