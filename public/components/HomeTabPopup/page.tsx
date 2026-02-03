'use client';

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
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

export default function HomeTabPopup({
  isOpen,
  onClose,
}: FullScreenDialogProps) {

  const [term, setTerm] = useState<TermsofService>({ id: "", description: "" });
  const [business, setBusiness] = useState<BusinessInformation>({ id: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch UploadTerm on mount
  useEffect(() => {
    const fetchTerm = async () => {
      try {
        const response = await axios.get("/api/admin/settings/termsofservice");
        setTerm(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch terms");
        setLoading(false);
      }
    };
    fetchTerm();
  }, []);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await axios.get("/api/admin/settings/businessinformation");
        setBusiness(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch terms");
        setLoading(false);
      }
    };
    fetchBusiness();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rerative fixed left-0 top-0 h-screen w-screen max-w-none rounded-none p-0">
        <div className="flex h-full flex-col">
          <DialogHeader>
            <DialogTitle className="flex h-full items-center justify-center">
              <BannerTerms />
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-4">
            <Tabs defaultValue="terms" className="h-full w-full">
              <TabsList className="grid grid-cols-2 bg-gray-100 p-1 border border-gray-300">
                <TabsTrigger value="terms">เงื่อนไขการใช้บริการ</TabsTrigger>
                <TabsTrigger value="business">ข้อมูลธุรกิจ</TabsTrigger>
              </TabsList>
              <div className="pt-4 text-gray-700">
                <TabsContent value="terms">
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      {term.description ? (
                        <div
                          className="prose text-base mb-2 prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6"
                          dangerouslySetInnerHTML={{ __html: term.description }}
                        />
                      ) : (
                        <p className="text-gray-500">No terms defined.</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="business">
                  <div className="flex gap-2">
                      {business.description ? (
                        <div
                          className="prose text-base mb-2 prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6"
                          dangerouslySetInnerHTML={{ __html: business.description }}
                        />
                      ) : (
                        <p className="text-gray-500">No terms defined.</p>
                      )}
                    </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <DialogFooter className="hidden flex-none p-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="default"
                className="text-white p-3 rounded-xl bg-paseo"
              >
                ปิด
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}