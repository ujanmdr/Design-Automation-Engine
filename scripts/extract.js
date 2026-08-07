const fs = require('fs');
const path = 'C:/Users/ujan/.gemini/antigravity/brain/118989de-057a-487c-a3c5-5aec867b8cfa/.system_generated/logs/transcript_full.jsonl';
const text = fs.readFileSync(path, 'utf8');
const lines = text.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"USER_INPUT"')) {
    const obj = JSON.parse(lines[i]);
    const content = obj.content || '';
    console.log('Index:', i, 'Length:', content.length, 'Snippet:', content.substring(0, 50));
    if (content.includes('5.8.1')) {
      console.log('Found 5.8.1 in USER_INPUT content on line', i);
      const pos = content.indexOf('{"v":"5.8.1"');
      if (pos !== -1) {
        let jsonStr = content.substring(pos);
        const endPos = jsonStr.lastIndexOf('}') + 1;
        jsonStr = jsonStr.substring(0, endPos);
        const parsed = JSON.parse(jsonStr);
        fs.mkdirSync('public/assets/templates', { recursive: true });
        fs.writeFileSync('public/assets/templates/work_anniversary.json', JSON.stringify(parsed, null, 2));
        console.log('VICTORY! Saved Lottie JSON, size:', JSON.stringify(parsed).length);
        break;
      }
    }
  }
}
