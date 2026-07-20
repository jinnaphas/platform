# คู่มือเปิดระบบ Online Save สำหรับ RST Architecture Studio

ระบบนี้ให้ทั้ง 6 ทีมกด **💾 Save** ขึ้นระบบกลางพร้อมกันได้ โดยผู้ใช้**ไม่ต้องมีบัญชี GitHub** —
ใช้แค่ "รหัสทีม" ส่วน Token ของ GitHub เก็บไว้ฝั่ง server (Cloudflare Worker) เท่านั้น

```
ผู้ใช้ 6 ทีม ──รหัสทีม──▶ Cloudflare Worker (ถือ Token) ──▶ commit ลง data/<team>.json ใน repo นี้
```

ทุกการ Save = 1 commit → ดูประวัติ/ย้อนเวอร์ชันได้ที่แท็บ History ของไฟล์ใน GitHub

---

## สิ่งที่ต้องทำ (ครั้งเดียว ~20 นาที)

### ขั้นที่ 1 — สร้าง GitHub Token แบบจำกัดสิทธิ์ (~5 นาที)

1. เข้า GitHub → คลิกรูปโปรไฟล์มุมขวาบน → **Settings**
2. เมนูซ้ายล่างสุด **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**
3. ตั้งค่าดังนี้
   - **Token name**: `rst-arch-sync`
   - **Expiration**: 90 days (หมดอายุแล้วสร้างใหม่ + อัปเดตใน Worker)
   - **Repository access**: เลือก **Only select repositories** → เลือก `jinnaphas/platform` เท่านั้น
   - **Permissions** → Repository permissions → **Contents: Read and write** (อย่างอื่นไม่ต้อง)
4. กด **Generate token** แล้ว**คัดลอกเก็บไว้** (เห็นครั้งเดียว) — ใช้ในขั้นที่ 2

> Token นี้ทำอะไรได้แค่ "อ่าน/เขียนไฟล์ใน repo platform" เท่านั้น ต่อให้หลุดก็ไม่กระทบบัญชีส่วนอื่น
> และมันไม่เคยไปถึง browser ของผู้ใช้ — อยู่ใน Worker อย่างเดียว

### ขั้นที่ 2 — สร้าง Cloudflare Worker (~10 นาที ไม่ต้องใช้ CLI)

1. สมัคร/เข้า https://dash.cloudflare.com (แผนฟรีพอ)
2. เมนูซ้าย **Workers & Pages** → **Create** → **Create Worker** → ตั้งชื่อ เช่น `rst-arch-sync` → **Deploy**
3. กด **Edit code** → ลบโค้ดตัวอย่างทิ้ง → คัดลอกเนื้อหาไฟล์ [`worker/worker.js`](worker/worker.js) ทั้งไฟล์ไปวาง → **Deploy**
4. กลับหน้า Worker → **Settings** → **Variables and Secrets** → เพิ่มตัวแปรทีละตัว:

   | ชื่อ | ชนิด | ค่า |
   |---|---|---|
   | `GITHUB_TOKEN` | **Secret** | Token จากขั้นที่ 1 |
   | `PASSCODES_JSON` | **Secret** | รหัสทีมที่คุณตั้งเอง เช่นตัวอย่างด้านล่าง |
   | `GITHUB_REPO` | Text | `jinnaphas/platform` |
   | `GITHUB_BRANCH` | Text | `main` |
   | `DATA_DIR` | Text | `data` |

   ตัวอย่าง `PASSCODES_JSON` (ตั้งรหัสของคุณเอง อย่าใช้ตามตัวอย่างตรงๆ):

   ```json
   {"tendering":"TND-xxxx","omni":"OMN-xxxx","tcs":"TCS-xxxx","recurring":"RCR-xxxx","ppa":"PPA-xxxx","invest":"INV-xxxx"}
   ```

5. จด **URL ของ Worker** ไว้ เช่น `https://rst-arch-sync.<บัญชีคุณ>.workers.dev`
6. **ทดสอบ**: เปิด `https://<worker-url>/load?team=tcs` ในเบราว์เซอร์ — ต้องเห็น JSON ของ TCS ถ้าเห็น `error` ให้เช็คตัวแปรอีกรอบ

### ขั้นที่ 3 — เปิด GitHub Pages (~2 นาที)

1. repo `jinnaphas/platform` → **Settings** → **Pages**
2. Source: **Deploy from a branch** → Branch: `main` / โฟลเดอร์ `/ (root)` → **Save**
3. รอ 1–2 นาที จะได้ URL: `https://jinnaphas.github.io/platform/prototype/`

> หมายเหตุ: GitHub Pages ฟรีต้องเป็น repo สาธารณะ — ไฟล์ข้อมูลใน `data/` จะอ่านได้แบบสาธารณะด้วย
> ถ้าเนื้อหาถือเป็นความลับบริษัท ให้ตั้ง repo เป็น private แล้วโฮสต์หน้าเว็บบน Cloudflare Pages แทน (ฟรีเหมือนกัน แจ้งได้ เดี๋ยวจัดให้)

### ขั้นที่ 4 — เชื่อมหน้าเว็บกับ Worker แล้วแจกลิงก์

แจกลิงก์นี้ให้ทุกทีม (ฝัง Worker URL ไว้ในลิงก์เลย เปิดแล้วออนไลน์ทันที):

```
https://jinnaphas.github.io/platform/prototype/?api=https://rst-arch-sync.<บัญชีคุณ>.workers.dev
```

หรือเปิดหน้าเว็บเปล่าแล้วกดปุ่ม **🔗** วาง Worker URL เองก็ได้ (จำไว้ในเครื่องอัตโนมัติ)

สุดท้าย แจก**รหัสทีม**ให้แต่ละทีม (คนละรหัส) — ใส่ครั้งแรกตอนกด Save ครั้งเดียว เครื่องจะจำไว้

---

## การใช้งานหลังติดตั้ง

- **สถานะมุมขวาบน**: `● ออนไลน์` = เชื่อมต่อแล้ว · `ยังไม่บันทึก` = มีของแก้ค้าง อย่าลืมกด Save · `↻ อัปเดตใหม่จากทีม` = เพิ่งดึงของเพื่อนมา
- **เห็นของกันเมื่อไหร่**: ระบบเช็คของใหม่ทุก 20 วินาทีอัตโนมัติ (เฉพาะตอนไม่มีงานค้างและไม่ได้กำลังพิมพ์)
- **ถ้าบันทึกชนกัน** (สองคนแก้ทีมเดียวกันพร้อมกัน): คนที่ Save ทีหลังจะได้ไฟล์สำรองงานของตัวเองดาวน์โหลดอัตโนมัติ + ระบบโหลดเวอร์ชันล่าสุดขึ้นมาให้แก้ซ้ำ — ไม่มีงานหายเงียบๆ
- **ดูประวัติ/ย้อนเวอร์ชัน**: GitHub → โฟลเดอร์ `data/` → เลือกไฟล์ทีม → **History**
- **เปลี่ยนรหัสทีม/ถอนสิทธิ์**: แก้ `PASSCODES_JSON` ใน Worker (มีผลทันที) · ยกเลิกทั้งระบบ = revoke Token ใน GitHub
- **รูปภาพ**: ระบบย่อรูปเหลือ 128px อยู่แล้ว แต่อย่าใส่เกิน ~30 รูปต่อทีม (จำกัดขนาดไฟล์ ~900KB)
