"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LucideBuilding, LucideBriefcase, LucideCalendar, LucideDownload } from 'lucide-react';

interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
  };
  status: 'pending' | 'shortlisted' | 'rejected';
  appliedDate: string;
  coverLetter: string;
  resume: string;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch('/api/applications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setApplications(data);
        } else if (response.status === 401) {
          router.push('/auth/login');
        } else {
          setError('Failed to fetch applications');
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while fetching applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600 mt-2">Track the status of your job applications</p>
          </div>

          <div className="divide-y divide-gray-200">
            {applications.length === 0 ? (
              <div className="p-6 text-center">
                <LucideBriefcase className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start applying for jobs to see your applications here.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/jobs')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Browse Jobs
                  </button>
                </div>
              </div>
            ) : (
              applications.map((application) => (
                <div key={application.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {application.job.title}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <LucideBuilding className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {application.job.company}
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <LucideBriefcase className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {application.job.type}
                        </span>
                        <span className="flex items-center">
                          <LucideCalendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          Applied {new Date(application.appliedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                      {application.resume && (
                        <a
                          href={application.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-gray-500"
                          title="View Resume"
                        >
                          <LucideDownload className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Cover Letter</h4>
                    <p className="mt-2 text-sm text-gray-600">{application.coverLetter}</p>
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