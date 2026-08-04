-- The platform (eun1, euw1, ...) a player's account actually lives on.
-- Left NULL here: only Riot can answer it, so it's filled in lazily the first
-- time we look a player up, and by the daily ranking sweep for everyone else.
ALTER TABLE "User" ADD COLUMN "riotPlatform" TEXT;
