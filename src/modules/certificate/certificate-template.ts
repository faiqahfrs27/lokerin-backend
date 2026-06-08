import type { CertData } from "./certificate-pdf.js";

const LOGO = `<svg width="175" height="40" viewBox="0 0 280 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="60" height="60" rx="16" fill="#F97316"></rect>
  <path d="M22 16 L22 44 L42 44" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
  <circle cx="44" cy="20" r="5" fill="white"></circle>
  <text x="78" y="44" font-family="Geist, sans-serif" font-weight="800" font-size="36" letter-spacing="-1.4" fill="#1C1917">lokerin</text>
</svg>`;

const styles = `
*{margin:0;padding:0;box-sizing:border-box;font-family:'Geist',system-ui,sans-serif;}
body{background:#fff;}
.cert{width:100%;height:100vh;position:relative;overflow:hidden;background:#fff;}
.corner{position:absolute;}
.tl1{top:0;left:0;width:340px;height:240px;background:#F97316;clip-path:polygon(0 0,100% 0,0 100%);}
.tl2{top:0;left:0;width:240px;height:300px;background:#EA580C;clip-path:polygon(0 0,70% 0,0 100%);}
.tl3{top:0;left:0;width:150px;height:380px;background:#C2410C;clip-path:polygon(0 0,55% 0,0 100%);}
.br1{bottom:0;right:0;width:300px;height:210px;background:#F97316;clip-path:polygon(100% 100%,0 100%,100% 0);}
.br2{bottom:0;right:0;width:210px;height:260px;background:#EA580C;clip-path:polygon(100% 100%,30% 100%,100% 0);}
.br3{bottom:0;right:0;width:130px;height:330px;background:#C2410C;clip-path:polygon(100% 100%,45% 100%,100% 0);}
.frame{position:absolute;inset:40px;border:2px solid #FDBA74;border-radius:4px;}
.frame-inner{position:absolute;inset:48px;border:1px solid #FED7AA;border-radius:2px;}
.content{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
  justify-content:center;text-align:center;padding:0 130px;z-index:5;}
.logo{margin-bottom:18px;}
.title{font-size:56px;font-weight:800;color:#1C1917;letter-spacing:.04em;}
.subtitle{font-size:16px;font-weight:600;color:#F97316;letter-spacing:.32em;margin-top:6px;}
.presented{font-size:15px;color:#78716C;margin-top:28px;}
.name{font-size:48px;font-weight:800;color:#EA580C;margin-top:8px;letter-spacing:-.01em;font-style:italic;}
.name-line{width:340px;height:1.5px;background:#D6D3D1;margin:14px auto 0;}
.skill-label{font-size:14px;font-weight:600;color:#78716C;letter-spacing:.2em;text-transform:uppercase;margin-top:12px;}
.body-text{font-size:15px;color:#57534E;line-height:1.75;margin-top:22px;max-width:580px;}
.skill-name{color:#C2410C;font-weight:700;}
.sign-row{display:flex;gap:90px;margin-top:40px;}
.sign-col{text-align:center;}
.sign-value{font-size:16px;font-weight:700;color:#1C1917;margin-bottom:6px;}
.sign-line{width:175px;height:1.5px;background:#A8A29E;margin-bottom:8px;}
.sign-label{font-size:13px;font-weight:700;color:#F97316;letter-spacing:.16em;}
.foot{position:absolute;bottom:52px;left:0;right:0;display:flex;justify-content:center;
  align-items:center;gap:14px;z-index:5;}
.qr-img{width:58px;height:58px;border:3px solid #fff;box-shadow:0 0 0 1px #E7E5E4;border-radius:5px;}
.foot-meta{font-size:10px;color:#A8A29E;text-align:left;line-height:1.7;}
.code{font-family:'Geist Mono',monospace;color:#78716C;}
`;

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const certificateHtml = (data: CertData, qrDataUrl: string) => {
  return `<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${styles}</style></head><body>
<div class="cert">
  <div class="corner tl1"></div><div class="corner tl2"></div><div class="corner tl3"></div>
  <div class="corner br1"></div><div class="corner br2"></div><div class="corner br3"></div>
  <div class="frame"></div><div class="frame-inner"></div>
  <div class="content">
    <div class="logo">${LOGO}</div>
    <div class="title">CERTIFICATE</div>
    <div class="subtitle">OF ACHIEVEMENT</div>
    <div class="presented">This certificate is proudly presented to</div>
    <div class="name">${data.holderName}</div>
    <div class="name-line"></div>
    <div class="skill-label">Skill Assessment</div>
    <div class="body-text">has successfully passed the <span class="skill-name">${data.skillTitle} — ${data.skillCategory}</span> assessment with a final score of <span class="skill-name">${data.score} / 100</span>, demonstrating verified proficiency in this skill.</div>
    <div class="sign-row">
      <div class="sign-col"><div class="sign-value">Lokerin</div><div class="sign-line"></div><div class="sign-label">ISSUED BY</div></div>
      <div class="sign-col"><div class="sign-value">${fmtDate(data.issuedAt)}</div><div class="sign-line"></div><div class="sign-label">DATE</div></div>
    </div>
  </div>
  <div class="foot">
    <img class="qr-img" src="${qrDataUrl}"/>
    <div class="foot-meta">Verify at lokerin.com/verify<br><span class="code">${data.code}</span></div>
  </div>
</div>
</body></html>`;
};
