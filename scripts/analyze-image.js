const sharp = require('sharp');

async function analyze() {
  const meta = await sharp('public/assets/templates/id_card_overlay.png').metadata();
  console.log(`Dimensions: ${meta.width}x${meta.height}, channels: ${meta.channels}`);
  
  // Check if there are transparent pixels in the top 500 pixels
  const buffer = await sharp('public/assets/templates/id_card_overlay.png').raw().toBuffer();
  let transparentCount = 0;
  for (let i = 3; i < 500 * meta.width * meta.channels; i += meta.channels) {
    if (buffer[i] < 255) transparentCount++;
  }
  console.log(`Transparent pixels in top half: ${transparentCount}`);
}

analyze().catch(console.error);
