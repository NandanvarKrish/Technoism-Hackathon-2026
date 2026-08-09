/* TECHNOISM HACKATHON 2026 — Resume Parsing & File Processing Engine */

window.ResumeParser = {
  // Validate supported file formats & size
  validateFile(file) {
    if (!file) {
      return { valid: false, message: 'No file selected.' };
    }

    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExt) {
      return {
        valid: false,
        message: `Unsupported file format (${file.name}). Please upload a PDF (.pdf) or Word document (.docx).`
      };
    }

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      return {
        valid: false,
        message: `File size exceeds ${maxSizeMB}MB limit. Please upload a smaller file.`
      };
    }

    return { valid: true, message: 'Valid file format.' };
  },

  // Asynchronously extract text from PDF or DOCX file
  async parseResumeFile(file) {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const fileName = file.name.toLowerCase();

    // 1. Plain Text Reading
    if (fileName.endsWith('.txt') || file.type === 'text/plain') {
      const text = await file.text();
      return this.cleanExtractedText(text);
    }

    // 2. PDF Extraction using PDF.js
    if (fileName.endsWith('.pdf')) {
      return await this.extractTextFromPdf(file);
    }

    // 3. DOCX Extraction using Mammoth.js
    if (fileName.endsWith('.docx')) {
      return await this.extractTextFromDocx(file);
    }

    throw new Error(`Unsupported file type: ${file.name}`);
  },

  // Page-by-page PDF extraction via PDF.js
  async extractTextFromPdf(file) {
    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF parsing library (pdf.js) is loading or unavailable.');
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      const cleaned = this.cleanExtractedText(fullText);

      if (cleaned.length < 50) {
        throw new Error('Extracted text is empty or unreadable (likely a scanned image PDF). Please use the manual text fallback input below to paste your resume text.');
      }

      return cleaned;
    } catch (err) {
      console.warn('PDF Parsing Error:', err);
      if (err.message.includes('scanned image PDF')) {
        throw err;
      }
      throw new Error(`Unable to extract text from PDF (${file.name}). ${err.message || 'Please use the manual text input fallback.'}`);
    }
  },

  // DOCX extraction via Mammoth.js
  async extractTextFromDocx(file) {
    try {
      if (!window.mammoth) {
        throw new Error('Word DOCX parsing library (mammoth.js) is loading or unavailable.');
      }

      const arrayBuffer = await file.arrayBuffer();
      const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
      const rawText = result.value || '';
      const cleaned = this.cleanExtractedText(rawText);

      if (cleaned.length < 50) {
        throw new Error('Extracted DOCX text is too brief or unreadable. Please use the manual text fallback input below.');
      }

      return cleaned;
    } catch (err) {
      console.warn('DOCX Parsing Error:', err);
      throw new Error(`Unable to extract text from DOCX (${file.name}). ${err.message || 'Please use the manual text input fallback.'}`);
    }
  },

  // Normalize & clean extracted text
  cleanExtractedText(text) {
    if (!text) return '';
    return text
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ');
  },

  // Word & Character counter utility
  getTextMetrics(text) {
    if (!text) return { charCount: 0, wordCount: 0 };
    const trimmed = text.trim();
    const charCount = trimmed.length;
    const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
    return { charCount, wordCount };
  }
};
