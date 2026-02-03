//components/UserCard
import { FaRegUserCircle } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import Image from "next/image";

interface UserCardProps {
    name: string | null;
    email: string | null;
    phone: string | null;
    dateOfBirth: Date | null;
    point: number;
    referralCode: string | null;
    role: string;
    avatar?: string | null;
}

export default function UserCard({ name, phone, dateOfBirth, point, avatar }: UserCardProps) {

  return (
    <div className="profile-card w-full text-white rounded-xl shadow-sm p-4 mb:p-6 flex flex-col justify-between gap-2">
        <div className="z-10 flex flex-row text-center items-center gap-2">
            <FaStar className="text-yellow-400" />
            <span className="text-lg font-semibold">
                {point} Point
            </span>
        </div>
        <div className="profile-card-1 w-full flex flex-row justify-between items-start">
            <div className="w-2/5 flex flex-col item-center gap-2">

                <div className="picture-section flex flex-row justify-center">
                    {avatar ? (
                        <Image
                            src={avatar}
                            alt={`${name}'s avatar`}
                            width={80}
                            height={80}
                            className="rounded-full object-cover shadow-sm"
                            />
                    ) : (
                        <FaRegUserCircle className="text-4xl" />
                    )}
                </div>
                
            </div>

            <div className="w-3/5 flex flex-col gap-2">
                <div className="w-full flex flex-col">
                    <p className="text-xl font-bold">{name}</p>
                </div>

                <div className="w-full flex flex-col">
                    <p className="text-xs font-bold underline underline-offset-1">เบอร​์โทรศัพท์​</p>
                    <p className="text-sm">{phone}</p>
                </div>

                <div className="w-full flex flex-col">
                    <p className="text-xs font-bold underline underline-offset-1">วันเกิด</p>
                    <p className="text-sm">{dateOfBirth ? new Date(dateOfBirth).toLocaleDateString("th-TH") : "-"}</p>
                    
                </div>
                
            </div>
            
        </div>
    </div>
  );
}