import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@latest';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const topics = [
    'daily routine', 'weather', 'food', 'travel', 'hobbies', 'culture', 'technology', 'nature',
    'health', 'education', 'sports', 'business', 'music', 'movies', 'art', 'history',
    'science', 'fashion', 'environment', 'transportation', 'shopping', 'family', 'holidays',
    'emotions', 'opinions', 'news', 'animals', 'architecture', 'mythology', 'philosophy',
    'relationships', 'work', 'literature', 'economics', 'politics', 'entertainment',
    'religion', 'urban life', 'rural life', 'innovation', 'language learning', 'technology trends',
    'social media', 'gaming', 'mental health', 'wellness', 'fitness', 'cooking', 'photography'
];

Deno.serve(async (req) => {
    try {
        const { difficulty, topic } = await req.json();
        
        if (!difficulty) {
            return new Response(JSON.stringify({
                error: 'Difficulty is required.'
            }), { status: 400 });
        }

        // Use provided topic or select random one
        const selectedTopic = topic || topics[Math.floor(Math.random() * topics.length)];

        // Generate sentence with Gemini API
        const geminiPrompt = `
            Generate a short English sentence for dictation practice and its Japanese translation based on the CEFR level: ${difficulty}.
            The sentence should be about "${selectedTopic}".
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
                contents: [{
                    parts: [{
                        text: geminiPrompt
                    }]
                }]
            })
        });

        if (!geminiRes.ok) {
            const errorText = await geminiRes.text();
            console.error('Gemini API Error:', errorText);
            return new Response(JSON.stringify({
                error: `Gemini API request failed: ${errorText}`
            }), { status: geminiRes.status });
        }

        const geminiData = await geminiRes.json();
        console.log('Gemini Data:', JSON.stringify(geminiData));

        let text_en: string;
        let text_ja: string;

        try {
            const raw = geminiData.candidates[0].content.parts[0].text;
            // Remove ```json ... ``` fences if present
            const fencedMatch = raw.match(/```json\s*([\s\S]*?)```/i);
            const jsonString = fencedMatch ? fencedMatch[1].trim() : raw.trim();
            
            const parsed = JSON.parse(jsonString);
            text_en = parsed.text_en;
            text_ja = parsed.text_ja;
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', parseError);
            return new Response(JSON.stringify({
                error: 'Failed to parse Gemini response.',
                rawResponse: geminiData
            }), { status: 500 });
        }

        // Save to Supabase database (use service_role key to bypass RLS)
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const { data: sentence, error: sentenceError } = await supabase
            .from('sentence')
            .insert({
                text_en,
                text_ja,
                difficulty
            })
            .select('id')
            .single();

        if (sentenceError) {
            console.error('Supabase Insert Error:', sentenceError);
            return new Response(JSON.stringify({
                error: sentenceError.message
            }), { status: 500 });
        }

        return new Response(JSON.stringify({
            success: true,
            sentenceId: sentence.id,
            text_en,
            text_ja,
            difficulty
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