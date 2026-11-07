(() => {
  'use strict';
  const data = window.PAPER_DATA;
  const $ = id => document.getElementById(id);
  const chapters = [
    [1,'—','摘要与文章信息'],[2,'01','引言'],[4,'02','目的与动机'],
    [8,'03','光谱巡天概况'],[11,'04','模型的组成要素'],[12,'05','现代方法及其用途'],
    [30,'06','模型的局限性'],[32,'07','未来展望与结论'],[35,'↗','致谢与参考文献']
  ];
  const subsections = [[13,'5.2 光谱标签赋值'],[14,'5.2.1 The Cannon'],[18,'5.2.2 Lux'],[19,'5.2.3 Data-Driven Payne'],[20,'5.2.4 XGBoost'],[21,'5.2.5 神经网络'],[22,'5.2.6 低分辨率光谱'],[23,'5.2.7 演化状态'],[24,'5.2.8 年龄与距离'],[25,'5.2.9 M 型矮星'],[26,'5.3 标签校准'],[27,'5.4 光谱残差'],[28,'5.5 核合成与动力学']];
  const labels = ['摘要与文章信息','目录与引言','引言（续）','2.1 应用场景','巡天比较 · 图 1','2.2 历史回顾','历史回顾 · 图 2','3. 光谱巡天概况','巡天与仪器 · 表 1','光谱巡天概况（续）','4. 模型的组成要素','5.1 成分分离与去噪','5.2 光谱标签赋值','5.2.1 The Cannon','The Cannon · 图 4与公式','The Cannon · 训练过程','The Cannon · 标签推断','5.2.2 Lux','Lux 与 Data-Driven Payne','Data-Driven Payne 与 XGBoost','XGBoost 与神经网络','5.2.6 低分辨率光谱','5.2.7 恒星演化状态','5.2.8 年龄与距离','5.2.9 M 型矮星','M 型矮星与标签校准','5.3 校准结果与光谱残差','5.5 核合成与动力学','低维丰度空间','丰度耦合与模型局限','6. 模型局限性','模型局限与未来展望','7. 未来展望与结论','要点总结与未来问题','未来问题、致谢与文献','参考文献（续）','参考文献（续）','参考文献（续）','参考文献（续）','参考文献（续）','参考文献（续）'];
  const terms = [
    ['accuracy','准确度'],['precision','精密度'],['data-driven model','数据驱动模型'],
    ['ab initio physical model','第一性原理物理模型'],['label / label scale','标签／标签尺度'],['label transfer','标签迁移'],
    ['reference set / test set','参考集／测试集'],['high fidelity','高保真'],['generative model','生成式模型'],
    ['discriminative model','判别式模型'],['deterministic model','确定性模型'],['probabilistic model','概率式模型'],
    ['prior / likelihood','先验／似然'],['regularization','正则化'],['latent variable','潜变量'],
    ['gradient spectrum','梯度光谱'],['continuum normalization','连续谱归一化'],['signal-to-noise ratio (SNR)','信噪比'],
    ['resolving power R','光谱分辨率 R'],['effective temperature T_eff','有效温度'],['surface gravity log g','表面重力的对数'],
    ['metallicity [Fe/H]','金属丰度（以铁表征）'],['element abundance [X/Fe]','元素 X 相对于铁的丰度'],
    ['asteroseismology','星震学'],['red giant branch (RGB)','红巨星分支'],['red clump (RC)','红团簇'],
    ['dredge-up','挖掘混合'],['isochrone','等时线'],['normalizing flow','归一化流'],['chemical tagging','化学标记'],
    ['nucleosynthesis','核合成'],['diffuse interstellar band','弥散星际带'],['non-LTE / NLTE','非局域热力学平衡'],
    ['radial velocity (RV)','视向速度'],['attenuation bias','衰减偏差'],['C-space','化学单元空间（C 空间）']
  ];
  let page = 1;
  let mode = 'both';
  const safeStorage = {get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  $('contents').innerHTML = chapters.map(([n,num,label]) => `<a href="#page=${n}" data-page="${n}"><span class="nav-number">${num}</span><span>${label}</span></a>`).join('') + '<details class="subcontents"><summary>展开方法小节</summary>'+subsections.map(([n,label])=>`<a href="#page=${n}">${escape(label)}</a>`).join('')+'</details>';
  $('page-select').innerHTML = data.pages.map(p => `<option value="${p.number}" title="${escape(labels[p.number-1])}">${String(p.number).padStart(2,'0')}</option>`).join('');
  $('glossary').innerHTML = terms.map(([en,zh]) => `<div class="glossary-row"><span>${escape(en)}</span><span>${escape(zh)}</span></div>`).join('');

  function closeMenu(){ $('sidebar').classList.remove('open');$('scrim').classList.remove('open');$('menu-button').setAttribute('aria-expanded','false'); }
  function readHash(){const match=location.hash.match(/page=(\d+)/);return match?Math.min(41,Math.max(1,Number(match[1]))):1;}
  function render(n,scroll=true){
    page=n;
    const p=data.pages[n-1];
    $('translation').innerHTML=p.html;
    $('original-image').src=`assets/reading-${String(n).padStart(2,'0')}.jpg`;
    $('original-image').alt=`论文第 ${n} 页英文原文内容，原文页码 3.${n}`;
    $('source-page').textContent=`原文 3.${n}`;
    $('page-name').textContent=labels[n-1];
    $('current-section').textContent=chapters.filter(c=>c[0]<=n).at(-1)[2];
    $('page-select').value=String(n);
    $('bottom-page').textContent=`${String(n).padStart(2,'0')} / 41`;
    $('progress-bar').style.width=`${n/41*100}%`;
    ['prev','bottom-prev'].forEach(id=>$(id).disabled=n===1);
    ['next','bottom-next'].forEach(id=>$(id).disabled=n===41);
    const active=chapters.filter(c=>c[0]<=n).at(-1)[0];
    document.querySelectorAll('#contents>a').forEach(a=>{const on=Number(a.dataset.page)===active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    safeStorage.set('spectroscopy-reader-page',String(n));
    document.title=`${labels[n-1]} · 光谱学中的数据驱动方法`;
    closeMenu();
    if(scroll)$('page-navigation').scrollIntoView({behavior:'instant',block:'start'});
  }
  function navigate(n){if(n<1||n>41)return;if(page===n){closeMenu();return;}location.hash=`page=${n}`;}
  function setMode(next){mode=next;$('reader').className=`reader mode-${next}`;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===next)));safeStorage.set('spectroscopy-reader-mode',next);}
  function showImage(src,caption){$('enlarged-image').src=src;$('enlarged-image').alt=caption;$('image-caption').textContent=caption;$('image-open').href=src;$('image-dialog').showModal();}
  function zoomOriginal(){showImage(`assets/page-${String(page).padStart(2,'0')}.jpg`,`英文原页 · PDF 第 ${page} 页`);}
  function highlight(text,q){const at=text.toLocaleLowerCase().indexOf(q.toLocaleLowerCase());if(at<0)return escape(text);return escape(text.slice(0,at))+'<mark>'+escape(text.slice(at,at+q.length))+'</mark>'+escape(text.slice(at+q.length));}
  function search(){
    const q=$('search-input').value.trim();
    if(!q){$('search-summary').textContent='试试：标签尺度、The Cannon、accuracy';$('search-results').innerHTML='';return;}
    const key=q.toLocaleLowerCase();
    const matches=data.pages.filter(p=>(p.text+' '+p.english).toLocaleLowerCase().includes(key));
    $('search-summary').textContent=`在 ${matches.length} 页中找到“${q}”`;
    $('search-results').innerHTML=matches.map(p=>{
      const corpus=p.text.toLocaleLowerCase().includes(key)?p.text:p.english;
      const i=corpus.toLocaleLowerCase().indexOf(key);
      const sample=corpus.slice(Math.max(0,i-48),i+q.length+115).replace(/\[\[[^\]]+\]\]/g,'').replace(/\n/g,' ');
      return `<button class="search-result" data-result-page="${p.number}"><strong>第 ${p.number} 页 · ${escape(labels[p.number-1])}</strong><span>${i>48?'…':''}${highlight(sample,q)}…</span></button>`;
    }).join('');
  }
  $('search-trigger').addEventListener('click',()=>{$('search-dialog').showModal();$('search-input').focus();});
  $('search-input').addEventListener('input',search);
  $('search-results').addEventListener('click',e=>{const b=e.target.closest('[data-result-page]');if(b){$('search-dialog').close();const n=Number(b.dataset.resultPage);if(n===page)$('page-navigation').scrollIntoView();else navigate(n);}});
  $('glossary-trigger').addEventListener('click',()=>$('glossary-dialog').showModal());
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  $('translation').addEventListener('click',e=>{const b=e.target.closest('[data-image]');if(b)showImage(b.dataset.image,b.getAttribute('aria-label').replace('放大',''));});
  $('original-button').addEventListener('click',zoomOriginal);$('zoom-original').addEventListener('click',zoomOriginal);
  ['prev','bottom-prev'].forEach(id=>$(id).addEventListener('click',()=>navigate(page-1)));
  ['next','bottom-next'].forEach(id=>$(id).addEventListener('click',()=>navigate(page+1)));
  $('page-select').addEventListener('change',e=>navigate(Number(e.target.value)));
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
  $('menu-button').addEventListener('click',()=>{const open=$('sidebar').classList.toggle('open');$('scrim').classList.toggle('open',open);$('menu-button').setAttribute('aria-expanded',String(open));});
  $('scrim').addEventListener('click',closeMenu);
  $('print-trigger').addEventListener('click',()=>{
    $('print-content').innerHTML='<h1>光谱学中的数据驱动方法</h1><p>Data-Driven Methods in Spectroscopy · Melissa K. Ness</p><p>依据用户提供的 Review in Advance 版本，中文全译。原图、公式及参考文献保留。</p>'+data.pages.map(p=>`<section class="print-page"><header>原文第 ${p.number} 页 · 3.${p.number}</header><div class="translation">${p.html}</div></section>`).join('');
    const imgs=[...$('print-content').querySelectorAll('img')];
    imgs.forEach(img=>img.loading='eager');
    Promise.all(imgs.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve;}))).then(()=>window.print());
  });
  window.addEventListener('hashchange',()=>render(readHash()));
  window.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!$('search-dialog').open)$('search-dialog').showModal();$('search-input').focus();return;}
    if(document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;
    if(e.key==='ArrowRight')navigate(page+1);if(e.key==='ArrowLeft')navigate(page-1);
  });
  const saved=safeStorage.get('spectroscopy-reader-mode');if(['both','zh','en'].includes(saved))setMode(saved);
  render(readHash(),false);
})();
