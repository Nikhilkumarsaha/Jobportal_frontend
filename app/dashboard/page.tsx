"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LucideBriefcase, LucideUser, LucideBuilding, LucideFile } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    company: string;
  };
  status: 'pending' | 'shortlisted' | 'rejected';
  appliedDate: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  userType: 'jobseeker' | 'employer';
  profileImage?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
          setUser(JSON.parse(storedUser));
        }

        const userResponse = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          if (userData.userType === 'employer') {
            router.push('/employer-dashboard');
            return;
          }
        } else {
          router.push('/auth/login');
          return;
        }

        const applicationsResponse = await fetch(`${API_BASE_URL}/applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (applicationsResponse.ok) {
          setApplications(await applicationsResponse.json());
        } else {
          setError('Failed to fetch applications');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-8 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-gray-100">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <LucideUser className="h-6 w-6 text-gray-500" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <nav className="mt-6 space-y-3">
            {[
              { href: '/dashboard', icon: LucideBriefcase, label: 'Dashboard' },
              { href: '/profile', icon: LucideUser, label: 'Profile' },
              { href: '/jobs', icon: LucideBriefcase, label: 'Browse Jobs' },
              { href: '/applications', icon: LucideFile, label: 'Applications' }
            ].map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href} className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                <Icon className="h-5 w-5 text-primary" />
                <span className="ml-3">{label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="md:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Total Applications', count: applications.length, icon: LucideBriefcase },
              { label: 'Shortlisted', count: applications.filter(app => app.status === 'shortlisted').length, icon: LucideBuilding },
              { label: 'Pending Review', count: applications.filter(app => app.status === 'pending').length, icon: LucideFile }
            ].map(({ label, count, icon: Icon }) => (
              <div key={label} className="bg-white p-6 rounded-lg shadow-md flex items-center">
                <Icon className="h-6 w-6 text-primary" />
                <div className="ml-4">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-lg font-semibold text-gray-900">{count}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Recent Applications</h3>
            </div>
            <div className="p-6 space-y-4">
              {applications.length === 0 ? (
                <p className="text-center text-gray-500">No applications yet.</p>
              ) : (
                applications.slice(0, 5).map(({ id, job, status, appliedDate }) => (
                  <div key={id} className="flex justify-between items-center border-b pb-4 last:border-b-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{job.title}</h4>
                      <p className="text-xs text-gray-500">{job.company}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${status === 'shortlisted' ? 'bg-green-100 text-green-800' : status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
