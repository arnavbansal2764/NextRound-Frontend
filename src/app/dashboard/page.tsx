import { Suspense } from 'react'
import { getServerSession } from "next-auth/next"
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/authOptions'
import LoadingSpinner from '@/components/dashboard/loading-spinner'
import UserProfile from '@/components/dashboard/user-profile'
import DataAnalysis from '@/components/dashboard/data-analysis'
import InterviewHistory from '@/components/dashboard/interview-history'
import CulturalFitHistory from '@/components/dashboard/cultural-fit-history'
import PracticeInterviewHistory from '@/components/dashboard/practice-interview-history'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 pt-10">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          Welcome to Your Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Suspense fallback={<LoadingSpinner />}>
            <UserProfile />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <DataAnalysis />
          </Suspense>
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <InterviewHistory />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <CulturalFitHistory />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <PracticeInterviewHistory />
        </Suspense>
      </div>
    </div>
  )
}
