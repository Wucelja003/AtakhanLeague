-- CreateTable
CREATE TABLE "Ranking" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "team" TEXT,
    "tier" TEXT,
    "division" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ranking_username_key" ON "Ranking"("username");

-- CreateIndex
CREATE INDEX "Ranking_points_idx" ON "Ranking"("points");
