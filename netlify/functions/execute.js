// Command Execution API
// WARNING: This is for demonstration only
// Real command execution would require strict security measures

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { command } = JSON.parse(event.body);

        // Security check - only allow specific safe commands
        const allowedCommands = [
            'date',
            'echo',
            'node --version',
            'npm --version',
            'git --version'
        ];

        const isAllowed = allowedCommands.some(allowed => 
            command.startsWith(allowed)
        );

        if (!isAllowed) {
            return {
                statusCode: 403,
                body: JSON.stringify({
                    success: false,
                    error: 'Command not allowed for security reasons'
                })
            };
        }

        // In a real implementation, you would:
        // 1. Run in a sandboxed container
        // 2. Limit execution time
        // 3. Restrict network access
        // 4. Log all executions
        
        // Simulated responses
        const responses = {
            'date': new Date().toString(),
            'node --version': 'v18.17.0',
            'npm --version': '9.6.7',
            'git --version': 'git version 2.34.1'
        };

        const output = responses[command] || `Executed: ${command}`;

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                output: output,
                exitCode: 0
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};