// Chapter 2 figures: database design, keys, ERD, normalization walkthrough.
(() => {
  const { $, $$, el, esc, clamp, lerp, ease, icon } = Hop;
  const DV = window.DataViz;
  Hop.page(2);

  const COL = k => (Hop.C[k] || {}).c || 'ink';
  const tcStyle = k => `--tc: var(--c-${COL(k)}); --tcs: var(--c-${COL(k)}-s)`;
  // segmented control: items [[key,label]]
  function Seg(items, val, on) {
    const box = el('div', { class: 'seg', role: 'group' });
    const btns = items.map(([k, label]) => el('button', { 'aria-pressed': String(k === val), text: label, onclick: () => { set(k); on(k); } }));
    box.append(...btns);
    function set(k) { btns.forEach((b, i) => b.setAttribute('aria-pressed', String(items[i][0] === k))); }
    return { box, set };
  }
  const chip = (text, on, pressed) => el('button', { class: 'chip', text, 'aria-pressed': String(!!pressed), onclick: on });
  const readout = (k, v, n) => el('button', { class: 'rd', 'data-k': k, style: tcStyle(k) }, el('div', { class: 'v', html: v }), el('div', { class: 'n', html: n || Hop.C[k].t }));
  const RNG = { '1,1': ['1 รายการเท่านั้น', 'one and only one'], '0,1': ['0 หรือ 1 รายการ', 'zero or one'], '1,M': ['1 รายการขึ้นไป', 'one or many'], '0,M': ['0 รายการขึ้นไป', 'zero or many'] };
  const rng = (mn, mx) => RNG[mn + ',' + mx];

  /* ---------- map hero ---------- */
  (() => {
    const host = $('#map');
    const B = (k, label, sub) => el('button', { class: 'mp', 'data-k': k, style: tcStyle(k), html: `<b>${label}</b>${sub ? `<span>${sub}</span>` : ''}` });
    const band = (title, ...kids) => el('div', { class: 'mband' }, el('div', { class: 'mlbl', text: title }), el('div', { class: 'mrow' }, ...kids));
    host.append(
      band('เก็บข้อมูลที่เดียว', B('filesys', 'File processing', 'ไฟล์แยกระบบ'), el('span', { class: 'marr', text: '→' }), B('database', 'Database', 'ตารางที่เชื่อมกัน'), B('redundancy', 'Redundancy', 'ข้อมูลซ้ำ')),
      band('DBMS', B('iface', 'Interface', 'ผู้ใช้ DBA ระบบอื่น'), B('dml', 'DML'), B('schema', 'Schema'), B('subschema', 'Subschema'), B('repo', 'Physical repository', 'ODBC'), B('dba', 'DBA'), B('middleware', 'Middleware', 'เชื่อมเว็บ'), B('indep', 'Data independence')),
      band('ตารางและ key', B('entity', 'Entity'), B('table', 'Table'), B('field', 'Field'), B('record', 'Record'), B('commonfield', 'Common field'), B('pk', 'Primary key'), B('combkey', 'Combination key'), B('candkey', 'Candidate key'), B('fk', 'Foreign key'), B('seckey', 'Secondary key'), B('ri', 'Referential integrity')),
      band('ERD', B('erd', 'ERD', 'entity = นาม, เส้น = กริยา'), B('r11', '1:1'), B('r1m', '1:M'), B('rmn', 'M:N'), B('assoc', 'Associative entity'), B('cardinality', 'Cardinality'), B('crow', "Crow's foot")),
      band('Normalization', B('unf', 'UNF', 'มี repeating group'), el('span', { class: 'marr', text: '→' }), B('nf1', '1NF', 'แตก repeating group'), el('span', { class: 'marr', text: '→' }), B('nf2', '2NF', 'ไม่มี partial'), el('span', { class: 'marr', text: '→' }), B('nf3', '3NF', 'ไม่มี non-key → non-key'), B('fd', 'Functional dependency')),
      band('ใช้และปกป้องข้อมูล', B('warehouse', 'Data warehouse'), B('mart', 'Data mart'), B('mining', 'Data mining'), B('control', 'Data control')));
  })();

  /* ---------- 1. file processing vs database ---------- */
  (() => {
    const host = $('#fig-file');
    let mode = 'file', changed = false;
    const tbl = (name, phone, o = {}) => `<div class="mt ${o.cls || ''}"><div class="mtn">${name}</div><table class="dt mini"><thead><tr><th>CustID</th><th>Name</th><th>Phone</th></tr></thead><tbody><tr><td>C1</td><td>สมชาย</td><td class="${o.hl || ''}">${phone}</td></tr></tbody></table>${o.tag ? `<div class="mtag ${o.tagc || ''}">${o.tag}</div>` : ''}</div>`;
    const stage = el('div', { class: 'fstage' });
    const say = el('p', { class: 'say' });
    const sg = Seg([['file', 'ไฟล์แยก (Mario)'], ['db', 'ฐานข้อมูล (Danica)']], mode, k => { mode = k; changed = false; draw(); });
    const go = el('button', { class: 'btn small primary', onclick: () => { changed = true; draw(); } });
    const rs = el('button', { class: 'btn small ghost', html: `${icon('replay')} เริ่มใหม่`, onclick: () => { changed = false; draw(); } });
    host.append(el('div', { class: 'ctrls', style: 'margin:0 0 16px' }, sg.box), stage, el('div', { class: 'ctrls' }, go, rs), say);
    function draw() {
      const p0 = '081-111', p1 = '089-999';
      go.textContent = 'เปลี่ยนเบอร์โทรสมชายเป็น ' + p1; go.disabled = changed;
      if (mode === 'file') {
        stage.innerHTML = `<div class="sys"><div class="sysn">ระบบรับซ่อม</div><div class="sysb">${tbl('ไฟล์ลูกค้า (สำเนา 1)', changed ? p1 : p0, { hl: changed ? 'new' : '', tag: changed ? 'แก้แล้ว' : '', tagc: 'ok' })}</div></div><div class="sys"><div class="sysn">ระบบบัญชี</div><div class="sysb">${tbl('ไฟล์ลูกค้า (สำเนา 2)', p0, { cls: changed ? 'stale' : '', tag: changed ? 'ยังเป็นเบอร์เก่า' : '', tagc: 'no' })}</div></div>`;
        say.innerHTML = changed ? `พนักงานแก้เฉพาะระบบรับซ่อม ระบบบัญชีไม่รู้เรื่อง ตอนนี้ลูกค้าคนเดียวมี <b style="color:var(--c-rose)">สองเบอร์</b> และไม่มีใครรู้ว่าเบอร์ไหนถูก นี่คือ ${Hop.t('redundancy')} ที่ทำให้ข้อมูลขัดแย้ง` : 'ข้อมูลลูกค้าคนเดียวกันถูกเก็บในไฟล์ของทั้งสองระบบ ต้องกรอกสองครั้ง';
      } else {
        stage.innerHTML = `<div class="sys2"><div class="sysrow"><span class="sysn s">ระบบรับซ่อม</span><span class="sysn s">ระบบบัญชี</span></div><div class="sysrow up"><span>▲</span><span>▲</span></div>${tbl('CUSTOMER (ตารางเดียว)', changed ? p1 : p0, { hl: changed ? 'new' : '', tag: changed ? 'แก้ที่เดียว' : '', tagc: 'ok' })}</div>`;
        say.innerHTML = changed ? `แก้ที่เดียว ทั้งสองระบบอ่านจากตารางเดียวกัน จึงเห็น <b style="color:var(--c-green)">${p1}</b> ตรงกันทันที` : 'ข้อมูลลูกค้าอยู่ในตารางเดียว ทุกระบบดึงไปใช้ร่วมกัน';
      }
    }
    draw();
  })();

  /* ---------- 2. DBMS request path ---------- */
  (() => {
    const host = $('#fig-dbms');
    const TABLES = ['CUSTOMER', 'ORDER', 'PRODUCT', 'EMPLOYEE', 'SALARY'];
    const ACTORS = {
      user: { name: 'ผู้ใช้ฝ่ายขาย', cmd: 'ดูใบสั่งซื้อของลูกค้า C1 จาก query ที่เตรียมไว้', sub: ['CUSTOMER', 'ORDER', 'PRODUCT'] },
      dba: { name: 'DBA', cmd: 'เพิ่ม field ใหม่ในตาราง CUSTOMER และกำหนดสิทธิ์ผู้ใช้', sub: TABLES },
      sys: { name: 'ระบบบัญชี', cmd: 'ขอยอดรวมจากตาราง ORDER ไปออกใบแจ้งหนี้', sub: ['CUSTOMER', 'ORDER'] },
      web: { name: 'ลูกค้าบนเว็บ', cmd: 'ดูสถานะ ORDER ของตัวเองผ่านเบราว์เซอร์', sub: ['ORDER', 'PRODUCT'], web: true },
    };
    let actor = 'user', stage = 0, moved = false;
    const sg = Seg([['user', 'ผู้ใช้'], ['dba', 'DBA'], ['sys', 'ระบบอื่น'], ['web', 'ผู้ใช้เว็บ']], actor, k => { actor = k; upd(); });
    const mv = el('button', { class: 'btn small', onclick: () => { moved = !moved; upd(); } });
    const NODE = (cls, k, title, sub) => el('button', { class: 'dn ' + cls, 'data-k': k, style: tcStyle(k) }, el('b', { text: title }), el('span', { class: 'sb', html: sub || '' }));
    const nAct = el('div', { class: 'dn act' }), nMw = NODE('mw', 'middleware', 'Middleware', 'เบราว์เซอร์คุยกับ DBMS ไม่ได้ตรงๆ'), nIf = NODE('if', 'iface', 'Interface', ''),
      nDml = NODE('dml', 'dml', 'DML', 'ตีความคำสั่ง'), nSub = NODE('sub', 'subschema', 'Subschema', ''), nRepo = NODE('repo', 'repo', 'Physical data repository', '');
    const flow = el('div', { class: 'dflow' }, nAct, nMw, nIf, nDml, nSub, nRepo);
    const sch = el('div', { class: 'dschema' }, el('button', { class: 'dsh', 'data-k': 'schema', style: tcStyle('schema'), text: 'Schema (ทุกตาราง)' }), ...TABLES.map(t => el('div', { class: 'dtb', 'data-t': t, text: t })));
    const board = el('div', { class: 'dbx' }, flow, sch);
    const say = el('p', { class: 'say' });
    host.append(el('div', { class: 'ctrls', style: 'margin:0 0 4px' }, sg.box));
    const sc = Hop.scrub(host, {
      stops: [{ label: 'ส่งคำสั่งเข้า interface' }, { label: 'DML ตีความคำสั่ง' }, { label: 'ตรวจกับ subschema' }, { label: 'repository ส่งข้อมูลกลับ' }],
      speed: 1300, onFrame(t) { const k = Math.round(t); if (k !== stage) { stage = k; upd(); } },
    });
    board.style.marginTop = '18px';
    host.append(board, say, el('div', { class: 'ctrls' }, mv));
    function upd() {
      const a = ACTORS[actor];
      nAct.textContent = a.name; nMw.hidden = !a.web;
      nIf.querySelector('.sb').textContent = actor === 'dba' ? 'ทางเข้าของ DBA' : actor === 'sys' ? 'ทางเข้าของระบบอื่น' : actor === 'web' ? 'ทางเข้าของผู้ใช้ (ผ่านเว็บ)' : 'ทางเข้าของผู้ใช้';
      nSub.querySelector('.sb').textContent = actor === 'dba' ? 'เห็นทั้ง schema' : 'เห็น ' + a.sub.length + ' จาก 5 ตาราง';
      nRepo.querySelector('.sb').innerHTML = (moved ? 'เครื่อง B (ย้ายมาใหม่)' : 'เครื่อง A') + ' ผ่าน ODBC';
      const idx = stage + 1; // 0 = actor
      [nAct, nIf, nDml, nSub, nRepo].forEach((n, i) => { n.classList.toggle('on', i === idx); n.classList.toggle('past', i < idx); });
      nMw.classList.remove('on'); nMw.classList.toggle('past', !!a.web);
      $$('.dtb', sch).forEach(d => { const ok = a.sub.includes(d.dataset.t); d.classList.toggle('in', ok && stage >= 2); d.classList.toggle('out', !ok && stage >= 2); });
      sch.querySelector('.dsh').classList.toggle('on', stage >= 2);
      const L = [
        `${a.name} ส่งคำสั่ง "${a.cmd}" ${a.web ? 'ผ่านเบราว์เซอร์ ซึ่งต้องผ่าน middleware ก่อน เพราะเบราว์เซอร์พูด HTML ส่วนฐานข้อมูลพูดอีกภาษา แล้วเข้า' : 'เข้า'} interface`,
        'DML รับคำสั่งแล้วตีความว่าต้องเพิ่ม แก้ ลบ หรือค้นข้อมูลอะไร',
        actor === 'dba' ? 'DBA ได้เห็น schema ทั้งหมด เพราะมีหน้าที่ดูแลทุกตาราง' : `ตรวจกับ subschema ของ${a.name}: เห็นได้เฉพาะ ${a.sub.join(', ')} ตารางอื่นอยู่นอกสิทธิ์ schema คือคำอธิบายของทั้ง 5 ตาราง subschema คือส่วนที่คนนี้เห็น`,
        'physical data repository อ่านหรือเขียนข้อมูลจริง ผ่านซอฟต์แวร์ที่รองรับ ODBC แล้วส่งผลย้อนกลับไปทางเดิม',
      ];
      say.innerHTML = L[stage] + (moved ? ` <b style="color:var(--c-teal)">ที่เก็บข้อมูลย้ายไปเครื่อง B แล้ว แต่ interface, DML, schema ไม่ต้องแก้เลย นี่คือ ${Hop.t('indep')}</b>` : '');
      mv.innerHTML = moved ? 'ย้ายที่เก็บข้อมูลกลับเครื่อง A' : 'ลองย้ายที่เก็บข้อมูลไปเครื่องอื่น';
    }
    upd();
  })();

  /* ---------- 3. terms ---------- */
  (() => {
    const host = $('#fig-terms');
    let mode = 'entity', col = null, row = null;
    const CUST = { name: 'CUSTOMER', cols: ['CustID', 'Name', 'Phone'], rows: [['C1', 'สมชาย', '081-111'], ['C2', 'มานี', '082-222'], ['C3', 'วิชัย', '083-333']] };
    const ORD = { name: 'ORDER', cols: ['OrderNo', 'OrderDate', 'CustID'], rows: [['501', '05/08', 'C1'], ['502', '06/08', 'C1'], ['503', '06/08', 'C2']] };
    const modes = [['entity', 'Entity'], ['table', 'Table'], ['field', 'Field'], ['record', 'Record'], ['common', 'Common field']];
    const sg = Seg(modes, mode, k => { mode = k; col = row = null; upd(); });
    const wrap = el('div', { class: 'tpair' });
    const say = el('p', { class: 'say' });
    host.append(el('div', { class: 'ctrls', style: 'margin:0 0 16px' }, sg.box), wrap, say);
    const mk = T => {
      const t = el('div', { class: 'tbox', 'data-n': T.name });
      const nm = el('button', { class: 'tname', text: T.name, onclick: () => { mode = 'entity'; col = row = null; sg.set(mode); upd(); } });
      const tb = el('table', { class: 'dt' }, el('thead', {}, el('tr', {}, T.cols.map((c, i) => el('th', { 'data-c': i, onclick: () => { mode = 'field'; col = i; row = null; sg.set(mode); upd(); } }, el('span', { text: c }))))),
        el('tbody', {}, T.rows.map((r, ri) => el('tr', { 'data-r': ri, onclick: () => { mode = 'record'; row = ri; col = null; sg.set(mode); upd(); } }, r.map((v, i) => el('td', { 'data-c': i, text: v }))))));
      t.append(nm, el('div', { class: 'tw' }, tb));
      return t;
    };
    wrap.append(mk(CUST), mk(ORD));
    function upd() {
      $$('.tbox', wrap).forEach(t => {
        const isC = t.dataset.n === 'CUSTOMER';
        t.className = 'tbox m-' + mode;
        $$('th,td', t).forEach(c => c.classList.remove('sel'));
        $$('tr', t).forEach(c => c.classList.remove('sel'));
        if (mode === 'field' && isC) $$('th,td', t).forEach(c => { if (col == null ? c.tagName === 'TH' : +c.dataset.c === col) c.classList.add('sel'); });
        if (mode === 'record') { if (isC) $$('tbody tr', t)[row == null ? 1 : row].classList.add('sel'); }
        if (mode === 'common') $$('th,td', t).forEach(c => { if (+c.dataset.c === (isC ? 0 : 2)) c.classList.add('sel'); });
      });
      const hot = (k, s) => `<b style="color:var(--c-blue)">${s}</b>`;
      const S = {
        entity: `${hot('', 'CUSTOMER')} คือ ${Hop.t('entity')}: สิ่งที่เราเก็บข้อมูล (ลูกค้า) อีกตัวคือ ${hot('', 'ORDER')} (ใบสั่งซื้อ) ชื่อ entity เป็นคำนามเอกพจน์`,
        table: `${Hop.t('table')} CUSTOMER เก็บชุด record ของ entity CUSTOMER ทั้งหมด หนึ่ง entity ได้หนึ่งตาราง`,
        field: col == null ? `${Hop.t('field')} (attribute) คือคอลัมน์: CustID, Name, Phone หนึ่งคอลัมน์เก็บข้อเท็จจริงหนึ่งอย่างเกี่ยวกับลูกค้า` : `คอลัมน์ ${hot('', CUST.cols[col])} คือหนึ่ง ${Hop.t('field')} ของ CUSTOMER`,
        record: `${Hop.t('record')} (tuple) คือแถวเดียว ${hot('', 'ลูกค้า ' + CUST.rows[row == null ? 1 : row][0])} หนึ่งคน ตาราง CUSTOMER นี้มี 3 record`,
        common: `${Hop.t('commonfield')}: <b style="color:var(--c-blue)">CustID</b> ปรากฏทั้งใน CUSTOMER และ ORDER จึงใช้เชื่อมสองตาราง รู้ว่าใบสั่งซื้อ 501 เป็นของ C1`,
      };
      say.innerHTML = S[mode];
    }
    upd();
  })();

  /* ---------- 4. keys ---------- */
  (() => {
    const host = $('#fig-keys');
    const cols = ['StdID', 'CitizenID', 'Name', 'Major', 'AdvID'];
    const rows = [
      ['6501', '1100-1', 'สมชาย ใจดี', 'CS', 'A1'],
      ['6502', '1100-2', 'สมหญิง ใจดี', 'CS', 'A1'],
      ['6503', '1100-3', 'สมชาย ใจดี', 'IT', 'A2'],
      ['6504', '1100-4', 'มานี มีสุข', 'CS', 'A2'],
      ['6505', '1100-5', 'มานี มีสุข', 'IT', 'A2']];
    let sel = [0], pk = [0];
    const dupOf = ix => { const seen = new Map(); for (let r = 0; r < rows.length; r++) { const k = ix.map(c => rows[r][c]).join('|'); if (seen.has(k)) return [seen.get(k), r]; seen.set(k, r); } return null; };
    const unique = ix => ix.length > 0 && !dupOf(ix);
    const minimal = ix => ix.length === 1 || ix.every(c => !unique(ix.filter(x => x !== c)));
    const names = ix => ix.map(c => cols[c]).join(' + ');
    const subsets = [];
    for (let m = 1; m < 32; m++) { const ix = cols.map((_, i) => i).filter(i => m & (1 << i)); if (ix.length <= 3 && unique(ix) && minimal(ix)) subsets.push(ix); }
    subsets.sort((a, b) => a.length - b.length || a[0] - b[0]);
    const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

    const wrap = el('div', { class: 'tw' });
    const verdict = el('p', { class: 'say' });
    const act = el('div', { class: 'ctrls' });
    const reads = el('div', { class: 'reads' });
    host.append(wrap, verdict, act, reads);
    function upd() {
      const s = [...sel].sort((a, b) => a - b), dup = dupOf(s);
      const cand = unique(s) && minimal(s);
      const rowsDup = dup ? new Set(dup) : new Set();
      const tags = cols.map((c, i) => pk.includes(i) ? 'PK' : subsets.some(x => x.length === 1 && x[0] === i) ? 'CK' : i === 4 ? 'FK' : i === 3 ? 'SK' : '');
      wrap.innerHTML = `<table class="dt keyt"><thead><tr class="tags">${cols.map((c, i) => `<th><span class="tg ${tags[i]}">${tags[i]}</span></th>`).join('')}</tr><tr>${cols.map((c, i) => `<th class="hd ${s.includes(i) ? 'csel' : ''} ${pk.includes(i) ? 'pk' : ''}" data-c="${i}"><button type="button"><span>${c}</span></button></th>`).join('')}</tr></thead><tbody>${rows.map((r, ri) => `<tr class="${rowsDup.has(ri) ? 'dupr' : ''}">${r.map((v, i) => `<td class="${s.includes(i) ? 'csel' : ''}">${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      $$('.hd button', wrap).forEach((b, i) => b.onclick = () => { sel = sel.includes(i) ? sel.filter(x => x !== i) : [...sel, i]; upd(); });
      let msg;
      if (!s.length) msg = 'แตะหัวคอลัมน์เพื่อเลือก field';
      else if (dup) msg = `แถว ${dup[0] + 1} กับแถว ${dup[1] + 1} มี <b>${names(s)}</b> เหมือนกัน (${s.map(c => rows[dup[0]][c]).join(' / ')}) จึงระบุแถวไม่เจาะจง <b style="color:var(--c-rose)">ใช้เป็น key ไม่ได้</b>`;
      else if (!minimal(s)) { const x = s.find(c => unique(s.filter(y => y !== c))); msg = `<b>${names(s)}</b> ระบุแถวได้ แต่ <b style="color:var(--c-rose)">เกินจำเป็น</b> ตัด ${cols[x]} ออกก็ยังไม่ซ้ำ จึงไม่ minimal และไม่ใช่ key`; }
      else msg = s.length === 1 ? `<b>${cols[s[0]]}</b> ไม่ซ้ำเลยและเล็กที่สุด เป็น <b style="color:var(--c-amber)">candidate key</b>` : `<b>${names(s)}</b> รวมกันไม่ซ้ำ ตัดตัวใดออกก็ซ้ำ เป็น <b style="color:var(--c-amber)">candidate key แบบ combination key</b>`;
      verdict.innerHTML = msg + (cand ? '' : '') + ' (ตัดสินจากข้อมูลตัวอย่าง 5 แถวนี้)';
      act.replaceChildren();
      if (cand) act.append(same(s, pk) ? el('span', { class: 'readout', html: 'ตอนนี้เป็น Primary key อยู่แล้ว' }) : el('button', { class: 'btn small primary', text: 'ตั้ง ' + names(s) + ' เป็น Primary key', onclick: () => { pk = s; upd(); } }));
      const cands = subsets.map(x => names(x) + (same(x, pk) ? ' (PK)' : '')).join(', ');
      const multi = subsets.filter(x => x.length > 1).map(names);
      reads.replaceChildren(
        readout('pk', names(pk), 'Primary key'),
        readout('combkey', pk.length > 1 ? names(pk) : (multi[0] || '-'), pk.length > 1 ? 'Combination key (PK ตอนนี้)' : 'Combination key ที่มีในตาราง'),
        readout('candkey', cands, 'Candidate key ทั้งหมด'),
        readout('fk', 'AdvID', 'Foreign key (ชี้ไป ADVISOR)'),
        readout('seckey', 'Major', 'Secondary key (ใช้ค้นสาขา)'));
    }
    upd();
  })();
  Hop.mcq($('#q-keys'), {
    q: 'ตาราง ENROLL (StdID, CourseID, Grade) นักศึกษาหนึ่งคนลงได้หลายวิชา และวิชาหนึ่งมีนักศึกษาหลายคน Primary key ควรเป็นอะไร',
    opts: ['StdID', 'CourseID', 'StdID + CourseID', 'Grade'], a: 2,
    whyWrong: { 0: 'StdID ซ้ำทันทีเมื่อนักศึกษาคนเดิมลงวิชาที่สอง', 1: 'CourseID ซ้ำทันทีเมื่อวิชาเดียวมีนักศึกษาสองคน', 3: 'Grade ซ้ำได้ (A หลายคน) และไม่บอกว่าเป็นของใครวิชาไหน' },
    why: 'ไม่มี field เดียวที่ไม่ซ้ำ แต่คู่ (StdID, CourseID) ไม่ซ้ำ เพราะนักศึกษาคนหนึ่งลงวิชาเดียวกันได้ครั้งเดียว และตัดตัวใดออกก็ซ้ำ จึงเป็น combination key',
  });

  /* ---------- 5. referential integrity ---------- */
  (() => {
    const host = $('#fig-ri');
    const INIT = () => ({ cust: [['C1', 'สมชาย'], ['C2', 'มานี'], ['C3', 'วิชัย']], ord: [[501, 'C1'], [502, 'C1'], [503, 'C2']], on: true, msg: '', ok: null, done: new Set(), flash: null });
    let S = INIT();
    const sg = Seg([['on', 'บังคับ RI: เปิด'], ['off', 'บังคับ RI: ปิด']], 'on', k => { S = { ...INIT(), on: k === 'on' }; draw(); });
    const pair = el('div', { class: 'tpair' });
    const say = el('p', { class: 'say' });
    const btns = el('div', { class: 'ractions' });
    host.append(el('div', { class: 'ctrls', style: 'margin:0 0 16px' }, sg.box), pair, btns, say);
    const ACTS = {
      bad: { label: 'เพิ่ม ORDER 504 ของลูกค้า C9 (ไม่มีใน CUSTOMER)', run: () => {
        if (S.on) return rej('ปฏิเสธ: CustID = C9 ไม่มีอยู่ใน CUSTOMER ค่า FK ต้องชี้ไปหา PK ที่มีจริง', 'ord');
        S.ord.push([504, 'C9']); return acc('เพิ่มสำเร็จ แต่ ORDER 504 อ้างลูกค้า C9 ที่ไม่มีอยู่ เป็น record กำพร้า ไม่มีใครรู้ว่าใครสั่ง', false); } },
      good: { label: 'เพิ่ม ORDER 504 ของลูกค้า C3', run: () => { S.ord.push([504, 'C3']); return acc('เพิ่มได้ เพราะ C3 มีอยู่ใน CUSTOMER', true); } },
      delP: { label: 'ลบลูกค้า C1 (ยังมี ORDER 501, 502)', run: () => {
        if (S.on) return rej('ปฏิเสธ: ยังมี ORDER 501 และ 502 อ้างถึง C1 อยู่ ต้องจัดการ ORDER เหล่านั้นก่อน', 'cust');
        S.cust = S.cust.filter(c => c[0] !== 'C1'); return acc('ลบ C1 สำเร็จ แต่ ORDER 501 และ 502 ยังอ้าง C1 ซึ่งไม่มีแล้ว กลายเป็น record กำพร้า', false); } },
      delN: { label: 'ลบลูกค้า C3 (ไม่มี ORDER)', run: () => { S.cust = S.cust.filter(c => c[0] !== 'C3'); return acc('ลบได้ เพราะไม่มี ORDER ไหนอ้างถึง C3', true); } },
      delC: { label: 'ลบ ORDER 501 (ฝั่งลูก)', run: () => { S.ord = S.ord.filter(o => o[0] !== 501); return acc('ลบได้เสมอ การลบฝั่งลูกไม่ทำให้ใครกำพร้า', true); } },
    };
    function rej(m, t) { S.msg = m; S.ok = false; S.flash = t; return 'rej'; }
    function acc(m, good) { S.msg = m; S.ok = good; S.flash = null; return 'ok'; }
    Object.entries(ACTS).forEach(([k, a]) => btns.append(el('button', { class: 'btn small', 'data-a': k, text: a.label, onclick: () => { if (S.done.has(k)) return; const r = a.run(); if (r === 'ok') S.done.add(k); draw(); } })));
    btns.append(el('button', { class: 'btn small ghost', html: `${icon('replay')} เริ่มใหม่`, onclick: () => { S = { ...INIT(), on: S.on }; draw(); } }));
    function draw() {
      sg.set(S.on ? 'on' : 'off');
      const ids = new Set(S.cust.map(c => c[0]));
      const T1 = `<div class="tbox ${S.flash === 'cust' ? 'shake' : ''}"><div class="tname plain">CUSTOMER (แม่)</div><div class="tw"><table class="dt"><thead><tr><th class="pk"><span>CustID</span></th><th>Name</th></tr></thead><tbody>${S.cust.map(c => `<tr><td>${c[0]}</td><td>${c[1]}</td></tr>`).join('')}</tbody></table></div></div>`;
      const T2 = `<div class="tbox ${S.flash === 'ord' ? 'shake' : ''}"><div class="tname plain">ORDER (ลูก)</div><div class="tw"><table class="dt"><thead><tr><th class="pk"><span>OrderNo</span></th><th class="fk"><span>CustID</span></th></tr></thead><tbody>${S.ord.map(o => `<tr class="${ids.has(o[1]) ? '' : 'orph'}"><td>${o[0]}</td><td>${o[1]}${ids.has(o[1]) ? '' : ' <i class="tg bad">ไม่มีแม่</i>'}</td></tr>`).join('')}</tbody></table></div></div>`;
      pair.innerHTML = T1 + T2;
      say.innerHTML = S.msg ? `<b style="color:var(--${S.ok ? 'good' : 'bad'})">${S.msg}</b>` : 'เลือกการกระทำด้านล่าง';
      $$('[data-a]', btns).forEach(b => b.disabled = S.done.has(b.dataset.a));
    }
    draw();
  })();
  Hop.mcq($('#q-ri'), {
    q: 'CUSTOMER มี C1, C2 และ ORDER มี CustID เป็น FK (เปิด referential integrity) ข้อใดทำได้',
    opts: ['เพิ่ม ORDER ที่ CustID = C7', 'ลบ CUSTOMER C1 ทั้งที่ยังมี ORDER ของ C1', 'ลบ ORDER ทั้งหมดของ C1 แล้วจึงลบ CUSTOMER C1', 'แก้ CustID ใน ORDER 501 เป็น C9'], a: 2,
    whyWrong: { 0: 'C7 ไม่มีใน CUSTOMER เพิ่มลูกที่ไม่มีแม่ไม่ได้', 1: 'ยังมีลูกอ้างถึง C1 อยู่ ลบแม่ไม่ได้', 3: 'แก้เป็น C9 ที่ไม่มีใน CUSTOMER ก็ทำให้ ORDER 501 ไม่มีแม่เหมือนกัน' },
    why: 'ต้องเคลียร์ลูก (ORDER) ก่อน แล้วจึงลบแม่ (CUSTOMER) ได้ การลบฝั่งลูกทำได้เสมอ ส่วนการเพิ่มหรือแก้ค่า FK ต้องให้ค่านั้นมีอยู่ในตารางแม่',
  });

  /* ---------- 6. relationship types ---------- */
  (() => {
    const host = $('#fig-rel');
    const T = {
      r11: { A: 'EMPLOYEE', B: 'BADGE', v: 'has', L: ['e1', 'e2', 'e3'], R: ['b1', 'b2', 'b3'], pairs: [[0, 0], [1, 1], [2, 2]], a: [1, 1], b: [1, 1] },
      r1m: { A: 'CUSTOMER', B: 'ORDER', v: 'places', L: ['c1', 'c2', 'c3'], R: ['o1', 'o2', 'o3', 'o4', 'o5'], pairs: [[0, 0], [0, 1], [1, 2], [2, 3], [2, 4]], a: [1, 1], b: [0, 'M'] },
      rmn: { A: 'STUDENT', B: 'COURSE', v: 'enrolls in', M: 'GRADE', L: ['s1', 's2', 's3'], R: ['k1', 'k2', 'k3'], pairs: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 0]], a: [0, 'M'], b: [0, 'M'] },
    };
    let mode = 'r1m', assoc = false;
    const sg = Seg([['r11', '1:1'], ['r1m', '1:M'], ['rmn', 'M:N']], mode, k => { mode = k; assoc = false; draw(true); });
    const fix = el('button', { class: 'btn small primary' });
    const svgBox = el('div', { class: 'relbox' });
    const say = el('p', { class: 'say' });
    host.append(el('div', { class: 'ctrls', style: 'margin:0 0 12px' }, sg.box, fix), svgBox, say);
    fix.onclick = () => { assoc = !assoc; draw(true); };
    const ys = n => n === 1 ? [115] : Array.from({ length: n }, (_, i) => 52 + i * (130 / (n - 1)));
    function draw() {
      const m = T[mode], hasAssoc = mode === 'rmn' && assoc;
      fix.hidden = mode !== 'rmn'; fix.textContent = assoc ? 'เอา associative entity ออก' : 'แก้ด้วย associative entity';
      const xl = 70, xm = 210, xr = 350, yl = ys(m.L.length), yr = ys(m.R.length);
      let s = `<svg viewBox="0 0 420 300" class="relsvg" role="img">`;
      let d = 0;
      const line = (x1, y1, x2, y2, c = 'currentColor') => `<path class="ln" pathLength="1" style="animation-delay:${(d++) * 60}ms" d="M${x1} ${y1}L${x2} ${y2}" stroke="${c}" stroke-width="2" fill="none"/>`;
      if (hasAssoc) {
        const ym = ys(m.pairs.length);
        m.pairs.forEach(([a, b], i) => { s += line(xl, yl[a], xm, ym[i], 'var(--c-violet)') + line(xm, ym[i], xr, yr[b], 'var(--c-violet)'); });
        ym.forEach((y, i) => { s += `<circle cx="${xm}" cy="${y}" r="14" class="inst ass"/><text x="${xm}" y="${y + 4}" class="il">g${i + 1}</text>`; });
      } else m.pairs.forEach(([a, b]) => { s += line(xl, yl[a], xr, yr[b], mode === 'rmn' ? 'var(--c-rose)' : 'var(--c-violet)'); });
      yl.forEach((y, i) => s += `<circle cx="${xl}" cy="${y}" r="14" class="inst"/><text x="${xl}" y="${y + 4}" class="il">${m.L[i]}</text>`);
      yr.forEach((y, i) => s += `<circle cx="${xr}" cy="${y}" r="14" class="inst"/><text x="${xr}" y="${y + 4}" class="il">${m.R[i]}</text>`);
      s += `<text x="${xl}" y="22" class="hl" text-anchor="middle">${m.A}</text><text x="${xr}" y="22" class="hl" text-anchor="middle">${m.B}</text>`;
      if (hasAssoc) s += `<text x="${xm}" y="22" class="hl" text-anchor="middle">${m.M}</text>`;
      // ERD strip
      const by = 262, bh = 36;
      const box = (cx, name, bw = 90) => `<rect x="${cx - bw / 2}" y="${by - bh / 2}" width="${bw}" height="${bh}" rx="9" class="ebox"/><text x="${cx}" y="${by + 5}" class="en2" text-anchor="middle">${name}</text>`;
      if (hasAssoc) {
        s += `<line x1="105" y1="${by}" x2="165" y2="${by}" stroke="var(--c-violet)" stroke-width="2"/><line x1="255" y1="${by}" x2="315" y2="${by}" stroke="var(--c-violet)" stroke-width="2"/>`;
        s += box(60, m.A) + box(210, m.M) + box(360, m.B);
        s += DV.glyph(1, 1, 105, by, 0, 'v') + DV.glyph(0, 'M', 165, by, 180, 'v') + DV.glyph(0, 'M', 255, by, 0, 'v') + DV.glyph(1, 1, 315, by, 180, 'v');
      } else {
        const c = mode === 'rmn' ? 'var(--c-rose)' : 'var(--c-violet)';
        s += `<line x1="105" y1="${by}" x2="315" y2="${by}" stroke="${c}" stroke-width="2"/>${box(60, m.A)}${box(360, m.B)}`;
        s += DV.glyph(m.a[0], m.a[1], 105, by, 0, mode === 'rmn' ? 'bad' : 'v') + DV.glyph(m.b[0], m.b[1], 315, by, 180, mode === 'rmn' ? 'bad' : 'v');
        s += `<text x="210" y="${by - 10}" class="vb" text-anchor="middle">${m.v}</text>`;
      }
      s += '</svg>';
      svgBox.innerHTML = s;
      say.innerHTML = {
        r11: `วง ${Hop.t('r11')}: พนักงานหนึ่งคนมีบัตรหนึ่งใบ บัตรหนึ่งใบเป็นของพนักงานคนเดียว เส้นแต่ละเส้นไม่ซ้อนกัน`,
        r1m: `วง ${Hop.t('r1m')}: ลูกค้า c3 มี ORDER สองใบ (o4, o5) แต่ ORDER แต่ละใบมีลูกค้าเจ้าของได้คนเดียว ตาราง ORDER จึงเก็บ FK CustID`,
        rmn: assoc ? `${Hop.t('assoc')} GRADE แทนการลงทะเบียนแต่ละครั้ง (g1–g5) แต่ละ record ชี้ไปนักศึกษาหนึ่งคนและวิชาหนึ่งวิชา M:N จึงกลายเป็น 1:M สองเส้น` : `${Hop.t('rmn')}: s1 ลงสองวิชา และ k1 มีนักศึกษาสองคน เส้นขวางกันไปมา ตารางสองตารางเก็บ FK ของอีกฝั่งตรงๆ ไม่ได้ ต้องคั่นด้วย associative entity`,
      }[mode];
    }
    draw();
  })();

  /* ---------- 7. cardinality ---------- */
  (() => {
    const host = $('#fig-crow');
    const SC = [
      { A: 'CUSTOMER', B: 'ORDER', v: 'places', vr: 'is placed by', b: [0, 'M'], a: [1, 1] },
      { A: 'ORDER', B: 'ITEM ORDERED', v: 'includes', vr: 'is included in', b: [1, 'M'], a: [1, 1] },
      { A: 'EMPLOYEE', B: 'SPOUSE', v: 'has', vr: 'is spouse of', b: [0, 1], a: [1, 1] },
      { A: 'EMPLOYEE', B: 'PROJECT', v: 'is assigned to', vr: 'has assigned', b: [0, 'M'], a: [0, 'M'] },
    ];
    const clone = s => ({ ...s, a: [...s.a], b: [...s.b] });
    let si = 0, cur = clone(SC[0]), end = 'b';
    const chips = el('div', { class: 'presets', style: 'justify-content:flex-start;margin:0 0 12px' });
    SC.forEach((s, i) => chips.append(chip(`${s.A} – ${s.B}`, () => { si = i; cur = clone(SC[i]); end = 'b'; upd(); }, i === 0)));
    const svgBox = el('div', { class: 'relbox' });
    const mn = Seg([[0, 'อย่างน้อย 0'], [1, 'อย่างน้อย 1']], 0, k => { cur[end][0] = +k; upd(); });
    const mx = Seg([[1, 'อย่างมาก 1'], ['M', 'อย่างมาก หลาย']], 1, k => { cur[end][1] = k === 'M' ? 'M' : 1; upd(); });
    const say = el('p', { class: 'say' });
    const reads = el('div', { class: 'reads' }, readout('sbar', 'ขีด', '= หนึ่ง'), readout('scircle', 'วงกลม', '= ศูนย์'), readout('sfoot', 'ตีนกา', '= หลาย'));
    host.append(chips, svgBox, el('div', { class: 'ctrls' }, mn.box, mx.box), say, reads);
    svgBox.addEventListener('click', e => { const g = e.target.closest('[data-end]'); if (g) { end = g.dataset.end; upd(); } });
    function upd() {
      $$('.chip', chips).forEach((c, i) => c.setAttribute('aria-pressed', String(i === si)));
      const s = cur, mm = s[end];
      mn.set(mm[0]); mx.set(mm[1]);
      const by = 70, y = by;
      let h = `<svg viewBox="0 0 360 150" class="relsvg crowsvg" role="img">`;
      h += `<rect x="${end === 'a' ? 118 : 180}" y="46" width="64" height="48" rx="10" class="endsel"/>`;
      h += `<rect x="10" y="48" width="110" height="44" rx="9" class="ebox${end === 'a' ? ' hot' : ''}"/><text x="65" y="75" class="en2" text-anchor="middle">${s.A}</text>`;
      h += `<rect x="240" y="48" width="110" height="44" rx="9" class="ebox${end === 'b' ? ' hot' : ''}"/><text x="295" y="75" class="en2" text-anchor="middle">${s.B}</text>`;
      h += `<line x1="120" y1="${y}" x2="240" y2="${y}" stroke="var(--c-violet)" stroke-width="2"/>`;
      h += DV.glyph(s.a[0], s.a[1], 120, y, 0, 'v') + DV.glyph(s.b[0], s.b[1], 240, y, 180, 'v');
      h += `<text x="180" y="40" class="vb" text-anchor="middle">${s.v}</text><text x="180" y="116" class="vb dim" text-anchor="middle">${s.vr}</text>`;
      h += `<rect data-end="a" x="120" y="40" width="60" height="60" fill="transparent" class="hit"/><rect data-end="b" x="180" y="40" width="60" height="60" fill="transparent" class="hit"/>`;
      h += '</svg>';
      svgBox.innerHTML = h;
      const S1 = end === 'b' ? s.A : s.B, T1 = end === 'b' ? s.B : s.A, vb = end === 'b' ? s.v : s.vr, r = rng(mm[0], mm[1]);
      say.innerHTML = `สัญลักษณ์ที่ติด <b style="color:var(--c-violet)">${T1}</b> อ่านว่า: 1 ${S1} ${vb} ${T1} ได้ <b style="color:var(--c-violet)">${r[0]}</b> <span class="mono" style="color:var(--muted)">(${r[1]})</span>`;
    }
    upd();
  })();
  const _g = (mn, mx, x, y, d) => DV.glyph(mn, mx, x, y, d, 'v');
  Hop.mcq($('#q-crow'), {
    q: `ตามภาพ ข้อใดอ่านถูก <svg viewBox="0 0 330 60" width="330" style="display:block;margin:10px 0 0;color:var(--c-violet)"><rect x="2" y="12" width="96" height="36" rx="8" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="50" y="35" text-anchor="middle" font-size="13" fill="currentColor">CUSTOMER</text><rect x="232" y="12" width="96" height="36" rx="8" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="280" y="35" text-anchor="middle" font-size="13" fill="currentColor">ORDER</text><line x1="98" y1="30" x2="232" y2="30" stroke="currentColor" stroke-width="2"/>${_g(1, 1, 98, 30, 0)}${_g(0, 'M', 232, 30, 180)}</svg>`,
    opts: ['ลูกค้า 1 คน มี ORDER ได้ตั้งแต่ 0 ใบขึ้นไป และ ORDER 1 ใบเป็นของลูกค้าได้คนเดียวเท่านั้น', 'ลูกค้า 1 คน ต้องมี ORDER อย่างน้อย 1 ใบ', 'ORDER 1 ใบ มีลูกค้าได้หลายคน', 'ความสัมพันธ์แบบ one-to-one'], a: 0,
    whyWrong: { 1: 'ปลายที่ติด ORDER เป็นวงกลม แปลว่าขั้นต่ำเป็นศูนย์ ลูกค้าที่ยังไม่เคยสั่งก็มีอยู่ได้', 2: 'นี่คือการอ่านสลับฝั่ง ปลายที่ติด CUSTOMER เป็นขีดสองขีด คือ ORDER หนึ่งใบมีลูกค้าได้คนเดียวเท่านั้น', 3: 'ฝั่ง ORDER มีตีนกา แปลว่าหลาย จึงเป็น one-to-many' },
    why: 'สัญลักษณ์ที่ติดกล่องไหนบอกจำนวนของกล่องนั้น ติด ORDER = วงกลม + ตีนกา = zero or many ติด CUSTOMER = ขีดสองขีด = one and only one',
  });

  /* ---------- 8. anomalies ---------- */
  (() => {
    const host = $('#fig-anom');
    let mode = 'flat', act = null;
    const sg = Seg([['flat', 'ตารางเดียว (1NF)'], ['split', 'หลังแยกเป็น 3NF']], mode, k => { mode = k; draw(); });
    const acts = [['upd', 'คุณกิตติ (PT01) เปลี่ยนเบอร์โทร'], ['del', 'ยกเลิกนัด AP-502'], ['ins', 'เพิ่มหัตถการใหม่ PR05']];
    const bar = el('div', { class: 'ractions' }, ...acts.map(([k, l]) => el('button', { class: 'btn small', 'data-a': k, text: l, onclick: () => { act = k; draw(); } })), el('button', { class: 'btn small ghost', html: `${icon('replay')} เริ่มใหม่`, onclick: () => { act = null; draw(); } }));
    const out = el('div', { class: 'anom' });
    const say = el('p', { class: 'say' });
    host.append(el('div', { class: 'ctrls', style: 'margin:0 0 14px' }, sg.box), bar, out, say);
    const tb = (name, cols, rows, o = {}) => `<div class="tbox"><div class="tname plain">${name}</div><div class="tw"><table class="dt"><thead><tr>${cols.map((c, i) => `<th class="${(o.pk || []).includes(i) ? 'pk' : ''} ${(o.fk || []).includes(i) ? 'fk' : ''}"><span>${c}</span></th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr class="${r.cls || ''}">${r.c.map((v, i) => `<td class="${(r.cc && r.cc[i]) || ''}">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
    function draw() {
      $$('[data-a]', bar).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.a === act)));
      const ph = (act === 'upd') ? '089-999' : null;
      let html = '', msg = '';
      if (mode === 'flat') {
        const R = [['AP-501', 'PR01', 2, 'PT01', 'กิตติ', '081-111', 'อุดฟันคอมโพสิต', 800], ['AP-501', 'PR02', 1, 'PT01', 'กิตติ', '081-111', 'ขูดหินปูนทั้งปาก', 500], ['AP-502', 'PR03', 1, 'PT02', 'มาลี', '082-222', 'ปรับลวดจัดฟัน', 1200], ['AP-503', 'PR04', 1, 'PT01', 'กิตติ', '081-111', 'อุดฟันอมัลกัม', 600]];
        const rows = R.map(r => {
          const o = { c: [...r], cc: {} };
          if (act === 'upd' && r[3] === 'PT01') { o.c[5] = '089-999'; o.cc[5] = 'chg'; o.cls = 'hlr'; }
          if (act === 'del' && r[0] === 'AP-502') { o.cls = 'gone'; o.cc[3] = 'lost'; o.cc[1] = 'lost'; o.cc[4] = 'lost'; o.cc[6] = 'lost'; }
          return o;
        });
        if (act === 'ins') rows.push({ c: ['?', 'PR05', '?', '?', '?', '?', 'ฟอกสีฟัน', 2500], cls: 'bad', cc: { 0: 'lost' } });
        const perm = [0, 1, 3, 5, 2, 4, 6, 7], HD = ['ApptNo', 'ProcID', 'Units', 'PatID', 'PatName', 'PatPhone', 'ProcName', 'Price'];
        const pr = rows.map(o => ({ cls: o.cls, c: perm.map(i => o.c[i]), cc: Object.fromEntries(perm.map((i, k) => [k, (o.cc || {})[i]]).filter(x => x[1])) }));
        html = tb('APPOINTMENT (1NF) ตารางเดียว', perm.map(i => HD[i]), pr, { pk: [0, 1] });
        msg = { null: 'ตารางเดียวเก็บทั้งนัด คนไข้ และหัตถการ ลองสั่งทีละอย่าง', upd: `<b style="color:var(--c-rose)">ต้องแก้ 3 แถว</b> (ทุกแถวของ PT01) ถ้าลืมแถวเดียว คุณกิตติจะมีสองเบอร์ในระบบ นี่คือ ${Hop.t('anomupd')}`, del: `ลบนัด AP-502 แถวเดียว แต่ <b style="color:var(--c-rose)">คนไข้ PT02 และหัตถการ PR03 หายไปจากระบบด้วย</b> เพราะเป็นแถวเดียวที่เก็บข้อมูลนี้ นี่คือ ${Hop.t('anomdel')}`, ins: `เพิ่ม PR05 <b style="color:var(--c-rose)">ไม่ได้</b> เพราะ key คือ ApptNo + ProcID ต้องมีเลขที่นัดก่อน แต่ยังไม่มีใครนัดทำหัตถการนี้ นี่คือ ${Hop.t('anomins')}` }[act];
      } else {
        const P = [['PT01', 'กิตติ', act === 'upd' ? '089-999' : '081-111'], ['PT02', 'มาลี', '082-222']].map(r => ({ c: r, cls: act === 'upd' && r[0] === 'PT01' ? 'okr' : '', cc: act === 'upd' && r[0] === 'PT01' ? { 2: 'chg' } : {} }));
        const PR = [['PR01', 'อุดฟันคอมโพสิต', 800], ['PR02', 'ขูดหินปูนทั้งปาก', 500], ['PR03', 'ปรับลวดจัดฟัน', 1200], ['PR04', 'อุดฟันอมัลกัม', 600]].map(r => ({ c: r, cls: act === 'del' && r[0] === 'PR03' ? 'okr keep' : '' }));
        if (act === 'ins') PR.push({ c: ['PR05', 'ฟอกสีฟัน', 2500], cls: 'okr new' });
        const AP = [['AP-501', 'PT01'], ['AP-502', 'PT02'], ['AP-503', 'PT01']].map(r => ({ c: r, cls: act === 'del' && r[0] === 'AP-502' ? 'gone' : '' }));
        const TR = [['AP-501', 'PR01', 2], ['AP-501', 'PR02', 1], ['AP-502', 'PR03', 1], ['AP-503', 'PR04', 1]].map(r => ({ c: r, cls: act === 'del' && r[0] === 'AP-502' ? 'gone' : '' }));
        if (act === 'del') P[1].cls = 'okr keep';
        html = `<div class="tpair">${tb('PATIENT', ['PatID', 'PatName', 'PatPhone'], P, { pk: [0] })}${tb('PROCEDURE', ['ProcID', 'ProcName', 'Price'], PR, { pk: [0] })}</div><div class="tpair">${tb('APPOINTMENT', ['ApptNo', 'PatID'], AP, { pk: [0], fk: [1] })}${tb('TREATMENT', ['ApptNo', 'ProcID', 'Units'], TR, { pk: [0, 1], fk: [0, 1] })}</div>`;
        msg = { null: 'หลังแยกตาราง ข้อมูลแต่ละเรื่องอยู่ในตารางของมันเอง ลองสั่งแบบเดียวกัน', upd: '<b style="color:var(--c-green)">แก้แถวเดียว</b> ใน PATIENT ทุกนัดของ PT01 เห็นเบอร์ใหม่ทันที เพราะอ้างผ่าน PatID', del: 'ลบแค่นัดกับรายการรักษาของนัดนั้น <b style="color:var(--c-green)">คนไข้ PT02 และหัตถการ PR03 ยังอยู่</b> ในตารางของตัวเอง', ins: '<b style="color:var(--c-green)">เพิ่มแถวเดียวใน PROCEDURE</b> ได้เลย ไม่ต้องรอให้มีใครนัด' }[act];
      }
      out.innerHTML = html; say.innerHTML = msg;
    }
    draw();
  })();

  /* ---------- 9. functional dependency tests ---------- */
  (() => {
    const host = $('#fig-fd');
    const EX = {
      a: { label: 'ตัวอย่างสไลด์ 45', name: 'ABC', key: [0, 1], f: ['ชิ้นส่วน', 'ชื่อโกดัง', 'จำนวนสินค้า', 'ที่อยู่โกดัง'],
        rule: { 2: { det: [0, 1], k: 'full', t: 'ขึ้นกับทั้ง ชิ้นส่วน และ ชื่อโกดัง (จำนวนของชิ้นส่วนนี้ในโกดังนี้) ต้องรู้ทั้งคู่ถึงบอกได้' }, 3: { det: [1], k: 'partial', t: 'รู้ชื่อโกดังอย่างเดียวก็บอกที่อยู่ได้ โดยไม่ต้องรู้ชิ้นส่วน ที่อยู่โกดังจึงขึ้นกับแค่ส่วนหนึ่งของ key' } },
        fixed: ['สินค้า (<u>ชิ้นส่วน</u>, <u>ชื่อโกดัง</u>, จำนวน)', 'โกดัง (<u>ชื่อโกดัง</u>, ที่อยู่โกดัง)'] },
      b: { label: 'ตัวอย่างสไลด์ 46', name: 'ผู้บริหาร', key: [0], f: ['เลขประจำตัว', 'ชื่อนามสกุล', 'ที่อยู่', 'ตำแหน่ง', 'ยี่ห้อรถประจำตำแหน่ง'],
        rule: { 1: { det: [0], k: 'full', t: 'รู้เลขประจำตัวก็รู้ชื่อ (key มี field เดียว จึงไม่มี "บางส่วนของ key")' }, 2: { det: [0], k: 'full', t: 'รู้เลขประจำตัวก็รู้ที่อยู่' }, 3: { det: [0], k: 'full', t: 'รู้เลขประจำตัวก็รู้ตำแหน่ง' }, 4: { det: [3], k: 'trans', t: 'รู้ตำแหน่งก็บอกยี่ห้อรถได้เลย ไม่ต้องรู้ว่าเป็นใคร ยี่ห้อรถขึ้นกับตำแหน่ง ซึ่งไม่ใช่ key' } },
        fixed: ['ผู้บริหาร (<u>เลขประจำตัว</u>, ชื่อนามสกุล, ที่อยู่, ตำแหน่ง)', 'ตำแหน่งบริหาร (<u>ตำแหน่ง</u>, ยี่ห้อรถประจำตำแหน่ง)'] },
    };
    let ex = 'a', pick = null, fixed = false;
    const sg = Seg([['a', EX.a.label], ['b', EX.b.label]], ex, k => { ex = k; pick = null; fixed = false; upd(); });
    const row = el('div', { class: 'fdrow' });
    const flow = el('div', { class: 'fdflow' });
    const say = el('p', { class: 'say' });
    const fixB = el('button', { class: 'btn small primary', text: 'ดูผลหลังแยกตาราง', onclick: () => { fixed = true; upd(); } });
    const out = el('div', { class: 'notation' });
    host.append(el('div', { class: 'ctrls', style: 'margin:0 0 14px' }, sg.box), row, flow, say, el('div', { class: 'ctrls' }, fixB), out);
    function upd() {
      const E = EX[ex], r = pick != null ? E.rule[pick] : null;
      row.innerHTML = `<div class="fdname mono">${E.name} (</div>` + E.f.map((f, i) => {
        const isKey = E.key.includes(i), role = r ? (r.det.includes(i) ? 'det' : i === pick ? (r.k === 'full' ? 'tgt ok' : 'tgt bad') : '') : '';
        return `<button class="fc ${isKey ? 'key' : ''} ${role}" data-i="${i}">${f}</button>`;
      }).join('') + '<div class="fdname mono">)</div>';
      $$('.fc', row).forEach(b => b.onclick = () => { const i = +b.dataset.i; if (E.key.includes(i)) { pick = null; fixed = false; upd(); say.innerHTML = 'field ที่ขีดเส้นใต้เป็น key ตัวมันไม่ต้องขึ้นกับใคร แตะ field อื่นเพื่อตรวจ'; return; } pick = i; fixed = false; upd(); });
      if (r) {
        const cls = r.k === 'full' ? 'ok' : 'bad';
        flow.innerHTML = `<div class="fdl">${r.det.map(d => `<span class="fc det ${E.key.includes(d) ? 'key' : ''}">${E.f[d]}</span>`).join('<span class="fp">+</span>')}<span class="fa ${cls}">⟶</span><span class="fc tgt ${cls}">${E.f[pick]}</span></div>`;
        const verdict = { full: `<b style="color:var(--c-green)">ผ่าน</b> ขึ้นกับ key ทั้งก้อน`, partial: `<b style="color:var(--c-rose)">Partial dependency ผิด 2NF</b>`, trans: `<b style="color:var(--c-rose)">Transitive dependency ผิด 3NF</b>` }[r.k];
        say.innerHTML = r.t + ' ' + verdict;
      } else { flow.innerHTML = ''; say.innerHTML = 'แตะ field ที่ไม่ได้ขีดเส้นใต้ เพื่อตรวจว่ามันขึ้นกับอะไร'; }
      fixB.hidden = !(r && r.k !== 'full') || fixed;
      out.innerHTML = fixed ? `<div class="nl">${E.fixed.map(x => `<div>${x}</div>`).join('')}</div>` : '';
    }
    upd();
  })();
  Hop.mcq($('#q-fd'), {
    q: 'EMPLOYEE (<u>EmpID</u>, EmpName, DeptID, DeptName) ตารางนี้ไม่มี repeating group และ DeptName ขึ้นกับ DeptID ตารางอยู่ถึงรูปที่เท่าไร',
    opts: ['1NF เท่านั้น เพราะยังมี partial dependency', '2NF แต่ไม่ผ่าน 3NF', '3NF', 'ยังไม่ผ่าน 1NF'], a: 1,
    whyWrong: { 0: 'key เป็น field เดียว (EmpID) จึงไม่มี "บางส่วนของ key" เกิด partial dependency ไม่ได้ ผ่าน 2NF โดยอัตโนมัติ', 2: 'DeptName ขึ้นกับ DeptID ซึ่งไม่ใช่ key นั่นคือ non-key → non-key ผิด 3NF', 3: 'ไม่มี repeating group จึงผ่าน 1NF แล้ว' },
    why: 'ผ่าน 1NF (ไม่มี repeating group) ผ่าน 2NF (key เดียว) แต่ EmpID → DeptID → DeptName เป็นทอด จึงไม่ผ่าน 3NF แก้ด้วยแยก DEPARTMENT (<u>DeptID</u>, DeptName) และเหลือ DeptID เป็น FK ใน EMPLOYEE',
  });

  /* ---------- 10. dental clinic walkthrough ---------- */
  $('#unf-code').innerHTML = `<span class="sch"><b>APPOINTMENT</b> ( <span class="f pk">ApptNo</span>, ApptDate, PatID, PatName, PatAddr, PatPhone, DenID, DenName, DeptID, DeptName, DeptFee, <span class="rgb">{ <span class="f pk">ProcID</span>, ProcName, ProcCat, Duration, Price, Units }</span> )</span>`;

  // 10a. UNF -> 1NF on real data
  (() => {
    const host = $('#fig-1nf');
    let nf = 0;
    const sg = Seg([[0, 'UNF'], [1, '1NF']], 0, k => { nf = +k; upd(); });
    const H = ['ApptNo', 'PatID', 'PatName', 'DenID', 'ProcID', 'Units'];
    const R = [['AP-501', 'PT01', 'กิตติ', 'DT01'], ['AP-502', 'PT02', 'มาลี', 'DT02'], ['AP-503', 'PT01', 'กิตติ', 'DT01']];
    const G = [[['PR01', 2], ['PR02', 1]], [['PR03', 1]], [['PR04', 1]]];
    const cc = (v, c = '') => `<div class="cc ${c}">${v}</div>`;
    const grp = (i, k) => G[i].map((g, j) => cc(g[k], j ? 'l2' : '')).join('');
    let h = `<table class="dt f1"><thead><tr class="grow"><th colspan="4"></th><th colspan="2" class="rgh">${cc('repeating group')}</th></tr><tr>${H.map((c, i) => `<th class="${i === 0 ? 'pk' : ''} ${i === 4 ? 'pk2' : ''} ${i >= 4 ? 'rgc' : ''}"><span>${c}</span></th>`).join('')}</tr></thead><tbody>`;
    // AP-501 first row, its duplicate row (visible only in 1NF), then the other two
    h += `<tr class="r1a">${R[0].map(v => `<td>${cc(v)}</td>`).join('')}<td class="rg">${grp(0, 0)}</td><td class="rg">${grp(0, 1)}</td></tr>`;
    h += `<tr class="r1b">${R[0].map(v => `<td class="dupc">${cc(v)}</td>`).join('')}<td class="rg">${cc('PR02')}</td><td class="rg">${cc('1')}</td></tr>`;
    [1, 2].forEach(i => { h += `<tr>${R[i].map(v => `<td>${cc(v)}</td>`).join('')}<td class="rg">${cc(G[i][0][0])}</td><td class="rg">${cc(G[i][0][1])}</td></tr>`; });
    h += '</tbody></table>';
    const wrap = el('div', { class: 'tw', html: h });
    const count = el('div', { class: 'rowct' });
    const say = el('p', { class: 'say' });
    host.append(el('div', { class: 'ctrls', style: 'margin:0 0 14px' }, sg.box, count), wrap, say);
    function upd() {
      $('table', wrap).classList.toggle('nf1', nf === 1);
      count.innerHTML = nf ? '<b>4</b> record' : '<b>3</b> record';
      say.innerHTML = nf
        ? `แตกเป็นแถวละหนึ่งหัตถการ key ขยายเป็น <b style="color:var(--c-amber)">ApptNo + ProcID</b> ข้อมูลนัดและคนไข้ของ AP-501 ถูกเขียนซ้ำในสองแถว (ตัวเอียงจาง) นี่คือสิ่งที่ 2NF และ 3NF จะแก้ต่อ`
        : `AP-501 มีสองหัตถการ (PR01, PR02) ซ้อนอยู่ในแถวเดียว นี่คือ <b style="color:var(--c-rose)">repeating group</b> key ของ record คือ ApptNo ส่วน key ของชุดที่ซ้ำคือ ProcID`;
    }
    upd();
  })();

  // 10b. 1NF -> 3NF chip walkthrough
  (() => {
    const host = $('#fig-nf');
    const OWN = { ApptNo: 'a', ApptDate: 'a', PatID: 'p', PatName: 'p', PatAddr: 'p', PatPhone: 'p', DenID: 'd', DenName: 'd', DeptID: 't', DeptName: 't', DeptFee: 't', ProcID: 'r', ProcName: 'r', ProcCat: 'r', Duration: 'r', Price: 'r', Units: 'u' };
    const GL = { ApptNo: 'เลขที่นัดหมาย', ApptDate: 'วันที่นัด', PatID: 'รหัสคนไข้', PatName: 'ชื่อคนไข้', PatAddr: 'ที่อยู่คนไข้', PatPhone: 'เบอร์โทรคนไข้', DenID: 'รหัสทันตแพทย์', DenName: 'ชื่อทันตแพทย์', DeptID: 'รหัสแผนก', DeptName: 'ชื่อแผนก', DeptFee: 'ค่าธรรมเนียมตรวจของแผนก', ProcID: 'รหัสหัตถการ', ProcName: 'ชื่อหัตถการ', ProcCat: 'หมวดหัตถการ', Duration: 'ระยะเวลามาตรฐาน', Price: 'ราคาต่อหน่วย', Units: 'จำนวนหน่วยที่รักษา' };
    const FDOF = { ApptDate: 'ApptNo', PatID: 'ApptNo', DenID: 'ApptNo', PatName: 'PatID', PatAddr: 'PatID', PatPhone: 'PatID', DenName: 'DenID', DeptID: 'DenID', DeptName: 'DeptID', DeptFee: 'DeptID', ProcName: 'ProcID', ProcCat: 'ProcID', Duration: 'ProcID', Price: 'ProcID', Units: 'ApptNo + ProcID' };
    const FKT = { 'ApptNo#t': 'APPOINTMENT', 'ProcID#t': 'PROCEDURE', 'PatID#a': 'PATIENT', 'DenID#a': 'DENTIST', 'DeptID#d': 'DEPARTMENT' };
    const pk = id => ({ id, pk: true }), pkfk = id => ({ id, pk: true, fk: true }), fkk = id => ({ id, fk: true }), dt = (id, p) => ({ id, det: true, pk: !!p });
    const base = id => id.split(/[#@]/)[0];
    const APPD = ['ApptDate', 'PatID', 'PatName', 'PatAddr', 'PatPhone', 'DenID', 'DenName', 'DeptID', 'DeptName', 'DeptFee'];
    const PROC = ['ProcName', 'ProcCat', 'Duration', 'Price'];
    const PROC_C = { id: 'PROC', title: 'PROCEDURE', groups: [{ chips: [pk('ProcID'), ...PROC] }] };
    const TRT_C = { id: 'TRT', title: 'TREATMENT', groups: [{ chips: [pkfk('ApptNo#t'), pkfk('ProcID#t'), 'Units'] }] };
    const BAD = 'bad', OK = 'ok';
    const STAGES = [
      { nf: '1NF', cards: [{ id: 'APPT', title: 'APPOINTMENT', groups: [{ chips: [pk('ApptNo'), pk('ProcID'), ...APPD, ...PROC, 'Units'] }] }] },
      { nf: '1NF', cards: [{ id: 'APPT', title: 'APPOINTMENT', groups: [
        { chips: [pk('ApptNo'), pk('ProcID')] },
        { fd: { det: [dt('ApptNo@1', 1)], kind: BAD, text: 'ขึ้นกับ ApptNo อย่างเดียว (partial)' }, chips: APPD },
        { fd: { det: [dt('ProcID@1', 1)], kind: BAD, text: 'ขึ้นกับ ProcID อย่างเดียว (partial)' }, chips: PROC },
        { fd: { det: [dt('ApptNo@2', 1), dt('ProcID@2', 1)], kind: OK, text: 'ขึ้นกับทั้งคู่ (full)' }, chips: ['Units'] }] }] },
      { nf: '2NF', cards: [{ id: 'APPT', title: 'APPOINTMENT', groups: [{ chips: [pk('ApptNo'), ...APPD] }] }, PROC_C, TRT_C] },
      { nf: '2NF', cards: [{ id: 'APPT', title: 'APPOINTMENT', groups: [
        { chips: [pk('ApptNo'), 'ApptDate', 'PatID', 'DenID'] },
        { fd: { det: [dt('PatID@3')], kind: BAD, text: 'ขึ้นกับ PatID ซึ่งไม่ใช่ key' }, chips: ['PatName', 'PatAddr', 'PatPhone'] },
        { fd: { det: [dt('DenID@3')], kind: BAD, text: 'ขึ้นกับ DenID ซึ่งไม่ใช่ key' }, chips: ['DenName', 'DeptID'] },
        { fd: { det: [dt('DeptID@3')], kind: BAD, text: 'ขึ้นกับ DeptID ซึ่งไม่ใช่ key' }, chips: ['DeptName', 'DeptFee'] }] }, PROC_C, TRT_C] },
      { nf: '3NF', cards: [
        { id: 'APPT', title: 'APPOINTMENT', groups: [{ chips: [pk('ApptNo'), 'ApptDate', fkk('PatID#a'), fkk('DenID#a')] }] },
        { id: 'PAT', title: 'PATIENT', groups: [{ chips: [pk('PatID'), 'PatName', 'PatAddr', 'PatPhone'] }] },
        { id: 'DEN', title: 'DENTIST', groups: [{ chips: [pk('DenID'), 'DenName', fkk('DeptID#d')] }] },
        { id: 'DEPT', title: 'DEPARTMENT', groups: [{ chips: [pk('DeptID'), 'DeptName', 'DeptFee'] }] },
        PROC_C, TRT_C] },
    ];
    const norm = it => typeof it === 'string' ? { id: it } : it;

    /* layout */
    const CW = 100, CH = 32, GAP = 8, PAD = 10, XP = 6, HEAD = 38, GG = 10, CG = 14, AR = 14;
    function layout(st, W) {
      const innerMax = Math.max(2, Math.floor((W - 2 * PAD - 2 * XP + GAP) / (CW + GAP)));
      const single = st.cards.length === 1;
      const sized = st.cards.map(c => {
        const n = c.groups.reduce((s, g) => s + g.chips.length, 0);
        let cols = single ? innerMax : clamp(Math.ceil(Math.sqrt(n * 1.7)), 3, Math.min(4, innerMax));
        cols = Math.min(cols, innerMax);
        const innerW = cols * (CW + GAP) - GAP;
        let h = HEAD; const gl = [];
        c.groups.forEach((g, gi) => {
          const rows = Math.ceil(g.chips.length / cols), body = rows * (CH + GAP) - GAP;
          if (g.fd) {
            const detW = g.fd.det.length * (CW + GAP), inline = innerW - detW >= 110, hh = CH + (inline ? 0 : 20);
            const total = hh + GAP + AR + 2 + XP + body + XP;
            gl.push({ y: h, hh, inline, body, total, detW }); h += total;
          } else { gl.push({ y: h, body, total: body }); h += body; }
          if (gi < c.groups.length - 1) h += GG;
        });
        return { c, cols, innerW, cw: 2 * PAD + 2 * XP + innerW, h: h + PAD, gl };
      });
      let x = 0, y = 0, rowH = 0;
      sized.forEach(s => { if (x > 0 && x + s.cw > W + .5) { x = 0; y += rowH + CG; rowH = 0; } s.x = x; s.y = y; x += s.cw + CG; rowH = Math.max(rowH, s.h); });
      const P = { height: y + rowH, chips: {}, cards: [], decor: [], nf: st.nf };
      sized.forEach(s => {
        P.cards.push({ id: s.c.id, title: s.c.title, x: s.x, y: s.y, w: s.cw, h: s.h });
        s.c.groups.forEach((g, gi) => {
          const L = s.gl[gi], bx = s.x + PAD + XP;
          let cy = s.y + L.y;
          const put = (it, px, py) => { const o = norm(it); P.chips[o.id] = { ...o, x: px, y: py, card: s.c.title }; };
          if (g.fd) {
            g.fd.det.forEach((d, i) => put(d, bx + i * (CW + GAP), cy));
            P.decor.push({ type: 'label', x: L.inline ? bx + L.detW : bx, y: L.inline ? cy : cy + CH + 2, w: L.inline ? s.innerW - L.detW : s.innerW, h: L.inline ? CH : 18, text: g.fd.text, kind: g.fd.kind });
            const ay = cy + L.hh + GAP;
            P.decor.push({ type: 'arrow', x: bx + (L.detW - GAP) / 2 - 7, y: ay, kind: g.fd.kind });
            const oy = ay + AR + 2;
            P.decor.push({ type: 'grp', x: s.x + PAD, y: oy, w: s.cw - 2 * PAD, h: 2 * XP + L.body, kind: g.fd.kind });
            cy = oy + XP;
          }
          g.chips.forEach((it, i) => put(it, bx + (i % s.cols) * (CW + GAP), cy + Math.floor(i / s.cols) * (CH + GAP)));
        });
      });
      return P;
    }

    /* dom */
    const scrubHost = el('div', { class: 'stick' });
    const board = el('div', { class: 'fboard' });
    const detail = el('p', { class: 'say' });
    const note = el('div', { class: 'notation' });
    host.append(scrubHost, board, detail, note);
    const ids = new Set();
    STAGES.forEach(st => st.cards.forEach(c => c.groups.forEach(g => { g.chips.forEach(i => ids.add(norm(i).id)); if (g.fd) g.fd.det.forEach(d => ids.add(d.id)); })));
    const chipEls = {}, cardEls = {};
    ids.forEach(id => { const b = base(id); chipEls[id] = el('button', { class: 'fchip o' + OWN[b] + ' off', 'data-id': id, onclick: () => select(id) }, el('span', { text: b })); board.append(chipEls[id]); });
    let LAY = [], W = 0, cur = 0, sel = null, decorEls = [];
    const flash = (e, fn) => { e.style.transition = 'none'; fn(); void e.offsetWidth; e.style.transition = ''; };
    function apply(si, instant) {
      cur = si; const P = LAY[si];
      board.style.height = P.height + 'px';
      if (instant) board.classList.add('nomove');
      const have = new Set();
      P.cards.forEach(c => {
        have.add(c.id);
        let e = cardEls[c.id];
        if (!e) { e = cardEls[c.id] = el('div', { class: 'fcard off' }, el('div', { class: 'ct' })); board.prepend(e); }
        const set = () => { e.style.left = c.x + 'px'; e.style.top = c.y + 'px'; e.style.width = c.w + 'px'; e.style.height = c.h + 'px'; };
        if (e.classList.contains('off')) { flash(e, set); e.classList.remove('off'); } else set();
        e.querySelector('.ct').innerHTML = `<span>${c.title}</span><i class="nfb">${P.nf}</i>`;
      });
      Object.keys(cardEls).forEach(id => { if (!have.has(id)) cardEls[id].classList.add('off'); });
      for (const id of ids) {
        const e = chipEls[id], c = P.chips[id];
        if (!c) { e.classList.add('off'); continue; }
        const set = () => { e.style.left = c.x + 'px'; e.style.top = c.y + 'px'; };
        if (e.classList.contains('off')) { flash(e, set); e.classList.remove('off'); } else set();
        e.classList.toggle('pk', !!c.pk); e.classList.toggle('fk', !!c.fk); e.classList.toggle('det', !!c.det);
      }
      decorEls.forEach(e => { e.classList.add('out'); setTimeout(() => e.remove(), 240); });
      decorEls = P.decor.map(d => {
        const e = el('div', { class: `dec ${d.type} ${d.kind}` });
        e.style.left = d.x + 'px'; e.style.top = d.y + 'px';
        if (d.w) e.style.width = d.w + 'px'; if (d.h) e.style.height = d.h + 'px';
        if (d.type === 'label') e.textContent = d.text;
        if (d.type === 'arrow') e.innerHTML = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1v10M2.5 7L7 11.5 11.5 7"/></svg>';
        board.append(e); return e;
      });
      if (instant) requestAnimationFrame(() => requestAnimationFrame(() => board.classList.remove('nomove')));
      renderNote(si);
      if (sel && !P.chips[sel]) sel = null;
      select(sel, true);
    }
    function select(id, keep) {
      sel = id;
      $$('.fchip', board).forEach(e => e.classList.toggle('sel', e.dataset.id === id));
      if (!id) { detail.innerHTML = 'แตะ field เพื่อดูว่ามันคืออะไรและขึ้นกับใคร'; return; }
      const P = LAY[cur], c = P.chips[id], b = base(id), col = `var(--o${OWN[b]})`;
      let t = `<b style="color:${col}">${b}</b> ${GL[b]}`;
      if (c.det) t += ' (สำเนาของตัวกำหนดที่แสดงไว้ให้ดูลูกศร)';
      else {
        if (FDOF[b] && !(c.pk)) t += `, ขึ้นกับ <b>${FDOF[b]}</b>`;
        if (c.pk && !c.fk) t += `, เป็น PK ของ ${c.card}`;
        if (c.pk && c.fk) t += `, เป็นส่วนหนึ่งของ PK ของ ${c.card} และเป็น FK ชี้ไป PK ใน ${FKT[id]}`;
        if (!c.pk && c.fk) t += `, เป็น FK ใน ${c.card} ชี้ไป PK ใน ${FKT[id]}`;
        if (!c.pk && !c.fk) t += `, อยู่ในตาราง ${c.card}`;
      }
      detail.innerHTML = t;
    }
    /* notation under the board */
    const S = DV.schema, F = (n, c) => `<span class="f pk">${n}</span>`;
    const fdl = (det, deps, tag, bad) => `<div class="fdn">${det.map(d => `<span class="f${d[1] ? ' pk' : ''}">${d[0]}</span>`).join(', ')} <b>→</b> ${deps} <i class="${bad ? 'bad' : 'ok'}">${tag}</i></div>`;
    const NOTE = [
      () => S('APPOINTMENT', ['*ApptNo', '*ProcID', ...APPD, ...PROC, 'Units']),
      () => S('APPOINTMENT', ['*ApptNo', '*ProcID', ...APPD, ...PROC, 'Units']) + fdl([['ApptNo', 1]], APPD.join(', '), 'partial', 1) + fdl([['ProcID', 1]], PROC.join(', '), 'partial', 1) + fdl([['ApptNo', 1], ['ProcID', 1]], 'Units', 'full', 0),
      () => [S('APPOINTMENT', ['*ApptNo', ...APPD]), S('PROCEDURE', ['*ProcID', ...PROC]), S('TREATMENT', ['*ApptNo^', '*ProcID^', 'Units'])].join(''),
      () => S('APPOINTMENT', ['*ApptNo', ...APPD]) + fdl([['PatID']], 'PatName, PatAddr, PatPhone', 'non-key → non-key', 1) + fdl([['DenID']], 'DenName, DeptID', 'non-key → non-key', 1) + fdl([['DeptID']], 'DeptName, DeptFee', 'non-key → non-key', 1),
      () => [S('APPOINTMENT', ['*ApptNo', 'ApptDate', 'PatID^', 'DenID^']), S('PATIENT', ['*PatID', 'PatName', 'PatAddr', 'PatPhone']), S('DENTIST', ['*DenID', 'DenName', 'DeptID^']), S('DEPARTMENT', ['*DeptID', 'DeptName', 'DeptFee']), S('PROCEDURE', ['*ProcID', ...PROC]), S('TREATMENT', ['*ApptNo^', '*ProcID^', 'Units'])].join(''),
    ];
    function renderNote(si) { note.innerHTML = NOTE[si](); }

    const sc = Hop.scrub(scrubHost, {
      stops: [{ label: '1NF: key = ApptNo + ProcID' }, { label: 'ดู dependency ของแต่ละ field' }, { label: '2NF: แยก partial dependency' }, { label: 'ดู dependency ที่ผิดใน APPOINTMENT' }, { label: '3NF: แยก non-key ที่เป็นตัวกำหนด' }],
      speed: 1500, onFrame(t) { const k = Math.round(t); if (k !== cur && LAY.length) apply(k); },
    });
    function relayout() { const w = board.clientWidth; if (!w || w === W) return; W = w; LAY = STAGES.map(s => layout(s, W)); apply(cur, true); }
    relayout();
    new ResizeObserver(relayout).observe(board);
  })();

  /* ---------- 11. ERD from 3NF ---------- */
  (() => {
    const host = $('#fig-erd');
    const E = { DEPARTMENT: [70, 40, 'DeptID'], DENTIST: [70, 160, 'DenID'], APPOINTMENT: [70, 280, 'ApptNo'], PATIENT: [70, 400, 'PatID'], TREATMENT: [300, 280, 'ApptNo+ProcID'], PROCEDURE: [300, 400, 'ProcID'] };
    const SCH = {
      DEPARTMENT: DV.schema('DEPARTMENT', ['*DeptID', 'DeptName', 'DeptFee']), DENTIST: DV.schema('DENTIST', ['*DenID', 'DenName', 'DeptID^']),
      APPOINTMENT: DV.schema('APPOINTMENT', ['*ApptNo', 'ApptDate', 'PatID^', 'DenID^']), PATIENT: DV.schema('PATIENT', ['*PatID', 'PatName', 'PatAddr', 'PatPhone']),
      TREATMENT: DV.schema('TREATMENT', ['*ApptNo^', '*ProcID^', 'Units']), PROCEDURE: DV.schema('PROCEDURE', ['*ProcID', 'ProcName', 'ProcCat', 'Duration', 'Price']),
    };
    const BW = 138, BH = 46;
    // p = parent (PK side), c = child (FK side); pe/ce = edge point + outward direction
    const RELS = [
      { p: 'DEPARTMENT', c: 'DENTIST', v: 'has', vr: 'works in', pc: [1, 1], cc: [1, 'M'], fk: 'DENTIST.DeptID → DEPARTMENT.DeptID', pe: [70, 63, 90], ce: [70, 137, -90] },
      { p: 'DENTIST', c: 'APPOINTMENT', v: 'handles', vr: 'is handled by', pc: [1, 1], cc: [0, 'M'], fk: 'APPOINTMENT.DenID → DENTIST.DenID', pe: [70, 183, 90], ce: [70, 257, -90] },
      { p: 'PATIENT', c: 'APPOINTMENT', v: 'makes', vr: 'is made by', pc: [1, 1], cc: [0, 'M'], fk: 'APPOINTMENT.PatID → PATIENT.PatID', pe: [70, 377, -90], ce: [70, 303, 90] },
      { p: 'APPOINTMENT', c: 'TREATMENT', v: 'includes', vr: 'is included in', pc: [1, 1], cc: [1, 'M'], fk: 'TREATMENT.ApptNo → APPOINTMENT.ApptNo', pe: [139, 280, 0], ce: [231, 280, 180] },
      { p: 'PROCEDURE', c: 'TREATMENT', v: 'is used in', vr: 'uses', pc: [1, 1], cc: [0, 'M'], fk: 'TREATMENT.ProcID → PROCEDURE.ProcID', pe: [300, 377, -90], ce: [300, 303, 90] },
    ];
    let selR = 0, selE = null;
    const box = el('div', { class: 'relbox erdbox' });
    const say = el('div', { class: 'erdsay' });
    host.append(box, say);
    let drawn = false;
    function draw() {
      let s = `<svg viewBox="0 0 370 450" class="relsvg erdsvg" role="img">`;
      RELS.forEach((r, i) => {
        const [px, py] = r.pe, [cx, cy] = r.ce;
        s += `<path class="ln${i === selR ? ' sel' : ''}" ${drawn ? '' : `pathLength="1" style="animation-delay:${i * 120}ms"`} d="M${px} ${py}L${cx} ${cy}" stroke="var(--c-violet)" stroke-width="2" fill="none"/>`;
      });
      RELS.forEach((r, i) => {
        s += DV.glyph(r.pc[0], r.pc[1], r.pe[0], r.pe[1], r.pe[2], 'v' + (i === selR ? ' sel' : '')) + DV.glyph(r.cc[0], r.cc[1], r.ce[0], r.ce[1], r.ce[2], 'v' + (i === selR ? ' sel' : ''));
        const mx = (r.pe[0] + r.ce[0]) / 2, my = (r.pe[1] + r.ce[1]) / 2, horiz = r.pe[2] === 0;
        s += `<text x="${horiz ? mx : mx + 12}" y="${horiz ? my - 12 : my + 4}" class="vb" text-anchor="${horiz ? 'middle' : 'start'}">${r.v}</text>`;
        s += `<line class="hitl" data-r="${i}" x1="${r.pe[0]}" y1="${r.pe[1]}" x2="${r.ce[0]}" y2="${r.ce[1]}" stroke="transparent" stroke-width="30"/>`;
      });
      Object.entries(E).forEach(([n, [x, y, p]]) => {
        s += `<g class="eb${selE === n ? ' sel' : ''}" data-e="${n}"><rect x="${x - BW / 2}" y="${y - BH / 2}" width="${BW}" height="${BH}" rx="10" class="ebox"/><text x="${x}" y="${y - 3}" class="en2" text-anchor="middle">${n}</text><text x="${x}" y="${y + 14}" class="pkt" text-anchor="middle">PK ${p}</text></g>`;
      });
      s += '</svg>';
      box.innerHTML = s; drawn = true;
      if (selE) say.innerHTML = `<p class="say">${SCH[selE]}</p>`;
      else {
        const r = RELS[selR], a = rng(r.cc[0], r.cc[1]), b = rng(r.pc[0], r.pc[1]);
        say.innerHTML = `<p class="say">1 <b>${r.p}</b> ${r.v} <b>${r.c}</b> ได้ <b style="color:var(--c-violet)">${a[0]}</b> <span class="mono dim">(${a[1]})</span><br>1 <b>${r.c}</b> ${r.vr} <b>${r.p}</b> ได้ <b style="color:var(--c-violet)">${b[0]}</b> <span class="mono dim">(${b[1]})</span></p><p class="say fkline">เส้นนี้เกิดจาก FK: <span class="mono">${r.fk}</span></p>`;
      }
    }
    box.addEventListener('click', e => {
      const l = e.target.closest('[data-r]'), b = e.target.closest('[data-e]');
      if (l) { selR = +l.dataset.r; selE = null; draw(); } else if (b) { selE = b.dataset.e; draw(); }
    });
    draw();
  })();

  /* ---------- 12. written answer ---------- */
  (() => {
    const host = $('#fig-answer');
    const U = x => `<u>${x}</u>`;
    const sch = (n, f) => DV.schema(n, f);
    const STEPS = {
      anom: { label: 'ปัญหาตารางเดิม', lines: [
        { t: 'ขั้นนี้ ยกปัญหาจริงจากข้อมูลในโจทย์ ชนิดละหนึ่งข้อ', note: true },
        { t: 'Update anomaly: คุณกิตติ (PT01) อยู่ทั้งนัด AP-501 และ AP-503 เปลี่ยนเบอร์โทรต้องแก้ทุกแถว ถ้าลืมแถวเดียวข้อมูลขัดแย้ง' },
        { t: 'Insert anomaly: เพิ่มหัตถการใหม่ที่ยังไม่มีคนไข้ใช้ไม่ได้ เพราะ 1 แถวคือ 1 การนัดหมาย' },
        { t: 'Delete anomaly: ลบนัด AP-502 แล้วข้อมูลคนไข้ PT02 และหัตถการ PR03 หายไปด้วย เพราะเป็นนัดเดียวที่มีข้อมูลนั้น' },
        { t: 'Redundancy: ชื่อ ที่อยู่ เบอร์โทรคนไข้ และชื่อแผนก ถูกเขียนซ้ำทุกนัด' }] },
      unf: { label: 'UNF', lines: [
        { t: 'ขั้นนี้ เขียน standard notation ขีดเส้นใต้ PK ใส่ { } ครอบ repeating group', note: true },
        { html: sch('APPOINTMENT', ['*ApptNo', 'ApptDate', 'PatID', 'PatName', 'PatAddr', 'PatPhone', 'DenID', 'DenName', 'DeptID', 'DeptName', 'DeptFee']).replace(' )', ', { <span class="f pk">ProcID</span>, ProcName, ProcCat, Duration, Price, Units } )') },
        { t: 'Repeating group = ชุดหัตถการ (ProcID ถึง Units) เพราะ 1 นัดทำได้หลายหัตถการ' },
        { t: 'PK ของตาราง = ApptNo, PK ของ repeating group = ProcID' }] },
      nf1: { label: '1NF', lines: [
        { t: 'ขั้นนี้ แตกแต่ละหัตถการเป็นแถวของตัวเอง แล้วขยาย PK ให้รวม key ของชุดที่ซ้ำ', note: true },
        { html: sch('APPOINTMENT', ['*ApptNo', '*ProcID', 'ApptDate', 'PatID', 'PatName', 'PatAddr', 'PatPhone', 'DenID', 'DenName', 'DeptID', 'DeptName', 'DeptFee', 'ProcName', 'ProcCat', 'Duration', 'Price', 'Units']) },
        { t: 'PK = ApptNo + ProcID (combination key)   FK = ไม่มี' },
        { t: 'ไม่มี repeating group แล้ว จึงอยู่ใน 1NF' }] },
      nf2: { label: '2NF', lines: [
        { t: 'ขั้นนี้ ถามทุก field ที่ไม่ใช่ key ว่าขึ้นกับ key ทั้งก้อนหรือแค่บางส่วน แล้วย้ายพวกที่ขึ้นบางส่วน', note: true },
        { t: 'ApptNo → ApptDate, PatID, PatName, PatAddr, PatPhone, DenID, DenName, DeptID, DeptName, DeptFee   (partial)' },
        { t: 'ProcID → ProcName, ProcCat, Duration, Price   (partial)' },
        { t: 'ApptNo, ProcID → Units   (full ผ่าน)' },
        { t: 'แยกเป็น 3 ตาราง:', note: true },
        { html: sch('APPOINTMENT', ['*ApptNo', 'ApptDate', 'PatID', 'PatName', 'PatAddr', 'PatPhone', 'DenID', 'DenName', 'DeptID', 'DeptName', 'DeptFee']) },
        { html: sch('PROCEDURE', ['*ProcID', 'ProcName', 'ProcCat', 'Duration', 'Price']) },
        { html: sch('TREATMENT', ['*ApptNo^', '*ProcID^', 'Units']) },
        { t: 'PK: TREATMENT ใช้ ApptNo + ProcID   FK: ApptNo ชี้ไป APPOINTMENT, ProcID ชี้ไป PROCEDURE' },
        { t: 'APPOINTMENT กับ PROCEDURE มี PK field เดียว จึงผ่าน 2NF', note: true }] },
      nf3: { label: '3NF', lines: [
        { t: 'ขั้นนี้ ถามว่ามี non-key ตัวไหนขึ้นกับ non-key ตัวอื่นไหม แล้วย้ายออก', note: true },
        { t: 'PatID → PatName, PatAddr, PatPhone' },
        { t: 'DenID → DenName, DeptID' },
        { t: 'DeptID → DeptName, DeptFee' },
        { t: 'ทอด: ApptNo → DenID → DeptID → DeptName, DeptFee   (transitive)' },
        { html: sch('APPOINTMENT', ['*ApptNo', 'ApptDate', 'PatID^', 'DenID^']) },
        { html: sch('PATIENT', ['*PatID', 'PatName', 'PatAddr', 'PatPhone']) },
        { html: sch('DENTIST', ['*DenID', 'DenName', 'DeptID^']) },
        { html: sch('DEPARTMENT', ['*DeptID', 'DeptName', 'DeptFee']) },
        { html: sch('PROCEDURE', ['*ProcID', 'ProcName', 'ProcCat', 'Duration', 'Price']) },
        { html: sch('TREATMENT', ['*ApptNo^', '*ProcID^', 'Units']) },
        { t: 'FK: APPOINTMENT.PatID → PATIENT, APPOINTMENT.DenID → DENTIST, DENTIST.DeptID → DEPARTMENT, TREATMENT.ApptNo → APPOINTMENT, TREATMENT.ProcID → PROCEDURE' },
        { t: 'ProcCat ไม่แยกเป็นตาราง เพราะเก็บแค่ชื่อหมวด ไม่มี field อื่นขึ้นกับมัน และไม่เก็บยอดเงิน (Units × Price) เพราะเป็นค่าที่คำนวณได้', note: true }] },
      erd: { label: 'ERD', lines: [
        { t: 'ขั้นนี้ วาดกล่องตามตาราง 3NF ลากเส้นตาม FK ใส่คำกริยา และ cardinality ทั้งสองปลาย', note: true },
        { t: 'DEPARTMENT 1 — has — 1..M DENTIST   (แผนกมีทันตแพทย์อย่างน้อย 1 คน ทันตแพทย์อยู่แผนกเดียว)' },
        { t: 'DENTIST 1 — handles — 0..M APPOINTMENT' },
        { t: 'PATIENT 1 — makes — 0..M APPOINTMENT' },
        { t: 'APPOINTMENT 1 — includes — 1..M TREATMENT' },
        { t: 'PROCEDURE 1 — is used in — 0..M TREATMENT' },
        { t: 'ทุกเส้นเป็น 1:M TREATMENT คือ associative entity ของ M:N ระหว่าง APPOINTMENT กับ PROCEDURE', note: true },
        { t: 'ค่าขั้นต่ำ (0 หรือ 1) ขึ้นกับกฎของธุรกิจ ให้เขียนเหตุผลสั้นๆ ข้างเส้น', note: true }] },
    };
    const keys = Object.keys(STEPS);
    let cur = 'anom';
    const chips = el('div', { class: 'presets', style: 'justify-content:flex-start;margin:0 0 14px' });
    const mk = (k, l) => chips.append(chip(l, () => { cur = k; render(); }, k === cur));
    mk('all', 'ทั้งหมด'); keys.forEach(k => mk(k, STEPS[k].label));
    const out = el('div', { class: 'ansout' });
    host.append(chips, out);
    function render() {
      $$('.chip', chips).forEach((c, i) => c.setAttribute('aria-pressed', String((i === 0 ? 'all' : keys[i - 1]) === cur)));
      const lines = cur === 'all' ? keys.flatMap(k => [{ html: `<b class="stephd">${STEPS[k].label}</b>`, hd: true }, ...STEPS[k].lines]) : STEPS[cur].lines;
      Hop.work(out, lines, { stagger: cur === 'all' ? 25 : 90 });
    }
    render();
  })();

  /* ---------- 13. warehouse / mart / mining ---------- */
  (() => {
    const host = $('#fig-use');
    let mode = 'wh', loc = 'branch', tm = 'quarter';
    const sg = Seg([['wh', 'Data warehouse'], ['mart', 'Data mart'], ['mine', 'Data mining']], mode, k => { mode = k; upd(); });
    const dia = el('div', { class: 'udia' });
    dia.innerHTML = `<div class="urow src"><span>ระบบขาย</span><span>ระบบบัญชี</span><span>ระบบซ่อม</span></div><div class="uarr">รวมข้อมูลเข้าคลัง</div><button class="ubox wh" data-k="warehouse"><b>Data warehouse</b><small>ข้อมูลทั้งบริษัท ไม่ว่าเก็บที่ไหน</small></button><div class="uarr two"><span>ส่งเฉพาะส่วนที่แผนกใช้</span><span>วิเคราะห์หา pattern</span></div><div class="urow"><button class="ubox mart" data-k="mart"><b>Data mart</b><small>ฝ่ายการตลาด</small></button><button class="ubox mart" data-k="mart"><b>Data mart</b><small>ฝ่ายการเงิน</small></button><button class="ubox mine" data-k="mining"><b>Data mining</b><small>หา pattern</small></button></div>`;
    const panel = el('div', { class: 'upanel' });
    host.append(el('div', { class: 'ctrls', style: 'margin:0 0 16px' }, sg.box), dia, panel);
    const SALES = [['Chicago Loop', 'Illinois', 'USA', '05/04/22', 451121], ['Brooklyn', 'New York', 'USA', '01/05/22', 435677], ['Brooklyn', 'New York', 'USA', '08/04/22', 98765], ['Chicago Loop', 'Illinois', 'USA', '20/07/22', 6543]];
    const LOCI = { branch: 0, state: 1, country: 2 };
    function rollup() {
      const m = new Map();
      SALES.forEach(r => { const [d, mo, y] = r[3].split('/').map(Number); const t = tm === 'quarter' ? `Q${Math.ceil(mo / 3)} ${2000 + y}` : String(2000 + y); const k = r[LOCI[loc]] + '|' + t; m.set(k, (m.get(k) || 0) + r[4]); });
      return [...m.entries()].sort().map(([k, v]) => [...k.split('|'), v]);
    }
    function upd() {
      dia.className = 'udia m-' + mode;
      if (mode === 'wh') {
        panel.innerHTML = '';
        const l = Seg([['branch', 'สาขา'], ['state', 'รัฐ'], ['country', 'ประเทศ']], loc, k => { loc = k; upd2(); });
        const t = Seg([['quarter', 'ไตรมาส'], ['year', 'ปี']], tm, k => { tm = k; upd2(); });
        const tbl = el('div', { class: 'tw' });
        const say = el('p', { class: 'say' });
        panel.append(el('p', { class: 'say', html: 'ตัวอย่างจากสไลด์ 49–57: บริษัท ABC อยากได้รายงานยอดขายตามสาขา รัฐ ประเทศ และไตรมาสหรือปี เลือก dimension แล้วดูว่ายอดถูกรวมใหม่ โดยไม่ต้องรู้ว่าข้อมูลเก็บที่ไหน' }), el('div', { class: 'ctrls' }, l.box, t.box), tbl, say);
        function upd2() {
          l.set(loc); t.set(tm);
          const rs = rollup();
          tbl.innerHTML = `<table class="dt"><thead><tr><th>${{ branch: 'สาขา', state: 'รัฐ', country: 'ประเทศ' }[loc]}</th><th>${tm === 'quarter' ? 'ไตรมาส' : 'ปี'}</th><th>ยอดขาย</th></tr></thead><tbody>${rs.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2].toLocaleString()}</td></tr>`).join('')}</tbody></table>`;
          say.innerHTML = `มีข้อมูลดิบ ${SALES.length} รายการ (ตาราง Sales) พอเลือกระดับ ${{ branch: 'สาขา', state: 'รัฐ', country: 'ประเทศ' }[loc]} และ${tm === 'quarter' ? 'ไตรมาส' : 'ปี'} ก็ได้ ${rs.length} บรรทัด`;
        }
        upd2();
      } else if (mode === 'mart') {
        panel.innerHTML = `<p class="say">${Hop.t('mart')} ดึงเฉพาะส่วนที่แผนกนั้นใช้จาก warehouse ฝ่ายการตลาดสนใจลูกค้าและสินค้า ฝ่ายการเงินสนใจยอดรายรับ ต่างฝ่ายต่างได้คลังเล็กที่ตอบโจทย์ตัวเอง ค้นเร็วกว่า และไม่เห็นข้อมูลของแผนกอื่น</p><div class="martrow"><div class="mc"><b>Mart การตลาด</b><span>ลูกค้า</span><span>สินค้า</span><span>แคมเปญ</span></div><div class="mc"><b>Mart การเงิน</b><span>ยอดขาย</span><span>รายรับ</span><span>ต้นทุน</span></div></div>`;
      } else {
        panel.innerHTML = `<p class="say">${Hop.t('mining')} หา pattern ที่มีความหมายในข้อมูลที่เก็บไว้ เช่น clickstream ของเว็บ (ลำดับการคลิกของผู้เข้าชม) เป้าหมายที่สไลด์ยกตัวอย่าง:</p><ul class="ul2"><li>เพิ่มจำนวนหน้าที่ดูต่อครั้ง และจำนวนลูกค้าที่ถูกแนะนำต่อ</li><li>ลดจำนวนคลิกกว่าลูกค้าจะปิดการขาย</li><li>เพิ่มจำนวน checkout ต่อการเข้าชม และกำไรเฉลี่ยต่อ checkout</li><li>สร้างโปรไฟล์ของลูกค้าใหม่</li></ul>`;
      }
    }
    upd();
  })();

  /* ---------- 14. data control ---------- */
  (() => {
    const host = $('#fig-ctrl');
    const CTRL = [['access', 'จำกัดการเข้าถึง', 'ให้แต่ละคนเข้าถึงเฉพาะส่วนที่จำเป็น'], ['passw', 'ID, password, permission', 'พิสูจน์ตัวตน และกำหนดว่าทำอะไรได้'], ['encrypt', 'Encryption', 'ข้อมูลอ่านไม่ออกถ้าไม่มีกุญแจ'], ['backup', 'Backup', 'สำเนาเก็บไว้ตามเวลาที่กำหนด'], ['recovery', 'Recovery', 'ใช้สำเนากู้ข้อมูลคืน'], ['auditlog', 'Audit log', 'บันทึกว่าใครทำอะไรเมื่อไหร่']];
    const SC = [
      { q: 'คนนอกองค์กรพยายามเข้าระบบ', c: ['passw'], why: 'ต้องพิสูจน์ตัวตนด้วย user ID และ password ก่อนเข้า' },
      { q: 'พนักงานฝ่ายขายเปิดดูตารางเงินเดือน', c: ['access'], why: 'จำกัดการเข้าถึงให้เห็นเฉพาะส่วนที่จำเป็น (subschema ของฝ่ายขายไม่มีตารางเงินเดือน)' },
      { q: 'พนักงานฝ่ายขายอ่านราคาสินค้าได้แต่ห้ามแก้', c: ['passw'], why: 'ใช้ permission กำหนดสิทธิ์รายคนว่าอ่านได้อย่างเดียวหรือแก้ได้' },
      { q: 'มีคนขโมยไฟล์ฐานข้อมูลไปทั้งไฟล์', c: ['encrypt'], why: 'password กันได้แค่ตอนเข้าระบบ แต่ถ้าไฟล์ถูกเข้ารหัสไว้ คนที่ได้ไฟล์ไปก็อ่านไม่ออก' },
      { q: 'ฮาร์ดดิสก์เสีย ข้อมูลหายหมด', c: ['backup', 'recovery'], why: 'ต้องมี backup เตรียมไว้ก่อน แล้วใช้ขั้นตอน recovery นำสำเนามากู้คืน' },
      { q: 'ยอดเงินในบัญชีลูกค้าถูกแก้ ต้องรู้ว่าใครแก้เมื่อไหร่', c: ['auditlog'], why: 'audit log และ audit field บันทึกผู้ทำรายการและเวลา ไว้ตรวจสอบย้อนหลัง' },
    ];
    let si = 0;
    const chips = el('div', { class: 'cscen' });
    const grid = el('div', { class: 'cgrid' });
    const say = el('p', { class: 'say' });
    host.append(chips, grid, say);
    SC.forEach((s, i) => chips.append(el('button', { class: 'cq', text: s.q, 'aria-pressed': String(i === 0), onclick: () => { si = i; upd(); } })));
    CTRL.forEach(([k, t, d]) => grid.append(el('button', { class: 'ct', 'data-k': k, 'data-c': k, style: tcStyle(k), html: `<b>${t}</b><span>${d}</span>` })));
    function upd() {
      $$('.cq', chips).forEach((b, i) => b.setAttribute('aria-pressed', String(i === si)));
      const s = SC[si];
      $$('.ct', grid).forEach(b => b.classList.toggle('hit', s.c.includes(b.dataset.c)));
      say.innerHTML = s.why;
    }
    upd();
  })();
})();
