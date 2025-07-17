import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@latest';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GOOGLE_CLOUD_API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY');

const topics = [
    'daily routine', 'weather', 'food', 'travel', 'hobbies', 'culture', 'technology', 'nature',
    'health', 'education', 'sports', 'business', 'music', 'movies', 'art', 'history',
    'science', 'fashion', 'environment', 'transportation', 'shopping', 'family', 'holidays',
    'emotions', 'opinions', 'news', 'animals', 'architecture', 'mythology', 'philosophy',
    'relationships', 'work', 'literature', 'economics', 'politics', 'entertainment',
    'religion', 'urban life', 'rural life', 'innovation', 'language learning', 'technology trends',
    'social media', 'gaming', 'mental health', 'wellness', 'fitness', 'cooking', 'photography'
];

const grammarElements = {
    A1: ['be_verb', 'present_simple', 'plural', 'this_that', 'there_is', 'articles', 'personal_pronouns'],
    A2: ['past_simple', 'present_continuous', 'past_continuous', 'going_to', 'will_future', 'can_could', 'have_to', 'modals_basic', 'to_infinitive', 'prepositions', 'question_words'],
    B1: ['present_perfect', 'present_perfect_continuous', 'comparatives_superlatives', 'if_first_conditional', 'if_second_conditional', 'relative_pronouns', 'gerunds', 'conjunctions', 'phrasal_verbs', 'quantifiers'],
    B2: ['passive_voice', 'past_perfect', 'if_third_conditional', 'reported_speech', 'wish', 'causative_verbs', 'modal_perfects'],
    C1: ['mixed_conditionals', 'participle_clauses', 'inversion', 'subjunctive', 'cleft_sentences', 'ellipsis']
};

const sentenceTypes = ['declarative', 'interrogative', 'imperative', 'exclamatory'];

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

function getAvailableGrammarElements(level: string): string[] {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const currentIndex = levels.indexOf(level);
    
    let available: string[] = [];
    for (let i = 0; i <= currentIndex; i++) {
        available = [...available, ...grammarElements[levels[i]]];
    }
    return available;
}

// Box-Muller transform for normal distribution
function generateNormalRandom(mean = 0, stdDev = 1): number {
    let u1 = Math.random();
    let u2 = Math.random();
    
    // Avoid log(0)
    while (u1 === 0) u1 = Math.random();
    
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
}

// Select difficulty based on normal distribution
function selectDifficultyWithNormalDistribution(): string {
    const difficulties = ['A1', 'A2', 'B1', 'B2', 'C1'];
    
    // Normal distribution centered at B1 (index 2), with stdDev of 1
    const mean = 2; // B1 is the center
    const stdDev = 1;
    
    let index = Math.round(generateNormalRandom(mean, stdDev));
    
    // Clamp to valid range [0, 4]
    index = Math.max(0, Math.min(4, index));
    
    return difficulties[index];
}

Deno.serve(async (req) => {
    try {
        const { difficulty, topic, count = 1, useNormalDistribution = false } = await req.json();
        
        // If useNormalDistribution is true, ignore difficulty parameter
        if (!difficulty && !useNormalDistribution) {
            return new Response(JSON.stringify({
                error: 'Either difficulty or useNormalDistribution must be specified.'
            }), { status: 400 });
        }

        if (count < 1 || count > 10) {
            return new Response(JSON.stringify({
                error: 'Count must be between 1 and 10.'
            }), { status: 400 });
        }

        // Initialize Supabase client
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const results = [];
        const difficultyDistribution = {};

        for (let i = 0; i < count; i++) {
            // Select difficulty based on mode
            const selectedDifficulty = useNormalDistribution 
                ? selectDifficultyWithNormalDistribution() 
                : difficulty;
            
            // Track distribution for reporting
            difficultyDistribution[selectedDifficulty] = (difficultyDistribution[selectedDifficulty] || 0) + 1;
            
            // Use provided topic or select random one
            const selectedTopic = topic || topics[Math.floor(Math.random() * topics.length)];
            
            // Select random grammar element based on difficulty
            const availableGrammar = getAvailableGrammarElements(selectedDifficulty);
            const selectedGrammar = availableGrammar[Math.floor(Math.random() * availableGrammar.length)];
            
            // Select random sentence type
            const selectedSentenceType = sentenceTypes[Math.floor(Math.random() * sentenceTypes.length)];

            // Generate sentence with Gemini API
            const geminiPrompt = `
                Generate a short English sentence for dictation practice and its Japanese translation.
                
                Requirements:
                - CEFR level: ${selectedDifficulty}
                - Topic: ${selectedTopic}
                - Grammar focus: ${selectedGrammar.replace(/_/g, ' ')}
                - Sentence type: ${selectedSentenceType}
                
                Grammar examples:
                - be_verb: "She is a teacher."
                - present_simple: "I work every day."
                - past_simple: "They visited Japan last year."
                - present_perfect: "I have lived here for 5 years."
                - if_first_conditional: "If it rains, I will stay home."
                - passive_voice: "The book was written by her."
                - articles: "I saw a cat. The cat was black."
                - personal_pronouns: "He gave it to her."
                - past_continuous: "I was reading when you called."
                - will_future: "I will help you tomorrow."
                - modals_basic: "You should study more."
                - to_infinitive: "I want to learn English."
                - prepositions: "The book is on the table."
                - question_words: "Where do you live?"
                - present_perfect_continuous: "I have been waiting for an hour."
                - gerunds: "I enjoy swimming."
                - conjunctions: "I stayed home because it was raining."
                - phrasal_verbs: "Please turn off the lights."
                - quantifiers: "I have some questions."
                - causative_verbs: "I had my hair cut."
                - modal_perfects: "You should have called me."
                - ellipsis: "Want some coffee?" (Do you want some coffee?)
                
                Sentence type examples:
                - declarative: State a fact
                - interrogative: Ask a question
                - imperative: Give a command or request
                - exclamatory: Express strong emotion with "What" or "How"
                
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
                continue; // Skip this iteration on error
            }

            const geminiData = await geminiRes.json();

            let text_en: string;
            let text_ja: string;

            try {
                const raw = geminiData.candidates[0].content.parts[0].text;
                const fencedMatch = raw.match(/```json\s*([\s\S]*?)```/i);
                const jsonString = fencedMatch ? fencedMatch[1].trim() : raw.trim();
                
                const parsed = JSON.parse(jsonString);
                text_en = parsed.text_en;
                text_ja = parsed.text_ja;
            } catch (parseError) {
                console.error('Failed to parse Gemini response:', parseError);
                continue; // Skip this iteration on parse error
            }

            // Save to database
            const { data: sentence, error: sentenceError } = await supabase
                .from('sentence')
                .insert({
                    text_en,
                    text_ja,
                    difficulty: selectedDifficulty
                })
                .select('id')
                .single();

            if (sentenceError) {
                console.error('Supabase Insert Error:', sentenceError);
                continue; // Skip this iteration on database error
            }

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
                // Continue without audio
                results.push({
                    sentenceId: sentence.id,
                    text_en,
                    text_ja,
                    difficulty: selectedDifficulty,
                    topic: selectedTopic,
                    grammar: selectedGrammar,
                    sentenceType: selectedSentenceType,
                    audioUrl: null,
                    voice: null
                });
                continue;
            }

            const ttsData = await ttsRes.json();
            const audioContent = ttsData.audioContent;

            // Convert base64 to binary for storage
            const audioBuffer = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));

            // Save to Supabase Storage
            const { error: storageError } = await supabase.storage
                .from('audio')
                .upload(`${sentence.id}.mp3`, audioBuffer, {
                    contentType: 'audio/mpeg',
                    upsert: true
                });

            if (storageError) {
                console.error('Supabase Storage Upload Error:', storageError);
                // Continue without audio URL
                results.push({
                    sentenceId: sentence.id,
                    text_en,
                    text_ja,
                    difficulty: selectedDifficulty,
                    topic: selectedTopic,
                    grammar: selectedGrammar,
                    sentenceType: selectedSentenceType,
                    audioUrl: null,
                    voice: randomVoice
                });
                continue;
            }

            // Get the public URL for the uploaded audio
            const { data: publicUrlData } = supabase.storage
                .from('audio')
                .getPublicUrl(`${sentence.id}.mp3`);

            results.push({
                sentenceId: sentence.id,
                text_en,
                text_ja,
                difficulty,
                topic: selectedTopic,
                grammar: selectedGrammar,
                sentenceType: selectedSentenceType,
                audioUrl: publicUrlData.publicUrl,
                voice: randomVoice
            });
        }

        return new Response(JSON.stringify({
            success: true,
            count: results.length,
            sentences: results,
            ...(useNormalDistribution && { difficultyDistribution })
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