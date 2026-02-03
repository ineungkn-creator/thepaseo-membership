import NextAuth, { DefaultSession } from "next-auth"
import type { User as PrismaUser } from "@prisma/client"

// ✅ เพิ่ม type augmentation
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email?: string | null
      phone?: string | null
      role: "USER" | "ADMIN" | "ADMINMARKETING" | "CRMMANAGEMENT" | "STAFF";
      firstName?: string | null
      lastName?: string | null
      address?: string | null
      //houseNumber?: string | null
      //alley?: string | null
      subDistrict?: string | null
      district?: string | null
      postalCode?: string | null
      province?: string | null
      gender?: string | null
      dateOfBirth?: string | null
      occupation?: string | null
      residenceType?: string | null
      branchId?: string | null
      referralCode?: string | null
      referredBy?: string | null
      referralCampaign?: string | null
      avatar?: string | null
      overrideNote?: string | null
      totalSpending?: number
      point?: number
      redirectTo?: string | null
      lineId?: string | null
      lineToken?: string | null
      lineRefreshToken?: string | null
      permissions?: string[]
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    name: string
    email?: string | null
    phone?: string | null
    role: "USER" | "ADMIN" | "ADMINMARKETING" | "CRMMANAGEMENT" | "STAFF";
    permissions?: string[]
  }

  interface User extends PrismaUser {
    redirectTo?: string | null
    permissions?: string[]
  }



  interface JWT {
    id: string
    name: string
    email?: string | null
    phone?: string | null
    role: "USER" | "ADMIN" | "ADMINMARKETING" | "CRMMANAGEMENT" | "STAFF";
    firstName?: string | null
    lastName?: string | null
    address?: string | null
    //houseNumber?: string | null
    //alley?: string | null
    subDistrict?: string | null
    district?: string | null
    postalCode?: string | null
    province?: string | null
    gender?: string | null
    dateOfBirth?: string | null
    occupation?: string | null
    residenceType?: string | null
    branchId?: string | null
    referralCode?: string | null
    referredBy?: string | null
    referralCampaign?: string | null
    avatar?: string | null
    overrideNote?: string | null
    totalSpending?: number
    point?: number
    redirectTo?: string | null
    lineId?: string | null
    accessToken?: string | null
    lineToken?: string | null
    lineRefreshToken?: string | null
    permissions?: string[]
  }
}
