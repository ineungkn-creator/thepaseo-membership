"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],  // ✅ ปุ่มลิสต์
    ["link", "image"],
    ["clean"],
  ],
};

export default function TextEditor({ value, onChange }: any) {
  return (
    <ReactQuill
      value={value}
      onChange={onChange}
      modules={modules}
      theme="snow"
    />
  );
}
