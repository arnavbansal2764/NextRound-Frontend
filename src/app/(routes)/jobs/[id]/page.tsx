'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { IoLocationSharp } from "react-icons/io5";
import { SiReacthookform } from "react-icons/si";
import { MdPerson2 } from "react-icons/md";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface JobItem {
  id: string;
  recruiterId: string;
  description: string;
  responsibilities: string;
  requirements: string;
  experience: string;
  location: string;
  jobType: string;
  mode: string;
  organization: string;
}

const responseExample = { recommendation: "Finding Recommendations" };

export default function JobPage() {
  const { id } = useParams();
  const [job, setJob] = useState<JobItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState('');

  useEffect(() => {
    if (typeof id === 'string') { 
      const fetchJob = async () => {
        try {
          const response = await axios.get(`/api/jobs/${id}`);
          setJob(response.data);
        } catch (error) {
          console.error('Error fetching job:', error);
          setError('Failed to load job details.');
        } finally {
          setLoading(false);
        }
      };

      fetchJob();
    }
  }, [id]);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const response = await axios.post('/api/ai/recommendation', job);
        setRecommendation(response.data.res.recommendation);
      } catch (error) {
        console.error('Error fetching recommendation:', error);
      }
    };

    if (job) {
      fetchRecommendation();
    }
  }, [job]);

  const handleApply = async (jobId: string) => {
    toast.promise(axios.put('/api/jobs/apply', {
      jobId: jobId
    }), {
      loading: "Applying...",
      success: "Application submitted successfully!",
      error: "Failed to submit application.",
    });
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-8">
        <Skeleton className="w-full h-12 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px] md:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-pink-200 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-200 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-yellow-600 mb-2">Job Not Found</h1>
            <p>The requested job could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-8 pt-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center text-indigo-800"
        variants={itemVariants}
      >
        Job Details
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Job Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="text-lg font-semibold flex items-center">
                  <IoLocationSharp className="mr-2 text-indigo-600" /> Location
                </li>
                <li className="text-lg font-semibold flex items-center">
                  <SiReacthookform className="mr-2 text-indigo-600" /> Type
                </li>
                <li className="text-lg font-semibold flex items-center">
                  <MdPerson2 className="mr-2 text-indigo-600" /> Job Title
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="h-full">
            <CardContent className="p-6">
              <ul className="space-y-4">
                <li className="flex items-center justify-between py-2">
                  <div className="font-semibold">Company</div>
                  <span className="bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full">
                    {job.organization}
                  </span>
                </li>
                <li className="flex items-center justify-between py-2">
                  <div className="font-semibold">Location</div>
                  <span className="bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full">
                    {job.location}
                  </span>
                </li>
                <li className="flex items-center justify-between py-2">
                  <div className="font-semibold">Type</div>
                  <span className="bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full">
                    {job.jobType}
                  </span>
                </li>
                <li className="flex items-center justify-between py-2">
                  <div className="font-semibold">Mode</div>
                  <span className="bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full">
                    {job.mode}
                  </span>
                </li>
                <li className="flex items-center justify-between py-2">
                  <div className="font-semibold">Experience</div>
                  <span className="bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full">
                    {job.experience}
                  </span>
                </li>
              </ul>

              <div className="mt-6">
                <h2 className="text-xl font-bold mb-2">Description</h2>
                <p className="text-gray-700">{job.description}</p>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-bold mb-2">Responsibilities</h2>
                <p className="text-gray-700">{job.responsibilities}</p>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-bold mb-2">Requirements</h2>
                <p className="text-gray-700">{job.requirements}</p>
              </div>

              <motion.div 
                className="mt-8 flex justify-center items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="default" 
                  size="lg" 
                  onClick={() => handleApply(job.id)}
                  className="w-1/3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                >
                  Apply Now
                </Button>
              </motion.div>

            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            {!recommendation ? (
              <p>{responseExample.recommendation}</p>
            ) : (
              <p>{recommendation}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

