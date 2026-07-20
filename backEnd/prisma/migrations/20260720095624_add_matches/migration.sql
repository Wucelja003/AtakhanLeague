-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "round" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "teamAName" TEXT,
    "teamBName" TEXT,
    "scoreA" INTEGER,
    "scoreB" INTEGER,
    "winnerName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Match_code_key" ON "Match"("code");
