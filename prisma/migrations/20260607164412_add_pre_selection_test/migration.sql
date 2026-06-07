-- CreateTable
CREATE TABLE "pre_selection_tests" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "passing_score" INTEGER NOT NULL DEFAULT 75,
    "duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pre_selection_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_questions" (
    "id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "question_text" TEXT NOT NULL,
    "options" TEXT[],
    "correct_index" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_attempts" (
    "id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" JSONB NOT NULL,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pre_selection_tests_job_id_key" ON "pre_selection_tests"("job_id");

-- CreateIndex
CREATE INDEX "pre_selection_tests_job_id_idx" ON "pre_selection_tests"("job_id");

-- CreateIndex
CREATE INDEX "test_questions_test_id_idx" ON "test_questions"("test_id");

-- CreateIndex
CREATE INDEX "test_attempts_test_id_idx" ON "test_attempts"("test_id");

-- CreateIndex
CREATE INDEX "test_attempts_user_id_idx" ON "test_attempts"("user_id");

-- AddForeignKey
ALTER TABLE "pre_selection_tests" ADD CONSTRAINT "pre_selection_tests_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "pre_selection_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "pre_selection_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
