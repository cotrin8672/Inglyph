/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import {createClient} from 'https://esm.sh/@supabase/supabase-js@latest';

Deno.serve(async (req) => {
    try {
        const {difficulty} = await req.json();

        if (!difficulty) {
            return new Response(JSON.stringify({error: 'Difficulty is required.'}), {status: 400});
        }

        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);

        // 1. Get count of sentences for the given difficulty
        const {count, error: countError} = await supabase
            .from('sentence')
            .select('id', {count: 'exact'})
            .eq('difficulty', difficulty);

        if (countError) {
            console.error('Supabase Count Error:', countError);
            return new Response(JSON.stringify({error: countError.message}), {status: 500});
        }

        if (count === 0) {
            return new Response(JSON.stringify({error: 'No sentences found for this difficulty.'}), {status: 404});
        }

        // 2. Generate a random offset
        const randomOffset = Math.floor(Math.random() * count);

        // 3. Fetch one sentence at the random offset
        const {data, error: selectError} = await supabase
            .from('sentence')
            .select('*')
            .eq('difficulty', difficulty)
            .range(randomOffset, randomOffset);

        if (selectError) {
            console.error('Supabase Select Error:', selectError);
            return new Response(JSON.stringify({error: selectError.message}), {status: 500});
        }

        if (!data || data.length === 0) {
            return new Response(JSON.stringify({error: 'Sentence not found at random offset.'}), {status: 404});
        }

        return new Response(JSON.stringify(data[0]), {headers: {'Content-Type': 'application/json'}});

    } catch (e) {
        console.error('Unhandled error:', e);
        return new Response(JSON.stringify({error: e.message || 'An unexpected error occurred.'}), {status: 500});
    }
});
