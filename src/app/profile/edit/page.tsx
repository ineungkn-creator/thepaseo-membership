'use client';

import { useEffect, useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import BackButton from '@/components/BackButton/page';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Loading from '@/components/loading';
import { CalendarIcon } from "lucide-react";

import SimpleSelect from '@/components/form/SimpleSelect'
import FormField from '@/components/form/FormField'
import ThaiAddressSelect from '@/components/address/ThaiAddressSelect'

interface Interest {
  id: string;
  name: string;
}

interface ProfileForm {
  avatar: string;
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  occupation: string;
  residenceType: string;
  address: string;
  //houseNumber: string;
  //alley: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  branchId: string;
  interests: string[];
}

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const [form, setForm] = useState<ProfileForm>({
    avatar: '',
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    occupation: '',
    residenceType: '',
    address: '',
    //houseNumber: '',
    //alley: '',
    subDistrict: '',
    district: '',
    province: '',
    postalCode: '',
    branchId: '',
    interests: [],
  });

  useEffect(() => {
    const fetchInterests = async () => {
      const res = await fetch("/api/admin/interest");
      const data = await res.json();
      setInterests(data);
    };
    fetchInterests();
  }, []);

  const toggleInterest = (id: string) => {
    if (form.interests.includes(id)) {
      setForm({
        ...form,
        interests: form.interests.filter((x) => x !== id),
      });
    } else {
      setForm({
        ...form,
        interests: [...form.interests, id],
      });
    }
  };

  const [open, setOpen] = React.useState(false);
  const date = form.dateOfBirth ? new Date(form.dateOfBirth) : undefined;

  const handleDateChange = (newDate: Date | undefined) => {
    setForm({
      ...form,
      dateOfBirth: newDate ? newDate.toISOString() : '',
    });
    setOpen(false);
  };

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.user) {
        setForm({
          avatar: data.user.avatar ?? '',
          name: data.user.name ?? '',
          phone: data.user.phone ?? '',
          email: data.user.email ?? '',
          dateOfBirth: data.user.dateOfBirth
            ? new Date(data.user.dateOfBirth).toISOString().split('T')[0]
            : '',
          gender: data.user.gender ?? '',
          occupation: data.user.occupation ?? '',
          residenceType: data.user.residenceType ?? '',
          address: data.user.address ?? '',
          subDistrict: data.user.subDistrict ?? '',
          district: data.user.district ?? '',
          province: data.user.province ?? '',
          postalCode: data.user.postalCode ?? '',
          branchId: data.user.branchId ?? '',
          interests: data.user.interests?.map((i: any) => i.id) ?? [],
        });
        setPreview(data.user.avatar || null);
      }
    };
    fetchUser();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', form.name || 'user');

    const res = await fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setForm({ ...form, avatar: data.filename });
      setPreview(`/user/profile/${data.filename}`);
    } else {
      console.error('Upload error:', data.error);
      alert(data.error || 'อัปโหลดไม่สำเร็จ');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userRes = await fetch('/api/profile');
      const interestRes = await fetch('/api/interests');
      const branchRes = await fetch('/api/shop/branch');

      const userData = await userRes.json();
      const interestsData = await interestRes.json();
      const branchesData = await branchRes.json();

      if (userData.user) {
        setForm({
          ...form,
          ...userData.user,
          dateOfBirth: userData.user.dateOfBirth
            ? new Date(userData.user.dateOfBirth).toISOString().split('T')[0]
            : '',
          interests: userData.user.interests?.map((i: any) => i.id) || [],
        });
      }
      setInterests(interestsData);
      setBranches(branchesData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setIsModalOpen(true); // Show modal on success
    } else {
      const data = await res.json();
      console.error('Update error:', data.error);
      alert(data.error || 'บันทึกไม่สำเร็จ');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    router.push('/profile'); // Redirect to /profile
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="h-full max-w-2xl mx-auto p-0 mt-0 mb-4 md:mt-0 md:mb-20 mb-4 bg-white">
      <div className="flex flex-row justify-start relative pt-4 pb-4 pl-2 rounded-t-xl">
        <h1 className="text-xl font-bold text-paseo">แก้ไขข้อมูลส่วนตัว</h1>
      </div>

      <div className="w-full rounded-xl flex flex-row justify-center relative my-0">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-8">

          <div className="profile-image md:py-6 md:px-6 p-4 rounded-3xl shadow-sm bg-gray-50 border border-gray-200">
            <div className="mb-4 relative overflow-hidden">
              <p className="font-semibold mb-2">รูปโปรไฟล์</p>
              <div className="flex items-center gap-4">
                {form.avatar ? (
                  <Image
                    width={600}
                    height={600}
                    src={
                      form.avatar.startsWith('http')
                        ? form.avatar
                        : `/user/profile/${form.avatar}`
                    }
                    alt="avatar"
                    className="w-16 h-16 rounded-full object-cover border"
                    onError={() => setPreview(null)}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    ไม่มีรูป
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="border p-2 rounded-lg w-full"
                />
              </div>
            </div>
            <FormField label="ชื่อที่แสดง" required>
              <Input
                type="text"
                placeholder="ชื่อที่แสดง *"
                name="name"
                className="w-full pt-10 pb-4 pl-2 pr-4 border rounded-xl bg-gray-100 focus:outline-none focus:ring focus:ring-paseo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-2">
              <FormField label="วันเกิด" required>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-between rounded-xl bg-gray-100 font-normal pt-10 pb-4 ${
                        !date ? 'text-gray-400' : ''
                      }`}
                    >
                      {date
                        ? format(date, 'dd MMMM yyyy', { locale: th })
                        : 'เลือกวันเกิด'}
                      <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-white" align="start">
                    <Calendar
                      className="w-80"
                      mode="single"
                      captionLayout="dropdown"
                      selected={date}
                      onSelect={handleDateChange}
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </FormField>

              <FormField label="เพศ" required>
                <SimpleSelect
                  value={form.gender}
                  placeholder="เลือกเพศ"
                  onChange={(value) => setForm({ ...form, gender: value })}
                  options={[
                    { value: 'MALE', label: 'ชาย' },
                    { value: 'FEMALE', label: 'หญิง' },
                    { value: 'OTHER', label: 'อื่นๆ' },
                  ]}
                />
              </FormField>
            </div>

            <FormField label="เบอร์โทรศัพท์" required>
              <Input
                disabled
                type="text"
                placeholder="เบอร์โทรศัพท์ *"
                name="phone"
                className="w-full pt-10 pb-4 pl-2 pr-4 border rounded-xl text-gray-400 bg-gray-100 focus:outline-none focus:ring focus:ring-paseo"
                value={form.phone}
                required
              />
            </FormField>

            <FormField label="อีเมล" required>
              <Input
                disabled
                type="email"
                placeholder="อีเมล *"
                name="email"
                className="w-full pt-10 pb-4 pl-2 pr-4 border rounded-xl text-gray-400 bg-gray-100 focus:outline-none focus:ring focus:ring-paseo"
                value={form.email}
                required
              />
            </FormField>

            <FormField label="อาชีพ" required>
              <SimpleSelect
                value={form.occupation}
                placeholder="อาชีพ *"
                onChange={(value) => setForm({ ...form, occupation: value })}
                options={[
                  { value: 'STUDENT', label: 'นักศึกษา' },
                  { value: 'PRIVATE_EMPLOYEE', label: 'พนักงานเอกชน' },
                  { value: 'STATE_ENTERPRISE', label: 'พนักงานรัฐวิสาหกิจ' },
                  { value: 'FREELANCER', label: 'อาชีพอิสระ' },
                  { value: 'BUSINESS_OWNER', label: 'เจ้าของกิจการ' },
                  { value: 'HOMEMAKER', label: 'พ่อบ้าน - แม่บ้าน' },
                  { value: 'OTHER', label: 'อื่นๆ' },
                ]}
              />
            </FormField>

          </div>
          
          
          <div className="profile-address md:py-6 md:px-6 p-4 rounded-3xl shadow-sm bg-gray-50 border border-gray-200">
            <FormField label="ที่อยู่" required>
              <SimpleSelect
                value={form.residenceType}
                placeholder="ที่อยู่ *"
                onChange={(value) => setForm({ ...form, residenceType: value })}
                options={[
                  { value: 'TOWNHOUSE', label: 'ทาวน์เฮาส์' },
                  { value: 'CONDO', label: 'คอนโด' },
                  { value: 'SINGLE_HOUSE', label: 'บ้านเดี่ยว' },
                ]}
              />
            </FormField>

            <FormField label="ที่อยู่" required>
              <Input
                type="text"
                placeholder="ที่อยู่ *"
                name="address"
                className="w-full pt-10 pb-4 pl-2 pr-4 border rounded-xl bg-gray-100 focus:outline-none focus:ring focus:ring-paseo"
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                value={form.address}
              />
            </FormField>

            {/* <FormField label="บ้านเลขที่" required>
              <Input
                type="text"
                placeholder="บ้านเลขที่ *"
                name="houseNumber"
                className="w-full pt-10 pb-4 pl-2 pr-4 border rounded-xl bg-gray-100 focus:outline-none focus:ring focus:ring-paseo"
                onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
                value={form.houseNumber}
              />
            </FormField>

            <FormField label="ซอย" required>
              <Input
                type="text"
                placeholder="ซอย *"
                name="alley"
                className="w-full pt-10 pb-4 pl-2 pr-4 border rounded-xl bg-gray-100 focus:outline-none focus:ring focus:ring-paseo"
                onChange={(e) => setForm({ ...form, alley: e.target.value })}
                value={form.alley}
              />
            </FormField> */}

            <ThaiAddressSelect
                value={{
                  province: form.province,
                  district: form.district,
                  subDistrict: form.subDistrict,
                  postalCode: form.postalCode,
                }}
                onChange={(addr) =>
                  setForm(f => ({
                    ...f,
                    ...addr,
                  }))
                }
              />
          </div>

          <div className="profile-other md:py-6 md:px-6 p-4 rounded-3xl shadow-sm bg-gray-50 border border-gray-200">
            <FormField label="สาขาที่ทำการสมัคร" required>
              <SimpleSelect
                value={form.branchId}
                placeholder="เลือกสาขาที่ทำการสมัคร *"
                onChange={(value) => setForm({ ...form, branchId: value })}
                options={branches.map((b) => ({
                  value: b.id,
                  label: b.name,
                }))}
              />
            </FormField>

            <div>
              <p className="font-semibold mb-2">ความสนใจ</p>
              <div className="flex flex-wrap gap-2">
                {interests.map((i) => {
                  const selected = form.interests.includes(i.id);
                  return (
                    <Badge
                      key={i.id}
                      onClick={() => toggleInterest(i.id)}
                      className={cn(
                        "cursor-pointer rounded-full px-3 py-1 text-sm transition",
                        selected
                          ? "bg-paseo text-white hover:bg-paseo-hover"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {i.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
          

          <Button type="submit" className="w-full text-white p-3 rounded-xl" style={{ backgroundColor: '#9DC93C' }}>
            บันทึก
          </Button>
        </form>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-lg font-bold mb-2">อัปเดตข้อมูลสำเร็จ</h2>
            <p className="text-gray-600 mb-4">ข้อมูลส่วนตัวของคุณได้รับการอัปเดตเรียบร้อยแล้ว</p>
            <div className="flex justify-end">
              <Button
                onClick={handleModalClose}
                className="text-white p-2 rounded-xl"
                style={{ backgroundColor: '#9DC93C' }}
              >
                ตกลง
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}