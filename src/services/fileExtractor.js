// File Extractor Service for P3 Placement Coach
// Handles client-side in-browser text extraction for PDF, DOCX, and TXT files
// 100% local-first processing. No files sent to any external server.

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

// Configure pdfjs worker using Vite asset URL
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Extracts raw text from a user-selected File object in the browser
 * @param {File} file
 * @returns {Promise<{ text: string, pageCount: number, fileType: string, fileName: string }>}
 */
export async function extractTextFromFile(file) {
  if (!file) {
    throw new Error("No file was selected.");
  }

  const fileName = file.name || "resume";
  const extension = fileName.split(".").pop()?.toLowerCase();

  // 1. Handle PDF Files
  if (extension === "pdf" || file.type === "application/pdf") {
    return await extractTextFromPDF(file);
  }

  // 2. Handle Plain Text Files
  if (extension === "txt" || file.type === "text/plain") {
    return await extractTextFromTXT(file);
  }

  // 3. Handle Modern Word DOCX Files
  if (
    extension === "docx" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return await extractTextFromDOCX(file);
  }

  // 4. Handle Legacy .doc files with clear guidance
  if (extension === "doc") {
    throw new Error(
      "Legacy binary .doc files are not supported. Please save or export your resume as a standard PDF or .docx file and try again."
    );
  }

  // 5. Unsupported file format
  throw new Error(
    `Unsupported file format (.${extension || "unknown"}). Please upload a PDF (.pdf), Word document (.docx), or plain text file (.txt).`
  );
}

/**
 * Extract text from PDF using pdfjs-dist
 */
async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Ensure workerSrc is set
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    if (numPages === 0) {
      throw new Error("The PDF file contains 0 pages.");
    }

    let fullText = "";

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Accumulate text items
      let lastY = null;
      let pageText = "";

      for (const item of textContent.items) {
        if (!item.str) continue;

        // Add newline if vertical position changed significantly
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 8) {
          pageText += "\n";
        } else if (pageText.length > 0 && !pageText.endsWith(" ") && !pageText.endsWith("\n")) {
          pageText += " ";
        }

        pageText += item.str;
        lastY = item.transform[5];
      }

      fullText += pageText + "\n\n";
    }

    const cleanedText = fullText.trim();

    if (!cleanedText || cleanedText.length < 25) {
      throw new Error(
        "Could not extract readable text from this PDF. It may be a scanned image or photo without selectable text. Please upload a PDF with selectable text or use the Sample Resume."
      );
    }

    return {
      text: cleanedText,
      pageCount: numPages,
      fileType: "pdf",
      fileName: file.name
    };
  } catch (error) {
    if (error.name === "PasswordException") {
      throw new Error("This PDF is password-protected. Please remove the password protection and try again.");
    }
    if (error.name === "InvalidPDFException") {
      throw new Error("The selected file is not a valid PDF or has been corrupted.");
    }
    throw error;
  }
}

/**
 * Extract text from plain text file
 */
async function extractTextFromTXT(file) {
  try {
    const text = await file.text();
    const cleanedText = (text || "").trim();

    if (!cleanedText || cleanedText.length < 20) {
      throw new Error("The text file is empty or contains too few characters to analyze as a resume.");
    }

    return {
      text: cleanedText,
      pageCount: 1,
      fileType: "txt",
      fileName: file.name
    };
  } catch (error) {
    throw new Error(`Failed to read TXT file: ${error.message}`);
  }
}

/**
 * Extract text from DOCX file using mammoth
 */
async function extractTextFromDOCX(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const cleanedText = (result.value || "").trim();

    if (!cleanedText || cleanedText.length < 25) {
      throw new Error("The DOCX document is empty or does not contain readable text.");
    }

    return {
      text: cleanedText,
      pageCount: 1,
      fileType: "docx",
      fileName: file.name
    };
  } catch (error) {
    throw new Error(`Failed to read DOCX document: ${error.message}`);
  }
}
