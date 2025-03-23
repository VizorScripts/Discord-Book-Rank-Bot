const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

const PROXY_FILES = {
  raw: path.resolve('./proxies.txt'),
  json: path.resolve('./proxies.json')
};

class ProxyConverter {
  static generateChecksum(content) {
    return createHash('sha256')
      .update(content)
      .digest('hex');
  }

  static async convertProxies() {
    try {
      const rawProxies = await fs.promises.readFile(PROXY_FILES.raw, 'utf8');
      const checksum = this.generateChecksum(rawProxies);
      
      const formatted = rawProxies
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          const [host, port] = line.trim().split(':');
          return { host, port };
        });

      const jsonContent = JSON.stringify(formatted, null, 2);
      
      await fs.promises.writeFile(PROXY_FILES.json, jsonContent);
      console.log('✅ Successfully converted proxies.txt to proxies.json');
      
      return {
        originalCount: rawProxies.split('\n').length,
        convertedCount: formatted.length,
        checksum
      };
    } catch (error) {
      throw new Error(`Proxy conversion failed: ${error.message}`);
    }
  }

  static async needsConversion() {
    try {
      const [rawStats, jsonStats] = await Promise.all([
        fs.promises.stat(PROXY_FILES.raw),
        fs.promises.stat(PROXY_FILES.json)
      ]);
      
      return rawStats.mtimeMs > jsonStats.mtimeMs;
    } catch {
      return true;
    }
  }
}

// Run conversion if needed
(async () => {
  try {
    if (await ProxyConverter.needsConversion()) {
      const result = await ProxyConverter.convertProxies();
      console.log(`Converted ${result.convertedCount} proxies`);
      console.log(`Checksum: ${result.checksum}`);
    } else {
      console.log('No proxy conversion needed');
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();