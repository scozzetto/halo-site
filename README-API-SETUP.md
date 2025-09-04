# Setting Up Anthropic API Key for HALO Terminal

## Option 1: Personal Use (Easiest)

1. **Get your API key:**
   - Go to https://console.anthropic.com/settings/keys
   - Sign up or log in
   - Click "Create Key"
   - Copy the key (starts with `sk-ant-api03-`)

2. **Set it in the terminal:**
   ```bash
   setkey sk-ant-api03-your-key-here
   ```

3. **Test it:**
   ```bash
   ai Hello, can you hear me?
   ```

## Option 2: Shared/Demo Use (More Secure)

Set the API key as an environment variable in Netlify:

1. **Go to Netlify Dashboard:**
   - https://app.netlify.com
   - Select your site (halotempsite)
   
2. **Add Environment Variable:**
   - Go to Site settings → Environment variables
   - Click "Add a variable"
   - Key: `ANTHROPIC_API_KEY`
   - Value: Your API key
   - Click "Save"

3. **Deploy the updated function**

## Option 3: Free Demo Mode (No API Key Required)

Use the demo mode that simulates AI responses without making real API calls.

## Important Security Notes

- **Never commit API keys to Git**
- **Use environment variables for production**
- **Rotate keys regularly**
- **Set usage limits in Anthropic console**

## Testing Your Setup

Once configured, try these commands:

```bash
# Test basic AI
ai Hello, are you working?

# Test natural language
Show me all JavaScript files

# Test Be Well knowledge
How does the BioSync system work?

# Test code generation
Write a function to validate email addresses
```

## Troubleshooting

If you get errors:

1. **"API key required"** - You haven't set the key yet
2. **"401 Unauthorized"** - Your key is invalid
3. **"429 Too Many Requests"** - You've hit rate limits
4. **"Network error"** - Check your internet connection

## API Key Management Commands

```bash
setkey <key>    # Set your API key
clearkey        # Remove stored key
ai test         # Test if AI is working
```