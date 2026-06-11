-- CreateTable
CREATE TABLE "cv_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "summary" TEXT,
    "phone" TEXT,
    "portfolio_url" TEXT,
    "experiences" JSONB NOT NULL DEFAULT '[]',
    "educations" JSONB NOT NULL DEFAULT '[]',
    "additional_skills" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cv_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cv_profiles_user_id_key" ON "cv_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "cv_profiles" ADD CONSTRAINT "cv_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
