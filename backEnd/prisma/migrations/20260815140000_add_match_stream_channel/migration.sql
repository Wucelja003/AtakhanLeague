-- Which Kick channel is carrying a given match, so the site can label a stream
-- with the teams playing on it rather than repeating them by hand.
ALTER TABLE "Match" ADD COLUMN "streamChannel" TEXT;
