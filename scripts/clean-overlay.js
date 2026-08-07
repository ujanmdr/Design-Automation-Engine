const sharp = require('sharp');
const path = require('path');

async function testOverlay() {
  const overlayPath = path.join(__dirname, '../public/assets/templates/id_card_overlay.png');
  
  // We'll create a white rectangle to cover the text.
  // The image is 638x1016. The text "Abyakta Koirala" is probably around y=700.
  // The green line is at the top of the text area. The logo is at the bottom right.
  // Let's just create an SVG with a white rectangle from x=0 to x=600, y=780 to y=1000.
  
  const textCoverSvg = Buffer.from(`
    <svg width="638" height="1016" xmlns="http://www.w3.org/2000/svg">
      <!-- Cover the name, title, and email, but leave the right side for the logo -->
      <rect x="0" y="760" width="500" height="250" fill="white" />
    </svg>
  `);

  await sharp(overlayPath)
    .composite([{ input: textCoverSvg, top: 0, left: 0 }])
    .png()
    .toFile(path.join(__dirname, '../public/assets/templates/id_card_overlay_cleaned.png'));
    
  console.log('Cleaned overlay created at public/assets/templates/id_card_overlay_cleaned.png');
}

testOverlay().catch(console.error);
