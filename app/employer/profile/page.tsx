"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { LucideUpload, LucideBuilding } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const employerProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().min(2, 'Industry must be at least 2 characters'),
  companySize: z.string(),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  description: z.string().min(10, 'Company description must be at least 10 characters'),
  website: z.string().url('Invalid website URL'),
});

type EmployerProfileFormData = z.infer<typeof employerProfileSchema>;
interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  industry: string;
  companySize: string;
  location: string;
  description: string;
  website: string;
  companyLogo: string | null;
}

export default function EmployerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EmployerProfileFormData>({
    resolver: zodResolver(employerProfileSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/employer/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setCompanyLogo(data.companyLogo);
          
          setValue('name', data.name);
          setValue('company', data.company);
          setValue('industry', data.industry);
          setValue('companySize', data.companySize);
          setValue('location', data.location);
          setValue('description', data.description);
          setValue('website', data.website);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      }
    };

    fetchProfile();
  }, [setValue]);

  const handleCompanyLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('companyLogo', file);

      try {
        const response = await fetch(`${API_BASE_URL}employer/profile/logo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          setCompanyLogo(data.logoUrl);
          setSuccess('Company logo updated successfully');
        }
      } catch (error) {
        console.error('Error uploading company logo:', error);
        setError('Failed to upload company logo');
      }
    }
  };

  const onSubmit = async (data: EmployerProfileFormData) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/employer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedData = await response.json();
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.name = updatedData.name;
          userData.company = updatedData.company;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        setSuccess('Company profile updated successfully');

        setTimeout(() => {
          router.push('/employer-dashboard');
        }, 1500);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      console.log(err)
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
            <p className="text-gray-600 mt-2">Update your company information and logo</p>
          </div>

          <div className="border-t border-gray-200">
            <div className="p-6">
              <div className="flex items-center space-x-6 mb-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                    {companyLogo ? (
                      <img src={companyLogo} alt={user.company} className="h-full w-full object-cover" />
                    ) : (
                      <LucideBuilding className="h-12 w-12 text-gray-500" />
                    )}
                  </div>
                  <label
                    htmlFor="company-logo"
                    className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/90"
                  >
                    <LucideUpload className="h-4 w-4" />
                    <input
                      type="file"
                      id="company-logo"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCompanyLogoUpload}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user.company}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Person Name
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    {...register('company')}
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <input
                    {...register('industry')}
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.industry && (
                    <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Size
                  </label>
                  <select
                    {...register('companySize')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501+">501+ employees</option>
                  </select>
                  {errors.companySize && (
                    <p className="mt-1 text-sm text-red-600">{errors.companySize.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    {...register('location')}
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <input
                    {...register('website')}
                    type="url"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.website && (
                    <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}