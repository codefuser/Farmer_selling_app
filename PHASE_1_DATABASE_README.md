# 🌾 KisanDirect Phase 1 Database Migration Guide

> **Target Database**: PostgreSQL (Supabase)  
> **Schema ORM**: Prisma 6.x  
> **Migration File**: [`PHASE_1_DATABASE_MIGRATION.sql`](./PHASE_1_DATABASE_MIGRATION.sql)

---

## 1. Overview of Changes

Phase 1 introduces the foundation for **multi-role accounts**, **farmer social commerce feeds**, and **direct farmer-to-consumer chat**.

All changes are **purely additive and idempotent**:
- No existing tables are dropped.
- No existing columns are renamed or dropped.
- Added columns have sensible defaults or are nullable.
- Existing order, matching, collective selling, quality check, and payment flows remain 100% compatible.

---

## 2. Table Modifications

### 2.1 `User` Table
- Added `avatarUrl` (TEXT, nullable): Stores profile avatar path or image URL.
- Added `activeRole` (TEXT, default: `'FARMER'`): Stores the current active mode of the authenticated user (`'FARMER'` or `'BUYER'`), allowing seamless 1-click switching without forcing permanent 1-role limits.

### 2.2 `FarmerProfile` Table
- Added `farmingType` (TEXT, nullable): Organic, Conventional, Natural, Mixed, Hydroponic.
- Added `mainCrops` (TEXT, nullable): Primary crops cultivated (e.g., `"Tomato, Brinjal, Onion"`).
- Added `experienceYears` (INTEGER, default: `5`): Agricultural experience in years.
- Added `bio` (TEXT, nullable): Farmer self-description / farm narrative.
- Added `identityVerificationStatus` (TEXT, default: `'VERIFIED'`): Identity verification state (`'PENDING'`, `'VERIFIED'`, `'REJECTED'`). **Aadhaar is never stored in plaintext.**
- Added `farmVerificationStatus` (TEXT, default: `'VERIFIED'`): Field/farm physical verification state.

### 2.3 `BuyerProfile` Table
- Added `consumerType` (TEXT, nullable): `'INDIVIDUAL'`, `'RESTAURANT'`, `'HOTEL'`, `'SUPERMARKET'`, `'WHOLESALER'`, `'CATERING'`, `'LOCAL_SHOP'`, `'OTHER'`.

---

## 3. New Tables Created

### 3.1 Social Feed & Posts
| Table | Description | Primary Key | Foreign Keys & Cascades |
| :--- | :--- | :--- | :--- |
| **`Post`** | Farmer social post with optional crop tag, harvest date, price, quantity | `id` (TEXT) | `farmerId` -> `FarmerProfile(id)` (CASCADE)<br>`batchId` -> `ProduceBatch(id)` (SET NULL) |
| **`PostMedia`** | Images/videos attached to a social post | `id` (TEXT) | `postId` -> `Post(id)` (CASCADE) |
| **`PostLike`** | Unique likes per user per post | `id` (TEXT) | `postId` -> `Post(id)` (CASCADE)<br>`userId` -> `User(id)` (CASCADE)<br>*UNIQUE(`postId`, `userId`)* |
| **`PostComment`** | Comments by consumers and fellow farmers | `id` (TEXT) | `postId` -> `Post(id)` (CASCADE)<br>`userId` -> `User(id)` (CASCADE) |
| **`PostCommentReply`** | Replies to top-level comments | `id` (TEXT) | `commentId` -> `PostComment(id)` (CASCADE)<br>`userId` -> `User(id)` (CASCADE) |

### 3.2 Direct Chat System
| Table | Description | Primary Key | Foreign Keys & Cascades |
| :--- | :--- | :--- | :--- |
| **`Conversation`** | 1-on-1 thread between two users | `id` (TEXT) | None |
| **`ConversationMember`** | User membership in conversation with read timestamps | `id` (TEXT) | `conversationId` -> `Conversation(id)` (CASCADE)<br>`userId` -> `User(id)` (CASCADE)<br>*UNIQUE(`conversationId`, `userId`)* |
| **`Message`** | Real-time chat message content | `id` (TEXT) | `conversationId` -> `Conversation(id)` (CASCADE)<br>`senderId` -> `User(id)` (CASCADE) |
| **`MessageAttachment`** | Photo or document attachment for messages | `id` (TEXT) | `messageId` -> `Message(id)` (CASCADE) |
| **`MessageRead`** | Per-message read receipts | `id` (TEXT) | `messageId` -> `Message(id)` (CASCADE)<br>`userId` -> `User(id)` (CASCADE)<br>*UNIQUE(`messageId`, `userId`)* |

---

## 4. How to Execute the Migration

### Option A: Supabase SQL Editor (Recommended)
1. Log into your Supabase project dashboard at `https://supabase.com/dashboard/project/xlqtjczjoyaxahoaunuh`.
2. Navigate to the **SQL Editor** in the left sidebar.
3. Open [`PHASE_1_DATABASE_MIGRATION.sql`](./PHASE_1_DATABASE_MIGRATION.sql).
4. Paste the entire SQL contents into a new query window.
5. Click **Run** (or press `Ctrl + Enter`).
6. Confirm that the execution reports `Success: No rows returned`.

### Option B: Local Prisma Push
If you have direct database network access:
```powershell
cd server
npx prisma db push
```

---

## 5. Rollback Considerations

To roll back Phase 1 database changes, execute in reverse order:
```sql
DROP TABLE IF EXISTS "MessageRead";
DROP TABLE IF EXISTS "MessageAttachment";
DROP TABLE IF EXISTS "Message";
DROP TABLE IF EXISTS "ConversationMember";
DROP TABLE IF EXISTS "Conversation";

DROP TABLE IF EXISTS "PostCommentReply";
DROP TABLE IF EXISTS "PostComment";
DROP TABLE IF EXISTS "PostLike";
DROP TABLE IF EXISTS "PostMedia";
DROP TABLE IF EXISTS "Post";

ALTER TABLE "BuyerProfile" DROP COLUMN IF EXISTS "consumerType";
ALTER TABLE "FarmerProfile" 
  DROP COLUMN IF EXISTS "farmingType",
  DROP COLUMN IF EXISTS "mainCrops",
  DROP COLUMN IF EXISTS "experienceYears",
  DROP COLUMN IF EXISTS "bio",
  DROP COLUMN IF EXISTS "identityVerificationStatus",
  DROP COLUMN IF EXISTS "farmVerificationStatus";

ALTER TABLE "User" 
  DROP COLUMN IF EXISTS "avatarUrl",
  DROP COLUMN IF EXISTS "activeRole";
```
