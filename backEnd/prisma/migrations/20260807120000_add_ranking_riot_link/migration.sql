-- Optional Riot link on a leaderboard row, so a player with no account on the
-- site can still be kept in step with Riot instead of frozen at whatever the
-- organizer typed.
ALTER TABLE "Ranking"
  ADD COLUMN "riotGameName" TEXT,
  ADD COLUMN "riotTagLine"  TEXT,
  ADD COLUMN "riotPuuid"    TEXT,
  ADD COLUMN "riotPlatform" TEXT;

-- One leaderboard row per Riot account: the same person entered twice under
-- two names would otherwise both be swept and both claim to be the truth.
CREATE UNIQUE INDEX "Ranking_riotPuuid_key" ON "Ranking"("riotPuuid");
