// Helper untuk testing manual selama login endpoint belum dibikin temen.
// JANGAN di-commit (folder scripts/ udah masuk .gitignore).
//
// Cara pake:
//   1. Register admin via POST /api/auth/register
//   2. Verify email-nya
//   3. Ambil user.id dan user.companyId dari Prisma Studio (npx prisma studio)
//   4. Paste di payload di bawah
//   5. Run: tsx scripts/dev-token.ts
//   6. Copy token-nya, pake di header Authorization: Bearer <token>

import jwt from "jsonwebtoken";
import "dotenv/config";

const secret = process.env.JWT_SECRET || "dev-secret-change-me";

const payload = {
  id: "PASTE_ADMIN_USER_ID_DARI_DB",
  email: "admin@example.com",
  role: "admin",
  isVerified: true,
  companyId: "PASTE_COMPANY_ID_DARI_DB",
};

const token = jwt.sign(payload, secret, { expiresIn: "1d" });
console.log("\n=== JWT Token (valid 1 hari) ===\n");
console.log(token);
console.log("\n=== Pake di Authorization header ===\n");
console.log(`Authorization: Bearer ${token}\n`);