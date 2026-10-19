// Spec practice engine: one question per screen, big letter tiles or a number box, feedback sheet, worked answer.
// Banks register with Spec.bank(id, items). Item types:
//   { type:'mcq', q, fig?, opts:[html], a, why, whyWrong:{i:html} }
//   { type:'num', q, fig?, a:number, tol?:number, unit?:string, why, work:[{t|html, note?}] }
//   { type:'gen', make: () => mcq|num item }   (randomised each time it is drawn)
const Spec = (() => {
  const { el, $, $$, esc, icon, shuffle } = Hop;
  const BANKS = {};
  const bank = (id, items) => { BANKS[id] = items; };

  function norm(x) { return parseFloat(String(x).replace(/[,\s]/g, '').replace('−', '-')); }

  // run(host, items, {title, onDone})
  function run(host, items, opts = {}) {
    let order = shuffle(items.map((_, i) => i)), pos = 0, score = 0, wrong = [];
    const card = el('div', { class: 'qz' });
    host.replaceChildren(card);

    function draw() {
      if (pos >= order.length) return end();
      let it = items[order[pos]];
      if (it.type === 'gen') it = it.make();
      const dots = el('div', { class: 'qz-dots' }, order.map((_, i) => el('i', { class: i < pos ? 'done' : i === pos ? 'now' : '' })));
      const top = el('div', { class: 'qz-top' }, el('span', { class: 'mono', text: `${pos + 1} / ${order.length}` }), dots);
      const body = el('div', { class: 'qz-body' });
      body.append(el('div', { class: 'qz-q', html: it.q }));
      if (it.fig) body.append(el('div', { class: 'qz-fig', html: it.fig }));
      const zone = el('div', { class: 'qz-zone' });
      body.append(zone);
      const fb = el('div', { class: 'qz-fb' });
      let answered = false;

      function finish(ok, picked) {
        answered = true; if (ok) score++; else wrong.push(order[pos]);
        const extra = (!ok && it.whyWrong && it.whyWrong[picked]) ? `<p>${it.whyWrong[picked]}</p>` : '';
        fb.className = 'qz-fb on ' + (ok ? 'good' : 'bad');
        fb.innerHTML = `<div class="h">${ok ? icon('check') + 'ถูกต้อง' : icon('x') + 'ยังไม่ใช่'}</div>${extra}${it.why ? `<p>${it.why}</p>` : ''}`;
        if (it.work && it.work.length) {
          const wHost = el('div', { class: 'qz-work' });
          const wb = el('button', { class: 'btn small', html: `${icon('eye')} ดูวิธีทำ`, onclick: () => { wb.remove(); Hop.work(wHost, it.work); } });
          fb.append(wb, wHost);
        }
        fb.append(el('button', { class: 'btn primary qz-next', html: `${pos + 1 < order.length ? 'ข้อต่อไป' : 'ดูผล'} ${icon('arrow')}`, onclick: () => { pos++; draw(); window.scrollTo({ top: host.offsetTop - 80, behavior: 'smooth' }); } }));
        requestAnimationFrame(() => fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
      }

      if (it.type === 'num') {
        const f = el('input', { class: 'field', inputmode: 'decimal', autocomplete: 'off', placeholder: 'ใส่ตัวเลข' });
        const go = el('button', { class: 'btn primary', text: 'ตรวจ' });
        const check = () => {
          if (answered) return; const v = norm(f.value); if (isNaN(v)) { f.focus(); return; }
          const ok = Math.abs(v - it.a) <= (it.tol ?? 0.005 * Math.max(1, Math.abs(it.a)));
          f.classList.add(ok ? 'ok' : 'no'); f.disabled = true; go.remove();
          if (!ok) zone.append(el('div', { class: 'qz-ans', html: `คำตอบ <b class="mono">${it.show || Number(it.a).toLocaleString('en-US', { maximumFractionDigits: 4 })}</b>${it.unit ? ' ' + esc(it.unit) : ''}` }));
          finish(ok);
        };
        go.onclick = check; f.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
        zone.append(el('div', { class: 'qz-num' }, f, it.unit ? el('span', { class: 'u', text: it.unit }) : null, go));
      } else {
        const tiles = el('div', { class: 'opts' });
        it.opts.forEach((o, i) => {
          const b = el('button', { class: 'tile', html: `<span class="L">${'ABCDEF'[i]}</span><span>${o}</span>` });
          b.onclick = e => {
            if (answered || e.target.closest('[data-k]')) return;
            $$('.tile', tiles).forEach((x, j) => x.classList.add(j === it.a ? 'right' : j === i ? 'wrong' : 'dim'));
            finish(i === it.a, i);
          };
          tiles.append(b);
        });
        zone.append(tiles);
      }
      card.replaceChildren(top, body, fb);
      card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');
    }

    function end() {
      const pct = Math.round(score / order.length * 100);
      const box = el('div', { class: 'qz-end' },
        el('div', { class: 'big mono', text: `${score}/${order.length}` }),
        el('p', { text: pct === 100 ? 'ครบทุกข้อ' : pct >= 70 ? 'เกือบครบแล้ว ลองทำข้อที่พลาดอีกรอบ' : 'กลับไปอ่านบทเรียนส่วนที่พลาด แล้วลองใหม่' }));
      const row = el('div', { class: 'ctrls' });
      if (wrong.length) row.append(el('button', { class: 'btn primary', html: `${icon('replay')} ทำข้อที่พลาด (${wrong.length})`, onclick: () => { order = shuffle(wrong); wrong = []; pos = 0; score = 0; draw(); } }));
      row.append(el('button', { class: 'btn', html: `${icon('shuffle')} สุ่มใหม่ทั้งชุด`, onclick: () => { order = shuffle(items.map((_, i) => i)); wrong = []; pos = 0; score = 0; draw(); } }));
      box.append(row);
      card.replaceChildren(box);
      if (opts.onDone) opts.onDone(score, order.length);
    }
    draw();
  }
  return { bank, BANKS, run };
})();
