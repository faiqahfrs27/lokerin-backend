-- CreateTable
CREATE TABLE "company_reviews" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "position" TEXT NOT NULL,
    "salary_estimate" INTEGER,
    "content" TEXT NOT NULL,
    "culture_rating" INTEGER NOT NULL,
    "worklife_rating" INTEGER NOT NULL,
    "facility_rating" INTEGER NOT NULL,
    "career_rating" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_reviews_company_id_idx" ON "company_reviews"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_reviews_user_id_company_id_key" ON "company_reviews"("user_id", "company_id");

-- AddForeignKey
ALTER TABLE "company_reviews" ADD CONSTRAINT "company_reviews_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_reviews" ADD CONSTRAINT "company_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
