import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("Supabase Config Check:", {
        hasUrl: !!url,
        hasKey: !!key,
        urlPrefix: url ? url.substring(0, 8) + "..." : "N/A"
    });

    if (!url || !key) {
        throw new Error("Supabase URL and Key are missing!");
    }

    return createBrowserClient(url, key);
}
