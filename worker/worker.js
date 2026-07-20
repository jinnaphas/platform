/**
 * RST Architecture Studio — sync worker
 *
 * ตัวกลางระหว่างหน้าเว็บกับ GitHub: ถือ GITHUB_TOKEN ไว้ฝั่ง server
 * ผู้ใช้ยืนยันตัวด้วย "รหัสทีม" เท่านั้น ไม่ต้องมีบัญชี GitHub
 *
 * Endpoints:
 *   GET  /load?team=tcs   → { design, sha }   (sha ใช้กันบันทึกทับกัน)
 *   POST /save            → body { team, passcode, design, sha, editor }
 *                           200 { sha } | 401 รหัสผิด | 409 มีคนบันทึกตัดหน้า (คืน design+sha ล่าสุด)
 *
 * ตัวแปรที่ต้องตั้งค่า (Settings → Variables and Secrets):
 *   GITHUB_TOKEN    (secret)  fine-grained PAT สิทธิ์ Contents R/W เฉพาะ repo นี้
 *   PASSCODES_JSON  (secret)  เช่น {"tendering":"TND-2026","omni":"OMN-2026","tcs":"TCS-2026",
 *                                   "recurring":"RCR-2026","ppa":"PPA-2026","invest":"INV-2026"}
 *   GITHUB_REPO     (var)     "jinnaphas/platform"
 *   GITHUB_BRANCH   (var)     "main"
 *   DATA_DIR        (var)     "data"
 */

const TEAMS = ["tendering", "omni", "tcs", "recurring", "ppa", "invest"];

export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });

    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
      });

    const repo = env.GITHUB_REPO;
    const branch = env.GITHUB_BRANCH || "main";
    const dir = env.DATA_DIR || "data";

    const gh = (path, init = {}) =>
      fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        ...init,
        headers: {
          "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
          "Accept": "application/vnd.github+json",
          "User-Agent": "rst-architecture-studio",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(init.headers || {}),
        },
      });

    async function getFile(team) {
      const r = await gh(`${dir}/${team}.json?ref=${branch}`);
      if (r.status === 404) return { design: null, sha: null };
      if (!r.ok) throw new Error("GitHub " + r.status);
      const j = await r.json();
      let text;
      if (j.encoding === "base64" && j.content) {
        text = b64dec(j.content);
      } else {
        /* ไฟล์ใหญ่กว่าที่ contents API แนบเนื้อหามาให้ — ขอแบบ raw แทน */
        const raw = await gh(`${dir}/${team}.json?ref=${branch}`, {
          headers: { "Accept": "application/vnd.github.raw" },
        });
        if (!raw.ok) throw new Error("GitHub raw " + raw.status);
        text = await raw.text();
      }
      return { design: JSON.parse(text), sha: j.sha };
    }

    const url = new URL(req.url);
    try {
      if (url.pathname === "/load" && req.method === "GET") {
        const team = url.searchParams.get("team");
        if (!TEAMS.includes(team)) return json({ error: "unknown team" }, 400);
        return json(await getFile(team));
      }

      if (url.pathname === "/save" && req.method === "POST") {
        const body = await req.json().catch(() => null);
        const { team, passcode, design, sha, editor } = body || {};
        if (!TEAMS.includes(team)) return json({ error: "unknown team" }, 400);

        const codes = JSON.parse(env.PASSCODES_JSON || "{}");
        if (!passcode || !codes[team] || codes[team] !== passcode) {
          return json({ error: "bad passcode" }, 401);
        }

        if (!design || typeof design !== "object") return json({ error: "invalid design" }, 400);
        const payload = JSON.stringify(design, null, 2);
        if (payload.length > 900_000) {
          return json({ error: "design too large — remove some images" }, 413);
        }

        const who = String(editor || "").slice(0, 60).replace(/[\r\n]/g, " ");
        const put = await gh(`${dir}/${team}.json`, {
          method: "PUT",
          body: JSON.stringify({
            message: `${team}: update design${who ? " by " + who : ""}`,
            content: b64enc(payload),
            branch,
            ...(sha ? { sha } : {}),
          }),
        });

        /* sha ไม่ตรง = มีคนบันทึกตัดหน้า → ส่งเวอร์ชันล่าสุดกลับไปให้รวมใหม่ */
        if (put.status === 409 || put.status === 422) {
          const latest = await getFile(team);
          return json(latest, 409);
        }
        if (!put.ok) return json({ error: "GitHub " + put.status }, 502);
        const pj = await put.json();
        return json({ sha: pj.content.sha });
      }

      return json({ ok: true, service: "rst-architecture-studio-sync", teams: TEAMS });
    } catch (e) {
      return json({ error: String((e && e.message) || e) }, 500);
    }
  },
};

function b64enc(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

function b64dec(b64) {
  const bin = atob(b64.replace(/\s/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
