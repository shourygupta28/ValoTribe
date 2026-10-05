-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiotLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "RiotLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "discoveryOptIn" BOOLEAN NOT NULL DEFAULT false,
    "roles" TEXT[],
    "agents" TEXT[],
    "languages" TEXT[],
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "availability" JSONB NOT NULL,
    "queueIntent" TEXT NOT NULL,
    "rank" TEXT NOT NULL DEFAULT 'Unranked',
    "onboarded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Passport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchSummary" (
    "id" TEXT NOT NULL,
    "riotLinkId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "roundsPlayed" INTEGER NOT NULL,
    "summary" JSONB NOT NULL,

    CONSTRAINT "MatchSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LFGPost" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "rolesNeeded" TEXT[],
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LFGPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateTable
CREATE TABLE "AuthAttempt" (
    "key" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthAttempt_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RiotLink_userId_key" ON "RiotLink"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RiotLink_puuid_key" ON "RiotLink"("puuid");

-- CreateIndex
CREATE UNIQUE INDEX "Passport_userId_key" ON "Passport"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchSummary_riotLinkId_matchId_key" ON "MatchSummary"("riotLinkId", "matchId");

-- CreateIndex
CREATE INDEX "LFGPost_region_expiresAt_idx" ON "LFGPost"("region", "expiresAt");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "AuthAttempt_expiresAt_idx" ON "AuthAttempt"("expiresAt");

-- AddForeignKey
ALTER TABLE "RiotLink" ADD CONSTRAINT "RiotLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passport" ADD CONSTRAINT "Passport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchSummary" ADD CONSTRAINT "MatchSummary_riotLinkId_fkey" FOREIGN KEY ("riotLinkId") REFERENCES "RiotLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LFGPost" ADD CONSTRAINT "LFGPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

