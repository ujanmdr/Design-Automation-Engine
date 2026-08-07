const sharp = require('sharp');
const path = require('path');

async function analyze() {
  for (let file of ['test1.png', 'test2.png']) {
    const filePath = path.join(__dirname, '../public/assets/templates', file);
    const meta = await sharp(filePath).metadata();
    
    // Check if there are transparent pixels in the top 500 pixels
    const buffer = await sharp(filePath).raw().toBuffer();
    let transparentCount = 0;
    for (let i = 3; i < buffer.length; i += meta.channels) {
      if (buffer[i] < 255) transparentCount++;
    }
    console.log(`${file}: ${meta.width}x${meta.height}, transparent pixels: ${transparentCount}, total pixels: ${meta.width * meta.height}`);
  }
}

analyze().catch(console.error);
