// src/types/thai-address.ts

export type SubDistrict = {
  id: number
  name_th: string
  name_en: string
  zip_code: number
  district_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type District = {
  id: number
  name_th: string
  name_en: string
  province_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  sub_districts: SubDistrict[]
}

export type Province = {
  id: number
  name_th: string
  name_en: string
  geography_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  districts: District[]
}
