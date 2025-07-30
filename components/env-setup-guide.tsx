"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Copy, ExternalLink } from "lucide-react"
import { useState } from "react"

interface EnvSetupGuideProps {
  onRetry: () => void
}

export function EnvSetupGuide({ onRetry }: EnvSetupGuideProps) {
  const [copied, setCopied] = useState(false)

  const envTemplate = `# Add these to your .env.local file
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=your_production_domain`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envTemplate)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-800">Environment Configuration Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Missing Supabase Configuration</h3>
            <p className="text-sm text-yellow-700">
              Your app needs Supabase environment variables to connect to the database and authentication system.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Setup Instructions:</h3>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Get your Supabase credentials</p>
                  <p className="text-sm text-gray-600">Go to your Supabase project dashboard → Settings → API</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent"
                    onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Supabase Dashboard
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">2</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Create .env.local file</p>
                  <p className="text-sm text-gray-600 mb-2">Copy this template and replace with your actual values:</p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono relative">
                    <pre className="whitespace-pre-wrap">{envTemplate}</pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-100"
                      onClick={copyToClipboard}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {copied && <p className="text-sm text-green-600 mt-1">Copied to clipboard!</p>}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Restart your development server</p>
                  <p className="text-sm text-gray-600">
                    Stop your dev server and run <code className="bg-gray-100 px-1 rounded">npm run dev</code> again
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Where to find your Supabase credentials:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • <strong>Project URL</strong>: Settings → API → Project URL
              </li>
              <li>
                • <strong>Anon Key</strong>: Settings → API → Project API keys → anon/public
              </li>
            </ul>
          </div>

          <div className="flex justify-center">
            <Button onClick={onRetry} className="bg-green-600 hover:bg-green-700">
              I've Added the Environment Variables
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
