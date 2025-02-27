"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LucideMapPin, LucideBriefcase, LucideDollarSign, LucideBuilding } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  requirements: string;
  experience: string;
  employer: {
    id: string;
    company: string;
    website?: string;
    description?: string;
  };
  createdAt: string;
}

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          setJob(data);
        } else {
          setError('Failed to load job details');
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('An error occurred while loading the job details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          {error || 'Job not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-lg text-gray-600 mt-1">{job.company}</p>
                <div className="flex gap-4 mt-3">
                  <span className="flex items-center text-sm text-gray-500">
                    <LucideMapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <LucideBriefcase className="w-4 h-4 mr-1" />
                    {job.type}
                  </span>
                  {job.salary && (
                    <span className="flex items-center text-sm text-gray-500">
                      <LucideDollarSign className="w-4 h-4 mr-1" />
                      {job.salary}
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/jobs/${job.id}/apply`}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90"
              >
                Apply Now
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">About the Role</h2>
              <p className="mt-4 text-gray-600 whitespace-pre-line">{job.description}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">Requirements</h2>
              <div className="mt-4 text-gray-600 whitespace-pre-line">
                {job.requirements}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">Experience Level</h2>
              <p className="mt-4 text-gray-600">{job.experience}</p>
            </section>
            <section className="bg-gray-50 -mx-6 px-6 py-4 mt-8">
              <div className="flex items-center">
                <LucideBuilding className="w-12 h-12 text-gray-400" />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">About {job.employer.company}</h3>
                  <p className="text-gray-600 mt-1">
                    {job.employer.description || 'Leading company in its industry.'}
                  </p>
                  {job.employer.website && (
                    <a 
                      href={job.employer.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:text-primary/90 mt-2 inline-block"
                    >
                      Visit website →
                    </a>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}