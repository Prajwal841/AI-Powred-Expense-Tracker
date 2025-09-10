// OCR Patterns for Receipt Text Extraction
export const OCR_PATTERNS = {
  // Amount patterns - looks for total, amount, sum, due, pay with currency symbols
  amount: /(?:total|amount|sum|due|pay|rs\.?|₹|inr|grand\s*total|balance|bill)\s*:?\s*([0-9,]+\.?[0-9]*)/gi,
  
  // Simple amount patterns (just numbers that look like amounts)
  simpleAmount: /([0-9]{2,}\.[0-9]{2})|([0-9]{3,})/g,
  
  // Date patterns - various date formats
  date: /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g,
  
  // Merchant/store name patterns
  merchant: /(?:from|merchant|store|shop|restaurant|company|vendor|business)\s*:?\s*([a-zA-Z\s&\.]+)/gi,
  
  // Individual items with prices
  items: /([a-zA-Z\s]+)\s+([0-9,]+\.?[0-9]*)/g,
  
  // Tax patterns
  tax: /(?:tax|gst|vat|cgst|sgst)\s*:?\s*([0-9,]+\.?[0-9]*)/gi,
  
  // Payment method patterns
  paymentMethod: /(?:paid\s*by|payment|method)\s*:?\s*(cash|card|credit|debit|upi|net\s*banking)/gi
}

export interface ExtractedData {
  amount?: number
  date?: string
  merchant?: string
  items?: string[]
  tax?: number
  paymentMethod?: string
  confidence: number
}

export const extractDataFromText = (text: string): ExtractedData => {
  const extracted: ExtractedData = { confidence: 0 }
  let confidence = 0

  console.log('Extracting data from text:', text.substring(0, 500))

  // Extract amount (highest priority)
  const amountMatches = [...text.matchAll(OCR_PATTERNS.amount)]
  if (amountMatches.length > 0) {
    // Take the last match as it's usually the total
    const lastMatch = amountMatches[amountMatches.length - 1]
    extracted.amount = parseFloat(lastMatch[1].replace(/,/g, ''))
    confidence += 30
    console.log('Found amount:', extracted.amount)
  } else {
    // Try simple amount patterns if no structured amount found
    const simpleAmountMatches = [...text.matchAll(OCR_PATTERNS.simpleAmount)]
    if (simpleAmountMatches.length > 0) {
      // Find the largest number that looks like an amount
      const amounts = simpleAmountMatches
        .map(match => parseFloat(match[0].replace(/,/g, '')))
        .filter(amount => amount > 10 && amount < 100000) // Reasonable amount range
      
      if (amounts.length > 0) {
        extracted.amount = Math.max(...amounts)
        confidence += 20
        console.log('Found simple amount:', extracted.amount)
      }
    }
  }

  // Extract date
  const dateMatches = [...text.matchAll(OCR_PATTERNS.date)]
  if (dateMatches.length > 0) {
    extracted.date = dateMatches[0][0]
    confidence += 20
    console.log('Found date:', extracted.date)
  }

  // Extract merchant/store name
  const merchantMatches = [...text.matchAll(OCR_PATTERNS.merchant)]
  if (merchantMatches.length > 0) {
    extracted.merchant = merchantMatches[0][1].trim()
    confidence += 25
    console.log('Found merchant:', extracted.merchant)
  } else {
    // Try to extract business name from common patterns
    const businessPatterns = [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:STORE|SHOP|RESTAURANT|MARKET|MALL))/gi,
      /([A-Z][A-Z\s]+(?:LTD|INC|LLC|CO|CORP))/gi
    ]
    
    for (const pattern of businessPatterns) {
      const matches = [...text.matchAll(pattern)]
      if (matches.length > 0) {
        extracted.merchant = matches[0][1].trim()
        confidence += 15
        console.log('Found business name:', extracted.merchant)
        break
      }
    }
  }

  // Extract items
  const items: string[] = []
  const itemMatches = [...text.matchAll(OCR_PATTERNS.items)]
  itemMatches.forEach(match => {
    items.push(`${match[1].trim()} - ${match[2]}`)
  })
  if (items.length > 0) {
    extracted.items = items
    confidence += 15
    console.log('Found items:', items.length)
  }

  // Extract tax
  const taxMatches = [...text.matchAll(OCR_PATTERNS.tax)]
  if (taxMatches.length > 0) {
    extracted.tax = parseFloat(taxMatches[0][1].replace(/,/g, ''))
    confidence += 10
    console.log('Found tax:', extracted.tax)
  }

  // Extract payment method
  const paymentMatches = [...text.matchAll(OCR_PATTERNS.paymentMethod)]
  if (paymentMatches.length > 0) {
    extracted.paymentMethod = paymentMatches[0][1].toLowerCase()
    confidence += 10
    console.log('Found payment method:', extracted.paymentMethod)
  }

  extracted.confidence = Math.min(confidence, 100)
  console.log('Final extracted data:', extracted)
  return extracted
}

// Helper function to clean OCR text
export const cleanOCRText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s\.\,\-\/\₹\:]/g, '') // Remove special characters except common ones
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\r/g, ' ') // Replace carriage returns with spaces
    .trim()
}

// Helper function to validate extracted data
export const validateExtractedData = (data: ExtractedData): boolean => {
  return !!(data.amount && data.amount > 0 && data.confidence > 30)
}
