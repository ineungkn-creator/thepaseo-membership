"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import RichTextEditor from "@/components/RichTextEditor/page";

interface HelpTerms {
  description: string;

  email1?: string;
  email2?: string;
  email3?: string;

  phone1?: string;
  phone2?: string;
  phone3?: string;
}



export default function HelpTerms() {
const [term, setTerm] = useState<HelpTerms>({
  description: "",
  email1: "",
  email2: "",
  email3: "",
  phone1: "",
  phone2: "",
  phone3: "",
});


  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch HelpTerms on mount
useEffect(() => {
  const fetchTerm = async () => {
    try {
      const response = await axios.get("/api/admin/help/helpterms");
      setTerm(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch terms");
      setLoading(false);
    }
  };

  fetchTerm();
}, []);


  // Handle form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await axios.put("/api/admin/help/helpterms", {
      description: term.description,
      email1: term.email1,
      email2: term.email2,
      email3: term.email3,
      phone1: term.phone1,
      phone2: term.phone2,
      phone3: term.phone3,
    });

    setIsEditing(false);
    alert("Terms updated successfully");
  } catch (error) {
    setError("Failed to update terms");
  }
};


  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="p-6 flex flex-row gap-6">
      
      <div className="w-full flex flex-col mb-4">
        <h1 className="text-2xl font-bold mb-4">รายละเอียดอื่นๆ</h1>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-lg">
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Terms Description
              </label>
              <RichTextEditor
                value={term.description || ""}
                onChange={(value: string) => setTerm({ ...term, description: value })}
              />
            </div>

            <div className="flex flex-col gap-2">

              <div>
                <label className="block mb-1 font-medium">อีเมล 1</label>
                <div className="mt-2">
                  <input
                    type="email"
                    placeholder="Email 1"
                    value={term.email1 || ""}
                    onChange={(e) => setTerm({ ...term, email1: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">อีเมล 2</label>
                <div className="mt-2">
                  <input
                  type="email"
                  placeholder="Email 2"
                  value={term.email2 || ""}
                  onChange={(e) => setTerm({ ...term, email2: e.target.value })}
                  className="input"
              />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">อีเมล 3</label>
                <div className="mt-2">
                  <input
                    type="email"
                    placeholder="Email 3"
                    value={term.email3 || ""}
                    onChange={(e) => setTerm({ ...term, email3: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-1 font-medium">เบอร์โทรศัพท์ 1</label>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Phone 1"
                    value={term.phone1 || ""}
                    onChange={(e) => setTerm({ ...term, phone1: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-1 font-medium">เบอร์โทรศัพท์ 2</label>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Phone 2"
                    value={term.phone2 || ""}
                    onChange={(e) => setTerm({ ...term, phone2: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">เบอร์โทรศัพท์ 3</label>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Phone 3"
                    value={term.phone3 || ""}
                    onChange={(e) => setTerm({ ...term, phone3: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              
              
              
            </div>


            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-paseo text-white rounded-lg hover:bg-paseo-hover disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-paseo text-white rounded-lg hover:bg-paseo-hover disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 bg-white p-6 shadow rounded-lg">
            <div
              className="text-gray-700 mb-4 prose"
              dangerouslySetInnerHTML={{ __html: term.description || "No terms defined" }}
            />

            <div className="flex flex-col items-start gap-1 mb-2">
              <h2 className="text-sm font-semibold">อีเมล</h2>
              <p className="text-sm font-medium leading-tight text-center px-1 line-clamp-2">อีเมล 1 : {term.email1}</p>
              <p className="text-sm font-medium leading-tight text-center px-1 line-clamp-2">อีเมล 2 : {term.email2}</p>
              <p className="text-sm font-medium leading-tight text-center px-1 line-clamp-2">อีเมล 3 : {term.email3}</p>
            </div>
            
            <div className="flex flex-col items-start gap-1 mb-2">
              <h2 className="text-sm font-semibold">เบอร์โทรศัพท์</h2>
              <p className="text-sm font-medium leading-tight text-center px-1 line-clamp-2">เบอร์ 1 : {term.phone1}</p>
              <p className="text-sm font-medium leading-tight text-center px-1 line-clamp-2">เบอร์ 2 : {term.phone2}</p>
              <p className="text-sm font-medium leading-tight text-center px-1 line-clamp-2">เบอร์ 3 : {term.phone3}</p>
            </div>

            
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-paseo text-white rounded-lg hover:bg-paseo-hover disabled:opacity-50"
            >
              Edit Terms
            </button>
          </div>
        )}
      </div>
    </div>
  );
}