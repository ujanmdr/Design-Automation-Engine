import sharp from "sharp";
import QRCode from "qrcode";
import path from "path";
import fs from "fs/promises";

export interface GeneratePostOptions {
  name: string;
  title: string;
  subtext: string;
  photoBuffer: Buffer;
  x: number;
  y: number;
  scale: number;
  outputFilename: string; // e.g. "Binish Maharjan birthday post.png"
}

export interface GenerateIdCardOptions {
  name: string;
  title: string;
  email: string;
  photoBuffer: Buffer;
  x: number;
  y: number;
  scale: number;
  outputFilename: string;
}

export interface GenerateIdCardBacksideOptions {
  qrCodeUrl: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  outputFilename: string;
}

export async function generateBirthdayPost({
  name,
  title,
  subtext,
  photoBuffer,
  x,
  y,
  scale,
  outputFilename
}: GeneratePostOptions): Promise<string> {
  // Paths to exported Figma layers
  const bgPath = path.join(process.cwd(), "public/assets/templates/background.png");
  const overlayPath = path.join(process.cwd(), "public/assets/templates/overlay.png");

  const finalWidth = Math.round(800 * scale);
  const processedPhoto = await sharp(photoBuffer)
    .rotate() // Automatically orient based on EXIF data
    .resize({ width: finalWidth })
    .toBuffer();

  const titleCapitalized = title.replace(/\b\w/g, l => l.toUpperCase());

  const textSvg = Buffer.from(`
    <svg width="800" height="250" xmlns="http://www.w3.org/2000/svg">
      <style>
        .name { 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          font-weight: 700; 
          font-size: 64px; 
          fill: #373737; 
          letter-spacing: -2.56px; 
        }
        .title { 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          font-weight: 500; 
          font-size: 42px; 
          fill: #373737; 
          letter-spacing: -0.84px;
          text-transform: capitalize;
        }
      </style>
      <rect x="0" y="0" width="800" height="250" fill="#ffffff" />
      <text x="20" y="80" class="name">${name}</text>
      <text x="20" y="140" class="title">${titleCapitalized}</text>
    </svg>
  `);

  const subtextLines = subtext.split('\n');
  const subtextSvgContent = subtextLines.map((line, index) => 
    `<text x="0" y="${40 + index * 52.659}" class="subtext">${line}</text>`
  ).join('');

  const subtextSvg = Buffer.from(`
    <svg width="700" height="300" xmlns="http://www.w3.org/2000/svg">
      <style>
        .subtext { 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          font-weight: 600; 
          font-size: 39.494px; 
          fill: #373737; 
          letter-spacing: -1.975px; 
        }
      </style>
      ${subtextSvgContent}
    </svg>
  `);

  const finalImage = await sharp(bgPath)
    .resize(1080, 1920, { fit: 'fill' })
    .composite([
      { input: processedPhoto, top: y, left: x },
      { input: subtextSvg, top: 452, left: 99 },
      { input: overlayPath, top: 1307, left: 0 },
      { input: textSvg, top: 1560, left: 80 },
    ])
    .png()
    .toBuffer();

  const outputPath = path.join(process.cwd(), "public/outputs", outputFilename);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, finalImage);

  return `/outputs/${outputFilename}`;
}

export async function generateIdCard({
  name,
  title,
  email,
  photoBuffer,
  x,
  y,
  scale,
  outputFilename
}: GenerateIdCardOptions): Promise<string> {
  const cardWidth = 638;
  const cardHeight = 1016;

  const bgPath = path.join(process.cwd(), "public", "assets", "templates", "test1.png");
  const overlayPath = path.join(process.cwd(), "public", "assets", "templates", "id_card_overlay.png");

  const finalWidth = Math.round(cardWidth * scale);
  const { data: photoData, info: photoInfo } = await sharp(photoBuffer)
    .rotate()
    .resize({ width: finalWidth })
    .toBuffer({ resolveWithObject: true });

  let compositePhoto = photoData;
  let compositeX = x;
  let compositeY = y;

  // Calculate intersection with canvas to crop the image if it overflows
  const cropLeft = Math.max(0, -x);
  const cropTop = Math.max(0, -y);
  const rightOverflow = Math.max(0, (x + photoInfo.width) - cardWidth);
  const bottomOverflow = Math.max(0, (y + photoInfo.height) - cardHeight);
  const extractWidth = photoInfo.width - cropLeft - rightOverflow;
  const extractHeight = photoInfo.height - cropTop - bottomOverflow;

  if (extractWidth > 0 && extractHeight > 0) {
    if (cropLeft > 0 || cropTop > 0 || rightOverflow > 0 || bottomOverflow > 0) {
      compositePhoto = await sharp(photoData)
        .extract({ left: cropLeft, top: cropTop, width: extractWidth, height: extractHeight })
        .toBuffer();
      compositeX = x + cropLeft;
      compositeY = y + cropTop;
    }
  } else {
    // Completely out of bounds, we can just make it a 1x1 transparent pixel
    compositePhoto = await sharp({ create: { width: 1, height: 1, channels: 4, background: { r:0, g:0, b:0, alpha:0 } } }).png().toBuffer();
    compositeX = 0;
    compositeY = 0;
  }

  const titleCapitalized = title.replace(/\b\w/g, l => l.toUpperCase());
  const emailLower = email ? email.toLowerCase() : "";

  const nameParts = name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');

  const hasTwoLines = nameParts.length > 1;
  const titleY = hasTwoLines ? 915 : 859;

  // Load the email icon and logo as base64 for embedding in the SVG
  const emailIconPath = path.join(process.cwd(), 'public', 'assets', 'templates', 'email_icon.png');
  const emailIconBase64 = (await fs.readFile(emailIconPath)).toString('base64');
  const emailIconDataUri = `data:image/png;base64,${emailIconBase64}`;

  const logoPath = path.join(process.cwd(), 'public', 'assets', 'templates', 'gritfeat_logo.png');
  const logoBase64 = (await fs.readFile(logoPath)).toString('base64');
  const logoDataUri = `data:image/png;base64,${logoBase64}`;

  // Pure SVG Overlay matching the requested design exactly
  const overlayCoverSvg = Buffer.from(`
    <svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
      <!-- Green Line Separator -->
      <rect x="0" y="728" width="638" height="15" fill="#71cc44" />
      
      <!-- White Footer Background (height 273px, starts at 1016-273 = 743) -->
      <rect x="0" y="743" width="638" height="273" fill="white" />

      <!-- Gritfeat Logo (Top Right next to employee name) -->
      <image href="${logoDataUri}" x="497" y="770" width="105" height="53" />

      <!-- Email Icon (Using the exact image provided by the user without changing dimensions) -->
      <image href="${emailIconDataUri}" x="36" y="950" width="32" height="32" />
      
      <!-- Dynamic Employee Details -->
      <text x="36" y="815" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="52px" fill="#121212" letter-spacing="0">${firstName}</text>
      ${hasTwoLines ? `<text x="36" y="871" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="52px" fill="#121212" letter-spacing="0">${lastName}</text>` : ''}
      
      <!-- Designation (8px visual gap from Name) -->
      <text x="36" y="${titleY}" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="32px" fill="#71cc44" letter-spacing="0">${titleCapitalized}</text>
      
      <!-- Email (Auto spaced to bottom padding 32px) -->
      <text x="76" y="973" font-family="'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="25px" fill="#121212" letter-spacing="0">${emailLower}</text>
    </svg>
  `);

  const finalImage = await sharp(bgPath)
    .composite([
      // 1. Employee Photo
      { input: compositePhoto, top: compositeY, left: compositeX },
      // 2. Our SVG that creates the white footer, green line, logo, and dynamic text
      { input: overlayCoverSvg, top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  const outputPath = path.join(process.cwd(), "public", "outputs", outputFilename);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, finalImage);

  return `/outputs/${outputFilename}`;
}

export interface GenerateAnniversaryCard1Options {
  name: string;
  title: string;
  photoBuffer: Buffer;
  outputFilename: string;
  x?: number;
  y?: number;
  scale?: number;
}

export interface GenerateAnniversaryCard2Options {
  yearsText: string;
  testimonial: string;
  outputFilename: string;
}

export async function generateAnniversaryCard1({
  name,
  title,
  photoBuffer,
  outputFilename,
  x = 0,
  y = 0,
  scale = 1.0
}: GenerateAnniversaryCard1Options): Promise<string> {
  const cardWidth = 702;
  const cardHeight = 940;

  const bgPath = path.join(process.cwd(), "public", "assets", "templates", "card1_bg.jpg");
  const bgBuffer = await sharp(bgPath).resize(cardWidth, cardHeight, { fit: 'fill' }).toBuffer();

  // Resize the photo based on scale factor
  const finalWidth = Math.round(cardWidth * scale);
  const { data: photoData, info: photoInfo } = await sharp(photoBuffer)
    .rotate()
    .resize({ width: finalWidth })
    .toBuffer({ resolveWithObject: true });

  let compositePhoto = photoData;
  let compositeX = x;
  let compositeY = y;

  // Calculate intersection with canvas to crop the image if it overflows
  const cropLeft = Math.max(0, -x);
  const cropTop = Math.max(0, -y);
  const rightOverflow = Math.max(0, (x + photoInfo.width) - cardWidth);
  const bottomOverflow = Math.max(0, (y + photoInfo.height) - cardHeight);
  const extractWidth = photoInfo.width - cropLeft - rightOverflow;
  const extractHeight = photoInfo.height - cropTop - bottomOverflow;

  if (extractWidth > 0 && extractHeight > 0) {
    if (cropLeft > 0 || cropTop > 0 || rightOverflow > 0 || bottomOverflow > 0) {
      compositePhoto = await sharp(photoData)
        .extract({ left: cropLeft, top: cropTop, width: extractWidth, height: extractHeight })
        .toBuffer();
      compositeX = x + cropLeft;
      compositeY = y + cropTop;
    }
  } else {
    // Completely out of bounds fallback
    compositePhoto = await sharp({ create: { width: 1, height: 1, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
    compositeX = 0;
    compositeY = 0;
  }

  const titleCapitalized = title.replace(/\b\w/g, l => l.toUpperCase());

  // SVG overlay for text ONLY (drawn on top of the photo)
  const overlaySvg = Buffer.from(`
    <svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
      <!-- Top Left Text -->
      <text x="60" y="125" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="50.833px" fill="#2D3142" letter-spacing="-1.017px">${name}</text>
      <text x="60" y="182" font-family="'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="33.889px" fill="#2D3142" letter-spacing="-0.678px">${titleCapitalized}</text>
    </svg>
  `);

  // Rounded corner mask to make corners transparent (matching Card 2) and cuts off the top-right corner fold
  const roundedCornerMask = Buffer.from(`
    <svg width="${cardWidth}" height="${cardHeight}">
      <path d="M 28 0 L 578 0 L 702 124 L 702 912 A 28 28 0 0 1 674 940 L 28 940 A 28 28 0 0 1 0 912 L 0 28 A 28 28 0 0 1 28 0 Z" fill="white" />
    </svg>
  `);

  const finalImage = await sharp(bgBuffer)
    .composite([
      { input: compositePhoto, top: compositeY, left: compositeX },
      { input: overlaySvg, top: 0, left: 0 },
      { input: roundedCornerMask, blend: 'dest-in', top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  const outputPath = path.join(process.cwd(), "public", "outputs", outputFilename);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, finalImage);

  return `/outputs/${outputFilename}`;
}

export async function generateAnniversaryCard2({
  yearsText,
  testimonial,
  outputFilename
}: GenerateAnniversaryCard2Options): Promise<string> {
  const cardWidth = 702;
  const cardHeight = 940;

  const bgPath = path.join(process.cwd(), "public", "assets", "templates", "card2_bg.png");
  const bgBuffer = await sharp(bgPath).resize(cardWidth, cardHeight, { fit: 'fill' }).toBuffer();

  // Split testimonial into multiple lines (naive word wrap for SVG)
  const maxLineLength = 40;
  const words = testimonial.split(' ');
  let lines = [];
  let currentLine = '';
  words.forEach(word => {
    if ((currentLine + word).length > maxLineLength) {
      lines.push(currentLine);
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  if (currentLine) lines.push(currentLine);

  const testimonialSvg = lines.map((line, i) => 
    `<text x="60" y="${325 + i * 45}" font-family="'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="28px" fill="#333333">${line.trim()}</text>`
  ).join('');

  const overlaySvg = Buffer.from(`
    <svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
      <!-- Pill Badge: MY GRITFEAT STORY -->
      <rect x="60" y="65" width="295" height="44" rx="22" ry="22" fill="#EEF2F6" />
      <text x="82" y="94" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="20px" fill="#2D3142" letter-spacing="1.5px">MY GRITFEAT STORY</text>

      <!-- Title -->
      <text x="60" y="165" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="50.833px" letter-spacing="-2.033px">
        <tspan fill="#7FBD42">${yearsText}</tspan> <tspan fill="#2D3142">of</tspan>
      </text>
      <!-- Subtitle or Label -->
      <text x="60" y="215" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="50.833px" fill="#2D3142" letter-spacing="-2.033px">Growth Milestone</text>
      
      <!-- Testimonial text -->
      ${testimonialSvg}
    </svg>
  `);

  const finalImage = await sharp(bgBuffer)
    .composite([
      { input: overlaySvg, top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  const outputPath = path.join(process.cwd(), "public", "outputs", outputFilename);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, finalImage);

  return `/outputs/${outputFilename}`;
}
export async function generateIdCardBackside({
  qrCodeUrl,
  website,
  email,
  phone,
  address,
  outputFilename
}: GenerateIdCardBacksideOptions): Promise<string> {
  const bgPath = path.join(process.cwd(), "public", "assets", "templates", "test2.png");
  const bgBuffer = await fs.readFile(bgPath);

  let qrBuffer: Buffer;
  if (qrCodeUrl === "https://www.gritfeat.com") {
    const defaultQrPath = path.join(process.cwd(), "public", "assets", "templates", "default_qr.png");
    try {
      qrBuffer = await fs.readFile(defaultQrPath);
      // Resize it to match the backend expectation using fill to avoid black background bars
      qrBuffer = await sharp(qrBuffer).resize(350, 350, { fit: 'fill' }).toBuffer();
    } catch (e) {
      // Fallback
      qrBuffer = await QRCode.toBuffer(qrCodeUrl, { width: 350, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
    }
  } else {
    qrBuffer = await QRCode.toBuffer(qrCodeUrl, { width: 350, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
  }

  const webIconB64 = await fs.readFile(path.join(process.cwd(), "public", "assets", "templates", "icon2.png"), 'base64');
  const emailIconB64 = await fs.readFile(path.join(process.cwd(), "public", "assets", "templates", "icon3.png"), 'base64');
  const phoneIconB64 = await fs.readFile(path.join(process.cwd(), "public", "assets", "templates", "icon1.png"), 'base64');
  const locationIconB64 = await fs.readFile(path.join(process.cwd(), "public", "assets", "templates", "icon4.png"), 'base64');

  const getTextWidth = (text: string) => {
    let width = 0;
    for (const char of text) {
      if (/[iIl1.,\-\s:;|!tfr]/.test(char)) width += 8;
      else if (/[mWw@]/.test(char)) width += 22;
      else if (/[A-Z]/.test(char)) width += 17;
      else width += 14;
    }
    return width;
  };

  const getStartX = (text: string) => {
    const totalWidth = 32 + 8 + getTextWidth(text);
    return (638 - totalWidth) / 2;
  };

  const svgOverlay = Buffer.from(`
    <svg width="638" height="1016" xmlns="http://www.w3.org/2000/svg">
      <style>
        .text { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 600; fill: #1A1A1A; dominant-baseline: middle; }
      </style>

      <g transform="translate(${getStartX(website)}, 596)">
        <image href="data:image/png;base64,${webIconB64}" width="32" height="32" />
        <text x="40" y="18" class="text">${website}</text>
      </g>
      <g transform="translate(${getStartX(email)}, 656)">
        <image href="data:image/png;base64,${emailIconB64}" width="32" height="32" />
        <text x="40" y="18" class="text">${email}</text>
      </g>
      <g transform="translate(${getStartX(phone)}, 716)">
        <image href="data:image/png;base64,${phoneIconB64}" width="32" height="32" />
        <text x="40" y="18" class="text">${phone}</text>
      </g>
      <g transform="translate(${getStartX(address)}, 776)">
        <image href="data:image/png;base64,${locationIconB64}" width="32" height="32" />
        <text x="40" y="18" class="text">${address}</text>
      </g>
    </svg>
  `);

  const finalImage = await sharp(bgBuffer)
    .composite([
      { input: svgOverlay, top: 0, left: 0 },
      { input: qrBuffer, top: 100, left: (638 - 350) / 2 }
    ])
    .png()
    .toBuffer();

  const outputPath = path.join(process.cwd(), "public", "outputs", outputFilename);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, finalImage);

  return `/outputs/${outputFilename}`;
}
