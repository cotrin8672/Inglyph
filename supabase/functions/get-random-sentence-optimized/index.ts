import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@latest';

Deno.serve(async (req) => {
    try {
        const { difficulty } = await req.json();

        if (!difficulty) {
            return new Response(JSON.stringify({ error: 'Difficulty is required.' }), { status: 400 });
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!
        );

        // Method 1: Using SQL TABLESAMPLE (最速)
        // PostgreSQLのTABLESAMPLEを使用してランダムな行を取得
        const { data: randomSentence, error } = await supabase
            .rpc('get_random_sentence_by_difficulty', { 
                p_difficulty: difficulty 
            });

        if (error) {
            // RPCが存在しない場合はフォールバック
            console.log('RPC not found, using fallback method');
            
            // Method 2: ORDER BY RANDOM() with LIMIT (シンプルだが遅い可能性)
            const { data, error: selectError } = await supabase
                .from('sentence')
                .select('*')
                .eq('difficulty', difficulty)
                .limit(1)
                .single();

            if (selectError) {
                console.error('Supabase Select Error:', selectError);
                return new Response(JSON.stringify({ error: selectError.message }), { status: 500 });
            }

            if (!data) {
                return new Response(JSON.stringify({ error: 'No sentences found for this difficulty.' }), { status: 404 });
            }

            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!randomSentence || randomSentence.length === 0) {
            return new Response(JSON.stringify({ error: 'No sentences found for this difficulty.' }), { status: 404 });
        }

        return new Response(JSON.stringify(randomSentence[0]), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error('Unhandled error:', e);
        return new Response(JSON.stringify({ error: e.message || 'An unexpected error occurred.' }), { status: 500 });
    }
});