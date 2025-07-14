// OCR Configuration for Free APIs
// ================================

const OCR_CONFIG = {
  // OCR.Space (Free Tier)
  // - 25,000 requests/month free
  // - No registration required for basic use
  // - Get free API key: https://ocr.space/ocrapi
  OCR_SPACE: {
    enabled: true,
    apiKey: 'helloworld', // Free demo key (limited) - replace with your own
    baseUrl: 'https://api.ocr.space/parse/image',
    language: 'tha', // Thai language
    ocrEngine: 2, // Best for Asian languages
    maxFileSize: '1MB',
    supportedFormats: ['jpg', 'png', 'pdf', 'gif', 'bmp']
  },

  // Google Vision API (Free Tier)
  // - 1,000 requests/month free
  // - Requires Google Cloud account
  // - Get API key: https://cloud.google.com/vision
  GOOGLE_VISION: {
    enabled: false, // Set to true when you have API key
    apiKey: 'YOUR_GOOGLE_VISION_API_KEY',
    baseUrl: 'https://vision.googleapis.com/v1/images:annotate',
    features: ['TEXT_DETECTION'],
    maxFileSize: '20MB',
    supportedFormats: ['jpg', 'png', 'gif', 'bmp', 'webp', 'raw', 'ico', 'pdf', 'tiff']
  },

  // Azure Computer Vision (Free Tier)
  // - 5,000 transactions/month free
  // - Requires Azure account
  // - Get API key: https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/
  AZURE_VISION: {
    enabled: false, // Set to true when you have API key
    apiKey: 'YOUR_AZURE_API_KEY',
    endpoint: 'YOUR_AZURE_ENDPOINT',
    baseUrl: '/vision/v3.2/read/analyze',
    maxFileSize: '50MB',
    supportedFormats: ['jpg', 'png', 'bmp', 'pdf', 'tiff']
  },

  // Tesseract.js (Client-side OCR)
  // - 100% free
  // - Works offline
  // - No API key required
  TESSERACT_JS: {
    enabled: true,
    languages: ['tha', 'eng'], // Thai and English
    workerPath: 'https://unpkg.com/tesseract.js@v2.1.0/dist/worker.min.js',
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    corePath: 'https://unpkg.com/tesseract.js-core@v2.2.0/tesseract-core.wasm.js'
  }
};

// Instructions for getting API keys
const API_SETUP_INSTRUCTIONS = {
  'OCR.Space': {
    steps: [
      '1. Go to https://ocr.space/ocrapi',
      '2. Click "Register for free API"',
      '3. Fill in your email and get API key',
      '4. Replace "helloworld" with your API key',
      '5. Free tier: 25,000 requests/month'
    ],
    pros: ['Easy setup', 'Good for Thai text', '25K free requests'],
    cons: ['Rate limited', 'Requires internet']
  },

  'Google Vision': {
    steps: [
      '1. Go to https://cloud.google.com/vision',
      '2. Create Google Cloud account',
      '3. Enable Vision API',
      '4. Create API key in credentials',
      '5. Add billing info (won\'t be charged for free tier)',
      '6. Free tier: 1,000 requests/month'
    ],
    pros: ['High accuracy', 'Great Thai support', 'Google quality'],
    cons: ['Setup complex', 'Requires billing info']
  },

  'Azure Computer Vision': {
    steps: [
      '1. Go to https://azure.microsoft.com',
      '2. Create Azure account',
      '3. Create Computer Vision resource',
      '4. Get API key and endpoint',
      '5. Free tier: 5,000 transactions/month'
    ],
    pros: ['High accuracy', 'Good free tier', 'Microsoft quality'],
    cons: ['Setup complex', 'Requires Azure account']
  },

  'Tesseract.js': {
    steps: [
      '1. No setup required!',
      '2. Works offline',
      '3. 100% free forever',
      '4. Just enable in config'
    ],
    pros: ['No setup', 'Offline', '100% free', 'Privacy-friendly'],
    cons: ['Lower accuracy', 'Slower processing', 'Large download']
  }
};

// Recommended setup for Thai bank books
const RECOMMENDED_SETUP = {
  primary: 'OCR.Space', // Best balance of ease and accuracy
  fallback: 'Tesseract.js', // Always available offline
  premium: 'Google Vision', // Best accuracy for production
  
  setup_order: [
    '1. Start with OCR.Space (easiest)',
    '2. Add Tesseract.js for offline backup', 
    '3. Upgrade to Google Vision for production',
    '4. Consider Azure for high volume'
  ]
};

export { OCR_CONFIG, API_SETUP_INSTRUCTIONS, RECOMMENDED_SETUP };
