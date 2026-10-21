export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: 'GROQ_API_KEY is missing in Vercel environment variables.' });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: [
                    { role: "system", content: "You are an expert AI assistant." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            const errorMsg = typeof data.error === 'string' ? data.error : (data.error?.message || JSON.stringify(data));
            return res.status(response.status).json({ error: errorMsg });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
