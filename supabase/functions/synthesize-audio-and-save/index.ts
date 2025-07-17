import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@latest';

const GOOGLE_CLOUD_API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY');

// Random voice configurations (Standard voices only for cost efficiency)
const voices = [
    // US voices
    { languageCode: 'en-US', name: 'en-US-Standard-C' },  // Female
    { languageCode: 'en-US', name: 'en-US-Standard-E' },  // Female
    { languageCode: 'en-US', name: 'en-US-Standard-G' },  // Female
    { languageCode: 'en-US', name: 'en-US-Standard-B' },  // Male
    { languageCode: 'en-US', name: 'en-US-Standard-D' },  // Male
    { languageCode: 'en-US', name: 'en-US-Standard-I' },  // Male
    // GB voices
    { languageCode: 'en-GB', name: 'en-GB-Standard-A' },  // Female
    { languageCode: 'en-GB', name: 'en-GB-Standard-C' },  // Female
    { languageCode: 'en-GB', name: 'en-GB-Standard-F' },  // Female
    { languageCode: 'en-GB', name: 'en-GB-Standard-B' },  // Male
    { languageCode: 'en-GB', name: 'en-GB-Standard-D' },  // Male
    // AU voices
    { languageCode: 'en-AU', name: 'en-AU-Standard-A' },  // Female
    { languageCode: 'en-AU', name: 'en-AU-Standard-C' },  // Female
    { languageCode: 'en-AU', name: 'en-AU-Standard-B' },  // Male
    { languageCode: 'en-AU', name: 'en-AU-Standard-D' }   // Male
];

Deno.serve(async (req) => {
    try {
        const { sentenceId } = await req.json();
        
        if (!sentenceId) {
            return new Response(JSON.stringify({
                error: 'sentenceId is required.'
            }), { status: 400 });
        }

        // Initialize Supabase client
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Fetch sentence from database
        const { data: sentence, error: fetchError } = await supabase
            .from('sentence')
            .select('text_en')
            .eq('id', sentenceId)
            .single();

        if (fetchError || !sentence) {
            console.error('Sentence fetch error:', fetchError);
            return new Response(JSON.stringify({
                error: `Sentence not found with id: ${sentenceId}`
            }), { status: 404 });
        }

        const text_en = sentence.text_en;

        // Select random voice
        const randomVoice = voices[Math.floor(Math.random() * voices.length)];

        // Synthesize audio with Google Cloud TTS API
        const ttsRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: {
                    text: text_en
                },
                voice: {
                    languageCode: randomVoice.languageCode,
                    name: randomVoice.name
                },
                audioConfig: {
                    audioEncoding: 'MP3'
                }
            })
        });

        if (!ttsRes.ok) {
            const errorText = await ttsRes.text();
            console.error('Google Cloud TTS API Error:', errorText);
            return new Response(JSON.stringify({
                error: `Google Cloud TTS API request failed: ${errorText}`
            }), { status: ttsRes.status });
        }

        const ttsData = await ttsRes.json();
        const audioContent = ttsData.audioContent;

        // Convert base64 to binary for storage
        const audioBuffer = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));

        // Save to Supabase Storage
        const { error: storageError } = await supabase.storage
            .from('audio')
            .upload(`${sentenceId}.mp3`, audioBuffer, {
                contentType: 'audio/mpeg',
                upsert: true // Allow overwriting if file already exists
            });

        if (storageError) {
            console.error('Supabase Storage Upload Error:', storageError);
            return new Response(JSON.stringify({
                error: storageError.message
            }), { status: 500 });
        }

        // Get the public URL for the uploaded audio
        const { data: publicUrlData } = supabase.storage
            .from('audio')
            .getPublicUrl(`${sentenceId}.mp3`);

        return new Response(JSON.stringify({
            success: true,
            sentenceId,
            audioUrl: publicUrlData.publicUrl,
            audioSize: audioBuffer.length,
            voice: randomVoice
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error('Unhandled error:', e);
        return new Response(JSON.stringify({
            error: e.message || 'An unexpected error occurred.'
        }), { status: 500 });
    }
});