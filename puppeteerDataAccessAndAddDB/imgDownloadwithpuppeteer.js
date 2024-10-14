const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const url = 'https://www.freecodecamp.org/news/';
const imgClass = 'post-card-image-link';

(async () => {
    const browser = await puppeteer.launch(); 

    try {
        const page = await browser.newPage(); 
        await page.goto(url); 

        const imgElements = await page.$$(`.${imgClass}`); 
        if (!fs.existsSync('images')) { 
            fs.mkdirSync('images');
        }

        for (let i = 0; i < imgElements.length; i++) {
            const imgURL = await imgElements[i].$eval('img', img => img.src); // img elementlerinin src özelliğini al

            if (imgURL) {
                const response = await axios.get(imgURL, { responseType: 'arraybuffer' });
                if (response.status === 200) {
                    const imgPath = path.join('images', `image${i + 1}.jpg`);
                    fs.writeFileSync(imgPath, Buffer.from(response.data));
                    console.log(`Resim ${imgPath} kaydedildi.`);
                } else {
                    console.log(`Resim indirilemedi (${response.status}): ${imgURL}`);
                }
            } else {
                console.log('Geçersiz URL');
            }
        }
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await browser.close(); 
    }
})();
