-- CreateTable
CREATE TABLE "skill_assessments" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "skill_category" TEXT NOT NULL,
    "passing_score" INTEGER NOT NULL DEFAULT 75,
    "duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "badge_photo" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_questions" (
    "id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correct_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "skill_assessments_is_published_idx" ON "skill_assessments"("is_published");

-- CreateIndex
CREATE INDEX "assessment_questions_assessment_id_idx" ON "assessment_questions"("assessment_id");

-- AddForeignKey
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "skill_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
