// types/profile.ts
export type Profile = {
  /** UUID ของผู้ใช้ */
  id: string;

  /** ชื่อเต็ม (รวมชื่อ-นามสกุล) */
  name: string;

  /** เบอร์โทรศัพท์ */
  phone: string | null;

  /** อีเมล */
  email: string | null;

  /** วันเกิด */
  dateOfBirth: Date | null;

  /** เพศ */
  gender: "MALE" | "FEMALE" | "OTHER" | null;

  /** อาชีพ */
  occupation:
    | "STUDENT"
    | "PRIVATE_EMPLOYEE"
    | "STATE_ENTERPRISE"
    | "FREELANCER"
    | "BUSINESS_OWNER"
    | "HOMEMAKER"
    | "OTHER"
    | null;

  /** ID สาขาที่ผูก */
  branchId: string | null;

  /** ประเภทที่อยู่อาศัย */
  residenceType: "TOWNHOUSE" | "CONDO" | "SINGLE_HOUSE" | null;


  /** เขต/อำเภอ */
  district: string | null;

  /** จังหวัด */
  province: string | null;

  /** ที่อยู่ */
  address: string | null;

  /** เลขที่บ้าน */
  // houseNumber: string | null;
  
  /** ซอย */
  //alley: string | null;

  /** แขวง/ตำบล */
  subDistrict: string | null;

  /** รหัสไปรษณีย์ */
  postalCode: string | null;

  /** URL รูปโปรไฟล์ */
  avatar: string | null;

  /** คะแนนสะสม */
  point: number;

  /** ยอดใช้จ่ายสะสม */
  totalSpending: number;

  /** โค้ดเชิญของตัวเอง */
  referralCode: string;

  /** โค้ดของคนที่ชวนเรา */
  referredBy: string | null;

  /** บทบาทในระบบ */
  role: "USER" | "ADMIN" | "ADMINMARKETING" | "CRMMANAGEMENT" | "STAFF";
};