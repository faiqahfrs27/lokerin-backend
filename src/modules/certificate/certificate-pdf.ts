import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export interface CertData {
  holderName: string;
  skillTitle: string;
  skillCategory: string;
  score: number;
  issuedAt: Date;
  code: string;
}

type Doc = PDFKit.PDFDocument;

const W = 841.89;
const H = 595.28;

const C = {
  orange500: "#F97316",
  orange600: "#EA580C",
  orange700: "#C2410C",
  stone900: "#1C1917",
  stone600: "#57534E",
  stone400: "#A8A29E",
  stone300: "#D6D3D1",
  orange200: "#FED7AA",
  orange50: "#FFF7ED",
};

const makeQrBuffer = async (code: string) => {
  const url = `${process.env.BASE_URL_FE}/verify/${code}`;
  return await QRCode.toBuffer(url, { width: 120, margin: 1 });
};

const drawTopLeft = (doc: Doc) => {
  doc.save();
  doc.polygon([0, 0], [340, 0], [0, 240]).fill(C.orange500);
  doc.polygon([0, 0], [240, 0], [0, 300]).fill(C.orange600);
  doc.polygon([0, 0], [150, 0], [0, 380]).fill(C.orange700);
  doc.restore();
};

const drawBottomRight = (doc: Doc) => {
  doc.save();
  doc.polygon([W, H], [W - 300, H], [W, H - 210]).fill(C.orange500);
  doc.polygon([W, H], [W - 210, H], [W, H - 260]).fill(C.orange600);
  doc.polygon([W, H], [W - 130, H], [W, H - 330]).fill(C.orange700);
  doc.restore();
};

const drawFrame = (doc: Doc) => {
  doc
    .rect(40, 40, W - 80, H - 80)
    .lineWidth(2)
    .strokeColor(C.orange200)
    .stroke();
  doc
    .rect(48, 48, W - 96, H - 96)
    .lineWidth(1)
    .strokeColor(C.orange50)
    .stroke();
};

const drawLogo = (doc: Doc) => {
  doc.roundedRect(56, 56, 40, 40, 8).fill(C.orange500);
  doc
    .moveTo(68, 66)
    .lineTo(68, 86)
    .lineTo(84, 86)
    .lineWidth(4)
    .lineCap("round")
    .strokeColor("#fff")
    .stroke();
  doc.circle(86, 68, 4).fill("#fff");
  doc
    .fillColor(C.stone900)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("lokerin", 102, 67);
};

const drawMain = (doc: Doc, data: CertData) => {
  const cx = W / 2;
  doc
    .fillColor(C.stone400)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("CERTIFICATE OF ACHIEVEMENT", 0, 130, {
      align: "center",
      characterSpacing: 2,
    });
  doc
    .fillColor(C.stone900)
    .font("Helvetica-Bold")
    .fontSize(52)
    .text("CERTIFICATE", 0, 152, { align: "center" });
  doc
    .fillColor(C.orange500)
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("OF  ACHIEVEMENT", 0, 212, { align: "center", characterSpacing: 8 });
  doc
    .fillColor(C.stone600)
    .font("Helvetica")
    .fontSize(14)
    .text("This certificate is proudly presented to", 0, 248, {
      align: "center",
    });
  doc
    .fillColor(C.orange600)
    .font("Helvetica-BoldOblique")
    .fontSize(46)
    .text(data.holderName, 0, 272, { align: "center" });
  doc
    .moveTo(cx - 170, 328)
    .lineTo(cx + 170, 328)
    .lineWidth(1.5)
    .strokeColor(C.stone300)
    .stroke();
};

const drawSkill = (doc: Doc, data: CertData) => {
  doc
    .fillColor(C.stone400)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("SKILL ASSESSMENT", 0, 338, { align: "center", characterSpacing: 4 });
  doc
    .fillColor(C.stone600)
    .font("Helvetica")
    .fontSize(13)
    .text(
      `has successfully passed the ${data.skillTitle} — ${data.skillCategory} assessment\nwith a final score of ${data.score} / 100, demonstrating verified proficiency.`,
      120,
      358,
      { align: "center", width: W - 240, lineGap: 4 },
    );
};

const drawSignature = (doc: Doc, data: CertData) => {
  const issued = data.issuedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const leftX = 220;
  const rightX = 510;
  const lineW = 155;
  const y = 450;

  doc.font("Helvetica-Bold").fontSize(14).fillColor(C.stone900);
  doc.text("Lokerin", leftX, y - 22, { width: lineW, align: "center" });
  doc.text(issued, rightX, y - 22, { width: lineW, align: "center" });

  doc
    .moveTo(leftX, y)
    .lineTo(leftX + lineW, y)
    .lineWidth(1.5)
    .strokeColor(C.stone400)
    .stroke();
  doc
    .moveTo(rightX, y)
    .lineTo(rightX + lineW, y)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(C.orange500)
    .text("ISSUED BY", leftX, y + 8, {
      width: lineW,
      align: "center",
      characterSpacing: 2,
    });
  doc.text("DATE", rightX, y + 8, {
    width: lineW,
    align: "center",
    characterSpacing: 2,
  });
};

const drawFooter = (doc: Doc, data: CertData, qr: Buffer) => {
  const y = H - 80;
  doc.font("Helvetica").fontSize(9).fillColor(C.stone400);
  doc.text(`Verify at lokerin.com/verify`, W / 2 - 100, y, {
    width: 200,
    align: "center",
  });
  doc.font("Helvetica").fontSize(8).fillColor(C.stone600);
  doc.text(data.code, W / 2 - 100, y + 14, { width: 200, align: "center" });
  doc.image(qr, W / 2 + 130, y - 24, { width: 58 });
};

export const buildCertificatePdf = async (data: CertData): Promise<Buffer> => {
  const qr = await makeQrBuffer(data.code);
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));

  drawTopLeft(doc);
  drawBottomRight(doc);
  drawFrame(doc);
  drawLogo(doc);
  drawMain(doc, data);
  drawSkill(doc, data);
  drawSignature(doc, data);
  drawFooter(doc, data, qr);

  doc.end();
  return await new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
};
