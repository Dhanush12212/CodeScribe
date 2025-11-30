import ejs from "ejs";
import hljs from "highlight.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getCodeHeadline } from "../utils/gemini.utils.js";
import pdf from "html-pdf-node";

const __filename = fileURLToPath(import.meta.url);

export const exportPDF = async (req, res) => {
  try {
    const { code, language } = req.body;

    const safeLang = hljs.getLanguage(language) ? language : "plaintext";
    const highlightedCode = hljs.highlight(code, { language: safeLang }).value;

    const today = new Date();
    const formattedDate =
      `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}/${today.getFullYear()}`;

    const headline = await getCodeHeadline(code, language);

    const templatePath = path.resolve(process.cwd(), "views/CodeTemplate.ejs");

    const html = await ejs.renderFile(templatePath, {
      highlightedCode,
      language: safeLang,
      headline,
      createdOn: formattedDate,
    });

    const file = { content: html };

    const pdfBuffer = await pdf.generatePdf(file, {
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="Code.pdf"');
    return res.end(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    return res.status(500).json({ error: "PDF generation failed", details: err.message });
  }
};
