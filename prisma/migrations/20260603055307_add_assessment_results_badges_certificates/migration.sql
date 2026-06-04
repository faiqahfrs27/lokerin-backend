-- CreateTable
CREATE TABLE "assessment_results" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "assessmentId" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "answers" JSONB,
    "score" INTEGER,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges_earned" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "assessmentResultId" UUID NOT NULL,
    "assessmentId" UUID NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_earned_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "assessmentResultId" UUID NOT NULL,
    "assessmentId" UUID NOT NULL,
    "code" UUID NOT NULL,
    "qr_url" TEXT,
    "pdf_url" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assessment_results_userId_idx" ON "assessment_results"("userId");

-- CreateIndex
CREATE INDEX "assessment_results_assessmentId_idx" ON "assessment_results"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "badges_earned_assessmentResultId_key" ON "badges_earned"("assessmentResultId");

-- CreateIndex
CREATE INDEX "badges_earned_userId_idx" ON "badges_earned"("userId");

-- CreateIndex
CREATE INDEX "badges_earned_assessmentId_idx" ON "badges_earned"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_assessmentResultId_key" ON "certificates"("assessmentResultId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_code_key" ON "certificates"("code");

-- CreateIndex
CREATE INDEX "certificates_code_idx" ON "certificates"("code");

-- CreateIndex
CREATE INDEX "certificates_userId_idx" ON "certificates"("userId");

-- AddForeignKey
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "skill_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badges_earned" ADD CONSTRAINT "badges_earned_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badges_earned" ADD CONSTRAINT "badges_earned_assessmentResultId_fkey" FOREIGN KEY ("assessmentResultId") REFERENCES "assessment_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badges_earned" ADD CONSTRAINT "badges_earned_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "skill_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_assessmentResultId_fkey" FOREIGN KEY ("assessmentResultId") REFERENCES "assessment_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "skill_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
