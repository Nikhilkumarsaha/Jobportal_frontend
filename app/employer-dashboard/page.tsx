"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LucideBriefcase, LucideUser, LucideBuilding, LucidePlus } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface Job {
  id: string;
  title: string;
  company: string;
  applicantsCount: number;
  status: 'active' | 'closed';
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  userType: 'employer';
  profileImage?: string;
}

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

       
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }

   
        const userResponse = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          
          if (userData.userType === 'jobseeker') {
            router.push('/dashboard');
            return;
          }
        } else {
          router.push('/auth/login');
          return;
        }

        const jobsResponse = await fetch(`${API_BASE_URL}/employer/jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (jobsResponse.ok) {
          const data = await jobsResponse.json();
          setJobs(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;


  const activeJobsCount = jobs.filter(job => job.status === 'active').length;
  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicantsCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <LucideUser className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <Link
                    href="/employer/profile"
                    className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 hover:bg-primary/90"
                    title="Update profile picture"
                  >
                    <LucideUser className="h-3 w-3" />
                  </Link>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.company || user.email}</p>
                </div>
              </div>
              <nav className="space-y-2">
                <Link
                  href="/employer-dashboard"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-white"
                >
                  <LucideBriefcase className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/employer/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  <LucideUser className="h-5 w-5" />
                  <span>Company Profile</span>
                </Link>
                <Link
                  href="/employer/jobs/create"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  <LucidePlus className="h-5 w-5" />
                  <span>Post a Job</span>
                </Link>
                <Link
                  href="/employer/jobs"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  <LucideBriefcase className="h-5 w-5" />
                  <span>Manage Jobs</span>
                </Link>
              </nav>
            </div>
          </div>
          <div className="col-span-1 md:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <LucideBriefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Jobs
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {activeJobsCount}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <LucideUser className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Applicants
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {totalApplicants}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <LucideBuilding className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Jobs Posted
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {jobs.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Job Listings</h3>
                <Link
                  href="/employer/jobs/create"
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
                >
                  Post New Job
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {jobs.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No jobs posted yet
                  </div>
                ) : (
                  jobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-500">{job.company}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            {job.applicantsCount} applicants
                          </span>
                          <Link
                            href={`/employer/jobs/${job.id}/applications`}
                            className="text-primary hover:text-primary/90 text-sm font-medium"
                          >
                            View Applications
                          </Link>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Posted on {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}