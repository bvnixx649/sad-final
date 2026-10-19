// Scenario → tables: shared by chapter 2 (lesson figure) and the mock exam (model answers).
// text markup: {คำในโจทย์|EntityId}. fields: [name, type, flag] flag: 'pk' | 'fk' | 'pkfk' | ''
const Scen = (() => {
  const { el, $, $$, esc } = Hop;
  const S = {
    abc: {
      tab: 'ABC (สไลด์)',
      text: 'บริษัท ABC ต้องการเก็บข้อมูลเพื่อทำรายงานสรุป{ยอดขาย|Sales}{สินค้า|Product}ต่างๆ ซึ่งแบ่งตาม{หมวดสินค้า|Category} ตาม{สาขา|Location}ที่กระจายอยู่ใน{รัฐ|State}ต่างๆ ในแต่ละ{ประเทศ|Country} รายงานต้องแบ่งตามไตรมาสและปีได้',
      ents: [
        { id: 'Country', th: 'ประเทศ', f: [['Country_Id', 'nchar(4)', 'pk'], ['Country_Name', 'varchar(50)', '']] },
        { id: 'State', th: 'รัฐ', f: [['State_Id', 'nchar(4)', 'pk'], ['State_Name', 'varchar(50)', '']] },
        { id: 'Location', th: 'สาขา', f: [['Loc_Id', 'nchar(4)', 'pk'], ['Loc_Code', 'varchar(5)', ''], ['Loc_Name', 'varchar(30)', ''], ['State_Id', 'nchar(4)', 'fk'], ['Country_Id', 'nchar(4)', 'fk']] },
        { id: 'Category', th: 'หมวดสินค้า', f: [['Cat_Id', 'nchar(4)', 'pk'], ['Cat_Name', 'varchar(50)', '']] },
        { id: 'Product', th: 'สินค้า', f: [['PR_Id', 'nchar(4)', 'pk'], ['PR_Name', 'varchar(50)', ''], ['Cat_Id', 'nchar(4)', 'fk']] },
        { id: 'Sales', th: 'ยอดขาย', f: [['Sale_Id', 'nchar(4)', 'pk'], ['PR_Id', 'nchar(4)', 'fk'], ['Loc_Id', 'nchar(4)', 'fk'], ['Sales', 'money', ''], ['Date', 'date', '']] },
      ],
      rels: [['Country', 'Location', 'ประเทศหนึ่งมีหลายสาขา'], ['State', 'Location', 'รัฐหนึ่งมีหลายสาขา'], ['Category', 'Product', 'หมวดหนึ่งมีสินค้าหลายตัว'], ['Product', 'Sales', 'สินค้าหนึ่งตัวขายได้หลายครั้ง'], ['Location', 'Sales', 'สาขาหนึ่งมียอดขายหลายรายการ']],
      mn: [],
      calc: [['ไตรมาส, ปี', 'คำนวณจาก Date ได้ จึงเก็บแค่ Date'], ['ยอดรวมต่อสาขา/ประเทศ', 'ได้จากการ SUM ตาราง Sales ตอนออกรายงาน']],
    },
    lib: {
      tab: 'ห้องสมุด',
      text: 'ห้องสมุดเก็บข้อมูล{สมาชิก|Member} (รหัส ชื่อ เบอร์โทร) และ{หนังสือ|Book} (ISBN ชื่อเรื่อง ปีที่พิมพ์) หนังสือแต่ละเรื่องอยู่ใน{หมวด|Category}เดียว หนังสือหนึ่งเรื่องมี{ผู้แต่ง|Author}ได้หลายคน และผู้แต่งหนึ่งคนเขียนได้หลายเรื่อง สมาชิกหนึ่งคน{ยืม|Loan}หนังสือได้หลายครั้ง แต่ละครั้งบันทึกวันยืม วันกำหนดคืน วันที่คืนจริง และระบบต้องแสดงค่าปรับวันละ 5 บาทเมื่อคืนช้า',
      ents: [
        { id: 'Member', th: 'สมาชิก', f: [['Mem_Id', 'char(6)', 'pk'], ['Mem_Name', 'varchar(50)', ''], ['Phone', 'varchar(10)', '']] },
        { id: 'Category', th: 'หมวด', f: [['Cat_Id', 'char(3)', 'pk'], ['Cat_Name', 'varchar(30)', '']] },
        { id: 'Book', th: 'หนังสือ', f: [['ISBN', 'char(13)', 'pk'], ['Title', 'varchar(100)', ''], ['Pub_Year', 'int', ''], ['Cat_Id', 'char(3)', 'fk']] },
        { id: 'Author', th: 'ผู้แต่ง', f: [['Auth_Id', 'char(5)', 'pk'], ['Auth_Name', 'varchar(50)', '']] },
        { id: 'BookAuthor', th: 'ผู้แต่งของหนังสือ', assoc: true, f: [['ISBN', 'char(13)', 'pkfk'], ['Auth_Id', 'char(5)', 'pkfk']] },
        { id: 'Loan', th: 'การยืม', f: [['Loan_Id', 'char(8)', 'pk'], ['Mem_Id', 'char(6)', 'fk'], ['ISBN', 'char(13)', 'fk'], ['Loan_Date', 'date', ''], ['Due_Date', 'date', ''], ['Return_Date', 'date', '']] },
      ],
      rels: [['Category', 'Book', 'หมวดหนึ่งมีหนังสือหลายเรื่อง'], ['Member', 'Loan', 'สมาชิกหนึ่งคนยืมได้หลายครั้ง'], ['Book', 'Loan', 'หนังสือหนึ่งเรื่องถูกยืมได้หลายครั้ง'], ['Book', 'BookAuthor', 'M:N หนังสือ–ผู้แต่ง แตกเป็น 1:M สองเส้น'], ['Author', 'BookAuthor', '']],
      mn: [['Book', 'Author', 'BookAuthor']],
      calc: [['ค่าปรับ', '= (Return_Date − Due_Date) × 5 คำนวณได้ จึงไม่เก็บ']],
    },
    reg: {
      tab: 'ลงทะเบียนเรียน',
      text: 'มหาวิทยาลัยเก็บข้อมูล{นิสิต|Student} (รหัส ชื่อ) แต่ละคนสังกัด{สาขาวิชา|Major}เดียว และมี{อาจารย์ที่ปรึกษา|Advisor}หนึ่งคน อาจารย์หนึ่งคนดูแลนิสิตได้หลายคน นิสิตลงทะเบียน{รายวิชา|Course}ได้หลายวิชา และแต่ละวิชามีนิสิตลงหลายคน ต้องเก็บภาคเรียนและเกรดที่ได้ของแต่ละวิชา รายวิชามีรหัส ชื่อวิชา และหน่วยกิต ระบบต้องแสดงเกรดเฉลี่ย (GPA) ของนิสิต',
      ents: [
        { id: 'Major', th: 'สาขาวิชา', f: [['Major_Id', 'char(4)', 'pk'], ['Major_Name', 'varchar(50)', '']] },
        { id: 'Advisor', th: 'อาจารย์ที่ปรึกษา', f: [['Adv_Id', 'char(5)', 'pk'], ['Adv_Name', 'varchar(50)', '']] },
        { id: 'Student', th: 'นิสิต', f: [['Std_Id', 'char(8)', 'pk'], ['Std_Name', 'varchar(50)', ''], ['Major_Id', 'char(4)', 'fk'], ['Adv_Id', 'char(5)', 'fk']] },
        { id: 'Course', th: 'รายวิชา', f: [['Course_Id', 'char(6)', 'pk'], ['Course_Name', 'varchar(60)', ''], ['Credit', 'int', '']] },
        { id: 'Enroll', th: 'การลงทะเบียน', assoc: true, f: [['Std_Id', 'char(8)', 'pkfk'], ['Course_Id', 'char(6)', 'pkfk'], ['Semester', 'char(6)', 'pk'], ['Grade', 'char(2)', '']] },
      ],
      rels: [['Major', 'Student', 'สาขาหนึ่งมีนิสิตหลายคน'], ['Advisor', 'Student', 'อาจารย์หนึ่งคนดูแลนิสิตหลายคน'], ['Student', 'Enroll', 'M:N นิสิต–วิชา แตกเป็น 1:M สองเส้น'], ['Course', 'Enroll', '']],
      mn: [['Student', 'Course', 'Enroll']],
      calc: [['GPA', 'คำนวณจาก Grade × Credit ของทุกวิชาได้ จึงไม่เก็บ']],
    },
    shop: {
      tab: 'ร้านออนไลน์',
      text: 'ร้านค้าออนไลน์เก็บข้อมูล{ลูกค้า|Customer} (รหัส ชื่อ ที่อยู่) ลูกค้าหนึ่งคนสั่ง{คำสั่งซื้อ|Orders}ได้หลายครั้ง คำสั่งซื้อมีเลขที่และวันที่ หนึ่งคำสั่งซื้อมี{สินค้า|Product}ได้หลายรายการ แต่ละรายการระบุจำนวน สินค้ามีรหัส ชื่อ ราคา และอยู่ใน{หมวดสินค้า|Category}เดียว ใบเสร็จต้องแสดงยอดรวมของคำสั่งซื้อ',
      ents: [
        { id: 'Customer', th: 'ลูกค้า', f: [['Cust_Id', 'char(6)', 'pk'], ['Cust_Name', 'varchar(50)', ''], ['Address', 'varchar(200)', '']] },
        { id: 'Category', th: 'หมวดสินค้า', f: [['Cat_Id', 'char(3)', 'pk'], ['Cat_Name', 'varchar(30)', '']] },
        { id: 'Product', th: 'สินค้า', f: [['Prod_Id', 'char(6)', 'pk'], ['Prod_Name', 'varchar(60)', ''], ['Price', 'money', ''], ['Cat_Id', 'char(3)', 'fk']] },
        { id: 'Orders', th: 'คำสั่งซื้อ', f: [['Order_No', 'char(8)', 'pk'], ['Order_Date', 'date', ''], ['Cust_Id', 'char(6)', 'fk']] },
        { id: 'OrderLine', th: 'รายการสั่งซื้อ', assoc: true, f: [['Order_No', 'char(8)', 'pkfk'], ['Prod_Id', 'char(6)', 'pkfk'], ['Qty', 'int', ''], ['Unit_Price', 'money', '']] },
      ],
      rels: [['Customer', 'Orders', 'ลูกค้าหนึ่งคนมีหลายคำสั่งซื้อ'], ['Category', 'Product', 'หมวดหนึ่งมีสินค้าหลายตัว'], ['Orders', 'OrderLine', 'M:N คำสั่งซื้อ–สินค้า แตกเป็น 1:M สองเส้น'], ['Product', 'OrderLine', '']],
      mn: [['Orders', 'Product', 'OrderLine']],
      calc: [['ยอดรวมคำสั่งซื้อ', '= ผลรวมของ Qty × Unit_Price คำนวณได้ จึงไม่เก็บ']],
      note: 'Unit_Price เก็บราคา ณ วันที่สั่ง เพราะราคาใน Product เปลี่ยนได้ภายหลัง (ไม่ใช่ค่าซ้ำ)',
    },
  };

  const plain = sc => sc.text.replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
  const fk2src = (sc, name, self) => { const e = sc.ents.find(x => x.id !== self && x.f.some(f => f[0] === name && (f[2] === 'pk' || f[2] === 'pkfk'))); return e ? e.id : '?'; };
  const pkOf = e => e.f.filter(f => f[2].includes('pk')).map(f => f[0]);
  const notation = (sc, e) => `${e.id} (${e.f.map(f => f[2].includes('pk') ? f[0] + '*' : f[0]).join(', ')})`;

  // model answer lines for the written exam (Hop.work format)
  function answer(sc) {
    const H = t => ({ html: `<b>${t}</b>`, h: true });
    const nouns = [...sc.text.matchAll(/\{([^|}]+)\|([^}]+)\}/g)];
    const L = [
      H('1) หา entity จากคำนามในโจทย์'),
      { t: nouns.map(m => `${m[1]} → ${m[2]}`).join(',  ') },
      ...(sc.mn.length ? [{ t: `ความสัมพันธ์ M:N (${sc.mn.map(m => `${m[0]}–${m[1]}`).join(', ')}) ต้องเพิ่ม associative entity: ${sc.mn.map(m => m[2]).join(', ')}`, note: true }] : []),
      H('2) ตาราง (ขีดเส้นใต้ = PK, FK = คีย์นอก)'),
    ];
    sc.ents.forEach(e => {
      L.push({ t: notation(sc, e) });
      const fks = e.f.filter(f => f[2].includes('fk'));
      if (fks.length) L.push({ t: `   FK: ${fks.map(f => `${f[0]} → ${fk2src(sc, f[0], e.id)}`).join(', ')}`, note: true });
    });
    L.push({ t: '* = primary key (ในกระดาษให้ขีดเส้นใต้) ถ้ามี * หลายตัวคือ combination key', note: true });
    L.push(H('3) ความสัมพันธ์และ cardinality'));
    sc.rels.forEach(([a, b, s]) => L.push({ t: `${a} 1 ──< M ${b}${s ? '   ' + s : ''}` }));
    L.push(H('4) ชนิดข้อมูล (Field Name | Type)'));
    sc.ents.forEach(e => L.push({ t: `${e.id}: ${e.f.map(f => `${f[0]} ${f[1]}`).join(', ')}` }));
    L.push(H('5) สิ่งที่ไม่เก็บ'));
    sc.calc.forEach(([k, w]) => L.push({ t: `${k}: ${w}` }));
    if (sc.note) L.push({ t: sc.note, note: true });
    L.push({ t: 'ตรวจ 3NF: ทุก field ขึ้นกับ PK ทั้งก้อน และไม่ขึ้นกับ field อื่นที่ไม่ใช่คีย์', note: true });
    return L;
  }

  // lesson figure: pick a scenario, scrub through the design procedure
  function figure(host, ids = ['abc', 'lib', 'reg', 'shop']) {
    let cur = ids[0], last = -1, sc = S[cur];
    const seg = el('div', { class: 'seg scn-seg' });
    const txt = el('p', { class: 'scn-text' });
    const board = el('div', { class: 'scn-board' });
    const extra = el('div', { class: 'scn-extra' });
    const say = el('p', { class: 'say' });
    host.append(el('div', { class: 'ctrls' }, seg), txt, say);
    const STOPS = [
      'อ่านโจทย์ให้จบก่อน ยังไม่ต้องวาดอะไร',
      'ขีดเส้นใต้คำนามที่เป็น "สิ่งที่ต้องเก็บข้อมูล" แต่ละคำคือ entity หนึ่งตาราง คำที่เป็นแค่รายละเอียด (ชื่อ เบอร์ วันที่) คือ field',
      'ใส่ field ของแต่ละ entity จากรายละเอียดในโจทย์',
      'เลือก primary key ให้ทุกตาราง: field ที่ไม่ซ้ำและสั้นที่สุด ถ้าไม่มีให้สร้างรหัสขึ้นมา',
      'หาความสัมพันธ์จากประโยค "หนึ่ง...มีหลาย..." ถ้าเป็น M:N ให้สร้างตารางกลาง (associative entity) ที่มี PK ของทั้งสองฝั่งรวมกัน',
      'ใส่ foreign key ที่ฝั่ง "many" เสมอ: PK ของฝั่ง 1 ไปเป็น field ในตารางฝั่ง M',
      'กำหนดชนิดข้อมูลแบบตารางของอาจารย์ (Field Name | Type) และตัดค่าที่คำนวณได้ออก',
    ];
    function setScen(id) {
      cur = id; sc = S[id]; last = -1;
      $$('button', seg).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
      draw(scrub ? Math.round(scrub.t) : 0);
    }
    ids.forEach(id => seg.append(el('button', { 'data-id': id, text: S[id].tab, onclick: () => setScen(id) })));
    function draw(st) {
      const ents = new Set(sc.ents.map(e => e.id));
      txt.innerHTML = sc.text.replace(/\{([^|}]+)\|([^}]+)\}/g, (m, w, e) => st >= 1 ? `<mark class="nn">${esc(w)}<sub>${esc(e)}</sub></mark>` : esc(w));
      const show = sc.ents.filter(e => !e.assoc || st >= 4);
      board.innerHTML = '';
      show.forEach(e => {
        const card = el('div', { class: 'scn-card' + (e.assoc ? ' assoc' : '') + (st >= 4 && e.assoc ? ' new' : '') });
        card.append(el('div', { class: 'h', html: `${esc(e.id)}<span>${esc(e.th)}</span>` }));
        if (st >= 2) e.f.forEach(f => {
          const isFk = f[2].includes('fk'), isPk = f[2].includes('pk');
          if (isFk && !isPk && st < 5) return;
          if (e.assoc && st < 4) return;
          const row = el('div', { class: 'fr' + (isPk && st >= 3 ? ' pk' : '') + (isFk && st >= 5 ? ' fk' : '') + (isFk && st === 5 ? ' new' : '') },
            el('span', { class: 'fn', text: f[0] }),
            el('span', { class: 'tg', text: [isPk && st >= 3 ? 'PK' : '', isFk && st >= 5 ? 'FK' : ''].filter(Boolean).join(' ') }),
            st >= 6 ? el('span', { class: 'ty', text: f[1] }) : null);
          card.append(row);
        });
        board.append(card);
      });
      extra.innerHTML = '';
      if (st >= 4) extra.append(el('div', { class: 'scn-rels' }, sc.rels.map(([a, b, s]) => el('div', { html: `<b>${a}</b> 1 ──&lt; M <b>${b}</b><span>${esc(s)}</span>` }))));
      if (st >= 6) extra.append(el('div', { class: 'scn-calc' }, sc.calc.map(([k, w]) => el('div', { html: `<s>${esc(k)}</s> ${esc(w)}` })), sc.note ? el('div', { class: 'nt', text: sc.note }) : null));
      say.innerHTML = STOPS[st];
    }
    host.insertBefore(board, say); host.insertBefore(extra, say);
    const scrub = Hop.scrub(host, { stops: STOPS.map(() => ({ label: '' })), speed: 1600, onFrame(t) { const s = Math.round(t); if (s === last) return; last = s; draw(s); } });
    setScen(cur);
  }
  return { S, answer, figure, plain, notation };
})();
