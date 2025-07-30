// Environment variable validation and configuration
const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const

const optionalEnvVars = ["NEXT_PUBLIC_SITE_URL"] as const

export function validateEnvironment() {
  const missingRequired = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missingRequired.length > 0) {
    const errorMessage = `
Missing required environment variables:
${missingRequired.map((v) => `- ${v}`).join("\n")}

Please add these to your .env.local file:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=your_production_domain (optional)
    `.trim()

    console.error(errorMessage)
    return { valid: false, error: errorMessage }
  }

  return { valid: true, error: null }
}

export function getEnvironmentConfig() {
  const validation = validateEnvironment()

  if (!validation.valid) {
    throw new Error(validation.error!)
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    siteUrl:
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "production" ? "https://your-production-domain.com" : "http://localhost:3000"),
  }
}
