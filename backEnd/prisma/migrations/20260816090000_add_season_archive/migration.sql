-- Finished seasons live in their own tables. A flag on the live tables would
-- not work: Team.name, Team.captainId and IndividualRegistration.userId are
-- unique, so last season's rows would block this season's registrations.

CREATE TABLE "ArchivedTeam" (
    "id" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "captainId" TEXT NOT NULL,
    "captainUsername" TEXT NOT NULL,
    "captainRole" "LaneRole",
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "registeredAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArchivedTeam_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArchivedTeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" "LaneRole" NOT NULL,
    "division" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArchivedTeamMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArchivedIndividual" (
    "id" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "role" "LaneRole" NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "registeredAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArchivedIndividual_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ArchivedTeam_season_idx" ON "ArchivedTeam"("season");
CREATE INDEX "ArchivedIndividual_season_idx" ON "ArchivedIndividual"("season");

ALTER TABLE "ArchivedTeamMember" ADD CONSTRAINT "ArchivedTeamMember_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "ArchivedTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
