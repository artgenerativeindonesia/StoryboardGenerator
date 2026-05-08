import type { Metadata } from 'next'
import { LoginCard } from '@/components/auth/LoginCard'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to StoryboardGenerator to start creating AI-powered storyboards.',
}

export default function LoginPage() {
  return <LoginCard />
}
