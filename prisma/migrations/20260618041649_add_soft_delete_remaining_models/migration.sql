-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "pre_selection_tests" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "test_questions" ADD COLUMN     "deleted_at" TIMESTAMP(3);
