import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const base=read('db/SUPABASE-LEADERBOARDS-10.9.sql').split('create or replace function')[0];
let production=read('db/SUPABASE-PRODUCTION-10.10.sql').replace(/^begin;\s*$/m,'').replace(/^commit;\s*$/m,'');
function replace(before,after){if(!production.includes(before))throw new Error('SQL source changed: '+before.slice(0,70));production=production.replace(before,after);}
production=production.replaceAll('\r\n','\n');
replace("  v_previous_score integer;", "  v_previous_score integer;\n  v_previous_moderation text;\n  v_garmin_verified boolean := false;");
replace(`  if v_source = 'garmin' and v_sport <> 'strength' and not exists (
    select 1 from public.rf_garmin_activities
    where user_id = auth.uid() and sport = v_sport
  ) then raise exception 'garmin_activity_not_verified'; end if;`, `  if v_source = 'garmin' and v_sport <> 'strength' then
    if to_regclass('public.rf_garmin_activities') is null then
      raise exception 'garmin_activity_not_verified';
    end if;
    execute 'select exists (select 1 from public.rf_garmin_activities where user_id = $1 and sport = $2)'
      into v_garmin_verified using auth.uid(), v_sport;
    if not v_garmin_verified then raise exception 'garmin_activity_not_verified'; end if;
  end if;`);
replace('  select score into v_previous_score', '  select score, moderation_state into v_previous_score, v_previous_moderation');
replace("  if v_source = 'manual' and v_previous_score is not null and p_score > v_previous_score + 2500 then", "  if v_previous_moderation in ('review', 'rejected') then\n    v_moderation := v_previous_moderation;\n  elsif v_source = 'manual' and v_previous_score is not null and p_score > v_previous_score + 2500 then");
// All security-definer queries qualify application tables explicitly.
production=production.replaceAll('set search_path = public', "set search_path = ''");
const sql=`-- EvoRank X5.4: one atomic setup for all four leaderboards.
-- Run in the SQL Editor of the EXISTING Supabase project, never in Netlify.
-- Requires the existing account/profile setup. Does not enable anyone's consent.
begin;
do $$ begin
  if to_regclass('public.rankforge_profiles') is null then
    raise exception 'EvoRank-Kontoeinrichtung fehlt: zuerst die beiliegende Anleitung lesen.';
  end if;
end $$;
${base}
${production.slice(production.indexOf('create table'))}
notify pgrst, 'reload schema';
commit;
-- Empty array is expected when nobody has consented yet.
select 'Bestenlisten eingerichtet: Gym, Laufen, Radfahren, Schwimmen' as ergebnis;
`;
fs.writeFileSync(path.join(root,'db/SUPABASE-BESTENLISTEN-X5.4.sql'),sql);
const target=path.join(root,'packaging/windows/BESTENLISTEN-EINRICHTEN');fs.mkdirSync(target,{recursive:true});
fs.writeFileSync(path.join(target,'1-BESTENLISTEN-EINRICHTEN.sql'),sql);
fs.copyFileSync(path.join(root,'docs/BESTENLISTEN-EINRICHTEN-X5.4.md'),path.join(target,'ANLEITUNG.md'));
