// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from 'https://esm.sh/@supabase/supabase-js@latest';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GOOGLE_CLOUD_API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY');
const topics = [
    'daily routine',
    'weather',
    'food',
    'travel',
    'hobbies',
    'culture',
    'technology',
    'nature',
    'health',
    'education',
    'sports',
    'business',
    'music',
    'movies',
    'art',
    'history',
    'science',
    'fashion',
    'environment',
    'transportation',
    'shopping',
    'family',
    'holidays',
    'emotions',
    'opinions',
    'news',
    'animals',
    'architecture',
    'mythology',
    'philosophy',
    'relationships',
    'work',
    'education',
    'literature',
    'economics',
    'politics',
    'entertainment',
    'religion',
    'spaces',
    'urban life',
    'rural life',
    'innovation',
    'travel experiences',
    'language learning',
    'technology trends',
    'social media',
    'gaming',
    'mental health',
    'wellness',
    'DIY projects',
    'fitness',
    'cooking tips',
    'fashion trends',
    'weather phenomena',
    'wildlife',
    'space exploration',
    'virtual reality',
    'art movements',
    'film genres',
    'music genres',
    'digital art',
    'architecture styles',
    'gardening',
    'photography',
    'education methods',
    'career advice',
    'startup culture',
    'sustainability',
    'renewable energy',
    'marine life',
    'mountain sports',
    'meditation',
    'linguistics',
    'ancient civilizations',
    'modern art',
    'culinary arts',
    'poetry',
    'graphic design',
    'robotics',
    'cryptocurrency',
    'augmented reality',
    'machine learning',
    'quantum computing',
    'blockchain',
    'astrology'
];
Deno.serve(async (req) => {
    try {
        const {difficulty} = await req.json();
        if (!difficulty) {
            return new Response(JSON.stringify({
                error: 'Difficulty is required.'
            }), {
                status: 400
            });
        }
        // 1. Generate sentence with Gemini API
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const geminiPrompt = `
      Generate a short English sentence for dictation practice and its Japanese translation based on the CEFR level: ${difficulty}.
      The sentence should be about "${topic}".
      Vary sentence types each time: statements, questions, exclamations, conditionals, or imperatives.
      The output MUST be a JSON object with two keys: "text_en" and "text_ja".
      Example: {"text_en": "Hello, world.", "text_ja": "こんにちは、世界。"}
    `;
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
            method: 'POST',
            headers: {
                "x-goog-api-key": GEMINI_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: geminiPrompt
                            }
                        ]
                    }
                ]
            })
        });
        if (!geminiRes.ok) {
            const errorText = await geminiRes.text();
            console.error('Gemini API Error:', errorText);
            return new Response(JSON.stringify({
                error: `Gemini API request failed: ${errorText}`
            }), {
                status: geminiRes.status
            });
        }
        const geminiData = await geminiRes.json();
        console.log('Gemini Data:', JSON.stringify(geminiData));
        let text_en;
        let text_ja;
        try {
            const raw = geminiData.candidates[0].content.parts[0].text;
            // ```json … ``` を削る
            const fencedMatch = raw.match(/```json\s*([\s\S]*?)```/i);
            const jsonString = fencedMatch ? fencedMatch[1].trim() : raw.trim();
            // パース
            const parsed = JSON.parse(jsonString);
            text_en = parsed.text_en;
            text_ja = parsed.text_ja;
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', parseError);
            return new Response(JSON.stringify({
                error: 'Failed to parse Gemini response.',
                rawResponse: geminiData
            }), {
                status: 500
            });
        }
        // 2. Synthesize audio with Google Cloud TTS API
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
                    languageCode: 'en-US',
                    ssmlGender: 'NEUTRAL'
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
            }), {
                status: ttsRes.status
            });
        }
        const ttsData = await ttsRes.json();
        const audioContent = atob(ttsData.audioContent);
        // 3. Save to Supabase
        const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'));
        const {data: sentence, error: sentenceError} = await supabase.from('sentence').insert({
            text_en,
            text_ja,
            difficulty
        }).select('id').single();
        if (sentenceError) {
            console.error('Supabase Insert Error:', sentenceError);
            return new Response(JSON.stringify({
                error: sentenceError.message
            }), {
                status: 500
            });
        }
        const {error: storageError} = await supabase.storage.from('audio') // Use 'audio' bucket directly as per GEMINI.md
            .upload(`${sentence.id}.mp3`, audioContent, {
                contentType: 'audio/mpeg',
                upsert: false
            });
        if (storageError) {
            console.error('Supabase Storage Upload Error:', storageError);
            return new Response(JSON.stringify({
                error: storageError.message
            }), {
                status: 500
            });
        }
        return new Response(JSON.stringify({
            success: true,
            sentenceId: sentence.id
        }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (e) {
        console.error('Unhandled error:', e);
        return new Response(JSON.stringify({
            error: e.message || 'An unexpected error occurred.'
        }), {
            status: 500
        });
    }
});
