---
name: rst-architecture-studio
description: >
  คู่มือการทำงานกับโปรเจกต์ RST Architecture Studio (repo jinnaphas/platform) —
  ระบบออกแบบ Business Architecture ร่วมกันของ 6 Revenue Stream Teams ของ Precise
  (Tendering, Omni Channel, TCS, Recurring, PPA, Investment) บนแนวคิด Platform
  Capitalism และ Gartner DBTP. ใช้ skill นี้ทุกครั้งที่ผู้ใช้พูดถึง RST, Revenue
  Stream, Business Architecture, Platform ตรงกลางเป็นมือถือ, Stakeholder,
  Capability, Value Chain, DBTP, 5 ห่วง, Executive View, Conceptual View,
  End-Way-Means, หน้าสอน Uber/Grab, การ Save ออนไลน์ของทีม, รหัสทีม, Cloudflare
  Worker, ไฟล์ data/*.json, chip syntax, หรือขอแก้ไข/เพิ่มหน้าใดๆ ใน
  prototype/ — แม้ผู้ใช้จะไม่เอ่ยชื่อโปรเจกต์ตรงๆ ก็ตาม
---

# RST Architecture Studio — Project Skill

โปรเจกต์นี้คือชุดเครื่องมือออกแบบและนำเสนอ Business Architecture ของ 6 ทีม
Revenue Stream (RST) ที่ Precise ทั้งหมดเป็น **static HTML + SVG ไฟล์เดียวต่อหน้า
ไม่มี build step** โฮสต์บน GitHub Pages และเซฟข้อมูลออนไลน์ผ่าน Cloudflare Worker
ผู้ใช้หลัก (jinnaphas.p@precise.co.th) สื่อสารภาษาไทย — **ตอบภาษาไทยเสมอ**

## 1. โครงสร้าง Repo

| Path | คืออะไร |
|---|---|
| `prototype/index.html` | **Studio** — เครื่องมือหลัก ออกแบบผัง Platform ต่อทีม (แก้ไข+เซฟออนไลน์) |
| `prototype/exec-summary.html` | **DBTP Executive View** — ฉบับย่อ 6 ทีม: มือถือ + 5 ห่วง DBTP + Stakeholder/นิติบุคคล (แก้ไข/ลากย้าย/ปรับ format ได้, เก็บใน localStorage) |
| `prototype/conceptual-view.html` | **End · Way · Means** — END = 6 RST Platforms, WAY = 5 ห่วง DBTP + Constituencies, MEANS = ทรัพยากร (ยังเป็นร่าง รอข้อมูลจริง) |
| `prototype/tcs-dbtp.html` | **DBTP Explorer ของ TCS** — จัด Capability ของ TCS ลงโซน Gartner แบบ dynamic + isometric |
| `prototype/uber-example.html` | หน้าสอน: Uber = Platform Capitalism (story stepper + zoom/pan) |
| `prototype/grab-example.html` | หน้าสอน: Grab = Ecosystem Capitalism (โครงเดียวกับ Uber ธีมเขียว) |
| `data/<team>.json` | ข้อมูลของแต่ละทีม — **ทีมเป็นเจ้าของ ห้าม clobber** (ทีมกดเซฟจาก Studio ตลอดเวลา) |
| `worker/worker.js` + `wrangler.toml` | Cloudflare Worker proxy สำหรับเซฟออนไลน์ |
| `docs/KNOWLEDGE.md` | Knowledge base ละเอียด: สถาปัตยกรรม, ops runbook, การหมุน Token/รหัสทีม |

ทีมทั้ง 6 + สีประจำทีม: tendering `#0E8074` · omni `#D96C2C` · tcs `#2358C6` ·
recurring `#4E9F3D` · ppa `#A8821C` · invest `#7C4DC4`

## 2. Data Model + Chip Syntax (สำคัญที่สุด)

`data/<team>.json`: `{phoneTitle, valueChain[], stakeholders[], layers[], images[]}`

- `stakeholders[]`: `{id, title, hue, glyph, side(L/R), image, items[]}` —
  `items` คือ Activity ของบทบาทนั้น
- `layers[]`: `{title, groups[{name, chips[]}]}` — group = Sub-Platform,
  chip = Capability

**Chip token** (ใน `chips[]`): `3|p1:ชื่อ Capability 🆕 @@https://doc-url`
- `3|` = ตำแหน่งใน Value Chain (index+1), `p1:`–`p3:` = Priority,
  `🆕` = ของใหม่, `@@url` = ลิงก์เอกสารแนบ — ทุกส่วน optional
- **Activity token**: `ข้อความ → [ชื่อ Capability เป้าหมาย] @@url` —
  ชื่อในวงเล็บเหลี่ยมใช้จับคู่เส้น Flow กับ chip (ตัดหน้า `(`, ตัด token พิเศษ
  ก่อนเทียบ แบบ case-insensitive)

แก้ไฟล์ data ด้วยโปรแกรม: อ่าน-แก้-เขียน JSON ตรงๆ ได้ แต่**ต้อง fetch/merge
origin/main ก่อนเสมอ** และห้ามลบ/เขียนทับสิ่งที่ทีมแก้ไว้ (conflict → ของทีมชนะ)

## 3. สถาปัตยกรรมเซฟออนไลน์

Studio → `POST` Worker (`platform.jinnaphas-phas.workers.dev`) → GitHub Contents
API → commit ลง `data/<team>.json`
- Secret ฝั่ง Worker เท่านั้น: `GITHUB_TOKEN` (fine-grained PAT), `PASSCODES_JSON`
  (รหัสทีมละชุด) — **ห้ามใส่ token/รหัสในหน้าเว็บหรือ commit เด็ดขาด**
- กัน conflict ด้วย SHA optimistic locking; Studio poll ทุก 20 วิ; ถ้าเซฟชน
  version จะ backup ของผู้ใช้ลง localStorage ก่อน
- ถ้าผู้ใช้เผลอวาง token ในแชต → ถือว่ารั่ว บอกให้ลบ/หมุนใหม่ทันที ห้ามใช้ต่อ
- Runbook ต่ออายุ PAT (~ต.ค. 2027) และหมุนรหัสทีม: ดู `docs/KNOWLEDGE.md`

## 4. แบบแผน UI ที่ใช้ร่วมทุกหน้า (ทำหน้าใหม่ให้เหมือนกัน)

- ฟอนต์ `Sarabun` (Google Fonts + fallback), พื้นหลัง `#F2F5F7`, การ์ดขาว,
  หมึก `#17232F`, สีห่วง DBTP: CX `#2358C6` / Ecosystem `#D96C2C` /
  IoT `#7C4DC4` / IS `#4E9F3D` / Data & Analytics `#10243E` (วงเข้มตรงกลาง)
- ผืนวาดเป็น **SVG เดียว viewBox ใหญ่** สร้างด้วย JS (`el()/txt()` helpers)
- ลูกเล่นมาตรฐาน: zoom ที่ cursor ด้วย wheel (คูณ viewBox), drag-pan,
  ปุ่ม ซูม +/− / ↺ พอดีจอ / ⛶ เต็มจอ (`requestFullscreen` บน #frame),
  คลิกองค์ประกอบเพื่อ spotlight (คลาส `.dim`), หน้าสอนมี story stepper
  (`<g class="step" data-step=N>` + ไล่ opacity)
- โหมดแก้ไขใน exec-summary: ลาก `.movable`, ดับเบิลคลิกเปิดแผงแก้ไข,
  เก็บใน localStorage key `rst-exec-edit-v1` (ต่อเบราว์เซอร์) —
  **บั๊กที่เคยเจอ**: ห้าม `setPointerCapture` ตอน pointerdown ทันที
  (ทำให้ click/dblclick retarget ไปที่ svg) — capture หลังขยับเกิน threshold
- Export PNG: serialize SVG → `data:image/svg+xml;charset=utf-8,`+encodeURIComponent
  (ห้ามใช้ blob URL — taint canvas บน file://) → canvas 2x → ถ้ามี
  `window.claude.use("downloads")` ใช้ capability, ไม่งั้น anchor download

## 5. Workflow มาตรฐานของโปรเจกต์นี้

1. `git fetch origin main && git merge origin/main --no-edit` ก่อนเริ่มงานทุกครั้ง
2. พัฒนาบน branch `claude/business-architecture-tool-srtk5r`
3. ทดสอบ headless ก่อนส่งเสมอ: playwright-core + Chromium ที่
   `/opt/pw-browsers/chromium` (ห้าม `playwright install`) — เช็ก pageerror
   และถ่าย screenshot ตรวจ label ชน/ล้นกรอบด้วยตาทุกครั้ง
4. commit → push → เปิด PR → **merge ทันที** (แนวทางที่เจ้าของ repo กำหนดไว้)
5. GitHub Pages เสิร์ฟจาก main อัตโนมัติหลัง merge ไม่กี่นาที
6. แจ้งผลเป็นภาษาไทย พร้อม screenshot และลิงก์

**ข้อห้าม/กับดัก**: อย่า merge PR อัตโนมัติจากบอท Cloudflare (เคยสร้าง worker
พังมาแล้ว) · network ของ environment พัฒนา block api.cloudflare.com,
workers.dev, github.io (403 CONNECT = policy ห้าม retry/bypass — ให้ผู้ใช้
ตรวจบนเครื่องเขาแทน) · regex classifier ของ DBTP ต้องใช้ word boundary
(`\bedge\b` เคยจับ "Knowledge" ผิดโซน) · แทนที่ข้อความใน JSON ที่ฝังในหน้า
ด้วย Python ให้ใช้ lambda ใน `re.sub` (กัน `\n` ถูกตีความ)

## 6. ระดับการใช้งาน (Usage Levels) — สำหรับวิเคราะห์/วางแผนอบรม

| Level | ผู้ใช้ | ใช้อะไร | ทักษะที่ต้องมี |
|---|---|---|---|
| **L1 ผู้ชม/ผู้ฟัง** | ผู้บริหาร, ทีมอื่น | เปิดดู exec-summary / conceptual-view / หน้าสอน Uber-Grab, ซูม-เต็มจอ, กดเล่นทีละขั้น | เปิดลิงก์ได้ ไม่ต้องเรียนรู้อะไร |
| **L2 ผู้นำเสนอ** | หัวหน้าทีม RST | L1 + ปรับ format (A−/A+, ขนาดวง/การ์ด), ลากจัด Layout, Export PNG ไปทำสไลด์, spotlight ทีละห่วง | เข้าใจ 5 ห่วง DBTP และข้อมูลทีมตัวเอง |
| **L3 ผู้ออกแบบทีม** | สมาชิกทีม RST ทั้ง 6 | Studio เต็มรูปแบบ: แก้ Capability/Activity, chip syntax, ลาก Flow 🖇, Priority, แนบรูป/ลิงก์เอกสาร, เซฟออนไลน์ด้วยรหัสทีม | เข้าใจ chip/activity token, รหัสทีมของตน, มารยาทการเซฟ (ระบบกันชนให้แล้ว) |
| **L4 ผู้ดูแลระบบ** | เจ้าของ repo | หมุน PAT/รหัสทีม, ดูแล Worker, merge PR, bake ค่า default จาก JSON ที่ทีมส่งมา, เพิ่มหน้าใหม่ | Git/GitHub, Cloudflare dashboard, อ่าน docs/KNOWLEDGE.md |

ช่องว่างที่ควรวัดเมื่อวิเคราะห์การใช้งานจริง: สัดส่วนผู้ใช้ที่ติดอยู่ L1,
ความถี่ commit ใน `data/*.json` ต่อทีม (บอกว่า L3 ทำงานจริงไหม),
จำนวน conflict-backup ที่เกิด (บอกว่าเซฟชนกันบ่อยไหม)

## 7. เมื่อจะเพิ่มหน้า/ฟีเจอร์ใหม่

- ทำตามแบบแผนข้อ 4 ให้หน้าตาเป็นชุดเดียวกัน แล้วเพิ่มลิงก์เข้าเมนู ⋯ ของ
  `prototype/index.html`
- ข้อมูลสรุป/วิเคราะห์ที่ curate เอง ให้ระบุในหน้าว่าเป็น snapshot ณ วันไหน
  และไม่อัปเดตตามทีมอัตโนมัติ
- ถ้าหน้าใหม่ต้องอ่านข้อมูลทีมสด ใช้ fallback chain แบบ tcs-dbtp:
  Worker API → `../data/<team>.json` → localStorage → embedded snapshot
