const json = (status, body) => new Response(JSON.stringify(body), {status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const base = value => String(value || "").trim().replace(/\/+$/, "");

async function supabase(path, options = {}) {
  const url = base(process.env.SUPABASE_URL);
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) throw new Error("Supabase server configuration is missing");
  const response = await fetch(`${url}/${String(path).replace(/^\/+/, "")}`, {
    method:options.method || "GET",
    headers:{apikey:key,authorization:`Bearer ${key}`,accept:"application/json",...(options.body === undefined ? {} : {"content-type":"application/json"})},
    body:options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || `Supabase ${response.status}`);
  return data;
}

async function sendMail({to,name}) {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = String(process.env.EVORANK_EMAIL_FROM || "EvoRank <hallo@evorank.app>").trim();
  if (!apiKey) throw new Error("RESEND_API_KEY is missing");
  const response = await fetch("https://api.resend.com/emails", {
    method:"POST",
    headers:{authorization:`Bearer ${apiKey}`,"content-type":"application/json"},
    body:JSON.stringify({
      from,to:[to],subject:"Alles Gute zum Geburtstag von EvoRank 🎉",
      html:`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111827"><h1>Alles Gute zum Geburtstag${name ? `, ${name}` : ""}! 🎉</h1><p>Wir wünschen dir ein starkes neues Trainingsjahr.</p><p style="padding:18px;border-radius:14px;background:#ecfdf5;font-size:18px"><strong>Dein Geschenk: 20 EvoRank Coins</strong><br><span style="font-size:14px">Öffne EvoRank – die Coins werden einmalig deinem Konto gutgeschrieben.</span></p><p style="color:#6b7280;font-size:13px">Sportliche Grüße<br>Dein EvoRank Team</p></div>`,
      text:`Alles Gute zum Geburtstag${name ? `, ${name}` : ""}! EvoRank schenkt dir 20 Coins. Öffne die App, um sie einmalig gutzuschreiben.`
    })
  });
  if (!response.ok) throw new Error(`Resend ${response.status}`);
}

export default async function handler() {
  try {
    const rows = await supabase("rest/v1/rpc/evorank_birthdays_due", {method:"POST",body:{p_on_date:new Date().toISOString().slice(0,10)}});
    let sent = 0, failed = 0;
    for (const row of Array.isArray(rows) ? rows.slice(0,500) : []) {
      try {
        const user = await supabase(`auth/v1/admin/users/${encodeURIComponent(row.user_id)}`);
        if (!user?.email) throw new Error("No email for user");
        await sendMail({to:user.email,name:String(row.display_name || row.nickname || "").slice(0,40)});
        await supabase("rest/v1/rpc/evorank_birthday_mark_emailed", {method:"POST",body:{p_user_id:row.user_id,p_reward_year:row.reward_year}});
        sent += 1;
      } catch (error) {
        failed += 1;
        console.error("[EvoRank birthday]", row.user_id, error.message);
      }
    }
    return json(200,{ok:true,sent,failed});
  } catch (error) {
    console.error("[EvoRank birthday job]",error);
    return json(500,{ok:false,error:"Birthday job failed"});
  }
}

export const config = { schedule:"0 7 * * *" };
