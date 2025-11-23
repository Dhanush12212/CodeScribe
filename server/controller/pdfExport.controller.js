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
 
    const html = await ejs.renderFile(
      path.join(__dirname, "../views/CodeTemplate.ejs"),
      { highlightedCode }
    );

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
 
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluateHandle("document.fonts.ready"); 

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();
 
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Code.pdf"'
    );

    return res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF ERROR:", err);
    return res.status(500).json({ error: "PDF generation failed" });
  }
};

export { exportPDF };
