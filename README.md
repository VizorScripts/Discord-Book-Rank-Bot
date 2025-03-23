STEP-BY-STEP INSTRUCTIONS:

Install Prerequisites:

Install Node.js (v18+)

Install Git (optional)

Create Discord Bot (developer portal)

Setup Project:
mkdir BookRankBot
cd BookRankBot
npm init -y
npm install discord.js @discordjs/builders axios cheerio limiter dotenv socks-proxy-agent@4.0.2

Populate .env:
DISCORD_TOKEN=your_bot_token_here
AMAZON_BOOK_URL=https://www.amazon.com/dp/YOUR_BOOK_ASIN
CHANNEL_ID=your_discord_channel_id
ROTATION_ENABLED=true
ROTATION_FREQUENCY=3
PROXY_ENABLED=true
UPDATE_MINUTES=15
CAPTCHA_RETRIES=5


Run Bot:
node bot.js


# Amazon Book Rank Discord Bot

Track Amazon book rankings directly in Discord with proxy rotation to avoid CAPTCHAs.

## Features
- Real-time Amazon rank tracking
- Automatic proxy rotation (500+ proxies)
- CAPTCHA avoidance system
- Slash command support
- Automatic hourly proxy updates
- Top 3 ranking alerts


## 📥 Discord Installation

Go to Discord Developer Portal
Create New Application → Bot → Copy Token
Enable Privileged Gateway Intents:

PRESENCE INTENT
SERVER MEMBERS INTENT
MESSAGE CONTENT INTENT

Invite Bot to Server:


https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2147559424&scope=bot%20applications.commands


🚀 Usage

node bot.js
The bot will:

Connect to Discord
Fetch initial proxies
Start rank checks every 15 minutes

Commands:
/rank - Show current rankings
/rankgermany - Show current ranking compared to books on Amazon written in german.

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
npm install socks-proxy-agent@4.0.2


Missing Permissions:
Re-invite bot with proper permissions
Ensure channel ID is correct


CAPTCHA Loops:
Increase CAPTCHA_RETRIES
Reduce UPDATE_MINUTES
Use USER_AGENT in .env



Bot will auto restart on replit via:
``process.on('uncaughtException', error => {
    console.error('Crash detected, restarting...', error);
    process.exit(1);
});``




📄 License
MIT License - Free for personal and commercial use


**KEY NOTES:**
1. Replace placeholder values in `.env` with your actual credentials
2. The invitation URL needs your bot's actual client ID
3. Start with `PROXY_ENABLED=false` if you're having connection issues
4. Check `debug.html` for any CAPTCHA pages or parsing issues

Let me know if you need any clarification or run into specific issues during setup!
