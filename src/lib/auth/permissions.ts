// lib/auth/permissions.ts
import { IconType } from "react-icons";
import { MdSpaceDashboard } from "react-icons/md";
import { PiProjectorScreenChartBold } from "react-icons/pi";
import { MdEmojiEvents } from "react-icons/md";
import { MdEventNote } from "react-icons/md";
import { RiCoupon2Fill } from "react-icons/ri";
import { TbCoinBitcoinFilled } from "react-icons/tb";
import { IoReceiptSharp } from "react-icons/io5";
import { FaShop } from "react-icons/fa6";
import { MdInterests } from "react-icons/md";
import { IoIosHelpCircle } from "react-icons/io";
import { PiFlagBannerFill } from "react-icons/pi";
import { FaUser } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { FaBorderAll } from "react-icons/fa6";
import { IoMdAddCircle } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import { FaListCheck } from "react-icons/fa6";
import { TbPresentationAnalytics } from "react-icons/tb";
import { FaHashtag } from "react-icons/fa";

import { Role } from "@prisma/client";

export const PERMISSIONS = {
  CAMPAIGN_VIEW: "campaign.view",
  CAMPAIGN_CREATE: "campaign.create",
  CAMPAIGN_EDIT: "campaign.edit",
  CAMPAIGN_DELETE: "campaign.delete",

  REWARD_VIEW: "reward.view",
  REWARD_CREATE: "reward.create",
  REWARD_EDIT: "reward.edit",
  REWARD_DELETE: "reward.delete",

  EVENT_VIEW: "event.view",
  EVENT_CREATE: "event.create",
  EVENT_EDIT: "event.edit",
  EVENT_DELETE: "event.delete",

  COUPONS_VIEW: "coupons.view",
  COUPONS_CREATE: "coupons.create",
  COUPONS_EDIT: "coupons.edit",
  COUPONS_DELETE: "coupons.delete",

  USER_VIEW: "user.view",
  USER_EDIT: "user.edit",
  USER_DELETE: "user.delete",

  SETTINGS_EDIT: "settings.edit",
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: Object.values(PERMISSIONS),

  ADMINMARKETING: [
    PERMISSIONS.CAMPAIGN_VIEW,
    PERMISSIONS.CAMPAIGN_CREATE,
    PERMISSIONS.CAMPAIGN_EDIT,
    PERMISSIONS.REWARD_VIEW,
    PERMISSIONS.USER_VIEW,
  ],

  CRMMANAGEMENT: [
    PERMISSIONS.CAMPAIGN_VIEW,
    PERMISSIONS.CAMPAIGN_EDIT,
    PERMISSIONS.REWARD_VIEW,
    PERMISSIONS.REWARD_EDIT,
    PERMISSIONS.USER_VIEW,
  ],

  STAFF: [
    PERMISSIONS.CAMPAIGN_VIEW,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.COUPONS_VIEW,
    PERMISSIONS.REWARD_VIEW,
    PERMISSIONS.USER_VIEW,
  ],

  USER: [],
};

export function hasPermission(
  role: Role,
  permission: Permission
) {
  return ROLE_PERMISSIONS[role]?.includes(permission);
}

export type MenuItem = {
  name: string;
  href: string;
  logo: IconType;
  roles?: Role[];
  permission?: string;
  subItems?: {
    name: string;
    href: string;
    logo?: IconType;
    roles?: Role[];
    permission?: string;
  }[];
};

export const menuItems: MenuItem[] = [
    {
        name: "แดชบอร์ด",
        logo: MdSpaceDashboard,
        href: "/admin",
        roles: ["ADMIN", "ADMINMARKETING", "CRMMANAGEMENT", "STAFF"],
        subItems: [
        { name: "Member Overview", href: "/admin/dashboard/member", roles: ["ADMIN", "ADMINMARKETING", "CRMMANAGEMENT"], logo: TbPresentationAnalytics },
        { name: "Transaction & Spending", href: "/admin/dashboard/transaction", roles: ["ADMIN", "ADMINMARKETING", "CRMMANAGEMENT"], logo: TbPresentationAnalytics },
        { name: "Point Management", href: "/admin/dashboard/points", roles: ["ADMIN", "ADMINMARKETING", "CRMMANAGEMENT"], logo: TbPresentationAnalytics },
        { name: "Redemption & Rewards", href: "/admin/dashboard/redemption", roles: ["ADMIN", "ADMINMARKETING", "CRMMANAGEMENT"], logo: TbPresentationAnalytics },
        { name: "Coupon Campaigns", href: "/admin/dashboard/coupon", roles: ["ADMIN", "ADMINMARKETING", "CRMMANAGEMENT"], logo: TbPresentationAnalytics },
        { name: "Referral & Member Get Member", href: "/admin/dashboard/referral", roles: ["ADMIN", "ADMINMARKETING", "CRMMANAGEMENT"], logo: TbPresentationAnalytics },
        { name: "System & Staff Logs", href: "/admin/dashboard/system", roles: ["ADMIN", "ADMINMARKETING", "CRMMANAGEMENT"], logo: TbPresentationAnalytics },
        ],
    },
    {
    name: "แคมเปญ",
        logo: PiProjectorScreenChartBold,
        href: "/admin/campaign",
        roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],
        subItems: [
        { name: "แคมเปญทั้งหมด", href: "/admin/campaign", roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"], logo: FaBorderAll },
        { name: "เพิ่มแคมเปญ", href: "/admin/campaign/create", roles: ["ADMIN", "ADMINMARKETING"], logo: IoMdAddCircle },
        ],
    },
    {
        name: "รางวัล",
        logo: MdEmojiEvents,
        href: "/admin/reward",
        roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],
        subItems: [
        { name: "รางวัลทั้งหมด", href: "/admin/reward", roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],logo: FaBorderAll },
        { name: "เพิ่มรางวัล", href: "/admin/reward/create", roles: ["ADMIN", "CRMMANAGEMENT"],logo: IoMdAddCircle },
        { name: "ตรวจสอบ", href: "/admin/reward/verify", roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],logo: FaListCheck },
        ],
    },
    {
        name: "อีเว้นท์",
        logo: MdEventNote,
        href: "/admin/event",
        roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],
        subItems: [
        { name: "อีเว้นท์ทั้งหมด", href: "/admin/event", roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],logo: FaBorderAll },
        { name: "เพิ่มอีเว้นท์", href: "/admin/event/create", roles: ["ADMIN", "CRMMANAGEMENT"],logo: IoMdAddCircle },
        ],
    },
    {
        name: "คูปอง",
        logo: RiCoupon2Fill,
        href: "/admin/coupons",
        roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],
        subItems: [
        { name: "คูปองทั้งหมด", href: "/admin/coupons", roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],logo: FaBorderAll },
        { name: "เพิ่มคูปอง", href: "/admin/coupons/create", roles: ["ADMIN", "CRMMANAGEMENT"],logo: IoMdAddCircle },
        { name: "ตรวจสอบ", href: "/admin/coupons/verify", roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],logo: FaListCheck },
        ],
    },
    {
        name: "ใบเสร็จ",
        logo: IoReceiptSharp,
        href: "/admin/receipts",
        roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],
        subItems: [
        { name: "อนุมัติ", href: "/admin/receipts", roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],logo: FaListCheck },
        { name: "เพิ่มใบเสร็จ", href: "/admin/receipts/add", roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],logo: IoMdAddCircle },
        { name: "เงื่อนไข", href: "/admin/receipts/terms", roles: ["ADMIN", "CRMMANAGEMENT"],logo: FaEdit },
        ],
    },
    {
        name: "พอยท์",
        logo: TbCoinBitcoinFilled,
        href: "/admin/points",
        roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],
        subItems: [
        { name: "ตารางพอยท์", href: "/admin/points", roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],logo: FaBorderAll },
        { name: "ตั้งค่าพอยท์", href: "/admin/points/general_setting", roles: ["ADMIN", "CRMMANAGEMENT"],logo: IoSettingsSharp },
        ],
    },
    {
        name: "ร้านค้า",
        logo: FaShop,
        href: "/admin/shop",
        roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],
        subItems: [
        { name: "ร้านค้าทั้งหมด", href: "/admin/shop", roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],logo: FaBorderAll },
        { name: "เพิ่มร้านค้า", href: "/admin/shop/new", roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],logo: IoMdAddCircle },
        { name: "หมวดหมู่ร้านค้า", href: "/admin/shop/category", roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],logo: MdCategory },
        ],
    },
    {
        name: "แท็ก",
        logo: FaHashtag,
        href: "/admin/tags",
        roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],
        subItems: [
        { name: "แท็กทั้งหมด", href: "/admin/tags", roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],logo: FaBorderAll },
        ],
    },
    {
        name: "ความสนใจ",
        logo: MdInterests,
        href: "/admin/interest",
        roles: ["ADMIN", "CRMMANAGEMENT"],
        subItems: [
        { name: "รายการทั้งหมด", href: "/admin/interest",logo: FaBorderAll },
        { name: "เพิ่ม", href: "/admin/interest/new",logo: IoMdAddCircle },
        ],
    },
    {
        name: "Help",
        logo: IoIosHelpCircle,
        href: "/admin/help",
        roles: ["ADMIN", "CRMMANAGEMENT"],
        subItems: [
        { name: "ทั้งหมด", href: "/admin/help", roles: ["ADMIN", "CRMMANAGEMENT"],logo: FaBorderAll },
        { name: "เพิ่ม", href: "/admin/help/new", roles: ["ADMIN", "CRMMANAGEMENT"],logo: IoMdAddCircle },
        { name: "ติดต่อเจ้าหน้าที่", href: "/admin/help/helpterms", roles: ["ADMIN", "CRMMANAGEMENT"],logo: FaUser },
        ],
    },

    {
        name: "Banner & Popup",
        logo: PiFlagBannerFill,
        href: "/admin/popup",
        roles: ["ADMIN", "CRMMANAGEMENT"],
        subItems: [
        { name: "Popup", href: "/admin/popup/",logo: IoMdAddCircle },
        { name: "Banner Login", href: "/admin/bannerlogin",logo: IoMdAddCircle },
        { name: "Banner Register", href: "/admin/bannerregister",logo: IoMdAddCircle },
        { name: "Banner Home", href: "/admin/bannerhome",logo: IoMdAddCircle },
        { name: "Banner Collect Point", href: "/admin/bannerpoint",logo: IoMdAddCircle },
        { name: "Banner Upload", href: "/admin/bannerupload",logo: IoMdAddCircle },
        { name: "Banner Upload (เงื่อนไข)", href: "/admin/banneruploadterm",logo: IoMdAddCircle },
        { name: "Banner Term (เงื่อนไข)", href: "/admin/bannerterms",logo: IoMdAddCircle },
        ],
    },
    {
        name: "ผู้ใช้",
        logo: FaUser,
        href: "/admin/users",
        roles: ["ADMIN", "ADMINMARKETING", "CRMMANAGEMENT", "STAFF"],
        subItems: [
        { name: "ผู้ใช้ทั้งหมด", href: "/admin/users", roles: ["ADMIN", "CRMMANAGEMENT", "STAFF"],logo: FaBorderAll },
        ],
    },
    {
        name: "ตั้งค่า",
        logo: IoSettingsSharp,
        href: "/admin/settings",
        roles: ["ADMIN", "CRMMANAGEMENT"],
        subItems: [
        { name: "เงื่อนไขการใช้บริการ", href: "/admin/settings/termsofservice", roles: ["ADMIN", "CRMMANAGEMENT"],logo: FaEdit },
        { name: "ข้อมูลธุรกิจ", href: "/admin/settings/businessinformation", roles: ["ADMIN", "CRMMANAGEMENT"],logo: FaEdit },
        { name: "สาขา", href: "/admin/branch", roles: ["ADMIN", "CRMMANAGEMENT"],logo: FaShop },
        ],
    },
];
