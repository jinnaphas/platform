# RST Architecture Studio — Project Knowledge Base

> เอกสารรวมความรู้ทั้งหมดของโปรเจกต์ อัปเดตล่าสุด: กรกฎาคม 2026
> สำหรับทีมงาน Precise ที่ดูแล/ใช้งาน/ต่อยอดระบบนี้

---

## 1. โปรเจกต์นี้คืออะไร

เครื่องมือออนไลน์สำหรับให้ **6 ทีม RST (Revenue Stream Team)** ออกแบบ Business Architecture
ของแต่ละ Revenue Stream ใน **format กลางเดียวกันตามกรอบ Platform Capitalism** โดยมี
**โครงหน้าจอมือถือ/Desktop อยู่ตรงกลางผัง** (สื่อว่า Platform ส่งมอบคุณค่าผ่านหน้าจอเดียวของผู้ใช้)
ล้อมรอบด้วยโซน Stakeholder ทั้ง 6 ด้าน ทุกทีมแก้ไขและกด Save ร่วมกันแบบออนไลน์ได้

**6 ทีม:** Tendering RST · Omni Channel RST · TCS RST · Recurring RST ·
PPA / Long-term Contract RST · Investment RST

**หลักคิดสำคัญ:** เป็น *template-locked + data-driven* ไม่ใช่ freeform whiteboard —
โครงผัง (โซน Stakeholder + ชั้น Platform) ถูกล็อกตายตัว ทีมกรอกเฉพาะเนื้อหา
จึงได้ format เดียวกันทั้ง 6 ทีมโดยอัตโนมัติ และข้อมูลเป็น JSON มีโครงสร้าง
เปรียบเทียบข้ามทีม / export / ทำ overview ได้

---

## 2. ลิงก์สำคัญ

| สิ่งที่ | ที่อยู่ |
|---|---|
| หน้าใช้งานจริง (GitHub Pages) | `https://jinnaphas.github.io/platform/prototype/` |
| ลิงก์แจกทีม (ฝัง Worker URL) | `https://jinnaphas.github.io/platform/prototype/?api=<worker-url>` |
| Worker (ระบบ Save กลาง) | ดู URL จริงได้ที่ Cloudflare dashboard → Workers & Pages (ชื่อ `rst-arch-sync`) |
| Repository | `https://github.com/jinnaphas/platform` |
| ข้อมูลของทีม | โฟลเดอร์ `data/<team>.json` — ดูประวัติการแก้ที่แท็บ History ของแต่ละไฟล์ |

---

## 3. สถาปัตยกรรมระบบ

```
ผู้ใช้ 6 ทีม (browser)
   │  เปิดหน้าเว็บจาก GitHub Pages (ไฟล์เดียว: prototype/index.html)
   │  แก้ไขบนหน้า → เก็บ localStorage เป็น cache เสมอ
   │
   │  กด 💾 Save (แนบ "รหัสทีม")
   ▼
Cloudflare Worker  (worker/worker.js — ถือ GitHub Token ไว้ฝั่ง server เท่านั้น)
   │  ตรวจรหัสทีม → commit ผ่าน GitHub Contents API
   ▼
GitHub repo (jinnaphas/platform)
   └─ data/<team>.json   ← 1 ทีม = 1 ไฟล์ = ไม่มีทางทับข้ามทีม
      ทุกการ Save = 1 commit (มีชื่อคนแก้ใน message) = version history ฟรี
```

### ไฟล์ในรีโป

| ไฟล์/โฟลเดอร์ | คืออะไร |
|---|---|
| `prototype/index.html` | แอปทั้งตัว — ไฟล์เดียวจบ (HTML+CSS+JS) ไม่มี build ไม่มี dependency |
| `worker/worker.js` | โค้ด Cloudflare Worker (ตัวกลาง Save) |
| `worker/wrangler.toml` | config สำหรับ deploy ผ่าน CLI (ถ้า deploy ผ่านหน้าเว็บไม่ต้องใช้) |
| `data/*.json` | ข้อมูลผังของ 6 ทีม (ไฟล์ละทีม) |
| `SETUP.md` | คู่มือติดตั้งระบบ Save ทีละคลิก (PAT, Worker, Pages, รหัสทีม) |
| `docs/KNOWLEDGE.md` | ไฟล์นี้ |

---

## 4. ฟีเจอร์ทั้งหมดบนหน้าเว็บ

### โครงผัง (ล็อกเหมือนกันทุกทีม)
- **ตรงกลาง**: โครงมือถือ (มี status bar จำลอง) หรือจอ Desktop — สลับได้ที่ปุ่ม Mobile/Desktop
- ในจอมี: ชื่อ Platform → **แถบ Value Chain** → ชั้น Platform (Technology / Commercial / Foundation
  หรือกำหนดเอง) → **แกลเลอรีรูปประกอบ**
- **รอบนอก**: การ์ด Stakeholder ซ้าย 3 ขวา 3 (Partners/Supplier, Complementor, Competitor,
  Buyer, Precise Business, Platform Admin) — เพิ่ม/ลบ/เปลี่ยนชื่อการ์ดได้ ใส่รูปโปรไฟล์ได้
  (คลิกวงกลม, ดับเบิลคลิกลบรูป)

### การแก้ไข
- คลิกข้อความใดๆ แล้วพิมพ์ได้ทันที (contenteditable ทั้งหน้า)
- เพิ่ม/ลบ: บทบาทใน Stakeholder, Capability, กลุ่ม Platform, ชั้น Platform, ขั้น Value Chain
- **สีประจำทีม**: Tendering เขียว teal · Omni ส้ม · TCS น้ำเงิน · Recurring เขียว ·
  PPA ทอง · Investment ม่วง — สลับแท็บแล้ว accent ทั้งหน้าเปลี่ยนตาม

### รหัสพิเศษบน Capability (พิมพ์เองได้ / ใช้เครื่องมือได้)
รูปแบบเต็ม: `3|p1:ชื่อ Capability 🆕 @@https://ลิงก์เอกสาร`

| token | ความหมาย | แสดงผล |
|---|---|---|
| `3\|` นำหน้า | อยู่ขั้นที่ 3 ของ Value Chain | วงกลมเลขมุมซ้ายบนของ chip |
| `p1:` / `p2:` / `p3:` | Priority (1 ขาดไม่ได้ / 2 ทำถัดไป / 3 ทีหลัง) | แถบขอบซ้าย แดง/เหลืองทอง/เทา + พื้นจาง |
| `🆕` ในชื่อ | โมดูลใหม่ | chip พื้นสีทอง |
| `@@url` ท้ายสุด | ลิงก์เอกสารแนบ | ไอคอน ↗ กดเปิดแท็บใหม่ |

- **เครื่องมือระบายสี Priority**: เลือกสีจาก dock ล่างจอ แล้วคลิกแต้มลง chip ทีละตัว
  (⌀ = ยางลบ, Esc = วางปากกา)
- **ปุ่ม 🔗** (โผล่ตอน hover ทั้งบน chip และบทบาทของ Stakeholder): แนบ/แก้/ลบลิงก์เอกสาร
- token ทุกตัวคงอยู่เมื่อแก้ชื่อ และติดไปกับ Save/Export/PNG อัตโนมัติ

### เส้น Information Flow
- บทบาทที่เขียนอ้างถึง `[ชื่อ Platform]` — ชี้เมาส์แล้วมีเส้นโค้ง+ลูกศรลากไปยัง
  Capability หรือชื่อกลุ่มบนจอ (จับคู่จากชื่อที่ตัด token ออกแล้ว)
- ปุ่ม **Flow** = โชว์ทุกเส้นพร้อมกัน แยกสีตาม Stakeholder — เห็นทันทีว่า capability ไหนถูกใช้หนัก

### การนำเสนอ
- **▶ นำเสนอ**: เต็มจอบนพื้นมืด ซ่อนปุ่มแก้ไขหมด เดินเรื่องด้วย ←/→/Space:
  Foundation → ชั้นถัดๆ ไป → Stakeholder ทีละการ์ด (เส้น flow วิ่งทีละรายการอัตโนมัติ)
  → จบด้วยภาพรวมทุกเส้น
- ซูมในโหมดนำเสนอ: ปุ่ม − / **พอดีจอ** / + (คีย์ `-` `0` `+`) — พอดีจอย่อทั้งผังลงจอเดียว
- **⌃ ซ่อน** (หรือกด `H`): ซ่อน header ให้เห็นผังเต็มพื้นที่ — dock เครื่องมือล่างจอยังอยู่
- เมนู **⋯**: บันทึกผังเป็น **PNG** (ความละเอียด 2x, ขยายส่วน scroll, รวมเส้น flow),
  **Export JSON**, ตั้งค่าการเชื่อมต่อ, รีเซ็ตทีม

---

## 5. โครงสร้างข้อมูล (design JSON ต่อทีม)

```json
{
  "phoneTitle": "Tendering Platform",
  "valueChain": ["ต้นน้ำ — ...", "วางแผน — ...", "..."],
  "stakeholders": [
    { "id": "sh1-abc", "title": "Buyer / ผู้ซื้อ", "hue": "buyer",
      "glyph": "B", "side": "right", "image": "data:image/jpeg;base64,... หรือ null",
      "items": ["บทบาท → [Platform ที่รองรับ] @@https://ลิงก์ (ถ้ามี)"] }
  ],
  "layers": [
    { "title": "Core Execution Platform — PBEP", "foundation": false,
      "groups": [ { "name": "Business Generation", "chips": ["3|p1:ชื่อ 🆕 @@url"] } ] }
  ],
  "images": ["data:image/jpeg;base64,...  (รูปประกอบ ย่อ 720px)"]
}
```

- ฝั่ง browser เก็บทุกทีมใน `localStorage` key `rst-arch-studio-v2` (เป็น cache/โหมดออฟไลน์)
- การตั้งค่าเชื่อมต่อ (Worker URL, ชื่อผู้ใช้, รหัสทีมที่จำไว้) อยู่ใน key `rst-sync-v1`
- โค้ดมี migration/normalize อัตโนมัติเมื่อเพิ่ม field ใหม่ (เช่น `valueChain`, `images`)

---

## 6. ระบบ Online Save (Worker + รหัสทีม)

### ทำไมออกแบบแบบนี้
- ผู้ใช้**ไม่ต้องมีบัญชี GitHub** — ใช้แค่ "รหัสทีม" (ตัดสินใจหลังเทียบ 4 ทาง:
  ฝัง token ในหน้าเว็บ = อันตรายและ GitHub revoke เองอัตโนมัติ / ทุกคนมีบัญชี GitHub = friction สูง /
  Firebase = ต้องพึ่ง cloud เพิ่ม / **Worker ถือ token แทน = สมดุลง่าย+ปลอดภัยที่สุด**)
- GitHub Token เป็น **fine-grained PAT** จำกัดเฉพาะ repo นี้ + สิทธิ์ Contents R/W เท่านั้น
  และอยู่ใน Worker secret — ไม่เคยไปถึง browser

### Endpoint ของ Worker
- `GET /load?team=tcs` → `{ design, sha }` (sha ใช้กันเขียนทับ)
- `POST /save` body `{ team, passcode, design, sha, editor }`
  → `200 {sha}` | `401` รหัสผิด | `409` มีคนบันทึกตัดหน้า (คืน design+sha ล่าสุด) | `413` ไฟล์เกิน 900KB

### พฤติกรรมฝั่งหน้าเว็บ
- เชื่อมต่อด้วย `?api=<worker-url>` ในลิงก์ หรือปุ่มตั้งค่าในเมนู ⋯ (จำไว้ในเครื่อง)
- สถานะ: `● ออนไลน์` / `ยังไม่บันทึก — กด Save` / `↻ อัปเดตใหม่จากทีม` / `เชื่อมต่อไม่ได้`
- **Poll ทุก 20 วินาที**: ถ้ามีเวอร์ชันใหม่และผู้ใช้ไม่มีงานค้าง/ไม่ได้พิมพ์อยู่ → ดึงมาแสดงเอง
- **ชนกัน (409)**: ระบบดาวน์โหลดสำรองงานของคนที่ Save ทีหลังเป็นไฟล์อัตโนมัติ
  แล้วโหลดเวอร์ชันล่าสุดขึ้นมาให้แก้ซ้ำ — ไม่มีงานหายเงียบๆ
- Save ครั้งแรกจะถามชื่อ (ใส่ใน commit message) และรหัสทีม (จำครั้งเดียว)

### ตัวแปรที่ตั้งใน Worker (Settings → Variables and Secrets)
| ชื่อ | ชนิด | ค่า |
|---|---|---|
| `GITHUB_TOKEN` | Secret | fine-grained PAT (Contents R/W เฉพาะ repo นี้) |
| `PASSCODES_JSON` | Secret | `{"tendering":"...","omni":"...","tcs":"...","recurring":"...","ppa":"...","invest":"..."}` |
| `GITHUB_REPO` | Text | `jinnaphas/platform` |
| `GITHUB_BRANCH` | Text | `main` |
| `DATA_DIR` | Text | `data` |

---

## 7. งานดูแลระบบ (Operations)

- **⚠️ Token หมดอายุ**: PAT ตั้งอายุ 90 วัน (สร้างราวก.ค. 2026 → **ต้องต่ออายุราวต.ค. 2026**)
  — สร้าง token ใหม่ใน GitHub แล้วอัปเดต `GITHUB_TOKEN` ใน Worker (มีผลทันที ไม่ต้อง deploy ใหม่)
- **เปลี่ยนรหัสทีม**: แก้ `PASSCODES_JSON` ใน Worker — มีผลทันที
- **ถอนสิทธิ์ทั้งระบบ**: revoke token ใน GitHub (Developer settings → Fine-grained tokens)
- **ย้อนข้อมูลทีม**: GitHub → `data/<team>.json` → History → เลือก commit → Revert
  หรือ copy เนื้อหาเก่ามา commit ทับ
- **Deploy หน้าเว็บ**: push ขึ้น `main` แล้ว GitHub Pages rebuild เอง (~1–2 นาที)
- **Deploy Worker ใหม่**: วางโค้ดใหม่ใน editor ของ Worker แล้วกด Deploy (ตัวแปรเดิมคงอยู่)
- **บอท Cloudflare เปิด PR อัตโนมัติ** ("Add Cloudflare Workers configuration"):
  เกิดจากการเชื่อม repo ผ่าน "Import a repository" ในอดีต — **ปิดทิ้งได้เลย ไม่ต้อง merge**
  (ระบบเราไม่ใช้ auto-deploy ของ Cloudflare)

---

## 8. ข้อจำกัดที่รู้แล้ว (Known Limitations)

1. **ไม่ใช่ real-time แท้** — เห็นของเพื่อนช้าสุด ~20 วินาที และไม่มี presence จริง/ป้าย "กำลังแก้"
   (จุดสีสมาชิกบน header เป็นตัวอย่างประกอบ) → ถ้าต้องการระดับ Google Docs ให้ไปเฟส Yjs/Firebase
2. **repo เป็น public** (เงื่อนไข GitHub Pages ฟรี) → ไฟล์ `data/` อ่านได้สาธารณะ
   ถ้าข้อมูลถือเป็นความลับ ให้ย้ายหน้าเว็บไป Cloudflare Pages แล้วตั้ง repo private
3. **เพดานข้อมูล ~900KB/ทีม** (จำกัดที่ Worker) — ตัวกินพื้นที่คือรูป
   (โปรไฟล์ย่อ 128px, แกลเลอรีย่อ 720px แล้ว) ถ้าเต็มให้ลบรูปเก่าออก
4. **หน้า Artifact (claude.ai) ใช้โหมดออนไลน์ไม่ได้** — CSP บล็อกการเรียก API ภายนอก
   ใช้เป็นหน้า demo/ทดลองเท่านั้น ตัวจริงคือ GitHub Pages
5. ทั้งแอปเป็น**ไฟล์เดียว** — แก้ไขง่าย deploy ง่าย แต่ถ้าฟีเจอร์โตกว่านี้มากควร refactor แยกไฟล์
6. การจับคู่เส้น Flow ใช้การเทียบข้อความ `[ชื่อ]` กับชื่อ chip/กลุ่ม (contains) —
   ตั้งชื่อให้สะกดตรงกันจึงจะเกิดเส้น

---

## 9. ไทม์ไลน์การพัฒนา (PR สำคัญ)

| PR | เรื่อง |
|---|---|
| #1 | Prototype แรก: โครง Platform Capitalism + มือถือกลาง + 6 แท็บทีม + TCS ตัวอย่าง |
| #2 | Presentation mode + เส้น Flow ทั้งหมดแยกสี + Export PNG |
| #3 | ระบบ Online Save: Worker + รหัสทีม + seed data 6 ทีม + SETUP.md |
| #6 | Redesign: สีประจำทีม, font ไทย, Value Chain, badge ขั้น, 🆕, import เนื้อหา Tendering |
| #7 | ซ่อน header (H) + ซูม −/พอดีจอ/+ ในโหมดนำเสนอ |
| #8 | เครื่องมือระบายสี Priority 3 ระดับ + หัวกลุ่ม Platform เด่นขึ้น |
| #9 | Dock เครื่องมือลอยล่างจอ + help popover + แกลเลอรีรูป + ลิงก์เอกสาร @@url |

หมายเหตุ: PR #4, #5 เป็นของบอท Cloudflare (ปิดทิ้งแล้ว ไม่ใช้)
ระบบพิสูจน์การใช้งานจริงครั้งแรกเมื่อทีม PPA/Omni/Recurring กด Save เข้ามาระหว่างพัฒนา PR #6

---

## 10. แนวทางต่อยอด (Roadmap ที่เคยคุยกัน)

- **หน้า Overview เทียบ 6 ทีม** ในจอเดียว + ตัวเลขสรุป (Stakeholder/Capability/Flow ต่อทีม)
- **Real-time แท้ + presence จริง** (Yjs + WebSocket หรือ Liveblocks/Firebase) ถ้า workshop
  ต้องการเห็นกันวินาทีต่อวินาที
- ป้าย "กำลังแก้โดย..." รายการ์ด (soft lock)
- Version history ในหน้าเว็บ (ตอนนี้ดูผ่าน GitHub History)
- Export PDF สำหรับพิมพ์ A3
- ย้ายรูปไป object storage ถ้าปริมาณรูปโตเกินเพดาน 900KB

---

## 11. บทเรียนสำคัญ (Decision Log)

1. **Template-locked ชนะ freeform** — บังคับ format เดียวกัน 6 ทีมได้จริงโดยไม่ต้องตรวจ
2. **อย่าฝัง secret ในหน้าเว็บ** — browser ซ่อนความลับไม่ได้ และ GitHub secret scanning
   จะ revoke token ที่หลุดใน public repo เองโดยอัตโนมัติ
3. **GitHub เป็นฐานข้อมูลได้ดีเกินคาด** สำหรับงานลักษณะ "กด Save เป็นครั้งๆ" —
   ได้ optimistic locking (SHA), version history, และ audit trail ฟรี
4. **แยกไฟล์รายทีม = ตัดปัญหา concurrent ข้ามทีมทั้งหมด** เหลือจัดการแค่ในทีมเดียวกัน
5. **เก็บ metadata ใน string token** (`3|`, `pN:`, `🆕`, `@@url`) แทนการเปลี่ยน schema —
   backward compatible, พิมพ์มือได้, ติดไปกับทุกช่องทาง (save/export/PNG) โดยไม่ต้องแก้อะไรเพิ่ม
6. **สภาพแวดล้อม dev อาจถูกบล็อก network** (Cloudflare API, workers.dev) —
   ออกแบบให้ทดสอบได้ด้วย mock server ฝั่ง local และให้ผู้ใช้ยืนยันปลายทางแทน
