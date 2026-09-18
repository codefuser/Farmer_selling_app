-- ====================================================================
-- KisanDirect Phase 1 Database Migration Script
-- Purpose: Foundation + Multi-Role + Farmer Social Posts + Direct Chat
-- Target Engine: PostgreSQL / Supabase
-- Execution: Run directly in Supabase SQL Editor / psql
-- Safe & Idempotent: DOES NOT DROP existing tables or existing data
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. EXTENSIONS
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 2. ALTER EXISTING TABLES (NON-BREAKING ADDITIONS)
-- --------------------------------------------------------------------

-- 2.1 Update "User" table
ALTER TABLE "User" 
  ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "activeRole" TEXT NOT NULL DEFAULT 'FARMER';

-- 2.2 Update "FarmerProfile" table
ALTER TABLE "FarmerProfile"
  ADD COLUMN IF NOT EXISTS "farmingType" TEXT,
  ADD COLUMN IF NOT EXISTS "mainCrops" TEXT,
  ADD COLUMN IF NOT EXISTS "experienceYears" INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS "bio" TEXT,
  ADD COLUMN IF NOT EXISTS "identityVerificationStatus" TEXT NOT NULL DEFAULT 'VERIFIED',
  ADD COLUMN IF NOT EXISTS "farmVerificationStatus" TEXT NOT NULL DEFAULT 'VERIFIED';

-- 2.3 Update "BuyerProfile" table
ALTER TABLE "BuyerProfile"
  ADD COLUMN IF NOT EXISTS "consumerType" TEXT;

-- --------------------------------------------------------------------
-- 3. NEW TABLES: SOCIAL FEED & POSTS
-- --------------------------------------------------------------------

-- 3.1 Post Table
CREATE TABLE IF NOT EXISTS "Post" (
  "id" TEXT PRIMARY KEY,
  "farmerId" TEXT NOT NULL,
  "batchId" TEXT,
  "caption" TEXT NOT NULL,
  "cropName" TEXT,
  "price" DOUBLE PRECISION,
  "quantity" DOUBLE PRECISION,
  "unit" TEXT NOT NULL DEFAULT 'kg',
  "qualityGrade" TEXT,
  "harvestDate" TIMESTAMP(3),
  "location" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_post_farmer" FOREIGN KEY ("farmerId") REFERENCES "FarmerProfile"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_post_batch" FOREIGN KEY ("batchId") REFERENCES "ProduceBatch"("id") ON DELETE SET NULL
);

-- 3.2 Post Media Table
CREATE TABLE IF NOT EXISTS "PostMedia" (
  "id" TEXT PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "mediaUrl" TEXT NOT NULL,
  "mediaType" TEXT NOT NULL DEFAULT 'IMAGE',
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_postmedia_post" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE
);

-- 3.3 Post Like Table
CREATE TABLE IF NOT EXISTS "PostLike" (
  "id" TEXT PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_postlike_post" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_postlike_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "uq_postlike_post_user" UNIQUE ("postId", "userId")
);

-- 3.4 Post Comment Table
CREATE TABLE IF NOT EXISTS "PostComment" (
  "id" TEXT PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_postcomment_post" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_postcomment_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 3.5 Post Comment Reply Table
CREATE TABLE IF NOT EXISTS "PostCommentReply" (
  "id" TEXT PRIMARY KEY,
  "commentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_postcommentreply_comment" FOREIGN KEY ("commentId") REFERENCES "PostComment"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_postcommentreply_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- --------------------------------------------------------------------
-- 4. NEW TABLES: DIRECT CHAT SYSTEM
-- --------------------------------------------------------------------

-- 4.1 Conversation Table
CREATE TABLE IF NOT EXISTS "Conversation" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.2 Conversation Member Table
CREATE TABLE IF NOT EXISTS "ConversationMember" (
  "id" TEXT PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_convmember_conversation" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_convmember_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "uq_convmember_conv_user" UNIQUE ("conversationId", "userId")
);

-- 4.3 Message Table
CREATE TABLE IF NOT EXISTS "Message" (
  "id" TEXT PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_message_conversation" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_message_sender" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 4.4 Message Attachment Table
CREATE TABLE IF NOT EXISTS "MessageAttachment" (
  "id" TEXT PRIMARY KEY,
  "messageId" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileType" TEXT NOT NULL DEFAULT 'IMAGE',
  "fileName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_msgattachment_message" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE
);

-- 4.5 Message Read Receipt Table
CREATE TABLE IF NOT EXISTS "MessageRead" (
  "id" TEXT PRIMARY KEY,
  "messageId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_msgread_message" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_msgread_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "uq_msgread_msg_user" UNIQUE ("messageId", "userId")
);

-- --------------------------------------------------------------------
-- 5. PERFORMANCE INDEXES
-- --------------------------------------------------------------------

-- Post Indexes
CREATE INDEX IF NOT EXISTS "idx_post_farmer" ON "Post"("farmerId");
CREATE INDEX IF NOT EXISTS "idx_post_created" ON "Post"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_post_status" ON "Post"("status");

-- Post Media Index
CREATE INDEX IF NOT EXISTS "idx_postmedia_post" ON "PostMedia"("postId");

-- Post Like Indexes
CREATE INDEX IF NOT EXISTS "idx_postlike_post" ON "PostLike"("postId");
CREATE INDEX IF NOT EXISTS "idx_postlike_user" ON "PostLike"("userId");

-- Post Comment Indexes
CREATE INDEX IF NOT EXISTS "idx_postcomment_post" ON "PostComment"("postId");
CREATE INDEX IF NOT EXISTS "idx_postcomment_user" ON "PostComment"("userId");
CREATE INDEX IF NOT EXISTS "idx_postcomment_created" ON "PostComment"("createdAt");

-- Post Comment Reply Indexes
CREATE INDEX IF NOT EXISTS "idx_postcommentreply_comment" ON "PostCommentReply"("commentId");
CREATE INDEX IF NOT EXISTS "idx_postcommentreply_user" ON "PostCommentReply"("userId");

-- Conversation Member Indexes
CREATE INDEX IF NOT EXISTS "idx_convmember_user" ON "ConversationMember"("userId");
CREATE INDEX IF NOT EXISTS "idx_convmember_conv" ON "ConversationMember"("conversationId");

-- Message Indexes
CREATE INDEX IF NOT EXISTS "idx_message_conv" ON "Message"("conversationId");
CREATE INDEX IF NOT EXISTS "idx_message_sender" ON "Message"("senderId");
CREATE INDEX IF NOT EXISTS "idx_message_created" ON "Message"("createdAt" ASC);

-- Message Attachment Index
CREATE INDEX IF NOT EXISTS "idx_msgattachment_msg" ON "MessageAttachment"("messageId");

-- Message Read Indexes
CREATE INDEX IF NOT EXISTS "idx_msgread_msg" ON "MessageRead"("messageId");
CREATE INDEX IF NOT EXISTS "idx_msgread_user" ON "MessageRead"("userId");
