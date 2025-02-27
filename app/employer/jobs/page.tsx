"use client";

import { useState, useEffect } from 'react';
import { LucidePencil, LucideTrash2, LucideUsers } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: 'active' | 'closed';
  applicantsCount: number;
  createdAt: string;
}

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/employer/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      } else {
        setError('Failed to load jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/employer/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setJobs(jobs.filter(job => job.id !== jobId));
      } else {
        setError('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 flex justify-between items-center border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
              <p className="text-gray-600 mt-2">View and manage all your job postings</p>
            </div>
            <Link
              href="/employer/jobs/create"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Post New Job
            </Link>
          </div>

          {error && (
            <div className="p-6 bg-red-50 border-b border-red-200 text-red-700">
              {error}
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {jobs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No jobs posted yet
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.type}</span>
                        <span>•</span>
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Link
                        href={`/employer/jobs/${job.id}/applications`}
                        className="flex items-center text-primary hover:text-primary/90"
                      >
                        <LucideUsers className="h-5 w-5 mr-1" />
                        <span>{job.applicantsCount || 0} Applicants</span>
                      </Link>
                      <Link
                        href={`/employer/jobs/${job.id}/edit`}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <LucidePencil className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <LucideTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          job.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}