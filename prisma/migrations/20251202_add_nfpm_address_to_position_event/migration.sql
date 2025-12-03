-- AlterTable
ALTER TABLE "PositionEvent" ADD COLUMN IF NOT EXISTS "nfpmAddress" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PositionEvent_nfpmAddress_idx" ON "PositionEvent"("nfpmAddress");

