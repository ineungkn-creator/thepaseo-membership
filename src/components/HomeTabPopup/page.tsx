'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import BannerTerms from "@/components/BannerTerms/page";

interface FullScreenDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TermsofService {
  id: string;
  description: string;
}

interface BusinessInformation {
  id: string;
  description: string;
}

export default function HomeTabPopup({ isOpen, onClose }: FullScreenDialogProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "business">("terms");
  const [term, setTerm] = useState<TermsofService | null>(null);
  const [business, setBusiness] = useState<BusinessInformation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const [termRes, bizRes] = await Promise.all([
          axios.get("/api/admin/settings/termsofservice"),
          axios.get("/api/admin/settings/businessinformation"),
        ]);
        setTerm(termRes.data);
        setBusiness(bizRes.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // ปิดด้วย ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
        style={{ backdropFilter: "blur(2px)" }}
      >
      <div className="max-w-2xl mx-auto fixed inset-0 z-50 bg-white flex flex-col">
        {/* Header */}
        <div className="shrink-0  z-50">
          <div className="mb-0 py-4 px-4 md:px-6 md:py-4">
            <BannerTerms />
          </div>
          

          {/* Tabs */}
          <div className="flex bg-gray-100 p-2 m-2 rounded-lg gap-2">
            <button
              onClick={() => setActiveTab("terms")}
              className={`flex-1 py-2 text-sm rounded-md transition bg-white ${
                activeTab === "terms"
                  ? "bg-paseo text-white shadow"
                  : "text-gray-500"
              }`}
            >
              เงื่อนไขการใช้บริการ
            </button>
            <button
              onClick={() => setActiveTab("business")}
              className={`flex-1 py-2 text-sm rounded-md transition bg-white ${
                activeTab === "business"
                  ? "bg-paseo text-white shadow"
                  : "text-gray-500"
              }`}
            >
              ข้อมูลธุรกิจ
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-0 px-4">
          <div className=" border rounded-xl px-4 py-4">

            {loading && <p className="text-center text-gray-400">กำลังโหลด...</p>}

            {!loading && activeTab === "terms" && (
              term?.description ? (
                <div
                  className="prose text-sm prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6"
                  dangerouslySetInnerHTML={{ __html: term.description }}
                />
              ) : (
                <p className="text-gray-500">ไม่มีข้อมูล</p>
              )
            )}

            {!loading && activeTab === "business" && (
              business?.description ? (
                <div
                  className="prose text-sm prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6"
                  dangerouslySetInnerHTML={{ __html: business.description }}
                />
              ) : (
                <p className="text-gray-500">ไม่มีข้อมูล</p>
              )
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t rounded-t-xl">
          <button
            onClick={onClose}
            className="w-full bg-paseo text-white py-3 rounded-xl"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
