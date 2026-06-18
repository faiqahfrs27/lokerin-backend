export interface CertData {
  holderName: string;
  skillTitle: string;
  skillCategory: string;
  score: number;
  issuedAt: Date;
  code: string;
}

export type Doc = PDFKit.PDFDocument;

export const W = 841.89;
export const H = 595.28;

export const C = {
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
