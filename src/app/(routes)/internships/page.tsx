'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

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

export default function internships() {
  const [jobData, setJobData] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await axios.get('/api/internships'); 
        setJobData(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {jobData.map((job) => (
        <div key={job.id}>
          <h3>{job.description}</h3>
          <p>{job.location}</p>
        </div>
      ))}
    </div>
  );
}
