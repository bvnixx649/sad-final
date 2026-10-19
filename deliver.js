// Chapter 5 figures: delivering the system
(() => {
  const { $, $$, el, esc, clamp, lerp, ease, easeIO, icon } = Hop;
  Hop.page(5);

  const col = k => (Hop.C[k] && Hop.C[k].c) || 'ink';
  const style = k => `--tc:var(--c-${col(k)});--tcs:var(--c-${col(k)}-s)`;
  const chip = (k, label) => el('button', { class: 'chip', 'data-k': k, style: style(k), html: `<i></i>${label || esc(Hop.C[k].t)}` });
  const fmt = n => Number(n).toLocaleString('en-US');
  function swap(node, fn, ms = 150) { node.classList.add('fx-out'); setTimeout(() => { fn(); node.classList.remove('fx-out'); }, ms); }
  function segment(host, items, onPick, cls = '') {
    const seg = el('div', { class: 'seg io-seg ' + cls }, items.map((it, i) => el('button', { 'aria-pressed': String(i === 0), html: it.dot ? `<i class="dot" style="background:var(--c-${it.dot})"></i>${it.label}` : it.label, onclick: () => { $$('button', seg).forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); onPick(i); } })));
    host.append(seg); return seg;
  }
  // tappable tiles with a detail panel underneath
  function tileSet(host, items, color) {
    const grid = el('div', { class: 'ts' }, items.map((it, i) => el('button', { class: 'tsb', 'aria-pressed': String(i === 0), style: `--tc:var(--c-${it.c || color});--tcs:var(--c-${it.c || color}-s)`, onclick: () => pick(i), html: `<span class="no mono">${i + 1}</span><b>${it.t}</b>` })));
    const panel = el('div', { class: 'tsp fx' });
    host.append(grid, panel);
    function fill(i) { const it = items[i]; panel.style.setProperty('--tc', `var(--c-${it.c || color})`); panel.replaceChildren(el('div', { class: 'tsp-h', html: it.t }), el('div', { class: 'tsp-b', html: it.d })); }
    function pick(i) { $$('.tsb', grid).forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); swap(panel, () => fill(i), 110); }
    fill(0); return { pick };
  }

  /* =========================== map =========================== */
  (() => {
    const host = $('#map');
    const C = [
      ['devtools', 'เครื่องมือ', ['erd', 'flowchart', 'pseudocode', 'dtable', 'dtree']],
      ['testing', 'ทดสอบ', ['unit', 'integ', 'systest']],
      ['install', 'ติดตั้งและประเมิน', ['testenv', 'opsenv']],
      ['training', 'อบรม', ['tr_users', 'tr_mgr', 'tr_it', 'trvendor', 'troutside', 'trinhouse']],
      ['dconv', 'แปลงข้อมูล', ['dc_export', 'dc_prog', 'dc_verify']],
      ['changeover', 'เปลี่ยนระบบ', ['direct', 'parallel', 'pilot', 'phased']],
      ['postimpl', 'หลังติดตั้ง', ['finalrep', 'usertr', 'helpdesk', 'outsrc']],
      ['maint', 'บำรุงรักษา', ['corrective', 'adaptive', 'perfective', 'preventive']],
    ];
    host.append(el('div', { class: 'hub' }, C.map(([k, head, items], i) => el('div', { class: 'hub-col', style: style(k) },
      el('button', { class: 'hub-h', 'data-k': k, html: `<span class="n mono">${i + 1}</span><span class="t">${head}</span>${icon('chev')}` }),
      el('div', { class: 'hub-items' }, items.map(x => chip(x)))))));
    $$('.chip, .hub-h', host).forEach(c => c.classList.add('pop'));
    Hop.onView(host, () => { $$('.chip, .hub-h', host).forEach((c, i) => { c.style.transitionDelay = (i * 14) + 'ms'; c.classList.add('in'); }); }, .1);
  })();

  /* =========================== 1. tools =========================== */
  (() => {
    const host = $('#fig-tools');
    let member = true, total = 1200, view = 1;
    const V = [{ k: 'erd', label: 'ERD', dot: 'teal' }, { k: 'flowchart', label: 'Flowchart', dot: 'blue' }, { k: 'pseudocode', label: 'Pseudocode', dot: 'violet' }, { k: 'dtable', label: 'Decision table', dot: 'amber' }, { k: 'dtree', label: 'Decision tree', dot: 'green' }];
    const LAB = { a: 'ลด 10%', b: 'ลด 5%', c: 'ไม่ลด' };
    const result = () => total >= 1000 ? (member ? 'a' : 'b') : 'c';
    const AH = '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--muted)"/></marker><marker id="ahon" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--c-blue)"/></marker></defs>';
    const g = (s, inner) => `<g class="n" data-s="${s}">${inner}</g>`;
    const e = (s, d, arrow = true) => `<path class="n e${arrow ? ' ar' : ''}" data-s="${s}" d="${d}"/>`;
    const T = (x, y, t, a = 'middle') => `<text x="${x}" y="${y}" text-anchor="${a}">${t}</text>`;
    const FC = `<svg viewBox="0 0 360 440" class="dsv">${AH}
      ${g('abc', `<rect x="130" y="6" width="100" height="30" rx="15"/>${T(180, 26, 'เริ่ม')}`)}
      ${e('abc', 'M180 36V58')}
      ${g('abc', `<polygon points="100,58 275,58 260,92 85,92"/>${T(180, 80, 'รับยอดซื้อ, สมาชิก')}`)}
      ${e('abc', 'M180 92V112')}
      ${g('abc', `<polygon points="180,112 258,150 180,188 102,150"/>${T(180, 155, 'ยอด ≥ 1,000 ?')}`)}
      ${e('ab', 'M180 188V224')}${g('ab', T(190, 212, 'ใช่', 'start'))}
      ${g('ab', `<polygon points="180,224 258,262 180,300 102,262"/>${T(180, 267, 'เป็นสมาชิก ?')}`)}
      ${e('c', 'M258 150H280')}${g('c', T(268, 141, 'ไม่ใช่'))}
      ${g('c', `<rect x="280" y="132" width="70" height="36" rx="8"/>${T(315, 155, 'ไม่ลด')}`)}
      ${e('a', 'M102 262H80')}${g('a', T(91, 253, 'ใช่'))}
      ${g('a', `<rect x="10" y="244" width="70" height="36" rx="8"/>${T(45, 267, 'ลด 10%')}`)}
      ${e('b', 'M180 300V318')}${g('b', T(190, 313, 'ไม่ใช่', 'start'))}
      ${g('b', `<rect x="140" y="318" width="80" height="36" rx="8"/>${T(180, 341, 'ลด 5%')}`)}
      ${e('b', 'M180 354V395', false)}${e('a', 'M45 280V395H180', false)}${e('c', 'M315 168V395H180', false)}${e('abc', 'M180 395V402')}
      ${g('abc', `<rect x="130" y="402" width="100" height="28" rx="14"/>${T(180, 421, 'จบ')}`)}
    </svg>`;
    const TREE = `<svg viewBox="0 0 360 240" class="dsv">
      ${g('abc', `<rect x="95" y="10" width="170" height="36" rx="8"/>${T(180, 33, 'ยอด ≥ 1,000 ?')}`)}
      ${e('ab', 'M140 46L82 100', false)}${g('ab', T(100, 68, 'ใช่'))}
      ${e('c', 'M220 46L288 100', false)}${g('c', T(268, 68, 'ไม่ใช่'))}
      ${g('ab', `<rect x="15" y="100" width="135" height="36" rx="8"/>${T(82, 123, 'เป็นสมาชิก ?')}`)}
      ${g('c', `<rect x="238" y="100" width="100" height="36" rx="8"/>${T(288, 123, 'ไม่ลด')}`)}
      ${e('a', 'M50 136L45 190', false)}${g('a', T(28, 167, 'ใช่'))}
      ${e('b', 'M112 136L140 190', false)}${g('b', T(142, 163, 'ไม่ใช่', 'start'))}
      ${g('a', `<rect x="0" y="190" width="90" height="36" rx="8"/>${T(45, 213, 'ลด 10%')}`)}
      ${g('b', `<rect x="95" y="190" width="90" height="36" rx="8"/>${T(140, 213, 'ลด 5%')}`)}
    </svg>`;
    const one = (x, y, v) => v ? `<path d="M${x} ${y - 8}V${y + 8}" />` : '';
    const ERD = `<svg viewBox="0 0 360 230" class="dsv erd">
      ${[['CUSTOMER', 'cust_id, name, member', 10, 10], ['ORDER', 'order_id, date', 220, 10], ['PRODUCT', 'prod_id, name, price', 10, 150], ['ORDER_ITEM', 'order_id, prod_id, qty', 220, 150]].map(([n, a, x, y]) => `<g class="ent"><rect x="${x}" y="${y}" width="130" height="54" rx="8"/><text x="${x + 65}" y="${y + 22}" text-anchor="middle" class="en">${n}</text><text x="${x + 65}" y="${y + 42}" text-anchor="middle" class="at">${a}</text></g>`).join('')}
      <path d="M140 37H220M150 29V45M206 37L220 29M206 37L220 37M206 37L220 45"/>
      <path d="M285 64V150M277 74H293M285 136L277 150M285 136V150M285 136L293 150"/>
      <path d="M140 177H220M150 169V185M206 177L220 169M206 177H220M206 177L220 185"/>
      <text x="180" y="28" text-anchor="middle" class="rl">สั่ง</text><text x="296" y="112" class="rl">ประกอบด้วย</text><text x="180" y="168" text-anchor="middle" class="rl">ถูกสั่งใน</text>
    </svg>`;
    const PC = `<div class="pc">${[['abc', 0, 'IF total &gt;= 1000 THEN'], ['ab', 1, 'IF member = TRUE THEN'], ['a', 2, 'discount = 10%'], ['b', 1, 'ELSE'], ['b', 2, 'discount = 5%'], ['c', 0, 'ELSE'], ['c', 1, 'discount = 0%'], ['abc', 0, 'END IF']].map(([s, ind, t]) => `<div class="n ln" data-s="${s}" style="padding-left:${ind * 22 + 14}px">${t}</div>`).join('')}</div>`;
    const yn = (a, b) => `<td data-r="${a}">${b}</td>`;
    const DT = `<div class="tw"><table class="dt"><thead><tr><th></th>${[1, 2, 3, 4].map(r => `<th data-r="${r}">กฎ ${r}</th>`).join('')}</tr></thead><tbody>
      <tr><th class="rl">ยอด ≥ 1,000</th>${['Y', 'Y', 'N', 'N'].map((v, i) => yn(i + 1, v)).join('')}</tr>
      <tr><th class="rl">เป็นสมาชิก</th>${['Y', 'N', 'Y', 'N'].map((v, i) => yn(i + 1, v)).join('')}</tr>
      <tr class="sep"><th class="rl act">ลด 10%</th>${['X', '', '', ''].map((v, i) => yn(i + 1, v)).join('')}</tr>
      <tr><th class="rl act">ลด 5%</th>${['', 'X', '', ''].map((v, i) => yn(i + 1, v)).join('')}</tr>
      <tr><th class="rl act">ไม่ลด</th>${['', '', 'X', 'X'].map((v, i) => yn(i + 1, v)).join('')}</tr></tbody></table></div>`;
    const VIEWS = [ERD, FC, PC, DT, TREE];
    segment(host, V.map(v => ({ label: v.label, dot: v.dot })), i => { view = i; show(); }, 'tools-seg');
    $$('.seg button', host).forEach((b, j) => b.setAttribute('aria-pressed', String(j === view)));
    const stage = el('div', { class: 'tvstage' }, VIEWS.map((h, i) => el('div', { class: 'tview' + (i === 1 ? ' on' : ''), html: h })));
    const slider = el('input', { type: 'range', class: 'slider', min: 500, max: 1500, step: 50, value: total, 'aria-label': 'ยอดซื้อ' });
    const rd = el('span', { class: 'readout' });
    const mem = el('div', { class: 'seg io-seg' }, [['ไม่เป็นสมาชิก', false], ['เป็นสมาชิก', true]].map(([l, v]) => el('button', { 'aria-pressed': String(v === member), text: l, onclick: () => { member = v; $$('button', mem).forEach(b => b.setAttribute('aria-pressed', String(b.textContent === l))); paint(); } })));
    const say = el('p', { class: 'say fx' });
    host.append(stage, el('div', { class: 'ctrls tctrl' }, el('span', { class: 'readout', text: 'ยอดซื้อ' }), slider, rd), el('div', { class: 'ctrls' }, mem), say);
    slider.addEventListener('input', () => { total = +slider.value; paint(); });
    function show() { $$('.tview', stage).forEach((n, i) => n.classList.toggle('on', i === view)); paint(); }
    function paint() {
      const r = result();
      slider.style.setProperty('--p', ((total - 500) / 1000 * 100) + '%');
      rd.textContent = fmt(total) + ' บาท';
      $$('.n', stage).forEach(n => n.classList.toggle('on', n.dataset.s.includes(r)));
      const rule = member ? (total >= 1000 ? 1 : 3) : (total >= 1000 ? 2 : 4);
      $$('[data-r]', stage).forEach(n => n.classList.toggle('on', +n.dataset.r === rule));
      $$('.dt .act', stage).forEach((n, i) => n.classList.toggle('on', 'abc'[i] === r));
      const tail = `ยอด ${fmt(total)} บาท ${total >= 1000 ? 'ถึง' : 'ไม่ถึง'} 1,000${total >= 1000 ? (member ? ' และเป็นสมาชิก' : ' แต่ไม่เป็นสมาชิก') : ''}`;
      say.innerHTML = view === 0 ? `${Hop.t('erd', 'ERD')} แสดงว่ามีข้อมูลอะไรและเกี่ยวกันอย่างไร (ลูกค้า 1 คนมีใบสั่งซื้อได้หลายใบ) ไม่แสดงว่าส่วนลดคิดอย่างไร จึงไม่มีเส้นทางให้ไล่ตามยอดซื้อ` :
        view === 3 ? `${tail} ตรงกับ<b>กฎ ${rule}</b> ผลคือ <b style="color:var(--c-amber)">${LAB[r]}</b> สองเงื่อนไขได้ 4 กฎ ครบทุกกรณี` :
        `${tail} เดินตามเส้นที่สว่าง ผลคือ <b style="color:var(--c-${V[view].dot})">${LAB[r]}</b>`;
    }
    paint();
  })();
  Hop.mcq($('#q-tools'), {
    q: 'ข้อใดเป็นเครื่องมือที่อธิบายข้อมูลและความสัมพันธ์ระหว่างข้อมูล ไม่ใช่ลำดับขั้นตอนการทำงาน',
    opts: ['Flowchart', 'Pseudocode', 'Entity-relationship diagram', 'Decision table'], a: 2,
    whyWrong: { 0: 'flowchart แสดงลำดับขั้นตอนและจุดตัดสินใจ', 1: 'pseudocode เขียนตรรกะเป็นประโยคคล้ายโปรแกรม', 3: 'decision table ลิสต์เงื่อนไขกับการกระทำ' },
    why: 'ERD แสดง entity และ relationship (ข้อมูล) ส่วนอีกสามอย่างแสดงตรรกะการทำงาน',
  });
  Hop.mcq($('#q-tools'), {
    q: 'ตารางที่แต่ละคอลัมน์คือหนึ่งกฎ ระบุเงื่อนไขทุกแบบที่เป็นไปได้และการกระทำที่ตรงกัน คือเครื่องมือใด',
    opts: ['Decision tree', 'Decision table', 'ERD', 'Flowchart'], a: 1,
    whyWrong: { 0: 'decision tree เป็นต้นไม้ที่ถามทีละข้อและแตกกิ่ง ไม่ใช่ตาราง', 2: 'ERD ใช้กับข้อมูล', 3: 'flowchart เป็นผังสัญลักษณ์และลูกศร' },
    why: 'decision table เรียงเงื่อนไขกับกฎเป็นตาราง เช่น เงื่อนไข 2 ข้อได้ 4 กฎ เห็นว่าครอบคลุมทุกกรณีหรือไม่',
  });

  /* =========================== 2. testing zoom =========================== */
  (() => {
    const host = $('#fig-test');
    const mod = (id, x, y, name) => `<g id="m${id}" class="mod"><rect x="${x}" y="${y}" width="140" height="56" rx="12"/><text x="${x + 70}" y="${y + 35}" text-anchor="middle">${name}</text></g>`;
    const arr = (id, d) => `<path id="${id}" class="arr" d="${d}"/>`;
    host.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 600 400" class="tsv" role="img" aria-label="ซูมจากโมดูลเดียวไปทั้งระบบ">
      <defs><marker id="tah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--muted)"/></marker><marker id="tahon" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--tc)"/></marker></defs>
      <g id="cam">
        <rect id="bound" x="26" y="2" width="548" height="376" rx="18"/><text id="boundt" x="562" y="24" text-anchor="end">ระบบทั้งหมด</text>
        <g id="ext"><circle cx="110" cy="20" r="12" class="ext"/><text x="132" y="25" class="extt">ผู้ใช้</text>
          <path class="ext arrx" d="M110 34V62"/>
          <g><path class="ext" d="M255 316v40c0 10 90 10 90 0v-40"/><ellipse class="ext" cx="300" cy="316" rx="45" ry="10"/><text x="300" y="345" text-anchor="middle" class="extt">ฐานข้อมูล</text></g>
          <path class="ext arrx" d="M300 258V304"/>
          <rect class="ext" x="440" y="206" width="100" height="44" rx="10"/><text x="490" y="233" text-anchor="middle" class="extt">เครื่องพิมพ์</text>
          <path class="ext arrx" d="M490 122V204"/></g>
        ${arr('aAB', 'M180 92H228')}${arr('aBD', 'M370 92H418')}${arr('aBC', 'M300 122V198')}
        ${mod('A', 40, 64, 'รับคำสั่งซื้อ')}${mod('B', 230, 64, 'คิดราคา')}${mod('D', 420, 64, 'ออกใบเสร็จ')}${mod('C', 230, 200, 'ตัดสต๊อก')}
        <g id="harn"><rect class="hb" x="250" y="14" width="100" height="30" rx="8"/><text x="300" y="35" text-anchor="middle" class="hbt">ค่าทดสอบ</text><path class="hl" d="M300 44V62" marker-end="url(#tah)"/>
          <rect class="hb" x="250" y="136" width="100" height="30" rx="8"/><text x="300" y="157" text-anchor="middle" class="hbt">ผลที่ได้</text><path class="hl" d="M300 122V134" marker-end="url(#tah)"/></g>
      </g></svg>`);
    const svg = $('svg', host), cam = $('#cam', svg);
    const q = id => $('#' + id, svg);
    const STG = [{ s: 2.4, x: 300, y: 92, c: 'blue' }, { s: 1.12, x: 300, y: 160, c: 'violet' }, { s: 1, x: 300, y: 188, c: 'amber' }];
    const SAY = [
      `${Hop.t('unit', 'Unit test')}: ป้อนค่าทดสอบให้โมดูล &ldquo;คิดราคา&rdquo; เพียงตัวเดียว เช็กว่าผลตรงที่คาดหรือไม่ ถ้าไม่ตรง ผิดที่โมดูลนี้แน่ๆ`,
      `${Hop.t('integ', 'Integration test')}: แต่ละโมดูลผ่านทีละตัวแล้ว ต่อกันแล้วส่งข้อมูลถึงกันถูกไหม เช่น ราคาที่ &ldquo;คิดราคา&rdquo; ส่งไป &ldquo;ตัดสต๊อก&rdquo; และ &ldquo;ออกใบเสร็จ&rdquo;`,
      `${Hop.t('systest', 'System test')}: ทั้งระบบรวมผู้ใช้ ฐานข้อมูล และเครื่องพิมพ์ ว่าทำงานตามความต้องการของผู้ใช้หรือไม่`,
    ];
    const say = el('p', { class: 'say fx' });
    let lastS = -1;
    function frame(t) {
      const i = Math.min(1, Math.floor(t)), f = clamp(t - i, 0, 1), k = easeIO(f);
      const a = STG[i], b = STG[Math.min(2, i + 1)];
      const s = lerp(a.s, b.s, k), x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k);
      cam.setAttribute('transform', `translate(300 200) scale(${s}) translate(${-x} ${-y})`);
      const w0 = clamp(1 - t * 1.6, 0, 1), w1 = clamp(1 - Math.abs(t - 1) * 1.6, 0, 1), w2 = clamp(1 - (2 - t) * 1.6, 0, 1);
      const mid = Math.max(w1, w2);
      ['mA', 'mC', 'mD'].forEach(id => q(id).style.opacity = .12 + .88 * mid);
      ['aAB', 'aBD', 'aBC'].forEach(id => q(id).style.opacity = .1 + .9 * mid);
      q('ext').style.opacity = .08 + .92 * w2;
      q('harn').style.opacity = w0;
      q('bound').style.opacity = w2; q('boundt').style.opacity = w2;
      const stage = Math.round(t), c = STG[stage].c;
      svg.style.setProperty('--tc', `var(--c-${c})`);
      svg.classList.toggle('sys', stage === 2);
      $$('.mod', svg).forEach(m => m.classList.toggle('hot', (stage === 0 && m.id === 'mB') || (stage > 0)));
      $$('.arr', svg).forEach(m => m.classList.toggle('hot', stage >= 1));
      if (stage !== lastS) { lastS = stage; say.classList.add('fx-out'); setTimeout(() => { say.innerHTML = SAY[stage]; say.classList.remove('fx-out'); }, 120); }
    }
    Hop.scrub(host, { stops: [{ label: '<span style="color:var(--c-blue)">Unit</span> โมดูลเดียว' }, { label: '<span style="color:var(--c-violet)">Integration</span> โมดูลหลายตัวทำงานร่วมกัน' }, { label: '<span style="color:var(--c-amber)">System</span> ทั้งระบบ' }], onFrame: frame, speed: 1600 });
    host.append(say); say.innerHTML = SAY[0]; frame(0);
  })();
  Hop.mcq($('#q-test'), {
    q: 'ทดสอบโมดูล &ldquo;คิดภาษี&rdquo; โดยป้อนยอด 1,000 บาทเข้าไปตัวเดียว แล้วดูว่าผลเป็น 70 บาทตามที่คาดหรือไม่ เป็นการทดสอบระดับใด',
    opts: ['Unit testing', 'Integration testing', 'System testing'], a: 0,
    whyWrong: { 1: 'integration ต้องมีโมดูลตั้งแต่สองตัวขึ้นไปทำงานร่วมกัน ที่นี่ทดสอบโมดูลเดียว', 2: 'system testing ทดสอบทั้งระบบ รวมผู้ใช้ ฐานข้อมูล และอุปกรณ์' },
    why: 'ทดสอบโปรแกรมหรือโมดูลตัวเดียวแยกกัน คือ unit testing',
  });
  Hop.mcq($('#q-test'), {
    q: 'โมดูลรับคำสั่งซื้อและโมดูลคิดราคาผ่านการทดสอบเดี่ยวแล้วทั้งคู่ แต่เมื่อต่อกัน โมดูลแรกส่งราคาเป็นข้อความ ทำให้โมดูลที่สองคำนวณไม่ได้ ข้อผิดพลาดนี้ควรถูกจับได้ในการทดสอบระดับใด',
    opts: ['Unit testing', 'Integration testing', 'System testing'], a: 1,
    whyWrong: { 0: 'unit test ของแต่ละโมดูลผ่านไปแล้ว เพราะแต่ละตัวถูกเมื่อดูแยกกัน', 2: 'system test ก็อาจเจอ แต่ผิดตรงจุดที่ข้อมูลส่งผ่านระหว่างโมดูลซึ่งเป็นหน้าที่โดยตรงของ integration test' },
    why: 'ปัญหาอยู่ที่การส่งข้อมูลระหว่างโมดูล ซึ่งเห็นได้เมื่อโมดูลทำงานร่วมกัน คือ integration testing',
  });
  Hop.mcq($('#q-test'), {
    q: 'ทดสอบว่าระบบทั้งชุด รวมเครื่องพิมพ์ใบเสร็จและฐานข้อมูล ทำงานได้ตามความต้องการของผู้ใช้ เมื่อมีผู้ใช้ 50 คนใช้พร้อมกัน เป็นการทดสอบระดับใด',
    opts: ['Unit testing', 'Integration testing', 'System testing'], a: 2,
    whyWrong: { 0: 'ไม่ใช่การทดสอบโมดูลตัวเดียว', 1: 'integration ทดสอบการทำงานร่วมกันของโมดูล ไม่ครอบคลุมอุปกรณ์และผู้ใช้ทั้งระบบ' },
    why: 'ทดสอบระบบทั้งหมดรวมกันตามความต้องการ คือ system testing',
  });

  /* =========================== 3. installation scene =========================== */
  (() => {
    const host = $('#fig-install');
    const STEPS = [
      { label: '1. เตรียมสภาพแวดล้อมทดสอบ: ฮาร์ดแวร์ ซอฟต์แวร์ ระบบสื่อสาร' },
      { label: '2. อบรมผู้ใช้ทั่วไป หัวหน้างาน และฝ่ายไอที' },
      { label: '3. แปลงข้อมูลให้ใช้กับระบบใหม่ได้' },
      { label: '4. ทดสอบระบบก่อนใช้งานจริง' },
      { label: '5. ทำรายงานการติดตั้งและทดสอบให้หัวหน้า' },
    ];
    const bar = (t) => el('div', { class: 'lay' }, el('span', { text: t }), el('div', { class: 'lb' }, el('i')));
    const testEnv = el('div', { class: 'env test' }, el('div', { class: 'env-h' }, el('button', { 'data-k': 'testenv', text: 'Test environment' })),
      el('div', { class: 'lays' }, bar('ฮาร์ดแวร์'), bar('ซอฟต์แวร์'), bar('ระบบสื่อสาร')),
      el('div', { class: 'it i2' }, el('span', { class: 'pp blue', text: 'ผู้ใช้' }), el('span', { class: 'pp amber', text: 'หัวหน้างาน' }), el('span', { class: 'pp teal', text: 'ฝ่ายไอที' })),
      el('div', { class: 'it i3' }, el('span', { class: 'dd', text: 'ข้อมูลเก่าที่แปลงแล้ว' })),
      el('div', { class: 'it i4' }, el('span', { class: 'ok', html: `${icon('check')} ผ่านการทดสอบ` })),
      el('div', { class: 'it i5' }, el('span', { class: 'rep', text: 'รายงานติดตั้งและทดสอบ  →  หัวหน้า' })));
    const ops = el('div', { class: 'env ops' }, el('div', { class: 'env-h' }, el('button', { 'data-k': 'opsenv', text: 'Operational environment' })),
      el('div', { class: 'opsb' }, el('div', { text: 'ข้อมูลจริง ผู้ใช้จริง' }), el('div', { class: 'muted', text: 'ยังไม่ได้ใช้ระบบใหม่' })),
      el('div', { class: 'golive it i5', text: 'พร้อมย้ายมาใช้งานจริง' }));
    host.append(el('div', { class: 'envs' }, testEnv, ops));
    const rows = [['ข้อมูล', 'ข้อมูลทดสอบ', 'ข้อมูลจริงขององค์กร'], ['ผู้ใช้', 'ผู้ทดสอบและผู้ที่เข้ารับการอบรม', 'ผู้ใช้ทำงานประจำวัน'], ['ถ้าระบบผิดพลาด', 'ไม่กระทบงานจริง ซ้อมใหม่ได้', 'กระทบธุรกิจทันที']];
    host.append(el('div', { class: 'tw' }, el('table', { class: 'cmp' }, el('thead', {}, el('tr', {}, el('th'), el('th', { class: 'a', text: 'Test' }), el('th', { class: 'g', text: 'Operational' }))), el('tbody', {}, rows.map(r => el('tr', {}, el('th', { text: r[0] }), el('td', { text: r[1] }), el('td', { text: r[2] })))))));
    const its = [null, null, $('.i2', testEnv), $('.i3', testEnv), $('.i4', testEnv), $('.i5', testEnv)];
    const goEl = $('.golive', ops);
    function frame(t) {
      [1, 2, 3, 4].forEach(k => { const n = [$('.i2', testEnv), $('.i3', testEnv), $('.i4', testEnv), $('.i5', testEnv)][k - 1]; const o = clamp(t - k + 1, 0, 1); n.style.opacity = o; n.style.maxHeight = (o * 64) + 'px'; n.style.marginTop = (o * 12) + 'px'; });
      const go = clamp(t - 3, 0, 1); goEl.style.opacity = go; goEl.style.maxHeight = (go * 60) + 'px'; goEl.style.marginTop = (go * 12) + 'px';
    }
    Hop.scrub(host, { stops: STEPS, onFrame: frame, speed: 1300 });
    // scrub appended after the table; move it above the scene
    const sc = $('.scrub', host); host.insertBefore(sc, $('.envs', host));
    frame(0);
    Hop.onView(host, () => $$('.lb i', host).forEach((b, i) => setTimeout(() => b.style.width = '100%', 200 + i * 220)), .3);
  })();
  Hop.mcq($('#q-install'), {
    q: 'ฝ่ายไอทีติดตั้งระบบใหม่บนเครื่องที่แยกจากเครื่องใช้งานจริง ใส่ข้อมูลตัวอย่างเข้าไปทดสอบก่อนใช้งานจริง เครื่องชุดนี้อยู่ใน environment ใด',
    opts: ['Operational environment', 'Test environment'], a: 1,
    whyWrong: { 0: 'operational ใช้ข้อมูลจริงและผู้ใช้จริง ผิดพลาดแล้วกระทบธุรกิจ' },
    why: 'เครื่องแยก ข้อมูลทดสอบ ซ้อมก่อนใช้จริง คือ test environment',
  });
  Hop.mcq($('#q-install'), {
    q: 'ข้อใดไม่อยู่ในห้าขั้นตอนที่เหลือหลังทดสอบระบบ ตามสไลด์',
    opts: ['เตรียมสภาพแวดล้อมในการทดสอบระบบ', 'อบรมผู้ใช้ทั่วไป หัวหน้างาน และฝ่ายไอที', 'แปลงข้อมูลให้ใช้กับระบบใหม่ได้', 'เขียนโปรแกรมทุกโมดูลใหม่ทั้งหมด'], a: 3,
    why: 'ห้าขั้นคือ เตรียมสภาพแวดล้อม, อบรม, แปลงข้อมูล, ทดสอบก่อนใช้งานจริง, ทำรายงานให้หัวหน้า การเขียนโปรแกรมเสร็จแล้วก่อนขั้นตอนนี้',
  });

  /* =========================== 4. training =========================== */
  (() => {
    const host = $('#fig-train');
    const G = [
      { k: 'tr_users', c: 'blue', t: 'Users', who: 'ผู้ใช้ทั่วไปในงานประจำวัน', learn: ['วิธีป้อนและแก้ไขข้อมูล', 'ค้นหาและอ่านรายงานของงานตัวเอง', 'ทำอย่างไรเมื่อเจอข้อความ error'] },
      { k: 'tr_mgr', c: 'amber', t: 'Managers', who: 'หัวหน้างานและผู้บริหาร', learn: ['อ่านและตีความรายงานสรุป', 'ใช้ข้อมูลตัดสินใจและติดตามงานของทีม', 'อนุมัติรายการและกำหนดสิทธิ์ของทีม'] },
      { k: 'tr_it', c: 'teal', t: 'IT staff', who: 'ฝ่ายไอทีที่ต้องดูแลระบบต่อ', learn: ['ติดตั้งและตั้งค่าระบบ', 'สำรองข้อมูลและกู้คืน', 'ตอบปัญหาผู้ใช้และบำรุงรักษา'] },
    ];
    const M = [
      { k: 'trvendor', c: 'blue', t: 'Vendor training', who: 'เจ้าของซอฟต์แวร์เป็นผู้สอน', how: 'webinars, podcasts, tutorials', fit: 'ซอฟต์แวร์ที่ซื้อมา เพราะผู้ขายรู้ระบบดีที่สุด' },
      { k: 'troutside', c: 'violet', t: 'Outside training resources', who: 'เช่าสถานที่ภายนอก เช่น บริษัทหรือมหาวิทยาลัย', how: 'ห้องอบรมและเครื่องมือของผู้ให้เช่า', fit: 'องค์กรไม่มีห้องหรือเครื่องมือเพียงพอ' },
      { k: 'trinhouse', c: 'green', t: 'In-house training', who: 'ฝ่ายไอทีและหน่วยงานผู้ใช้ร่วมกันรับผิดชอบ', how: 'จัดกันเองภายในองค์กร', fit: 'ระบบที่พัฒนาเองหรือปรับแต่งเฉพาะองค์กร ผู้สอนรู้งานจริง' },
    ];
    let g = 0, m = 0;
    const row = (label, items, set) => {
      const r = el('div', { class: 'trr' }, el('div', { class: 'trl', text: label }), el('div', { class: 'trt' }, items.map((x, i) => el('button', { class: 'tr-b', 'aria-pressed': String(i === 0), style: `--tc:var(--c-${x.c});--tcs:var(--c-${x.c}-s)`, text: x.t, onclick: () => { set(i); $$('.tr-b', r).forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); draw(); } }))));
      return r;
    };
    const out = el('div', { class: 'tro' });
    host.append(row('อบรมใคร', G, i => g = i), row('ใครสอน', M, i => m = i), out);
    function draw() {
      const a = G[g], b = M[m];
      swap(out, () => {
        out.replaceChildren(
          el('div', { class: 'trc', style: `--tc:var(--c-${a.c})` }, el('div', { class: 'trh', html: `${Hop.t(a.k, a.t)}` }), el('div', { class: 'muted', text: a.who }), el('ul', {}, a.learn.map(x => el('li', { text: x })))),
          el('div', { class: 'trc', style: `--tc:var(--c-${b.c})` }, el('div', { class: 'trh', html: `${Hop.t(b.k, b.t)}` }), el('div', { class: 'muted', text: b.who }), el('ul', {}, el('li', { text: 'รูปแบบ: ' + b.how }), el('li', { text: 'เหมาะเมื่อ: ' + b.fit }))));
      }, 120);
    }
    out.classList.add('fx'); draw();
  })();
  Hop.mcq($('#q-train'), {
    q: 'องค์กรไม่มีห้องอบรมและเครื่องคอมพิวเตอร์เพียงพอ จึงติดต่อมหาวิทยาลัยแห่งหนึ่งเพื่อเช่าห้องจัดอบรม เป็นการอบรมแบบใด',
    opts: ['Vendor training', 'Outside training resources', 'In-house training'], a: 1,
    whyWrong: { 0: 'vendor คือเจ้าของซอฟต์แวร์เป็นผู้สอน ที่นี่แค่เช่าสถานที่', 2: 'in-house คือจัดกันเองภายในองค์กร' },
    why: 'สไลด์ระบุ outside training resources คือเช่าสถานที่ภายนอก เช่น บริษัทหรือมหาวิทยาลัย',
  });
  Hop.mcq($('#q-train'), {
    q: 'ตามสไลด์ แผนการอบรมปกติแบ่งกลุ่มผู้เรียนเป็นกี่กลุ่ม และมีใครบ้าง',
    opts: ['3 กลุ่ม: users, managers, IT staff', '2 กลุ่ม: users, IT staff', '3 กลุ่ม: users, vendors, auditors', '4 กลุ่ม: users, managers, IT staff, vendors'], a: 0,
    whyWrong: { 1: 'ขาดกลุ่ม managers', 2: 'vendor เป็นผู้สอนที่เลือกได้ ไม่ใช่กลุ่มผู้เรียน', 3: 'vendor ไม่ใช่กลุ่มผู้เรียน' },
    why: 'สไลด์ระบุ 3 กลุ่มใหญ่คือ users, managers และ IT staff',
  });

  /* =========================== 5. data conversion =========================== */
  (() => {
    const host = $('#fig-conv');
    let fmtOk = true, loss = false;
    const N = 5;
    segment(host, [{ label: 'export ได้ตรงรูปแบบ' }, { label: 'รูปแบบไม่ตรงกัน' }], i => { fmtOk = i === 0; upd(); });
    const lane = el('div', { class: 'cv' },
      el('div', { class: 'cvn l', html: '<b>ระบบเก่า</b><span class="mono">1,250</span>' }),
      el('div', { class: 'cvn m' }), el('div', { class: 'cvn r', html: '<b>ระบบใหม่</b><span class="mono nc">0</span>' }),
      el('div', { class: 'cvl' }));
    const tokens = Array.from({ length: N }, (_, i) => el('div', { class: 'ctk', style: `--i:${i}` }));
    lane.append(...tokens); host.append(lane);
    const panel = el('div', { class: 'cvp fx' });
    const say = el('p', { class: 'say fx' });
    let T = 0;
    function mid() { $('.m', lane).innerHTML = fmtOk ? '<b>ไฟล์ CSV</b><span>รูปแบบที่ระบบใหม่อ่านได้</span>' : '<b>โปรแกรมแปลงข้อมูล</b><span>เขียนเองเพื่อแปลงรูปแบบเก่า</span>'; }
    function frame(t) {
      T = t; let landed = 0;
      tokens.forEach((k, i) => {
        const p1 = ease(clamp(t - i * .07, 0, 1)), p2 = ease(clamp(t - 2 - i * .07, 0, 1));
        const off = (i - 2) * 3.4, x = (t < 2 ? lerp(12, 50, p1) : lerp(50, 88, p2)) + off * (t < 2 ? p1 : 1);
        k.style.left = x + '%'; k.style.opacity = (t < 2 ? 1 : 1) * (t > 3.9 ? 1 : 1);
        const conv = fmtOk ? t >= 1 : t >= 2;
        k.classList.toggle('nf', conv);
        if (t >= 3 + i * .0 && p2 > .98) landed++;
      });
      const nc = $('.nc', lane); nc.textContent = fmt(landed * 250 - (loss && landed === N ? 12 : 0));
      panel.style.display = t > 3.5 ? '' : 'none';
      if (t > 3.5) {
        const nv = N * 250 - (loss ? 12 : 0);
        panel.innerHTML = `<div class="vr"><span>ระบบเก่า</span><b class="mono">1,250</b></div><div class="vr"><span>ระบบใหม่</span><b class="mono">${fmt(nv)}</b></div><div class="vr res ${loss ? 'bad' : 'good'}"><span>เทียบจำนวนรายการ</span><b>${loss ? 'ไม่ตรง ขาดไป 12 รายการ ต้องหาสาเหตุก่อนใช้จริง' : 'ตรงกัน'}</b></div>`;
      }
      const stage = Math.round(t);
      const msgs = ['ระบบเก่ามีข้อมูลอยู่ 1,250 รายการ', `${Hop.t('dc_export', 'Export')} ข้อมูลออกจากระบบเก่าเป็นไฟล์`, fmtOk ? 'ไฟล์อยู่ในรูปแบบที่ระบบใหม่รู้จัก ไม่ต้องแปลงเพิ่ม' : `รูปแบบไม่ตรง ต้องใช้${Hop.t('dc_prog', 'โปรแกรมแปลงข้อมูล')} อ่านข้อมูลเก่าและแปลงให้ตรงกับระบบใหม่`, 'โหลดข้อมูลเข้าระบบใหม่', `${Hop.t('dc_verify', 'ตรวจสอบ')} เทียบจำนวนรายการระหว่างสองระบบ`];
      if (say.dataset.s !== stage + '' + fmtOk + loss) { say.dataset.s = stage + '' + fmtOk + loss; say.innerHTML = msgs[stage]; }
    }
    const lossBtn = el('button', { class: 'btn small', text: 'จำลองข้อมูลหาย 12 รายการ', onclick: () => { loss = !loss; lossBtn.textContent = loss ? 'ยกเลิกการจำลอง' : 'จำลองข้อมูลหาย 12 รายการ'; frame(T); } });
    const sc = Hop.scrub(host, { stops: [{ label: 'ระบบเก่า' }, { label: 'export' }, { label: fmtOk ? 'ตรวจรูปแบบ' : 'แปลงรูปแบบ' }, { label: 'โหลดเข้าระบบใหม่' }, { label: 'ตรวจสอบ' }], onFrame: frame, speed: 1300 });
    host.append(panel, el('div', { class: 'ctrls' }, lossBtn), say);
    function upd() { mid(); $$('.stop', host); const labels = $$('.scrub .label', host); frame(T); const stops = ['ระบบเก่า', 'export', fmtOk ? 'ตรวจรูปแบบ' : 'แปลงรูปแบบ', 'โหลดเข้าระบบใหม่', 'ตรวจสอบ']; $('.scrub .label', host).textContent = stops[Math.min(4, Math.round(T))]; }
    mid(); frame(0);
  })();
  Hop.mcq($('#q-conv'), {
    q: 'ระบบเก่า export ข้อมูลได้เฉพาะรูปแบบเฉพาะของตัวเองที่ระบบใหม่ไม่รู้จัก ควรทำอย่างไร',
    opts: ['เขียนโปรแกรมอ่านข้อมูลรูปแบบนั้นแล้วแปลงเข้าระบบใหม่', 'พิมพ์ข้อมูลเก่าทั้งหมดใหม่ด้วยมือ ไม่ต้องตรวจ', 'ทิ้งข้อมูลเก่า เริ่มระบบใหม่ด้วยฐานข้อมูลว่าง', 'ติดตั้งระบบใหม่ทับระบบเก่าทันที'], a: 0,
    whyWrong: { 1: 'พิมพ์เองเสี่ยงผิดมาก และสไลด์บอกว่าต้องมีวิธีตรวจสอบความถูกต้อง', 2: 'ข้อมูลเก่ายังมีค่าต่อธุรกิจ การแปลงข้อมูลมีไว้เพื่อไม่ต้องทิ้ง', 3: 'ไม่ได้แก้ปัญหารูปแบบข้อมูล' },
    why: 'สไลด์: ถ้า export เป็นรูปแบบที่ระบบใหม่รู้จักไม่ได้ ต้องเขียนโปรแกรมไปอ่านข้อมูลเหล่านั้นมาไว้ในระบบใหม่ และต้องมีวิธีตรวจสอบว่าข้อมูลถูกต้อง',
  });

  /* =========================== 6. changeover timeline =========================== */
  const MET = [
    { k: 'direct', c: 'rose', t: 'Direct', lanes: [['สาขา A', 6, 6], ['สาขา B', 6, 6], ['สาขา C', 6, 6]], note: 'ทุกส่วนเปลี่ยนในวันเดียวกัน ไม่มีระบบเก่าสำรอง' },
    { k: 'parallel', c: 'blue', t: 'Parallel', lanes: [['สาขา A', 8, 4], ['สาขา B', 8, 4], ['สาขา C', 8, 4]], note: 'รันสองระบบซ้อนกันเดือนที่ 4 ถึง 8 แล้วจึงเลิกระบบเก่า' },
    { k: 'pilot', c: 'violet', t: 'Pilot', lanes: [['สาขา A (pilot)', 3, 3], ['สาขา B', 7, 7], ['สาขา C', 7, 7]], note: 'ลองที่สาขา A ก่อน ผ่านแล้วเปลี่ยนสาขาที่เหลือแบบ direct' },
    { k: 'phased', c: 'green', t: 'Phased', lanes: [['โมดูลขาย', 3, 3], ['โมดูลสต๊อก', 6, 6], ['โมดูลบัญชี', 9, 9]], note: 'เปลี่ยนทีละโมดูล (ขาย สต๊อก บัญชี) เดือนที่ 3, 6 และ 9' },
  ];
  const metrics = M => { const ex = {}; let ovl = 0; M.lanes.forEach(([, oe, ns]) => { if (ns >= oe) ex[ns] = (ex[ns] || 0) + 1; ovl += Math.max(0, oe - ns); }); return { risk: Math.max(0, ...Object.values(ex)), cost: ovl }; };
  (() => {
    const host = $('#fig-over');
    let m = 0, p = 7, bug = false;
    segment(host, MET.map(x => ({ label: x.t, dot: x.c })), i => { m = i; draw(); document.dispatchEvent(new CustomEvent('co-method', { detail: i })); });
    const tl = el('div', { class: 'tl' });
    const laneEls = [0, 1, 2].map(() => {
      const lab = el('div', { class: 'tl-lab' }, el('b'), el('span', { class: 'st' }));
      const old = el('div', { class: 'tb tb-old' }, 'เก่า'), nw = el('div', { class: 'tb tb-new' }, 'ใหม่'), ov = el('div', { class: 'tb tb-ovl' });
      return { node: el('div', { class: 'tl-lane' }, lab, el('div', { class: 'tl-track' }, old, nw, ov)), lab, old, nw, ov };
    });
    const ph = el('div', { class: 'tl-ph' }, el('i'));
    const axis = el('div', { class: 'tl-axis' }, [0, 3, 6, 9, 12].map(v => el('span', { style: `left:${v / 12 * 100}%`, text: v })));
    tl.append(...laneEls.map(l => l.node), ph, el('div', { class: 'tl-ax' }, el('span'), el('div', { class: 'tl-axt' }, axis)));
    const sl = el('input', { type: 'range', class: 'slider', min: 0, max: 12, step: .25, value: p, 'aria-label': 'เดือน' });
    const rd = el('span', { class: 'readout' });
    const bugSeg = el('div', { class: 'seg io-seg' }, [['ทำงานปกติ', false], ['ระบบใหม่มีบั๊ก', true]].map(([l, v]) => el('button', { 'aria-pressed': String(v === bug), text: l, onclick: () => { bug = v; $$('button', bugSeg).forEach(b => b.setAttribute('aria-pressed', String(b.textContent === l))); upd(); } })));
    const say = el('p', { class: 'say' });
    host.append(tl, el('div', { class: 'ctrls tctrl' }, el('span', { class: 'readout', text: 'เดือนที่' }), sl, rd), el('div', { class: 'ctrls' }, bugSeg), say);
    sl.addEventListener('input', () => { p = +sl.value; upd(); });
    function draw() {
      const M = MET[m];
      host.style.setProperty('--mc', `var(--c-${M.c})`);
      M.lanes.forEach(([name, oe, ns], i) => {
        const L = laneEls[i]; $('b', L.lab).textContent = name;
        L.old.style.width = (oe / 12 * 100) + '%';
        L.nw.style.left = (ns / 12 * 100) + '%'; L.nw.style.width = ((12 - ns) / 12 * 100) + '%';
        L.ov.style.left = (ns / 12 * 100) + '%'; L.ov.style.width = (Math.max(0, oe - ns) / 12 * 100) + '%';
      });
      upd();
    }
    function upd() {
      const M = MET[m];
      sl.style.setProperty('--p', (p / 12 * 100) + '%');
      rd.textContent = p;
      ph.style.setProperty('--x', (p / 12));
      let stopped = 0, fall = 0;
      M.lanes.forEach(([name, oe, ns], i) => {
        const L = laneEls[i], oldRun = p < oe, newRun = p >= ns;
        let s, cls;
        if (bug && newRun) { if (oldRun) { s = 'ใช้ระบบเก่าแทน'; cls = 'ok'; fall++; } else { s = 'งานหยุดชะงัก'; cls = 'bad'; stopped++; } }
        else { s = oldRun && newRun ? 'ใช้ทั้งสองระบบ' : newRun ? 'ใช้ระบบใหม่' : 'ใช้ระบบเก่า'; cls = ''; }
        $('.st', L.lab).textContent = s; L.lab.className = 'tl-lab ' + cls;
      });
      const nm = M.lanes.length;
      say.innerHTML = `${M.note}<br>` + (bug ? `ถ้าระบบใหม่มีบั๊กที่เดือน ${p}: <b style="color:var(--bad)">งานหยุดชะงัก ${stopped} จาก ${nm} ส่วน</b>${fall ? ` และ <b style="color:var(--good)">${fall} ส่วนย้อนไปใช้ระบบเก่าได้</b>` : ''}` : 'ลองสลับเป็น &ldquo;ระบบใหม่มีบั๊ก&rdquo; แล้วเลื่อนเดือน');
    }
    draw();
  })();
  (() => {
    const host = $('#fig-risk');
    const R = MET.map(metrics);
    const mk = (title, key, max, unit) => {
      const box = el('div', { class: 'ch' }, el('div', { class: 'ch-h', text: title }));
      const rows = MET.map((M, i) => { const v = R[i][key]; const r = el('div', { class: 'ch-r' }, el('span', { class: 'ch-l', html: `<i style="background:var(--c-${M.c})"></i>${M.t}` }), el('div', { class: 'ch-b' }, el('div', { style: `--c:var(--c-${M.c});--w:${v / max * 100}%` })), el('b', { class: 'mono', text: v + (unit || '') })); box.append(r); return r; });
      host.append(box); return rows;
    };
    const A = mk('ส่วนงานที่ถูกสลับพร้อมกันโดยไม่มีระบบเก่าสำรอง (มากที่สุด จาก 3)', 'risk', 3, ' / 3');
    const B = mk('เดือน-ส่วนงานที่ต้องรันสองระบบซ้อนกัน', 'cost', 12, '');
    const all = A.concat(B);
    function hl(i) { A.forEach((r, j) => r.classList.toggle('dim', j !== i)); B.forEach((r, j) => r.classList.toggle('dim', j !== i)); }
    document.addEventListener('co-method', e => hl(e.detail)); hl(0);
    Hop.onView(host, () => $$('.ch-b div', host).forEach(d => d.classList.add('grow')), .25);
  })();
  Hop.mcq($('#q-over'), {
    q: 'ธนาคารเปลี่ยนระบบบัญชีหลัก โดยรันระบบเก่าและระบบใหม่พร้อมกัน 3 เดือน แล้วเทียบผลลัพธ์ก่อนเลิกระบบเก่า เป็นการเปลี่ยนระบบแบบใด',
    opts: ['Direct cutover', 'Parallel operation', 'Pilot operation', 'Phased operation'], a: 1,
    whyWrong: { 0: 'direct เลิกระบบเก่าและใช้ระบบใหม่ทันที ไม่มีช่วงซ้อนกัน', 2: 'pilot ทดลองที่บางส่วนของหน่วยงาน ไม่ได้รันสองระบบซ้อน', 3: 'phased เปลี่ยนทีละโมดูล' },
    why: 'ใช้สองระบบพร้อมกันระยะหนึ่งแล้วเลิกระบบเก่า คือ parallel มีความเสี่ยงน้อยแต่ค่าใช้จ่ายสูงเพราะรันสองระบบ',
  });
  Hop.mcq($('#q-over'), {
    q: 'ร้านสะดวกซื้อที่มี 200 สาขา ลองใช้ระบบ POS ใหม่ที่สาขาเดียวก่อน เมื่อไม่พบข้อผิดพลาดจึงเปลี่ยนสาขาอื่นเป็นแบบทันทีทีเดียว เป็นการเปลี่ยนระบบแบบใด',
    opts: ['Parallel operation', 'Pilot operation', 'Phased operation', 'Direct cutover เท่านั้น'], a: 1,
    whyWrong: { 0: 'ไม่ได้รันสองระบบซ้อนกัน', 2: 'phased แบ่งตามโมดูล ไม่ใช่ตามสาขา', 3: 'ส่วนที่เปลี่ยนแบบ direct คือขั้นหลังจากทดลองที่ pilot site แล้ว ภาพรวมทั้งหมดจึงเป็น pilot' },
    why: 'ทดลองกับบางส่วนของหน่วยงาน (pilot site) แล้วจึงเปลี่ยนส่วนอื่นแบบ direct cutover คือ pilot operation',
  });
  Hop.mcq($('#q-over'), {
    q: 'บริษัทเปลี่ยนระบบทีละโมดูล เริ่มจากรับคำสั่งซื้อ ต่อด้วยสต๊อก แล้วจึงบัญชี วิธีนี้ใช้ไม่ได้ถ้าเงื่อนไขใดเกิดขึ้น',
    opts: ['ระบบไม่สามารถแบ่งเป็นโมดูลได้', 'ระบบเก่ามีขนาดใหญ่', 'ผู้ใช้ไม่ได้รับการอบรม', 'ระบบใหม่ซื้อมาจากผู้ขาย'], a: 0,
    whyWrong: { 1: 'ขนาดของระบบเก่าไม่เกี่ยว', 2: 'การอบรมต้องทำอยู่แล้วทุกวิธี', 3: 'ระบบที่ซื้อมาก็เปลี่ยนทีละโมดูลได้ถ้าแบ่งโมดูลได้' },
    why: 'สไลด์ระบุว่า phased ใช้ไม่ได้ถ้าระบบไม่สามารถแบ่งเป็นโมดูลได้ (ส่วน parallel ใช้ไม่ได้ถ้าระบบใหม่ทำงานร่วมกับระบบเก่าไม่ได้)',
  });
  Hop.mcq($('#q-over'), {
    q: 'เมื่อเปรียบเทียบ direct cutover กับ parallel operation ข้อใดถูกต้อง',
    opts: ['direct เสี่ยงสูงกว่าและประหยัดกว่า', 'direct เสี่ยงน้อยกว่าแต่แพงกว่า', 'ทั้งสองแบบเสี่ยงเท่ากัน แต่ parallel ประหยัดกว่า', 'direct ปลอดภัยที่สุดเพราะระบบเก่าถูกเลิกทันที'], a: 0,
    whyWrong: { 1: 'กลับด้าน parallel ต่างหากที่เสี่ยงน้อยกว่าและแพงกว่า', 2: 'ระดับความเสี่ยงต่างกันมาก เพราะ parallel มีระบบเก่าสำรอง', 3: 'ไม่มีระบบเก่าสำรองจึงเสี่ยงที่สุด' },
    why: 'direct = เสี่ยงที่สุด ประหยัดที่สุด ส่วน parallel = เสี่ยงน้อยกว่า แต่แพงกว่าเพราะรันสองระบบพร้อมกัน',
  });

  /* =========================== 7. post-implementation =========================== */
  (() => {
    const host = $('#fig-post');
    const A = [
      { t: 'เอกสารระบบฉบับสุดท้าย', c: 'amber', d: 'คู่มือผู้ใช้และคู่มือผู้ดูแลระบบ (user manual, admin manual) ที่ตรงกับระบบที่ส่งมอบจริง ไม่ใช่ฉบับร่าง' },
      { t: 'การปรับปรุงที่วางแผนไว้', c: 'amber', d: 'รายการแก้ไขและส่วนเสริมที่ระบุได้แล้วและวางแผนจะทำ เช่น ผู้ใช้ขอรายงานเพิ่มอีกชุด ซึ่งจะกลายเป็นงานบำรุงรักษาต่อไป' },
      { t: 'เทียบต้นทุนและเวลาจริงกับที่ประมาณ', c: 'amber', d: 'ต้นทุนและกำหนดการที่ใช้จริง เทียบกับที่ประมาณไว้ตอนต้นโครงการ เช่น ประมาณ 500,000 บาท ใช้จริง 540,000 บาท และล่าช้า 2 สัปดาห์' },
    ];
    const B = [
      { t: 'User training package', c: 'teal', d: 'พนักงานใหม่ต้องได้รับการอบรมระบบขององค์กร และเมื่อระบบเปลี่ยน การอบรมเรื่องที่เปลี่ยนคล้ายการอบรมครั้งแรก จุดมุ่งหมายคือแสดงให้ผู้ใช้เห็นว่าระบบช่วยงานของเขาอย่างไร' },
      { t: 'Help desk', c: 'teal', d: 'จุดติดต่อกลางสำหรับงานบำรุงรักษาด้านไอทีทั้งหมด ช่วยเพิ่มผลิตภาพและการใช้ทรัพยากรสารสนเทศ ใช้ระบบสนับสนุนอัตโนมัติได้หลายแบบ<div class="flow"><span>ผู้ใช้</span><i></i><span class="hd">Help desk</span><i></i><span>แก้ทันที / ระบบอัตโนมัติ / ส่งต่อทีมบำรุงรักษา</span></div>' },
      { t: 'Outsourcing issues', c: 'rose', d: 'จ้างศูนย์บริการภายนอก (เช่น offshore call center) ช่วยลดค่าใช้จ่ายและปล่อยบุคลากรไปพัฒนาผลิตภัณฑ์ได้ แต่ต้องดูปัจจัยสำคัญ: เวลารอสาย, ผลงานของเจ้าหน้าที่สนับสนุน, เครื่องมือสนับสนุนออนไลน์' },
    ];
    const wrap = el('div', { class: 'postw' });
    segment(host, [{ label: 'รายงานฉบับสุดท้าย', dot: 'amber' }, { label: 'การสนับสนุนผู้ใช้', dot: 'teal' }], i => swap(wrap, () => { wrap.replaceChildren(); tileSet(wrap, i ? B : A, i ? 'teal' : 'amber'); }, 130));
    wrap.classList.add('fx'); host.append(wrap); tileSet(wrap, A, 'amber');
  })();
  Hop.mcq($('#q-post'), {
    q: 'ข้อใดไม่ต้องอยู่ในรายงานฉบับสุดท้ายถึงฝ่ายบริหารตามสไลด์',
    opts: ['เอกสารระบบฉบับสุดท้ายทั้งหมด', 'การปรับปรุงและเพิ่มเติมระบบที่วางแผนไว้', 'การเปรียบเทียบต้นทุนและกำหนดเวลาจริงกับที่ประมาณไว้เดิม', 'รายชื่อพนักงานทุกคนที่เคยใช้ระบบเก่า'], a: 3,
    why: 'สามอย่างที่ระบุ: เอกสารฉบับสุดท้าย (คู่มือผู้ใช้ ผู้ดูแล), การปรับปรุงที่วางแผน, เทียบต้นทุน/เวลาจริงกับประมาณการ',
  });
  Hop.mcq($('#q-post'), {
    q: 'องค์กรจ้าง offshore call center ดูแลผู้ใช้แทน เพื่อลดค่าใช้จ่าย ข้อใดคือปัจจัยสำคัญที่ต้องประเมินตามสไลด์',
    opts: ['เวลารอสายของผู้ใช้ ผลงานเจ้าหน้าที่ และเครื่องมือสนับสนุนออนไลน์', 'สีของโลโก้บริษัทผู้ให้บริการ', 'จำนวนโมดูลของระบบเก่า', 'ขนาดของหน้ากระดาษที่ใช้พิมพ์รายงาน'], a: 0,
    why: 'ปัจจัยสำคัญที่สไลด์ยกตัวอย่างคือ phone wait times, support staff performance และ online support tools',
  });

  /* =========================== 8. maintenance sorter =========================== */
  (() => {
    const host = $('#fig-maint');
    const BINS = [
      { k: 'corrective', c: 'rose', t: 'Corrective', d: 'แก้ข้อผิดพลาด' },
      { k: 'preventive', c: 'green', t: 'Preventive', d: 'วิเคราะห์ กันก่อนเกิด' },
      { k: 'adaptive', c: 'blue', t: 'Adaptive', d: 'เพิ่มความสามารถ ใช้ง่ายขึ้น' },
      { k: 'perfective', c: 'violet', t: 'Perfective', d: 'เร็ว เชื่อถือได้ ดูแลง่าย' },
    ];
    const S = [
      { t: 'ระบบจ่ายเงินเดือนล่มตอนสิ้นเดือน ทีมซ่อมจนกลับมาใช้ได้ แล้วตามหาสาเหตุเพื่อออกแบบวิธีแก้ถาวร', a: 'corrective', why: 'วินิจฉัยและแก้ข้อผิดพลาดในระบบที่ใช้งานอยู่ (กรณีเลวร้ายที่สุดคือระบบล่ม)' },
      { t: 'ผู้ใช้ขอให้เพิ่มปุ่มส่งออกรายงานเป็นไฟล์ Excel', a: 'adaptive', why: 'เพิ่มส่วนเสริม (enhancement) ให้ระบบที่ใช้งานอยู่' },
      { t: 'ปรับหน้าจอป้อนข้อมูลให้ใช้ง่ายขึ้นตามความเห็นของผู้ใช้', a: 'adaptive', why: 'สไลด์ระบุว่า adaptive รวมถึงการทำให้ระบบใช้ง่ายขึ้น' },
      { t: 'ปรับโค้ดให้รายงานที่เคยใช้เวลา 40 วินาที เหลือ 5 วินาที โดยฟังก์ชันเหมือนเดิมทุกอย่าง', a: 'perfective', why: 'ทำให้ระบบมีประสิทธิภาพขึ้นโดยไม่เพิ่มฟังก์ชัน คือ perfective' },
      { t: 'จัดโครงสร้างโปรแกรมใหม่ เพื่อให้โปรแกรมเมอร์คนต่อไปแก้ไขได้ง่ายขึ้น', a: 'perfective', why: 'ทำให้ระบบบำรุงรักษาง่ายขึ้น (maintainable) คือ perfective' },
      { t: 'ฝ่ายไอทีวิเคราะห์พบว่าดิสก์ของเซิร์ฟเวอร์ฐานข้อมูลจะเต็มภายในสองเดือน จึงขยายพื้นที่ก่อนระบบหยุดทำงาน', a: 'preventive', why: 'วิเคราะห์จุดที่น่าจะเกิดปัญหาแล้วจัดการก่อนเกิด ระบบยังไม่เสีย จึงไม่ใช่ corrective' },
      { t: 'ตรวจโมดูลที่เคยมีบั๊กบ่อย แล้วแก้จุดเสี่ยงก่อนที่จะทำให้ระบบล่มอีก', a: 'preventive', why: 'ยังไม่เกิดความเสียหายครั้งใหม่ ทำก่อนปัญหาเกิด คือ preventive' },
      { t: 'พบว่าระบบคำนวณส่วนลดผิดสำหรับลูกค้าสมาชิก จึงแก้โค้ดให้ถูกต้อง', a: 'corrective', why: 'ข้อผิดพลาดเกิดขึ้นแล้ว ต้องแก้ให้ถูก คือ corrective' },
    ];
    let q = Hop.shuffle(S), i = 0, ok1 = 0, tries = 0, done = 0;
    const counts = {}; BINS.forEach(b => counts[b.k] = 0);
    const card = el('div', { class: 'mcard fx' });
    const prog = el('div', { class: 'mprog mono' });
    const grid = el('div', { class: 'mbins' }, BINS.map(b => el('button', { class: 'mbin', style: `--tc:var(--c-${b.c});--tcs:var(--c-${b.c}-s)`, onclick: ev => pickBin(b, ev.currentTarget), html: `<b>${b.t}</b><span>${b.d}</span><em class="mono">0</em>` })));
    const say = el('p', { class: 'say fx' });
    host.append(prog, card, grid, say);
    function show() {
      if (i >= q.length) { card.innerHTML = `<b>จัดครบ ${q.length} สถานการณ์</b> ถูกตั้งแต่ครั้งแรก ${ok1} ข้อ`; const b = el('button', { class: 'btn small', text: 'เริ่มใหม่', onclick: restart }); card.append(' ', b); prog.textContent = `${q.length} / ${q.length}`; return; }
      prog.textContent = `${i + 1} / ${q.length}`; tries = 0;
      swap(card, () => { card.textContent = q[i].t; }, 120);
    }
    function restart() { q = Hop.shuffle(S); i = 0; ok1 = 0; BINS.forEach(b => counts[b.k] = 0); $$('.mbin em', grid).forEach(e => e.textContent = 0); say.innerHTML = ''; show(); }
    function pickBin(b, btn) {
      if (i >= q.length) return; const s = q[i];
      if (b.k === s.a) {
        if (tries === 0) ok1++;
        counts[b.k]++; $('em', btn).textContent = counts[b.k]; btn.classList.remove('bad'); btn.classList.add('good'); setTimeout(() => btn.classList.remove('good'), 700);
        say.classList.add('fx-out'); setTimeout(() => { say.innerHTML = `<b style="color:var(--c-${b.c})">${b.t}</b> ${s.why}`; say.classList.remove('fx-out'); }, 100);
        i++; setTimeout(show, 900);
      } else {
        tries++; btn.classList.remove('bad'); void btn.offsetWidth; btn.classList.add('bad');
        say.classList.add('fx-out'); setTimeout(() => { say.innerHTML = `ยังไม่ใช่ <b style="color:var(--c-${b.c})">${b.t}</b> คือ ${Hop.C[b.k].short}`; say.classList.remove('fx-out'); }, 100);
      }
    }
    show();
  })();
  Hop.mcq($('#q-maint'), {
    q: 'ฝ่ายไอทีสังเกตว่าหน่วยความจำของเซิร์ฟเวอร์ถูกใช้เพิ่มขึ้นทุกสัปดาห์และจะเต็มในอีกสามเดือน จึงอัปเกรดก่อนที่ระบบจะช้าหรือล่ม เป็นการบำรุงรักษาแบบใด',
    opts: ['Corrective', 'Adaptive', 'Perfective', 'Preventive'], a: 3,
    whyWrong: { 0: 'corrective แก้ปัญหาที่เกิดขึ้นแล้ว ที่นี่ยังไม่เกิดปัญหา', 1: 'adaptive คือเพิ่มส่วนเสริมหรือทำให้ใช้ง่ายขึ้น', 2: 'perfective ปรับให้เร็ว เชื่อถือได้ ดูแลง่าย โดยไม่เพิ่มฟังก์ชัน ไม่ได้เน้นป้องกันปัญหาที่วิเคราะห์ไว้ล่วงหน้า' },
    why: 'วิเคราะห์จุดที่น่าจะเกิดปัญหาแล้วจัดการก่อนเกิด คือ preventive ฝ่ายไอทีมักเป็นผู้ริเริ่ม',
  });
  Hop.mcq($('#q-maint'), {
    q: 'ระบบเดิมใช้ได้ปกติ แต่ผู้ใช้ขอให้เพิ่มรายงานสรุปรายเดือนอีกหนึ่งชุด การบำรุงรักษานี้ตรงกับแบบใดตามสไลด์',
    opts: ['Corrective', 'Adaptive', 'Perfective', 'Preventive'], a: 1,
    whyWrong: { 0: 'ไม่มีข้อผิดพลาดให้แก้', 2: 'perfective ไม่เพิ่มฟังก์ชันใหม่ แค่ทำให้ของเดิมดีขึ้น', 3: 'ไม่ได้ป้องกันปัญหาใด' },
    why: 'สไลด์: adaptive เพิ่มส่วนเสริม (enhancement) ให้ระบบที่ใช้งานอยู่ ซึ่งต้องทำงานภายใต้ข้อจำกัดของระบบเดิม',
  });
})();
