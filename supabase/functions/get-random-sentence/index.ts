import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@latest';

Deno.serve(async (req) => {
    try {
        const {difficulty} = await req.json();

        if (!difficulty) {
            return new Response(JSON.stringify({error: 'Difficulty is required.'}), {status: 400});
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!
        );

        // Use RPC function for better performance
        const {data, error} = await supabase
            .rpc('get_random_sentence_by_difficulty', {
                p_difficulty: difficulty
            });

        if (error) {
            console.error('Supabase RPC Error:', error);
            return new Response(JSON.stringify({error: error.message}), {status: 500});
        }

        if (!data || data.length === 0) {
            return new Response(JSON.stringify({error: 'No sentences found for this difficulty.'}), {status: 404});
        }

        return new Response(JSON.stringify(data[0]), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error('Unhandled error:', e);
        return new Response(JSON.stringify({error: e.message || 'An unexpected error occurred.'}), {status: 500});
    }
});
