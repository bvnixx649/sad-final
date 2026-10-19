// Chapter 4 figures: Output, UI and Input
(() => {
  const { $, $$, el, esc, clamp, lerp, ease, easeIO, icon } = Hop;
  const { UI, CTL, UR, UIG, FIX } = window.IO_DATA;
  Hop.page(4);

  const col = k => (Hop.C[k] && Hop.C[k].c) || 'ink';
  const style = k => `--tc:var(--c-${col(k)});--tcs:var(--c-${col(k)}-s)`;
  const chip = (k, label) => el('button', { class: 'chip', 'data-k': k, style: style(k), html: `<i></i>${label || esc(Hop.C[k].t)}` });
  const fmt = n => Number(n).toLocaleString('en-US');
  // fade a node out, change it, fade back in
  function swap(node, fn, ms = 150) { node.classList.add('fx-out'); setTimeout(() => { fn(); node.classList.remove('fx-out'); }, ms); }
  function segment(host, items, onPick, cls = '') {
    const seg = el('div', { class: 'seg io-seg ' + cls }, items.map((it, i) => el('button', { 'aria-pressed': String(i === 0), html: it.dot ? `<i class="dot" style="background:var(--c-${it.dot})"></i>${it.label}` : it.label, onclick: () => { $$('button', seg).forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); onPick(i); } })));
    host.append(seg); return seg;
  }

  /* =========================== map =========================== */
  (() => {
    const host = $('#map');
    const col3 = (k, head, items) => el('div', { class: 'hub-col', style: style(k) },
      el('button', { class: 'hub-h', 'data-k': k, html: `<span>${head}</span>${icon('chev')}` }),
      el('div', { class: 'hub-items' }, items.map(([key, label]) => chip(key, label))));
    host.append(
      el('div', { class: 'hub' },
        col3('output', 'Output', [['outq', 'คำถาม 5 ข้อ'], ['onet', 'Internet-based'], ['odig', 'Digital media'], ['ospec', 'POS, ATM, plotter'], ['rdetail', 'Detail'], ['rexcept', 'Exception'], ['rsummary', 'Summary'], ['mockup', 'Mock-up'], ['raf', 'Analysis form'], ['ocontrol', 'Output control']]),
        col3('uidesign', 'User Interface', [['hci', 'HCI'], ['gui', 'GUI'], ['ucd', 'User-centered'], ['urights', 'สิทธิผู้ใช้ 10 ข้อ'], ['uig', 'หลัก 8 ข้อ'], ['controls', 'UI control 12 ชนิด'], ['processctl', 'Process control']]),
        col3('input', 'Input', [['gigo', 'GIGO'], ['capture', 'Data capture'], ['entry', 'Data entry'], ['batch', 'Batch'], ['online', 'Online'], ['vol', 'ลดปริมาณ input'], ['dataentry', 'หน้าจอรับข้อมูล'], ['srcdoc', 'Source document'], ['validation', 'Validation 8 แบบ'], ['icontrol', 'Input control']])),
      el('div', { class: 'hub-calc' },
        el('div', { class: 'hub-calc-h', text: 'โจทย์คำนวณรายงาน' }),
        el('div', { class: 'hub-flow' }, [['cl_total', 'บรรทัดทั้งหมด'], '÷', ['cl_usable', 'บรรทัดที่ใช้ได้/หน้า'], '=', ['cl_pages', 'หน้า'], '÷', ['cl_ppm', 'PPM'], '=', ['cl_time', 'เวลา']].map(x => typeof x === 'string' ? el('span', { class: 'op', text: x }) : chip(x[0], x[1])))));
    Hop.onView(host, () => { $$('.chip, .hub-h', host).forEach((c, i) => { c.style.transitionDelay = (i * 22) + 'ms'; c.classList.add('in'); }); }, .15);
    $$('.chip, .hub-h', host).forEach(c => c.classList.add('pop'));
  })();

  /* =========================== 1. ask =========================== */
  (() => {
    const host = $('#fig-ask');
    const Q = ['จุดประสงค์', 'ใครใช้ / ใช้อย่างไร', 'ข้อมูลอะไร', 'ช่องทางไหน', 'เป็นความลับไหม'];
    const S = [
      { n: 'ใบเสร็จ POS', a: ['ให้ลูกค้าเก็บเป็นหลักฐานการซื้อ และใช้ขอเปลี่ยนหรือคืนสินค้า', 'ลูกค้ารับตอนจ่ายเงิน พนักงานใช้ตรวจย้อนหลังเมื่อมีปัญหา', 'รายการสินค้า ราคา ภาษี ยอดรวม วันเวลา เลขที่ใบเสร็จ', 'เครื่องพิมพ์ใบเสร็จของจุดขาย (POS) ซึ่งเป็น output เฉพาะทาง', 'ไม่ลับ แต่ไม่ควรพิมพ์เลขบัตรเครดิตเต็ม'], type: ['ospec', 'Specialised output'] },
      { n: 'รายงานผู้บริหาร', a: ['ให้ผู้บริหารเห็นภาพรวมยอดขายเพื่อตัดสินใจเรื่องงบประมาณ', 'ผู้บริหารระดับสูง อ่านเดือนละครั้ง ต้องเข้าใจใน 1 นาที', 'ยอดรวมต่อสาขาและเปรียบเทียบกับเดือนก่อน ไม่ต้องทุกใบเสร็จ', 'หน้าจอแดชบอร์ดหรือกระดาษ A4 หนึ่งแผ่น', 'ลับ เฉพาะผู้บริหารและผู้ที่ได้รับสิทธิ์'], type: ['rsummary', 'Summary report'] },
      { n: 'อีเมลยืนยัน', a: ['ยืนยันกับลูกค้าว่าระบบรับคำสั่งซื้อแล้ว และเป็นหลักฐานคำสั่งซื้อ', 'ลูกค้าอ่านทันทีหลังสั่ง และกลับมาเปิดดูเมื่อสินค้ายังไม่มา', 'เลขที่คำสั่งซื้อ รายการ ที่อยู่จัดส่ง ยอดที่ต้องจ่าย', 'อีเมลผ่านอินเทอร์เน็ต เปิดอ่านได้ทั้งบนมือถือและคอมพิวเตอร์', 'มีที่อยู่และชื่อลูกค้า ต้องส่งถึงเจ้าของเท่านั้น'], type: ['onet', 'Internet-based delivery'] },
    ];
    let cur = 0;
    const rows = el('div', { class: 'ask' }, Q.map((q, i) => el('div', { class: 'ask-r' }, el('div', { class: 'ask-q' }, el('b', { text: i + 1 }), q), el('div', { class: 'ask-a fx' }))));
    const typeRow = el('div', { class: 'ask-type fx' });
    segment(host, S.map(s => ({ label: s.n })), i => { cur = i; draw(true); });
    host.append(rows, typeRow);
    function draw(anim) {
      const fill = () => {
        $$('.ask-a', rows).forEach((a, i) => a.textContent = S[cur].a[i]);
        typeRow.replaceChildren(el('span', { class: 'muted', text: 'ช่องทางนี้จัดอยู่ในกลุ่ม ' }), chip(S[cur].type[0], S[cur].type[1]));
      };
      if (anim) { $$('.ask-a, .ask-type', host).forEach((n, i) => { setTimeout(() => n.classList.add('fx-out'), i * 25); }); setTimeout(() => { fill(); $$('.ask-a, .ask-type', host).forEach(n => n.classList.remove('fx-out')); }, 200); } else fill();
    }
    draw(false);
  })();

  /* =========================== 1b. types =========================== */
  (() => {
    const host = $('#fig-types');
    const grp = (k, items) => el('div', { class: 'tg', style: style(k) },
      el('button', { class: 'tg-h', 'data-k': k, html: `<span>${esc(Hop.C[k].t)}</span>${icon('chev')}` }),
      el('div', { class: 'tg-i' }, items.map(it => Array.isArray(it) ? chip(it[0], it[1]) : el('span', { class: 'plain', text: it }))));
    host.append(
      el('div', { class: 'tgs' },
        grp('onet', ['Webcast'].map(() => ['webcast', 'Webcast']).concat(['E-mail', 'Blogs', 'Instant messaging', 'Wireless devices'])),
        grp('odig', ['Digital audio, images, video', ['podcast', 'Podcasts'], ['faxback', 'Automated facsimile (faxback)'], ['com', 'COM (microfilm)'], 'Output to digital media']),
        grp('ospec', [['pos', 'Retail POS'], ['atm', 'ATM'], ['plotter', 'Plotter']])),
      el('div', { class: 'tg-base' }, el('b', { text: 'พื้นฐานที่สุด' }), el('span', { class: 'plain', text: 'หน้าจอ' }), el('span', { class: 'plain', text: 'เครื่องพิมพ์' })));
  })();
  Hop.mcq($('#q-out'), {
    q: 'ตู้ ATM แสดงยอดคงเหลือและพิมพ์สลิป ถือเป็น output ประเภทไหน',
    opts: ['Internet-based information delivery', 'Digital audio, images, and video', 'Specialised forms of output', 'Report แบบ summary'], a: 2,
    whyWrong: { 0: 'ATM ใช้เครือข่ายธนาคาร แต่ output ออกที่ตัวตู้ ไม่ได้ส่งเป็นอีเมลหรือ webcast', 1: 'กลุ่มนี้คือเสียง ภาพ วิดีโอ podcast faxback และ COM ที่เป็นสื่อ ไม่ใช่อุปกรณ์เฉพาะงาน', 3: 'summary report เป็นชนิดของรายงาน แบ่งตามคนอ่าน ไม่ใช่ประเภทช่องทาง' },
    why: 'สไลด์ระบุ ATM ไว้ในกลุ่ม Specialised forms of output พร้อม retail point-of-sale และ plotter เพราะ output ถูกกำหนดโดยอุปกรณ์เฉพาะงาน',
  });
  Hop.mcq($('#q-out'), {
    q: 'Podcast จัดอยู่ในกลุ่มไหนของสไลด์',
    opts: ['Internet-based information delivery', 'Digital audio, images, and video', 'Specialised forms of output'], a: 1,
    whyWrong: { 0: 'แม้ podcast ดาวน์โหลดผ่านอินเทอร์เน็ต สไลด์จัดไว้ใต้ Digital audio, images, and video ส่วน Internet-based มีแค่ webcast, e-mail, blogs, instant messaging, wireless devices' },
    why: 'ข้อสอบถามตามสไลด์: Podcasts อยู่ในหัวข้อ Digital audio, images, and video คู่กับ faxback, COM และ output ลงสื่อดิจิทัล',
  });

  /* =========================== 2. report types =========================== */
  (() => {
    const host = $('#fig-rtype');
    const rows = [
      { c: 'เครื่องดื่ม', n: 'กาแฟ', s: 12, r: 20 }, { c: 'เครื่องดื่ม', n: 'ชาเขียว', s: 40, r: 25 }, { c: 'เครื่องดื่ม', n: 'น้ำส้ม', s: 8, r: 15 },
      { c: 'ขนม', n: 'คุกกี้', s: 3, r: 10 }, { c: 'ขนม', n: 'เวเฟอร์', s: 25, r: 20 }, { c: 'ขนม', n: 'มันฝรั่งทอด', s: 6, r: 12 },
      { c: 'ของใช้', n: 'สบู่', s: 30, r: 10 }, { c: 'ของใช้', n: 'ยาสีฟัน', s: 18, r: 15 },
    ];
    const V = [
      { k: 'rdetail', label: 'Detail', dot: 'blue', title: 'รายงานสินค้าคงเหลือ (ทุกรายการ)', who: '<b style="color:var(--c-blue)">Detail:</b> พนักงานคลังใช้ตรวจนับ ต้องเห็นสินค้าครบทุกชิ้น ถ้ามีหมื่นรายการก็ยาวหมื่นบรรทัด' },
      { k: 'rexcept', label: 'Exception', dot: 'rose', title: 'รายงานสินค้าต่ำกว่าจุดสั่งซื้อ', who: '<b style="color:var(--c-rose)">Exception:</b> ผู้จัดการคลังใช้สั่งซื้อของเพิ่ม เห็นเฉพาะรายการที่คงเหลือน้อยกว่าจุดสั่งซื้อ รายการปกติไม่โผล่' },
      { k: 'rsummary', label: 'Summary', dot: 'teal', title: 'รายงานสรุปสินค้าคงเหลือตามหมวด', who: '<b style="color:var(--c-teal)">Summary:</b> ผู้บริหารดูภาพรวมของคลัง ไม่ต้องรู้ว่ากาแฟเหลือกี่ถุง' },
    ];
    let v = 0;
    const low = r => r.s < r.r;
    const paper = el('div', { class: 'paper' });
    const head = el('div', { class: 'paper-h' }, el('b', { class: 'fx' }), el('span', { class: 'mono muted', text: 'พิมพ์ 30/09/2569' }));
    const cols = el('div', { class: 'rr rr-head' }, ['หมวด', 'สินค้า', 'คงเหลือ', 'จุดสั่ง'].map(t => el('span', { text: t })));
    const body = el('div', { class: 'rr-body' });
    const rowEls = rows.map((r, i) => {
      const num = el('b', { class: 'mono n' });
      const dn = el('button', { class: 'stp', 'aria-label': 'ลด', text: '−', onclick: () => { r.s = Math.max(0, r.s - 3); upd(); } });
      const up = el('button', { class: 'stp', 'aria-label': 'เพิ่ม', text: '+', onclick: () => { r.s += 3; upd(); } });
      const node = el('div', { class: 'rrow' }, el('div', { class: 'rin' }, el('div', { class: 'rr' }, el('span', { class: 'muted', text: r.c }), el('span', { text: r.n }), el('span', { class: 'stock' }, dn, num, up), el('span', { class: 'mono muted', text: r.r }))));
      body.append(node); return { node, num };
    });
    const sum = el('div', { class: 'sumtab' });
    const sumHead = el('div', { class: 'rr rr-head sum' }, ['หมวด', 'รายการ', 'รวมคงเหลือ', 'ต่ำกว่าจุดสั่ง'].map(t => el('span', { text: t })));
    paper.append(head, cols, body, sumHead, sum);
    const say = el('p', { class: 'say fx' });
    segment(host, V, i => { v = i; swap(paper, upd, 140); say.classList.add('fx-out'); setTimeout(() => say.classList.remove('fx-out'), 160); });
    host.append(paper, say);
    function upd() {
      const view = V[v];
      paper.style.setProperty('--tc', `var(--c-${view.dot})`);
      $('b', head).textContent = view.title;
      const showSum = v === 2;
      cols.classList.toggle('gone', showSum); body.classList.toggle('gone', showSum);
      sumHead.classList.toggle('gone', !showSum); sum.classList.toggle('gone', !showSum);
      rows.forEach((r, i) => {
        rowEls[i].num.textContent = r.s; rowEls[i].num.classList.toggle('lowv', low(r));
        rowEls[i].node.classList.toggle('gone', v === 1 && !low(r));
      });
      const cats = [...new Set(rows.map(r => r.c))];
      sum.replaceChildren(...cats.map(c => { const g = rows.filter(r => r.c === c); return el('div', { class: 'rr sum' }, el('span', { text: c }), el('span', { class: 'mono', text: g.length }), el('span', { class: 'mono', text: g.reduce((a, r) => a + r.s, 0) }), el('span', { class: 'mono', text: g.filter(low).length })); }),
        el('div', { class: 'rr sum tot' }, el('span', { text: 'รวม' }), el('span', { class: 'mono', text: rows.length }), el('span', { class: 'mono', text: rows.reduce((a, r) => a + r.s, 0) }), el('span', { class: 'mono', text: rows.filter(low).length })));
      const nLow = rows.filter(low).length;
      say.innerHTML = view.who + (v === 1 ? ` ตอนนี้มี ${nLow} รายการจาก ${rows.length}` : '');
    }
    upd();
  })();
  Hop.mcq($('#q-rtype'), {
    q: 'ฝ่ายบัญชีต้องการรายการลูกค้าที่ค้างชำระเกิน 90 วันเท่านั้น เพื่อตามทวงเงิน ควรใช้รายงานแบบไหน',
    opts: ['Detail report', 'Exception report', 'Summary report', 'Mock-up'], a: 1,
    whyWrong: { 0: 'detail แสดงลูกค้าทุกคน ฝ่ายบัญชีต้องไล่หาเอง ทั้งที่ต้องการเฉพาะที่ค้างเกิน 90 วัน', 2: 'summary ให้ยอดรวม เช่น ค้างทั้งหมดกี่บาท แต่ไม่บอกว่าต้องตามใคร', 3: 'mock-up เป็นตัวอย่างหน้าตารายงาน ไม่ใช่ชนิดของรายงาน' },
    why: 'มีเงื่อนไขกำหนดไว้ (ค้างเกิน 90 วัน) และแสดงเฉพาะรายการที่ตรงเงื่อนไข นี่คือ exception report',
  });
  Hop.mcq($('#q-rtype'), {
    q: 'ผู้อำนวยการต้องการดูยอดขายรวมของแต่ละสาขาในเดือนที่ผ่านมา โดยไม่ต้องเห็นใบเสร็จทีละใบ ควรใช้รายงานแบบไหน',
    opts: ['Detail report', 'Exception report', 'Summary report'], a: 2,
    whyWrong: { 0: 'ใบเสร็จทีละใบคือ detail ซึ่งโจทย์บอกชัดว่าไม่ต้องการ', 1: 'โจทย์ไม่ได้บอกเงื่อนไขผิดปกติ ต้องการยอดรวมของทุกสาขา' },
    why: 'ยอดรวมต่อสาขาคือการสรุปข้อมูล และผู้อ่านเป็นผู้บริหารระดับสูง ตรงกับ summary report',
  });

  /* =========================== 3. mock-up / analysis form =========================== */
  (() => {
    const host = $('#fig-mock');
    const data = [
      { id: 'P012', n: 'กาแฟคั่วกลาง', q: 24, a: 3600 }, { id: 'P007', n: 'ชาเขียว', q: 40, a: 2800 }, { id: 'P031', n: 'น้ำส้ม', q: 18, a: 990 }, { id: 'P019', n: 'คุกกี้เนย', q: 30, a: 2250 }, { id: 'P003', n: 'เวเฟอร์', q: 55, a: 1650 },
    ];
    let mode = 0, sortBy = 'id';
    segment(host, [{ label: 'Mock-up' }, { label: 'Report analysis form' }], i => { mode = i; paper.classList.toggle('spec-on', i === 1); say.innerHTML = i === 0 ? 'ผู้ใช้ดูตัวอย่างแล้วบอกว่าต้องเพิ่มหรือแก้อะไร ก่อนที่ใครจะเขียนโปรแกรม' : 'ป้ายใต้แต่ละส่วนบอกชนิดข้อมูล ขนาด และแหล่งที่มา ผู้เขียนโปรแกรมทำตามนี้'; });
    const sorts = el('div', { class: 'chips' }, el('span', { class: 'muted', text: 'เรียงตาม' }),
      [['id', 'รหัส'], ['n', 'ชื่อ'], ['a', 'ยอดขาย']].map(([k, l]) => el('button', { class: 'cc', 'aria-pressed': String(k === 'id'), text: l, onclick: e => { sortBy = k; $$('.cc', sorts).forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); swap(tb, draw, 120); } })));
    host.append(sorts);
    const paper = el('div', { class: 'paper rp' });
    const mk = n => `<span class="mk">${n}</span>`;
    const tb = el('div', { class: 'rp-tb fx' });
    paper.append(
      el('div', { class: 'rp-top' }, el('b', { html: 'รายงานยอดขายประจำวัน' + mk(1) }), el('span', { class: 'mono', html: '30/09/2569 14:30' + mk(2) })),
      el('div', { class: 'rp-cols' }, [['รหัส', 3], ['สินค้า', 4], ['จำนวน', 5], ['ยอดขาย', 6]].map(([t, n]) => el('b', { html: t + mk(n) }))),
      tb,
      el('div', { class: 'rp-foot' }, el('span', { class: 'mono', html: 'หน้า 1 จาก 1' + mk(7) }), el('b', { class: 'mono', html: '<span class="tot"></span>' + mk(8) })),
      el('div', { class: 'specs' }, el('div', {}, el('ul', { html: [
        'ชื่อรายงาน: ตัวหนา ชิดซ้ายหัวกระดาษ ทุกรายงานในระบบวางตำแหน่งเดียวกัน',
        'วันเวลาที่พิมพ์: ระบบใส่ให้เอง ชิดขวา',
        'รหัส: ข้อความ 4 ตัวอักษร มาจาก PRODUCT.id',
        'สินค้า: ข้อความไม่เกิน 20 ตัวอักษร มาจาก PRODUCT.name',
        'จำนวน: ตัวเลขเต็ม 4 หลัก มาจาก SALE.qty',
        'ยอดขาย: ตัวเลขมีคอมมา 9,999 มาจาก SALE.amount',
        'เลขหน้า: &ldquo;หน้า n จาก N&rdquo; ทุกหน้า เพื่อรู้ว่าไม่ขาดหน้า',
        'ผลรวม: SUM(ยอดขาย) ใช้ตรวจความถูกต้องของรายงาน'].map((t, i) => `<li><b class="mono">${i + 1}</b><span>${t}</span></li>`).join('') }))));
    const say = el('p', { class: 'say', html: 'ผู้ใช้ดูตัวอย่างแล้วบอกว่าต้องเพิ่มหรือแก้อะไร ก่อนที่ใครจะเขียนโปรแกรม' });
    host.append(paper, say);
    function draw() {
      const d = [...data].sort((x, y) => sortBy === 'a' ? y.a - x.a : String(x[sortBy]).localeCompare(String(y[sortBy]), 'th'));
      tb.replaceChildren(...d.map(r => el('div', { class: 'rp-r' }, el('span', { class: 'mono', text: r.id }), el('span', { text: r.n }), el('span', { class: 'mono', text: r.q }), el('span', { class: 'mono', text: fmt(r.a) }))));
      $('.tot', paper).textContent = 'รวม ' + fmt(data.reduce((a, r) => a + r.a, 0));
    }
    draw();
  })();
  Hop.mcq($('#q-rdesign'), {
    q: 'เอกสารที่แสดงรายงานตัวอย่าง พร้อมบอกว่าแต่ละฟิลด์เป็นข้อมูลชนิดอะไร ขนาดเท่าไร และมาจากตารางไหน เรียกว่าอะไร',
    opts: ['Mock-up', 'Report analysis form', 'Detail report', 'Switchboard'], a: 1,
    whyWrong: { 0: 'mock-up แสดงหน้าตาเหมือนของจริง แต่ไม่ได้ระบุรายละเอียดของแต่ละส่วน', 2: 'detail report เป็นชนิดของรายงาน ไม่ใช่เอกสารช่วยออกแบบ' },
    why: 'ความต่างอยู่ที่ป้ายอธิบาย mock-up บอกว่ารายงานหน้าตาอย่างไร ส่วน report analysis form ติดรายละเอียดของแต่ละส่วนให้ผู้เขียนโปรแกรมใช้ทำตาม',
  });
  Hop.mcq($('#q-rdesign'), {
    q: 'รายงานทุกหน้าพิมพ์ &ldquo;หน้า n จาก N&rdquo; ไว้ท้ายหน้า เพื่อให้ผู้รับรู้ว่าไม่ขาดหน้าใด เป็นเรื่องของข้อใดใน output control',
    opts: ['ถูกต้อง (accurate)', 'สมบูรณ์ (complete)', 'เป็นปัจจุบัน (current)', 'เป็นความลับ (confidential)'], a: 1,
    whyWrong: { 0: 'ถูกต้องคือตัวเลขตรงกับข้อมูลจริง เช่น ผลรวมตรวจทาน เลขหน้าไม่ได้ตรวจตัวเลข', 2: 'เป็นปัจจุบันคือใช้ข้อมูลล่าสุด เช่น พิมพ์วันเวลา', 3: 'ความลับคือจำกัดว่าใครได้รับ' },
    why: 'เลขหน้า &ldquo;n จาก N&rdquo; บอกว่ามีทั้งหมด N หน้า ถ้าได้ครบก็สมบูรณ์ ถ้าไม่ครบรู้ทันที',
  });

  /* =========================== 4a. user rights =========================== */
  (() => {
    const host = $('#fig-rights');
    let sel = -1;
    const grid = el('div', { class: 'rights' }, UR.map((u, i) => el('button', { class: 'rt', 'aria-pressed': 'false', style: style('urights'), onclick: () => pick(i), html: `<span class="no mono">${i + 1}</span><b>${u.t}</b><span>${u.th}</span>` })));
    const panel = el('div', { class: 'rpanel fx' });
    host.append(grid, panel);
    function pick(i, first) {
      sel = i; $$('.rt', grid).forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
      const fill = () => { const u = UR[i]; panel.replaceChildren(el('div', { class: 'rp-h', html: `<b>${u.t}</b> <span class="muted">${u.th}</span>` }), el('p', { html: u.short }), el('p', { class: 'viol', html: `<b>ถ้าระบบละเมิด:</b> ${u.bad}` })); };
      if (first) fill(); else swap(panel, fill, 110);
    }
    pick(0, true);
  })();

  /* =========================== 4b. UI guidelines =========================== */
  (() => {
    const host = $('#fig-uig');
    let good = false, sel = 0;
    segment(host, [{ label: 'ฉบับแย่', dot: 'rose' }, { label: 'ฉบับดี', dot: 'green' }], i => { good = i === 1; swap(screen, draw, 150); });
    const screen = el('div', { class: 'uig fx' });
    const say = el('p', { class: 'say fx' });
    host.append(screen, say);
    function draw() {
      screen.dataset.good = good ? '1' : '0';
      screen.replaceChildren(...UIG.map((g, i) => el('button', { class: 'ug' + (i === sel ? ' on' : ''), style: style('uig'), onclick: () => { sel = i; $$('.ug', screen).forEach((b, j) => b.classList.toggle('on', j === i)); say.classList.add('fx-out'); setTimeout(() => { sayDraw(); say.classList.remove('fx-out'); }, 120); },
        html: `<span class="no mono">${i + 1}</span><span class="rw">${g.row}</span><span class="ct">${good ? g.good : g.bad}</span>` })));
      sayDraw();
    }
    function sayDraw() { const g = UIG[sel]; say.innerHTML = `<b style="color:var(--c-violet)">ข้อ ${sel + 1}</b> ${g.t}. ${good ? 'ฉบับนี้ทำตามข้อนี้แล้ว' : 'ฉบับนี้ไม่ทำตามข้อนี้ ดูแถวเดียวกันตอนสลับเป็นฉบับดี'} ${Hop.t(g.k, 'เปิดความหมาย')}`; }
    draw();
  })();
  Hop.mcq($('#q-hci'), {
    q: 'ผู้ใช้กดอัปโหลดรูป 200 MB แล้วหน้าจอนิ่งไป 3 นาที ไม่รู้ว่าระบบค้างหรือกำลังทำงานอยู่ ระบบละเมิดสิทธิผู้ใช้ข้อใด',
    opts: ['Instruction', 'Feedback', 'Scope', 'Compliance'], a: 1,
    whyWrong: { 0: 'Instruction คือคู่มือ ความช่วยเหลือ และข้อความ error ที่ช่วยให้ทำสำเร็จหรือกู้จากปัญหา ในที่นี้ไม่มีข้อความอะไรเลย ปัญหาคือขาดการบอกสถานะ', 2: 'Scope คือการรู้ขีดจำกัดของระบบ เช่น รับไฟล์ได้ไม่เกินกี่ MB', 3: 'Compliance คือระบบทำงานตรงตามที่สัญญา' },
    why: 'Feedback คือระบบบอกอย่างชัดเจนว่ากำลังทำอะไรและคืบหน้าเท่าไร เช่น แถบแสดง 40% ที่หายไปในกรณีนี้',
  });
  Hop.mcq($('#q-hci'), {
    q: 'ฟอร์มสมัครสมาชิกให้พิมพ์ชื่อจังหวัดเต็มและพิมพ์วันที่ปัจจุบันทุกครั้ง ฉบับที่ดีขึ้นให้เลือกจังหวัดจากรายการและใส่วันที่ให้เอง นี่คือหลักออกแบบหน้าจอข้อใด',
    opts: ['ให้ข้อมูลตอบกลับแก่ผู้ใช้', 'ให้ผู้ใช้ใส่ข้อมูลน้อยที่สุด', 'ใช้คำศัพท์พื้นฐาน', 'ให้ผู้ใช้เลือก layout ได้'], a: 1,
    whyWrong: { 0: 'ข้อนี้คือแจ้งผลหลังทำ เช่น &ldquo;บันทึกแล้ว&rdquo;', 2: 'ข้อนี้เกี่ยวกับถ้อยคำบนจอ ไม่ใช่ปริมาณที่ต้องกรอก', 3: 'ข้อนี้คือให้ปรับรูปแบบหน้าจอเอง เช่น ขนาดตัวอักษร' },
    why: 'ทั้งการเลือกจากรายการและการใส่วันที่อัตโนมัติ ลดสิ่งที่ผู้ใช้ต้องพิมพ์ คือข้อ &ldquo;พยายามให้ผู้ใช้ใส่ข้อมูลน้อยที่สุด&rdquo;',
  });

  /* =========================== 5. UI controls: mock screen =========================== */
  (() => {
    const host = $('#fig-ctl');
    let mode = 0, sel = null;
    const mc = (k, html, cls = '') => el('div', { class: 'mc ' + cls, 'data-c': k, role: 'button', tabindex: 0, 'aria-label': Hop.C[k].t, html });
    const lab = t => el('div', { class: 'mw-lab', text: t });
    const win = el('div', { class: 'mw' },
      el('div', { class: 'mw-title', text: 'ใบสั่งซื้อ  -  ร้านน้ำชา' }),
      mc('menubar', UI.menubar()),
      el('div', { class: 'mw-tb' }, mc('toolbar', UI.toolbar()), mc('togglebtn', UI.togglebtn())),
      el('div', { class: 'mw-body' },
        el('div', { class: 'mw-l' }, mc('switchboard', UI.switchboard()), lab('สินค้า'), mc('listbox', UI.listbox())),
        el('div', { class: 'mw-m' },
          lab('ชื่อลูกค้า'), mc('textbox', UI.textbox()),
          lab('จังหวัด'), mc('dropdown', UI.dropdown()),
          lab('ชำระเงิน'), mc('radio', UI.radio()),
          lab('เพิ่มเติม'), mc('checkbox', UI.checkbox()),
          el('div', { class: 'mw-btns' }, mc('cmdbtn', UI.cmdbtn('บันทึก')), mc('cmdbtn', UI.cmdbtn('ล้างฟอร์ม').replace('u-btn', 'u-btn ghost')))),
        el('div', { class: 'mw-r' }, lab('วันที่ส่ง'), mc('calendar', UI.calendar()), mc('dialog', UI.dialog(), 'dlg'))));
    const modeBar = el('div', { class: 'ctlbar' });
    const prompt = el('div', { class: 'cprompt fx', hidden: true });
    const say = el('p', { class: 'say fx' });
    const seg = segment(modeBar, [{ label: 'สำรวจ' }, { label: 'ทดสอบ' }], i => { mode = i; sel = null; clearSel(); if (i === 1) startTest(); else { prompt.hidden = true; say.innerHTML = 'แตะชิ้นส่วนใดก็ได้บนหน้าจอ'; } });
    host.append(modeBar, prompt, win, say);
    say.innerHTML = 'แตะชิ้นส่วนใดก็ได้บนหน้าจอ';
    const clearSel = () => $$('.mc', win).forEach(n => n.classList.remove('sel', 'ok', 'no'));
    let queue = [], idx = 0, first = 0, tries = 0;
    function startTest() {
      queue = Hop.shuffle(CTL); idx = 0; first = 0; tries = 0; prompt.hidden = false; showQ();
    }
    function showQ() {
      clearSel(); tries = 0;
      if (idx >= queue.length) {
        prompt.innerHTML = `<b>จบแล้ว</b> ถูกตั้งแต่ครั้งแรก ${first} จาก ${queue.length} ข้อ <button class="btn small" id="ctl-again">เริ่มใหม่</button>`;
        $('#ctl-again').onclick = startTest; say.innerHTML = first === queue.length ? 'ครบทุกข้อ' : 'ข้อที่พลาด ลองกลับไปโหมดสำรวจแล้วอ่านหัวข้อ &ldquo;ใช้เมื่อ&rdquo; ของตัวนั้น'; return;
      }
      swap(prompt, () => { prompt.innerHTML = `<span class="mono muted">${idx + 1}/${queue.length}</span> ${queue[idx].test}`; }, 120);
      say.innerHTML = 'แตะตัวควบคุมที่เหมาะกับสถานการณ์นี้';
    }
    function tap(node) {
      const k = node.dataset.c, c = CTL.find(x => x.k === k);
      if (mode === 0) {
        clearSel(); node.classList.add('sel');
        say.classList.add('fx-out'); setTimeout(() => { say.innerHTML = `<b style="color:var(--c-violet)">${c.t}</b> <span class="muted">${c.th}</span><br>${c.short}<br><b>ใช้เมื่อ</b> ${c.when} ${Hop.t(k, 'เปิดความหมาย')}`; say.classList.remove('fx-out'); }, 110);
        return;
      }
      if (idx >= queue.length) return;
      clearSel();
      if (k === queue[idx].k) {
        node.classList.add('ok'); if (tries === 0) first++;
        say.innerHTML = `<b style="color:var(--good)">ถูก</b> ${c.t}: ${c.when}`; idx++; setTimeout(showQ, 1100);
      } else {
        tries++; node.classList.add('no');
        say.innerHTML = `<b style="color:var(--bad)">ยังไม่ใช่</b> ตัวที่แตะคือ ${c.t}: ${c.short}`;
      }
    }
    win.addEventListener('click', e => { const n = e.target.closest('.mc'); if (n) tap(n); });
    win.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('mc')) { e.preventDefault(); tap(e.target); } });
  })();

  /* =========================== 6a. batch vs online =========================== */
  (() => {
    const host = $('#fig-bo');
    const N = 4;
    const lane = (kind, title, k) => {
      const tokens = Array.from({ length: N }, (_, i) => el('div', { class: 'tk', text: i + 1 }));
      const sys = el('div', { class: 'sysbox' }, el('b', { text: 'ระบบ' }), el('span', { class: 'mono cnt', text: '0 รายการ' }));
      const node = el('div', { class: 'lane ' + kind }, el('button', { class: 'lane-h', 'data-k': k, style: style(k), text: title }),
        el('div', { class: 'lane-t' }, el('div', { class: 'org', text: 'ลูกค้า' }), kind === 'b' ? el('div', { class: 'pile', text: 'กองเอกสาร' }) : null, sys, ...tokens));
      return { node, tokens, cnt: $('.cnt', sys) };
    };
    const on = lane('o', 'Online: ป้อนทันที', 'online'), ba = lane('b', 'Batch: สะสมแล้วป้อนตอน 18:00', 'batch');
    host.append(on.node, ba.node);
    const say = el('p', { class: 'say' });
    const px = { org: 7, pile: 50, sys: 86 };
    const slot = i => [(i % 2 ? 14 : -14), (i < 2 ? -14 : 14)];
    function frame(t) {
      let c1 = 0, c2 = 0;
      for (let i = 0; i < N; i++) {
        const vis = clamp((t - i) * 3 + 1, 0, 1);
        const p = ease(clamp((t - i) / .6, 0, 1)), [dx, dy] = slot(i);
        on.tokens[i].style.opacity = vis; on.tokens[i].style.left = lerp(px.org, px.sys, p) + '%'; on.tokens[i].style.transform = `translate(${dx * p}px, ${dy * p}px)`;
        if (p > .98) c1++;
        const pB = ease(clamp((t - 4), 0, 1));
        ba.tokens[i].style.opacity = vis; ba.tokens[i].style.left = lerp(lerp(px.org, px.pile, p), px.sys, pB) + '%'; ba.tokens[i].style.transform = `translate(${dx * p}px, ${dy * p}px)`;
        if (pB > .98) c2++;
      }
      on.cnt.textContent = c1 + ' รายการ'; ba.cnt.textContent = c2 + ' รายการ';
      say.innerHTML = t < 4 ? `ถ้าตอนนี้ลูกค้าอีกคนมาเช็กสต๊อก: <b style="color:var(--c-amber)">online</b> เห็นออเดอร์ ${c1} รายการ ส่วน <b style="color:var(--c-amber)">batch</b> เห็น ${c2} รายการ เพราะยังไม่ถึงรอบป้อน` : t < 4.98 ? 'ถึงรอบป้อน batch ทั้งกองถูกป้อนเข้าระบบพร้อมกัน' : `ทั้งสองแบบมีครบ ${N} รายการ ต่างกันที่ว่า online ข้อมูลทันสมัยตลอดวัน ส่วน batch ได้ผลเมื่อถึงรอบ แต่ตรวจทั้งชุดได้ในคราวเดียว`;
    }
    Hop.scrub(host, { stops: [{ label: '09:00 ลูกค้าคนที่ 1 สั่งสินค้า' }, { label: '11:00 ลูกค้าคนที่ 2 สั่งสินค้า' }, { label: '14:00 ลูกค้าคนที่ 3 สั่งสินค้า' }, { label: '16:00 ลูกค้าคนที่ 4 สั่งสินค้า' }, { label: '17:30 ใกล้เลิกงาน ฝั่ง batch ยังเป็นกองเอกสาร' }, { label: '18:00 รอบป้อน batch' }], onFrame: frame, speed: 1400 });
    host.append(say); frame(0);
  })();

  /* =========================== 6b. fix the form =========================== */
  (() => {
    const host = $('#fig-form');
    const fixed = new Set();
    const count = el('span', { class: 'mono' });
    const form = el('div', { class: 'xf' });
    const say = el('p', { class: 'say fx', html: 'แตะช่องที่มีเส้นสีแดง' });
    const F = id => FIX.find(f => f.id === id);
    const row = (id, label, bad, good, opts = {}) => {
      const node = el('div', { class: 'xr flaw', 'data-id': id },
        el('div', { class: 'xl' }), el('div', { class: 'xv' }));
      const set = isFixed => {
        node.classList.toggle('flaw', !isFixed); node.classList.toggle('done', isFixed);
        const L = isFixed ? (opts.goodLabel || label) : label, V = isFixed ? good : bad;
        $('.xl', node).innerHTML = L || '<i class="muted">(ไม่มีชื่อช่อง)</i>'; $('.xv', node).innerHTML = V;
        node.classList.toggle('strike', isFixed && !!opts.removed);
      };
      node.addEventListener('click', () => {
        if (fixed.has(id)) return; fixed.add(id); set(true); upd(); const f = F(id);
        say.classList.add('fx-out'); setTimeout(() => { say.innerHTML = `${Hop.t(f.k, f.rule)}<br>${f.why}`; say.classList.remove('fx-out'); }, 110);
      });
      node.setAttribute('role', 'button'); node.tabIndex = 0;
      node.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); node.click(); } });
      node._set = set; set(false); return node;
    };
    const rows = [
      row('f_const', 'ชื่อร้าน', '<span class="fi">ร้านน้ำชาริมน่าน</span>', '<span class="rm">ตัดออก: ระบบใส่ให้ทุกใบ</span>', { removed: true }),
      row('f_need', 'เบอร์โทรลูกค้า', '<span class="fi"></span>', '<span class="rm">ตัดออก: ไม่มีรายงานใดใช้</span>', { removed: true }),
      row('f_cap', '', '<span class="fi"></span>', '<span class="fi">5</span>', { goodLabel: 'จำนวน (ตัวเลข)' }),
      row('f_mask', 'รหัสสินค้า', '<span class="fi"></span>', '<span class="fi ph">XX-XXX-XX</span>'),
      row('f_code', 'ประเภทสินค้า', '<span class="fi">เครื่องดื่มไม่มีแอลกอฮอล์</span>', '<span class="fi">B</span><span class="hint">B = เครื่องดื่ม</span>'),
      row('f_zero', 'ราคา', '<span class="fi">120.00</span><span class="hint">ต้องพิมพ์ทศนิยมเอง</span>', '<span class="fi">120</span><span class="hint">.00 เติมให้</span>'),
      row('f_calc', 'ยอดรวม', '<span class="fi"></span>', '<span class="fi auto">600.00</span><span class="hint">คำนวณให้</span>'),
      row('f_def', 'วันที่ขาย', '<span class="fi"></span>', '<span class="fi">30/09/2569</span><span class="hint">วันนี้</span>'),
      row('f_vals', 'วิธีชำระเงิน', '<span class="fi"></span>', '<span class="opt">เงินสด</span><span class="opt">โอน</span><span class="opt">บัตร</span>'),
    ];
    const actions = row('f_conf', '', '<span class="btn-s">ตกลง</span>', '<span class="btn-s">ยืนยัน</span><span class="btn-s ghost">ออก</span>', { goodLabel: '' });
    $('.xl', actions).style.display = 'none';
    form.append(el('div', { class: 'xh', text: 'บันทึกการขายสินค้า' }), ...rows, actions);
    const top = el('div', { class: 'ctrls' }, el('span', { class: 'readout' }, 'แก้แล้ว ', count, ' / ', String(FIX.length)), el('button', { class: 'btn small ghost', html: `${icon('replay')} เริ่มใหม่`, onclick: () => { fixed.clear(); rows.concat(actions).forEach(r => r._set(false)); upd(); say.innerHTML = 'แตะช่องที่มีเส้นสีแดง'; } }));
    host.append(top, form, say);
    function upd() { count.textContent = fixed.size; if (fixed.size === FIX.length) say.innerHTML = 'ครบทั้ง 10 จุด 4 จุดแรกที่ตัด/แทนที่คือกฎลดปริมาณ input ที่เหลือ 6 จุดคือแนวทางหน้าจอรับข้อมูล'; }
    upd();
  })();
  Hop.mcq($('#q-input'), {
    q: 'ร้านรวมใบสั่งซื้อที่เขียนมือทั้งวัน แล้วให้พนักงานพิมพ์เข้าระบบทีเดียวตอนหลังปิดร้าน นี่คือการป้อนข้อมูลแบบใด',
    opts: ['Online input', 'Batch input', 'Data capture เท่านั้น ยังไม่ใช่การป้อน'], a: 1,
    whyWrong: { 0: 'online คือป้อนทันทีที่เกิดรายการ ที่นี่สะสมไว้ก่อน', 2: 'การเขียนใบสั่งซื้อคือ capture ส่วนการพิมพ์เข้าระบบตอนปิดร้านคือ entry แบบ batch' },
    why: 'สะสมรายการไว้เป็นชุดแล้วป้อนตามเวลาที่กำหนดคือ batch input ส่วนการเขียนใบสั่งซื้อเป็นขั้น data capture',
  });
  Hop.mcq($('#q-input'), {
    q: 'ฟอร์มสมัครให้ผู้ใช้พิมพ์ทั้ง &ldquo;วันเกิด&rdquo; และ &ldquo;อายุ&rdquo; ควรแก้อย่างไรตามกฎลดปริมาณ input',
    opts: ['ตัดช่องอายุ ให้ระบบคำนวณจากวันเกิด', 'ตัดช่องวันเกิด เก็บแค่อายุ', 'เปลี่ยนช่องอายุเป็นรหัส', 'เก็บทั้งสองช่องแต่เพิ่ม validation'], a: 0,
    whyWrong: { 1: 'อายุเปลี่ยนทุกปี เก็บแล้วต้องแก้ตลอด วันเกิดต่างหากคือข้อมูลต้นทาง', 2: 'กฎใช้รหัสไว้แทนคำเต็ม อายุเป็นตัวเลขอยู่แล้ว', 3: 'validation ช่วยจับค่าผิด แต่ไม่ได้ลดปริมาณที่ต้องพิมพ์' },
    why: 'อายุคำนวณได้จากวันเกิดกับวันที่ปัจจุบัน ตรงกับกฎ &ldquo;ไม่ใส่อินพุตที่ระบบคำนวณเองได้&rdquo;',
  });

  /* =========================== 7. validation =========================== */
  (() => {
    const host = $('#fig-val');
    const CODES = ['C001', 'C002', 'C003', 'C004', 'C005'];
    const PROV = { '65': 'พิษณุโลก', '50': 'เชียงใหม่', '10': 'กรุงเทพมหานคร' }; const PROV_ORDER = ['65', '50', '10'];
    const BASE = { no: '1051', name: 'สมชาย ใจดี', code: 'C002', qty: '8', prov: '65', post: '65000' };
    const BATCH0 = [8, 12, 5, 10, 5];
    let vals = { ...BASE }, batch = BATCH0.slice();
    const ORDER = ['v_seq', 'v_exist', 'v_type', 'v_range', 'v_reason', 'v_valid', 'v_combo', 'v_batch'];
    const NAMES = { v_seq: 'Sequence', v_exist: 'Existence', v_type: 'Data type', v_range: 'Range / limit', v_reason: 'Reasonableness', v_valid: 'Validity', v_combo: 'Combination', v_batch: 'Batch control' };
    const T = k => Hop.t(k, NAMES[k] + ' check');

    function run() {
      const m = { no: null, name: null, code: null, qty: null, post: null }, fired = new Set();
      const put = (f, k, msg, warn) => { if (!m[f]) m[f] = { k, msg, warn }; fired.add(k); };
      const no = vals.no.trim();
      if (!no) put('no', 'v_exist', 'ปล่อยว่างไม่ได้'); else if (!/^\d+$/.test(no)) put('no', 'v_type', 'เลขที่ใบสั่งต้องเป็นตัวเลข'); else if (+no !== 1051) put('no', 'v_seq', `ใบล่าสุดคือ 1050 ใบถัดไปต้องเป็น 1051 แต่ได้ ${no}`);
      if (!vals.name.trim()) put('name', 'v_exist', 'ชื่อลูกค้าเป็นช่องบังคับ ปล่อยว่างไม่ได้');
      const code = vals.code.trim().toUpperCase();
      if (!code) put('code', 'v_exist', 'ปล่อยว่างไม่ได้'); else if (code.length !== 4) put('code', 'v_range', `รหัสลูกค้ายาว 4 ตัวเสมอ แต่ได้ ${code.length} ตัว`); else if (!CODES.includes(code)) put('code', 'v_valid', `ไม่มี ${code} ในตารางลูกค้า (มี C001 ถึง C005)`);
      const q = vals.qty.trim();
      if (!q) put('qty', 'v_exist', 'ปล่อยว่างไม่ได้'); else if (!/^\d+$/.test(q)) put('qty', 'v_type', 'จำนวนต้องเป็นตัวเลขเต็ม'); else if (+q < 1 || +q > 100) put('qty', 'v_range', `จำนวนต้องอยู่ 1 ถึง 100 แต่ได้ ${q}`); else if (+q > 50) put('qty', 'v_reason', `อยู่ในช่วง 1 ถึง 100 แต่ลูกค้ารายนี้สั่งปกติ 5 ถึง 10 ชิ้น ${q} ชิ้นผิดวิสัย ให้ยืนยัน`, true);
      const p = vals.post.trim();
      if (!p) put('post', 'v_exist', 'ปล่อยว่างไม่ได้'); else if (!/^\d+$/.test(p)) put('post', 'v_type', 'รหัสไปรษณีย์ต้องเป็นตัวเลข'); else if (p.length !== 5) put('post', 'v_range', `รหัสไปรษณีย์ยาว 5 หลัก แต่ได้ ${p.length}`); else if (p.slice(0, 2) !== vals.prov) put('post', 'v_combo', `${p} เป็นรหัสของจังหวัดอื่น ไม่ใช่${PROV[vals.prov]}`);
      const n = batch.length, s = batch.reduce((a, b) => a + b, 0);
      const bmsg = (n !== 5 || s !== 40) ? { k: 'v_batch', msg: `ผู้ใช้นับไว้ 5 ใบ รวม 40 ชิ้น แต่ระบบนับได้ ${n} ใบ รวม ${s} ชิ้น` } : null;
      if (bmsg) fired.add('v_batch');
      return { m, fired, bmsg, n, s };
    }

    const tiles = el('div', { class: 'vt' }, ORDER.map((k, i) => el('button', { class: 'vtile', 'data-k': k, style: style(k), html: `<span class="mono">${i + 1}</span><b>${NAMES[k]}</b>` })));
    const inputs = {};
    const msgs = {};
    const field = (f, label, hint, tag = 'input') => {
      const inp = tag === 'select'
        ? el('select', { class: 'field', onchange: e => { vals.prov = e.target.value; upd(); } }, PROV_ORDER.map(v => el('option', { value: v, text: PROV[v] })))
        : el('input', { class: 'field', value: vals[f], autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': label, oninput: e => { vals[f] = e.target.value; upd(); } });
      inputs[f] = inp; msgs[f] = el('div', { class: 'vm' });
      return el('div', { class: 'vf' }, el('label', {}, label, hint ? el('span', { class: 'muted', text: ' ' + hint }) : null), inp, msgs[f]);
    };
    const form = el('div', { class: 'vform' },
      field('no', 'เลขที่ใบสั่ง', '(ใบล่าสุด 1050)'), field('name', 'ชื่อลูกค้า'), field('code', 'รหัสลูกค้า', '(C + เลข 3 หลัก)'), field('qty', 'จำนวน', '(ชิ้น)'),
      field('prov', 'จังหวัด', '', 'select'), field('post', 'รหัสไปรษณีย์'));
    const presets = [
      ['เลขที่ใบสั่ง 1053', { no: '1053' }], ['ชื่อลูกค้าว่าง', { name: '' }], ['รหัสลูกค้า C999', { code: 'C999' }], ['รหัสลูกค้า C9', { code: 'C9' }], ['จำนวน abc', { qty: 'abc' }], ['จำนวน 250', { qty: '250' }], ['จำนวน 90', { qty: '90' }], ['เชียงใหม่ + 65000', { prov: '50', post: '65000' }], ['ไปรษณีย์ 6500', { post: '6500' }],
      ['ลบใบที่ 3 ในชุด', null, b => b.splice(2, 1)], ['พิมพ์ 12 เป็น 21', null, b => { b[1] = 21; }],
    ];
    const chips = el('div', { class: 'chips' }, el('span', { class: 'muted', text: 'ลองใส่ค่าผิด' }),
      presets.map(([l, set, bf]) => el('button', { class: 'cc', text: l, onclick: () => { vals = { ...BASE, ...(set || {}) }; batch = BATCH0.slice(); if (bf) bf(batch); syncInputs(); renderBatch(); upd(true); } })));
    const bt = el('div', { class: 'bt' });
    const bmsg = el('div', { class: 'vm' });
    function renderBatch() {
      bt.replaceChildren(...batch.map((v, i) => el('div', { class: 'br' }, el('span', { class: 'muted', text: 'ใบที่ ' + (i + 1) }), el('input', { class: 'field', value: v, inputmode: 'numeric', 'aria-label': 'จำนวนใบที่ ' + (i + 1), oninput: e => { batch[i] = +e.target.value || 0; upd(); } }), el('button', { class: 'stp', 'aria-label': 'ลบใบนี้', text: '×', onclick: () => { batch.splice(i, 1); renderBatch(); upd(); } }))));
    }
    const batchBox = el('div', { class: 'vbatch' }, el('div', { class: 'vb-h' }, el('b', { text: 'ชุดใบสั่งซื้อที่ป้อน' }), el('span', { class: 'muted', text: 'หัวหน้านับไว้ก่อนป้อน: 5 ใบ รวม 40 ชิ้น' })), bt, bmsg, el('div', { class: 'vb-f' }, el('span', { class: 'mono sums' }), el('button', { class: 'btn small ghost', text: 'คืนค่าเดิม', onclick: () => { vals = { ...BASE }; batch = BATCH0.slice(); syncInputs(); renderBatch(); upd(); } })));
    host.append(chips, tiles, form, batchBox);
    function syncInputs() { Object.entries(inputs).forEach(([f, i]) => { i.value = vals[f]; }); }
    let last = new Set();
    function upd(pulse) {
      const r = run();
      for (const f of Object.keys(msgs)) {
        if (f === 'prov') continue;
        const x = r.m[f];
        const el1 = inputs[f]; el1.classList.toggle('no', !!x && !x.warn); el1.classList.toggle('warn', !!x && !!x.warn); el1.classList.toggle('ok', !x);
        msgs[f].innerHTML = x ? `${T(x.k)} ${x.warn ? '<span class="w">ผ่านกฎ แต่</span> ' : ''}${esc(x.msg)}` : '';
        msgs[f].classList.toggle('on', !!x);
      }
      if (r.m.post) { inputs.prov.classList.toggle('no', r.m.post.k === 'v_combo'); } else inputs.prov.classList.remove('no');
      bmsg.innerHTML = r.bmsg ? `${T('v_batch')} ${esc(r.bmsg.msg)}` : ''; bmsg.classList.toggle('on', !!r.bmsg);
      $('.sums', batchBox).textContent = `ระบบนับ: ${r.n} ใบ รวม ${r.s} ชิ้น`;
      $$('.vtile', tiles).forEach((t, i) => { const on = r.fired.has(ORDER[i]); t.classList.toggle('lit', on); if (on && pulse) { t.classList.remove('pulse'); void t.offsetWidth; t.classList.add('pulse'); } });
      last = r.fired;
    }
    renderBatch(); upd();
  })();
  Hop.mcq($('#q-val'), {
    q: 'ระบบรับรหัสนิสิต 8 หลัก ผู้ใช้พิมพ์ 6 หลัก validation check แบบใดจับได้',
    opts: ['Range check (limit check)', 'Validity check', 'Reasonableness check', 'Existence check'], a: 0,
    whyWrong: { 1: 'validity เทียบกับตารางอ้างอิงว่ารหัสนี้มีจริงหรือไม่ แต่ที่นี่ผิดตั้งแต่ความยาวยังไม่ถึงขั้นไปค้นตาราง', 2: 'reasonableness คือเตือนค่าที่ผิดวิสัยทั้งที่ไม่ผิดกฎ ส่วนความยาวผิดคือผิดกฎตายตัว', 3: 'existence ตรวจว่าช่องว่างหรือไม่ ที่นี่ช่องมีค่า' },
    why: 'สไลด์เขียนว่า range check ตรวจ &ldquo;ความยาวหรือช่วงของข้อมูล&rdquo; รหัสต้องยาว 8 แต่ได้ 6 จึงผิดที่ความยาว',
  });
  Hop.mcq($('#q-val'), {
    q: 'ใบสั่งซื้อระบุวันที่สั่ง 20 ก.ย. แต่วันที่ส่งของ 15 ก.ย. ทั้งสองวันเป็นวันที่ที่มีจริง และอยู่ในช่วงของระบบ ใช้ validation แบบใดจับ',
    opts: ['Range check', 'Combination check', 'Sequence check', 'Validity check'], a: 1,
    whyWrong: { 0: 'range ดูค่าเดียวเทียบกับขอบเขต แต่ละวันที่ผ่านอยู่แล้ว', 2: 'sequence ตรวจความต่อเนื่องของเลขลำดับเช่นเลขที่เอกสาร ไม่ใช่ความสัมพันธ์ของสองวัน', 3: 'validity ถามว่าค่ามีในตารางอ้างอิงหรือไม่' },
    why: 'แต่ละค่าถูกเมื่อดูเดี่ยวๆ แต่สองช่องเข้ากันไม่ได้ (ส่งก่อนสั่ง) คือ combination check ที่ใช้ 2 ฟิลด์ร่วมกัน',
  });
  Hop.mcq($('#q-val'), {
    q: 'ลูกค้ารายหนึ่งสั่งซื้อ 10 ชิ้นเป็นประจำ วันนี้พนักงานป้อน 90 ชิ้น ซึ่งยังอยู่ในกรอบ 1 ถึง 100 ที่ระบบกำหนด ระบบเตือนให้ยืนยัน นี่คือ check แบบใด',
    opts: ['Range check', 'Reasonableness check', 'Existence check', 'Batch control'], a: 1,
    whyWrong: { 0: 'ถ้าเป็น range 90 ต้องผ่านเพราะอยู่ในช่วง ที่เตือนได้เพราะเทียบกับพฤติกรรมของลูกค้า', 2: 'ช่องมีค่าอยู่แล้ว', 3: 'batch control ตรวจผลรวมทั้งชุด ไม่ใช่ค่าเดียว' },
    why: '90 ไม่ผิดกฎตายตัวแต่ผิดวิสัยเมื่อเทียบกับที่เคยสั่ง คือ reasonableness check',
  });

  /* =========================== 8. audit trail =========================== */
  (() => {
    const host = $('#fig-audit');
    const USERS = [{ n: 'สมชาย', d: 'ฝ่ายบุคคล', ok: true }, { n: 'วิไล', d: 'บัญชี', ok: true }, { n: 'แขก', d: 'ผู้เยี่ยมชม', ok: false }];
    const PROC = ['ป้อนเองที่หน้าจอ', 'นำเข้าไฟล์ batch'];
    let sal = 25000, u = 0, pr = 0, clock = 9 * 60, enc = false, rowsN = 0;
    const cipher = s => [...String(s)].map((c, i) => ((c.charCodeAt(0) * 7 + 31 * (i + 3)) & 255).toString(16).padStart(2, '0')).join('');
    const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
    segment(host, USERS.map(x => ({ label: `${x.n} (${x.d})` })), i => { u = i; });
    const who = el('div', { class: 'chips' }, el('span', { class: 'muted', text: 'ผ่านทาง' }), PROC.map((p, i) => el('button', { class: 'cc', 'aria-pressed': String(i === 0), text: p, onclick: e => { pr = i; $$('.cc', who).forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); } })));
    const val = el('div', { class: 'aval' }, el('div', {}, el('span', { class: 'muted', text: 'พนักงาน สมศรี  เงินเดือน' }), el('b', { class: 'mono sal' })),
      el('div', { class: 'stps' }, el('button', { class: 'btn small', text: '− 1,000', onclick: () => edit(-1000) }), el('button', { class: 'btn small', text: '+ 1,000', onclick: () => edit(1000) })));
    const log = el('div', { class: 'alog' }, el('div', { class: 'al al-h' }, ['เวลา', 'ใครทำ', 'ผ่านทาง', 'เปลี่ยน'].map(t => el('span', { text: t }))));
    const empty = el('div', { class: 'al-empty muted', text: 'ยังไม่มีบันทึก ลองกดแก้เงินเดือน' });
    log.append(empty);
    const db = el('div', { class: 'dbv' }, el('span', { class: 'muted', text: 'ค่าที่เก็บในฐานข้อมูล' }), el('code', { class: 'dbc' }), el('button', { class: 'cc', 'aria-pressed': 'false', text: 'เก็บแบบเข้ารหัส', 'data-noswitch': 1, onclick: e => { enc = !enc; e.currentTarget.setAttribute('aria-pressed', String(enc)); draw(); } }));
    const say = el('p', { class: 'say fx', html: 'เลือกผู้ใช้ด้านบน แล้วกดแก้เงินเดือน' });
    host.append(who, val, db, log, say);
    function edit(d) {
      const x = USERS[u]; clock += 3; const t = hhmm(clock);
      let line;
      if (!x.ok) line = { t, w: x.n, p: PROC[pr], c: `ปฏิเสธ: ไม่มีสิทธิ์แก้ (${x.d})`, bad: true };
      else { const old = sal; sal = Math.max(0, sal + d); line = { t, w: x.n, p: PROC[pr], c: `${fmt(old)} → ${fmt(sal)}` }; }
      if (empty.parentNode) empty.remove();
      const r = el('div', { class: 'al new' + (line.bad ? ' bad' : '') }, [line.t, line.w, line.p, line.c].map(s => el('span', { text: s })));
      $('.al-h', log).after(r); requestAnimationFrame(() => r.classList.remove('new'));
      say.classList.add('fx-out'); setTimeout(() => { say.innerHTML = x.ok ? `${Hop.t('audit', 'Audit trail')} จดว่า ${x.n} แก้ตอน ${line.t} ผ่านทาง${PROC[pr]} ถ้าเงินเดือนผิดจะไล่ได้ทันทีว่าใครทำ` : `${Hop.t('datasec', 'Data security')} ปฏิเสธการแก้โดยผู้ที่ไม่มีสิทธิ์ และ audit trail ยังบันทึกความพยายามนั้นไว้`; say.classList.remove('fx-out'); }, 110);
      draw();
    }
    function draw() { $('.sal', val).textContent = fmt(sal); $('.dbc', db).textContent = `salary = ${enc ? cipher(sal) : sal}`; db.classList.toggle('enc', enc); }
    draw();
  })();
  Hop.mcq($('#q-icontrol'), {
    q: 'ผู้ตรวจสอบต้องการรู้ว่าใครเป็นคนแก้ราคาสินค้าเมื่อวานนี้ ต้องดูจากอะไร',
    opts: ['Audit trail', 'Encryption', 'Batch control', 'Reasonableness check'], a: 0,
    whyWrong: { 1: 'encryption ทำให้ข้อมูลอ่านไม่ออกสำหรับคนไม่มีกุญแจ ไม่ได้บอกว่าใครทำอะไร', 2: 'batch control ตรวจผลรวมของชุดข้อมูลตอนป้อน', 3: 'reasonableness check เตือนตอนป้อนค่าผิดวิสัย ไม่ได้เก็บประวัติ' },
    why: 'audit trail บอกที่มาของข้อมูล คือใครคีย์ เมื่อไร จากกระบวนการไหน จึงตอบคำถามนี้ได้',
  });

  /* =========================== 9. calculation =========================== */
  const CALC = { L: 1880, cat: 5, perCat: 3, G: 3, P: 80, H: 4, V: 16 };
  CALC.S = CALC.cat * CALC.perCat; CALC.T = CALC.L + CALC.S + CALC.G; CALC.U = CALC.P - CALC.H; CALC.pg = CALC.T / CALC.U; CALC.N = Math.ceil(CALC.pg); CALC.min = CALC.N / CALC.V;
  // grid of page icons: n pages, last one partly filled
  function pageGrid(n, lastFill) {
    const g = el('div', { class: 'pg' });
    for (let i = 0; i < n; i++) g.append(el('div', { class: 'pgi' }, el('i', { style: `height:${i === n - 1 ? lastFill * 100 : 100}%` })));
    return g;
  }
  (() => {
    const host = $('#fig-calc');
    const A = el('div', { class: 'cp cp-lines' },
      el('div', { class: 'cp-big' }, el('b', { class: 'mono bigT' }), el('span', { class: 'muted', text: ' บรรทัด' })),
      el('div', { class: 'lbar' }, el('div', { class: 's1' }, el('span', { text: 'รายการ 1,880' })), el('div', { class: 's2' }), el('div', { class: 's3' })),
      el('div', { class: 'lleg' }, el('span', { class: 'l1' }, 'รายการ ', el('b', { class: 'mono', text: '1,880' })), el('span', { class: 'l2' }, 'ผลรวมหมวด ', el('b', { class: 'mono v2', text: '5 x 3 = 15' })), el('span', { class: 'l3' }, 'ยอดรวม ', el('b', { class: 'mono v3', text: '3' }))));
    const stripes = el('div', { class: 'pstripe' });
    for (let i = 0; i < 40; i++) stripes.append(el('i', { class: i < 1 ? 'h' : i >= 39 ? 'h' : '' }));
    const B = el('div', { class: 'cp cp-page' },
      el('div', { class: 'pgfig' }, el('div', { class: 'hf h1', text: 'หัวกระดาษ 2' }), el('div', { class: 'us', html: '<b class="mono">76</b><span>บรรทัดพิมพ์เนื้อหา</span>' }), el('div', { class: 'hf h2', text: 'ท้ายกระดาษ 2' })),
      el('div', { class: 'pgtxt mono' }, el('div', {}, '80 − (2 + 2)'), el('div', { class: 'big', text: '= 76' }), el('div', { class: 'muted sm', text: 'บรรทัดต่อหน้าที่ใช้ได้' })));
    const C = el('div', { class: 'cp cp-pages' }, el('div', { class: 'cp-big' }, el('b', { class: 'mono bigN' }), el('span', { class: 'muted', text: ' หน้า' })), (() => { const g = pageGrid(25, (CALC.T - 24 * CALC.U) / CALC.U); g.classList.add('g25'); return g; })(), el('div', { class: 'cp-note mono', html: '1,898 ÷ 76 = 24.97 หน้า<br>ปัดขึ้น = <b>25</b> (24 หน้ารับได้แค่ 1,824 บรรทัด)' }));
    const D = el('div', { class: 'cp cp-time' },
      el('div', { class: 'cp-big' }, el('b', { class: 'mono bigM' })),
      el('div', { class: 'tbar' }, el('div', { class: 'm1' }, '1 นาที'), el('div', { class: 'm2' }, el('span', { class: 'mono', text: '.5625' }))),
      el('div', { class: 'cp-note mono tn' }));
    const stage = el('div', { class: 'cstage' }, A, B, C, D);
    host.append(stage);
    const say = el('p', { class: 'say' });
    const pagesEls = $$('.pgi i', C);
    function frame(t) {
      const op = (c, w = 1.1) => clamp(1 - Math.abs(t - c) / w * 1.0, 0, 1);
      const a = t <= 2 ? 1 : clamp(1 - (t - 2) * 2.2, 0, 1), b = clamp(1 - Math.abs(t - 3) * 2.2, 0, 1), c = clamp(1 - Math.abs(t - 4) * 2.2, 0, 1), d = t >= 5 ? clamp((t - 4.6) * 2.2, 0, 1) : 0;
      [[A, a], [B, b], [C, c], [D, d]].forEach(([n, o]) => { n.style.opacity = o; n.style.visibility = o < .02 ? 'hidden' : 'visible'; n.style.transform = `translateY(${(1 - o) * 10}px)`; });
      // lines panel
      const p2 = ease(clamp(t, 0, 1)), p3 = ease(clamp(t - 1, 0, 1));
      const T = CALC.L + CALC.S * p2 + CALC.G * p3;
      $('.bigT', A).textContent = fmt(Math.round(T));
      const w2 = (CALC.S / CALC.T) * 100 * p2, w3 = (CALC.G / CALC.T) * 100 * p3, w1 = (CALC.L / CALC.T) * 100;
      const sc = 100 / (w1 + w2 + w3);
      $('.s1', A).style.width = (w1 * sc) + '%'; $('.s2', A).style.width = (w2 * sc) + '%'; $('.s3', A).style.width = (w3 * sc) + '%'; $('.s3', A).style.minWidth = p3 > .02 ? '5px' : '0'; $('.s2', A).style.minWidth = p2 > .02 ? '5px' : '0';
      $('.l2', A).style.opacity = .25 + .75 * p2; $('.l3', A).style.opacity = .25 + .75 * p3;
      // pages panel
      const vis = ease(clamp(t - 3.2, 0, 1)) * 25;
      pagesEls.forEach((p, i) => { p.parentNode.style.opacity = clamp(vis - i, 0, 1); });
      $('.bigN', C).textContent = Math.round(clamp(vis, 0, 25));
      // time panel
      const m = ease(clamp(t - 5, 0, 1));
      $('.m2', D).style.width = (36 * m) + '%';
      $('.bigM', D).textContent = t < 6 ? (CALC.min * m).toFixed(4).replace(/0+$/, '').replace(/\.$/, '') + ' นาที' : '1 นาที 33.75 วินาที';
      $('.tn', D).innerHTML = t < 5.5 ? '25 ÷ 16 = 1.5625 นาที' : t < 6 ? '1.5625 = 1 นาที + 0.5625 นาที' : '0.5625 x 60 = 33.75 วินาที';
      say.innerHTML = t < 3.5 ? 'ยังไม่ใช่คำตอบ ตอนนี้กำลังนับว่าต้องพิมพ์กี่บรรทัด' : t < 5 ? `<b style="color:var(--c-violet)">ข้อ 1:</b> ใช้กระดาษ 25 แผ่น` : `<b style="color:var(--c-violet)">ข้อ 1:</b> 25 แผ่น <b style="color:var(--c-teal)">ข้อ 2:</b> ${t < 5.9 ? '1.5625 นาที' : '1 นาที 33.75 วินาที'}`;
    }
    Hop.scrub(host, { stops: [
      { label: 'ตั้งต้น: รายการขาย 1,880 รายการ = 1,880 บรรทัด' },
      { label: 'บวกผลรวมหมวด 5 หมวด x 3 บรรทัด = 15' },
      { label: 'บวกยอดรวมทั้งหมด 3 บรรทัด = 1,898 บรรทัด' },
      { label: 'หน้าละ 80 บรรทัด หักหัว 2 ท้าย 2 เหลือ 76' },
      { label: '1,898 ÷ 76 = 24.97 ปัดขึ้น = 25 หน้า = 25 แผ่น' },
      { label: 'เวลา = 25 ÷ 16 = 1.5625 นาที' },
      { label: 'แปลงเศษ 0.5625 x 60 = 33.75 วินาที' },
    ], onFrame: frame, speed: 1500 });
    host.append(say); frame(0);
  })();
  (() => {
    const host = $('#fig-ceil');
    let L = 1880;
    const sl = el('input', { type: 'range', class: 'slider', min: 1860, max: 1920, value: L, 'aria-label': 'จำนวนรายการ' });
    const rd = el('span', { class: 'readout' });
    const quick = el('div', { class: 'chips' }, [['พอดีเป๊ะ', 1882], ['เกินไป 1 บรรทัด', 1883], ['ต้นฉบับ', 1880]].map(([l, v]) => el('button', { class: 'cc', text: l, onclick: () => { L = v; sl.value = v; upd(); } })));
    const grid = el('div'); const res = el('div', { class: 'ceil-r' });
    host.append(el('div', { class: 'ctrls', style: 'margin-top:0' }, el('span', { class: 'readout', text: 'รายการขาย' }), sl, rd), quick, grid, res);
    sl.addEventListener('input', () => { L = +sl.value; upd(); });
    function upd() {
      sl.style.setProperty('--p', ((L - 1860) / 60 * 100) + '%');
      const T = L + 18, q = T / 76, N = Math.ceil(q), rest = T - (N - 1) * 76;
      rd.textContent = fmt(L);
      grid.replaceChildren(pageGrid(N, rest / 76));
      res.innerHTML = `<div>T = ${fmt(L)} + 15 + 3 = <b>${fmt(T)}</b> บรรทัด</div><div>T ÷ 76 = ${fmt(T)} ÷ 76 = <b>${q.toFixed(2)}</b></div><div>ปัดขึ้น = <b>${N} หน้า</b> <span class="eqs">(หน้าสุดท้ายใช้ ${rest} จาก 76 บรรทัด)</span></div>`;
    }
    upd();
  })();
  Hop.eq($('#eq-calc'), [['cl_total', 'T'], ' = ', ['cl_detail', 'L'], ' + ', ['cl_sub', 'S'], ' + ', ['cl_grand', 'G']], { sym: { cl_total: 'T', cl_detail: 'L', cl_sub: 'S', cl_grand: 'G' } });
  Hop.eq($('#eq-calc'), [['cl_usable', 'U'], ' = ', ['cl_page', 'P'], ' − ', ['cl_hf', 'H']], { sym: { cl_usable: 'U', cl_page: 'P', cl_hf: 'H' } });
  const legend = (host, keys, sym) => host.append(el('div', { class: 'legend' }, keys.map(k => { const c = Hop.C[k]; return el('button', { 'data-k': k, style: `--tc: var(--c-${c.c})`, html: `<b>${sym[k]}</b><span>${c.hint}</span>` }); })));
  Hop.eq($('#eq-calc'), [['cl_pages', 'N'], ' = ปัดขึ้น( ', ['cl_total', 'T'], ' ÷ ', ['cl_usable', 'U'], ' )'], { legend: false });
  legend($('#eq-calc'), ['cl_pages'], { cl_pages: 'N' });
  Hop.eq($('#eq-calc'), [['cl_time', 'Time'], ' = ', ['cl_pages', 'N'], ' ÷ ', ['cl_ppm', 'V']], { legend: false });
  legend($('#eq-calc'), ['cl_time', 'cl_ppm'], { cl_time: 'Time', cl_ppm: 'V' });
  Hop.onView($('#work-calc'), () => Hop.work($('#work-calc'), [
    { html: '<b>1) บรรทัดทั้งหมด</b>' },
    { t: 'บรรทัดรายการ L = 1,880 x 1 = 1,880 บรรทัด' },
    { t: 'บรรทัดผลรวมหมวด S = 5 หมวด x 3 บรรทัด = 15 บรรทัด' },
    { t: 'บรรทัดยอดรวมทั้งหมด G = 3 บรรทัด' },
    { t: 'บรรทัดทั้งหมด T = 1,880 + 15 + 3 = 1,898 บรรทัด', },
    { html: '<b>2) จำนวนหน้ากับจำนวนแผ่น</b>' },
    { t: 'บรรทัดที่ใช้ได้ต่อหน้า U = 80 − (2 + 2) = 76 บรรทัด' },
    { t: 'จำนวนหน้า N = 1,898 ÷ 76 = 24.97 ปัดขึ้นเป็น 25 หน้า' },
    { t: 'ตอบข้อ 1: ใช้กระดาษ 25 แผ่น (พิมพ์ 1 หน้าต่อ 1 แผ่น)' },
    { html: '<b>3) เวลาพิมพ์</b>' },
    { t: 'เวลา = N ÷ V = 25 ÷ 16 = 1.5625 นาที' },
    { t: 'แปลงเศษ 0.5625 นาที x 60 = 33.75 วินาที' },
    { t: 'ตอบข้อ 2: 1 นาที 33.75 วินาที (ประมาณ 1 นาที 34 วินาที)' },
  ], { stagger: 150 }), .2);
  Hop.mcq($('#q-calc'), {
    q: 'คำนวณได้ 1,898 ÷ 76 = 24.97 หน้า ควรตอบกี่หน้า',
    opts: ['24 หน้า ปัดทิ้งเศษ', '25 หน้า ปัดขึ้น', '24.97 หน้า ตอบทศนิยมได้เลย', '26 หน้า เผื่อไว้หนึ่งหน้า'], a: 1,
    whyWrong: { 0: '24 หน้ารับได้แค่ 24 x 76 = 1,824 บรรทัด ยังเหลืออีก 74 บรรทัดที่ไม่มีที่พิมพ์', 2: 'หน้ากระดาษนับเป็นแผ่นเต็ม จะมีหน้า 0.97 ไม่ได้', 3: 'ปัดขึ้นเฉพาะให้พอดีรับเศษ ไม่ต้องเผื่อเพิ่ม' },
    why: 'เศษ 0.97 หน้าคือ 74 บรรทัดที่ยังต้องพิมพ์ จึงต้องใช้อีก 1 หน้า ปัดขึ้นเสมอ ไม่ว่าเศษจะน้อยแค่ไหน',
  });
  Hop.mcq($('#q-calc'), {
    q: 'ถ้าผลหารเวลาพิมพ์ได้ 2.75 นาที เขียนเป็นนาทีกับวินาทีอย่างไร',
    opts: ['2 นาที 75 วินาที', '2 นาที 45 วินาที', '2 นาที 7.5 วินาที', '2 นาที 15 วินาที'], a: 1,
    whyWrong: { 0: 'วินาทีไม่เกิน 59 เศษ .75 ต้องคูณ 60 ก่อน ไม่ใช่อ่านเป็นวินาทีตรงๆ', 2: 'นี่คือการเอา .75 x 10', 3: 'คิดจาก .25 x 60 ไม่ใช่ .75' },
    why: '2.75 นาที เศษ 0.75 x 60 = 45 วินาที จึงเป็น 2 นาที 45 วินาที',
  });
})();
