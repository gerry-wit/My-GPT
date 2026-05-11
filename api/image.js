export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const { prompt, width = 1024, height = 1024, seed } = await req.json();

    if (!prompt) {
        return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    try {
        // Use Pollinations.ai (free, no key needed)
        const encodedPrompt = encodeURIComponent(prompt);
        const seedParam = seed ? `&seed=${seed}` : `&seed=${Date.now()}`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true${seedParam}`;

        return new Response(JSON.stringify({ imageUrl }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
