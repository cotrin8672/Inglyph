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

const grammarElements = {
    A1: ['be_verb', 'present_simple', 'plural', 'this_that', 'there_is', 'articles', 'personal_pronouns'],
    A2: ['past_simple', 'present_continuous', 'past_continuous', 'going_to', 'will_future', 'can_could', 'have_to', 'modals_basic', 'to_infinitive', 'prepositions', 'question_words'],
    B1: ['present_perfect', 'present_perfect_continuous', 'comparatives_superlatives', 'if_first_conditional', 'if_second_conditional', 'relative_pronouns', 'gerunds', 'conjunctions', 'phrasal_verbs', 'quantifiers'],
    B2: ['passive_voice', 'past_perfect', 'if_third_conditional', 'reported_speech', 'wish', 'causative_verbs', 'modal_perfects'],
    C1: ['mixed_conditionals', 'participle_clauses', 'inversion', 'subjunctive', 'cleft_sentences', 'ellipsis']
};

const sentenceTypes = ['declarative', 'interrogative', 'imperative', 'exclamatory'];

function getAvailableGrammarElements(level: string): string[] {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const currentIndex = levels.indexOf(level);
    
    let available: string[] = [];
    for (let i = 0; i <= currentIndex; i++) {
        available = [...available, ...grammarElements[levels[i]]];
    }
    return available;
}

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
        
        // Select random grammar element based on difficulty
        const availableGrammar = getAvailableGrammarElements(difficulty);
        const selectedGrammar = availableGrammar[Math.floor(Math.random() * availableGrammar.length)];
        
        // Select random sentence type
        const selectedSentenceType = sentenceTypes[Math.floor(Math.random() * sentenceTypes.length)];

        // Generate sentence with Gemini API
        const geminiPrompt = `
            Generate a short English sentence for dictation practice and its Japanese translation.
            
            Requirements:
            - CEFR level: ${difficulty}
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
            difficulty,
            topic: selectedTopic,
            grammar: selectedGrammar,
            sentenceType: selectedSentenceType
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