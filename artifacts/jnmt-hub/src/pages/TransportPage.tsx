import { useState } from "react";
import { useApp } from "@/context/AppContext";

interface Route {
  id: string;
  name: string;
  destination: string;
  schedule: string;
  price: string;
  duration: string;
  note: string;
  mapsUrl: string;
}

const ROUTES: Route[] = [
  {
    id: "1",
    name: "Bus 820",
    destination: "Gangjin → Gwangju",
    schedule: "05:40, 06:30, 07:20, 08:10, 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 18:00, 19:00, 20:00",
    price: "8,400 KRW",
    duration: "~2 giờ",
    note: "Bến xe Gangjin → Gwangju U-Square",
    mapsUrl: "https://maps.google.com/?q=Gangjin+Express+Bus+Terminal",
  },
  {
    id: "2",
    name: "Bus 810",
    destination: "Gangjin → Mokpo",
    schedule: "06:00, 07:30, 09:00, 10:30, 12:00, 13:30, 15:00, 16:30, 18:00, 19:30",
    price: "5,500 KRW",
    duration: "~1.5 giờ",
    note: "Bến xe Gangjin → Mokpo Bus Terminal",
    mapsUrl: "https://maps.google.com/?q=Mokpo+Bus+Terminal",
  },
  {
    id: "3",
    name: "Bus 830",
    destination: "Gangjin → Suncheon",
    schedule: "07:00, 09:00, 11:00, 13:00, 15:00, 17:00, 19:00",
    price: "7,200 KRW",
    duration: "~1.5 giờ",
    note: "Bến xe Gangjin → Suncheon Bus Terminal",
    mapsUrl: "https://maps.google.com/?q=Suncheon+Bus+Terminal",
  },
  {
    id: "4",
    name: "Xe nội thị 1",
    destination: "JNMT → Trung tâm Gangjin",
    schedule: "07:00, 08:00, 09:00, 10:30, 12:00, 13:30, 15:00, 17:00, 18:30",
    price: "1,500 KRW",
    duration: "~20 phút",
    note: "Xe buýt nội thị qua trung tâm thành phố",
    mapsUrl: "https://maps.google.com/?q=Gangjin+County+Office",
  },
  {
    id: "5",
    name: "Taxi",
    destination: "Trung tâm Gangjin",
    schedule: "24/7",
    price: "4,000~7,000 KRW",
    duration: "~10 phút",
    note: "Gọi: Kakao T App hoặc 1330",
    mapsUrl: "https://maps.google.com/?q=Gangjin",
  },
];

export default function TransportPage() {
  const { isDark } = useApp();
  const [expanded, setExpanded] = useState<string | null>("1");

  const bg = isDark ? "#1a1a2e" : "#f0f4ff";
  const card = isDark ? "#16213e" : "#fff";
  const text = isDark ? "#e0e0e0" : "#333";
  const sub = isDark ? "#888" : "#666";
  const border = isDark ? "#2d2d4e" : "#e0e0e0";
  const accent = "#4361ee";

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "20px 16px 80px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ color: text, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>🚌 Thông tin giao thông</h2>
        <p style={{ color: sub, fontSize: 13, marginBottom: 20 }}>Gangjin-gun, Jeollanam-do</p>

        {ROUTES.map(route => (
          <div key={route.id} style={{ background: card, borderRadius: 14, marginBottom: 10, overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
            <button
              onClick={() => setExpanded(expanded === route.id ? null : route.id)}
              style={{ width: "100%", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
            >
              <div style={{ textAlign: "left" }}>
                <p style={{ color: accent, fontWeight: 700, fontSize: 15, margin: 0 }}>{route.name}</p>
                <p style={{ color: sub, fontSize: 13, margin: "2px 0 0" }}>{route.destination}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: text, fontWeight: 700, fontSize: 14, margin: 0 }}>{route.price}</p>
                <p style={{ color: sub, fontSize: 12, margin: 0 }}>{route.duration}</p>
              </div>
            </button>

            {expanded === route.id && (
              <div style={{ borderTop: `1px solid ${border}`, padding: "14px 16px" }}>
                <p style={{ color: text, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Giờ chạy xe:</p>
                <p style={{ color: sub, fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{route.schedule}</p>
                <p style={{ color: text, fontSize: 13, marginBottom: 12 }}>
                  <span style={{ fontWeight: 600 }}>Lưu ý: </span>{route.note}
                </p>
                <a href={route.mapsUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: accent, color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                  🗺️ Xem bản đồ
                </a>
              </div>
            )}
          </div>
        ))}

        <div style={{ background: card, borderRadius: 14, padding: 16, marginTop: 4, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
          <p style={{ color: text, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Thông tin hữu ích</p>
          <p style={{ color: sub, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            • Tra giờ xe: <strong style={{ color: text }}>naver.com/map</strong> hoặc <strong style={{ color: text }}>kakaomap.com</strong><br/>
            • Mua vé: Tại bến xe hoặc trên xe<br/>
            • Taxi: Ứng dụng Kakao T<br/>
            • Hotline hỗ trợ khách nước ngoài: <strong style={{ color: accent }}>1330</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
