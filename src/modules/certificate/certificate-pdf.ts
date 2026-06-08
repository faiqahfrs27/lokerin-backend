import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { certificateHtml } from "./certificate-template.js";

export interface CertData {
  holderName: string;
  skillTitle: string;
  skillCategory: string;
  score: number;
  issuedAt: Date;
  code: string;
}

const makeQrDataUrl = async (code: string) => {
  const url = `${process.env.FRONTEND_URL}/verify/${code}`;
  return await QRCode.toDataURL(url, { width: 160, margin: 1 });
};

export const buildCertificatePdf = async (data: CertData): Promise<Buffer> => {
  const qr = await makeQrDataUrl(data.code);
  const html = certificateHtml(data, qr);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({ landscape: true, printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
};
