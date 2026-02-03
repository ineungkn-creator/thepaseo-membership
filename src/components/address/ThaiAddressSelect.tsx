'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import provincesData from '@/data/thai/provinces.json'
import type { Province, District, SubDistrict } from '@/types/thai-address'

type AddressValue = {
  province?: string
  district?: string
  subDistrict?: string
  postalCode?: string
}

type Props = {
  value: AddressValue
  onChange: (val: AddressValue) => void
  label?: string
}

const provinces = provincesData as Province[]

export default function ThaiAddressSelect({ value, onChange, label }: Props) {
  const [province, setProvince] = useState<Province | null>(null)
  const [district, setDistrict] = useState<District | null>(null)
  const [subDistrict, setSubDistrict] = useState<SubDistrict | null>(null)

  const [provinceQuery, setProvinceQuery] = useState('')
  const [districtQuery, setDistrictQuery] = useState('')
  const [subDistrictQuery, setSubDistrictQuery] = useState('')

  /* ---------- preload ค่าเดิม (หน้า edit) ---------- */
  useEffect(() => {
    if (!value.province) return

    const p = provinces.find(p => p.name_th === value.province)
    if (!p) return
    setProvince(p)

    const d = p.districts.find(d => d.name_th === value.district)
    if (!d) return
    setDistrict(d)

    const s = d.sub_districts.find(s => s.name_th === value.subDistrict)
    if (!s) return
    setSubDistrict(s)
  }, [])

  /* ---------- filtered lists ---------- */
  const filteredProvinces = useMemo(
    () =>
      provinces.filter(p =>
        p.name_th.includes(provinceQuery)
      ),
    [provinceQuery]
  )

  const filteredDistricts = useMemo(
    () =>
      province
        ? province.districts.filter(d =>
            d.name_th.includes(districtQuery)
          )
        : [],
    [province, districtQuery]
  )

  const filteredSubDistricts = useMemo(
    () =>
      district
        ? district.sub_districts.filter(s =>
            s.name_th.includes(subDistrictQuery)
          )
        : [],
    [district, subDistrictQuery]
  )

  return (
    <div className="w-full space-y-4">
      {/* จังหวัด */}
      <SearchSelect
        label="จังหวัด"
        query={provinceQuery}
        setQuery={setProvinceQuery}
        value={province?.name_th}
        items={filteredProvinces.map(p => p.name_th)}
        onSelect={(name) => {
          const p = provinces.find(p => p.name_th === name)!
          setProvince(p)
          setDistrict(null)
          setSubDistrict(null)

          setProvinceQuery(name)
          setDistrictQuery('')
          setSubDistrictQuery('')

          onChange({
            province: p.name_th,
            district: undefined,
            subDistrict: undefined,
            postalCode: undefined,
          })
        }}
      />

      {label && (
        <div className="text-sm font-medium text-gray-700">
          {label}
        </div>
      )}

      {/* เขต / อำเภอ */}
      <SearchSelect
        label="เขต / อำเภอ"
        disabled={!province}
        query={districtQuery}
        setQuery={setDistrictQuery}
        value={district?.name_th}
        items={filteredDistricts.map(d => d.name_th)}
        onSelect={(name) => {
          const d = province!.districts.find(d => d.name_th === name)!
          setDistrict(d)
          setSubDistrict(null)

          setDistrictQuery(name)
          setSubDistrictQuery('')

          onChange({
            ...value,
            district: d.name_th,
            subDistrict: undefined,
            postalCode: undefined,
          })
        }}
      />

      {/* แขวง / ตำบล */}
      <SearchSelect
        label="แขวง / ตำบล"
        disabled={!district}
        query={subDistrictQuery}
        setQuery={setSubDistrictQuery}
        value={subDistrict?.name_th}
        items={filteredSubDistricts.map(s => s.name_th)}
        onSelect={(name) => {
          const s = district!.sub_districts.find(s => s.name_th === name)!
          setSubDistrict(s)

          setSubDistrictQuery(name)

          onChange({
            ...value,
            subDistrict: s.name_th,
            postalCode: String(s.zip_code),
          })
        }}
      />

      {/* รหัสไปรษณีย์ */}
      <input
        type="text"
        value={value.postalCode || ''}
        disabled
        placeholder="รหัสไปรษณีย์"
        className="w-full rounded-xl bg-gray-100 border px-4 py-2 text-gray-600"
      />
    </div>
  )
}

/* ---------------- reusable search dropdown ---------------- */

type SearchSelectProps = {
  label: string
  items: string[]
  query: string
  setQuery: (v: string) => void
  value?: string
  disabled?: boolean
  onSelect: (value: string) => void
}

function SearchSelect({
  label,
  items,
  query,
  setQuery,
  value,
  disabled,
  onSelect,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  /* ✅ click outside → close */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        disabled={disabled}
        placeholder={label}
        value={query || value || ''}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        className="w-full rounded-xl bg-gray-100 border px-4 py-2 focus:outline-none focus:ring focus:ring-paseo"
      />

      {open && !disabled && items.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-xl border bg-white shadow">
          {items.map((item) => (
            <div
              key={item}
              onClick={() => {
                onSelect(item)
                setOpen(false)
              }}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}