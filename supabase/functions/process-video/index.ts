import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();
    
    if (!videoId) {
      throw new Error('videoId is required');
    }

    console.log(`Starting processing for video: ${videoId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get video details
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      throw new Error(`Video not found: ${videoError?.message}`);
    }

    // Update status to processing
    await supabase
      .from('videos')
      .update({ status: 'processing' })
      .eq('id', videoId);

    console.log(`Video status updated to processing`);

    // Step 1: Get video URL based on mode
    let audioUrl = '';
    
    if (video.mode === 'upload') {
      if (!video.storage_path) {
        throw new Error('Video storage_path is missing');
      }
      
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('uploads')
        .createSignedUrl(video.storage_path, 3600);

      if (downloadError || !fileData) {
        throw new Error(`Failed to get signed URL: ${downloadError?.message}`);
      }
      audioUrl = fileData.signedUrl;
      
    } else if (video.mode === 'youtube') {
      throw new Error('YouTube processing not yet implemented. Please download the video and upload it directly.');
      
    } else if (video.mode === 'drive') {
      // Convert Google Drive link to direct download link
      if (!video.source_url) {
        throw new Error('Google Drive URL is missing');
      }
      
      // Extract file ID from Google Drive URL
      // Format: https://drive.google.com/file/d/{FILE_ID}/view
      const fileIdMatch = video.source_url.match(/\/d\/([^\/]+)/);
      if (!fileIdMatch) {
        throw new Error('Invalid Google Drive URL format. Please use a valid share link.');
      }
      
      const fileId = fileIdMatch[1];
      // Use direct download URL
      audioUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      console.log(`Google Drive direct download URL: ${audioUrl}`);
    }

    console.log(`Audio URL obtained: ${audioUrl}`);

    // Step 2: Transcribe audio
    console.log('Starting transcription...');
    const transcribeResponse = await supabase.functions.invoke('transcribe-audio', {
      body: { audioUrl, videoId }
    });

    if (transcribeResponse.error) {
      throw new Error(`Transcription failed: ${transcribeResponse.error.message}`);
    }

    const { transcription, transcriptionId } = transcribeResponse.data;
    console.log(`Transcription completed: ${transcriptionId}`);

    // Step 3: Analyze transcription
    console.log('Starting analysis...');
    const analyzeResponse = await supabase.functions.invoke('analyze-transcription', {
      body: { transcription, videoId, transcriptionId }
    });

    if (analyzeResponse.error) {
      throw new Error(`Analysis failed: ${analyzeResponse.error.message}`);
    }

    console.log(`Analysis completed for video: ${videoId}`);

    // Update video status to completed
    await supabase
      .from('videos')
      .update({ status: 'completed' })
      .eq('id', videoId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Video processed successfully',
        data: analyzeResponse.data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing video:', error);
    
    // Update video status to failed if videoId exists
    const { videoId } = await req.json().catch(() => ({}));
    if (videoId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase
        .from('videos')
        .update({ 
          status: 'failed',
          error_message: error.message 
        })
        .eq('id', videoId);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
