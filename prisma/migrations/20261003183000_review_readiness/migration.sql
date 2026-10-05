ALTER TABLE "User" ADD COLUMN "suspendedAt" TIMESTAMP(3), ADD COLUMN "emailVerifiedAt" TIMESTAMP(3), ADD COLUMN "termsAcceptedAt" TIMESTAMP(3), ADD COLUMN "policyVersion" TEXT;
CREATE TABLE "AccountToken" ("tokenHash" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "purpose" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL);
CREATE INDEX "AccountToken_expiresAt_idx" ON "AccountToken"("expiresAt");
CREATE TABLE "Block" ("id" TEXT PRIMARY KEY, "blockerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "blockedId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "Block_blockerId_blockedId_key" ON "Block"("blockerId","blockedId");
CREATE INDEX "Block_blockedId_idx" ON "Block"("blockedId");
CREATE TABLE "Report" ("id" TEXT PRIMARY KEY,"reporterId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,"subjectId" TEXT NOT NULL,"reason" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'OPEN',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status","createdAt");
