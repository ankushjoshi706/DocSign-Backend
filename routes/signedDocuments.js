// routes/signedDocuments.js - ES Module version
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure SavedSign directory exists (separate from uploads)
const ensureSavedSignDir = async () => {
  const savedSignDir = path.join(__dirname, '../SavedSign');
  try {
    await fs.access(savedSignDir);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(savedSignDir, { recursive: true });
    console.log('📁 Created SavedSign directory:', savedSignDir);
  }
};

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// POST endpoint to save signed document
router.post('/save-signed-document', upload.single('signedPdf'), async (req, res) => {
  try {
    console.log('📥 Received request to save signed document');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No PDF file provided' 
      });
    }

    // Get original filename and document ID from request
    const { originalFileName, docId } = req.body;
    
    if (!originalFileName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Original filename is required' 
      });
    }

    // Ensure SavedSign directory exists
    await ensureSavedSignDir();

    // Generate unique filename for signed document
    const timestamp = Date.now();
    const originalName = path.parse(originalFileName).name;
    const signedFileName = `signed-${timestamp}-${originalName}.pdf`;
    const savedSignPath = path.join(__dirname, '../SavedSign', signedFileName);

    // Save the signed PDF to SavedSign folder
    await fs.writeFile(savedSignPath, req.file.buffer);

    console.log('✅ Signed document saved:', {
      originalFile: originalFileName,
      signedFile: signedFileName,
      path: savedSignPath,
      size: req.file.size
    });

    // Optional: Update database record if you're tracking signed documents
    // await updateDocumentStatus(docId, 'signed', signedFileName);

    res.json({
      success: true,
      message: 'Signed document saved successfully',
      data: {
        originalFileName,
        signedFileName,
        savedPath: `/SavedSign/${signedFileName}`,
        size: req.file.size,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error saving signed document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save signed document',
      error: error.message
    });
  }
});

// GET endpoint to list saved signed documents
router.get('/saved-documents', async (req, res) => {
  try {
    const savedSignDir = path.join(__dirname, '../SavedSign');
    
    // Ensure directory exists
    await ensureSavedSignDir();
    
    const files = await fs.readdir(savedSignDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    
    const documentsInfo = await Promise.all(
      pdfFiles.map(async (file) => {
        const filePath = path.join(savedSignDir, file);
        const stats = await fs.stat(filePath);
        
        return {
          fileName: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          downloadUrl: `/SavedSign/${file}`
        };
      })
    );
    
    // Sort by creation date (newest first)
    documentsInfo.sort((a, b) => b.createdAt - a.createdAt);
    
    res.json({
      success: true,
      documents: documentsInfo,
      total: documentsInfo.length
    });
    
  } catch (error) {
    console.error('❌ Error listing saved documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list saved documents',
      error: error.message
    });
  }
});

// GET endpoint to download a specific signed document
router.get('/download-signed/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../SavedSign', filename);
    
    // Check if file exists
    await fs.access(filePath);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send file
    res.sendFile(path.resolve(filePath));
    
  } catch (error) {
    console.error('❌ Error downloading signed document:', error);
    res.status(404).json({
      success: false,
      message: 'Signed document not found'
    });
  }
});

export default router;