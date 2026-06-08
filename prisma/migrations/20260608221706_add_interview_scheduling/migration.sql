-- CreateTable
CREATE TABLE "interviews" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interviews_application_id_key" ON "interviews"("application_id");

-- CreateIndex
CREATE INDEX "interviews_scheduled_at_idx" ON "interviews"("scheduled_at");

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
