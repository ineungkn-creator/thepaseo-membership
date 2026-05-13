"use client"

import { useEffect, useRef, useState } from "react"

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  pointBalance: number;
}

interface ShopBranchOption {
  shopId: string
  shopName: string
  branchId: string
  branchName: string
  id: string
}

type Receipt = {
  id: string
  amount: number
  receiptNumber?: string | null
  receiptDate?: string | null
  receiptTime?: string | null
  createdAt: string
  status: string
  shop?: { name: string }
  branch?: { name: string }
}

export default function AdminAddReceiptPage(){

  const receiptRef = useRef<HTMLInputElement>(null)
  const amountRef = useRef<HTMLInputElement>(null)

  const [shopBranches,setShopBranches] = useState<ShopBranchOption[]>([])
  const [shopQuery,setShopQuery] = useState("")
  const [selectedShopId,setSelectedShopId] = useState("")

  const [search,setSearch] = useState("")
  const [selectedUser,setSelectedUser] = useState<User|null>(null)

  const [userHistory,setUserHistory] = useState<Record<string,Receipt[]>>({})
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  const receiptTimeout = useRef<NodeJS.Timeout | null>(null)

  const [receiptStatus,setReceiptStatus] = useState<
    "idle"|"checking"|"valid"|"duplicate"
  >("idle")

  const today = new Date().toISOString().split("T")[0]

  const [form,setForm] = useState({
    receiptNumber:"",
    receiptDate: today,
    receiptTime:"",
    amount:""
  })

  useEffect(()=>{
    receiptRef.current?.focus()
  },[])

  useEffect(()=>{
    fetch("/api/admin/receipts/shop")
      .then(res=>res.json())
      .then(setShopBranches)
  },[])

  const checkReceipt = async(shopIdParam?:string)=>{

  const shopIdValue = shopIdParam || selectedShopId
    if(!form.receiptNumber || !shopIdValue) return

    const [shopId] = shopIdValue.split("__")
    setReceiptStatus("checking")

    const res = await fetch("/api/admin/receipts/check",{
      method:"POST",
      headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      receiptNumber:form.receiptNumber,
      shopId
    })
  })

  const data = await res.json()

  if(data.duplicate){
    setReceiptStatus("duplicate")
  }else{
    setReceiptStatus("valid")
  }

  }

  const checkReceiptRealtime = async(receiptNumber:string)=>{

    if(!receiptNumber || !selectedShopId) return
    const [shopId] = selectedShopId.split("__")
    setReceiptStatus("checking")

    const res = await fetch("/api/admin/receipts/check",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        receiptNumber,
        shopId
      })
    })

    const data = await res.json()

    if(data.duplicate){
      setReceiptStatus("duplicate")
    }else{
      setReceiptStatus("valid")
    }

  }

  const fetchUserHistory = async(userId:string)=>{

    const res = await fetch(`/api/admin/receipts/history?userId=${userId}`)
    const data = await res.json()

    setUserHistory(prev=>({
      ...prev,
      [userId]:data
    }))

  }

  const searchUser = async()=>{

    if(!search) return

    let url=""

    if(search.includes("@")){
      url=`/api/admin/users/search?email=${search}`
    }else{
      url=`/api/admin/users/search?phone=${search}`
    }

    const res = await fetch(url)

    if(!res.ok){
      alert("ไม่พบผู้ใช้")
      setSelectedUser(null)
    return
  }

    const user = await res.json()

    setSelectedUser(user)

    fetchUserHistory(user.id)

    amountRef.current?.focus()

  }

  const saveReceipt = async()=>{

    if(receiptStatus==="duplicate"){
        alert("เลขใบเสร็จถูกใช้แล้ว")
      return
    }

    if(!selectedUser){
        alert("กรุณาเลือกลูกค้า")
      return
    }

    if(!form.amount){
        alert("กรุณากรอกจำนวนเงิน")
      return
    }

    if(!selectedShopId){
        alert("กรุณาเลือกร้าน")
      return
    }

    const amountValue = Number(form.amount)

    if(isNaN(amountValue) || amountValue <= 0){
        alert("จำนวนเงินไม่ถูกต้อง")
      return
    }

    const [shopId,branchId] = selectedShopId.split("__")

    try{

    // ========================
    // โหลด setting
    // ========================

    const settingRes = await fetch("/api/admin/points/general_setting")

    if(!settingRes.ok){
      throw new Error("โหลดการตั้งค่าพอยท์ไม่สำเร็จ")
    }

    const setting = await settingRes.json()

    // ========================
    // คำนวณพอยท์
    // ========================

    const calcRes = await fetch("/api/admin/points/calculate",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        amount:amountValue,
        shopId
      })
    })

    if(!calcRes.ok){
      throw new Error("คำนวณพอยท์ไม่สำเร็จ")
    }

    const {points} = await calcRes.json()

    // ========================
    // confirm dialog
    // ========================

    const confirmMsg = `
      ⚡ ยืนยันเพิ่มใบเสร็จ ⚡

      ชื่อ: ${selectedUser.name}
      เบอร์: ${selectedUser.phone}

      จำนวนเงิน: ${amountValue.toLocaleString("th-TH")} บาท
      จะได้รับพอยท์: ${points.toLocaleString("th-TH")} พอยท์

      ต้องการบันทึกหรือไม่?
    `

    const confirmed = window.confirm(confirmMsg)

    if(!confirmed) return

    // ========================
    // save receipt
    // ========================

    const fd = new FormData()

    fd.append("userId",selectedUser.id)
    fd.append("amount",form.amount)
    fd.append("receiptNumber",form.receiptNumber)
    fd.append("receiptDate",form.receiptDate)
    fd.append("receiptTime",form.receiptTime)
    fd.append("shopId",shopId)
    fd.append("branchId",branchId)

    const res = await fetch("/api/admin/receipts",{
      method:"POST",
      body:fd
    })

    if(res.ok){

      alert(`เพิ่มใบเสร็จสำเร็จ\nลูกค้าได้รับ ${points} พอยท์`)

      setForm({
        receiptNumber:"",
        receiptDate:"",
        receiptTime:"",
        amount:""
      })

      setSelectedUser(null)
      setSearch("")
      setReceiptStatus("idle")

      receiptRef.current?.focus()

      }else{

        const err = await res.json()
        alert(err.error)

      }

    }catch(err){

    console.error("saveReceipt error:",err)
      alert("เกิดข้อผิดพลาด")

    }

  }

  const filteredShops = shopBranches.filter(s=>
    `${s.shopName} ${s.branchName}`
      .toLowerCase()
      .includes(shopQuery.toLowerCase())
  )

  const autoSearchUser = async (value: string) => {

    if (!value || value.length < 6) {
      setSelectedUser(null)
      return
    }

    let url = ""

    if (value.includes("@")) {
      url = `/api/admin/users/search?email=${encodeURIComponent(value)}`
    } else {
      url = `/api/admin/users/search?phone=${encodeURIComponent(value)}`
    }

    try {

      const res = await fetch(url)

      if (!res.ok) {
        setSelectedUser(null)
        return
      }

      const user = await res.json()

      setSelectedUser(user)

      // โหลด history
      fetchUserHistory(user.id)

      // focus amount
      amountRef.current?.focus()

    } catch (err) {
      console.error("autoSearchUser error:", err)
    }
  }

  return(

    <div className="flex flex-col gap-6">

      <h1 className="text-xl font-bold">
        พิ่มใบเสร็จ (Counter)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ================= LEFT : FORM ================= */}

        <div className="bg-white p-6 rounded-xl shadow flex flex-col gap-4">

          {/* RECEIPT */}
          <div>
            <label className="font-semibold text-sm">เลขใบเสร็จ</label>
            <input
              ref={receiptRef}
              className="input"
              value={form.receiptNumber}
              onChange={(e)=>{
                const value = e.target.value
                setForm({...form,receiptNumber:value})

                if(receiptTimeout.current){
                clearTimeout(receiptTimeout.current)
              }

              receiptTimeout.current = setTimeout(()=>{
                checkReceiptRealtime(value)
                },400)
              }}
            />

            {receiptStatus==="checking" &&
              <p className="text-gray-500 font-semibold text-sm">กำลังตรวจสอบ...</p>
            }

            {receiptStatus==="valid" &&
              <p className="text-paseo font-semibold text-sm">✓ ยังไม่ถูกใช้</p>
            }

            {receiptStatus==="duplicate" &&
              <p className="text-red-600 font-semibold text-sm">✗ ใบเสร็จนี้ถูกใช้แล้ว</p>
            }

          </div>

          {/* SHOP */}

          <div>

          <label className="text-sm font-semibold">ร้าน / สาขา</label>
          <input
            className="input"
            placeholder="ค้นหาร้าน"
            value={shopQuery}
            onChange={(e)=>setShopQuery(e.target.value)}
          />

          <div className="border rounded max-h-40 overflow-y-auto">

            {filteredShops.map(s=>(
              <div
                key={s.id}
                className={`p-2 cursor-pointer hover:bg-paseo-hover flex flex-row justify-between
                ${selectedShopId===s.id?"bg-paseo":""}`}
                onClick={()=>{
                  setSelectedShopId(s.id)
                  checkReceipt(s.id)
                }}
              >
                <span className="text-sm">{s.shopName}</span>
                <span className="text-sm">{s.branchName}</span>
              </div>
            ))}
          </div>

        </div>

        {/* CUSTOMER SEARCH */}

        <div>

          <label className="font-semibold text-sm">
          เบอร์ / Email ลูกค้า
          </label>

          <input
            className="input"
            value={search}
            onChange={(e)=>{
              const value = e.target.value
              setSearch(value)

              if(searchTimeout.current){
                clearTimeout(searchTimeout.current)
              }

              searchTimeout.current = setTimeout(()=>{
                autoSearchUser(value)
              },500)

            }}
            placeholder="0812345678 หรือ email"
          />

        </div>

        <div className="w-full flex gap-2">
          <div className="w-full mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              วันที่ในใบเสร็จ
            </label>
            <input
              type="date"
              value={form.receiptDate}
              onChange={(e) =>
                setForm({ ...form, receiptDate: e.target.value })
              }
              className="input"
            />
          </div>

          {/* เวลาในใบเสร็จ */}
          <div className="w-full mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              เวลาในใบเสร็จ
            </label>
            <input
              type="time"
              value={form.receiptTime}
              onChange={(e) =>
                setForm({ ...form, receiptTime: e.target.value })
              }
              className="input"
            />
          </div>
        </div>

        {/* AMOUNT */}

        <div>
          <label className="font-semibold text-sm">
          จำนวนเงิน
          </label>
          <input
            ref={amountRef}
            type="number"
            className="input"
            value={form.amount}
            onChange={(e)=>setForm({...form,amount:e.target.value})}
          />

        </div>

        <button
          onClick={saveReceipt}
          className="text-white px-4 py-2 rounded-full disabled:opacity-50 bg-paseo hover:bg-paseo-dark"
        >
          บันทึกใบเสร็จ
        </button>

      </div>

        {/* ================= RIGHT : USER PANEL ================= */}

        <div className="bg-white p-6 rounded-xl shadow flex flex-col gap-4">
          <h2 className="font-bold text-sm">
            ข้อมูลลูกค้า
          </h2>

          {!selectedUser &&
            <p className="text-gray-400 text-sm">
            ค้นหาลูกค้าเพื่อดูข้อมูล
            </p>
          }

          {selectedUser &&
          <div className="flex flex-col gap-1 border rounded-lg p-2 bg-gray-50">
              <div className="flex items-center">
                <strong className="w-32 text-sm font-semibold">ชื่อ:</strong>
                <p className="w-64 text-sm font-normal">{selectedUser.name}</p>
              </div>
              <div className="flex items-center">
                <strong className="w-32 text-sm font-semibold">เบอร์:</strong>
                <p className="w-64 text-sm font-normal">{selectedUser.phone}</p>
              </div>
              <div className="flex items-center">
                <strong className="w-32 text-sm font-semibold">Email:</strong>
                <p className="w-64 text-sm font-normal">{selectedUser.email}</p>
              </div>
              <div className="flex items-center">
                <strong className="w-32 text-sm font-semibold">วันเกิด:</strong>
                <p className="w-64 text-sm font-normal">
                  {new Date(selectedUser.dateOfBirth).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center">
                <strong className="w-32 text-sm font-semibold">เพศ:</strong>
                <p className="w-64 text-sm font-normal">{selectedUser.gender}</p>
              </div>
              <div className="flex items-center">
                <strong className="w-32 text-sm font-semibold">Point:</strong>
                <p className="w-64 text-sm font-normal">{selectedUser.pointBalance.toLocaleString("th-TH")}</p>
              </div>
          </div>
          }

          {/* HISTORY */}

          {selectedUser && userHistory[selectedUser.id] && (

          <div>

            <h2 className="font-bold mt-2">
              ประวัติการส่งใบเสร็จ
            </h2>

            <div className="max-h-80 overflow-y-auto">
              <table className="w-full border text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-1 py-1">วันที่อัปโหลด</th>
                    <th className="border px-1 py-1">เลขใบเสร็จ</th>
                    <th className="border px-1 py-1">วันที่ใบเสร็จ</th>
                    <th className="border px-1 py-1">เวลา</th>
                    <th className="border px-1 py-1">ร้านค้า</th>
                    <th className="border px-1 py-1">สาขา</th>
                    <th className="border px-1 py-1">จำนวนเงิน</th>
                    <th className="border px-1 py-1">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {userHistory[selectedUser.id].map((h) => (
                    <tr key={h.id}>
                    <td className="border px-1 py-1">
                      {new Date(h.createdAt).toLocaleDateString("th-TH")}
                    </td>

                    <td className="border px-1 py-1">
                      {(h as any).receiptNumber || "-"}
                    </td>

                    <td className="border px-1 py-1">
                      {(h as any).receiptDate
                        ? new Date((h as any).receiptDate).toLocaleDateString("th-TH")
                        : "-"}
                    </td>

                    <td className="border px-1 py-1">
                      {(h as any).receiptTime || "-"}
                    </td>

                    <td className="border px-1 py-1">
                      {(h as any).shop?.name || "-"}
                    </td>

                    <td className="border px-1 py-1">
                      {(h as any).branch?.name || "-"}
                    </td>

                    <td className="border px-1 py-1 text-right">
                      {h.amount.toLocaleString("th-TH")}
                    </td>

                    <td className="border px-1 py-1">{h.status}</td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          )}

        </div>

      </div>

    </div>

  )

}