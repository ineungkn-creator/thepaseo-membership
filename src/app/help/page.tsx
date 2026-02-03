'use client';

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HeaderMobile from '@/components/HeaderMobile/page';
import { Input } from "@/components/ui/input";
import Highlighter from "react-highlight-words";
import axios from "axios";
import Loading from "@/components/loading";
import SimpleAccordion from "@/components/SimpleAccordion";

import { CiSearch, CiCircleRemove } from 'react-icons/ci';
import { FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

interface Help {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

interface HelpTerms {
  description: string;

  email1?: string;
  email2?: string;
  email3?: string;

  phone1?: string;
  phone2?: string;
  phone3?: string;
}

export default function HelpPage() {
  const [user, setUser] = useState<any>(null);
  const [helpterm, setHelpTerm] = useState<HelpTerms>({
    description: "",
    email1: "",
    email2: "",
    email3: "",
    phone1: "",
    phone2: "",
    phone3: "",
  });
  const [helps, setHelps] = useState<Help[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const emails = [helpterm.email1, helpterm.email2, helpterm.email3].filter(
    Boolean
  );

  const phones = [helpterm.phone1, helpterm.phone2, helpterm.phone3].filter(
    Boolean
  );

  // ✅ ตรวจสอบการล็อกอิน
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else if (res.status === 401) {
          router.push("/auth/login");
        }
      } catch (err) {
        console.error("fetchProfile error:", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  // ✅ ดึงข้อมูล Help Terms (ข้อความท้ายหน้า)
  useEffect(() => {
    const fetchHelpTerm = async () => {
      try {
        const response = await axios.get("/api/admin/help/helpterms");
        setHelpTerm(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHelpTerm();
  }, []);

  // ✅ ดึงข้อมูล Help ทั้งหมด
  useEffect(() => {
    const fetchHelps = async () => {
      const res = await fetch("/api/help");
      const data = await res.json();
      // เรียงลำดับตาม order และแสดงเฉพาะ isActive = true
      const sorted = data
        .filter((h: Help) => h.isActive)
        .sort((a: Help, b: Help) => (a.order ?? 0) - (b.order ?? 0));
      setHelps(sorted);
    };
    fetchHelps();
  }, []);

  // ✅ ฟิลเตอร์ด้วย search
  const filteredHelps = useMemo(() => {
    return helps.filter(
      (h) =>
        h.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [helps, searchQuery]);

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto p-0 px-0 mb-20 md:mt-20 md:mb-0 mb-4 rounded-xl">
          <HeaderMobile />

      <div className="relative max-w-2xl mx-auto md:pt-6 pt-20 bg-white rounded-t-5xl rounded-b-lg shadow-md flex flex-col gap-4">
        <div className="px-4 pb-10">

          <h1 className="text-2xl font-bold mb-6 text-center">คำถามที่พบบ่อย / Help</h1>

          {/* 🔍 ช่องค้นหา */}
          <div className="px-4 pt-0 md:px-10 md:pt-0 mb-4">
            <div className="relative ">
              <Input
                placeholder="ค้นหาคำถามหรือคำตอบ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-paseo pl-10 pr-10"
              />
              <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* 📚 Accordion แสดงคำถาม-คำตอบ */}
          <SimpleAccordion
            items={filteredHelps.map((h) => ({
              id: h.id,
              title: (
                <Highlighter
                  searchWords={[searchQuery]}
                  autoEscape
                  textToHighlight={h.question}
                  highlightClassName="bg-yellow-200"
                />
              ),
              content: (
                <div
                  className="prose text-sm prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6"
                  dangerouslySetInnerHTML={{
                    __html:
                      h.answer ||
                      "<p class='text-gray-400'>ยังไม่มีรายละเอียด...</p>",
                  }}
                />
              ),
            }))}
          />

          {/* 📞 ส่วนติดต่อท้ายหน้า */}
          <div className="pt-6 mt-8 border-t flex flex-col">
            <div className="mb-4">
              <p className="text-lg text-center text-gray-700">
                หากยังไม่ได้คำตอบ
              </p>

              <p className="text-lg text-center text-gray-700">
                คุณสามารถติดต่อเจ้าหน้าที่ได้โดยตรง
              </p>
            </div>
            

            {helpterm.description ? (
              <div
                className="prose text-base text-gray-700 mb-4 prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6"
                dangerouslySetInnerHTML={{ __html: helpterm.description }}
              />
            ) : (
              <p className="text-gray-500">ยังไม่มีข้อมูลติดต่อ</p>
            )}


            {emails.length > 0 && (
              <div className="flex flex-row items-start gap-4 mb-4">
                <div className="p-2 bg-paseo-dark rounded-lg">
                  <MdEmail size={24} className="text-white" />
                </div>

                <div className="flex flex-col">
                  <p className="text-base text-gray-500 leading-none">อีเมล</p>
                  {emails.map((email, index) => (
                    <p
                      key={index}
                      className="font-medium leading-tight mb-1"
                    >
                      <Link className="text-black text-base" href={`mailto:${email}`}>{email}</Link>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {phones.length > 0 && (
              <div className="flex flex-row items-start gap-4 mb-2">
                <div className="p-2 bg-paseo-dark rounded-lg">
                  <FaPhone size={24} className="text-white" />
                </div>

                <div>
                  <p className="text-gray-500 leading-none">เบอร์โทรศัพท์</p>
                  {phones.map((phone, index) => (
                    <p
                      key={index}
                      className="text-sm font-medium leading-tight mb-1"
                    >
                      <Link className="text-black text-base" href={`tel:${phone}`}>{phone}</Link>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
