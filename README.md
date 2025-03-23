STEP-BY-STEP INSTRUCTIONS:

Install Prerequisites:

Install Node.js (v18+)

Install Git (optional)

Create Discord Bot (developer portal)

Setup Project:

bash
Copy
mkdir BookRankBot
cd BookRankBot
npm init -y
npm install discord.js @discordjs/builders axios cheerio limiter dotenv socks-proxy-agent@4.0.2
Create Files:

bash
Copy
touch bot.js .env .gitignore
Populate .env:

env
Copy
DISCORD_TOKEN=your_bot_token_here
AMAZON_BOOK_URL=https://www.amazon.com/dp/YOUR_BOOK_ASIN
CHANNEL_ID=your_discord_channel_id
ROTATION_ENABLED=true
ROTATION_FREQUENCY=3
PROXY_ENABLED=true
UPDATE_MINUTES=15
CAPTCHA_RETRIES=5
Run Bot:

bash
Copy
node bot.js
README.md

markdown
Copy
# Amazon Book Rank Discord Bot

Track Amazon book rankings directly in Discord with proxy rotation to avoid CAPTCHAs.

## Features
- Real-time Amazon rank tracking
- Automatic proxy rotation (500+ proxies)
- CAPTCHA avoidance system
- Slash command support
- Automatic hourly proxy updates
- Top 3 ranking alerts

## 📥 Installation

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/BookRankBot.git
cd BookRankBot
Install Dependencies

bash
Copy
npm install
Configuration

Create .env file using template:

env
Copy
DISCORD_TOKEN=your_bot_token
AMAZON_BOOK_URL=https://www.amazon.com/dp/B0C1234567
CHANNEL_ID=123456789012345678
ROTATION_ENABLED=true
ROTATION_FREQUENCY=3
PROXY_ENABLED=true
UPDATE_MINUTES=15
CAPTCHA_RETRIES=5
🤖 Bot Setup
Create Discord Bot:

Go to Discord Developer Portal

Create New Application → Bot → Copy Token

Enable Privileged Gateway Intents:

PRESENCE INTENT

SERVER MEMBERS INTENT

MESSAGE CONTENT INTENT

Invite Bot to Server:

Copy
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2147559424&scope=bot%20applications.commands
🚀 Usage
bash
Copy
node bot.js
The bot will:

Connect to Discord

Fetch initial proxies

Start rank checks every 15 minutes

Register /rank command

Commands:

/rank - Show current rankings

⚙️ Configuration Options
Environment Variable	Default	Description
DISCORD_TOKEN	Required	Bot authentication token
AMAZON_BOOK_URL	Required	Full URL of book product page
CHANNEL_ID	Required	Channel ID for alerts/notifications
ROTATION_ENABLED	true	Enable proxy rotation
ROTATION_FREQUENCY	3	Rotate after X requests
PROXY_ENABLED	true	Enable proxy usage
UPDATE_MINUTES	15	Check interval in minutes
CAPTCHA_RETRIES	5	Retry attempts on CAPTCHA detection
🚨 Troubleshooting
Common Issues:

N/A Rankings:

Check debug.html for CAPTCHA content

Test URL in browser

Try PROXY_ENABLED=false

Proxy Errors:

bash
Copy
npm install socks-proxy-agent@4.0.2
Missing Permissions:

Re-invite bot with proper permissions

Ensure channel ID is correct

CAPTCHA Loops:

Increase CAPTCHA_RETRIES

Reduce UPDATE_MINUTES

Use USER_AGENT in .env

📄 License
MIT License - Free for personal and commercial use

Copy

**KEY NOTES:**
1. Replace placeholder values in `.env` with your actual credentials
2. The invitation URL needs your bot's actual client ID
3. Start with `PROXY_ENABLED=false` if you're having connection issues
4. Check `debug.html` for any CAPTCHA pages or parsing issues

Let me know if you need any clarification or run into specific issues during setup!