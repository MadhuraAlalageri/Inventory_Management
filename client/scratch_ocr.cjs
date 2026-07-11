const Tesseract = require('tesseract.js');
const fs = require('fs');

const imgPath = '/home/armtronix/.gemini/antigravity/brain/016f8920-f02a-4df0-8b93-8d1371f5f5d6/demo_invoice_digital.png';

Tesseract.recognize(
  imgPath,
  'eng',
).then(({ data: { text } }) => {
  console.log("=== RAW TEXT ===");
  console.log(text);
  
  const blacklist = [
    "date:", "invoice #", "customer id", "due date", "bill to", "phone:", "email:", 
    "tech solutions", "enterprise drive", "innovation ave", "address", "total", "subtotal",
    "invoice", "tax", "shipping", "payment", "quantity", "description", "item",
    ", ny", ", ca", ", tx", ", fl", ", wa", "road", "street", "avenue", "lane"
  ];
  
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(line => line.length > 2)
    .filter(line => !blacklist.some(word => line.toLowerCase().includes(word)))
    .filter(line => !/\d{5}$/.test(line)); 
    
  console.log("\n=== FILTERED LINES ===");
  console.log(lines);

  const candidates = [];
  for (const line of lines) {
    const normalizedLine = line.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
    const priceRegexMatch = normalizedLine.match(/(.*?)\s+(\d+)\s+[\$]?\d+(?:\.\d+)?/);
    if (priceRegexMatch) {
       console.log("✅ Matched Strat B:", priceRegexMatch[1], "| QTY:", priceRegexMatch[2]);
    } else {
       console.log("❌ Failed Strat B:", normalizedLine);
    }
  }
}).catch(console.error);
