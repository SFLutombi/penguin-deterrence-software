'use client'

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none",
              headerTitle: "text-2xl font-semibold text-center text-foreground",
              headerSubtitle: "text-center text-muted-foreground",
              formButtonPrimary: "bg-secondary hover:bg-secondary/80 text-sm normal-case",
              footerActionLink: "text-secondary hover:text-secondary/80",
              formFieldInput: "rounded-md border-input focus:border-secondary focus:ring-secondary",
              formFieldLabel: "text-sm font-medium text-foreground",
              identityPreviewEditButton: "text-secondary hover:text-secondary/80",
              formFieldAction: "text-sm text-secondary hover:text-secondary/80",
              footerAction: "text-sm text-muted-foreground",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground",
              socialButtonsBlockButton: "border border-input hover:bg-accent",
              socialButtonsBlockButtonText: "text-foreground",
              formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
              alertText: "text-sm text-destructive",
              alertIcon: "text-destructive",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              privacyPageUrl: "/privacy",
              termsPageUrl: "/terms",
            }
          }}
          routing="path"
          path="/login"
          signUpUrl="/signup"
          redirectUrl="/"
        />
      </div>
    </div>
  )
} 