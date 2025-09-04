// Terminal Backend - Real System Integration
// This provides actual file system and command execution capabilities

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Security: Define allowed operations and paths
const ALLOWED_PATHS = [
    '/Users/silviomac/Library/CloudStorage/Dropbox/WEBSITES_SECURE_BACKUP/be-well-website',
    '/Users/silviomac/Library/CloudStorage/Dropbox/WEBSITES_SECURE_BACKUP/halo-corporate-site'
];

const ALLOWED_COMMANDS = [
    'ls', 'cat', 'pwd', 'find', 'grep', 'head', 'tail',
    'git status', 'git log', 'git diff',
    'npm list', 'node --version'
];

// Verify path is within allowed directories
function isPathAllowed(requestedPath) {
    const absolute = path.resolve(requestedPath);
    return ALLOWED_PATHS.some(allowed => absolute.startsWith(allowed));
}

// Verify command is allowed
function isCommandAllowed(command) {
    return ALLOWED_COMMANDS.some(allowed => command.startsWith(allowed));
}

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { action, ...params } = JSON.parse(event.body);

        // Check authentication (in production, verify proper auth)
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        switch (action) {
            case 'readFile': {
                const { filePath } = params;
                
                if (!isPathAllowed(filePath)) {
                    return {
                        statusCode: 403,
                        body: JSON.stringify({ error: 'Access denied to this path' })
                    };
                }

                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ 
                            success: true, 
                            content,
                            path: filePath
                        })
                    };
                } catch (err) {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({ 
                            error: 'File not found',
                            details: err.message 
                        })
                    };
                }
            }

            case 'listDirectory': {
                const { dirPath } = params;
                
                if (!isPathAllowed(dirPath)) {
                    return {
                        statusCode: 403,
                        body: JSON.stringify({ error: 'Access denied to this path' })
                    };
                }

                try {
                    const files = await fs.readdir(dirPath);
                    const details = await Promise.all(
                        files.map(async (file) => {
                            const fullPath = path.join(dirPath, file);
                            const stats = await fs.stat(fullPath);
                            return {
                                name: file,
                                type: stats.isDirectory() ? 'directory' : 'file',
                                size: stats.size,
                                modified: stats.mtime
                            };
                        })
                    );

                    return {
                        statusCode: 200,
                        body: JSON.stringify({ 
                            success: true, 
                            files: details,
                            path: dirPath
                        })
                    };
                } catch (err) {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({ 
                            error: 'Directory not found',
                            details: err.message 
                        })
                    };
                }
            }

            case 'executeCommand': {
                const { command, cwd } = params;
                
                if (!isCommandAllowed(command)) {
                    return {
                        statusCode: 403,
                        body: JSON.stringify({ 
                            error: 'Command not allowed',
                            allowed: ALLOWED_COMMANDS 
                        })
                    };
                }

                if (cwd && !isPathAllowed(cwd)) {
                    return {
                        statusCode: 403,
                        body: JSON.stringify({ error: 'Working directory not allowed' })
                    };
                }

                try {
                    const { stdout, stderr } = await execPromise(command, {
                        cwd: cwd || process.cwd(),
                        timeout: 30000 // 30 second timeout
                    });

                    return {
                        statusCode: 200,
                        body: JSON.stringify({ 
                            success: true, 
                            stdout,
                            stderr,
                            command
                        })
                    };
                } catch (err) {
                    return {
                        statusCode: 500,
                        body: JSON.stringify({ 
                            error: 'Command execution failed',
                            details: err.message,
                            stderr: err.stderr,
                            stdout: err.stdout
                        })
                    };
                }
            }

            case 'writeFile': {
                const { filePath, content } = params;
                
                if (!isPathAllowed(filePath)) {
                    return {
                        statusCode: 403,
                        body: JSON.stringify({ error: 'Access denied to this path' })
                    };
                }

                // Additional safety: only allow writing to specific file types
                const allowedExtensions = ['.txt', '.md', '.json', '.js', '.html', '.css'];
                if (!allowedExtensions.some(ext => filePath.endsWith(ext))) {
                    return {
                        statusCode: 403,
                        body: JSON.stringify({ error: 'File type not allowed' })
                    };
                }

                try {
                    await fs.writeFile(filePath, content, 'utf8');
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ 
                            success: true, 
                            message: 'File written successfully',
                            path: filePath
                        })
                    };
                } catch (err) {
                    return {
                        statusCode: 500,
                        body: JSON.stringify({ 
                            error: 'Failed to write file',
                            details: err.message 
                        })
                    };
                }
            }

            case 'searchFiles': {
                const { pattern, directory } = params;
                
                if (!isPathAllowed(directory)) {
                    return {
                        statusCode: 403,
                        body: JSON.stringify({ error: 'Access denied to this path' })
                    };
                }

                try {
                    // Use grep for searching
                    const { stdout } = await execPromise(
                        `grep -r "${pattern}" . --include="*.js" --include="*.html" --include="*.css" --include="*.md"`,
                        { cwd: directory }
                    );

                    return {
                        statusCode: 200,
                        body: JSON.stringify({ 
                            success: true, 
                            results: stdout.split('\n').filter(line => line.trim()),
                            pattern
                        })
                    };
                } catch (err) {
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ 
                            success: true, 
                            results: [],
                            message: 'No matches found'
                        })
                    };
                }
            }

            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ 
                        error: 'Unknown action',
                        available: ['readFile', 'listDirectory', 'executeCommand', 'writeFile', 'searchFiles']
                    })
                };
        }
    } catch (error) {
        console.error('Terminal backend error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};