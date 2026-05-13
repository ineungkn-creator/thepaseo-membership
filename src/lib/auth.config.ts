import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import LineProvider from "next-auth/providers/line";
import { decode as jwtDecode } from "jsonwebtoken";
import bcrypt from "bcryptjs"; // ✅ เพิ่มเพื่อใช้ตรวจรหัสผ่านแอดมิน
import { generateReferralCode } from "@/utils/referral";
import { ROLE_PERMISSIONS } from "@/lib/auth/permissions";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authConfig: NextAuthOptions = {
  providers: [
    // ✅ ADMIN LOGIN (Email + Password)
    CredentialsProvider({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        const { email, password } = credentials ?? {};
        if (!email || !password) throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");

        const admin = await prisma.user.findUnique({ where: { email } });
        if (!admin) throw new Error("ไม่พบผู้ใช้");

        if (!["ADMIN", "ADMINMARKETING", "CRMMANAGEMENT", "STAFF"].includes(admin.role)) {
          throw new Error("บัญชีนี้ไม่มีสิทธิ์เข้าหลังบ้าน");
        }

        const isValid = await bcrypt.compare(password, admin.password ?? "");
        if (!isValid) throw new Error("รหัสผ่านไม่ถูกต้อง");

        await prisma.user.update({
          where: { id: admin.id },
          data: { lastLogin: new Date() },
        });

        // ✅ ใช้ as any เพื่อให้ type ตรง authorize requirement
        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        } as any;
      }
    }),

    // ✅ USER LOGIN (Phone + OTP)
    CredentialsProvider({
      id: "credentials",
      name: "Phone Login",
      credentials: {
        phone: { label: "Phone", type: "text" },
      },

      async authorize(credentials): Promise<any> {
        if (!credentials?.phone) {
          throw new Error("Phone required");
        }

        const phone = credentials.phone;

        const user = await prisma.user.findUnique({
          where: { phone },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // ✅ เช็คว่า OTP ถูก verify แล้วหรือยัง
        const verifiedOtp = await prisma.otpVerification.findFirst({
          where: {
            phone,
            purpose: "VERIFY_PHONE",
            verifiedAt: { not: null },
          },
          orderBy: { createdAt: "desc" },
        })

        if (!verifiedOtp) {
          throw new Error("OTP not verified")
        }

        if (!verifiedOtp) {
          throw new Error("OTP not verified");
        }

        // ✅ login สำเร็จ → update lastLogin
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
        };
      },
    }),

    // ✅ LINE OAUTH LOGIN
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
      authorization: { params: { scope: "openid profile email" } },
    }),

    // ✅ LINE LIFF LOGIN
    {
  id: "line-liff",
  name: "LINE LIFF",
  type: "credentials",
  credentials: {
    idToken: { label: "LINE ID Token", type: "text" },
  },

  async authorize(credentials): Promise<any> {
    if (!credentials?.idToken) return null;

    const decoded = jwtDecode(credentials.idToken) as any;
    const lineId = decoded.sub;
    const email = decoded.email ?? `${lineId}@line.fake`;
    const name = decoded.name ?? "LINE User";
    const avatar = decoded.picture ?? null;

    if (!lineId) return null;

    // ------------------------------
    // 1) หา user จาก lineId หรือ email เดิม
    // ------------------------------
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { lineId },
          { email },
        ]
      }
    });

    // ------------------------------
    // 2) ถ้าไม่เจอ → สร้างใหม่
    // ------------------------------
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          lineId,
          avatar,
          referralCode: generateReferralCode(),
          lastLogin: new Date(),
        }
      });
    } else {
      // ------------------------------
      // 3) ถ้ามีอยู่แล้ว → อัปเดตข้อมูล LINE
      // ------------------------------
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          avatar,
          lineId,
          lastLogin: new Date(),
        }
      });
    }

    // ------------------------------
    // ⭐ สำคัญมาก → ต้อง return id
    // ------------------------------
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      lineId: user.lineId,
    };
  }
},
  ],

  session: {
    strategy: "jwt",
    maxAge: 90 * 24 * 60 * 60
  },
  jwt: {
    maxAge: 90 * 24 * 60 * 60
  },
  secret: process.env.NEXTAUTH_SECRET,

  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    },
  },

  pages: { signIn: "/auth/login" },

  callbacks: {
    // ✅ JWT callback
    async jwt({ token, user, account, trigger, session }) {
      if (account?.provider === "line") {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.lineId = user?.id;
      }

      // ✅ ตอน login ครั้งแรก
      if (user) {
        token.id = user.id;
      }

      // ✅ ดึงข้อมูลล่าสุดจาก DB ทุกครั้ง
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            dateOfBirth: true,
            gender: true,
            branchId: true,
            occupation: true,
          },
        });

        if (dbUser) {
          token.name = dbUser.name;
          token.phone = dbUser.phone;
          token.email = dbUser.email;
          token.role = dbUser.role;
          token.dateOfBirth = dbUser.dateOfBirth;
          token.gender = dbUser.gender;
          token.branchId = dbUser.branchId;
          token.occupation = dbUser.occupation;
          token.permissions = ROLE_PERMISSIONS[dbUser.role] ?? [];
        }
      }

      if (trigger === "update" && session) {
        token.dateOfBirth = session.dateOfBirth ?? null;
        token.branchId = session.branchId ?? null;
        token.occupation = (user as any).occupation ?? null;
        token.gender = (user as any).gender ?? null;
      }

      return token;
    },

    // ✅ Session callback
      async session({ session, token }) {
        if (token) {
          const t = token as any;
          session.user.id = t.id;
          session.user.name = t.name;
          session.user.phone = t.phone;
          session.user.email = t.email;
          session.user.role = t.role;
          session.user.dateOfBirth = t.dateOfBirth;
          session.user.gender = t.gender;
          session.user.branchId = t.branchId;
          session.user.occupation = t.occupation;
          session.user.redirectTo = t.redirectTo;

          session.user.lineId = t.lineId;
          session.user.lineToken = t.accessToken;
          session.user.avatar = t.avatar;
          session.user.permissions = t.permissions ?? [];
        }

        return session;
      },

    // ✅ SignIn callback (LINE auto create/update)
    async signIn({ user, account, profile }) {
      if (account?.provider === "line" && profile) {
        const lineProfile = profile as {
          sub: string;
          name?: string;
          email?: string;
          picture?: string;
        };

        const email = lineProfile.email ?? `${lineProfile.sub}@line.fake`;
        const avatar = lineProfile.picture ?? null;
        const expiresIn =
          typeof account.expires_in === "number" ? account.expires_in : null;
        const lineTokenExpiresAt = expiresIn
          ? new Date(Date.now() + expiresIn * 1000)
          : null;

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              lineId: lineProfile.sub,
              avatar,
              lineToken: account.access_token,
              lineRefreshToken: account.refresh_token,
              lineTokenExpiresAt,
              lastLogin: new Date(),
            },
          });

          Object.assign(user, {
            id: existingUser.id,
            name: existingUser.name,
            phone: existingUser.phone,
            role: existingUser.role,
            avatar,
            lineId: lineProfile.sub,
          });
        } else {
          const newUser = await prisma.user.create({
            data: {
              name: lineProfile.name ?? "LINE User",
              email,
              referralCode: generateReferralCode(),
              lineId: lineProfile.sub,
              avatar,
              lineToken: account.access_token,
              lineRefreshToken: account.refresh_token,
              lineTokenExpiresAt,
              lastLogin: new Date(),
            },
          });

          Object.assign(user, {
            id: newUser.id,
            name: newUser.name,
            phone: newUser.phone,
            role: newUser.role,
            avatar,
            lineId: lineProfile.sub,
          });
        }
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          dateOfBirth: true,
          gender: true,
          branchId: true,
          occupation: true,
        },
      });

      Object.assign(user, dbUser);
      if (!dbUser) return false;

      // ✅ เช็คเฉพาะ USER เท่านั้น
      if (dbUser.role === "USER") {
        const isIncomplete =
          !dbUser.dateOfBirth ||
          !dbUser.gender ||
          !dbUser.phone ||
          !dbUser.branchId ||
          !dbUser.occupation;

        if (isIncomplete) {
          (user as any).redirectTo = "/complete-profile";
        }
      }

      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.includes("/complete-profile")) {
        return `${baseUrl}/complete-profile`;
      }
      return baseUrl;
    },
  },
};
