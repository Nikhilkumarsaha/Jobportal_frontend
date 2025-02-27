import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadResume(file: File, userId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = fileName;
    
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, { upsert: true });
    
    if (error) {
      console.error('Error uploading:', error);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);
    console.log('New Public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadResume:', error);
    return null;
  }
}

export async function getResumeUrl(path: string): Promise<string | null> {
  try {
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(path);
    
    return publicUrl;
  } catch (error) {
    console.error('Error getting resume URL:', error);
    return null;
  }
}