// Terminal AI Integration
class TerminalAI {
    constructor() {
        this.apiKey = localStorage.getItem('anthropic_api_key') || '';
        this.conversationHistory = [];
    }

    async askClaude(question) {
        if (!this.apiKey) {
            return {
                error: true,
                message: `API key not set. Use 'setkey <your-anthropic-api-key>' to configure.
Get your API key from: https://console.anthropic.com/settings/keys`
            };
        }

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
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
                    system: `You are Claude, integrated into the HALO Terminal Ultimate system. You have knowledge about:
- The Be Well LifeStyle Centers website and its systems
- The HALO business management platform
- Web development, databases, and APIs
- The terminal environment you're running in

Keep responses concise and terminal-friendly. Use markdown formatting sparingly.`
                })
            });

            if (!response.ok) {
                const error = await response.text();
                return {
                    error: true,
                    message: `API Error: ${response.status} - ${error}`
                };
            }

            const data = await response.json();
            return {
                error: false,
                message: data.content[0].text
            };
        } catch (error) {
            return {
                error: true,
                message: `Network error: ${error.message}`
            };
        }
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('anthropic_api_key', key);
        return 'API key saved successfully.';
    }

    clearApiKey() {
        this.apiKey = '';
        localStorage.removeItem('anthropic_api_key');
        return 'API key cleared.';
    }
}

// Export for use in terminal
window.TerminalAI = TerminalAI;