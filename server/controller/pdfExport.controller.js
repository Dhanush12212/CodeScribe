import ejs from "ejs";
import hljs from "highlight.js";
import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportPDF = async (req, res) => {
  try {
    const { code, language } = req.body;

    const safeLang = hljs.getLanguage(language) ? language : "plaintext";
    const highlightedCode = hljs.highlight(code, { language: safeLang }).value;

    const today = new Date();
    const formattedDate =
      String(today.getDate()).padStart(2, "0") + "/" +
      String(today.getMonth() + 1).padStart(2, "0") + "/" +
      today.getFullYear();

    const html = await ejs.renderFile(
      path.join(__dirname, "../views/CodeTemplate.ejs"),
      {
        highlightedCode,
        language: safeLang,
        createdOn: formattedDate,
      }
    );

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });

    await browser.close(); 
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Code.pdf"'
    );
    
    return res.end(pdfBuffer);
    
  } catch (err) {
    console.error("PDF ERROR:", err);
    return res.status(500).json({ error: "PDF generation failed" });
  }
};

export { exportPDF };
