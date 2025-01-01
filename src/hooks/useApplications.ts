import { useState, useEffect } from 'react';

interface JobListing {
    title: string;
    organization: string;
    createdAt: string;
}

export interface Application {
    id: number;
    joblisting: JobListing;
}

export function useApplications() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchApplications() {
            try {
                const response = await fetch('/api/jobs/applied');
                if (!response.ok) {
                    throw new Error('Failed to fetch applications');
                }
                const data = await response.json();
                setApplications(data.jobs);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An error occurred'));
            } finally {
                setIsLoading(false);
            }
        }

        fetchApplications();
    }, []);

    return { applications, isLoading, error };
}

