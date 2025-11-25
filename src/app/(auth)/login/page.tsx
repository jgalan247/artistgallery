import { Metadata } from 'next'
import { LoginForm } from '@/components/forms/AuthForms'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Artist Gallery account',
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <LoginForm />
    </div>
  )
}
