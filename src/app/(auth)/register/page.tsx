import { Metadata } from 'next'
import { RegisterForm } from '@/components/forms/AuthForms'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join Artist Gallery - discover and collect extraordinary art',
}

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <RegisterForm />
    </div>
  )
}
