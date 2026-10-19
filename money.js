// Chapter 3 figures: map, web/SaaS, sorters, fee models, cumulative cash flow, PV, answer sheet, NPV.
(() => {
  const { $, $$, el, esc, clamp, lerp, ease, icon } = Hop;
  Hop.page(3);

  const mcq = (host, d) => { const idx = Hop.shuffle(d.opts.map((_, i) => i)); Hop.mcq(host, { ...d, opts: idx.map(i => d.opts[i]), a: idx.indexOf(d.a), whyWrong: Object.fromEntries(Object.entries(d.whyWrong || {}).map(([k, v]) => [idx.indexOf(+k), v])) }); };

  /* ---------- shared maths ---------- */
  const fmt = (n, d = 0) => {
    const v = Math.abs(n) < 0.5 * Math.pow(10, -d) ? 0 : n;
    return (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  const fac = (r, t) => Math.round(1e4 / Math.pow(1 + r / 100, t)) / 1e4;
  const f4 = x => x.toFixed(4);
  const col = c => c === 'ink' ? 'var(--ink)' : `var(--c-${c})`;
  const INV = 105000, FL = [35000, 45000, 50000, 50000, 45000, 35000], R12 = 12;

  function model(mode) {
    const cf = [-INV], bal = [-INV];
    FL.forEach((v, i) => { const x = mode === 'disc' ? v * fac(R12, i + 1) : v; cf.push(x); bal.push(bal[i] + x); });
    const k = bal.findIndex(b => b >= 0), yb = k - 1, remain = -bal[yb], full = cf[k];
    return { cf, bal, k, yb, remain, full, pb: yb + remain / full };
  }
  const MODELS = { simple: model('simple'), disc: model('disc') };

  /* ---------- map hero ---------- */
  (() => {
    const host = $('#map');
    const node = (k, t, s, m, c, fill) => el('button', { class: 'mp-node' + (fill ? ' fill' : ''), 'data-k': k, style: `--tc:${col(c)}`, html: `<div class="t">${t}</div><div class="s">${s}</div>${m ? `<div class="m">${m}</div>` : ''}` });
    const chip = (k, l, c) => el('button', { class: 'mp-chip' + (c === 'ink' ? ' ink' : ''), 'data-k': k, style: `--tc:${col(c)}`, text: l });
    const colm = (n, chips) => el('div', { class: 'mp-grp' }, n, chips.length ? el('div', { class: 'mp-chips' }, chips) : null);
    const arr = () => el('span', { class: 'arr', html: icon('arrow') });
    const lane1 = el('div', { class: 'mp-lane' },
      el('h3', { class: 'mp-h', text: 'ได้ระบบมาอย่างไร' }),
      el('div', { class: 'mp-row' },
        colm(node('inhouse', 'In-house', 'ทีมของเราพัฒนาเอง', '', 'violet'), [chip('buildbuy', 'Build or Buy', 'violet')]),
        colm(node('package', 'Off-the-shelf', 'ซื้อซอฟต์แวร์สำเร็จรูป', '', 'teal'), [chip('horizontal', 'Horizontal', 'teal'), chip('vertical', 'Vertical', 'violet')]),
        colm(node('outsource', 'Outsource', 'จ้างบริษัทอื่นทำ', '', 'blue'), [chip('provider', 'Service provider', 'blue'), chip('asp', 'ASP', 'blue'), chip('offshore', 'Offshore', 'blue'), chip('fixedfee', 'Fixed fee', 'rose'), chip('subscription', 'Subscription', 'rose'), chip('usage', 'Usage', 'rose')])),
      el('div', { class: 'mp-tech' }, el('span', { text: 'บนอินเทอร์เน็ต' }), chip('saas', 'SaaS', 'ink'), chip('webbased', 'Web-based', 'ink'), chip('middle', 'Middle layer', 'ink'), chip('web2', 'Web 2.0', 'ink'), chip('cloud', 'Cloud', 'ink')));
    const lane2 = el('div', { class: 'mp-lane' },
      el('h3', { class: 'mp-h', text: 'คุ้มที่จะทำหรือไม่' }),
      el('div', { class: 'mp-chain' },
        node('costbenefit', 'ผลตอบแทน', 'Tangible วัดเป็นเงินได้ Intangible วัดไม่ได้', '', 'green', true), arr(),
        node('payback', 'Payback', 'กี่ปีคืนทุน', 'ปีก่อน + ที่ขาด ÷ ทั้งปี', 'blue', true), arr(),
        node('pv', 'PV', 'เงินอนาคตเป็นเงินวันนี้', 'Vt ÷ (1+r)^t', 'amber', true), arr(),
        node('dpayback', 'Discounted payback', 'payback ที่ลดค่าเงินแล้ว', 'ใช้ PV แทนเงินรับ', 'blue', true), arr(),
        node('npv', 'NPV', 'คุ้มไหม ตัวเลขเดียว', 'PV รับ − PV จ่าย', 'blue', true)));
    host.append(lane1, lane2);
    Hop.onView(host, () => {
      $$('.mp-node, .mp-chip', host).forEach((n, i) => setTimeout(() => n.classList.add('in'), 60 + i * 38));
    }, .15);
  })();

  /* ---------- web / SaaS ---------- */
  (() => {
    const host = $('#fig-web');
    const T = Hop.t;
    const S = [
      { label: 'ซื้อ license ติดตั้งเอง', pcs: ['ซอฟต์แวร์', 'ซอฟต์แวร์', 'ซอฟต์แวร์'], link: 'license', lic: true, box: ['ผู้ขายซอฟต์แวร์', 'ขาย license แล้วจบ ลูกค้าติดตั้ง อัปเกรด และบำรุงรักษาเอง'], sw: false, tail: false,
        say: () => `ซอฟต์แวร์ถูกติดตั้งบนเครื่องลูกค้าทุกเครื่อง ลูกค้าถือ ${T('license')} และต้องดูแลเอง` },
      { label: 'SaaS บนอินเทอร์เน็ต', pcs: ['เบราว์เซอร์', 'เบราว์เซอร์', 'เบราว์เซอร์'], link: 'internet', lic: false, box: ['ผู้ให้บริการ SaaS', 'ซอฟต์แวร์และข้อมูลอยู่ที่นี่ ผู้ให้บริการดูแลระบบให้'], sw: true, tail: false,
        say: () => `เครื่องลูกค้ามีแค่เบราว์เซอร์ ซอฟต์แวร์อยู่บนอินเทอร์เน็ตเป็นบริการ (${T('saas')}) ลูกค้าจ่ายค่าบริการและไม่ต้องดูแลตัวระบบ` },
      { label: 'Web-based + ระบบเดิม', pcs: ['เบราว์เซอร์', 'เบราว์เซอร์', 'เบราว์เซอร์'], link: 'internet', lic: false, box: ['ระบบ web-based', 'ระบบใหม่ที่ให้บริการผ่านเว็บ'], sw: true, tail: true,
        say: () => `องค์กรมีระบบเดิมอยู่แล้ว จึงสร้าง ${T('middle', 'middle layer')} เป็นตัวกลางให้ระบบ web-based ส่งข้อมูลไปมากับระบบเดิม โดยไม่ต้องรื้อระบบเดิม` },
    ];
    let cur = 0;
    const seg = el('div', { class: 'seg', role: 'group' }, S.map((s, i) => el('button', { 'aria-pressed': String(i === 0), text: s.label, onclick: () => go(i) })));
    const pcIcon = `<svg viewBox="-24 -22 48 44">${Hop.dev('pc', 0, 0)}</svg>`;
    const pcs = [0, 1, 2].map(() => el('div', { class: 'wf-pc', html: `${pcIcon}<span class="chip"></span>` }));
    const link = el('div', { class: 'wf-link' }, el('i'), el('i'), el('i'), el('span'));
    const box = el('div', { class: 'wf-box' });
    const tail = el('div', { class: 'wf-tail hide', html: '<div class="arrow">↓</div><div class="mid">Middle layer</div><div class="arrow">↓</div><div class="old">ระบบเดิม</div>' });
    const say = el('p', { class: 'say' });
    host.append(el('div', { class: 'ctrls', style: 'margin:0 0 4px' }, seg),
      el('div', { class: 'webfig' }, el('div', { class: 'wf-col' }, pcs), link, el('div', { class: 'wf-col' }, box, tail)), say);
    function go(i) {
      cur = i; const s = S[i];
      $$('button', seg).forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      pcs.forEach((p, j) => { const c = $('.chip', p); c.textContent = s.pcs[j]; c.classList.toggle('web', !s.lic); });
      link.className = 'wf-link go' + (s.lic ? ' lic' : ''); $('span', link).textContent = s.link;
      if (s.lic) link.style.setProperty('--dir', 'reverse');
      box.className = 'wf-box' + (s.sw ? ' sw' : ''); box.innerHTML = `<div class="t">${s.box[0]}</div><div class="s">${s.box[1]}</div>`;
      tail.classList.toggle('hide', !s.tail);
      say.innerHTML = s.say();
    }
    go(0);
  })();
  mcq($('#q-web'), {
    q: 'บริษัทมีระบบเดิมใช้งานอยู่ และอยากเพิ่มระบบ web-based ใหม่ สไลด์บอกว่าโดยทั่วไปต้องสร้างอะไรเพิ่ม',
    opts: ['Middle layer เพื่อให้ระบบใหม่คุยกับระบบเดิมได้', 'License ใหม่ให้ทุกเครื่อง', 'ระบบ Web 2.0 ให้ผู้ใช้แชร์ข้อมูล', 'Cloud ของตัวเองเพื่อแทนระบบเดิมทั้งหมด'], a: 0,
    whyWrong: { 1: 'license คือวิธีขายซอฟต์แวร์แบบเดิมที่ติดตั้งเอง ไม่เกี่ยวกับการเชื่อมสองระบบ', 2: 'Web 2.0 คือเว็บที่ผู้ใช้แชร์และโต้ตอบกัน (wiki, blog, Facebook) ไม่ใช่ตัวเชื่อมระบบ', 3: 'ระบบเดิมแทนที่ได้ยาก สไลด์จึงให้สร้างตัวกลางแทนการรื้อทิ้ง' },
    why: 'ระบบเดิมแทนที่ด้วยระบบใหม่ได้ยาก จึงสร้าง middle layer เป็นตัวกลางให้สองฝั่งสื่อสารกันได้',
  });

  /* ---------- sorters ---------- */
  function Sorter(host, { cats, items }) {
    const prog = el('div', { class: 'prog' }, el('i'));
    const stage = el('div', { class: 'stage' });
    const fbh = el('div');
    const btns = el('div', { class: 'btns' });
    const bins = el('div', { class: 'bins' });
    const binEls = cats.map(c => el('div', { class: 'bin', style: `--tc:${col(c.c)}` }));
    bins.append(...binEls);
    const box = el('div', { class: 'sorter' }, prog, stage, fbh, btns, bins);
    host.append(box);
    let q, idx, busy;
    cats.forEach((c, i) => btns.append(el('button', { class: 'cat', style: `--tc:${col(c.c)}`, html: `${c.label}${c.sub ? `<small>${c.sub}</small>` : ''}`, onclick: () => answer(i) })));
    function show() {
      fbh.innerHTML = '';
      $('i', prog).style.width = (idx / q.length * 100) + '%';
      if (idx >= q.length) {
        stage.replaceChildren(el('div', { class: 'done' }, el('p', { text: 'จัดครบทุกข้อ' }), el('button', { class: 'btn small', html: `${icon('shuffle')} เล่นใหม่`, onclick: start })));
        btns.style.opacity = .4; btns.style.pointerEvents = 'none';
        return;
      }
      btns.style.opacity = 1; btns.style.pointerEvents = '';
      stage.replaceChildren(el('div', { class: 'card', html: q[idx].t }));
    }
    function answer(i) {
      if (busy || idx >= q.length) return;
      const it = q[idx], card = $('.card', stage);
      if (i === it.a) {
        busy = true;
        fbh.innerHTML = `<div class="fb good"><div class="h">ถูก</div>${it.why}</div>`;
        card.classList.add('fly-' + i);
        setTimeout(() => { binEls[i].append(el('div', { class: 'it', html: it.t })); idx++; busy = false; const f = fbh.innerHTML; show(); fbh.innerHTML = f; }, 330);
      } else {
        card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
        fbh.innerHTML = `<div class="fb bad"><div class="h">ยังไม่ใช่</div>${it.wrong || it.why}</div>`;
      }
    }
    function start() { q = Hop.shuffle(items); idx = 0; busy = false; binEls.forEach(b => b.replaceChildren()); show(); }
    start();
  }

  Sorter($('#fig-buy'), {
    cats: [{ label: 'พัฒนาเอง', sub: 'in-house', c: 'violet' }, { label: 'ซื้อสำเร็จรูป', sub: 'off-the-shelf', c: 'teal' }],
    items: [
      { t: 'ตรงกับความต้องการทางธุรกิจ', a: 0, why: 'ของสำเร็จรูปทำมาให้คนทั่วไป ไม่ได้ทำเพื่อธุรกิจเราโดยเฉพาะ ถ้าอยากให้ตรงที่สุดต้องสร้างเอง' },
      { t: 'ป้องกันการเปลี่ยนกระบวนการทำงานของบริษัท', a: 0, why: 'ซอฟต์แวร์สำเร็จรูปมักทำให้ต้องปรับวิธีทำงานตามตัวซอฟต์แวร์ ถ้าไม่อยากเปลี่ยนต้องสร้างให้เข้ากับงานเรา' },
      { t: 'ระบบใหม่ทำงานร่วมกับระบบเดิมได้', a: 0, why: 'สร้างเองกำหนดจุดเชื่อมกับระบบเดิมได้ตามที่ต้องการ' },
      { t: 'สอดคล้องกับความต้องการด้านความปลอดภัย', a: 0, why: 'สร้างเองควบคุมมาตรการความปลอดภัยได้เองทุกจุด' },
      { t: 'ต้นทุนต่ำกว่า', a: 1, why: 'ผู้ขายกระจายต้นทุนพัฒนาไปหลายลูกค้า ราคาต่อรายจึงถูกกว่าสร้างเอง' },
      { t: 'ใช้เวลาในการพัฒนาน้อยกว่า', a: 1, why: 'ของที่ทำเสร็จแล้วซื้อมาติดตั้งใช้ได้เลย ไม่ต้องรอพัฒนา' },
      { t: 'ต้องการจำนวนคนในการพัฒนาน้อยกว่า', a: 1, why: 'ผู้ขายพัฒนาไว้แล้ว องค์กรไม่ต้องมีทีมพัฒนาขนาดใหญ่' },
      { t: 'การอัปเกรดระบบในอนาคตได้รับบริการจากผู้ขาย', a: 1, why: 'ผู้ขายซอฟต์แวร์เป็นคนทำรุ่นใหม่และให้บริการอัปเกรดให้' },
    ],
  });
  Sorter($('#fig-hv'), {
    cats: [{ label: 'Horizontal', sub: 'ใช้ได้หลายธุรกิจ', c: 'teal' }, { label: 'Vertical', sub: 'ธุรกิจเฉพาะอย่าง', c: 'violet' }],
    items: [
      { t: 'Microsoft Word', a: 0, why: 'องค์กรทุกประเภทพิมพ์เอกสาร จึงเป็น horizontal' },
      { t: 'ซอฟต์แวร์บัญชี', a: 0, why: 'ทุกธุรกิจต้องทำบัญชี ใช้ได้ข้ามธุรกิจ จึงเป็น horizontal' },
      { t: 'ระบบเงินเดือนพนักงาน', a: 0, why: 'ทุกองค์กรมีพนักงานที่ต้องจ่ายเงินเดือน ไม่ผูกกับธุรกิจใด' },
      { t: 'ระบบธนาคาร', a: 1, why: 'สร้างสำหรับธุรกิจธนาคารโดยเฉพาะ ร้านอาหารหรือโรงงานใช้ไม่ได้' },
      { t: 'ระบบโรงพยาบาล', a: 1, why: 'สร้างสำหรับงานโรงพยาบาลโดยเฉพาะ จึงเป็น vertical' },
      { t: 'ระบบจัดการห้องพักโรงแรม', a: 1, why: 'ใช้เฉพาะธุรกิจโรงแรม จึงเป็น vertical' },
    ],
  });
  Sorter($('#fig-ti'), {
    cats: [{ label: 'Tangible', sub: 'แสดงเป็นตัวเลขได้ชัดเจน', c: 'green' }, { label: 'Intangible', sub: 'แสดงให้ชัดเจนไม่ได้', c: 'ink' }],
    items: [
      { t: 'ค่าแรงพนักงานคีย์ข้อมูลลดลงเดือนละ 30,000 บาท', a: 0, why: 'มีจำนวนเงินชัดเจน นำไปเป็นเงินรับในการคำนวณได้' },
      { t: 'ยอดขายเพิ่มขึ้น 10% ต่อปี', a: 0, why: 'วัดเป็นตัวเลขและเงินได้ จึงเป็น tangible' },
      { t: 'ค่ากระดาษและเอกสารลดลงปีละ 80,000 บาท', a: 0, why: 'มีจำนวนเงินระบุได้' },
      { t: 'เวลาออกใบเสร็จลดจาก 10 นาทีเหลือ 2 นาที', a: 0, why: 'วัดออกมาเป็นตัวเลขได้ชัดเจน (แปลงเป็นเงินค่าแรงได้) จึงเป็น tangible' },
      { t: 'ลูกค้าพึงพอใจมากขึ้น', a: 1, why: 'มีประโยชน์จริง แต่บอกเป็นจำนวนเงินตรงๆ ไม่ได้' },
      { t: 'ภาพลักษณ์ขององค์กรดีขึ้น', a: 1, why: 'วัดเป็นเงินไม่ได้ชัดเจน จึงเป็น intangible' },
      { t: 'ผู้บริหารตัดสินใจได้ดีขึ้นเพราะมีข้อมูลทันสมัย', a: 1, why: 'ดีขึ้นแต่ไม่มีตัวเลขเงินกำกับ จึงเป็น intangible' },
      { t: 'ขวัญกำลังใจของพนักงานดีขึ้น', a: 1, why: 'ประโยชน์ที่แสดงให้เห็นชัดเจนไม่ได้ จึงเป็น intangible' },
    ],
  });

  /* ---------- fee models ---------- */
  (() => {
    const host = $('#fig-fees');
    const FIX = 60000, PERUSER = 300, PERTX = 1.5, MAX = 150000;
    let users = 120, tx = 30000;
    const slider = (label, unit, min, max, step, val, on) => {
      const v = el('b'), s = el('input', { type: 'range', class: 'slider', min, max, step, value: val, 'aria-label': label });
      const upd = () => { v.textContent = (+s.value).toLocaleString('en-US'); s.style.setProperty('--p', ((s.value - min) / (max - min) * 100) + '%'); on(+s.value); };
      s.addEventListener('input', upd);
      const w = el('div', { class: 'ctl' }, el('label', {}, el('span', { text: label }), el('span', {}, v, ' ', unit)), s);
      return { w, upd };
    };
    const bar = (termKey, formula) => {
      const nm = el('span', { class: 'nm', html: Hop.t(termKey) }), fm = el('span', { class: 'fm' });
      const fl = el('div', { class: 'fl' });
      return { box: el('div', { class: 'bar3' }, el('div', { class: 'top' }, nm, fm), el('div', { class: 'tr' }, fl)), fm, fl };
    };
    const b1 = bar('fixedfee'), b2 = bar('subscription'), b3 = bar('usage');
    const last = [null, null, null];
    function draw() {
      const vals = [FIX, users * PERUSER, Math.round(tx * PERTX)];
      [[b1, 'ราคาตกลงไว้ล่วงหน้า'], [b2, `${PERUSER} × ${users.toLocaleString('en-US')} คน`], [b3, `${PERTX} × ${tx.toLocaleString('en-US')} รายการ`]].forEach(([b, f], i) => {
        b.fm.textContent = f; b.fl.style.width = (vals[i] / MAX * 100) + '%'; b.fl.textContent = vals[i].toLocaleString('en-US');
        if (last[i] != null && last[i] !== vals[i]) { b.fl.classList.add('moved'); clearTimeout(b.fl._t); b.fl._t = setTimeout(() => b.fl.classList.remove('moved'), 500); }
        last[i] = vals[i];
      });
    }
    const s1 = slider('จำนวนผู้ใช้', 'คน', 10, 500, 10, users, v => { users = v; draw(); });
    const s2 = slider('ธุรกรรมต่อเดือน', 'รายการ', 1000, 100000, 1000, tx, v => { tx = v; draw(); });
    host.append(el('div', { class: 'rowc' }, s1.w, s2.w), el('div', { class: 'bars' }, b1.box, b2.box, b3.box), el('p', { class: 'say', style: 'min-height:0', html: 'ค่าบริการต่อเดือน (บาท) ตัวอย่างสมมติ: fixed fee 60,000, subscription 300 ต่อคน, usage 1.5 ต่อรายการ' }));
    s1.upd(); s2.upd();
  })();
  mcq($('#q-out'), {
    q: 'บริษัทเช่าระบบบัญชีที่ผู้ให้บริการสร้างไว้แล้ว จ่ายตามจำนวนพนักงานที่ล็อกอินได้ ไม่เกี่ยวกับว่าบันทึกบัญชีกี่รายการ เป็นค่าบริการแบบใด',
    opts: ['Subscription model', 'Fixed fee model', 'Usage / Transaction model', 'Offshore model'], a: 0,
    whyWrong: { 1: 'fixed fee ราคาตายตัว ไม่เปลี่ยนตามจำนวนผู้ใช้', 2: 'usage คิดตามปริมาณธุรกรรม แต่โจทย์บอกว่าไม่เกี่ยวกับจำนวนรายการ', 3: 'offshore คือการจ้างบริษัทต่างประเทศ ไม่ใช่รูปแบบคิดค่าบริการ' },
    why: 'ราคาขึ้นกับจำนวนผู้ใช้ (#users) คือ subscription ส่วนคนที่เช่าซอฟต์แวร์แบบนี้ก็คือลูกค้าของ ASP',
  });

  /* ---------- cumulative cash-flow chart ---------- */
  function CashFig(host, { mode: mode0, toggle }) {
    let mode = mode0, tNow = 0;
    const other = () => mode === 'simple' ? 'disc' : 'simple';
    const seg = toggle ? el('div', { class: 'seg', role: 'group' }, [['simple', 'คืนทุนธรรมดา'], ['disc', 'คิดลด r = 12%']].map(([m, l]) => el('button', { 'aria-pressed': String(m === mode), text: l, onclick: e => { mode = m; $$('button', seg).forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); draw(tNow); } }))) : null;
    const wrap = el('div', { style: 'margin-top:14px;width:100%' });
    const scrubHost = el('div');
    const pb = el('div', { class: 'pbline' });
    const frac = el('div', { class: 'fracbar', html: '<div class="f"></div><div class="l"><span></span><span></span></div>' });
    const say = el('p', { class: 'say' });
    const cmp = toggle ? el('div', { class: 'cmp' }) : null;
    host.append(...[seg, wrap, scrubHost, pb, frac, say, cmp].filter(Boolean));

    let svg, W = 0, geo, E;
    function build() {
      W = Math.max(280, Math.round(wrap.clientWidth || host.clientWidth - 44));
      const H = W < 480 ? 270 : 330, m = { l: W < 480 ? 44 : 54, r: 8, t: 16, b: 30 };
      const pw = W - m.l - m.r, ph = H - m.t - m.b, yMin = -120000, yMax = 170000;
      const X = i => m.l + (i + .5) * pw / 7, Y = v => m.t + (yMax - v) / (yMax - yMin) * ph;
      geo = { X, Y, bw: Math.min(44, pw / 7 * .58) };
      svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, style: 'display:block;width:100%;height:auto;overflow:visible' });
      [-100000, 0, 100000].forEach(v => {
        svg.append(el('line', { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: v === 0 ? 'var(--ink-2)' : 'var(--line)', 'stroke-width': v === 0 ? 2 : 1 }));
        svg.append(el('text', { x: m.l - 6, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': 12, fill: 'var(--muted)', text: v === 0 ? '0' : (v < 0 ? '−100k' : '100k') }));
      });
      for (let i = 0; i < 7; i++) svg.append(el('text', { x: X(i), y: H - 8, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: 'var(--muted)', text: i }));
      svg.append(el('text', { x: m.l - 6, y: H - 8, 'text-anchor': 'end', 'font-size': 12, fill: 'var(--muted)', text: 'ปีที่' }));
      E = {
        ghost: el('polyline', { fill: 'none', stroke: 'var(--muted)', 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: .55 }),
        ghostDot: el('circle', { r: 6, fill: 'var(--band)', stroke: 'var(--muted)', 'stroke-width': 2.5, opacity: toggle ? 1 : 0 }),
        bars: Array.from({ length: 7 }, () => el('rect', { rx: 4 })),
        labs: Array.from({ length: 7 }, () => el('text', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 600 })),
        line: el('polyline', { fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
        cur: el('line', { stroke: 'var(--ink)', 'stroke-width': 1.5, 'stroke-dasharray': '3 4', opacity: .6 }),
        dot: el('circle', { r: 7, fill: 'var(--ink)', stroke: 'var(--band)', 'stroke-width': 2.5 }),
        pbl: el('line', { stroke: 'var(--c-blue)', 'stroke-width': 2, 'stroke-dasharray': '4 4' }),
        pbDot: el('circle', { r: 8, fill: 'var(--c-blue)', stroke: 'var(--band)', 'stroke-width': 3 }),
      };
      svg.append(E.ghost, E.ghostDot, ...E.bars, ...E.labs, E.pbl, E.line, E.cur, E.pbDot, E.dot);
      wrap.replaceChildren(svg);
    }

    function draw(t) {
      tNow = t;
      if (!svg) return;
      const M = MODELS[mode], G = MODELS[other()], { X, Y, bw } = geo, y0 = Y(0), d = mode === 'disc' ? 1 : 0;
      const val = i => i === 0 ? M.bal[0] : lerp(M.bal[i - 1], M.bal[i], clamp(t - (i - 1), 0, 1));
      const bal = tt => { const i = Math.min(5, Math.floor(tt)); return lerp(M.bal[i], M.bal[i + 1], clamp(tt - i, 0, 1)); };
      E.ghost.setAttribute('points', G.bal.map((b, i) => `${X(i)},${Y(b)}`).join(' '));
      E.ghost.style.display = toggle ? '' : 'none';
      E.ghostDot.setAttribute('cx', X(G.pb)); E.ghostDot.setAttribute('cy', y0);
      E.bars.forEach((b, i) => {
        const vis = t > i - 1 + 1e-6, v = vis ? val(i) : 0;
        b.setAttribute('x', X(i) - bw / 2); b.setAttribute('width', bw);
        b.setAttribute('y', Math.min(y0, Y(v))); b.setAttribute('height', Math.max(0, Math.abs(Y(v) - y0)));
        b.setAttribute('fill', v < 0 ? 'var(--c-rose)' : 'var(--c-green)'); b.setAttribute('opacity', vis ? .88 : 0);
        const L = E.labs[i], full = t >= i - 1e-6;
        L.setAttribute('x', X(i)); L.setAttribute('y', M.bal[i] < 0 ? Y(M.bal[i]) + 15 : Y(M.bal[i]) - 6);
        L.setAttribute('fill', M.bal[i] < 0 ? 'var(--c-rose)' : 'var(--c-green)'); L.setAttribute('opacity', full ? 1 : 0);
        const k = M.bal[i] / 1000; L.textContent = (k < 0 ? '−' : '') + (Math.round(Math.abs(k) * 10) / 10);
      });
      const pts = []; for (let i = 0; i <= Math.floor(t + 1e-9); i++) pts.push(`${X(i)},${Y(M.bal[i])}`);
      const tc = clamp(t, 0, 6), cy = bal(tc); if (tc > Math.floor(tc + 1e-9)) pts.push(`${X(tc)},${Y(cy)}`);
      E.line.setAttribute('points', pts.join(' '));
      E.dot.setAttribute('cx', X(tc)); E.dot.setAttribute('cy', Y(cy));
      E.cur.setAttribute('x1', X(tc)); E.cur.setAttribute('x2', X(tc)); E.cur.setAttribute('y1', Y(cy)); E.cur.setAttribute('y2', y0);
      const shown = clamp((t - M.pb) / .25 + 1, 0, 1);
      E.pbDot.setAttribute('cx', X(M.pb)); E.pbDot.setAttribute('cy', y0); E.pbDot.setAttribute('opacity', shown);
      E.pbl.setAttribute('x1', X(M.pb)); E.pbl.setAttribute('x2', X(M.pb)); E.pbl.setAttribute('y1', y0); E.pbl.setAttribute('y2', Y(-120000) - 0); E.pbl.setAttribute('opacity', shown * .8);
      // formula chips
      const ready = t >= M.yb - 1e-6, done = t >= M.pb - 1e-6;
      const chip = (k, n, v, c, on) => `<button class="pc${on ? '' : ' off'}" data-k="${k}" style="--tc:${col(c)}"><div class="n">${n}</div><b>${on ? v : '?'}</b></button>`;
      pb.innerHTML = chip('ybefore', 'ปีก่อนคืนทุน', M.yb, 'blue', ready) + '<span class="op">+</span>' +
        chip('remain', 'ยอดที่ยังขาด', fmt(M.remain, d), 'rose', ready) + '<span class="op">÷</span>' +
        chip('fullyear', `${mode === 'disc' ? 'ค่าเงินปัจจุบัน' : 'เงินรับ'}ปีที่ ${M.k}`, fmt(M.full, d), 'green', ready) +
        `<span class="op">=</span><span class="res"><b>${done ? M.pb.toFixed(2) : '…'}</b> ปี</span>`;
      const fr = clamp(t - M.yb, 0, 1), frFull = M.remain / M.full;
      $('.f', frac).style.width = (ready ? Math.min(fr, frFull) * 100 : 0) + '%'; frac.style.opacity = ready ? 1 : .3;
      const ls = $$('.l span', frac); ls[0].textContent = ready ? `ที่ขาด ${fmt(M.remain, d)}` : ''; ls[1].textContent = ready ? `ทั้งปี ${fmt(M.full, d)}` : '';
      // say
      const i = Math.round(clamp(t, 0, 6)), p = i ? M.bal[i - 1] : null, v = M.bal[i];
      const sg = x => `<b class="${x < 0 ? 'r' : 'g'}">${fmt(x, d)}</b>`;
      let s;
      if (i === 0) s = `ปีที่ 0 จ่ายเงินลงทุน <b class="r">${fmt(INV)}</b> เงินคงเหลือเริ่มที่ ${sg(v)}`;
      else if (mode === 'simple') s = `ปีที่ ${i}: เงินคงเหลือปีก่อน ${sg(p)} + เงินรับ <b class="g">${fmt(FL[i - 1])}</b> = ${sg(v)}`;
      else s = `ปีที่ ${i}: ค่าเงินปัจจุบัน = ${fmt(FL[i - 1])} × ${f4(fac(R12, i))} = <b class="g">${fmt(M.cf[i], 1)}</b> เงินคงเหลือ = ${sg(p)} + ${fmt(M.cf[i], 1)} = ${sg(v)}`;
      if (i > 0) s += p < 0 && v >= 0 ? ' ข้ามศูนย์ในปีนี้ ปีนี้คือปีที่คืนทุน' : v < 0 ? ' ยังติดลบ ยังไม่คืนทุน' : ' คืนทุนไปแล้ว';
      say.innerHTML = s;
      if (cmp) cmp.innerHTML = `เส้นประและวงกลมโปร่งคืออีกแบบ ธรรมดา <b class="mono">${MODELS.simple.pb.toFixed(2)}</b> ปี, คิดลด <b class="mono">${MODELS.disc.pb.toFixed(2)}</b> ปี ต่างกัน <b class="mono">${(MODELS.disc.pb - MODELS.simple.pb).toFixed(2)}</b> ปี`;
    }

    const sc = Hop.scrub(scrubHost, {
      stops: Array.from({ length: 7 }, (_, i) => ({ label: i === 0 ? '<span class="k">ปีที่ 0</span> จ่ายเงินลงทุน 105,000' : `<span class="k">ปีที่ ${i}</span> เงินรับ ${fmt(FL[i - 1])}` })),
      speed: 800, onFrame: draw,
    });
    function init() { build(); draw(sc.t); }
    init();
    new ResizeObserver(() => { const w = Math.round(wrap.clientWidth); if (w && Math.abs(w - W) > 2) { build(); draw(tNow); } }).observe(wrap);
    Hop.onView(host, () => { if (sc.t === 0) sc.play(); }, .6);
    return { sc };
  }
  CashFig($('#fig-pb'), { mode: 'simple', toggle: false });
  CashFig($('#fig-dpb'), { mode: 'disc', toggle: true });
  Hop.eq($('#eq-pb'), [['payback', 'Payback'], ' = ', ['ybefore', 'ปีก่อน'], ' + ', ['remain', 'ที่ขาด'], ' ÷ ', ['fullyear', 'ทั้งปี']], { sym: { payback: 'Payback', ybefore: 'ปีก่อน', remain: 'ที่ขาด', fullyear: 'ทั้งปี' } });

  /* ---------- answer sheet (teacher's spreadsheet) ---------- */
  function AnsSheet(host, mode) {
    const disc = mode === 'disc', M = MODELS[mode], d = disc ? 1 : 0;
    const colsDef = disc ? ['year', 'inv', 'inc', 'fac', 'pv', 'bal'] : ['year', 'inv', 'inc', 'bal'];
    const head = { year: 'ปีที่', inv: 'ลงทุน', inc: 'รายได้', fac: `PV = ${R12}%`, pv: 'ค่าเงินปัจจุบัน', bal: 'เงินคงเหลือ' };
    const tb = el('table', { class: 'ans', style: disc ? '' : 'min-width:0' });
    tb.innerHTML = `<thead><tr>${colsDef.map(c => `<th>${head[c]}</th>`).join('')}</tr></thead>`;
    const body = el('tbody'); tb.append(body);
    const cells = [];
    const val = (i, c) => {
      if (c === 'year') return String(i);
      if (c === 'inv') return i === 0 ? '−105,000' : '';
      if (c === 'inc') return i === 0 ? '' : fmt(FL[i - 1]);
      if (c === 'fac') return i === 0 ? '1' : f4(fac(R12, i));
      if (c === 'pv') return i === 0 ? '−105,000' : fmt(M.cf[i], 1);
      return fmt(M.bal[i], d);
    };
    for (let i = 0; i < 7; i++) {
      const tr = el('tr'); cells[i] = {};
      colsDef.forEach(c => {
        const v = val(i, c), b = el('button', { text: v || '–', class: (v === '' ? 'blank ' : '') + (v.startsWith('−') ? 'neg ' : '') + (c === 'bal' && M.bal[i] >= 0 ? 'pos' : ''), onclick: () => explain(i, c) });
        cells[i][c] = b; tr.append(el('td', {}, b));
      });
      body.append(tr);
    }
    const res = el('div', { class: 'ans-res' });
    const resTxt = disc ? `Payback period = ${M.yb} + (${fmt(M.remain, 1)} ÷ ${fmt(M.full, 1)}) = <b>${M.pb.toFixed(2)}</b> ปี` : `ระยะเวลาคืนทุน = ${M.yb} + (${fmt(M.remain)} ÷ ${fmt(M.full)}) = <b>${M.pb.toFixed(2)}</b> ปี`;
    const resBtn = el('button', { html: resTxt, onclick: () => explain(-1, 'res') });
    res.append(resBtn);
    const say = el('p', { class: 'ans-say', html: 'แตะช่องในตาราง จะบอกว่ามาจากไหนและไฮไลต์ช่องที่เกี่ยวข้อง' });
    host.append(el('div', { class: 'tw' }, tb), res, say);
    function clear() { $$('button', tb).forEach(b => b.classList.remove('src', 'on')); resBtn.classList.remove('on'); $$('tr', tb).forEach(r => r.classList.remove('cross')); }
    const S = (i, c) => cells[i][c].classList.add('src');
    function explain(i, c) {
      clear(); let s;
      if (c === 'res') {
        resBtn.classList.add('on'); S(M.yb, 'bal'); S(M.k, disc ? 'pv' : 'inc'); $$('tr', tb)[M.yb + 1].classList.add('cross');
        s = `ยอดสะสมสิ้นปีที่ ${M.yb} ยังติดลบ <b>${fmt(M.bal[M.yb], d)}</b> ปีที่ ${M.k} กลายเป็นบวก จึงคืนทุนในปีที่ ${M.k} ปีก่อนคืนทุน = <b>${M.yb}</b> ยอดที่ยังขาด = ตัดลบทิ้งได้ <b>${fmt(M.remain, d)}</b> ตัวหาร = ${disc ? 'ค่าเงินปัจจุบัน' : 'เงินรับ'}ของ<b>ปีที่ ${M.k}</b> = <b>${fmt(M.full, d)}</b> (ไม่ใช่ของปีที่ ${M.yb})`;
      } else {
        cells[i][c].classList.add('on');
        if (c === 'year') s = i === 0 ? 'ปีที่ 0 คือปีปัจจุบัน เป็นปีที่จ่ายเงินลงทุน' : `ปีที่ ${i} คือสิ้นปีที่ ${i} นับจากวันนี้`;
        else if (c === 'inv') s = 'เงินลงทุน 105,000 จ่ายตอนเริ่มโครงการ (ปีที่ 0) เป็นเงินออกจึงใส่เครื่องหมายลบ ตัวเลขนี้ได้จากโจทย์';
        else if (c === 'inc') s = `รายได้ปีที่ ${i} = <b>${fmt(FL[i - 1])}</b> ได้จากโจทย์โดยตรง`;
        else if (c === 'fac') { S(i, 'year'); s = i === 0 ? 'ปีที่ 0 ไม่ต้องลดค่า factor = <b>1</b>' : `PV factor ปีที่ ${i} ที่ r = ${R12}% = 1 ÷ (1.12)<sup>${i}</sup> = 1 ÷ ${Math.pow(1.12, i).toFixed(4)} = <b>${f4(fac(R12, i))}</b> หรืออ่านจากตาราง แถว ${i} คอลัมน์ ${R12}%`; }
        else if (c === 'pv') { if (i === 0) { S(0, 'inv'); S(0, 'fac'); s = 'ค่าเงินปัจจุบันปีที่ 0 = เงินลงทุน × 1 = <b>−105,000</b> (ไม่ลดค่า)'; } else { S(i, 'inc'); S(i, 'fac'); s = `ค่าเงินปัจจุบันปีที่ ${i} = รายได้ × PV factor = ${fmt(FL[i - 1])} × ${f4(fac(R12, i))} = <b>${fmt(M.cf[i], 1)}</b>`; } }
        else {
          const src = disc ? 'pv' : (i === 0 ? 'inv' : 'inc'); S(i, src); if (i) S(i - 1, 'bal');
          const add = i === 0 ? -INV : disc ? M.cf[i] : FL[i - 1];
          s = i === 0 ? `เงินคงเหลือปีที่ 0 = เงินลงทุน = <b>${fmt(-INV)}</b>` : `เงินคงเหลือปีที่ ${i} = เงินคงเหลือปีก่อน + ${disc ? 'ค่าเงินปัจจุบัน' : 'รายได้'}ปีนี้ = ${fmt(M.bal[i - 1], d)} + ${fmt(add, d)} = <b>${fmt(M.bal[i], d)}</b>`;
        }
      }
      say.innerHTML = s;
    }
    Hop.onView(host, () => explain(-1, 'res'), .5);
  }
  AnsSheet($('#fig-pb-tab'), 'simple');
  AnsSheet($('#fig-dpb-tab'), 'disc');

  mcq($('#q-pb'), {
    q: 'ในตัวอย่าง Ex1 ยอดสะสมสิ้นปีที่ 2 คือ −25,000 และเงินรับปีที่ 2 = 45,000, ปีที่ 3 = 50,000 ระยะเวลาคืนทุนคือเท่าใด',
    opts: ['2 + 25,000 ÷ 50,000 = 2.50 ปี', '2 + 25,000 ÷ 45,000 = 2.56 ปี', '3 + 25,000 ÷ 50,000 = 3.50 ปี', '105,000 ÷ 50,000 = 2.10 ปี'], a: 0,
    whyWrong: { 1: 'ตัวหารต้องเป็นเงินรับของปีที่คืนทุน คือปีที่ 3 (50,000) ไม่ใช่ปีที่ 2', 2: 'ปีก่อนคืนทุนคือ 2 (ปีที่ยังติดลบ) ไม่ใช่ 3', 3: 'การหารเงินลงทุนด้วยเงินรับปีเดียวใช้ไม่ได้ เพราะเงินรับแต่ละปีไม่เท่ากัน ต้องไล่สะสมทีละปี' },
    why: 'ปีก่อนคืนทุน = 2 ที่ยังขาด = 25,000 เงินรับปีที่ 3 = 50,000 ได้ 2 + 0.5 = 2.50 ปี',
  });

  /* ---------- PV: shrinking money ---------- */
  (() => {
    const host = $('#fig-pv');
    const V = 100000;
    let r = 12, t = 3;
    const cols = el('div', { class: 'cols' }), ticks = el('div', { class: 'tick' });
    const colEls = [];
    for (let i = 0; i <= 10; i++) {
      const now = el('div', { class: 'now' }), pc = el('div', { class: 'pc' });
      const c = el('div', { class: 'pcol', onclick: () => { t = i; st.value = i; update(); } }, el('div', { class: 'full' }), now, pc);
      colEls.push({ c, now, pc }); cols.append(c); ticks.append(el('span', { text: i }));
    }
    const mk = (label, unit, min, max, val, on) => {
      const b = el('b'), s = el('input', { type: 'range', class: 'slider', min, max, step: 1, value: val, 'aria-label': label });
      s.addEventListener('input', () => { on(+s.value); update(); });
      return { s, b, w: el('div', { class: 'sl' }, el('label', {}, el('span', { html: label }), el('span', {}, b, unit)), s) };
    };
    const sr = mk(Hop.t('r', 'อัตราคิดลด r'), ' %', 1, 20, r, v => r = v);
    const st = mk(Hop.t('t', 'ได้เงินปีที่ t'), ' ปี', 0, 10, t, v => t = v).s;
    const stw = st.parentNode;
    const sliders = el('div', { class: 'sliders' }, sr.w, stw);
    const stB = $('b', stw);
    const calc = el('div', { class: 'calc' });
    // factor table: a 5-column window of the real table, centred on r
    const tw = el('div', { class: 'tw' });
    const tbl = el('table', { class: 'ftab' });
    tw.append(tbl);
    let lastR = 0;
    function buildTable() {
      const s0 = clamp(r - 2, 1, 16), rs = [0, 1, 2, 3, 4].map(i => s0 + i);
      tbl.innerHTML = `<thead><tr><th class="tt">ปีที่ t</th>${rs.map(x => `<th data-r="${x}">${x}%</th>`).join('')}</tr></thead><tbody>` +
        Array.from({ length: 11 }, (_, i) => `<tr data-t="${i}"><td class="tt">${i}</td>${rs.map(x => `<td data-r="${x}">${i === 0 ? '1.0000' : f4(fac(x, i)).replace(/^0/, '')}</td>`).join('')}</tr>`).join('') + '</tbody>';
      lastR = r;
    }
    host.append(el('div', { class: 'say', style: 'min-height:0', html: `เงิน <b class="g">100,000</b> บาท ที่จะได้ในปีที่ t (แท่งเต็ม = 100,000 แท่งสีส้ม = ค่าวันนี้ ตัวเลขบนแท่งคือเปอร์เซ็นต์ของ 100,000)` }), cols, ticks, sliders, calc, tw);
    function update() {
      const f = fac(r, t), g = Math.pow(1 + r / 100, t);
      sr.s.style.setProperty('--p', ((r - 1) / 19 * 100) + '%'); st.style.setProperty('--p', (t / 10 * 100) + '%');
      sr.b.textContent = r; stB.textContent = t;
      colEls.forEach((o, i) => { const ff = fac(r, i); o.now.style.height = (ff * 100) + '%'; o.pc.textContent = Math.round(ff * 100); o.c.classList.toggle('sel', i === t); });
      $$('span', ticks).forEach((s, i) => s.classList.toggle('on', i === t));
      calc.innerHTML = `<div>factor = 1 ÷ (1 + ${r / 100})<sup>${t}</sup> = 1 ÷ ${g.toFixed(4)} = <b>${f4(f)}</b></div><div>PV = ${fmt(V)} × ${f4(f)} = <b class="big">${fmt(Math.round(V * f))}</b> บาท</div>`;
      if (lastR !== r) buildTable();
      $$('[data-r]', tbl).forEach(c => c.classList.toggle('hc', +c.dataset.r === r));
      $$('tbody tr', tbl).forEach(tr => { const on = +tr.dataset.t === t; tr.classList.toggle('hr', on); $$('td[data-r]', tr).forEach(td => td.classList.toggle('hit', on && +td.dataset.r === r)); });
    }
    update();
  })();
  Hop.eq($('#eq-pv'), [['pv', 'PV'], ' = ', ['vt', 'Vₜ'], ' ÷ (1 + ', ['r', 'r'], ')^', ['t', 't']], { sym: { pv: 'PV', vt: 'Vₜ', r: 'r', t: 't' } });
  Hop.eq($('#eq-pv'), [['pv', 'PV'], ' = ', ['vt', 'Vₜ'], ' × ', ['factor', 'PV factor']], { legend: false });
  mcq($('#q-pv'), {
    q: 'เงิน 100,000 บาทจะได้ในปีที่ 3 ที่ r = 12% (PV factor จากตาราง = 0.7118) มูลค่าปัจจุบันคือเท่าใด',
    opts: ['71,180 บาท', '140,490 บาท', '28,820 บาท', '12,000 บาท'], a: 0,
    whyWrong: { 1: 'นั่นคือการคูณทบขึ้น (100,000 × 1.12³) เงินอนาคตต้องลดค่าลง ไม่ใช่เพิ่ม', 2: 'ค่านี้คือส่วนที่หายไป (100,000 − 71,180) ไม่ใช่ PV', 3: 'ดอกเบี้ยปีเดียว (12%) ไม่ใช่ PV ของปีที่ 3' },
    why: 'PV = Vₜ × factor = 100,000 × 0.7118 = 71,180 เงินในอนาคตมีค่าน้อยกว่าเงินก้อนเดียวกันวันนี้เสมอ',
  });

  /* ---------- discounted payback mcqs ---------- */
  mcq($('#q-dpb'), {
    q: 'Project L ในสไลด์ ลงทุน 100 ปีที่ 1 ได้ 10 ที่ r = 10% PV ของปีที่ 1 คือเท่าใด (สไลด์พิมพ์ 9.901)',
    opts: ['9.091 (10 ÷ 1.10)', '9.901 ตามสไลด์', '11.000', '9.000'], a: 0,
    whyWrong: { 1: '9.901 คือ 10 ÷ 1.01 ซึ่งเป็น factor ของ 1% สไลด์ใช้ตัวเลขผิดที่ปีที่ 1 ตัวที่ถูกคือ 9.091 (ผลคืนทุนจึงเป็นประมาณ 2.69 ปี ไม่ใช่ 2.674)', 2: '11 คือการคูณขึ้น (10 × 1.1) ไม่ใช่ลดค่า', 3: 'ปัดเป็น 9 ไม่ได้ ต้องหาร 1.10 ให้ตรง' },
    why: 'PV = 10 × 0.9091 = 9.091 ส่วน 9.901 เป็น factor ของ 1% (1 ÷ 1.01 = 0.9901) ที่พิมพ์ผิดในสไลด์',
  });

  /* ---------- NPV figure ---------- */
  (() => {
    const host = $('#fig-npv');
    const PJ = [
      { n: 'โครงการ A', inv: 1000000, inc: 300000, r: 10, d: 'ลงทุน 1,000,000 ได้ 300,000 ต่อปี ปีที่ 0 ถึง 4 (สไลด์/sheet 3)' },
      { n: 'โครงการ B', inv: 12900, inc: 3000, r: 12, d: 'ลงทุน 12,900 ได้ 3,000 ต่อปี ปีที่ 0 ถึง 4 (sheet 2)' },
    ];
    let p = 0, r = PJ[0].r;
    const seg = el('div', { class: 'seg', role: 'group' }, PJ.map((x, i) => el('button', { 'aria-pressed': String(i === 0), text: x.n, onclick: () => { p = i; r = PJ[i].r; sl.value = r; $$('button', seg).forEach((b, j) => b.setAttribute('aria-pressed', String(j === i))); upd(); } })));
    const desc = el('p', { class: 'say', style: 'min-height:0;margin:12px 0 0' });
    const mkTrk = (label, cls) => { const v = el('span'), trk = el('div', { class: 'trk' }); return { v, trk, box: el('div', {}, el('div', { class: 'lb' }, el('span', { style: 'font:700 16px var(--font)', html: label }), v), trk) }; };
    const tb = mkTrk(Hop.t('pv', 'PV') + ' ของเงินรับ'), tc = mkTrk(Hop.t('pv', 'PV') + ' ของเงินจ่าย');
    const segsB = Array.from({ length: 5 }, () => el('div', { class: 'sgm' })), segC = el('div', { class: 'sgm c' });
    tb.trk.append(...segsB); tc.trk.append(segC);
    const verdict = el('div', { class: 'verdict' });
    const sl = el('input', { type: 'range', class: 'slider', min: 0, max: 30, step: 1, value: r, 'aria-label': 'อัตราคิดลด r' });
    const rb = el('b');
    sl.addEventListener('input', () => { r = +sl.value; upd(); });
    const reset = el('button', { class: 'btn small ghost', text: 'คืนค่า r ของโจทย์', onclick: () => { r = PJ[p].r; sl.value = r; upd(); } });
    const tw = el('div', { class: 'tw' }), table = el('table', { class: 'rtable' });
    tw.append(table);
    host.append(seg, desc, el('div', { class: 'tug' }, tb.box, tc.box), verdict, el('div', { class: 'sl' }, el('label', {}, el('span', { html: Hop.t('r', 'อัตราคิดลด r') }), el('span', {}, rb, ' %')), sl), el('div', { style: 'margin-top:4px' }, reset), tw);
    function upd() {
      const x = PJ[p];
      sl.style.setProperty('--p', (r / 30 * 100) + '%'); rb.textContent = r;
      desc.textContent = x.d;
      const pvs = [0, 1, 2, 3, 4].map(t => x.inc * fac(r, t)), tot = pvs.reduce((a, b) => a + b, 0), npv = tot - x.inv;
      const scale = Math.max(x.inc * 5, x.inv) * 1.03;
      segsB.forEach((s, t) => { s.style.width = (pvs[t] / scale * 100) + '%'; s.textContent = pvs[t] / scale > .12 ? 't=' + t : ''; });
      segC.style.width = (x.inv / scale * 100) + '%'; segC.textContent = 't=0';
      tb.v.textContent = fmt(tot); tc.v.textContent = fmt(x.inv);
      verdict.className = 'verdict ' + (npv > 0.5 ? 'pos' : npv < -0.5 ? 'neg' : 'zero');
      verdict.innerHTML = `<div class="eqs">${Hop.t('npv', 'NPV')} = ${fmt(tot)} − ${fmt(x.inv)} = <b>${fmt(npv)}</b></div><div class="vd">${npv > 0.5 ? 'NPV > 0 ลงทุน' : npv < -0.5 ? 'NPV < 0 ไม่ลงทุน' : 'NPV = 0 เท่าทุน'}</div>`;
      table.innerHTML = `<thead><tr><th>ปีที่ t</th><th>เงินรับ</th><th>PV factor (r = ${r}%)</th><th>ค่าเงินปัจจุบัน</th></tr></thead><tbody>` +
        pvs.map((v, t) => `<tr><td>${t}</td><td>${fmt(x.inc)}</td><td>${f4(fac(r, t))}</td><td>${fmt(v, 1)}</td></tr>`).join('') +
        `<tr><td>รวม PV เงินรับ</td><td></td><td></td><td><b>${fmt(tot, 1)}</b></td></tr></tbody>`;
    }
    upd();
  })();
  Hop.eq($('#eq-npv'), [['npv', 'NPV'], ' = ', ['sigma', 'Σ'], ' (', ['bt', 'Bₜ'], ' − ', ['ct', 'Cₜ'], ') ÷ (1 + ', ['r', 'r'], ')^', ['t', 't']], { sym: { npv: 'NPV', sigma: 'Σ', bt: 'Bₜ', ct: 'Cₜ', r: 'r', t: 't' } });
  Hop.eq($('#eq-npv'), [['npv', 'NPV'], ' = PV เงินรับ − PV เงินจ่าย'], { legend: false });

  /* ---------- exclusive vs independent ---------- */
  (() => {
    const host = $('#fig-choose');
    const P = [{ n: 'โครงการ S', v: 90000 }, { n: 'โครงการ L', v: 250960 }, { n: 'โครงการ M', v: -45000 }];
    let ex = true;
    const seg = el('div', { class: 'seg', role: 'group' }, [['ทดแทนกัน (เลือกได้อย่างเดียว)', true], ['อิสระต่อกัน (ทำได้ทุกโครงการ)', false]].map(([l, m]) => el('button', { 'aria-pressed': String(m === ex), text: l, onclick: () => { ex = m; $$('button', seg).forEach((b, j) => b.setAttribute('aria-pressed', String((j === 0) === ex))); upd(); } })));
    const cards = P.map(() => el('div', { class: 'p' }));
    const sl = el('input', { type: 'range', class: 'slider', min: -100000, max: 400000, step: 10000, value: P[2].v, 'aria-label': 'NPV ของโครงการ M' });
    const mb = el('b');
    sl.addEventListener('input', () => { P[2].v = +sl.value; upd(); });
    host.append(el('div', { class: 'ctrls', style: 'margin:0' }, seg), el('div', { class: 'pj' }, cards),
      el('div', { class: 'sl', style: 'margin-top:12px' }, el('label', { style: 'display:flex;justify-content:space-between;font-weight:600;font-size:15px' }, el('span', { text: 'ลาก NPV ของโครงการ M' }), mb), sl));
    function upd() {
      sl.style.setProperty('--p', ((P[2].v + 100000) / 500000 * 100) + '%'); mb.textContent = fmt(P[2].v);
      const best = P.reduce((a, b) => b.v > a.v ? b : a);
      P.forEach((x, i) => {
        const pick = ex ? (x === best && x.v > 0) : x.v > 0;
        const c = cards[i]; c.className = 'p ' + (pick ? 'pick ' : 'skip ') + (x.v < 0 ? 'neg' : 'pos');
        c.innerHTML = `<div class="n">${x.n}</div><div class="v">NPV ${fmt(x.v)}</div><div class="d">${pick ? (ex ? 'เลือก NPV สูงสุด' : 'NPV > 0 ลงทุนได้') : x.v <= 0 ? 'NPV ไม่เป็นบวก ไม่ลงทุน' : 'มีโครงการ NPV สูงกว่า เลือกได้อย่างเดียว'}</div>`;
      });
    }
    upd();
  })();
  mcq($('#q-npv'), {
    q: 'โครงการ B (sheet 2) ได้ PV ของเงินรับ 12,112.2 บาท เงินลงทุน 12,900 บาท ควรทำอย่างไร',
    opts: ['ไม่ควรลงทุน เพราะ NPV = −787.8', 'ลงทุน เพราะ PV เงินรับ มากกว่า 12,000', 'ลงทุน เพราะ payback ไม่ถึง 5 ปี', 'ตัดสินไม่ได้ ต้องรู้ NPV ของโครงการอื่น'], a: 0,
    whyWrong: { 1: 'ต้องเทียบกับเงินลงทุน 12,900 ไม่ใช่ตัวเลขกลมๆ', 2: 'ยอดสะสมสิ้นปีที่ 4 ยังขาด 787.8 จึงยังไม่คืนทุนด้วยซ้ำ', 3: 'ตัดสินโครงการเดี่ยวได้ด้วยเครื่องหมายของ NPV ไม่ต้องเทียบกับใคร' },
    why: 'NPV = 12,112.2 − 12,900 = −787.8 < 0 ไม่คุ้ม อาจารย์สรุปไว้ว่าไม่ควรลงทุนในระบบนี้',
  });
})();
