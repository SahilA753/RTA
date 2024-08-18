-- CreateEnum
CREATE TYPE "KeyStatus" AS ENUM ('expired', 'invalid', 'valid', 'default');

-- CreateEnum
CREATE TYPE "KeyType" AS ENUM ('stream_xchacha20', 'secretstream', 'secretbox', 'kdf', 'generichash', 'shorthash', 'auth', 'hmacsha256', 'hmacsha512', 'aead_det', 'aead_ietf');

-- CreateEnum
CREATE TYPE "FactorStatus" AS ENUM ('verified', 'unverified');

-- CreateEnum
CREATE TYPE "FactorType" AS ENUM ('webauthn', 'totp');

-- CreateEnum
CREATE TYPE "AalLevel" AS ENUM ('aal3', 'aal2', 'aal1');

-- CreateEnum
CREATE TYPE "CodeChallengeMethod" AS ENUM ('plain', 's256');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('recurring', 'one_time');

-- CreateEnum
CREATE TYPE "PricingPlanInterval" AS ENUM ('year', 'month', 'week', 'day');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('unpaid', 'past_due', 'incomplete_expired', 'incomplete', 'canceled', 'active', 'trialing');

-- CreateEnum
CREATE TYPE "EqualityOp" AS ENUM ('in', 'gte', 'gt', 'lte', 'lt', 'neq', 'eq');

-- CreateEnum
CREATE TYPE "Action" AS ENUM ('ERROR', 'TRUNCATE', 'DELETE', 'UPDATE', 'INSERT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "email" TEXT,
    "billingAddress" JSONB,
    "updatedAt" TIMESTAMPTZ,
    "paymentMethod" JSONB,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "stripeCustomerId" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "active" BOOLEAN,
    "description" TEXT,
    "unitAmount" BIGINT,
    "currency" TEXT,
    "type" "PricingType",
    "interval" "PricingPlanInterval",
    "intervalCount" INTEGER,
    "trialPeriodDays" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN,
    "name" TEXT,
    "description" TEXT,
    "image" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SubscriptionStatus",
    "metadata" JSONB,
    "priceId" TEXT,
    "quantity" INTEGER,
    "cancelAtPeriodEnd" BOOLEAN,
    "created" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodStart" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMPTZ,
    "cancelAt" TIMESTAMPTZ,
    "canceledAt" TIMESTAMPTZ,
    "trialStart" TIMESTAMPTZ,
    "trialEnd" TIMESTAMPTZ,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE SET NULL ON UPDATE CASCADE;
