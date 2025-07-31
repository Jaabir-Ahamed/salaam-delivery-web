"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface EnvSetupGuideProps {
  onNavigate: (page: string) => void
}

export function EnvSetupGuide({ onNavigate }: EnvSetupGuideProps) {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean
    supabaseKey: boolean
    isClient: boolean
  }>({
    supabaseUrl: false,
    supabaseKey: false,
    isClient: false
  })

  useEffect(() => {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    setEnvStatus({
      supabaseUrl: !!supabaseUrl,
      supabaseKey: !!supabaseKey,
      isClient: typeof window !== "undefined"
    })
  }, [])

  const allConfigured = envStatus.supabaseUrl && envStatus.supabaseKey

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img 
              src="https://images.squarespace-cdn.com/content/640a69d4ab6bd06b8101c1c7/69b970bb-3f0e-4ecf-b458-af07e5485667/Salaam+Food+Pantry+Favicon.png?content-type=image%2Fpng" 
              alt="Salaam Food Pantry" 
              className="w-8 h-8 rounded"
            />
            Environment Setup Guide
          </CardTitle>
          <CardDescription>
            Check if your environment variables are properly configured
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {envStatus.supabaseUrl ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm">
                NEXT_PUBLIC_SUPABASE_URL: {envStatus.supabaseUrl ? "Configured" : "Missing"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {envStatus.supabaseKey ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm">
                NEXT_PUBLIC_SUPABASE_ANON_KEY: {envStatus.supabaseKey ? "Configured" : "Missing"}
              </span>
            </div>
          </div>

          {!allConfigured && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Environment variables are missing!</p>
                  <p className="text-sm text-gray-600">
                    To fix this, you need to set the following environment variables in your Vercel dashboard:
                  </p>
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                    <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    You can find these values in your Supabase project settings under "API" section.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {allConfigured && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All environment variables are properly configured! The app should work correctly.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onNavigate("dashboard")}
              className="flex-1"
            >
              Try App Again
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
