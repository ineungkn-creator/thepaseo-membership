"use client";

interface Props {
  value?: string;
  onChange: (color: string) => void;
}

const presetColors = [
  "#9dc93c",
  "#f97316",
  "#ef4444",
  "#3b82f6",
  "#6366f1",
  "#14b8a6",
  "#f59e0b",
  "#ec4899",
];

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">

      <div className="flex items-center gap-3">

        {/* Picker */}
        <input
          type="color"
          value={value || "#9dc93c"}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 border rounded cursor-pointer"
        />

        {/* Hex input */}
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="border p-2 rounded w-32"
          placeholder="#9dc93c"
        />

        {/* Preview */}
        <div
          className="px-3 py-1 rounded text-white text-sm"
          style={{ backgroundColor: value || "#999" }}
        >
          ตัวอย่าง
        </div>
      </div>

      {/* Preset colors */}
      <div className="flex gap-2 flex-wrap">
        {presetColors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-6 h-6 rounded-full border transition ${
              value === color ? "ring-2 ring-black" : ""
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

    </div>
  );
}