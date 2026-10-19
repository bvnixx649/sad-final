// Mock final: 5 written questions with worked answers; calculation questions re-roll their numbers.
Hop.page(6);
const { el, $, $$, icon, rnd, pick } = Hop;
const f = (n, dp = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
const H = t => ({ html: `<b>${t}</b>`, h: true });

function card(num, title, pts, build, reroll) {
  const box = el('section', { class: 'xq' });
  const body = el('div');
  const head = el('h2', { html: `<span class="num">${num}</span>${title}` });
  box.append(head, el('div', { class: 'pts', text: pts }), body);
  $('#qs').append(box);
  function render() {
    const q = build();
    const wHost = el('div');
    const show = el('button', { class: 'btn primary', html: `${icon('eye')} ดูวิธีทำ` });
    show.onclick = () => { show.remove(); Hop.work(wHost, q.work, { stagger: 70 }); $$('.ln', wHost).forEach((x, i) => { if (q.work[i] && q.work[i].h) x.classList.add('h'); }); };
    const bar = el('div', { class: 'bar2' }, show);
    if (reroll) bar.append(el('button', { class: 'btn', html: `${icon('shuffle')} สุ่มตัวเลขใหม่`, onclick: () => { render(); box.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }));
    body.replaceChildren(...[el('div', { class: 'prompt', html: q.prompt }), q.given ? el('div', { class: 'given tw', html: q.given }) : null, bar, wHost].filter(Boolean));
  }
  render();
}

/* ---------- Q1: PERT / CPM / crash ---------- */
const SHAPES = [
  { acts: { A: [], B: ['A'], C: ['A'], D: ['B', 'C'], E: ['C'] } },
  { acts: { A: [], B: [], C: ['A'], D: ['A', 'B'], E: ['C', 'D'], F: ['D'] } },
];
function allPaths(acts) {
  const keys = Object.keys(acts), succ = k => keys.filter(x => acts[x].includes(k));
  const out = [], walk = (k, p) => { const s = succ(k); if (!s.length) out.push([...p, k]); s.forEach(x => walk(x, [...p, k])); };
  keys.filter(k => !acts[k].length).forEach(k => walk(k, []));
  return out;
}
function solveCrash(A, paths) {
  const keys = Object.keys(A), d = {}, left = {};
  keys.forEach(k => { d[k] = A[k].d; left[k] = A[k].d - A[k].cd; });
  let cost = keys.reduce((s, k) => s + A[k].nc, 0);
  const steps = [{ d: { ...d }, cost }];
  for (let g = 0; g < 80; g++) {
    const lens = paths.map(p => p.reduce((s, k) => s + d[k], 0)), M = Math.max(...lens), crit = paths.filter((p, i) => lens[i] === M);
    let best = null;
    for (let m = 1; m < (1 << keys.length); m++) {
      const S = keys.filter((k, i) => m & (1 << i));
      if (S.some(k => !left[k])) continue;
      if (!crit.every(p => p.some(k => S.includes(k)))) continue;
      const c = S.reduce((s, k) => s + A[k].cpd, 0);
      if (!best || c < best.c || (c === best.c && S.length < best.S.length)) best = { S, c };
    }
    if (!best) break;
    best.S.forEach(k => { d[k]--; left[k]--; }); cost += best.c;
    const last = steps[steps.length - 1];
    if (last.S && last.S.join() === best.S.join()) { last.n++; last.d = { ...d }; last.cost = cost; }
    else steps.push({ S: best.S, n: 1, c: best.c, d: { ...d }, cost });
  }
  return steps;
}
card(1, 'PERT/CPM และการอัดฉีดเงิน', 'คำนวณ', () => {
  let A, paths, steps;
  for (;;) {
    const sh = pick(SHAPES); A = {};
    for (const [k, p] of Object.entries(sh.acts)) { const d = rnd(3, 9), cut = rnd(1, Math.min(3, d - 1)), nc = rnd(2, 20) * 1000, cpd = rnd(3, 30) * 100; A[k] = { p, d, cd: d - cut, nc, cpd, cc: nc + cpd * cut }; }
    paths = allPaths(sh.acts); steps = solveCrash(A, paths);
    if (steps.length >= 3 && steps.length <= 7) break;
  }
  const keys = Object.keys(A), len = (p, d) => p.reduce((s, k) => s + d[k], 0);
  const L0 = paths.map(p => len(p, steps[0].d)), M0 = Math.max(...L0);
  const given = `<table><tr><th>Activity</th><th>Prior</th><th>Normal t (วัน)</th><th>Normal cost</th><th>Crash t</th><th>Crash cost</th></tr>${keys.map(k => `<tr><td>${k}</td><td>${A[k].p.join(', ') || 'none'}</td><td>${A[k].d}</td><td>${f(A[k].nc)}</td><td>${A[k].cd}</td><td>${f(A[k].cc)}</td></tr>`).join('')}</table>`;
  const last = steps[steps.length - 1], Mn = Math.max(...paths.map(p => len(p, last.d)));
  const work = [
    H('1) ต้นทุนอัดฉีดต่อวัน และจำนวนครั้งที่ลดได้'),
    { t: 'cost/วัน = (Crash cost − Normal cost) ÷ (Normal t − Crash t),  ลดได้ = Normal t − Crash t', note: true },
    ...keys.map(k => ({ t: `${k}: (${f(A[k].cc)} − ${f(A[k].nc)}) ÷ (${A[k].d} − ${A[k].cd}) = ${f(A[k].cpd)} บาท/วัน, ลดได้ ${A[k].d - A[k].cd} ครั้ง` })),
    H('2) PERT: ลากลูกศรจากงานก่อนหน้าไปหางานนั้น'),
    ...keys.filter(k => A[k].p.length).map(k => ({ t: `${A[k].p.join(', ')} → ${k}` })),
    H('3) เส้นทางทั้งหมด เส้นทางวิกฤต และ slack'),
    ...paths.map((p, i) => ({ t: `${p.join('-')} = ${p.map(k => A[k].d).join(' + ')} = ${L0[i]}${L0[i] === M0 ? '  *วิกฤต' : ''}` })),
    { t: `โครงการใช้เวลา ${M0} วัน`, note: true },
    ...keys.map(k => { const m = Math.max(...paths.filter(p => p.includes(k)).map(p => len(p, steps[0].d))); return { t: `slack(${k}) = ${M0} − ${m} = ${M0 - m}` }; }),
    H('4) อัดฉีด: เลือกงานบนเส้นวิกฤตที่ถูกที่สุด ถ้าวิกฤตหลายเส้นต้องลดให้ครบทุกเส้น'),
    { t: `ต้นทุนเดิม = ${keys.map(k => f(A[k].nc)).join(' + ')} = ${f(steps[0].cost)}` },
  ];
  let prev = steps[0];
  steps.slice(1).forEach(s => {
    const Ls = paths.map(p => len(p, s.d)), M = Math.max(...Ls);
    work.push({ t: `Crash ${s.S.join(' + ')} by ${s.n}: ${f(prev.cost)} + ${s.n} × ${f(s.c)} = ${f(s.cost)}   ${paths.map((p, i) => `${p.join('')}=${Ls[i]}${Ls[i] === M ? '*' : ''}`).join(' ')}` });
    prev = s;
  });
  work.push({ t: 'หยุดเมื่อไม่มีชุดงานใดลดเส้นวิกฤตได้ครบทุกเส้นอีกแล้ว', note: true },
    { t: `สรุป: จาก ${M0} เหลือ ${Mn} วัน (ลด ${M0 - Mn}) ต้นทุนรวม ${f(last.cost)} เพิ่มขึ้น ${f(last.cost - steps[0].cost)} บาท` });
  return { prompt: 'จากตารางกิจกรรม<ol><li>จงคำนวณต้นทุนอัดฉีดต่อวันของแต่ละกิจกรรม และจำนวนครั้งสูงสุดที่อัดฉีดได้</li><li>จงวาด PERT chart</li><li>จงหาเส้นทางทั้งหมด เส้นทางวิกฤต และ slack ของแต่ละกิจกรรม</li><li>ถ้าอัดฉีดเงินเพื่อเร่งงานให้เร็วที่สุด จะลดเวลาได้กี่วัน และต้นทุนรวมเท่าไหร่ แสดงวิธีทำ</li></ol>', given, work };
}, true);

/* ---------- Q2: normalization + ERD (dental clinic exercise) ---------- */
card(2, 'Normalization และ ER-Diagram', 'บรรยาย/ออกแบบ', () => ({
  prompt: 'คลินิกทันตกรรม "ยิ้มสดใส" เก็บการนัดหมายไว้ในตารางเดียว แต่ละแถวคือการนัดหมายหนึ่งครั้ง ถ้าในการนัดหมายหนึ่งรักษาหลายหัตถการ จะกรอกหัตถการซ้ำต่อกันในแถวเดียว (repeating group) ทันตแพทย์แต่ละคนประจำอยู่หนึ่งแผนก และแผนกกำหนดค่าธรรมเนียมตรวจ<ol><li>อธิบายปัญหา (anomaly) ของตารางเดิม</li><li>ทำ 1NF, 2NF, 3NF พร้อมระบุ PK, FK และ functional dependency</li><li>เขียน ERD หลัง 3NF พร้อม cardinality</li></ol>',
  given: 'ฟิลด์: เลขที่นัดหมาย, วันที่นัดหมาย, รหัสคนไข้, ชื่อคนไข้, ที่อยู่, เบอร์โทร, รหัสทันตแพทย์, ชื่อทันตแพทย์, รหัสแผนก, ชื่อแผนก, ค่าธรรมเนียมตรวจ, {รหัสหัตถการ, ชื่อหัตถการ, หมวดหัตถการ, ระยะเวลามาตรฐาน, ราคาต่อหน่วย, จำนวนหน่วย} (ในวงเล็บปีกกาคือกลุ่มที่ซ้ำ)',
  work: [
    H('1) Anomaly ของตารางเดิม'),
    { t: 'Insert anomaly: เพิ่มหัตถการใหม่หรือทันตแพทย์ใหม่ไม่ได้ถ้ายังไม่มีการนัดหมาย' },
    { t: 'Update anomaly: ชื่อ/ที่อยู่คนไข้ PT01 ซ้ำทุกการนัด ต้องแก้หลายแถว ถ้าแก้ไม่ครบข้อมูลขัดกัน' },
    { t: 'Delete anomaly: ลบการนัดหมายเดียวของคนไข้ ข้อมูลคนไข้และหัตถการหายไปด้วย' },
    { t: 'และมี repeating group ทำให้ค้นหา/รวมยอดตามหัตถการยาก', note: true },
    H('2) 1NF: กำจัด repeating group ขยาย PK ให้รวมคีย์ของกลุ่มที่ซ้ำ'),
    { t: 'นัดหมาย (เลขที่นัดหมาย, รหัสหัตถการ, วันที่, รหัสคนไข้, ชื่อคนไข้, ที่อยู่, เบอร์, รหัสทันตแพทย์, ชื่อทันตแพทย์, รหัสแผนก, ชื่อแผนก, ค่าธรรมเนียม, ชื่อหัตถการ, หมวด, ระยะเวลามาตรฐาน, ราคาต่อหน่วย, จำนวนหน่วย)' },
    { t: 'PK = {เลขที่นัดหมาย, รหัสหัตถการ} (combination key, ขีดเส้นใต้ทั้งสอง)', note: true },
    H('3) 2NF: กำจัด partial dependency (non-key ที่ขึ้นกับคีย์แค่บางส่วน)'),
    { t: 'FD: เลขที่นัดหมาย → วันที่, รหัสคนไข้, ..., ค่าธรรมเนียม (ขึ้นกับครึ่งแรกของคีย์)' },
    { t: 'FD: รหัสหัตถการ → ชื่อหัตถการ, หมวด, ระยะเวลามาตรฐาน, ราคาต่อหน่วย (ขึ้นกับครึ่งหลัง)' },
    { t: 'FD: {เลขที่นัดหมาย, รหัสหัตถการ} → จำนวนหน่วย (ขึ้นกับทั้งคีย์)' },
    { t: 'นัดหมาย (เลขที่นัดหมาย, วันที่, รหัสคนไข้, ชื่อคนไข้, ที่อยู่, เบอร์, รหัสทันตแพทย์, ชื่อทันตแพทย์, รหัสแผนก, ชื่อแผนก, ค่าธรรมเนียม)' },
    { t: 'หัตถการ (รหัสหัตถการ, ชื่อหัตถการ, หมวด, ระยะเวลามาตรฐาน, ราคาต่อหน่วย)' },
    { t: 'รายการหัตถการ (เลขที่นัดหมาย, รหัสหัตถการ, จำนวนหน่วย)' },
    H('4) 3NF: กำจัด non-key ที่ขึ้นกับ non-key (transitive)'),
    { t: 'FD: รหัสคนไข้ → ชื่อคนไข้, ที่อยู่, เบอร์   รหัสทันตแพทย์ → ชื่อทันตแพทย์, รหัสแผนก   รหัสแผนก → ชื่อแผนก, ค่าธรรมเนียม' },
    { t: 'คนไข้ (รหัสคนไข้, ชื่อคนไข้, ที่อยู่, เบอร์โทร)' },
    { t: 'แผนก (รหัสแผนก, ชื่อแผนก, ค่าธรรมเนียมตรวจ)' },
    { t: 'ทันตแพทย์ (รหัสทันตแพทย์, ชื่อทันตแพทย์, รหัสแผนก FK)' },
    { t: 'นัดหมาย (เลขที่นัดหมาย, วันที่, รหัสคนไข้ FK, รหัสทันตแพทย์ FK)' },
    { t: 'หัตถการ (รหัสหัตถการ, ชื่อหัตถการ, หมวด, ระยะเวลามาตรฐาน, ราคาต่อหน่วย)' },
    { t: 'รายการหัตถการ (เลขที่นัดหมาย FK, รหัสหัตถการ FK, จำนวนหน่วย)  PK = ทั้งสองฟิลด์' },
    { t: 'ไม่เก็บยอดเงินรวมของการนัด เพราะคำนวณได้จาก ราคาต่อหน่วย × จำนวนหน่วย', note: true },
    H('5) ERD (crow\'s foot)'),
    { t: 'คนไข้ 1 ──< M นัดหมาย        (คนไข้หนึ่งคนมีการนัดได้หลายครั้ง)' },
    { t: 'ทันตแพทย์ 1 ──< M นัดหมาย    (ทันตแพทย์หนึ่งคนรับนัดได้หลายครั้ง)' },
    { t: 'แผนก 1 ──< M ทันตแพทย์       (แผนกหนึ่งมีทันตแพทย์หลายคน)' },
    { t: 'นัดหมาย 1 ──< M รายการหัตถการ >── 1 หัตถการ' },
    { t: 'นัดหมาย กับ หัตถการ เป็น M:N จึงแยกด้วย associative entity "รายการหัตถการ"', note: true },
  ],
}), false);

/* ---------- Q3: payback, discounted payback, NPV ---------- */
card(3, 'Payback, Discounted Payback และ NPV', 'คำนวณ', () => {
  let I, CF, r, fac;
  for (;;) {
    I = rnd(8, 20) * 10000; CF = [0, ...Array.from({ length: 5 }, () => rnd(2, 7) * 10000)]; r = pick([8, 10, 12]);
    fac = CF.map((_, t) => +(1 / Math.pow(1 + r / 100, t)).toFixed(4));
    const s = CF.reduce((a, b) => a + b, 0); if (s > I * 1.15 && CF[1] < I) break;
  }
  const PV = CF.map((c, t) => +(c * fac[t]).toFixed(2));
  const cum = [], dcum = []; CF.forEach((c, t) => { cum.push((t ? cum[t - 1] : -I) + c); dcum.push(+(((t ? dcum[t - 1] : -I) + PV[t])).toFixed(2)); });
  const pb = (arr, flows) => { for (let t = 1; t <= 5; t++) if (arr[t] >= 0) { const rem = -arr[t - 1]; return { t, rem, flow: flows[t], v: (t - 1) + rem / flows[t] }; } return null; };
  const sp = pb(cum, CF), dp = pb(dcum, PV);
  const npv = +(PV.slice(1).reduce((a, b) => a + b, 0) - I).toFixed(2);
  const given = `<table><tr><th>ปีที่</th><th>เงินลงทุน</th><th>รายได้สุทธิ</th></tr><tr><td>0</td><td>${f(I)}</td><td>−</td></tr>${CF.slice(1).map((c, i) => `<tr><td>${i + 1}</td><td></td><td>${f(c)}</td></tr>`).join('')}</table><table><tr><th>PV factor ${r}%</th>${[1, 2, 3, 4, 5].map(t => `<th>ปี ${t}</th>`).join('')}</tr><tr><td></td>${[1, 2, 3, 4, 5].map(t => `<td>${fac[t].toFixed(4)}</td>`).join('')}</tr></table>`;
  const work = [
    H('1) Simple payback period'),
    ...CF.map((c, t) => ({ t: t ? `ปี ${t}: สะสม ${f(cum[t - 1])} + ${f(c)} = ${f(cum[t])}` : `ปี 0: สะสม = −${f(I)}` })),
    sp ? { t: `คืนทุนในปีที่ ${sp.t}: ${sp.t - 1} + ${f(sp.rem)} ÷ ${f(sp.flow)} = ${f(sp.v, 2)} ปี` } : { t: 'ไม่คืนทุนภายใน 5 ปี' },
    { t: 'ระยะเวลาคืนทุน = จำนวนปีก่อนคืนทุน + เงินที่ยังขาด ÷ กระแสเงินสดของปีที่คืนทุน', note: true },
    H(`2) Discounted payback (r = ${r}%)`),
    ...CF.map((c, t) => ({ t: t ? `ปี ${t}: PV = ${f(c)} × ${fac[t].toFixed(4)} = ${f(PV[t], 2)}   สะสม ${f(dcum[t], 2)}` : `ปี 0: −${f(I)} × 1 = −${f(I)}` })),
    dp ? { t: `คืนทุนในปีที่ ${dp.t}: ${dp.t - 1} + ${f(dp.rem, 2)} ÷ ${f(dp.flow, 2)} = ${f(dp.v, 2)} ปี` } : { t: `สิ้นปีที่ 5 ยังขาดอีก ${f(-dcum[5], 2)} บาท ไม่คืนทุนเมื่อคิดมูลค่าปัจจุบัน` },
    { t: 'ใช้ PV ของแต่ละปีแทนรายได้ จึงคืนทุนช้ากว่า simple payback เสมอ', note: true },
    H('3) NPV และการตัดสินใจ'),
    { t: `PV รายได้รวม = ${PV.slice(1).map(x => f(x, 2)).join(' + ')} = ${f(PV.slice(1).reduce((a, b) => a + b, 0), 2)}` },
    { t: `NPV = PV รายได้ − PV เงินลงทุน = ${f(PV.slice(1).reduce((a, b) => a + b, 0), 2)} − ${f(I)} = ${f(npv, 2)}` },
    { t: npv >= 0 ? `NPV ${npv > 0 ? '> 0' : '= 0'} → ควรลงทุน (ผลตอบแทนคุ้มกับต้นทุนของเงินทุน)` : 'NPV < 0 → ไม่ควรลงทุน' },
  ];
  return { prompt: `บริษัทลงทุนพัฒนาระบบ ${f(I)} บาท ได้รายได้สุทธิตามตาราง อัตราคิดลด ${r}%<ol><li>จงหาระยะเวลาคืนทุน (payback period)</li><li>จงหาระยะเวลาคืนทุนแบบคิดมูลค่าปัจจุบัน (discounted payback period)</li><li>จงหา NPV ภายใน 5 ปี และบอกว่าควรลงทุนหรือไม่</li></ol>`, given, work };
}, true);

/* ---------- Q4: output / input design ---------- */
card(4, 'ออกแบบรายงานและการตรวจสอบข้อมูล', 'คำนวณ + บรรยาย', () => {
  const N = rnd(9, 30) * 100 + rnd(0, 9) * 10, Lp = pick([60, 66, 80]), h = rnd(2, 4), ft = rnd(1, 3), g = rnd(3, 8), s = rnd(2, 3), G = rnd(2, 4), ppm = pick([12, 16, 20, 24]);
  const use = Lp - h - ft, tot = N + g * s + G, pages = Math.ceil(tot / use), mins = pages / ppm, m = Math.floor(mins), sec = +((mins - m) * 60).toFixed(2);
  const work = [
    H('ก) จำนวนกระดาษ'),
    { t: `บรรทัดที่พิมพ์ข้อมูลได้ต่อหน้า = ${Lp} − ${h} (หัว) − ${ft} (ท้าย) = ${use}` },
    { t: `บรรทัดทั้งหมด = ${f(N)} (รายการ) + ${g} × ${s} (ยอดรวมหมวด) + ${G} (ยอดรวมทั้งหมด) = ${f(tot)}` },
    { t: `จำนวนหน้า = ${f(tot)} ÷ ${use} = ${(tot / use).toFixed(2)} → ปัดขึ้น = ${pages} แผ่น` },
    { t: 'ปัดขึ้นเสมอ เพราะเศษบรรทัดต้องใช้กระดาษอีกแผ่น', note: true },
    H('ข) เวลาพิมพ์'),
    { t: `เวลา = ${pages} ÷ ${ppm} = ${mins.toFixed(4)} นาที` },
    { t: `= ${m} นาที + ${(mins - m).toFixed(4)} × 60 = ${m} นาที ${sec} วินาที` },
    H('ค) ประเภทรายงาน'),
    { t: 'Detail report: แสดงข้อมูลทีละรายการหลายบรรทัด (อาจมียอดรวมตามกลุ่ม) ใช้โดยพนักงานปฏิบัติการ' },
    { t: 'Exception report: แสดงเฉพาะรายการที่ผิดปกติหรือตรงเงื่อนไข เช่น สินค้าที่ต่ำกว่าจุดสั่งซื้อ ใช้โดยหัวหน้างาน' },
    { t: 'Summary report: สรุปยอดรวม ไม่แสดงรายละเอียด เหมาะกับผู้บริหารระดับสูง' },
    { t: 'รายงานในโจทย์พิมพ์ทุกรายการขาย จึงเป็น detail report', note: true },
    H('ง) Validation check'),
    { t: '1. วันเกิด 01/01/1890 → Reasonableness check (เป็นไปได้แต่ไม่สมเหตุสมผล)' },
    { t: '2. รหัสลูกค้าที่กรอกต้องมีในตารางลูกค้า → Validity check (referential integrity)' },
    { t: '3. จำนวนสั่งซื้อต้องอยู่ระหว่าง 1–100 → Range (limit) check' },
    { t: '4. ช่องจำนวนเงินมีตัวอักษร → Data type check' },
  ];
  return { prompt: `ธุรกิจแห่งหนึ่งมีรายการขาย ${f(N)} รายการ พิมพ์รายการละ 1 บรรทัด กระดาษหนึ่งหน้าพิมพ์ได้ ${Lp} บรรทัด ใช้เป็นหัวกระดาษ ${h} บรรทัดและท้ายกระดาษ ${ft} บรรทัด รายงานแสดงยอดรวมของแต่ละหมวดสินค้า หมวดละ ${s} บรรทัด มี ${g} หมวด และยอดรวมทั้งหมดอีก ${G} บรรทัด เครื่องพิมพ์ความเร็ว ${ppm} หน้าต่อนาที (PPM)<ol><li>ใช้กระดาษกี่แผ่น (1 หน้าต่อแผ่น)</li><li>ใช้เวลาพิมพ์กี่นาที กี่วินาที</li><li>อธิบายรายงาน 3 ประเภท และรายงานนี้เป็นประเภทใด</li><li>ระบุชนิดของ validation check: (1) วันเกิด 01/01/1890 (2) รหัสลูกค้าต้องมีอยู่ในตารางลูกค้า (3) จำนวนสั่งซื้อต้องอยู่ระหว่าง 1–100 (4) ช่องจำนวนเงินมีตัวอักษร</li></ol>`, work };
}, true);

/* ---------- Q5: delivery ---------- */
card(5, 'การส่งมอบระบบ', 'บรรยาย', () => ({
  prompt: 'บริษัทจะเปลี่ยนจากระบบเงินเดือนเดิมไปใช้ระบบใหม่ที่พัฒนาเอง<ol><li>อธิบายวิธี system changeover ทั้ง 4 แบบ เปรียบเทียบความเสี่ยงและค่าใช้จ่าย และแนะนำวิธีที่เหมาะกับระบบเงินเดือน</li><li>อธิบาย unit, integration และ system testing</li><li>จำแนกงานต่อไปนี้เป็น maintenance ประเภทใด: (ก) แก้บั๊กคำนวณภาษีผิด (ข) เพิ่มรายงานสรุปโอทีตามที่ผู้ใช้ขอ (ค) ปรับโค้ดให้ประมวลผลเร็วขึ้นและดูแลง่ายขึ้น (ง) ตรวจหาจุดที่ฐานข้อมูลจะเต็มแล้วขยายก่อนเกิดปัญหา</li></ol>',
  work: [
    H('1) System changeover'),
    { t: 'Direct cutover: หยุดระบบเก่าแล้วใช้ระบบใหม่ทันที ประหยัดที่สุด เสี่ยงที่สุด ไม่มีระบบสำรองถ้าระบบใหม่ผิด' },
    { t: 'Parallel operation: รันระบบเก่าและใหม่พร้อมกันช่วงหนึ่ง เทียบผลลัพธ์ได้ เสี่ยงน้อยที่สุด แต่แพงที่สุด ใช้ไม่ได้ถ้าสองระบบทำงานร่วมกันไม่ได้' },
    { t: 'Pilot operation: ใช้ระบบใหม่ที่หน่วยงานเดียวก่อน (pilot site) เมื่อไม่มีปัญหาจึงเปลี่ยนหน่วยงานอื่นแบบ direct cutover' },
    { t: 'Phased operation: เปลี่ยนทีละโมดูล เสี่ยงและแพงน้อยกว่า parallel ใช้ไม่ได้ถ้าระบบแบ่งเป็นโมดูลไม่ได้' },
    { t: 'ความเสี่ยง: direct > phased ≈ pilot > parallel   ค่าใช้จ่าย: parallel > phased ≈ pilot > direct', note: true },
    { t: 'แนะนำ Parallel operation: เงินเดือนผิดไม่ได้ รันคู่กันแล้วเทียบยอดทุกงวดก่อนเลิกระบบเก่า' },
    H('2) Testing'),
    { t: 'Unit testing: ทดสอบโปรแกรมหรือโมดูลเดียวแยกกัน หาข้อผิดพลาดในโมดูลนั้น' },
    { t: 'Integration testing: ทดสอบหลายโมดูลที่ทำงานร่วมกัน ว่าส่งข้อมูลถึงกันถูกต้อง' },
    { t: 'System testing: ทดสอบทั้งระบบครบทุกส่วนกับข้อมูลจริง/ผู้ใช้ ก่อนติดตั้งใช้งานจริง' },
    H('3) Maintenance'),
    { t: '(ก) Corrective: วินิจฉัยและแก้ข้อผิดพลาดของระบบที่ใช้งานอยู่' },
    { t: '(ข) Adaptive: เพิ่มความสามารถใหม่ (enhancement) ให้ระบบเดิม' },
    { t: '(ค) Perfective: ปรับให้มีประสิทธิภาพ เชื่อถือได้ และดูแลง่ายขึ้น' },
    { t: '(ง) Preventive: วิเคราะห์จุดที่อาจเกิดปัญหาแล้วป้องกันไว้ก่อน' },
  ],
}), false);
