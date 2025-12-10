-- CreateTable
CREATE TABLE "PoolState" (
    "pool_address" TEXT NOT NULL,
    "dex" TEXT NOT NULL,
    "token0_address" TEXT NOT NULL,
    "token1_address" TEXT NOT NULL,
    "reserve0_raw" DECIMAL(78,0) NOT NULL,
    "reserve1_raw" DECIMAL(78,0) NOT NULL,
    "last_block_number" BIGINT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoolState_pkey" PRIMARY KEY ("pool_address")
);

-- CreateIndex
CREATE INDEX "PoolState_dex_idx" ON "PoolState"("dex");

-- CreateIndex
CREATE INDEX "PoolState_last_block_number_idx" ON "PoolState"("last_block_number");

