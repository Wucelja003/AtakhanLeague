-- Round-robin group stage. Teams by name, as Match already does.

CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "tournament" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroupTeam" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    CONSTRAINT "GroupTeam_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroupMatch" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "teamAName" TEXT NOT NULL,
    "teamBName" TEXT NOT NULL,
    "winnerName" TEXT,
    "killsA" INTEGER,
    "killsB" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GroupMatch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Group_tournament_name_key" ON "Group"("tournament", "name");
CREATE INDEX "Group_tournament_idx" ON "Group"("tournament");
CREATE UNIQUE INDEX "GroupTeam_groupId_teamName_key" ON "GroupTeam"("groupId", "teamName");
CREATE INDEX "GroupMatch_groupId_idx" ON "GroupMatch"("groupId");

ALTER TABLE "GroupTeam" ADD CONSTRAINT "GroupTeam_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupMatch" ADD CONSTRAINT "GroupMatch_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
