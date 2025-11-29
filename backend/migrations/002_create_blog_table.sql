-- CreateTable
CREATE TABLE "public"."Blog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "claim" TEXT NOT NULL,
    "content" TEXT, -- Storing content in PG as backup/primary
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Blog_title_idx" ON "public"."Blog"("title");
CREATE INDEX "Blog_createdAt_idx" ON "public"."Blog"("createdAt");
