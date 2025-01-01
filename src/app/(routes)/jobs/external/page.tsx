"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Briefcase, MapPin, Clock, ExternalLink, Loader2 } from 'lucide-react'


export default function DashboardPage() {
  const [jobs, setJobs] = useState<string[]>([])
  const [jobType, setJobType] = useState<"internship" | "private" | "government">("internship")
  const [role, setRole] = useState<string>("")
  const [location, setLocation] = useState<string>("")
  const [years, setYears] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchScrapedJobs = async () => {
    setIsLoading(true)
    setJobs([]) // Clear previous results
    try {
      const response = await axios.post('/api/ai/scrapejob', {
        jobType,
        role,
        location,
        years
      })
      if (response.status !== 200) {
        throw new Error('Failed to fetch scraped jobs')
      }
      console.log(response.data)
      setJobs(response.data.jobs)
      console.log(jobs)
      toast.success(`${response.data.length} jobs fetched successfully`)
    } catch (error) {
      console.error('Error fetching scraped jobs:', error)
      toast.error('Failed to fetch scraped jobs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchScrapedJobs()
  }

  return (
    <div className="min-h-screen  p-8 mt-20">
      <Card className="max-w-4xl mx-auto overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-primary to-primary-foreground p-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">Job Scraper Dashboard</CardTitle>
          </CardHeader>
        </div>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <Select value={jobType} onValueChange={(value) => setJobType(value as "internship" | "private" | "government")}>
                  <SelectTrigger id="jobType">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="years">Years of Experience</Label>
                <Input
                  id="years"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="e.g. 2-3"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Jobs...
                </>
              ) : (
                "Fetch Jobs"
              )}
            </Button>
          </form>
          
          {jobs.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Scraped Jobs</h2>
              <ul className="space-y-4">
                {jobs.map((job, index) => (
                  <li key={index} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-primary">{job}</h3>
                      <a href={job} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" />
                       
                      </div>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-2" />
                       
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : isLoading ? (
            <div className="mt-8 text-center text-gray-600">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Fetching jobs...</p>
            </div>
          ) : (
            <div className="mt-8 text-center text-gray-600">
              <p>No jobs fetched yet. Use the form above to search for jobs.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

