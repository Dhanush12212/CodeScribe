import ejs from "ejs";
import hljs from "highlight.js";
import path from "path";
import { fileURLToPath } from "url";
import { getCodeHeadline } from "../utils/gemini.utils.js";
import pdf from "html-pdf";

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

    const options = {
      format: "A4",
      border: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
      type: "pdf",
      quality: "100",
      renderDelay: 300
    };

    pdf.create(html, options).toBuffer((err, buffer) => {
      if (err) {
        console.error("PDF generation error:", err);
        return res.status(500).json({
          error: "PDF generation failed",
          details: err.message,
        });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="Code.pdf"'
      );
      return res.end(buffer);
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return res.status(500).json({
      error: "PDF generation failed",
      details: err.message,
    });
  }
};
