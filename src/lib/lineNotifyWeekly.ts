const LINE_API = "https://api.line.me/v2/bot/message/push";
const CHANNEL_ACCESS_TOKEN = process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN!;

export async function sendLineWeeklyPointSummary(data: {
  userId: string;
  lineId: string;
  name: string;
  received: number;
  used: number;
  balance: number;
  updatedAt: Date;
}) {
  const dateText = data.updatedAt.toLocaleString("th-TH");

  const message = {
    type: "flex",
    altText: "อัปเดตพอยท์ประจำสัปดาห์",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "📊 อัปเดตพอยท์ประจำสัปดาห์",
            weight: "bold",
            size: "lg",
          },
          {
            type: "text",
            text: `พอยท์ที่ได้รับ: +${data.received.toLocaleString()} พอยท์`,
            margin: "md",
          },
          {
            type: "text",
            text: `พอยท์ที่ใช้ไป: -${data.used.toLocaleString()} พอยท์`,
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "text",
            text: `พอยท์คงเหลือ: ${data.balance.toLocaleString()} พอยท์`,
            weight: "bold",
            margin: "md",
            color: "#9DC93C",
          },
          {
            type: "text",
            text: `อัปเดต ณ วันที่ ${dateText}`,
            size: "xs",
            color: "#888888",
            margin: "md",
          },
        ],
      },
    },
  };

  await fetch(LINE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: data.lineId,
      messages: [message],
    }),
  });
}
