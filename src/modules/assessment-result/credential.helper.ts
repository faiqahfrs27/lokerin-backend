import { Prisma } from "../../../generated/prisma/client.js";

type TxClient = Prisma.TransactionClient;

// Create badge + certificate for first-time pass
export const createCredentials = async (
  tx: TxClient,
  userId: string,
  assessmentId: string,
  resultId: string,
) => {
  await tx.badgeEarned.create({
    data: { userId, assessmentResultId: resultId, assessmentId },
  });
  await tx.certificate.create({
    data: { userId, assessmentResultId: resultId, assessmentId },
  });
};

// Upgrade badge + certificate to higher score result
export const upgradeCredentials = async (
  tx: TxClient,
  badgeId: string,
  oldResultId: string,
  newResultId: string,
) => {
  await tx.badgeEarned.update({
    where: { id: badgeId },
    data: { assessmentResultId: newResultId },
  });
  await tx.certificate.update({
    where: { assessmentResultId: oldResultId },
    data: { assessmentResultId: newResultId },
  });
};

// Sync badge + certificate — create or upgrade based on score
export const syncCredentials = async (
  tx: TxClient,
  userId: string,
  assessmentId: string,
  resultId: string,
  score: number,
) => {
  const existing = await tx.badgeEarned.findFirst({
    where: { userId, assessmentId },
    include: { result: { select: { score: true } } },
  });

  if (!existing) {
    return await createCredentials(tx, userId, assessmentId, resultId);
  }
  if (score > (existing.result.score ?? 0)) {
    await upgradeCredentials(
      tx,
      existing.id,
      existing.assessmentResultId,
      resultId,
    );
  }
};
