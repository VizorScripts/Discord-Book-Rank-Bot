//
// working perfectly, with both pictures AND german market % calculator
//

require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const cheerio = require('cheerio');
const { RateLimiter } = require('limiter');
const SocksProxyAgent = require('socks-proxy-agent').SocksProxyAgent;
const fs = require('fs');

// Debug functions
function debugHTML(html) {
    fs.writeFileSync('./debug.html', html);
    console.log('⚠️ Saved debug HTML');
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

class ProxyManager {
    constructor() {
        this.index = 0;
        this.proxies = [];
        this.rotationEnabled = process.env.ROTATION_ENABLED === 'true';
        this.rotationFrequency = parseInt(process.env.ROTATION_FREQUENCY) || 5;
        this.requestCount = 0;
    }

    async refreshProxies() {
        try {
            console.log('🔄 Fetching proxies...');
            const { data } = await axios.get(
                'https://proxylist.geonode.com/api/proxy-list?filterUpTime=80&filterLastChecked=60&speed=fast&google=false&limit=500'
            );
            this.proxies = data.data
                .filter(p => p.protocols.some(proto => ['socks4', 'socks5'].includes(proto)))
                .map(p => ({
                    host: p.ip,
                    port: p.port,
                    protocol: p.protocols.find(proto => ['socks4', 'socks5'].includes(proto))
                }));
            console.log(`✅ Loaded ${this.proxies.length} proxies`);
        } catch (error) {
            console.error('Proxy refresh failed:', error.message);
        }
    }

    getNextProxy() {
        if (!this.rotationEnabled || this.proxies.length === 0) return null;
        this.requestCount++;
        if (this.requestCount % this.rotationFrequency === 0) {
            this.index = (this.index + 1) % this.proxies.length;
        }
        return this.proxies[this.index];
    }
}

const proxyManager = new ProxyManager();
const limiter = new RateLimiter({ tokensPerInterval: 1, interval: 300000 });

const CONFIG = {
    AMAZON_URL: process.env.AMAZON_BOOK_URL,
    UPDATE_INTERVAL: Math.max(process.env.UPDATE_MINUTES || 30, 5) * 60 * 1000,
    CHANNEL_ID: process.env.CHANNEL_ID,
    USER_AGENT: process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    PROXY_ENABLED: process.env.PROXY_ENABLED === 'true',
    CAPTCHA_RETRIES: parseInt(process.env.CAPTCHA_RETRIES) || 5,
    EMBED_COLOR: process.env.EMBED_COLOR || "#FFFF00",
    EMBED_THUMBNAIL: process.env.EMBED_THUMBNAIL_URL,
    EMBED_IMAGE: process.env.EMBED_IMAGE_URL
};

// Category metrics for both versions
const METRICS = {
    global: {
        overall: { total: 10000000, displayTotal: '~10,000,000' },
        parentingDisabilities: { total: 5000, displayTotal: '~5,000' },
        babyGuide: { total: 20000, displayTotal: '~20,000' },
        generalBirth: { total: 30000, displayTotal: '~30,000' }
    },
    germany: {
        overall: { total: 2000000, displayTotal: '~2,000,000' },
        parentingDisabilities: { total: 1000, displayTotal: '~1,000' },
        babyGuide: { total: 4000, displayTotal: '~4,000' },
        generalBirth: { total: 6000, displayTotal: '~6,000' }
    }
};

let currentRanks = {
    overall: 'N/A',
    parentingDisabilities: 'N/A',
    babyGuide: 'N/A', 
    generalBirth: 'N/A'
};
let previousRanks = {...currentRanks};

function escapeRegex(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function findCategoryRank(text, patterns) {
    try {
        const allMatches = [...text.matchAll(/(\d{1,3}(?:,\d{3})*)\s+in\s+([^\.0-9]+)/gi)];
        for (const [fullMatch, rank, category] of allMatches) {
            for (const pattern of patterns) {
                if (category.trim().includes(pattern)) {
                    console.log(`Matched: ${pattern} => ${rank}`);
                    return rank;
                }
            }
        }
        return 'N/A';
    } catch (error) {
        console.error('Category rank error:', error);
        return 'N/A';
    }
}

function calculatePercentage(rank, categoryKey, region) {
    if (rank === 'N/A') return '';
    const metrics = METRICS[region];
    const numericRank = parseInt(rank.replace(/,/g, ''));
    const { total, displayTotal } = metrics[categoryKey];
    if (isNaN(numericRank)) return '';
    const percentage = (numericRank / total) * 100;
    const percentageText = percentage < 1 ? 
        percentage.toFixed(2).replace('0.', '.') : 
        Math.round(percentage);
    return ` : Top ${percentageText}% of ${displayTotal}`;
}

function createEmbed(region = 'global') {
    const isGermany = region === 'germany';
    return new EmbedBuilder()
        .setColor(CONFIG.EMBED_COLOR)
        .setTitle(isGermany ? '🇩🇪 German Market Rankings' : '📊 Global Rankings')
        .setURL(CONFIG.AMAZON_URL)
        .setThumbnail(CONFIG.EMBED_THUMBNAIL)
        .setImage(CONFIG.EMBED_IMAGE)
        .addFields(
            { 
                name: 'Overall Rank', 
                value: `**#${currentRanks.overall}**${calculatePercentage(currentRanks.overall, 'overall', region)}`,
                inline: false 
            },
            { 
                name: 'Parenting (Disabilities)', 
                value: `**#${currentRanks.parentingDisabilities}**${calculatePercentage(currentRanks.parentingDisabilities, 'parentingDisabilities', region)}`,
                inline: false 
            },
            { 
                name: 'Baby Guides', 
                value: `**#${currentRanks.babyGuide}**${calculatePercentage(currentRanks.babyGuide, 'babyGuide', region)}`,
                inline: false 
            },
            { 
                name: 'General Birth', 
                value: `**#${currentRanks.generalBirth}**${calculatePercentage(currentRanks.generalBirth, 'generalBirth', region)}`,
                inline: false 
            }
        )
        .setFooter({ 
            text: `Updated every ${CONFIG.UPDATE_INTERVAL / 60000} minutes • ${new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            })}` 
        })
        .setTimestamp();
}

function extractRankData($) {
    try {
        const rankContainer = $('#productDetails_db_sections, #detailBullets_feature_div, #SalesRank, .prodDetSection').first();
        const rankHtml = rankContainer.html() || $.html();
        fs.writeFileSync('./rank-section.html', rankHtml);
        console.log('⚠️ Saved rank section HTML');
        const rankText = rankContainer.text()
            .replace(/(\s|\n|\t| | )+/g, ' ')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .trim();
        console.log('Cleaned rank text:', rankText);
        let overallRank = rankText.match(/Best Sellers Rank:\s*([\d,]+)/i)?.[1] || 
            rankText.match(/(\d{1,3}(?:,\d{3})*)\s+in Books/i)?.[1] || 
            'N/A';
        const categories = {
            parentingDisabilities: findCategoryRank(rankText, ['Parenting Books on Children with Disabilities', 'Children with Disabilities']),
            babyGuide: findCategoryRank(rankText, ['Baby Guide']),
            generalBirth: findCategoryRank(rankText, ['General Birth'])
        };
        console.log('Parsed ranks:', { overall: overallRank, ...categories });
        return { overall: overallRank, ...categories };
    } catch (error) {
        console.error('Rank extraction error:', error);
        return null;
    }
}

async function fetchAmazonRanks(retryCount = 0) {
    try {
        await limiter.removeTokens(1);
        const config = {
            headers: {
                'User-Agent': CONFIG.USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://www.amazon.com/',
                'DNT': '1'
            },
            timeout: 15000,
            responseType: 'text'
        };
        if (CONFIG.PROXY_ENABLED) {
            const proxy = proxyManager.getNextProxy();
            if (proxy) {
                console.log(`🛡️ Using ${proxy.protocol}://${proxy.host}:${proxy.port}`);
                config.httpAgent = new SocksProxyAgent(`${proxy.protocol}://${proxy.host}:${proxy.port}`);
                config.httpsAgent = config.httpAgent;
            }
        }
        const response = await axios.get(CONFIG.AMAZON_URL, config);
        debugHTML(response.data);
        if (response.data.includes('api-services-support@amazon.com')) throw new Error('CAPTCHA triggered');
        const $ = cheerio.load(response.data);
        return extractRankData($);
    } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed: ${error.message}`);
        if (retryCount < CONFIG.CAPTCHA_RETRIES) return fetchAmazonRanks(retryCount + 1);
        return null;
    }
}

async function updateRanks() {
    try {
        const newRanks = await fetchAmazonRanks();
        if (!newRanks) {
            console.log('Rank extraction failed');
            return;
        }
        previousRanks = {...currentRanks};
        currentRanks = {...newRanks};
        console.log('✅ Ranks updated:', new Date().toLocaleTimeString());
    } catch (error) {
        console.error('Update error:', error);
    }
}

client.on('ready', async () => {
    console.log(`✅ Connected as ${client.user.tag}`);
    if (CONFIG.PROXY_ENABLED) {
        await proxyManager.refreshProxies();
        setInterval(() => proxyManager.refreshProxies(), 3600000);
    }
    try {
        await client.application.commands.set([
            new SlashCommandBuilder()
                .setName('rank')
                .setDescription('Show global Amazon rankings'),
            new SlashCommandBuilder()
                .setName('rankgermany')
                .setDescription('Show German-language hardcopy rankings')
        ]);
        console.log('✅ Slash commands registered');
    } catch (error) {
        console.error('❌ Command registration failed:', error);
    }
    await updateRanks();
    setInterval(updateRanks, CONFIG.UPDATE_INTERVAL);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    try {
        await interaction.deferReply({ ephemeral: true });
        const isGermany = interaction.commandName === 'rankgermany';
        const embed = createEmbed(isGermany ? 'germany' : 'global');
        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Command error:', error);
        await interaction.editReply({ 
            content: 'Failed to get rankings. Try again later.',
            ephemeral: true 
        });
    }
});

client.login(process.env.DISCORD_TOKEN);