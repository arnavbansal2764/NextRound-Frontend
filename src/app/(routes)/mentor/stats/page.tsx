'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, CheckCircle, XCircle } from 'lucide-react'
import React, { useEffect, useState } from "react"

interface Schedule {
  id: string
  mentorName: string
  mentorId: string
  dateTime: string
  purpose: string
  duration: string
  details: string
  accepted: string
}

interface Mentor {
  id: string
  userId: string
  name: string
  designation: string
  aboutMentor: string
  qualifications: string
  experience: string
  email: string
  skills: string
  totalMeetings: number
  acceptedMeetings: number
  deniedMeetings: number
  schedule: Schedule[]
}

const MentorPage: React.FC = () => {
  const [mentorData, setMentorData] = useState<Mentor | null>(null)

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        const response = await fetch("/api/mentor/fetch")
        const data: Mentor = await response.json()
        setMentorData(data)
      } catch (error) {
        console.error("Failed to fetch mentor data", error)
      }
    }

    fetchMentorData()
  }, [])

  if (!mentorData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 mt-20">
      <Card className="max-w-4xl mx-auto overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-primary to-primary-foreground p-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">{mentorData.name}</CardTitle>
            <p className="text-primary-foreground/80">{mentorData.designation}</p>
          </CardHeader>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<CalendarDays className="h-8 w-8 text-primary" />}
              title="Total Meetings"
              value={mentorData.totalMeetings}
            />
            <StatCard
              icon={<CheckCircle className="h-8 w-8 text-green-500" />}
              title="Accepted Meetings"
              value={mentorData.acceptedMeetings}
            />
            <StatCard
              icon={<XCircle className="h-8 w-8 text-red-500" />}
              title="Denied Meetings"
              value={mentorData.deniedMeetings}
            />
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">About Me</h3>
            <p className="text-muted-foreground">{mentorData.aboutMentor}</p>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {mentorData.skills.split(',').map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {skill.trim()}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => (
  <div className="bg-card text-card-foreground rounded-lg p-4 shadow-md flex items-center space-x-4 ">
    {icon}
    <div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
)

export default MentorPage

