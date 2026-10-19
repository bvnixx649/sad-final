// Chapter 2 practice bank: keys, normal forms, splitting decisions, ERD cardinality, referential integrity, DBMS parts, warehouse, control.
(() => {
  const L = 'style="text-align:left"';
  // plain table for question figures; pk = underlined column indexes
  const T = (name, cols, rows, pk = []) => `${name ? `<div style="font:700 14px var(--mono);margin:0 0 4px">${name}</div>` : ''}<table><thead><tr>${cols.map((c, i) => `<th ${L}>${pk.includes(i) ? `<u>${c}</u>` : c}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(v => `<td ${L}>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  // crow's foot end (local origin = entity edge, line toward +x)
  const gl = (min, max, x, y, deg) => {
    let p, c = '';
    if (max === 'M') { p = 'M0 -9L14 0M0 9L14 0M0 0H14'; if (min === 1) p += 'M21 -8V8'; else c = '<circle cx="23" cy="0" r="5.5" fill="var(--band)"/>'; }
    else { p = 'M8 -8V8'; if (min === 1) p += 'M15 -8V8'; else c = '<circle cx="21" cy="0" r="5.5" fill="var(--band)"/>'; }
    return `<g transform="translate(${x} ${y}) rotate(${deg})" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="${p}"/>${c}</g>`;
  };
  const erd = (A, B, a, b, v) => `<svg viewBox="0 0 380 90" style="max-width:440px;margin:auto;color:var(--c-violet)"><rect x="4" y="22" width="120" height="44" rx="9" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="64" y="49" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">${A}</text><rect x="256" y="22" width="120" height="44" rx="9" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="316" y="49" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">${B}</text><line x1="124" y1="44" x2="256" y2="44" stroke="currentColor" stroke-width="2"/>${gl(a[0], a[1], 124, 44, 0)}${gl(b[0], b[1], 256, 44, 180)}${v ? `<text x="190" y="30" text-anchor="middle" font-size="13" fill="var(--ink-2)">${v}</text>` : ''}</svg>`;
  const RNG = { '1,1': ['1 รายการเท่านั้น', 'one and only one'], '0,1': ['0 หรือ 1 รายการ', 'zero or one'], '1,M': ['1 รายการขึ้นไป', 'one or many'], '0,M': ['0 รายการขึ้นไป', 'zero or many'] };
  const RKEYS = ['1,1', '0,1', '1,M', '0,M'];
  const U = x => `<u>${x}</u>`;

  const items = [
    /* ---- keys ---- */
    { type: 'mcq', q: 'ในตาราง STUDENT ฟิลด์ AdvID มีค่าตรงกับ PK ของตาราง ADVISOR AdvID ใน STUDENT เป็น key ชนิดใด',
      fig: T('STUDENT', ['StdID', 'Name', 'AdvID'], [['6501', 'สมชาย', 'A1'], ['6502', 'สมหญิง', 'A1'], ['6503', 'มานี', 'A2']], [0]) + '<div style="height:12px"></div>' + T('ADVISOR', ['AdvID', 'AdvName'], [['A1', 'ผศ.ดวงใจ'], ['A2', 'อ.ประสิทธิ์']], [0]),
      opts: ['Primary key', 'Candidate key', 'Foreign key', 'Secondary key'], a: 2,
      whyWrong: { 0: 'PK ของ STUDENT คือ StdID ส่วน AdvID ซ้ำได้ (A1 อยู่ 2 แถว) จึงเป็น PK ไม่ได้', 1: 'candidate key ต้องไม่ซ้ำเหมือน PK แต่ AdvID มีค่า A1 ซ้ำกัน', 3: 'secondary key คือ field ที่ใช้ค้นหา ไม่ได้มีหน้าที่ชี้ไปหาตารางอื่น' },
      why: 'AdvID ใน STUDENT ต้องตรงกับ PK (AdvID) ของ ADVISOR เพื่อเชื่อมสองตาราง นั่นคือหน้าที่ของ foreign key และมันซ้ำได้เพราะอาจารย์ที่ปรึกษาหนึ่งคนดูแลนักศึกษาหลายคน' },
    { type: 'mcq', q: 'ห้องสมุดค้นหนังสือตามชื่อผู้แต่ง (Author) บ่อยมาก และหนังสือหลายเล่มมีผู้แต่งคนเดียวกัน Author ทำหน้าที่เป็น key ชนิดใด',
      opts: ['Primary key', 'Candidate key', 'Foreign key', 'Secondary key'], a: 3,
      whyWrong: { 0: 'PK ต้องไม่ซ้ำ แต่ผู้แต่งคนเดียวมีหลายเล่ม', 1: 'candidate key ต้องไม่ซ้ำจึงเป็น PK ได้ Author ซ้ำได้', 2: 'ไม่ได้ชี้ไปหา PK ของตารางอื่น (ถ้ามีตาราง AUTHOR แยก ค่อยใช้ AuthorID เป็น FK)' },
      why: 'secondary key คือ field หรือกลุ่ม field ที่ใช้เข้าถึงหรือค้นหา record ได้ โดยไม่ต้อง unique ซ้ำได้ตามต้องการ' },
    { type: 'mcq', q: 'ตาราง EMPLOYEE มี EmpID, CitizenID, Email ซึ่งแต่ละตัวไม่ซ้ำกันเลย เลือก EmpID เป็น Primary key แล้ว CitizenID กับ Email เรียกว่าอะไร',
      opts: ['Foreign key', 'Candidate key', 'Secondary key', 'Combination key'], a: 1,
      whyWrong: { 0: 'ไม่ได้ชี้ไปตารางอื่น', 2: 'secondary key ใช้ค้นหาและซ้ำได้ แต่สองตัวนี้ไม่ซ้ำและเป็น PK แทนได้', 3: 'combination key คือ key ที่ต้องใช้หลาย field รวมกัน สองตัวนี้ใช้ field เดียวก็พอ' },
      why: 'candidate key คือ field ที่ทำหน้าที่เป็น PK ได้ ทั้ง EmpID, CitizenID และ Email เป็นตัวเลือกได้หมด เลือกมาหนึ่งตัวเป็น PK ที่เหลือก็ยังเป็น candidate key' },
    { type: 'mcq', q: 'ตาราง STUDENT (StdID, CitizenID, Name) ทั้ง StdID และ CitizenID ไม่ซ้ำ ส่วน Name ซ้ำได้ ข้อใดเป็น Primary key ที่ถูกตามนิยาม (เจาะจงและไม่เกินจำเป็น)',
      opts: ['StdID + CitizenID', 'StdID', 'Name', 'StdID + Name'], a: 1,
      whyWrong: { 0: 'ระบุแถวได้ แต่เกินจำเป็น ตัด CitizenID ออก StdID ก็ยังไม่ซ้ำ จึงไม่ minimal', 2: 'Name ซ้ำได้ ระบุแถวไม่เจาะจง', 3: 'เกินจำเป็นเช่นกัน ตัด Name ออกแล้ว StdID ก็ยังไม่ซ้ำ' },
      why: 'PK ต้อง unique และ minimal StdID ตัวเดียวพอและเล็กที่สุด ถ้าใช้ field เพิ่มแล้วตัวใดตัวหนึ่งตัดออกได้โดยยังไม่ซ้ำ แปลว่าเกินจำเป็น' },

    /* ---- normal forms ---- */
    { type: 'mcq', q: 'ตารางนี้ไม่มี repeating group และมี PK คือ StdID + CourseID ตารางอยู่ถึงรูปที่เท่าไร',
      fig: T('ENROLL_DETAIL', ['StdID', 'CourseID', 'StdName', 'Grade'], [['6501', 'C1', 'สมชาย', 'A'], ['6501', 'C2', 'สมชาย', 'B'], ['6502', 'C1', 'มานี', 'B']], [0, 1]),
      opts: ['UNF', '1NF แต่ไม่ถึง 2NF', '2NF แต่ไม่ถึง 3NF', '3NF'], a: 1,
      whyWrong: { 0: 'ไม่มี repeating group แล้ว จึงผ่าน 1NF', 2: 'ยังไม่ผ่าน 2NF เพราะมี partial dependency', 3: 'ยังไม่ผ่าน 2NF จึงยังไปไม่ถึง 3NF' },
      why: 'StdName ขึ้นกับ StdID อย่างเดียว ซึ่งเป็นแค่ส่วนหนึ่งของ key (StdID + CourseID) นี่คือ partial dependency จึงไม่ผ่าน 2NF (เห็นได้จาก "สมชาย" ถูกเขียนซ้ำ 2 แถว) แก้โดยแยก STUDENT (StdID, StdName)' },
    { type: 'mcq', q: `STUDENT (${U('StdID')}, Name, AdvID, AdvName) อยู่ใน 1NF และ AdvName ขึ้นกับ AdvID ข้อใดถูก`,
      opts: ['ไม่ผ่าน 2NF เพราะ AdvName ขึ้นกับ AdvID', 'ผ่าน 2NF แต่ไม่ผ่าน 3NF เพราะ AdvID → AdvName', 'ผ่าน 3NF', 'ยังไม่ผ่าน 1NF'], a: 1,
      whyWrong: { 0: 'PK มี field เดียว (StdID) จึงไม่มี "บางส่วนของ key" ให้ขึ้นกับ partial dependency เกิดไม่ได้ ตาราง 1NF ที่ PK เดียวผ่าน 2NF อัตโนมัติ', 2: 'AdvName ขึ้นกับ AdvID ซึ่งไม่ใช่ key นั่นคือ non-key → non-key', 3: 'ข้อความบอกแล้วว่าอยู่ใน 1NF' },
      why: 'ผ่าน 2NF โดยอัตโนมัติ (key เดียว) แต่ StdID → AdvID → AdvName เป็นทอด จึงไม่ผ่าน 3NF แยก ADVISOR (AdvID, AdvName) ออก เหลือ AdvID เป็น FK ใน STUDENT' },
    { type: 'mcq', q: 'ข้อใดเป็นตารางที่ยังไม่ normalize (UNF)',
      opts: [`STUDENT (${U('StdID')}, Name, Major)`, `STUDENT (${U('StdID')}, Name, { ${U('CourseID')}, CourseName, Grade })`, `ENROLL (${U('StdID')}, ${U('CourseID')}, Grade)`, `COURSE (${U('CourseID')}, CourseName)`], a: 1,
      whyWrong: { 0: 'ไม่มีชุด field ที่ซ้ำได้', 2: 'นี่คือผลหลังแปลงเป็น 1NF แล้ว (แต่ละแถวคือการลงหนึ่งวิชา)', 3: 'ไม่มีชุด field ที่ซ้ำได้' },
      why: 'ชุด { CourseID, CourseName, Grade } อยู่ในวงเล็บปีกกา แปลว่านักศึกษาหนึ่งคนมีได้หลายชุดในแถวเดียว นั่นคือ repeating group ซึ่งทำให้ตารางเป็น UNF' },
    { type: 'mcq', q: `ABC (ชิ้นส่วน, ชื่อโกดัง, จำนวนสินค้า, ที่อยู่โกดัง) มี PK คือ ชิ้นส่วน + ชื่อโกดัง และที่อยู่โกดังขึ้นกับชื่อโกดัง ควรแยกตารางอย่างไร`,
      opts: ['สินค้า (ชิ้นส่วน, ชื่อโกดัง, จำนวน) และ โกดัง (ชื่อโกดัง, ที่อยู่โกดัง)', 'สินค้า (ชิ้นส่วน, จำนวน) และ โกดัง (ชื่อโกดัง, ที่อยู่โกดัง)', 'สินค้า (ชิ้นส่วน, ที่อยู่โกดัง) และ โกดัง (ชื่อโกดัง, จำนวน)', 'ไม่ต้องแยก ตารางนี้ผ่าน 2NF แล้ว'], a: 0,
      whyWrong: { 1: 'ตัดชื่อโกดังออกจากตารางสินค้า ทำให้ไม่รู้ว่าสินค้านี้อยู่โกดังไหน จำนวนขึ้นกับทั้งชิ้นส่วนและโกดัง จึงต้องอยู่กับ key เต็ม', 2: 'จำนวนขึ้นกับทั้งสองตัว ย้ายไปกับโกดังอย่างเดียวไม่ได้', 3: 'ที่อยู่โกดังขึ้นกับแค่ชื่อโกดัง (ส่วนหนึ่งของ key) จึงยังผิด 2NF' },
      why: 'ที่อยู่โกดังรู้ได้จากชื่อโกดังอย่างเดียว (partial dependency) แยกออกพร้อมชื่อโกดังเป็นตารางใหม่ ส่วนจำนวนสินค้าต้องรู้ทั้งชิ้นส่วนและโกดัง จึงอยู่กับ key เต็ม' },
    { type: 'mcq', q: `ผู้บริหาร (${U('เลขประจำตัว')}, ชื่อนามสกุล, ที่อยู่, ตำแหน่ง, ยี่ห้อรถประจำตำแหน่ง) ยี่ห้อรถขึ้นกับตำแหน่ง ตารางนี้ผิดข้อใด และแก้อย่างไร`,
      opts: ['ผิด 2NF แยกยี่ห้อรถออกพร้อมเลขประจำตัว', 'ผิด 3NF แยกตำแหน่งกับยี่ห้อรถเป็นตำแหน่งบริหาร (ตำแหน่ง, ยี่ห้อรถ)', 'ผิด 1NF แยกที่อยู่ออกเป็นตารางใหม่', 'ไม่ผิด เพราะ ตำแหน่ง เป็นส่วนหนึ่งของข้อมูลผู้บริหาร'], a: 1,
      whyWrong: { 0: 'PK มี field เดียว จึงไม่มี partial dependency ผิด 2NF ไม่ได้', 2: 'ไม่มี repeating group จึงผ่าน 1NF ที่อยู่ไม่ใช่ปัญหา', 3: 'ปัญหาคือยี่ห้อรถขึ้นกับตำแหน่ง ซึ่งไม่ใช่ key ผู้บริหารหลายคนที่ตำแหน่งเดียวกันจะถูกเขียนยี่ห้อรถซ้ำ' },
      why: 'เลขประจำตัว → ตำแหน่ง → ยี่ห้อรถ เป็น non-key → non-key (transitive) ผิด 3NF แยกเป็น ผู้บริหาร (เลขประจำตัว, ชื่อนามสกุล, ที่อยู่, ตำแหน่ง) และ ตำแหน่งบริหาร (ตำแหน่ง, ยี่ห้อรถ) เหลือตำแหน่งเป็น FK' },
    { type: 'mcq', q: `ORDER (${U('OrderNo')}, OrderDate, CustID, CustName) CustName ขึ้นกับ CustID ตารางนี้ผิดข้อใด`,
      opts: ['ผิด 1NF เพราะมีข้อมูลลูกค้าปนอยู่', 'ผิด 2NF เพราะ CustName ขึ้นกับบางส่วนของ key', 'ผิด 3NF เพราะ CustID → CustName (non-key → non-key)', 'ไม่ผิดข้อใดเลย'], a: 2,
      whyWrong: { 0: 'ไม่มี repeating group จึงผ่าน 1NF', 1: 'PK คือ OrderNo field เดียว ไม่มี "บางส่วนของ key" partial dependency เกิดไม่ได้', 3: 'ลูกค้าเดียวที่มีหลาย order จะถูกเขียนชื่อซ้ำทุกใบ และแก้ชื่อต้องแก้หลายแถว' },
      why: 'ผ่าน 1NF และ 2NF (key เดียว) แต่ OrderNo → CustID → CustName เป็นทอด ผิด 3NF แยก CUSTOMER (CustID, CustName) เหลือ CustID เป็น FK ใน ORDER' },
    { type: 'mcq', q: `PRODUCT (${U('ProdID')}, ProdName, Price) ควรแยก Price ออกเป็นตารางต่างหากเพื่อให้เป็น 3NF หรือไม่`,
      opts: ['ควรแยก เพราะทุก field ควรมีตารางของตัวเอง', 'ควรแยก เพราะ Price เป็นตัวเลข ProdName เป็นข้อความ', 'ไม่ต้อง ตารางนี้เป็น 3NF อยู่แล้ว', 'ไม่ต้องแยก แต่ต้องเพิ่ม Price เป็น PK ด้วย'], a: 2,
      whyWrong: { 0: 'การแยกต้องมีเหตุผลจาก dependency ไม่ใช่แยกทุก field', 1: 'ชนิดข้อมูลไม่เกี่ยวกับ normalization', 3: 'Price ซ้ำได้ (สินค้าสองอย่างราคาเท่ากัน) ใช้เป็น key ไม่ได้' },
      why: 'ProdName และ Price ขึ้นกับ ProdID ซึ่งเป็น key โดยตรงทั้งคู่ ไม่มี non-key ตัวไหนขึ้นกับ non-key ตัวอื่น จึงเป็น 3NF แล้ว การแยกเพิ่มโดยไม่มี dependency ที่ผิดจะสร้างตารางเกินจำเป็น' },

    /* ---- design principle ---- */
    { type: 'mcq', q: `ORDER_LINE (${U('OrderNo')}, ${U('ProdID')}, Qty, UnitPrice, LineTotal) โดย LineTotal = Qty × UnitPrice ตามหลักออกแบบฐานข้อมูลของอาจารย์ ควรทำอย่างไร`,
      opts: ['เก็บ LineTotal ไว้ จะได้ดึงไปแสดงได้เร็ว', 'ตัด LineTotal ออก แล้วคำนวณตอนแสดงผล', 'ตัด Qty ออก เพราะหาได้จาก LineTotal ÷ UnitPrice', 'ย้าย LineTotal ไปเป็น PK'], a: 1,
      whyWrong: { 0: 'ค่าที่คำนวณได้ถ้าเก็บไว้ อาจไม่ตรงกับ Qty และ UnitPrice เมื่อมีใครแก้ตัวใดตัวหนึ่ง', 2: 'Qty เป็นข้อมูลต้นทาง ตัวที่ต้องตัดคือค่าที่คำนวณ', 3: 'LineTotal ไม่ได้ระบุแถว (หลายแถวมียอดเท่ากันได้)' },
      why: 'หลักข้อ 5: ไม่เก็บค่าที่มาจากการคำนวณ (และข้อ 4: เก็บค่าเฉพาะเท่าที่จำเป็น) LineTotal = Qty × UnitPrice คำนวณได้เมื่อต้องการ' },

    /* ---- relationships ---- */
    { type: 'mcq', q: 'แผนกหนึ่งมีพนักงานได้หลายคน พนักงานหนึ่งคนอยู่ได้แผนกเดียว (DEPARTMENT 1 : M EMPLOYEE) ต้องเพิ่ม FK ในตารางใด',
      opts: ['DEPARTMENT เพิ่ม field EmpID', 'EMPLOYEE เพิ่ม field DeptID', 'ทั้งสองตาราง เพิ่มกันคนละตัว', 'สร้างตารางที่สามคั่นกลางเสมอ'], a: 1,
      whyWrong: { 0: 'แผนกหนึ่งมีพนักงานหลายคน EmpID ใน DEPARTMENT จะต้องเก็บหลายค่าในช่องเดียว กลายเป็น repeating group', 2: 'FK ใส่ที่ฝั่ง many ฝั่งเดียวพอ', 3: 'ตารางคั่นกลางใช้กับ M:N เท่านั้น 1:M ไม่ต้อง' },
      why: 'FK อยู่ที่ตารางฝั่ง many (EMPLOYEE) ชี้ไปหา PK ของฝั่ง 1 (DEPARTMENT) พนักงานแต่ละคนจึงเก็บ DeptID ของแผนกเดียวที่ตนสังกัด' },
    { type: 'mcq', q: 'นักศึกษาลงทะเบียนได้หลายวิชา วิชาหนึ่งมีนักศึกษาหลายคน และต้องเก็บเกรดของแต่ละการลงทะเบียน ควรออกแบบอย่างไร',
      opts: ['ใส่ CourseID และ Grade เป็น field ใน STUDENT', 'ใส่ StdID เป็น FK ใน COURSE', 'สร้าง GRADE (StdID, CourseID, Grade) โดย PK คือ StdID + CourseID และทั้งสองเป็น FK', 'สร้าง GRADE (GradeNo, Grade) แยกโดยไม่เชื่อม STUDENT หรือ COURSE'], a: 2,
      whyWrong: { 0: 'นักศึกษาหนึ่งคนลงหลายวิชา จะต้องมี CourseID และ Grade หลายชุดในแถวเดียว (repeating group)', 1: 'วิชาหนึ่งมีนักศึกษาหลายคน StdID ใน COURSE จะเก็บหลายค่าไม่ได้', 3: 'ไม่ได้เชื่อมกับ STUDENT และ COURSE จึงบอกไม่ได้ว่าเกรดของใครวิชาไหน' },
      why: 'M:N ต้องแตกด้วย associative entity GRADE ซึ่งเป็น 1:M กับ STUDENT และ 1:M กับ COURSE เกรดเป็น attribute ของการลงทะเบียนแต่ละครั้ง (คู่ StdID + CourseID)' },

    /* ---- cardinality ---- */
    { type: 'mcq', q: 'ตามผังด้านล่าง ORDER หนึ่งใบเป็นของ CUSTOMER ได้กี่คน',
      fig: erd('CUSTOMER', 'ORDER', [1, 1], [0, 'M'], 'places'),
      opts: ['0 หรือ 1 คน', '1 คนเท่านั้น', '1 คนขึ้นไป', '0 คนขึ้นไป'], a: 1,
      whyWrong: { 0: 'ขีดสองขีดไม่มีวงกลม จึงไม่ใช่ศูนย์', 2: 'ไม่มีตีนกาที่ฝั่ง CUSTOMER จึงไม่ใช่หลาย', 3: 'นี่คือสัญลักษณ์ของฝั่ง ORDER (บอกว่าลูกค้าหนึ่งคนมี ORDER ได้กี่ใบ) อ่านสลับฝั่ง' },
      why: 'สัญลักษณ์ที่ติดกล่องไหนบอกจำนวนของกล่องนั้น ติด CUSTOMER = ขีดสองขีด = one and only one ORDER หนึ่งใบมีเจ้าของได้คนเดียวพอดี ส่วนวงกลม + ตีนกาที่ติด ORDER บอกว่า CUSTOMER หนึ่งคนมี ORDER ได้ 0 ใบขึ้นไป' },
    { type: 'mcq', q: 'ตามผังด้านล่าง พนักงาน (EMPLOYEE) หนึ่งคนมี SPOUSE ได้กี่คน',
      fig: erd('EMPLOYEE', 'SPOUSE', [1, 1], [0, 1], 'has'),
      opts: ['1 คนเท่านั้น', '0 หรือ 1 คน', '0 คนขึ้นไป', '1 คนขึ้นไป'], a: 1,
      whyWrong: { 0: 'ฝั่ง SPOUSE มีวงกลม แปลว่าขั้นต่ำเป็นศูนย์ พนักงานโสดไม่มี SPOUSE ก็ได้', 2: 'ไม่มีตีนกา จึงไม่ใช่หลาย', 3: 'ไม่มีตีนกา และมีวงกลม' },
      why: 'ติด SPOUSE = วงกลม + ขีด = zero or one พนักงานหนึ่งคนมีคู่สมรสได้ 0 หรือ 1 คน ส่วนติด EMPLOYEE = one and only one คู่สมรสหนึ่งคนเป็นของพนักงานคนเดียว' },
    { type: 'mcq', q: 'ตามผังด้านล่าง ORDER ที่ยังไม่มี ITEM ORDERED สักรายการ มีได้หรือไม่',
      fig: erd('ORDER', 'ITEM ORDERED', [1, 1], [1, 'M'], 'includes'),
      opts: ['ได้ เพราะตีนกาแปลว่าหลาย รวมศูนย์ด้วย', 'ไม่ได้ ต้องมีอย่างน้อย 1 รายการ', 'ได้ เพราะ ORDER เป็นฝั่ง 1', 'ไม่ได้ เพราะแต่ละ ORDER มีได้เพียง 1 รายการ'], a: 1,
      whyWrong: { 0: 'ตีนกาบอกว่าหลาย แต่ขั้นต่ำดูจากขีดที่อยู่ถัดออกมา ขีด = อย่างน้อย 1 ถ้าจะให้เป็นศูนย์ต้องเป็นวงกลม', 2: 'ฝั่งที่ติด ITEM ORDERED เป็นตัวบอกจำนวนรายการ ไม่เกี่ยวกับว่า ORDER เป็นฝั่ง 1', 3: 'มีตีนกา แปลว่าหลายรายการได้' },
      why: 'ขีด + ตีนกา = one or many ขั้นต่ำ 1 ขั้นสูงหลาย ORDER ต้องมีสินค้าอย่างน้อยหนึ่งรายการ' },
    { type: 'gen', make() {
      const S = [['CUSTOMER', 'ORDER', 'places'], ['DEPARTMENT', 'EMPLOYEE', 'employs'], ['PATIENT', 'APPOINTMENT', 'makes'], ['AUTHOR', 'BOOK', 'writes'], ['PROJECT', 'TASK', 'contains'], ['TEACHER', 'COURSE', 'teaches']];
      const s = S[Math.floor(Math.random() * S.length)];
      const ka = RKEYS[Math.floor(Math.random() * 4)], kb = RKEYS[Math.floor(Math.random() * 4)];
      const mk = k => [+k[0], k[2] === 'M' ? 'M' : 1];
      const dir = Math.random() < .5 ? 'b' : 'a'; // which end the question reads
      const T1 = dir === 'b' ? s[1] : s[0], S1 = dir === 'b' ? s[0] : s[1], key = dir === 'b' ? kb : ka;
      const opts = RKEYS.map(k => RNG[k][0]);
      return { type: 'mcq', q: `จากผังด้านล่าง ${S1} 1 รายการ เกี่ยวข้องกับ ${T1} ได้กี่รายการ`, fig: erd(s[0], s[1], mk(ka), mk(kb), s[2]), opts, a: RKEYS.indexOf(key),
        whyWrong: Object.fromEntries(RKEYS.map((k, i) => [i, `ตัวเลือกนี้คือ ${RNG[k][1]} ซึ่งไม่ตรงกับสัญลักษณ์ที่ติดกล่อง ${T1}`])),
        why: `ต้องอ่านสัญลักษณ์ที่ติดกล่อง ${T1} (ฝั่ง${dir === 'b' ? 'ขวา' : 'ซ้าย'}) สัญลักษณ์นั้นคือ ${RNG[key][1]} แปลว่า ${RNG[key][0]} ไม่ใช่สัญลักษณ์ที่ติดกล่อง ${S1}` };
    } },

    /* ---- referential integrity ---- */
    { type: 'mcq', q: 'เปิด referential integrity ไว้ สั่งลบ CUSTOMER C1 ซึ่งมี ORDER 501 และ 502 อ้างถึงอยู่ ผลเป็นอย่างไร',
      fig: T('CUSTOMER', ['CustID', 'Name'], [['C1', 'สมชาย'], ['C2', 'มานี']], [0]) + '<div style="height:12px"></div>' + T('ORDER', ['OrderNo', 'CustID'], [['501', 'C1'], ['502', 'C1'], ['503', 'C2']], [0]),
      opts: ['ลบสำเร็จ และ ORDER 501, 502 ยังอยู่โดยไม่มีเจ้าของ', 'ระบบปฏิเสธการลบ เพราะยังมี ORDER อ้างถึง C1 อยู่', 'ลบสำเร็จ และเปลี่ยน CustID ใน ORDER 501, 502 เป็นค่าว่าง', 'ลบได้เฉพาะตอนที่ลบ ORDER 503 ก่อน'], a: 1,
      whyWrong: { 0: 'นี่คือสิ่งที่เกิดเมื่อ ไม่ บังคับ referential integrity (ได้ record กำพร้า)', 2: 'ไม่ใช่กฎของ RI ที่สไลด์สอน RI แค่ห้ามให้เกิด FK ที่ไม่มีแม่', 3: '503 เป็นของ C2 ไม่เกี่ยวกับ C1 ต้องจัดการ 501 และ 502' },
      why: 'ค่า FK ต้องชี้ถึง PK ที่มีอยู่จริงเสมอ ลบแม่ที่ยังมีลูก (501, 502 ของ C1) ไม่ได้ ต้องเคลียร์ลูกก่อน' },
    { type: 'mcq', q: 'มี CUSTOMER เฉพาะ C1, C2, C3 เปิด referential integrity อยู่ สั่งเพิ่ม ORDER 504 ที่ CustID = C9 ผลเป็นอย่างไร',
      opts: ['เพิ่มได้ และระบบสร้างลูกค้า C9 ให้เอง', 'เพิ่มได้ แต่ ORDER 504 ไม่มีเจ้าของ', 'ระบบปฏิเสธ เพราะ C9 ไม่มีใน CUSTOMER', 'ระบบปฏิเสธ เพราะ CustID ซ้ำกับ ORDER อื่น'], a: 2,
      whyWrong: { 0: 'RI ไม่สร้างข้อมูลให้เอง มันแค่ปฏิเสธ', 1: 'ผลแบบนี้เกิดตอนปิดกฎ RI', 3: 'CustID ใน ORDER เป็น FK ซ้ำได้ (ลูกค้าคนเดียวมีหลาย order)' },
      why: 'ลูก (ORDER) ต้องมีแม่ (CUSTOMER) อยู่จริง C9 ไม่มีใน CUSTOMER การเพิ่มจึงถูกปฏิเสธ และปัญหาจริงที่ต้องแยกให้ออก: CustID ใน ORDER ซ้ำได้เพราะเป็น FK ไม่ใช่ PK' },

    /* ---- DBMS ---- */
    { type: 'mcq', q: 'ส่วนใดของ DBMS ที่เป็นคำอธิบายของทุก field ทุกตาราง และทุกความสัมพันธ์ในฐานข้อมูล',
      opts: ['Schema', 'Subschema', 'DML', 'Physical data repository'], a: 0,
      whyWrong: { 1: 'subschema คือเฉพาะบางส่วนที่ระบบหรือผู้ใช้คนหนึ่งเห็น ไม่ใช่ทั้งหมด', 2: 'DML คือส่วนที่ควบคุมการดำเนินการกับข้อมูล (เพิ่ม แก้ ลบ ค้น)', 3: 'repository คือที่เก็บข้อมูลจริง (รวม schema และ subschema ไว้ในนั้น)' },
      why: 'schema = คำอธิบายภาพรวมทั้งหมด ส่วน subschema = ส่วนที่คนหนึ่งเห็นหรือได้รับอนุญาต' },
    { type: 'mcq', q: 'ฝ่ายขายเห็นได้แค่ตาราง CUSTOMER กับ ORDER ตารางเงินเดือนไม่โผล่ให้เห็นเลย เป็นผลจากส่วนใดของ DBMS',
      opts: ['Schema', 'Subschema', 'ODBC', 'Data warehouse'], a: 1,
      whyWrong: { 0: 'schema คือคำอธิบายของทุกตารางทั้งหมด ถ้าเห็นตาม schema ก็เห็นเงินเดือนด้วย', 2: 'ODBC ช่วยให้ระบบต่างๆ คุยกับ DBMS ต่างยี่ห้อได้ ไม่เกี่ยวกับการจำกัดสิ่งที่เห็น', 3: 'data warehouse คือคลังข้อมูลรวมสำหรับวิเคราะห์ ไม่ใช่ส่วนของ DBMS' },
      why: 'subschema คือส่วนของฐานข้อมูลที่ระบบหรือผู้ใช้หนึ่งต้องการหรือได้รับอนุญาตให้เข้าถึง จึงใช้จำกัดสิ่งที่แต่ละกลุ่มเห็นได้ (security)' },
    { type: 'mcq', q: 'ต้องการให้ระบบหน้าเว็บ (HTML) ดึงและแก้ข้อมูลในฐานข้อมูลได้ ควรใช้อะไรคั่นกลาง',
      opts: ['Middleware', 'ODBC', 'DML', 'Subschema'], a: 0,
      whyWrong: { 1: 'ODBC เป็นมาตรฐานให้ระบบกับ DBMS ต่างยี่ห้อคุยกันได้ แต่ไม่ใช่ตัวเชื่อมเว็บกับฐานข้อมูลโดยตรงตามสไลด์', 2: 'DML คือส่วนใน DBMS ที่ควบคุมการทำงานกับข้อมูล ไม่ได้อยู่ระหว่างเว็บกับ DBMS', 3: 'subschema คือส่วนของข้อมูลที่ผู้ใช้เห็นได้' },
      why: 'ฐานข้อมูลสร้างและจัดการด้วยภาษาและคำสั่งที่ไม่เกี่ยวกับ HTML ต้องใช้ middleware ซึ่งเชื่อมแอปพลิเคชันต่างชนิดให้แลกเปลี่ยนข้อมูลกันได้' },

    /* ---- warehouse / mart / mining ---- */
    { type: 'mcq', q: 'บริษัทต้องการรวมข้อมูลจากระบบขาย ระบบบัญชี และระบบซ่อมไว้ที่เดียว เพื่อให้ผู้บริหารวิเคราะห์ได้ทั้งบริษัท โดยไม่ต้องรู้ว่าข้อมูลเก็บที่ไหน',
      opts: ['Data warehouse', 'Data mart', 'Data mining', 'Referential integrity'], a: 0,
      whyWrong: { 1: 'data mart ออกแบบให้แผนกเดียวใช้ ไม่ใช่ทั้งบริษัท', 2: 'data mining คือการหา pattern ในข้อมูล ไม่ใช่ที่เก็บข้อมูล', 3: 'RI เป็นกฎเรื่อง FK ไม่เกี่ยวกับการรวมข้อมูลหลายระบบ' },
      why: 'data warehouse คือชุดข้อมูลรวมที่ดึงจากหลายระบบ ผู้ใช้เลือกมิติแล้วดึงข้อมูลได้โดยไม่ต้องรู้ว่าเก็บที่ไหน' },
    { type: 'mcq', q: 'ฝ่ายการตลาดต้องการคลังข้อมูลที่เก็บเฉพาะส่วนที่ฝ่ายตนใช้ ขนาดเล็กและค้นเร็ว',
      opts: ['Data warehouse', 'Data mart', 'Data mining', 'Schema'], a: 1,
      whyWrong: { 0: 'warehouse คือคลังของทั้งบริษัท ใหญ่กว่าที่ฝ่ายเดียวต้องการ', 2: 'mining คือการวิเคราะห์หา pattern ไม่ใช่คลังเก็บข้อมูล', 3: 'schema คือคำอธิบายโครงสร้างฐานข้อมูล' },
      why: 'data mart คือคลังข้อมูลที่ออกแบบมาตอบความต้องการของแผนกใดแผนกหนึ่งโดยเฉพาะ' },
    { type: 'mcq', q: 'ร้านค้าออนไลน์วิเคราะห์ข้อมูล clickstream ของผู้เข้าชม เพื่อหาว่าลูกค้าคลิกหน้าไหนบ้างก่อนซื้อ และจะลดจำนวนคลิกกว่าจะปิดการขายได้อย่างไร นี่คืออะไร',
      opts: ['Data warehouse', 'Data mart', 'Data mining', 'Data control'], a: 2,
      whyWrong: { 0: 'warehouse คือที่เก็บข้อมูล ส่วนงานนี้คือการวิเคราะห์ข้อมูลที่เก็บไว้', 1: 'mart คือคลังย่อยของแผนก ไม่ใช่การวิเคราะห์', 3: 'data control คือการควบคุมและรักษาความปลอดภัย' },
      why: 'data mining คือการค้นหา pattern และความสัมพันธ์ที่มีความหมายในข้อมูล สไลด์ยกตัวอย่างเป้าหมายอย่างลดจำนวนคลิกกว่าจะปิดการขาย' },

    /* ---- data control + file processing ---- */
    { type: 'mcq', q: 'ฮาร์ดดิสก์เสียทำให้ฐานข้อมูลหาย บริษัทเตรียมสำเนาไว้ก่อนหน้า ขั้นตอนที่นำสำเนากลับมาใช้งานเรียกว่าอะไร',
      opts: ['Backup', 'Recovery', 'Encryption', 'Audit log'], a: 1,
      whyWrong: { 0: 'backup คือการเตรียมสำเนาไว้ก่อน (สิ่งที่ทำไว้แล้วในโจทย์) ไม่ใช่ขั้นตอนนำกลับมา', 2: 'encryption คือการเข้ารหัสข้อมูลกันคนอื่นอ่าน', 3: 'audit log คือบันทึกว่าใครทำอะไรเมื่อไหร่' },
      why: 'backup คือสำเนาที่เก็บไว้ตามเวลาที่กำหนด recovery คือขั้นตอนใช้สำเนานั้นคืนไฟล์หรือฐานข้อมูล' },
    { type: 'mcq', q: 'คนร้ายขโมยไฟล์ฐานข้อมูลของบริษัทไปทั้งไฟล์ แต่เปิดอ่านเนื้อหาไม่ได้ เพราะบริษัทใช้กลไกใด',
      opts: ['User ID และ password', 'Encryption', 'Backup', 'Subschema'], a: 1,
      whyWrong: { 0: 'password กันตอนเข้าระบบ แต่ถ้าได้ตัวไฟล์ไปแล้วไม่ต้องผ่านด่านนั้น', 2: 'backup ช่วยกู้ข้อมูล ไม่ได้กันการอ่าน', 3: 'subschema จำกัดสิ่งที่ผู้ใช้ผ่าน DBMS เห็น ไม่ได้ปกป้องตัวไฟล์ที่ถูกขโมย' },
      why: 'encryption แปลงข้อมูลให้อ่านไม่ออกถ้าไม่มีกุญแจถอดรหัส แม้ได้ไฟล์ไปก็อ่านไม่ได้' },
    { type: 'mcq', q: 'ร้านของ Mario ใช้สองระบบแยกไฟล์กัน ลูกค้าเปลี่ยนเบอร์โทร พนักงานแก้เฉพาะระบบรับซ่อม ปัญหาใดเกิดขึ้น',
      opts: ['ข้อมูลซ้ำซ้อนในสองไฟล์ จึงไม่ตรงกัน', 'Referential integrity ถูกละเมิด', 'ละเมิด 2NF เพราะ partial dependency', 'Data independence เสียหาย'], a: 0,
      whyWrong: { 1: 'RI เป็นเรื่อง FK ที่ชี้ไปหา PK ไม่เกี่ยวกับการเก็บข้อมูลเดียวกันซ้ำสองที่', 2: 'normal form เป็นเรื่องออกแบบตารางภายในฐานข้อมูล ตรงนี้คือเก็บข้อมูลเดียวกันซ้ำในสองระบบ', 3: 'data independence คือการที่ระบบไม่ผูกกับวิธีเก็บข้อมูลจริง ไม่เกี่ยวกับกรณีนี้' },
      why: 'file processing เก็บข้อมูลลูกค้าคนเดียวกันซ้ำในหลายไฟล์ (redundancy) แก้ไฟล์เดียวอีกไฟล์ยังเป็นเบอร์เก่า ข้อมูลสองที่จึงไม่ตรงกัน ฐานข้อมูลแก้ด้วยการเก็บครั้งเดียวแล้วแชร์' },

    /* ---- numbers ---- */
    { type: 'gen', make() {
      const n = 3 + Math.floor(Math.random() * 3), ks = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 3));
      if (ks.every(k => k === 1)) ks[0] = 3;
      const tot = ks.reduce((a, b) => a + b, 0);
      const names = ks.map((k, i) => `AP-${i + 1} มี ${k} หัตถการ`);
      return { type: 'num', q: `ตาราง UNF ของคลินิกมีนัดหมาย ${n} นัด (1 นัดต่อ 1 record) แต่ละนัดมี repeating group ของหัตถการดังนี้: ${names.join(', ')} เมื่อแปลงเป็น 1NF โดยแตกเป็นแถวละหนึ่งหัตถการ จะมีกี่ record`, a: tot, unit: 'record',
        why: `ใน 1NF แต่ละหัตถการกลายเป็นหนึ่งแถว และ key ขยายเป็น ApptNo + ProcID รวมทุกนัดได้ ${ks.join(' + ')} = ${tot} record`,
        work: [{ t: 'ขั้นนี้ แตก repeating group เป็นแถวละหนึ่งหัตถการ', note: true }, ...ks.map((k, i) => ({ t: `AP-${i + 1}: ${k} หัตถการ → ${k} แถว` })), { t: `รวม = ${ks.join(' + ')} = ${tot} record` }, { t: 'PK ใหม่ = ApptNo + ProcID', note: true }] };
    } },
  ];
  Spec.bank('data', items);
})();
