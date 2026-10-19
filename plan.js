// Chapter 1: project planning, PERT/CPM, crash
Hop.page(1);
const { el, $, $$, icon, clamp, lerp, easeIO, ease } = Hop;
const fmt = n => Number(n).toLocaleString('en-US');

/* ---------- data: slide CPM example (activity on node) ---------- */
const ACT = {
  A: { d: 7, nc: 3000, cd: 4, cc: 6000, p: [] },
  B: { d: 3, nc: 4000, cd: 2, cc: 5500, p: ['A'] },
  C: { d: 4, nc: 15000, cd: 2, cc: 20000, p: ['A'] },
  D: { d: 8, nc: 10000, cd: 5, cc: 19000, p: ['B', 'C'] },
  E: { d: 9, nc: 7000, cd: 6, cc: 9100, p: ['C'] },
};
for (const [k, a] of Object.entries(ACT)) { a.max = a.d - a.cd; a.cpd = (a.cc - a.nc) / a.max; }
const PATHS = [['A', 'B', 'D'], ['A', 'C', 'D'], ['A', 'C', 'E']];
const BASE_COST = Object.values(ACT).reduce((s, a) => s + a.nc, 0); // 39,000
const EDGES_AE = [['S', 'A'], ['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F']];
const LAY_AE = {
  wide: { h: 280, p: { S: [.05, .5], A: [.22, .5], B: [.46, .2], C: [.46, .8], D: [.72, .2], E: [.72, .8], F: [.94, .5] } },
  narrow: { h: 470, p: { S: [.5, .05], A: [.5, .22], B: [.22, .46], C: [.78, .46], D: [.22, .72], E: [.78, .72], F: [.5, .95] } },
};
const pathLen = (p, dur) => p.reduce((s, k) => s + dur[k], 0);

/* ---------- network figure (responsive: viewBox = real pixels) ---------- */
function netFig(host, spec) {
  const api = { n: {}, e: {}, narrow: false, svg: null };
  let lastW = 0;
  function build() {
    const W = Math.max(280, Math.round(host.clientWidth));
    if (Math.abs(W - lastW) < 2 && api.svg) return; lastW = W;
    const narrow = W < 560; api.narrow = narrow;
    const L = narrow ? spec.narrow : spec.wide, H = L.h;
    const P = id => [L.p[id][0] * W, L.p[id][1] * H];
    const nw = narrow ? 64 : 82, nh = narrow ? 54 : 58, r = narrow ? 22 : 24;
    const svg = el('svg', { class: 'net', viewBox: `0 0 ${W} ${H}`, role: 'img' });
    const gE = el('g'), gN = el('g'), gX = el('g');
    svg.append(gE, gN, gX);
    const isCirc = id => (spec.kind || (() => 'task'))(id) !== 'task';
    const trim = (id, dx, dy) => {
      const len = Math.hypot(dx, dy) || 1;
      if (isCirc(id)) return r / len;
      return Math.min((nw / 2) / Math.abs(dx || 1e-6), (nh / 2) / Math.abs(dy || 1e-6));
    };
    api.e = {};
    for (const [a, b] of spec.edges) {
      const [x1, y1] = P(a), [x2, y2] = P(b), dx = x2 - x1, dy = y2 - y1;
      const t1 = trim(a, dx, dy), t2 = trim(b, -dx, -dy);
      const sx = x1 + dx * t1, sy = y1 + dy * t1, ex = x2 - dx * (t2 + 0.0), ey = y2 - dy * (t2 + 0.0);
      const len = Math.hypot(ex - sx, ey - sy), ux = (ex - sx) / len, uy = (ey - sy) / len;
      const hx = ex - ux * 2, hy = ey - uy * 2, ah = 9, aw = 5.5;
      const g = el('g', { class: 'ed' + (spec.dummy && spec.dummy(a, b) ? ' dummy' : ''), 'data-k': spec.edgeKey || null });
      g.append(el('path', { d: `M${sx} ${sy} L${hx - ux * ah} ${hy - uy * ah}` }),
        el('polygon', { points: `${hx},${hy} ${hx - ux * ah - uy * aw},${hy - uy * ah + ux * aw} ${hx - ux * ah + uy * aw},${hy - uy * ah - ux * aw}` }));
      if (spec.edgeLabel) {
        const lab = spec.edgeLabel(a, b);
        if (lab != null) {
          const mx = (sx + ex) / 2, my = (sy + ey) / 2;
          const tw = String(lab).length * 9 + 10;
          g.append(el('rect', { class: 'elbg', x: mx - tw / 2, y: my - 11, width: tw, height: 22, rx: 8 }), el('text', { class: 'el', x: mx, y: my + 1, text: lab }));
        }
      }
      gE.append(g); api.e[a + '>' + b] = g;
    }
    api.n = {};
    for (const id of Object.keys(L.p)) {
      const [x, y] = P(id), kind = (spec.kind || (() => 'task'))(id);
      const g = el('g', { class: 'nd ' + (kind === 'task' ? '' : kind) + (spec.tap ? ' tap' : ''), transform: `translate(${x} ${y})`, 'data-k': spec.nodeKey ? spec.nodeKey(id) : null });
      if (kind === 'task') {
        g.append(el('rect', { x: -nw / 2, y: -nh / 2, width: nw, height: nh, rx: 14 }),
          el('text', { class: 'id', y: -9, text: id }), el('text', { class: 'du', y: 14, text: '' }), el('text', { class: 'sb', y: nh / 2 + 15, text: '' }));
      } else {
        g.append(el('circle', { class: 'b', r }), el('text', { class: 'id', y: 1, text: spec.capLabel ? spec.capLabel(id) : id }));
      }
      if (spec.tap) g.addEventListener('click', () => spec.tap(id));
      gN.append(g); api.n[id] = g;
    }
    api.overlay = gX; api.P = P; api.W = W; api.H = H; api.nw = nw; api.nh = nh;
    host.replaceChildren(svg); api.svg = svg;
    if (spec.after) spec.after(api);
  }
  api.set = (id, { du, sb } = {}) => { const g = api.n[id]; if (!g) return; if (du != null) $('.du', g).textContent = du; if (sb != null) $('.sb', g).textContent = sb; };
  api.cls = (sel, c, on) => { const g = sel.includes('>') ? api.e[sel] : api.n[sel]; if (g) g.classList.toggle(c, !!on); };
  api.clear = c => { $$('.' + c, api.svg).forEach(x => x.classList.remove(c)); };
  api.build = build;
  build();
  new ResizeObserver(() => build()).observe(host);
  return api;
}
const aeSpec = extra => Object.assign({ edges: EDGES_AE, wide: LAY_AE.wide, narrow: LAY_AE.narrow, kind: id => (id === 'S' || id === 'F') ? 'cap' : 'task', capLabel: id => id === 'S' ? 'เริ่ม' : 'จบ' }, extra);
const pathEdges = p => { const ids = ['S', ...p, 'F']; return ids.slice(1).map((b, i) => ids[i] + '>' + b); };

/* ---------- map hero ---------- */
{
  const host = $('#map');
  const crit = ['A', 'C', 'E'];
  const net = netFig(host, aeSpec({
    nodeKey: id => (id === 'S' || id === 'F') ? 'pert' : 'task', edgeKey: 'pred',
    after(api) {
      for (const k of Object.keys(ACT)) api.set(k, { du: ACT[k].d + ' วัน' });
      pathEdges(crit).forEach(e => api.cls(e, 'crit', 1)); crit.forEach(k => api.cls(k, 'crit', 1));
      // duration hotspot, slack badges, crash chip
      const badge = (id, txt, key, cls, dy) => {
        const [x, y] = api.P(id); const w = txt.length * 8 + 16;
        const g = el('g', { class: 'slk hot', 'data-k': key, transform: `translate(${x} ${y + dy})` });
        g.append(el('rect', { x: -w / 2, y: -13, width: w, height: 26, rx: 13, style: cls ? `fill:var(--c-${cls}-s)` : null }), el('text', { y: 1, text: txt, style: cls ? `fill:var(--c-${cls})` : null }));
        api.overlay.append(g);
      };
      const off = api.nh / 2 + 18;
      badge('B', 'slack 2', 'slack', null, -off); badge('D', 'slack 1', 'slack', null, -off);
      badge('E', '700/วัน', 'cpd', 'violet', off);
      const [ax, ay] = api.P('A'), [cx, cy] = api.P('C');
      const lab = el('g', { class: 'hot', 'data-k': 'critical', transform: `translate(${(ax + cx) / 2} ${(ay + cy) / 2})` });
      lab.append(el('rect', { x: -52, y: -13, width: 104, height: 26, rx: 13, style: 'fill:var(--c-rose-s)' }), el('text', { y: 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle', style: 'fill:var(--c-rose);font:600 13px var(--font)', text: 'เส้นทางวิกฤต' }));
      api.overlay.append(lab);
    },
  }));
}

/* ---------- 1.1 feasibility flow ---------- */
{
  const host = $('#fig-flow');
  const it = (k, t, c) => k ? el('button', { class: 'it', 'data-k': k, style: `--tc: var(--c-${c})`, html: `<i></i>${t}` }) : el('div', { class: 'it', style: `--tc: var(--c-${c})`, html: `<i></i>${t}` });
  const arrow = () => el('div', { class: 'ar', html: icon('arrow') });
  const flow = el('div', { class: 'flow' },
    el('div', { class: 'stage' }, el('h4', { text: 'Feasibility 3 ด้าน' }), it('feas-tech', 'Technical: ทำได้ทางเทคนิคไหม', 'blue'), it('feas-econ', 'Economic: คุ้มเงินไหม', 'green'), it('feas-sched', 'Schedule: ทันเวลาไหม', 'amber')),
    arrow(),
    el('div', { class: 'stage' }, el('h4', { text: 'ผ่านแล้วกำหนด' }), it('scope', 'ขอบเขต (project scope)', 'ink'), it(null, 'เป้าหมาย (project goal)', 'ink'), it(null, 'ปัญหาของระบบเดิม', 'ink'), it(null, 'ประมาณต้นทุน', 'ink'), it(null, 'ทรัพยากรที่ต้องใช้', 'ink')),
    arrow(),
    el('div', { class: 'stage' }, el('h4', { text: 'บริหารโครงการ 4 งาน' }), it('pm', 'Planning: วางแผนงาน', 'teal'), it('pm', 'Scheduling: จัดตารางเวลา', 'teal'), it('pm', 'Monitoring & controlling', 'teal'), it('pm', 'Reporting: รายงานความคืบหน้า', 'teal')));
  host.append(flow);
  Hop.onView(flow, () => flow.classList.add('on'));
}

/* ---------- 1.2 WBS tree ---------- */
{
  const host = $('#fig-wbs');
  const T = { 'สาธารณูปโภค': ['ไฟฟ้า', 'น้ำประปา'], 'วัสดุ': ['กระเบื้อง', 'หลังคา', 'ปูน'], 'ตกแต่ง': ['เฟอร์นิเจอร์', 'ผ้าม่าน', 'วอลเปเปอร์'] };
  const branch = (label, kids, open, root) => {
    const wrap = el('div', { class: open ? 'open' : '' });
    const btn = el('button', { class: 'nodeb' + (root ? ' root' : ''), html: `${icon('chev')}${label}`, onclick: () => wrap.classList.toggle('open') });
    wrap.append(el('div', { class: 'row' }, btn), el('div', { class: 'kids' }, el('div', {}, kids)));
    return wrap;
  };
  const lv1 = Object.entries(T).map(([k, v], i) => branch(k, v.map(x => el('div', {}, el('span', { class: 'leaf', text: x }))), i === 1));
  host.append(el('div', { class: 'wbs' }, branch('สร้างบ้าน', lv1, true, true)));
}

/* ---------- 1.3 Gantt <-> PERT morph ---------- */
{
  const host = $('#fig-morph');
  const svgHost = el('div');
  const seg = el('div', { class: 'seg' });
  const say = el('p', { class: 'say' });
  host.append(svgHost, el('div', { class: 'ctrls' }, seg), say);
  const ES = { A: 0, B: 7, C: 7, D: 11, E: 11 };
  let k = 0, target = 0, raf = 0, W = 0, parts = null;
  function build() {
    W = Math.max(280, Math.round(svgHost.clientWidth)); const narrow = W < 560;
    const H = narrow ? 330 : 290;
    const svg = el('svg', { class: 'net morph', viewBox: `0 0 ${W} ${H}` });
    const gA = el('g', { class: 'axis' }), gE = el('g'), gB = el('g');
    svg.append(gA, gE, gB);
    const left = 34, right = W - 14, top = 34, rowH = (H - top - 22) / 5, sc = (right - left) / 20;
    for (let d = 0; d <= 20; d += (narrow ? 5 : 2)) { const x = left + d * sc; gA.append(el('line', { x1: x, x2: x, y1: top - 8, y2: H - 18 }), el('text', { x, y: top - 16, text: d })); }
    const L = narrow ? LAY_AE.narrow : LAY_AE.wide, ph = narrow ? 300 : 260, py = narrow ? 14 : 14;
    const pert = id => [L.p[id][0] * W, py + L.p[id][1] * ph * (narrow ? 1 : 1)];
    // narrow pert layout for 5 nodes only (no S/F): squeeze vertically
    const pertN = { A: [.5, .08], B: [.22, .42], C: [.78, .42], D: [.22, .86], E: [.78, .86] };
    const nw = narrow ? 64 : 82, nh = narrow ? 50 : 56;
    parts = Object.keys(ACT).map((id, i) => {
      const g = el('g', { class: 'bar' }); const r = el('rect', { rx: 10 }); const t = el('text', { text: id }); const bd = el('text', { class: 'bd', text: ACT[id].d });
      g.append(r, t, bd); gB.append(g);
      const gx = left + ES[id] * sc, gw = ACT[id].d * sc, gy = top + i * rowH + 4, gh = rowH - 8;
      const [px, py2] = narrow ? [pertN[id][0] * W, 10 + pertN[id][1] * (H - 40)] : [L.p[id][0] * W, 20 + (L.p[id][1]) * (H - 50)];
      return { id, r, t, bd, g: { x: gx, y: gy, w: gw, h: gh }, p: { x: px - nw / 2, y: py2 - nh / 2, w: nw, h: nh } };
    });
    const edges = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['C', 'E']].map(([a, b]) => {
      const pa = parts.find(x => x.id === a).p, pb = parts.find(x => x.id === b).p;
      const x1 = pa.x + pa.w / 2, y1 = pa.y + pa.h / 2, x2 = pb.x + pb.w / 2, y2 = pb.y + pb.h / 2;
      const dx = x2 - x1, dy = y2 - y1, t1 = Math.min(pa.w / 2 / Math.abs(dx || 1e-6), pa.h / 2 / Math.abs(dy || 1e-6)), t2 = Math.min(pb.w / 2 / Math.abs(dx || 1e-6), pb.h / 2 / Math.abs(dy || 1e-6));
      const sx = x1 + dx * t1, sy = y1 + dy * t1, ex = x2 - dx * t2, ey = y2 - dy * t2, len = Math.hypot(ex - sx, ey - sy), ux = (ex - sx) / len, uy = (ey - sy) / len;
      const g = el('g', { class: 'ed' }); g.append(el('path', { d: `M${sx} ${sy} L${ex - ux * 9} ${ey - uy * 9}` }), el('polygon', { points: `${ex},${ey} ${ex - ux * 9 - uy * 5.5},${ey - uy * 9 + ux * 5.5} ${ex - ux * 9 + uy * 5.5},${ey - uy * 9 - ux * 5.5}` }));
      gE.append(g); return g;
    });
    parts.axis = gA; parts.edges = edges;
    svgHost.replaceChildren(svg); draw();
  }
  function draw() {
    const e = easeIO(k);
    for (const p of parts) {
      const x = lerp(p.g.x, p.p.x, e), y = lerp(p.g.y, p.p.y, e), w = lerp(p.g.w, p.p.w, e), h = lerp(p.g.h, p.p.h, e);
      p.r.setAttribute('x', x); p.r.setAttribute('y', y); p.r.setAttribute('width', w); p.r.setAttribute('height', h);
      const inBar = w > 44;
      p.t.setAttribute('x', x + w / 2 - (1 - e) * (inBar ? 12 : 0)); p.t.setAttribute('y', y + h / 2 - e * 9);
      p.bd.setAttribute('x', x + w / 2 + (1 - e) * (inBar ? 14 : 0)); p.bd.setAttribute('y', y + h / 2 + e * 13);
    }
    parts.axis.style.opacity = 1 - e; parts.edges.forEach(g => g.style.opacity = clamp((e - .55) / .45, 0, 1));
  }
  function go(to) {
    target = to; cancelAnimationFrame(raf); const from = k, t0 = performance.now();
    $$('button', seg).forEach((b, i) => b.setAttribute('aria-pressed', String(i === to)));
    say.innerHTML = to ? 'PERT: กล่องคืองาน ลูกศรคือ "ต้องรอ" เช่น D มีลูกศรเข้า 2 เส้นจาก B และ C จึงต้องรอทั้งคู่ ความยาวกล่องไม่สื่อเวลาอีกต่อไป เวลาเขียนเป็นตัวเลขในกล่องแทน'
      : 'Gantt: แกนนอนคือวัน แถบเริ่มที่วันที่งานเริ่มได้ ความยาวแถบ = ระยะเวลา เห็นว่า B กับ C ทำพร้อมกันได้ แต่ไม่เห็นว่า D รอใคร';
    const step = now => { const t = clamp((now - t0) / 900, 0, 1); k = lerp(from, to, t); draw(); if (t < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  seg.append(el('button', { text: 'Gantt chart', onclick: () => go(0) }), el('button', { text: 'PERT chart', onclick: () => go(1) }));
  build(); go(0);
  let lw = 0; new ResizeObserver(() => { const w = Math.round(svgHost.clientWidth); if (Math.abs(w - lw) > 2) { lw = w; build(); } }).observe(svgHost);
  Hop.onView(host, () => setTimeout(() => go(1), 900), .6);
}

/* ---------- 1.4 forward pass (11-task sheet example) ---------- */
Hop.eq($('#eq-ef'), [['es', 'ES'], ' = max(', ['ef', 'EF'], ' ของงานก่อนหน้า)   ', ['ef', 'EF'], ' = ', ['es', 'ES'], ' + ', ['dur', 't']]);
{
  const host = $('#fig-forward');
  const TK = [
    [1, 'วางแผน', 1, []], [2, 'กำหนดงานต่างๆ', 4, [1]], [3, 'จัดซื้ออุปกรณ์', 17, [1]], [4, 'เขียนโปรแกรม', 70, [2]], [5, 'ติดตั้งอุปกรณ์', 10, [3]],
    [6, 'ทดสอบโปรแกรม', 30, [4]], [7, 'เขียนคู่มือ', 25, [5]], [8, 'เปลี่ยนรูปแบบไฟล์', 20, [5]], [9, 'ทดสอบระบบ', 25, [6]], [10, 'อบรมการใช้งาน', 20, [7, 8]], [11, 'ทดสอบโดยผู้ใช้จริง', 25, [9, 10]],
  ];
  const ES = {}, EF = {};
  TK.forEach(([id, , d, p]) => { ES[id] = p.length ? Math.max(...p.map(x => EF[x])) : 0; EF[id] = ES[id] + d; });
  const CRIT = [1, 2, 4, 6, 9, 11];
  const tb = el('table', { class: 't' });
  tb.innerHTML = `<thead><tr><th>งาน</th><th class="nm" style="text-align:left">ชื่อ</th><th>t</th><th>ก่อนหน้า</th><th>ES</th><th>EF</th></tr></thead>`;
  const body = el('tbody'); tb.append(body);
  const rows = TK.map(([id, n, d, p]) => {
    const tr = el('tr', {}, el('td', { text: id }), el('td', { class: 'nm', style: 'text-align:left;font-family:var(--font)', text: n }), el('td', { class: 'a', text: d }), el('td', { class: 'mut', text: p.length ? p.join(', ') : '−' }), el('td', { class: 't2 hide', text: ES[id] }), el('td', { class: 't2 hide', text: EF[id] }));
    body.append(tr); return tr;
  });
  host.append(el('div', { class: 'tw' }, tb));
  const stops = [{ label: 'ตารางจากชีท: แต่ละงานมีระยะเวลา (t) และงานก่อนหน้า ยังไม่รู้ว่าเริ่มวันไหน' }];
  TK.forEach(([id, , d, p]) => {
    let why;
    if (!p.length) why = `งาน ${id} ไม่มีงานก่อนหน้า เริ่มวันที่ <b class="t">0</b> เสร็จ 0 + ${d} = <b class="t">${EF[id]}</b>`;
    else if (p.length === 1) why = `งาน ${id} รองาน ${p[0]} ที่เสร็จวันที่ ${EF[p[0]]} จึงเริ่ม <b class="t">${ES[id]}</b> เสร็จ ${ES[id]} + ${d} = <b class="t">${EF[id]}</b>`;
    else why = `งาน ${id} รอ ${p.map(x => `งาน ${x} (เสร็จ ${EF[x]})`).join(' และ ')} ต้องรอตัวที่ช้ากว่า เริ่ม max(${p.map(x => EF[x]).join(', ')}) = <b class="t">${ES[id]}</b> เสร็จ <b class="t">${EF[id]}</b>`;
    stops.push({ label: why, id, p });
  });
  stops.push({ label: `งานสุดท้ายเสร็จวันที่ <b class="r">155</b> = เวลาทั้งโครงการ ย้อนดูว่าตัวเลขนี้มาจากงานไหน: 1 → 2 → 4 → 6 → 9 → 11 = 1 + 4 + 70 + 30 + 25 + 25 = 155 คือ<b class="r">เส้นทางวิกฤต</b>`, crit: true });
  const say = el('p', { class: 'say' });
  host.append(say);
  let last = -1;
  Hop.scrub(host, {
    stops: stops.map(s => ({ label: '' })), speed: 1300,
    onFrame(t) {
      const i = Math.round(t); if (i === last) return; last = i;
      rows.forEach((tr, r) => {
        const shown = r < i; $$('td', tr).slice(4).forEach(td => { const was = td.classList.contains('hide'); td.classList.toggle('hide', !shown); if (was && shown && r === i - 1) td.classList.add('new'); else td.classList.remove('new'); });
        tr.classList.remove('used', 'cur', 'crit');
      });
      const s = stops[Math.min(i, stops.length - 1)];
      if (s.id) { rows[s.id - 1].classList.add('cur'); s.p.forEach(x => rows[x - 1].classList.add('used')); }
      if (s.crit) CRIT.forEach(x => rows[x - 1].classList.add('crit', 'used'));
      say.innerHTML = s.label;
    },
  });
}
Hop.mcq($('#q-dep'), {
  q: 'งาน D มีงานก่อนหน้าคือ B (เสร็จวันที่ 10) และ C (เสร็จวันที่ 11) D ยาว 8 วัน D เสร็จวันที่เท่าไหร่',
  opts: ['18', '19', '29', '21'], a: 1,
  why: 'D เริ่มได้เมื่อทั้ง B และ C เสร็จ จึงเริ่มวันที่ max(10, 11) = 11 แล้วเสร็จ 11 + 8 = 19',
  whyWrong: { 0: 'ได้ 18 แปลว่าเริ่มตาม B (10) แต่ตอนนั้น C ยังไม่เสร็จ D เริ่มไม่ได้', 2: 'ไม่ต้องบวกเวลาของ B และ C ซ้อนกัน B กับ C ทำพร้อมกันอยู่แล้ว', 3: 'ไม่มีที่มา ลองใช้ ES = max(EF ของงานก่อนหน้า)' },
});

/* ---------- 1.5 paths, critical path, slack ---------- */
{
  const host = $('#fig-paths');
  const D = Object.fromEntries(Object.entries(ACT).map(([k, a]) => [k, a.d]));
  const lens = PATHS.map(p => pathLen(p, D)), cl = Math.max(...lens);
  const slack = k => cl - Math.max(...PATHS.filter(p => p.includes(k)).map(p => pathLen(p, D)));
  const netHost = el('div'); host.append(netHost);
  let net = null, sel = 2;
  netFig(netHost, aeSpec({ nodeKey: id => (id === 'S' || id === 'F') ? null : 'task', after(api) { net = api; for (const k of Object.keys(ACT)) api.set(k, { du: ACT[k].d + ' วัน' }); paint(); } }));
  const chips = el('div', { class: 'chips' }); const say = el('p', { class: 'say' });
  host.append(chips, say);
  function paint() {
    if (!net || !net.svg) return;
    net.clear('hl'); net.clear('crit'); net.clear('dim');
    const crit = PATHS[lens.indexOf(cl)];
    if (sel == null) return;
    const p = PATHS[sel], isC = lens[sel] === cl;
    for (const k of Object.keys(ACT)) { const on = p.includes(k); net.cls(k, isC ? 'crit' : 'hl', on); net.cls(k, 'dim', !on); net.set(k, { sb: on || sel == null ? '' : '' }); }
    Object.keys(net.e).forEach(e => net.cls(e, 'dim', !pathEdges(p).includes(e)));
    pathEdges(p).forEach(e => net.cls(e, isC ? 'crit' : 'hl', 1));
    for (const k of Object.keys(ACT)) net.set(k, { sb: `slack ${slack(k)}` });
  }
  PATHS.forEach((p, i) => {
    const b = el('button', { class: 'pchip' + (lens[i] === cl ? ' crit' : ''), 'aria-pressed': String(i === sel), html: `${p.join('')} <b>${lens[i]}</b>` });
    b.onclick = () => { sel = i; $$('.pchip', chips).forEach((x, j) => x.setAttribute('aria-pressed', String(j === i))); paint(); talk(); };
    chips.append(b);
  });
  function talk() {
    const p = PATHS[sel], L = lens[sel];
    say.innerHTML = `${p.join(' → ')} = ${p.map(k => D[k]).join(' + ')} = <b class="${L === cl ? 'r' : 'b'}">${L} วัน</b> ` + (L === cl ? 'ยาวที่สุดจึงเป็น<b class="r">เส้นทางวิกฤต</b> งาน A, C, E มี slack 0 ช้าแม้วันเดียวโครงการช้าตาม'
      : `สั้นกว่าเส้นวิกฤต ${cl} − ${L} = <b class="g">${cl - L} วัน</b> ` + (p.includes('B') ? 'B อยู่บนเส้นนี้เท่านั้น จึงมี slack 2' : 'D อยู่บน ABD (18) และ ACD (19) ใช้เส้นที่ยาวกว่าคือ 19 จึงมี slack 20 − 19 = 1'));
  }
  paint(); talk();
}
Hop.eq($('#eq-slack'), [['slack', 'Slack'], ' = ', ['critical', 'ความยาวเส้นวิกฤต'], ' − ', ['path', 'เส้นที่ยาวสุดที่ผ่านงานนั้น']]);
Hop.mcq($('#q-crit'), {
  q: 'มี 3 เส้นทาง: ABD = 18, ACD = 19, ACE = 20 ข้อใดถูก',
  opts: ['เส้นทางวิกฤตคือ ABD เพราะใช้เวลาน้อยสุด', 'โครงการใช้เวลา 20 วัน และ slack ของ D = 1', 'slack ของ D = 2 เพราะ 20 − 18', 'โครงการใช้เวลา 18 + 19 + 20 = 57 วัน'], a: 1,
  why: 'โครงการเสร็จเมื่อทุกเส้นเสร็จ จึงเท่ากับเส้นที่ยาวสุด = 20 D อยู่ทั้ง ABD และ ACD ใช้เส้นที่ยาวกว่า (19) slack = 20 − 19 = 1',
  whyWrong: { 0: 'เส้นวิกฤตคือเส้นที่ยาวที่สุด ไม่ใช่สั้นที่สุด เส้นสั้นยังมีเวลาเหลือ', 2: 'D อยู่บน ACD (19) ด้วย ถ้า D ช้า 2 วัน ACD จะกลายเป็น 21 เกิน 20 ต้องใช้เส้นที่ยาวที่สุดที่ผ่าน D', 3: 'เส้นทางทำขนานกัน ไม่ได้ต่อกัน ห้ามบวกทุกเส้น' },
});

/* ---------- 1.6 crash cost per day ---------- */
Hop.eq($('#eq-cpd'), [['cpd', 'cost/วัน'], ' = (', ['crashpt', 'Crash cost'], ' − ', ['normal', 'Normal cost'], ') ÷ (', ['normal', 'Normal t'], ' − ', ['crashpt', 'Crash t'], ')']);
Hop.eq($('#eq-max'), [['maxcrash', 'ลดได้สูงสุด'], ' = ', ['normal', 'Normal t'], ' − ', ['crashpt', 'Crash t']], { legend: false });
{
  const host = $('#fig-cpd');
  const tb = el('table', { class: 't' });
  tb.innerHTML = `<thead><tr><th>งาน</th><th>ก่อนหน้า</th><th>Normal t</th><th>Normal cost</th><th>Crash t</th><th>Crash cost</th><th>ลดได้</th><th>cost/วัน</th></tr></thead>`;
  const body = el('tbody'); tb.append(body);
  const say = el('p', { class: 'say' });
  const rows = Object.entries(ACT).map(([k, a]) => {
    const tr = el('tr', { class: 'tap' }, el('td', { text: k }), el('td', { class: 'mut', text: a.p.join(', ') || 'none' }), el('td', { text: a.d }), el('td', { text: fmt(a.nc) }), el('td', { text: a.cd }), el('td', { text: fmt(a.cc) }), el('td', { class: 'a', text: a.max }), el('td', { class: 'v', text: fmt(a.cpd) }));
    tr.onclick = () => pick(k); body.append(tr); return [k, tr];
  });
  const tot = el('tr', { class: 'total' }, el('td', { text: 'รวม' }), el('td'), el('td'), el('td', { text: fmt(BASE_COST) }), el('td'), el('td'), el('td'), el('td'));
  body.append(tot);
  function pick(k) {
    const a = ACT[k]; rows.forEach(([kk, tr]) => tr.classList.toggle('on', kk === k));
    say.innerHTML = `${k}: ลดได้ ${a.d} − ${a.cd} = <b class="a">${a.max} วัน</b>, จ่ายเพิ่ม ${fmt(a.cc)} − ${fmt(a.nc)} = ${fmt(a.cc - a.nc)} บาท เฉลี่ย ${fmt(a.cc - a.nc)} ÷ ${a.max} = <b class="p">${fmt(a.cpd)} บาท/วัน</b>` + (k === 'E' ? ' ถูกที่สุดในตาราง' : k === 'B' ? ' แต่ B ไม่อยู่บนเส้นวิกฤต ลดไปก็ไม่ช่วยตอนเริ่มต้น' : '');
  }
  host.append(el('div', { class: 'tw' }, tb), say);
  pick('A');
}

/* ---------- 1.7a sandbox ---------- */
{
  const host = $('#fig-sandbox');
  const netHost = el('div'); host.append(netHost);
  const bars = el('div', { class: 'bars' });
  const stats = el('div', { class: 'stats' });
  const say = el('p', { class: 'say sbx-say' });
  const undo = el('button', { class: 'btn small', html: `${icon('back')} ย้อน` });
  const reset = el('button', { class: 'btn small ghost', html: `${icon('replay')} เริ่มใหม่` });
  host.append(bars, stats, say, el('div', { class: 'ctrls' }, undo, reset));
  let dur, cost, hist = [];
  const init = () => { dur = Object.fromEntries(Object.entries(ACT).map(([k, a]) => [k, a.d])); cost = BASE_COST; hist = []; };
  init();
  const proj = () => Math.max(...PATHS.map(p => pathLen(p, dur)));
  let net = null;
  const barEls = [];
  PATHS.forEach(p => { const fl = el('div', { class: 'fl' }); const n = el('span', { class: 'n' }); const row = el('div', { class: 'pbar' }, el('span', { text: p.join('') }), el('div', { class: 'tr' }, fl), n); bars.append(row); barEls.push({ row, fl, n, p }); });
  const stP = el('div', { class: 'v r' }), stC = el('div', { class: 'v p' });
  stats.append(el('div', { class: 'stat' }, el('div', { class: 'k', text: 'โครงการใช้เวลา' }), stP), el('div', { class: 'stat' }, el('div', { class: 'k', text: 'ต้นทุนรวม' }), stC));
  function paint() {
    if (!net || !net.svg) return;
    const P = proj(); net.clear('crit');
    for (const k of Object.keys(ACT)) { const left = ACT[k].max - (ACT[k].d - dur[k]); net.set(k, { du: dur[k] + ' วัน', sb: left ? `ลดได้อีก ${left}` : 'ลดไม่ได้แล้ว' }); net.cls(k, 'done', !left); }
    PATHS.forEach(p => { if (pathLen(p, dur) === P) { p.forEach(k => net.cls(k, 'crit', 1)); pathEdges(p).forEach(e => net.cls(e, 'crit', 1)); } });
    barEls.forEach(b => { const L = pathLen(b.p, dur); b.fl.style.width = (L / 20 * 100) + '%'; b.n.textContent = L; b.row.classList.toggle('crit', L === P); });
    stP.innerHTML = `${P} <small>วัน</small>`; stC.innerHTML = `${fmt(cost)} <small>บาท</small>`;
    undo.disabled = !hist.length;
  }
  function crash(k) {
    const a = ACT[k];
    if (a.d - dur[k] >= a.max) { say.innerHTML = `${k} ลดครบ ${a.max} วันแล้ว (Normal ${a.d} − Crash ${a.cd})`; return; }
    const before = proj();
    hist.push({ k }); dur[k]--; cost += a.cpd;
    const after = proj();
    const g = net.n[k]; g.classList.remove('pop'); void g.getBBox(); g.classList.add('pop');
    paint();
    const crits = PATHS.filter(p => pathLen(p, dur) === after).map(p => p.join(''));
    say.innerHTML = after < before
      ? `ลด ${k} 1 วัน จ่าย <b class="p">${fmt(a.cpd)}</b> โครงการสั้นลงเหลือ <b class="r">${after} วัน</b> เส้นวิกฤตตอนนี้: ${crits.join(', ')}`
      : `ลด ${k} 1 วัน จ่าย <b class="p">${fmt(a.cpd)}</b> แต่โครงการยัง <b class="r">${after} วัน</b> เพราะ ${crits.filter(c => !c.includes(k)).join(', ') || crits.join(', ')} ยังยาวเท่าเดิม ` + (crits.length > 1 ? 'ต้องลดให้ครบทุกเส้นวิกฤต' : 'งานนี้ไม่อยู่บนเส้นวิกฤต');
  }
  netFig(netHost, aeSpec({ tap: id => crash(id), after(api) { net = api; paint(); } }));
  undo.onclick = () => { const h = hist.pop(); if (!h) return; dur[h.k]++; cost -= ACT[h.k].cpd; paint(); say.innerHTML = `ย้อนการลด ${h.k}`; };
  reset.onclick = () => { init(); paint(); say.innerHTML = 'เริ่มใหม่: 20 วัน 39,000 บาท แตะงานเพื่อลด 1 วัน'; };
  say.innerHTML = 'แตะงานเพื่อลด 1 วัน เป้าหมาย: ให้โครงการสั้นลงโดยจ่ายน้อยที่สุด';
  paint();
}

/* ---------- 1.7b teacher's plan ---------- */
{
  const host = $('#fig-teacher');
  const STEPS = [
    { c: {}, t: 'เริ่มต้น', say: 'ต้นทุนรวม = normal cost ทุกงาน 3,000 + 4,000 + 15,000 + 10,000 + 7,000 = <b class="p">39,000</b> เส้นวิกฤตคือ ACE = 20' },
    { c: { E: 1 }, t: 'Crash E by 1', say: 'บน ACE งานที่ถูกสุดคือ E (700) ลด E แค่ 1 วัน เพราะถ้าลดมากกว่านี้ ACD (19) จะกลายเป็นเส้นวิกฤตแทน ได้ ACE = 19 = ACD ต้นทุน 39,000 + 700 = <b class="p">39,700</b>' },
    { c: { A: 3 }, t: 'Crash A by 3', say: 'ตอนนี้วิกฤต 2 เส้น (ACD, ACE) A อยู่ในทุกเส้นและถูก (1,000) ลด A ครบ 3 วัน ทุกเส้นลด 3 ต้นทุน 39,700 + 3 × 1,000 = <b class="p">42,700</b>' },
    { c: { C: 1 }, t: 'Crash C by 1', say: 'A หมดแล้ว C อยู่ทั้ง ACD และ ACE (2,500) ลด 1 วันจนทุกเส้นเท่ากัน 15 ต้นทุน 42,700 + 2,500 = <b class="p">45,200</b>' },
    { c: { B: 1 }, t: 'Crash B by 1', say: 'ทั้ง 3 เส้นวิกฤต ต้องลดให้ครบทุกเส้น ลด B ก่อน (1,500) ABD = 14 แต่ ACD, ACE ยัง 15 โครงการยัง 15 ต้นทุน <b class="p">46,700</b>' },
    { c: { C: 1 }, t: 'Crash C by 1', say: 'ลด C อีก 1 (2,500) ACD, ACE เหลือ 14 ครบทุกเส้น โครงการ = 14 ต้นทุน 46,700 + 2,500 = <b class="p">49,200</b> (C ลดครบ 2 วันแล้ว)' },
    { c: { D: 1 }, t: 'Crash D by 1', say: 'ลด D (3,000) ABD, ACD เหลือ 13 แต่ ACE ยัง 14 ต้นทุน 49,200 + 3,000 = <b class="p">52,200</b> (ชีทพิมพ์ 49,200 ซึ่งตกการบวก)' },
    { c: { E: 1 }, t: 'Crash E by 1', say: 'ลด E อีก 1 (700) ACE เหลือ 13 ทุกเส้น 13 วัน สรุป: เหลือ <b class="r">13 วัน</b> ใช้เงินรวม <b class="p">52,900</b> เพิ่มขึ้น 52,900 − 39,000 = <b class="p">13,900 บาท</b>' },
  ];
  // precompute snapshots
  const snaps = []; { const d = Object.fromEntries(Object.entries(ACT).map(([k, a]) => [k, a.d])); let cost = BASE_COST; for (const s of STEPS) { for (const [k, v] of Object.entries(s.c)) { d[k] -= v; cost += v * ACT[k].cpd; } snaps.push({ d: { ...d }, cost, P: Math.max(...PATHS.map(p => pathLen(p, d))) }); } }
  const tb = el('table', { class: 't' });
  const hr = el('tr', {}, el('th', { text: 'เส้นทาง' }), STEPS.map((s, i) => el('th', { class: i ? 'hide' : '', html: i ? s.t.replace('Crash ', 'Crash<br>') : 'เวลาเดิม' })));
  tb.append(el('thead', {}, hr));
  const body = el('tbody'); tb.append(body);
  const cells = PATHS.map(p => { const tr = el('tr', {}, el('td', { text: p.join('') })); const cs = STEPS.map((s, i) => { const td = el('td', { class: i ? 'hide' : '' }); tr.append(td); return td; }); body.append(tr); return cs; });
  const ctr = el('tr', { class: 'total' }, el('td', { text: 'ต้นทุนรวม' })); const ccs = STEPS.map((s, i) => { const td = el('td', { class: 'v' + (i ? ' hide' : '') }); ctr.append(td); return td; }); body.append(ctr);
  snaps.forEach((s, i) => { PATHS.forEach((p, r) => { const L = pathLen(p, s.d); cells[r][i].innerHTML = L === s.P ? `<span class="c">${L}*</span>` : (i === 0 && r === 0 ? '7+3+8=18' : L); }); ccs[i].textContent = fmt(s.cost); });
  cells[0][0].textContent = '7+3+8 = 18'; cells[1][0].textContent = '7+4+8 = 19';
  cells[2][0].innerHTML = '<span class="c">7+4+9 = 20*</span>';
  const bars = el('div', { class: 'bars' });
  const barEls = PATHS.map(p => { const fl = el('div', { class: 'fl' }); const n = el('span', { class: 'n' }); const row = el('div', { class: 'pbar' }, el('span', { text: p.join('') }), el('div', { class: 'tr' }, fl), n); bars.append(row); return { row, fl, n, p }; });
  const say = el('p', { class: 'say' });
  host.append(bars, say, el('div', { class: 'tw', style: 'margin-top:14px' }, tb));
  const ths = $$('th', hr).slice(1);
  let last = -1;
  Hop.scrub(host, {
    stops: STEPS.map(() => ({ label: '' })), speed: 1500,
    onFrame(t) {
      const i = Math.floor(t + 1e-6), f = t - i, a = snaps[i], b = snaps[Math.min(i + 1, snaps.length - 1)];
      barEls.forEach(x => { const La = pathLen(x.p, a.d), Lb = pathLen(x.p, b.d), L = lerp(La, Lb, f); x.fl.style.transition = 'none'; x.fl.style.width = (L / 20 * 100) + '%'; x.n.textContent = Math.round(L); x.row.classList.toggle('crit', Math.round(L) === Math.round(lerp(a.P, b.P, f))); });
      const show = Math.round(t); if (show === last) return; last = show;
      ths.forEach((th, j) => th.classList.toggle('hide', j > show));
      cells.forEach(cs => cs.forEach((td, j) => td.classList.toggle('hide', j > show)));
      ccs.forEach((td, j) => td.classList.toggle('hide', j > show));
      say.innerHTML = `<b>${STEPS[show].t}</b>: ${STEPS[show].say}`;
    },
  });
}

/* ---------- 1.8 HW04 activity on arrow ---------- */
{
  const H4 = [
    ['1>2', 12, 3000, 7, 5000], ['2>3', 8, 2000, 5, 3500], ['2>4', 4, 4000, 3, 7000], ['3>4', 0, 0, 0, 0],
    ['4>5', 4, 500, 1, 1100], ['4>6', 12, 50000, 9, 71000], ['5>6', 4, 500, 1, 1100], ['6>7', 4, 15000, 3, 22000],
  ].map(([k, d, nc, cd, cc]) => ({ k, d, nc, cd, cc, max: d - cd, cpw: d - cd ? (cc - nc) / (d - cd) : 0 }));
  const HP = [['1>2', '2>3', '3>4', '4>5', '5>6', '6>7'], ['1>2', '2>3', '3>4', '4>6', '6>7'], ['1>2', '2>4', '4>5', '5>6', '6>7'], ['1>2', '2>4', '4>6', '6>7']];
  const pname = p => [p[0].split('>')[0], ...p.map(e => e.split('>')[1])].join('-');
  const STEPS = [{ c: {}, t: 'เวลาเดิม' }, { c: { '1>2': 5 }, t: 'Crash 1→2 by 5' }, { c: { '2>3': 3 }, t: 'Crash 2→3 by 3' }, { c: { '6>7': 1 }, t: 'Crash 6→7 by 1' }, { c: { '4>6': 3 }, t: 'Crash 4→6 by 3' }];
  const SAY = [
    'เส้นทางทั้งหมด 4 เส้น เส้นที่ยาวที่สุดคือ 1-2-3-4-6-7 = 12 + 8 + 0 + 12 + 4 = <b class="r">36 สัปดาห์</b> ต้นทุนปกติรวม <b class="p">75,000</b>',
    'บนเส้นวิกฤต งานที่ถูกสุดคือ 1→2 (400/สัปดาห์) ลดได้ 12 − 7 = 5 และอยู่ในทุกเส้น ทุกเส้นลด 5 ต้นทุน 75,000 + 5 × 400 = <b class="p">77,000</b>',
    'ถัดมาคือ 2→3 (500) ลดครบ 3 เส้นวิกฤตเหลือ 28 ต้นทุน 77,000 + 3 × 500 = <b class="p">78,500</b>',
    'เหลือ 4→6 และ 6→7 ราคาเท่ากัน (7,000) เลือก 6→7 ก่อนเพราะอยู่ในทุกเส้น ลดได้ 1 ต้นทุน 78,500 + 7,000 = <b class="p">85,500</b>',
    'ลด 4→6 ครบ 3 เส้นวิกฤตเหลือ <b class="r">24 สัปดาห์</b> ต้นทุน 85,500 + 3 × 7,000 = <b class="p">106,500</b> งานบนเส้นวิกฤตลดครบหมดแล้ว หยุด',
  ];
  const snaps = []; { const d = Object.fromEntries(H4.map(a => [a.k, a.d])); let cost = H4.reduce((s, a) => s + a.nc, 0); for (const s of STEPS) { for (const [k, v] of Object.entries(s.c)) { d[k] -= v; cost += v * H4.find(a => a.k === k).cpw; } snaps.push({ d: { ...d }, cost, P: Math.max(...HP.map(p => p.reduce((x, e) => x + d[e], 0))) }); } }
  const host = $('#fig-hw');
  const netHost = el('div'); host.append(netHost);
  let cur = snaps[0];
  const net = netFig(netHost, {
    edges: H4.map(a => a.k.split('>')), kind: () => 'ev', dummy: (a, b) => a === '3' && b === '4',
    edgeLabel: (a, b) => cur.d[a + '>' + b],
    wide: { h: 300, p: { 1: [.05, .55], 2: [.24, .55], 3: [.42, .16], 4: [.55, .6], 5: [.72, .9], 6: [.8, .42], 7: [.96, .42] } },
    narrow: { h: 520, p: { 1: [.5, .04], 2: [.5, .2], 3: [.16, .36], 4: [.6, .48], 5: [.88, .67], 6: [.42, .8], 7: [.42, .96] } },
  });
  const say = el('p', { class: 'say' });
  const tb = el('table', { class: 't' });
  const hr = el('tr', {}, el('th', { text: 'เส้นทาง' }), STEPS.map((s, i) => el('th', { html: i ? s.t.replace('Crash ', 'Crash<br>') : s.t })));
  tb.append(el('thead', {}, hr)); const body = el('tbody'); tb.append(body);
  const cells = HP.map(p => { const tr = el('tr', {}, el('td', { text: pname(p) })); const cs = STEPS.map(() => { const td = el('td'); tr.append(td); return td; }); body.append(tr); return cs; });
  const ctr = el('tr', { class: 'total' }, el('td', { text: 'ต้นทุนรวม' })); const ccs = STEPS.map(() => { const td = el('td', { class: 'v' }); ctr.append(td); return td; }); body.append(ctr);
  snaps.forEach((s, i) => { HP.forEach((p, r) => { const L = p.reduce((x, e) => x + s.d[e], 0); cells[r][i].innerHTML = L === s.P ? `<span class="c">${L}*</span>` : L; }); ccs[i].textContent = fmt(s.cost); });
  host.append(say, el('div', { class: 'tw', style: 'margin-top:12px' }, tb));
  const ths = $$('th', hr).slice(1); let last = -1;
  Hop.scrub(host, {
    stops: STEPS.map(() => ({ label: '' })), speed: 1500,
    onFrame(t) {
      const show = Math.round(t); if (show === last) return; last = show; cur = snaps[show];
      net.svg && $$('.ed', net.svg).forEach(g => g.classList.remove('crit'));
      for (const a of H4) { const g = net.e[a.k]; if (g) { const tx = $('.el', g); if (tx) tx.textContent = cur.d[a.k]; } }
      HP.forEach(p => { if (p.reduce((x, e) => x + cur.d[e], 0) === cur.P) p.forEach(e => net.cls(e, 'crit', 1)); });
      ths.forEach((th, j) => th.classList.toggle('hide', j > show));
      cells.forEach(cs => cs.forEach((td, j) => td.classList.toggle('hide', j > show))); ccs.forEach((td, j) => td.classList.toggle('hide', j > show));
      say.innerHTML = `<b>${STEPS[show].t}</b>: ${SAY[show]}`;
    },
  });
  // written answer
  const wh = $('#work-hw');
  const btn = el('button', { class: 'btn', html: `${icon('eye')} ดูวิธีเขียนตอบทั้งข้อ` });
  wh.append(btn);
  btn.onclick = () => Hop.work(wh, [
    { t: '1) ต้นทุนอัดฉีดต่อสัปดาห์ = (Crash cost − Normal cost) ÷ (Normal − Crash)', note: true },
    ...H4.filter(a => a.max).map(a => ({ t: `   ${a.k.replace('>', '→')}: (${fmt(a.cc)} − ${fmt(a.nc)}) ÷ (${a.d} − ${a.cd}) = ${fmt(a.cpw)} บาท/สัปดาห์, ลดได้สูงสุด ${a.max} ครั้ง` })),
    { t: '   3→4 เป็น dummy (0 สัปดาห์) ไม่มีต้นทุน ลดไม่ได้', note: true },
    { t: '2) วาด PERT ตามคอลัมน์ Prior task (รูปด้านบน)', note: true },
    { t: '3) เส้นทางทั้งหมด', note: true },
    { t: '   1-2-3-4-5-6-7 = 12 + 8 + 0 + 4 + 4 + 4 = 32' }, { t: '   1-2-3-4-6-7   = 12 + 8 + 0 + 12 + 4  = 36 *  เส้นทางวิกฤต' },
    { t: '   1-2-4-5-6-7   = 12 + 4 + 4 + 4 + 4   = 28' }, { t: '   1-2-4-6-7     = 12 + 4 + 12 + 4      = 32' },
    { t: '4) อัดฉีดงานบนเส้นวิกฤต เริ่มจากต้นทุนต่อสัปดาห์ถูกสุด', note: true },
    { t: '   ต้นทุนเดิม = 3,000 + 2,000 + 4,000 + 500 + 50,000 + 500 + 15,000 = 75,000' },
    { t: '   Crash 1→2 by 5: 75,000 + 5 × 400   = 77,000   (36 → 31)' },
    { t: '   Crash 2→3 by 3: 77,000 + 3 × 500   = 78,500   (31 → 28)' },
    { t: '   Crash 6→7 by 1: 78,500 + 1 × 7,000 = 85,500   (28 → 27)' },
    { t: '   Crash 4→6 by 3: 85,500 + 3 × 7,000 = 106,500  (27 → 24)' },
    { t: '   สรุป: ลดจาก 36 เหลือ 24 สัปดาห์ (ลด 12) ใช้เงินเพิ่ม 106,500 − 75,000 = 31,500 บาท' },
  ]);
}
