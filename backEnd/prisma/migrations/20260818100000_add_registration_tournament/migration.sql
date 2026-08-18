-- Which tournament a registration is for. Nullable: rows written before this
-- existed can't be attributed to one, and guessing would be worse than null.
ALTER TABLE "Team" ADD COLUMN "tournament" TEXT;
ALTER TABLE "IndividualRegistration" ADD COLUMN "tournament" TEXT;

CREATE INDEX "Team_tournament_idx" ON "Team"("tournament");
CREATE INDEX "IndividualRegistration_tournament_idx" ON "IndividualRegistration"("tournament");
