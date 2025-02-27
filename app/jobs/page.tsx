"use client";

import { useState, useEffect } from 'react';
import { LucideBriefcase, LucideMapPin, LucideDollarSign } from 'lucide-react';
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
  createdAt: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setJobs(data);
        } else {
          setError('Failed to fetch jobs');
        }
      } catch (err) {
        console.log(err)
        setError('An error occurred while fetching jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search jobs..."
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Location</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
              </select>
              <button className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90">
                Search
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-gray-600 mt-1">{job.company}</p>
                    <div className="flex gap-4 mt-2">
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
                    href={`/jobs/${job.id}`}
                    className="bg-white text-primary px-4 py-2 rounded-md border border-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    View Details
                  </Link>
                </div>
                <p className="mt-4 text-sm text-gray-600 line-clamp-2">{job.description}</p>
                <p className="mt-2 text-xs text-gray-500">
                  Posted on {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}

            {jobs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No jobs found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}