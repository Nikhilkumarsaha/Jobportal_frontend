"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LucideUpload } from 'lucide-react';
import { uploadResume } from '@/lib/supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Job {
  id: string;
  title: string;
  company: string;
}

const applicationSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  coverLetter: z.string().min(10, 'Cover letter must be at least 10 characters'),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function ApplyJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

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

  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { 
        setError('File size should be less than 10MB');
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    if (!resumeFile) {
      setError('Please upload your resume');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setUploadProgress(10);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;
      
      if (!userId) {
        setError('User information not found. Please log in again.');
        router.push('/auth/login');
        return;
      }

      setUploadProgress(30);
      console.log('Starting resume upload to Supabase...');
      
      const resumeUrl = await uploadResume(resumeFile, userId);
      console.log("resumeUrl",resumeUrl)
      if (!resumeUrl) {
        setError('Failed to upload resume. Please try again.');
        setIsSubmitting(false);
        return;
      }

      console.log('Resume uploaded successfully, URL:', resumeUrl);
      setUploadProgress(70);

      const applicationData = {
        jobId,
        fullName: data.fullName,
        email: data.email,
        coverLetter: data.coverLetter,
        resumeUrl
      };

      console.log('Submitting application with data:', applicationData);
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(applicationData),
      });

      setUploadProgress(100);

      if (response.ok) {
        console.log('Application submitted successfully');
        router.push('/applications');
      } else {
        const errorData = await response.json();
        console.error('Application submission error:', errorData);
        setError(errorData.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('An error occurred while submitting your application');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          Job not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h1>
            <p className="text-gray-600 mt-2">{job.company}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 border-t border-gray-200">
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...register('fullName')}
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                Resume (PDF)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <LucideUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="resume-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                    >
                      <span>Upload a file</span>
                      <input
                        id="resume-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf"
                        onChange={handleResumeChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  {resumeFile && (
                    <p className="text-sm text-green-600">
                      Selected file: {resumeFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
                Cover Letter
              </label>
              <textarea
                {...register('coverLetter')}
                rows={6}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Tell us why you're interested in this position and what makes you a great candidate..."
              />
              {errors.coverLetter && (
                <p className="mt-1 text-sm text-red-600">{errors.coverLetter.message}</p>
              )}
            </div>

            {isSubmitting && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {uploadProgress < 100 ? 'Uploading resume and submitting application...' : 'Application submitted!'}
                </p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}