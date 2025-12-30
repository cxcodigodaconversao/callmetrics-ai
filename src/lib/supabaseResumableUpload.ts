import * as tus from 'tus-js-client';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = 'https://sqgwpenihrcdapptyltt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZ3dwZW5paHJjZGFwcHR5bHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExOTIxOTksImV4cCI6MjA3Njc2ODE5OX0.e3d6uAxc8qnN7wQxPJa-GMaovashORvUosGi8Zu-uOI';

interface UploadOptions {
  bucketName: string;
  objectName: string;
  file: File;
  onProgress?: (percentage: number) => void;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export async function resumableUpload({
  bucketName,
  objectName,
  file,
  onProgress,
  onSuccess,
  onError,
}: UploadOptions): Promise<string> {
  // Get the current session token
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !sessionData.session) {
    const error = new Error('Você precisa estar logado para fazer upload');
    onError?.(error);
    throw error;
  }

  const accessToken = sessionData.session.access_token;

  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: bucketName,
        objectName: objectName,
        contentType: file.type,
        cacheControl: '3600',
      },
      chunkSize: 6 * 1024 * 1024, // 6MB chunks
      onError: (error) => {
        console.error('TUS upload error:', error);
        onError?.(error);
        reject(error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
        console.log(`Upload progress: ${percentage}%`);
        onProgress?.(percentage);
      },
      onSuccess: () => {
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/${bucketName}/${objectName}`;
        console.log('TUS upload complete:', publicUrl);
        onSuccess?.(publicUrl);
        resolve(objectName);
      },
    });

    // Check if there's a previous upload to resume
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length) {
        console.log('Resuming previous upload...');
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      upload.start();
    });
  });
}

// Threshold for using resumable upload (50MB)
export const RESUMABLE_THRESHOLD_BYTES = 50 * 1024 * 1024;
