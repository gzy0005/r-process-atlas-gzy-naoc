'use strict';
let data, filtered = [], page = 0, sortKey = 'name', sortAsc = true, recordMap, figure;
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const numeric = x => typeof x === 'number' && Number.isFinite(x);
const fmt = (x, n = 2) => numeric(x) ? x.toFixed(n) : '—';
const safeURL = u => /^https?:\/\//i.test(u || '') ? u : '#';
const labels = {feh:'[Fe/H] (dex)',eu:'[Eu/Fe] (dex)',ba_eu:'[Ba/Eu] (dex)',teff:'Teff (K)',logg:'log g (dex)'};
const classes = {'r-I':{label:'r-I',color:'#087f83'},'r-II':{label:'r-II',color:'#7761ab'},boundary:{label:'阈值边界',color:'#b9822e'},unavailable:{label:'待判定',color:'#84939a'},outside:{label:'不满足阈值',color:'#bd654a'}};
const sourceColors = {RPA:'#087e8b',Other:'#bf6d3d'};
const basisLabels = {'primary publication':'原文分类','Shank2023 compilation':'Shank (2023) 文献汇编','author criteria applied':'依原作者准则计算',explicit_author_statement:'原文明确证认'};
const classLabel = c => classes[c]?.label || c || '待判定';
const starKey = s => s.star_id + '|' + s.group;
const values = s => s.record_ids.map(id => recordMap.get(id)).filter(Boolean);
const clean = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

function recordMatches(r) {
  if ($('source').value && r.source !== $('source').value) return false;
  if ($('class').value && r.r_class !== $('class').value) return false;
  if ($('basis').value === 'primary' && r.classification_basis === 'Shank2023 compilation') return false;
  if ($('basis').value === 'compilation' && r.classification_basis !== 'Shank2023 compilation') return false;
  for (const [id, key, lower] of [['feMin','feh',true],['feMax','feh',false],['euMin','eu',true],['euMax','eu',false]]) {
    const text = $(id).value;
    if (text !== '' && (!numeric(r[key]) || (lower ? r[key] < +text : r[key] > +text))) return false;
  }
  return true;
}
function effectiveStar(s) {
  const q = clean($('search').value);
  if (q && !clean(`${s.name} ${s.aliases} ${s.star_id} ${s.gaia_id}`).includes(q)) return null;
  if ($('group').value && s.group !== $('group').value) return null;
  if ($('overlap').checked && !s.overlap) return null;
  const rr = values(s).filter(recordMatches);
  rr.sort((a,b) => Number(b.classification_basis !== 'Shank2023 compilation') - Number(a.classification_basis !== 'Shank2023 compilation') || Number(b.eu_status === 'point' && b.ba_status === 'point') - Number(a.eu_status === 'point' && a.ba_status === 'point') || (b.year || 0) - (a.year || 0));
  return rr.length ? {...s,...rr[0],aliases:s.aliases,record_ids:s.record_ids} : null;
}
function refresh() {
  filtered = data.stars.map(effectiveStar).filter(Boolean).sort((a,b) => {
    const aa = a[sortKey], bb = b[sortKey];
    if (aa == null) return bb == null ? 0 : 1;
    if (bb == null) return -1;
    return (typeof aa === 'string' ? aa.localeCompare(bb) : aa - bb) * (sortAsc ? 1 : -1);
  });
  page = 0;
  $('resultCount').textContent = `${filtered.length.toLocaleString()} 条代表记录 · ${new Set(filtered.map(s => s.star_id)).size.toLocaleString()} 颗恒星`;
  $('plotCount').textContent = '筛选时重选符合条件的同条文献测量；同星跨来源可保留两条';
  $('classSummary').innerHTML = Object.entries(classes).map(([key,c]) => `<button data-class="${key}" class="summary-chip ${$('class').value === key ? 'selected' : ''}" title="当前显示数量；点击筛选${esc(c.label)}时可换用其他符合条件的文献测量"><i style="background:${c.color}"></i>${esc(c.label)}<b>${filtered.filter(s => s.r_class === key).length}</b></button>`).join('');
  $('classSummary').querySelectorAll('button').forEach(b => b.onclick = () => {$('class').value = $('class').value === b.dataset.class ? '' : b.dataset.class; refresh();});
  draw(); table();
}
function table() {
  $('rows').innerHTML = filtered.slice(page * 15, (page + 1) * 15).map(s => `<tr data-key="${esc(starKey(s))}" tabindex="0"><td><button class="name-button">${esc(s.name)}</button>${s.overlap ? ' <span title="两类来源均有报道">↔</span>' : ''}</td><td><span class="badge ${s.group === 'Other' ? 'other' : ''}">${s.group === 'RPA' ? 'RPA' : '其他'}</span></td><td><span class="class-badge" style="--class-color:${classes[s.r_class]?.color || '#84939a'}" title="${esc(s.uniform_class_note)}">${esc(classLabel(s.r_class))}</span></td><td>${fmt(s.feh)}</td><td>${fmt(s.eu)}</td><td>${fmt(s.ba_eu)}</td><td>${esc(s.source)}${s.classification_basis === 'Shank2023 compilation' ? ' <small title="文献证据来自 Shank2023 汇编">· 汇编</small>' : ''}</td></tr>`).join('') || '<tr><td colspan="7" class="empty">没有符合条件的恒星，请放宽筛选。</td></tr>';
  $('rows').querySelectorAll('tr[data-key]').forEach(tr => {tr.onclick = () => detail(tr.dataset.key); tr.onkeydown = e => {if (e.key === 'Enter') detail(tr.dataset.key);};});
  $('pageInfo').textContent = filtered.length ? `第 ${page + 1} / ${Math.ceil(filtered.length / 15)} 页 · 每页 15 条` : '无结果';
  $('prev').disabled = page === 0;
  $('next').disabled = (page + 1) * 15 >= filtered.length;
}
function ticks(min, max, count) {
  const raw = (max - min) / count, power = 10 ** Math.floor(Math.log10(raw));
  const step = [1,2,2.5,5,10].map(x => x * power).find(x => x >= raw) || power * 10;
  const result = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step / 100; v += step) result.push(Math.abs(v) < step / 100 ? 0 : +v.toPrecision(10));
  return {values:result, step};
}
function hasAxisValue(s, key) {
  return numeric(s[key]) && (key !== 'eu' || s.eu_status === 'point') && (key !== 'ba_eu' || (s.eu_status === 'point' && s.ba_status === 'point'));
}
function draw() {
  if (!data) return;
  hideTooltip();
  const xkey = $('xaxis').value, ykey = $('yaxis').value, colorBy = $('colorBy').value, threshold = $('showThresholds').checked;
  const points = filtered.filter(s => hasAxisValue(s,xkey) && hasAxisValue(s,ykey));
  const W = Math.max(300, Math.round($('plot').clientWidth || 850)), H = W < 500 ? 400 : 470;
  const m = {l:W < 500 ? 65 : 76,r:24,t:34,b:64};
  function extent(key) {
    const vv = points.map(s => s[key]);
    if (threshold && key === 'eu') vv.push(0.3,0.7);
    if (threshold && key === 'ba_eu') vv.push(0);
    let lo = vv.length ? Math.min(...vv) : ({feh:-4,eu:0,ba_eu:-1.5,teff:4000,logg:0})[key];
    let hi = vv.length ? Math.max(...vv) : ({feh:0,eu:2.5,ba_eu:0.5,teff:6500,logg:5})[key];
    const pad = Math.max((hi - lo) * 0.075, key === 'teff' ? 120 : 0.12);
    return [lo - pad, hi + pad];
  }
  const [xmin,xmax] = extent(xkey), [ymin,ymax] = extent(ykey);
  const reverseX = $('reverseX').checked;
  const reverseY = $('reverseY').checked;
  const X = x => m.l + (reverseX ? xmax - x : x - xmin) / (xmax - xmin) * (W - m.l - m.r);
  const Y = y => m.t + (reverseY ? y - ymin : ymax - y) / (ymax - ymin) * (H - m.t - m.b);
  const xt = ticks(xmin,xmax,W < 500 ? 4 : 6), yt = ticks(ymin,ymax,5);
  const tickLabel = (v, step, key) => key === 'teff' ? String(Math.round(v)) : v.toFixed(step < 0.1 ? 2 : 1).replace(/^-0\.0$/, '0.0');
  const rect = (x1,x2,y1,y2,fill) => `<rect x="${Math.min(X(x1),X(x2))}" y="${Math.min(Y(y1),Y(y2))}" width="${Math.abs(X(x2)-X(x1))}" height="${Math.abs(Y(y2)-Y(y1))}" fill="${fill}"/>`;
  let bands = '', refs = '', bandLabels = '';
  if (threshold) {
    if (ykey === 'eu') {
      bands += rect(xmin,xmax,0.3,0.7,'#eef8f5') + rect(xmin,xmax,0.7,ymax,'#f4f1fa');
      if (Math.abs(Y(0.3) - Y(0.7)) > 25) bandLabels += `<text x="${W-m.r-8}" y="${Y(0.5)+4}" text-anchor="end" fill="#488f87">r-I</text>`;
      bandLabels += `<text x="${W-m.r-8}" y="${reverseY ? H-m.b-12 : m.t+18}" text-anchor="end" fill="#8b79b1">r-II</text>`;
    } else if (xkey === 'eu') {
      const upperBa = ykey === 'ba_eu' ? Math.min(0,ymax) : ymax;
      bands += rect(0.3,0.7,ymin,upperBa,'#eef8f5') + rect(0.7,xmax,ymin,upperBa,'#f4f1fa');
      if (ykey === 'ba_eu') bandLabels += `<text x="${X(0.5)}" y="${reverseY ? m.t+18 : H-m.b-14}" text-anchor="middle" fill="#488f87">r-I</text><text x="${X(Math.max(0.9,(0.7+xmax)/2))}" y="${reverseY ? m.t+18 : H-m.b-14}" text-anchor="middle" fill="#8b79b1">r-II</text>`;
    }
    for (const [key,dir] of [[xkey,'x'],[ykey,'y']]) {
      const refsAt = key === 'eu' ? [0.3,0.7] : key === 'ba_eu' ? [0] : [];
      for (const v of refsAt) {
        if (dir === 'x') refs += `<path d="M${X(v)},${m.t}V${H-m.b}" stroke="#a2aaa9" stroke-width="1" stroke-dasharray="5 5"/><text x="${X(v)+4}" y="${m.t-10}" fill="#6d7d81">${v.toFixed(1)}</text>`;
        else refs += `<path d="M${m.l},${Y(v)}H${W-m.r}" stroke="#a2aaa9" stroke-width="1" stroke-dasharray="5 5"/><text x="${m.l+6}" y="${Y(v)-5}" fill="#6d7d81">${v.toFixed(1)}</text>`;
      }
    }
  }
  const grid = xt.values.map(x => `<path d="M${X(x)},${m.t}V${H-m.b}" stroke="#e4eae9" stroke-width="0.7"/><text x="${X(x)}" y="${H-m.b+23}" text-anchor="middle">${tickLabel(x,xt.step,xkey)}</text>`).join('') + yt.values.map(y => `<path d="M${m.l},${Y(y)}H${W-m.r}" stroke="#e4eae9" stroke-width="0.7"/><text x="${m.l-10}" y="${Y(y)+4}" text-anchor="end">${tickLabel(y,yt.step,ykey)}</text>`).join('');
  const radius = W < 500 ? 3.3 : 4.1;
  const marks = points.map(s => {
    const color = colorBy === 'group' ? sourceColors[s.group] : classes[s.r_class]?.color || '#84939a';
    const marker = s.group === 'RPA' ? `<circle r="${radius}"/>` : `<path d="M0,-${radius+0.7}L${radius+0.7},0 0,${radius+0.7} -${radius+0.7},0Z"/>`;
    return `<g class="plot-point" transform="translate(${X(s[xkey])} ${Y(s[ykey])})" data-key="${esc(starKey(s))}" data-record="${esc(s.record_id)}" tabindex="0" role="button" aria-label="${esc(s.name)}, ${esc(classLabel(s.r_class))}, ${esc(labels[xkey])} ${fmt(s[xkey])}, ${esc(labels[ykey])} ${fmt(s[ykey])}" fill="${color}" fill-opacity="0.68" stroke="#fff" stroke-width="0.65">${marker}<circle class="point-hit" r="7.5" fill="transparent" stroke="none"/><title>${esc(s.name)} · ${esc(s.source)} · ${esc(classLabel(s.r_class))}</title></g>`;
  }).join('');
  $('plot').innerHTML = `<svg id="scatterSVG" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(labels[xkey])} 与 ${esc(labels[ykey])} 的关系" style="font:13px 'Segoe UI','Microsoft YaHei',sans-serif;fill:#61767d"><desc>Horizontal axis ${reverseX ? 'decreasing' : 'increasing'} from left to right; vertical axis ${reverseY ? 'decreasing' : 'increasing'} from bottom to top.</desc><title>R-process Atlas · ${esc(labels[xkey])} / ${esc(labels[ykey])}</title><defs><clipPath id="plotClip"><rect x="${m.l}" y="${m.t}" width="${W-m.l-m.r}" height="${H-m.t-m.b}"/></clipPath></defs><rect width="${W}" height="${H}" fill="white"/><g clip-path="url(#plotClip)">${bands}</g>${grid}${refs}<path d="M${m.l},${m.t}V${H-m.b}H${W-m.r}" fill="none" stroke="#87999e" stroke-width="1"/>${bandLabels}<g clip-path="url(#plotClip)">${marks}</g><text x="${m.l+(W-m.l-m.r)/2}" y="${H-10}" text-anchor="middle" style="font-size:15px;fill:#27424c">${esc(labels[xkey])}</text><text transform="translate(18 ${m.t+(H-m.t-m.b)/2}) rotate(-90)" text-anchor="middle" style="font-size:15px;fill:#27424c">${esc(labels[ykey])}</text>${!points.length ? `<text x="${W/2}" y="${H/2}" text-anchor="middle">当前筛选没有可绘制的点值</text>` : ''}</svg>`;
  const colorLegend = colorBy === 'class' ? Object.entries(classes).filter(([key]) => points.some(s => s.r_class === key)).map(([,c]) => `<span><i class="dot" style="background:${c.color}"></i>${esc(c.label)}</span>`).join('') : '<span><i class="dot rpa"></i>RPA</span><span><i class="dot other"></i>其他研究</span>';
  $('plotLegend').innerHTML = `<div class="color-legend">${colorLegend}</div><div class="shape-legend"><span>● RPA</span><span>◆ 其他研究</span></div>`;
  $('plottedCount').textContent = `绘制 ${points.length} / ${filtered.length} 条记录${filtered.length-points.length ? ` · ${filtered.length-points.length} 条缺值或限值未绘制` : ''}`;
  const thresholdAxes = xkey === 'eu' || ykey === 'eu' || xkey === 'ba_eu' || ykey === 'ba_eu';
  $('plotNote').textContent = xkey === 'teff' && ykey === 'logg' ? '大气参数预设默认反转温度与表面重力坐标；可分别勾选或取消上方的反转选项。每个点仍对应所选文献的同一条测量。' : threshold && thresholdAxes ? '虚线标出 Eu = 0.3、0.7 或 Ba/Eu = 0。浅色区域提示 Eu 增丰范围；r-I / r-II 的最终判定同时要求 Ba/Eu < 0。' : '仅绘制当前坐标均为有效点值的记录；不跨论文平均丰度，不将限值当作检出值。';
  const directions = [reverseX ? '横轴已反转' : '', reverseY ? '纵轴已反转' : ''].filter(Boolean);
  if (directions.length) $('plotNote').textContent = directions.join(' · ') + '。' + $('plotNote').textContent;
  const preset = xkey === 'feh' && ykey === 'eu' ? 'abundance' : xkey === 'eu' && ykey === 'ba_eu' ? 'diagnostic' : xkey === 'teff' && ykey === 'logg' ? 'atmosphere' : '';
  $('plotTitle').textContent = ({abundance:'丰度与金属丰度',diagnostic:'主 r 过程分类诊断',atmosphere:'恒星大气参数'})[preset] || `${labels[ykey]} 与 ${labels[xkey]}`;
  document.querySelectorAll('[data-view]').forEach(b => {b.classList.toggle('active',b.dataset.view === preset); b.setAttribute('aria-pressed',String(b.dataset.view === preset));});
  figure = {W,H,points:points.length,xkey,ykey,colorBy,reverseX,reverseY};
  const byRecord = new Map(points.map(s => [s.record_id,s]));
  $('plot').querySelectorAll('.plot-point').forEach(p => {
    const s = byRecord.get(p.dataset.record);
    p.onclick = () => {hideTooltip(); detail(p.dataset.key);};
    p.onkeydown = e => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); p.onclick();}};
    p.onpointerenter = e => showTooltip(s,e.clientX,e.clientY);
    p.onpointermove = e => positionTooltip(e.clientX,e.clientY);
    p.onpointerleave = hideTooltip;
    p.onfocus = () => {const r = p.getBoundingClientRect(); showTooltip(s,r.left+r.width/2,r.top);};
    p.onblur = hideTooltip;
  });
}
function positionTooltip(x,y) {
  const t = $('tooltip');
  t.style.left = Math.max(8,Math.min(innerWidth-t.offsetWidth-8,x+14))+'px';
  t.style.top = Math.max(8,Math.min(innerHeight-t.offsetHeight-8,y+14))+'px';
}
function showTooltip(s,x,y) {
  $('tooltip').innerHTML = `<b>${esc(s.name)}</b><span>${esc(classLabel(s.r_class))} · ${s.group === 'RPA' ? 'RPA' : '其他研究'}</span><span>[Fe/H] ${fmt(s.feh)}　[Eu/Fe] ${fmt(s.eu)}</span><span>[Ba/Eu] ${fmt(s.ba_eu)}　Teff ${fmt(s.teff,0)} K</span><small>${esc(s.source)} · 文献分类 ${esc(s.published_class || s.literature_r_class)}</small>`;
  $('tooltip').style.display = 'block'; positionTooltip(x,y);
}
function hideTooltip() {$('tooltip').style.display = 'none';}
function detail(key) {
  const [id,g] = key.split('|'), s = data.stars.find(s => s.star_id === id && s.group === g);
  if (!s) return;
  const records = data.records.filter(r => r.star_id === id).sort((a,b) => (b.year || 0)-(a.year || 0));
  const selected = filtered.find(s => starKey(s) === key)?.record_id;
  $('detailContent').innerHTML = `<div class="eyebrow">${esc(s.star_id)} · ${s.overlap ? 'RPA + OTHER' : 'LITERATURE RECORD'}</div><h2>${esc(s.name)}</h2><p>J2000: ${fmt(s.ra,6)}°, ${fmt(s.dec,6)}° · ${records.length} 条收录记录 · ${esc(s.host_system || '宿主未逐一核对')}</p><p>别名：${esc(s.aliases || '无其他别名')}</p><div class="detail-rule">统一 r-I：0.3 &lt; Eu/Fe ≤ 0.7；r-II：Eu/Fe &gt; 0.7；均要求 Ba/Eu &lt; 0。</div>${records.map(r => `<article class="measure ${r.record_id === selected ? 'current-measure' : ''}"><h3><span class="badge ${r.group === 'Other' ? 'other' : ''}">${r.group === 'RPA' ? 'RPA' : '其他研究'}</span> ${esc(r.source)} ${r.record_id === selected ? '<small class="current-label">当前显示</small>' : ''}　<a href="${esc(safeURL(r.reference))}" target="_blank" rel="noopener">文献 ↗</a></h3><div class="classification-pair"><span>统一分类 <b style="color:${classes[r.r_class]?.color || '#61767d'}">${esc(classLabel(r.r_class))}</b></span><span>文献原分类 <b>${esc(r.published_class || r.literature_r_class)}</b></span>${r.is_CEMP_reported ? '<span class="badge">CEMP 属性保留</span>' : ''}</div><p>${esc(r.uniform_class_note)}</p><p>文献证据：${esc(basisLabels[r.classification_basis] || r.classification_basis)} · ${esc(r.name)}</p><div class="vals"><span>[Fe/H] <b>${fmt(r.feh)}</b></span><span>[Eu/Fe] <b>${fmt(r.eu)}</b> ${r.eu_status === 'point' ? '' : esc(r.eu_status)}</span><span>[Ba/Fe] <b>${fmt(r.ba)}</b> ${r.ba_status === 'point' ? '' : esc(r.ba_status)}</span><span>[Ba/Eu] <b>${fmt(r.ba_eu)}</b></span><span>Teff ${fmt(r.teff,0)} K</span><span>log g ${fmt(r.logg)}</span></div><small>${r.source_citation_needs_review ? '原始文献引文待复核；本记录来自已核对的 Shank 汇编。' : ''}${r.source === 'Hackshaw2026' ? '公开预印本；尚未确认期刊发表状态。' : ''}</small><small>丰度标度：${esc(r.solar_scale)}</small><small>${esc(r.note)}</small></article>`).join('')}`;
  $('detail').showModal();
}
function saveBlob(blob, filename) {
  const a = document.createElement('a'), url = URL.createObjectURL(blob);
  a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url),3000);
}
function download() {
  const cols = ['star_id','name','group','r_class','literature_r_class','published_class','uniform_class_status','uniform_class_note','uniform_classification_rule','ra','dec','teff','logg','feh','eu','ba','ba_eu','eu_status','ba_status','record_id','source','reference','classification_basis','solar_scale','overlap','n_records'];
  const quote = x => '"'+String(x ?? '').replaceAll('"','""')+'"';
  const txt = '\uFEFF'+[cols.join(','),...filtered.map(s => cols.map(c => quote(s[c])).join(','))].join('\r\n');
  saveBlob(new Blob([txt],{type:'text/csv;charset=utf-8'}),'RPE_uniform_filtered_catalogue.csv');
}
function exportedSVG() {
  const svg = $('scatterSVG'), {W,H,points,colorBy} = figure;
  const english = {'r-I':'r-I','r-II':'r-II',boundary:'Boundary',unavailable:'Pending',outside:'Outside'};
  const plotted = filtered.filter(s => hasAxisValue(s,figure.xkey) && hasAxisValue(s,figure.ykey));
  const items = colorBy === 'class' ? Object.entries(classes).filter(([key]) => plotted.some(s => s.r_class === key)).map(([key,c]) => ({label:english[key],color:c.color})) : [{label:'RPA',color:sourceColors.RPA},{label:'Other',color:sourceColors.Other}];
  let lx=24, ly=H+154, legend='';
  for (const item of items) {
    const size=item.label.length*7.5+30;
    if (lx+size>W-20) {lx=24;ly+=17;}
    legend+=`<circle cx="${lx+4}" cy="${ly-3}" r="3.5" fill="${item.color}"/><text x="${lx+14}" y="${ly}">${esc(item.label)}</text>`;
    lx+=size;
  }
  const inner = new XMLSerializer().serializeToString(svg);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H+220}" viewBox="0 0 ${W} ${H+220}"><rect width="100%" height="100%" fill="white"/><g style="font-family:'Segoe UI','Microsoft YaHei',sans-serif;fill:#27424c"><text x="24" y="27" font-size="18" font-weight="600">R-process Atlas</text><text x="24" y="47" font-size="15">${esc($('plotTitle').textContent)}</text><text x="24" y="65" font-size="12">${points} records · ${new Set(plotted.map(s=>s.star_id)).size} stars · 2026-11-03</text></g><g transform="translate(0 78)">${inner}</g><g style="font:12px 'Segoe UI',sans-serif;fill:#61767d"><text x="24" y="${H+100}">r-I: 0.3 &lt; [Eu/Fe] ≤ 0.7</text><text x="24" y="${H+117}">r-II: [Eu/Fe] &gt; 0.7; both [Ba/Eu] &lt; 0</text><text x="24" y="${H+134}">● RPA / ◆ Other · independent measurements</text>${legend}<text x="24" y="${H+192}">Literature point measurements.</text><text x="24" y="${H+207}">Abundance scales not homogenized.</text></g></svg>`;
}
async function exportFigure(type) {
  if (!figure) return;
  const svg = exportedSVG(), name = `RPE_${figure.xkey}_${figure.ykey}${figure.reverseX ? '_x-reversed' : ''}${figure.reverseY ? '_y-reversed' : ''}_20261103`;
  if (type === 'svg') {saveBlob(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),name+'.svg'); return;}
  const url = URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
  try {
    const img = new Image(); img.src = url; await img.decode();
    const canvas = document.createElement('canvas'); canvas.width = figure.W*3; canvas.height = (figure.H+220)*3;
    const ctx = canvas.getContext('2d'); ctx.scale(3,3); ctx.drawImage(img,0,0);
    const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/png'));
    if (!blob) throw Error('图像导出失败');
    saveBlob(blob,name+'.png');
  } catch (err) {console.error(err); $('notice').textContent = 'PNG 导出失败，请尝试 SVG。'; setTimeout(() => {$('notice').textContent = '';},6000);}
  finally {URL.revokeObjectURL(url);}
}
fetch('data/catalog.json').then(r => {if (!r.ok) throw Error('星表读取失败'); return r.json();}).then(d => {
  data = d; recordMap = new Map(d.records.map(r => [r.record_id,r]));
  const m = d.meta;
  $('stats').innerHTML = [[m.unique,'不同恒星 · 29 颗跨组重叠'],[m.rpa,'RPA 来源恒星'],[m.other,'其他高分辨率来源恒星'],[m.measurements,'逐文献独立测量']].map(([n,t]) => `<div class="stat"><b>${n.toLocaleString()}</b><span>${t}</span></div>`).join('');
  const sources = [...new Set(d.records.map(r => r.source))].sort();
  $('source').innerHTML += sources.map(s => `<option>${esc(s)}</option>`).join('');
  $('sourceList').innerHTML = `<p class="coverage">${m.sources} 个丰度来源标签，不等同于独立发现论文数量。</p>` + sources.map(s => {const rr = d.records.filter(r => r.source === s); return `<div class="source-item"><a href="${esc(safeURL(rr[0].reference))}" target="_blank" rel="noopener">${esc(s)} ↗</a><span>${new Set(rr.map(r => r.star_id)).size} 颗 · ${rr[0].group === 'RPA' ? 'RPA' : '其他研究'}</span></div>`;}).join('');
  refresh();
  new ResizeObserver(() => {if (figure && Math.abs($('plot').clientWidth-figure.W)>2) draw();}).observe($('plot'));
}).catch(err => {$('resultCount').textContent = '星表载入失败'; $('plot').innerHTML = '<p class="error">无法读取数据，请刷新页面重试。</p>'; console.error(err);});
for (const id of ['search','group','class','basis','source','feMin','feMax','euMin','euMax','overlap']) $(id).addEventListener(id === 'search' ? 'input' : 'change',() => data && refresh());
for (const id of ['xaxis','yaxis','colorBy','showThresholds','reverseX','reverseY']) $(id).onchange = () => draw();
document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => {const pair = {abundance:['feh','eu'],diagnostic:['eu','ba_eu'],atmosphere:['teff','logg']}[b.dataset.view]; $('xaxis').value = pair[0]; $('yaxis').value = pair[1]; $('reverseX').checked = b.dataset.view === 'atmosphere'; $('reverseY').checked = b.dataset.view === 'atmosphere'; draw();});
$('reset').onclick = () => {for (const id of ['search','group','class','basis','source','feMin','feMax','euMin','euMax']) $(id).value = ''; $('overlap').checked = false; if (data) refresh();};
$('prev').onclick = () => {if (page>0) {page--; table();}};
$('next').onclick = () => {if ((page+1)*15<filtered.length) {page++; table();}};
$('export').onclick = download; $('saveSVG').onclick = () => exportFigure('svg'); $('savePNG').onclick = () => exportFigure('png');
document.querySelectorAll('[data-sort]').forEach(b => b.onclick = () => {sortAsc = sortKey === b.dataset.sort ? !sortAsc : true; sortKey = b.dataset.sort; if (data) refresh();});
document.querySelector('.close').onclick = () => $('detail').close();
$('detail').addEventListener('click',e => {if (e.target === $('detail')) $('detail').close();});
addEventListener('scroll',hideTooltip,{passive:true});
