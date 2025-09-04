// Claude API Proxy for Terminal
exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { question, apiKey } = JSON.parse(event.body);

        if (!question || !apiKey) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing question or API key' })
            };
        }

        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 2048,
                messages: [
                    {
                        role: 'user',
                        content: question
                    }
                ],
                system: `You are Claude, integrated into the HALO Terminal system. You have knowledge about:
- The Be Well LifeStyle Centers website and its complete architecture
- The HALO business management platform
- Patient management, BioSync, Dr. Bio, and all Be Well systems
- Web development, Netlify, Supabase, and modern web technologies
- Terminal commands and system administration

Provide helpful, accurate, and concise responses. Use markdown formatting when appropriate.
When discussing Be Well systems, be specific about implementation details.`
            })
        });

        if (!response.ok) {
            const error = await response.text();
            return {
                statusCode: response.status,
                body: JSON.stringify({ 
                    error: `Claude API error: ${response.status}`,
                    details: error 
                })
            };
        }

        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: true,
                response: data.content[0].text
            })
        };
    } catch (error) {
        console.error('Claude proxy error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};