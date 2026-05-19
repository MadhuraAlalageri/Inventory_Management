import Tesseract from 'tesseract.js';

let pdfjsPromise = null;

/**
 * Dynamically loads PDF.js library and its worker from CDN.
 */
const loadPdfJS = () => {
  if (pdfjsPromise) return pdfjsPromise;

  pdfjsPromise = new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = (err) => {
      pdfjsPromise = null;
      reject(new Error('Failed to load PDF.js library from CDN.'));
    };
    document.head.appendChild(script);
  });

  return pdfjsPromise;
};

/**
 * Renders a single PDF page onto a canvas.
 */
const renderPdfPageToCanvas = async (pdfDoc, pageNum) => {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2.0 }); // Render at 2x scale for sharp text rendering
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context,
    viewport: viewport
  };
  await page.render(renderContext).promise;
  return canvas;
};

/**
 * Recognizes text from an image or PDF file and returns structured candidates.
 * @param {File} file 
 * @returns {Promise<Array>} List of { raw_name, quantity }
 */
export const processInvoiceOCR = async (file) => {
  try {
    let text = '';
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      console.log("OCR Service: Processing PDF file...");
      const pdfjs = await loadPdfJS();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      console.log(`OCR Service: Loaded PDF document with ${pdfDoc.numPages} page(s).`);

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        console.log(`OCR Service: Rendering PDF page ${pageNum} to canvas...`);
        const canvas = await renderPdfPageToCanvas(pdfDoc, pageNum);

        console.log(`OCR Service: Processing OCR on page ${pageNum}...`);
        const { data: { text: pageText } } = await Tesseract.recognize(
          canvas,
          'eng',
          { logger: m => console.log(m) }
        );
        text += pageText + '\n';
      }
    } else {
      console.log("OCR Service: Processing image file directly...");
      const { data: { text: imgText } } = await Tesseract.recognize(
        file,
        'eng',
        { logger: m => console.log(m) }
      );
      text = imgText;
    }

    console.log("OCR RAW TEXT:", text);

    // 🛑 Noise Filter: Exclude common invoice headers and metadata
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
      // Filter out lines that look like just a Zip Code or address line (e.g. "City, NY 10001")
      .filter(line => !/\d{5}$/.test(line)); 
    
    const candidates = [];
    
    for (const line of lines) {
      // Strategy A: Pipe-separated table row parsing (e.g. "| Wire Stripper | 10 | $12.50 |")
      if (line.includes('|')) {
        const parts = line.split('|')
          .map(p => p.trim())
          .filter(p => p.length > 0);

        if (parts.length >= 2) {
          const possibleName = parts[0];
          const possibleQty = parseInt(parts[1], 10);

          if (possibleName && !isNaN(possibleQty) && possibleQty > 0) {
            const cleanName = possibleName
              .replace(/^[\W_]+|[\W_]+$/g, '')
              .replace(/[:|]/g, '')
              .trim();

            if (cleanName.length > 2) {
              candidates.push({
                raw_name: cleanName,
                quantity: possibleQty,
                original_line: line
              });
              continue; // Successfully parsed via Strategy A, proceed to next line
            }
          }
        }
      }

      // Strategy B: Price-guided regex parsing (e.g. "Multimeter 5 | $35.00 $175.00")
      // Normalize line to clear extra spaces/pipes
      const normalizedLine = line.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
      const priceRegexMatch = normalizedLine.match(/(.*?)\s+(\d+)\s+[\$]?\d+(?:\.\d+)?/);
      
      if (priceRegexMatch) {
        const possibleName = priceRegexMatch[1];
        const possibleQty = parseInt(priceRegexMatch[2], 10);

        if (possibleName && !isNaN(possibleQty) && possibleQty > 0) {
          const cleanName = possibleName
            .replace(/^[\W_]+|[\W_]+$/g, '')
            .replace(/[:|]/g, '')
            .trim();

          if (cleanName.length > 2) {
            candidates.push({
              raw_name: cleanName,
              quantity: possibleQty,
              original_line: line
            });
            continue; // Successfully parsed via Strategy B, proceed to next line
          }
        }
      }

      // Strategy C: Original fallback (ends with a number, e.g. "Crimping Tool 4")
      const fallbackMatch = line.match(/(.*?)\s+(\d+)$/);
      if (fallbackMatch) {
        const possibleName = fallbackMatch[1];
        const possibleQty = parseInt(fallbackMatch[2], 10);

        if (possibleName && !isNaN(possibleQty) && possibleQty > 0) {
          const cleanName = possibleName
            .replace(/^[\W_]+|[\W_]+$/g, '')
            .replace(/[:|]/g, '')
            .trim();

          if (cleanName.length > 2) {
            candidates.push({
              raw_name: cleanName,
              quantity: possibleQty,
              original_line: line
            });
          }
        }
      }
    }

    return candidates;
  } catch (err) {
    console.error("OCR Processing Error:", err);
    throw err;
  }
};
