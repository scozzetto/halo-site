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
        const { question, apiKey, demo = false } = JSON.parse(event.body);

        if (!question) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing question' })
            };
        }

        // Demo mode - return simulated responses
        if (demo || question.toLowerCase().includes('demo')) {
            const demoResponses = {
                'hello': 'Hello! I\'m Claude, integrated into the HALO Terminal. I can help you navigate the Be Well systems, write code, and answer questions about the platform.',
                'help': 'I can assist with:\n- Be Well system architecture\n- Code generation and debugging\n- Database queries\n- API documentation\n- Terminal commands\n\nJust ask me anything!',
                'biosync': 'BioSync is the AI-powered health assessment system in Be Well. It includes:\n- Patient intake forms\n- AI report generation using Claude\n- Blood work analysis with Dr. Bio\n- Practitioner dashboards\n- PDF document processing',
                'files': 'The main files in the Be Well system include:\n- `/index.html` - Main homepage\n- `/staff/` - Staff portal pages\n- `/js/` - JavaScript files\n- `/netlify/functions/` - Serverless functions\n- `/css/` - Stylesheets',
                'test': 'Demo mode is working! I\'m providing simulated responses. To use real AI, set your API key with: setkey <your-key>'
            };

            // Find best matching response
            const lowerQuestion = question.toLowerCase();
            for (const [key, response] of Object.entries(demoResponses)) {
                if (lowerQuestion.includes(key)) {
                    return {
                        statusCode: 200,
                        body: JSON.stringify({
                            success: true,
                            response: response,
                            demo: true
                        })
                    };
                }
            }

            // Default demo response
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    response: `[Demo Mode] I understand you're asking about "${question}". In demo mode, I provide limited responses. Set your API key for full functionality.`,
                    demo: true
                })
            };
        }

        // Check for environment variable if no API key provided
        const finalApiKey = apiKey || process.env.ANTHROPIC_API_KEY;
        
        if (!finalApiKey) {
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    error: 'No API key provided. Use "setkey" command or try "ai demo" for demo mode.' 
                })
            };
        }

        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': finalApiKey,
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