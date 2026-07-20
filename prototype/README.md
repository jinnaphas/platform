# RST Architecture Studio — Prototype

เครื่องมือออนไลน์สำหรับให้ 6 ทีม RST ออกแบบ Business Architecture
ในรูปแบบเดียวกันตามกรอบ **Platform Capitalism** โดยตรงกลางของผังเป็น
**โครงหน้าจอมือถือ** แทนกล่อง Platform เดิม

## ทีมที่รองรับ

1. Tendering RST
2. Omni Channel RST
3. TCS RST (มีข้อมูลตัวอย่างจากผังต้นฉบับ)
4. Recurring RST
5. PPA / Long-term Contract RST
6. Investment RST

## แนวคิดหลัก

- **Template ล็อกโครงเหมือนกันทุกทีม** — โซน Actor ทั้ง 6 (Partners/Supplier,
  Complementor, Competitor, Buyer, Precise Business, Platform Admin) และชั้น
  Platform 3 ชั้น (Technology / Commercial & Management / Foundation) ถูกกำหนดตายตัว
  ทีมกรอกเนื้อหาอย่างเดียว จึงได้ format เดียวกันโดยอัตโนมัติ
- **Data-driven ไม่ใช่ freeform whiteboard** — ทุกอย่างเก็บเป็น JSON ที่มีโครงสร้าง
  ทำให้เปรียบเทียบข้ามทีม / export / นำไปทำ overview รวม 6 ทีมได้
- **Flow mapping ด้วย `[ชื่อ Platform]`** — รายการของ Actor ที่อ้างถึง Platform
  ด้วยวงเล็บเหลี่ยม จะไฮไลต์ชิ้นส่วนนั้นบนจอมือถือเมื่อชี้เมาส์ (แทนลูกศรในผังเดิม)

## วิธีลองใช้

เปิด `prototype/index.html` ในเบราว์เซอร์ได้เลย (ไฟล์เดียวจบ ไม่ต้องติดตั้งอะไร)
ข้อมูลของแต่ละทีมเก็บแยกกันใน `localStorage` ของเครื่องผู้ใช้

## ขั้นถัดไป (Production)

| เรื่อง | Prototype | Production ที่แนะนำ |
|---|---|---|
| การเก็บข้อมูล | localStorage ในเครื่อง | ฐานข้อมูลกลาง (เช่น Postgres/Firestore) |
| ทำงานพร้อมกันหลายคน | จำลอง presence | Real-time sync ด้วย Yjs + WebSocket หรือ Liveblocks/Firebase |
| สิทธิ์การเข้าถึง | ไม่มี | Login ราย user, สิทธิ์แก้ไขรายทีม, ดูข้ามทีมแบบ read-only |
| ประวัติการแก้ | ไม่มี | Version history / snapshot ราย workshop |
| ภาพรวม | ดูทีละทีม | หน้า Overview เทียบ 6 ทีม + export PNG/PDF |
