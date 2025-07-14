// Example Backend API for Bank Book OCR
// This is a sample implementation for the bank book OCR endpoint
// You can integrate this with your existing Express.js server

const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision'); // Google Cloud Vision API
// or use alternative OCR services like AWS Textract, Azure Computer Vision

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize Google Cloud Vision client (optional)
// const visionClient = new vision.ImageAnnotatorClient();

// OCR endpoint for bank book processing
app.post('/ocr/bank-book', async (req, res) => {
  try {
    const { image, document_type } = req.body;
    
    if (!image) {
      return res.status(400).json({
        status: 'error',
        message: 'No image provided'
      });
    }

    console.log('📖 Processing bank book OCR request...');

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image, 'base64');

    // OCR Processing with Google Cloud Vision (example)
    /*
    const [result] = await visionClient.textDetection({
      image: { content: imageBuffer }
    });
    
    const detections = result.textAnnotations;
    const fullText = detections[0]?.description || '';
    */

    // For demonstration, we'll use pattern matching
    // In production, replace this with actual OCR service
    const mockOcrText = `
      ธนาคารกรุงเทพ จำกัด (มหาชน)
      BANGKOK BANK PUBLIC COMPANY LIMITED
      
      เลขที่บัญชี Account No.: 123-4-56789-0
      ชื่อบัญชี Account Name: นายทดสอบ ระบบ
      สาขา Branch: สาขาใหญ่ (Main Branch)
      ประเภทบัญชี Account Type: ออมทรัพย์ (Savings)
      
      วันที่เปิดบัญชี Date Opened: 15/03/2020
      สถานะบัญชี Account Status: ใช้งานได้ (Active)
    `;

    // Extract information using regex patterns
    const extractedData = extractBankInfo(mockOcrText);

    console.log('✅ OCR processing completed:', extractedData);

    res.json({
      status: 'success',
      message: 'Bank book processed successfully',
      data: extractedData,
      confidence: 0.95 // Mock confidence score
    });

  } catch (error) {
    console.error('❌ OCR processing error:', error);
    res.status(500).json({
      status: 'error',
      message: 'OCR processing failed',
      error: error.message
    });
  }
});

// Helper function to extract bank information from OCR text
function extractBankInfo(ocrText) {
  const data = {
    bank_name: '',
    account_number: '',
    account_name: '',
    branch: '',
    account_type: '',
    date_opened: '',
    status: ''
  };

  // Thai bank name patterns
  const bankPatterns = [
    { pattern: /ธนาคารกรุงเทพ|bangkok\s*bank|BBL/i, name: 'ธนาคารกรุงเทพ' },
    { pattern: /ธนาคารกสิกรไทย|kasikorn|KBANK/i, name: 'ธนาคารกสิกรไทย' },
    { pattern: /ธนาคารกรุงไทย|krung\s*thai|KTB/i, name: 'ธนาคารกรุงไทย' },
    { pattern: /ธนาคารไทยพาณิชย์|siam\s*commercial|SCB/i, name: 'ธนาคารไทยพาณิชย์' },
    { pattern: /ธนาคารกรุงศรีอยุธยา|ayudhya|BAY/i, name: 'ธนาคารกรุงศรีอยุธยา' },
    { pattern: /ธนาคารทีเอ็มบี|TMB|thanachart|TTB/i, name: 'ธนาคารทีเอ็มบีธนชาต' },
    { pattern: /ธนาคารออมสิน|GSB|government\s*saving/i, name: 'ธนาคารออมสิน' },
    { pattern: /ธนาคารซีไอเอ็มบี|CIMB/i, name: 'ธนาคารซีไอเอ็มบีไทย' }
  ];

  // Extract bank name
  for (const bankPattern of bankPatterns) {
    if (bankPattern.pattern.test(ocrText)) {
      data.bank_name = bankPattern.name;
      break;
    }
  }

  // Extract account number
  const accountMatches = [
    /(?:เลขที่บัญชี|account\s*no)[:\s]*(\d{3}-?\d{1}-?\d{5}-?\d{1})/gi,
    /(?:เลขที่บัญชี|account\s*no)[:\s]*(\d{3}-?\d{7})/gi,
    /(?:เลขที่บัญชี|account\s*no)[:\s]*(\d{10,12})/gi
  ];

  for (const pattern of accountMatches) {
    const match = ocrText.match(pattern);
    if (match && match[1]) {
      data.account_number = match[1].replace(/-/g, '');
      break;
    }
  }

  // Extract account name
  const nameMatch = ocrText.match(/(?:ชื่อบัญชี|account\s*name)[:\s]*([^\n\r]+)/gi);
  if (nameMatch && nameMatch[0]) {
    const name = nameMatch[0].replace(/(?:ชื่อบัญชี|account\s*name)[:\s]*/gi, '').trim();
    data.account_name = name;
  }

  // Extract branch
  const branchMatch = ocrText.match(/(?:สาขา|branch)[:\s]*([^\n\r\(]+)/gi);
  if (branchMatch && branchMatch[0]) {
    const branch = branchMatch[0].replace(/(?:สาขา|branch)[:\s]*/gi, '').trim();
    data.branch = branch;
  }

  // Extract account type
  const typeMatch = ocrText.match(/(?:ประเภทบัญชี|account\s*type)[:\s]*([^\n\r\(]+)/gi);
  if (typeMatch && typeMatch[0]) {
    const type = typeMatch[0].replace(/(?:ประเภทบัญชี|account\s*type)[:\s]*/gi, '').trim();
    data.account_type = type;
  }

  // Extract date opened
  const dateMatch = ocrText.match(/(?:วันที่เปิดบัญชี|date\s*opened)[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/gi);
  if (dateMatch && dateMatch[1]) {
    data.date_opened = dateMatch[1];
  }

  // Extract status
  const statusMatch = ocrText.match(/(?:สถานะบัญชี|account\s*status)[:\s]*([^\n\r\(]+)/gi);
  if (statusMatch && statusMatch[0]) {
    const status = statusMatch[0].replace(/(?:สถานะบัญชี|account\s*status)[:\s]*/gi, '').trim();
    data.status = status;
  }

  return data;
}

// Alternative OCR integration examples:

/* 
// AWS Textract Example
const AWS = require('aws-sdk');
const textract = new AWS.Textract({ region: 'us-east-1' });

async function detectTextWithAWS(imageBuffer) {
  const params = {
    Document: {
      Bytes: imageBuffer
    }
  };
  
  const result = await textract.detectDocumentText(params).promise();
  const extractedText = result.Blocks
    .filter(block => block.BlockType === 'LINE')
    .map(block => block.Text)
    .join('\n');
    
  return extractedText;
}
*/

/*
// Azure Computer Vision Example
const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');
const { ApiKeyCredentials } = require('@azure/ms-rest-js');

const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': 'YOUR_KEY' } }),
  'YOUR_ENDPOINT'
);

async function detectTextWithAzure(imageBuffer) {
  const result = await computerVisionClient.recognizePrintedTextInStream(
    true, // detectOrientation
    imageBuffer
  );
  
  let extractedText = '';
  if (result.regions) {
    result.regions.forEach(region => {
      region.lines.forEach(line => {
        line.words.forEach(word => {
          extractedText += word.text + ' ';
        });
        extractedText += '\n';
      });
    });
  }
  
  return extractedText;
}
*/

module.exports = app;

console.log('🏦 Bank Book OCR API is ready!');
console.log('📝 Endpoint: POST /ocr/bank-book');
console.log('💡 Don\'t forget to configure your OCR service credentials');
