"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LucideDownload, LucideCheck, LucideX } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Application {
  id: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    title: string;
  };
  status: 'pending' | 'shortlisted' | 'rejected';
  coverLetter: string;
  resume: string;
  appliedDate: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
}

export default function JobApplicationsPage() {
  const params = useParams();
  const jobId = params.id as string;
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          return;
        }

        const jobResponse = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!jobResponse.ok) throw new Error('Failed to fetch job details');
        const jobData = await jobResponse.json();
        setJob(jobData);

        const applicationsResponse = await fetch(`${API_BASE_URL}/employer/jobs/${jobId}/applications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!applicationsResponse.ok) throw new Error('Failed to fetch applications');
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const updateApplicationStatus = async (applicationId: string, status: 'shortlisted' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setApplications(applications.map(app => 
          app.id === applicationId ? { ...app, status } : app
        ));
      } else {
        setError('Failed to update application status');
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Invalid date';
    }
  
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
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

  if (!job) return <div>Job not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Applications for {job.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{job.company}</p>
          </div>

          <div className="divide-y divide-gray-200">
            {applications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No applications received yet
              </div>
            ) : (
              applications.map((application) => (
                <div key={application.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {application.applicant.name}
                      </h3>
                      <p className="text-sm text-gray-500">{application.applicant.title}</p>
                      <p className="text-sm text-gray-500">{application.applicant.email}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          application.status === 'shortlisted'
                            ? 'bg-green-100 text-green-800'
                            : application.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                      {application.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                            className="p-1 rounded-full text-green-600 hover:bg-green-50"
                            title="Shortlist"
                          >
                            <LucideCheck className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            className="p-1 rounded-full text-red-600 hover:bg-red-50"
                            title="Reject"
                          >
                            <LucideX className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                      {application.resume && (
                        <a
                          href={application.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-full text-gray-600 hover:bg-gray-50"
                          title="View Resume"
                        >
                          <LucideDownload className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Cover Letter</h4>
                    <p className="mt-1 text-sm text-gray-600">{application.coverLetter}</p>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Applied on {formatDate(application.appliedDate)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}