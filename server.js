const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

const MAX_RETRIES = 3;

app.get('/proxy', async (req, res) => {
    const imageUrl = req.query.url;

    if (!imageUrl) {
        res.status(400).send('URL is required');
        return;
    }

    let retries = 0;
    let success = false;

    while (retries < MAX_RETRIES && !success) {
        try {
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: true,
            });

            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

            const response = await page.goto(imageUrl, { waitUntil: 'networkidle2', timeout: 60000 });

            if (!response.ok()) {
                throw new Error(`HTTP status code: ${response.status()}`);
            }

            const buffer = await response.buffer();
            await browser.close();

            res.set('Content-Type', response.headers()['content-type']);
            res.send(buffer);
            success = true;
        } catch (error) {
            console.error(error);
            retries += 1;
            if (retries >= MAX_RETRIES) {
                res.status(500).send(`Failed to fetch image after ${MAX_RETRIES} attempts: ${error.message}`);
            }
        }
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Proxy server running at http://0.0.0.0:${port}`);
});
