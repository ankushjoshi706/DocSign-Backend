const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

async function finalizePdf(fileName, x, y, page, signatureDataURL, signerName, nameX, nameY, signedDate, dateX, dateY) {
  const filePath = path.join(__dirname, "../uploads", fileName);
  const pdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const targetPage = pages[page - 1];

  const signatureImage = await pdfDoc.embedPng(signatureDataURL);
  const dims = signatureImage.scale(0.5);

  targetPage.drawImage(signatureImage, {
    x,
    y,
    width: dims.width,
    height: dims.height,
  });

  targetPage.drawText(signerName || "", {
    x: nameX || 150,
    y: nameY || 80,
    size: 14,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  targetPage.drawText(signedDate || "", {
    x: dateX || 150,
    y: dateY || 50,
    size: 12,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  const outputBytes = await pdfDoc.save();
  const outputFile = `signed-${Date.now()}.pdf`;
  const outputPath = path.join(__dirname, "../uploads", outputFile);
  fs.writeFileSync(outputPath, outputBytes);
  return outputFile;
}

module.exports = { finalizePdf };
