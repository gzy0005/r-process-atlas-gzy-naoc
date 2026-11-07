(() => {
 'use strict';
 const D=window.REFERENCE_GRAPH,NS='http://www.w3.org/2000/svg',$=id=>document.getElementById(id);
 const papers=new Map(D.nodes.map(n=>[n.id,n])),contexts=new Map(D.contexts.map(c=>[c.id,c])),themes=new Map(D.themes.map(t=>[t.id,t])),edgeMap=new Map(D.edges.map(e=>[e.id,e]));
 const state={mode:'core',theme:'all',minimum:1,citation:true,cooccurrence:true,connections:'spine',selected:null,edge:null,query:'',nodes:[],edges:[],positions:new Map(),bounds:null,scale:1,x:0,y:0,hover:null,wide:false};
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=s=>s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase();
 const color=n=>themes.get(n.theme).color,other=(e,id)=>e.source===id?e.target:e.source;
 const allEdges=id=>D.edges.filter(e=>e.source===id||e.target===id);
 const allowed=e=>e.type==='citation'?state.citation:state.cooccurrence&&e.weight>=state.minimum;
 const overview=()=>state.mode==='all'&&state.theme==='all';
 const svgEl=(tag,attrs={},parent)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(parent)parent.append(e);return e;};
 const title=n=>n.title||'标题尚待核实',short=n=>n.alias||n.title||n.label;
 const pageLink=p=>`index.html#page=${p}`;
 let toastTimer,labelFrame=0,resizeTimer;
 function toast(s){$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2400);}
 function currentSet(){
  let nodes=D.nodes;
  if(state.mode==='core')nodes=nodes.filter(n=>n.core);
  if(state.mode==='ego'){
   if(!state.selected)state.selected='ref-182';
   const ids=new Set([state.selected]);allEdges(state.selected).filter(allowed).forEach(e=>ids.add(other(e,state.selected)));nodes=nodes.filter(n=>ids.has(n.id));
  }
  if(state.theme!=='all')nodes=nodes.filter(n=>n.theme===state.theme);
  state.nodes=nodes;const ids=new Set(nodes.map(n=>n.id));state.edges=D.edges.filter(e=>allowed(e)&&ids.has(e.source)&&ids.has(e.target));
 }
 function layout(){
  const groups=new Map();state.nodes.forEach(n=>{if(!groups.has(n.theme))groups.set(n.theme,[]);groups.get(n.theme).push(n);});
  state.positions=new Map();$('clusters').replaceChildren();
  if(state.mode==='ego'&&state.selected){
   const center=papers.get(state.selected);if(state.nodes.includes(center))state.positions.set(center.id,{x:0,y:0,r:16,theme:center.theme});
   const ranking=new Map();allEdges(state.selected).filter(allowed).forEach(e=>ranking.set(other(e,state.selected),(ranking.get(other(e,state.selected))||0)+(e.type==='citation'?20:e.weight)));
   const rest=state.nodes.filter(n=>n.id!==state.selected).sort((a,b)=>(ranking.get(b.id)||0)-(ranking.get(a.id)||0)||a.year-b.year);
   let start=0,ring=0;while(start<rest.length){const cap=ring?14+ring*4:8,items=rest.slice(start,start+cap),r=170+ring*155;items.forEach((n,i)=>{const a=-Math.PI/2+(i/items.length)*Math.PI*2;state.positions.set(n.id,{x:Math.cos(a)*r,y:Math.sin(a)*r,r:8+Math.min(5,Math.sqrt(n.mentionCount)),theme:n.theme});});start+=cap;ring++;}
   state.bounds=null;
  }else{
   // Editorial positions keep the method chain readable; edges retain their actual evidence.
   const fixed={
    'ref-043':[45,100],'ref-016':[205,155],
    'ref-155':[100,430],'ref-039':[260,530],'ref-085':[100,650],'ref-287':[270,735],'ref-106':[100,810],
    'ref-216':[330,255],'ref-182':[490,345],'ref-048':[675,320],'ref-110':[790,490],
    'ref-257':[940,345],'ref-279':[1130,345],'ref-118':[1375,345],
    'ref-140':[940,235],'ref-273':[1080,485],'ref-210':[1260,535],'ref-072':[940,580],
    'ref-183':[650,90],'ref-111':[810,65],'ref-103':[965,115],'ref-259':[1120,65],'ref-202':[1300,90],
    'ref-022':[650,865],'ref-228':[890,865],'ref-170':[1100,865],
    'ref-071':[1390,730],'ref-021':[1215,730],
    'ref-187':[1605,370],'ref-158':[1640,500],'ref-271':[1510,635],'ref-094':[1740,635],'ref-254':[1640,115]
   };
   const anchors={background:[140,135],surveys:[160,590],models:[930,420],ages:[970,90],spectra:[890,865],calibration:[1300,740],chemistry:[1630,500],limits:[1650,120]};
   const headings={background:[0,10],surveys:[0,330],models:[480,240],ages:[630,-10],spectra:[620,795],calibration:[1190,650],chemistry:[1500,295],limits:[1565,10]};
   for(const [theme,items]of groups){
    const noncore=items.filter(n=>!fixed[n.id]).sort((a,b)=>a.year-b.year||a.id.localeCompare(b.id)),[ax,ay]=anchors[theme];
    items.forEach(n=>{if(fixed[n.id]){const [x,y]=fixed[n.id];state.positions.set(n.id,{x,y,r:12+Math.min(5,Math.sqrt(n.mentionCount)),theme:n.theme});}});
    noncore.forEach((n,i)=>{const a=i*2.399963,r=45+Math.sqrt(i+1)*20;state.positions.set(n.id,{x:ax+Math.cos(a)*r,y:ay+Math.sin(a)*r,r:5+Math.min(3,Math.sqrt(n.mentionCount)),theme:n.theme});});
    const [hx,hy]=headings[theme],heading=svgEl('text',{x:hx,y:hy,class:'cluster-label',fill:themes.get(theme).color},$('clusters'));heading.textContent=themes.get(theme).label;
   }
   // Displace peripheral nodes away from the fixed landmarks and one another.
   const points=[...state.positions.entries()];for(let step=0;step<80;step++)for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
    const [ai,a]=points[i],[bi,b]=points[j];if(fixed[ai]&&fixed[bi])continue;
    let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,min=a.r+b.r+14;if(d>=min)continue;const f=(min-d)/d*.35;
    if(!fixed[ai]){a.x-=dx*f;a.y-=dy*f;}if(!fixed[bi]){b.x+=dx*f;b.y+=dy*f;}
   }
   state.bounds=state.theme==='all'?{x:-50,y:-70,width:1950,height:1060}:null;
  }
 }
 function edgePath(e){const a=state.positions.get(e.source),b=state.positions.get(e.target),dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,sx=a.x+dx/d*(a.r+2),sy=a.y+dy/d*(a.r+2),tx=b.x-dx/d*(b.r+7),ty=b.y-dy/d*(b.r+7);const bend=Math.abs(dy)<80?(e.type==='citation'?-1:1)*(60+Number(e.id.replace(/\D/g,''))%4*25):0;return `M${sx},${sy} Q${(sx+tx)/2},${(sy+ty)/2+bend} ${tx},${ty}`;}
 function draw(){
  $('edges').replaceChildren();$('nodes').replaceChildren();$('labels').replaceChildren();
  [...state.edges].sort((a,b)=>(a.type==='citation')-(b.type==='citation')).forEach(e=>{
   const attrs={d:edgePath(e),'data-edge':e.id};
   svgEl('path',{...attrs,class:'edge '+e.type+(papers.get(e.source).core&&papers.get(e.target).core?' landmark':''),'stroke-width':e.type==='citation'?1.6:Math.min(2.5,.7+e.weight*.3),...(e.type==='citation'?{'marker-end':'url(#arrow)'}:{})},$('edges'));
   const hit=svgEl('path',{...attrs,class:'edge-hit'},$('edges'));hit.onclick=ev=>{ev.stopPropagation();selectEdge(e.id);};
  });
  state.nodes.forEach(n=>{const p=state.positions.get(n.id),g=svgEl('g',{class:'node',transform:`translate(${p.x},${p.y})`,'data-paper':n.id,role:'button',tabindex:0,'aria-label':`${title(n)}，${n.label}`},$('nodes'));
   svgEl('circle',{r:p.r+5,class:'node-hit'},g);svgEl('circle',{r:p.r+5,class:'halo'},g);svgEl('circle',{r:p.r,fill:color(n),class:'node-dot'},g);
   const nativeTitle=svgEl('title',{},g);nativeTitle.textContent=title(n)+' — '+n.label;
   g.onclick=e=>{e.stopPropagation();selectNode(n.id,false);};g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectNode(n.id,false);}};
   g.onpointerenter=e=>showTooltip(n,e);g.onpointerleave=()=>{state.hover=null;$('node-tooltip').hidden=true;queueLabels();};g.onfocus=()=>{state.hover=n.id;queueLabels();};g.onblur=()=>{state.hover=null;queueLabels();};
  });highlight();
 }
 function showTooltip(n,e){state.hover=n.id;const t=$('node-tooltip'),r=$('graph-stage').getBoundingClientRect();t.innerHTML=`<strong>${escape(title(n))}</strong><small>${escape(n.label)}${n.alias?' · '+escape(n.alias):''}</small>`;t.hidden=false;t.style.left=Math.max(8,Math.min(r.width-286,e.clientX-r.left+12))+'px';t.style.top=Math.max(8,Math.min(r.height-110,e.clientY-r.top+15))+'px';queueLabels();}
 function focusedIds(){const ids=new Set();if(state.selected){ids.add(state.selected);state.edges.filter(e=>e.source===state.selected||e.target===state.selected).forEach(e=>{ids.add(e.source);ids.add(e.target);});}if(state.edge){const e=edgeMap.get(state.edge);ids.add(e.source);ids.add(e.target);}return ids;}
 function highlight(){
  const ids=focusedIds();document.querySelectorAll('.node').forEach(g=>{g.classList.toggle('selected',g.dataset.paper===state.selected);g.classList.toggle('dim',ids.size>0&&!ids.has(g.dataset.paper));});
  let visibleCount=0;
  document.querySelectorAll('[data-edge]').forEach(p=>{const e=edgeMap.get(p.dataset.edge),connected=state.edge?e.id===state.edge:state.selected&&(e.source===state.selected||e.target===state.selected),spine=e.type==='citation'||e.weight>=2||papers.get(e.source).core&&papers.get(e.target).core,visible=connected||state.connections==='all'||state.connections==='spine'&&state.mode!=='ego'&&spine;
   p.style.display=visible?'':'none';p.classList.toggle('dim',ids.size>0&&!connected);p.classList.toggle('connected',!!connected);p.classList.toggle('active',e.id===state.edge);
   if(visible&&p.classList.contains('edge'))visibleCount++;
  });
  $('graph-summary').textContent=`${state.nodes.length} 篇文献 · 显示 ${visibleCount} 条关系${visibleCount<state.edges.length?' / 共 '+state.edges.length+' 条可查看':''}`;
  const n=papers.get(state.selected);$('selected-banner').hidden=!n;$('selected-banner').innerHTML=n?`<span>${escape(n.alias||n.label)}</span><strong>${escape(title(n))}</strong><small>查看文献详情 ↘</small>`:'';queueLabels();
 }
 const measureCanvas=document.createElement('canvas'),measure=measureCanvas.getContext('2d');
 function truncate(s,width,font='600 12px "Segoe UI","Microsoft YaHei",sans-serif'){measure.font=font;if(measure.measureText(s).width<=width)return s;while(s.length>2&&measure.measureText(s+'…').width>width)s=s.slice(0,-1);return s+'…';}
 function queueLabels(){cancelAnimationFrame(labelFrame);labelFrame=requestAnimationFrame(placeLabels);}
 function placeLabels(){
  const w=$('network').clientWidth,h=$('network').clientHeight,root=$('labels');root.replaceChildren();
  const ids=focusedIds(),mobile=w<600,seen=[],nodeBoxes=state.nodes.map(n=>{const p=state.positions.get(n.id);return {id:n.id,x:p.x*state.scale+state.x,y:p.y*state.scale+state.y,r:Math.max(4,p.r*state.scale)+3};});
  const banner=$('selected-banner');if(!banner.hidden){const b=banner.getBoundingClientRect(),r=$('network').getBoundingClientRect();seen.push({x:b.left-r.left-6,y:b.top-r.top-5,w:b.width+12,h:b.height+10});}
  seen.push({x:0,y:h-155,w:57,h:155});
  const stage=$('network').getBoundingClientRect();document.querySelectorAll('.cluster-label').forEach(e=>{const r=e.getBoundingClientRect();seen.push({x:r.left-stage.left-4,y:r.top-stage.top-4,w:r.width+8,h:r.height+8});});
  const landmarks=['ref-182','ref-048','ref-257','ref-279','ref-118','ref-110'];
  const priority=n=>landmarks.includes(n.id)?1000-landmarks.indexOf(n.id):n.core?500+n.mentionCount:n.mentionCount;
  let candidates=state.nodes.filter(n=>n.core||state.nodes.length<=65||state.scale>.85||n.id===state.hover||n.id===state.selected);
  candidates.sort((a,b)=>(b.id===state.selected)-(a.id===state.selected)||(b.id===state.hover)-(a.id===state.hover)||ids.has(b.id)-ids.has(a.id)||priority(b)-priority(a));
  const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  let shown=0;
  for(const n of candidates){
   const p=state.positions.get(n.id),x=p.x*state.scale+state.x,y=p.y*state.scale+state.y,r=Math.max(5,p.r*state.scale),important=n.id===state.selected||n.id===state.hover;
   if(x<0||y<0||x>w||y>h)continue;
   if(!important&&ids.size&&!ids.has(n.id))continue;
   const maxWidth=mobile?128:165,main=truncate(short(n),maxWidth),secondary=n.label;
   measure.font='600 12px "Segoe UI","Microsoft YaHei",sans-serif';const width=Math.min(maxWidth,Math.max(measure.measureText(main).width,secondary.length*5.7))+10,height=32;
   const options=[{x:x+r+7,y:y-17},{x:x-r-width-7,y:y-17},{x:x-width/2,y:y+r+9},{x:x-width/2,y:y-r-height-9},{x:x+r+8,y:y-r-height-8},{x:x-r-width-8,y:y+r+8},...([45,70].flatMap(offset=>[{x:x-width/2,y:y+offset},{x:x-width/2,y:y-height-offset},{x:x+r+12,y:y+offset},{x:x-width-r-12,y:y-height-offset}]))];
   let box=options.find(b=>b.x>=5&&b.y>=8&&b.x+width<w-5&&b.y+height<h-5&&!seen.some(s=>overlap({x:b.x-4,y:b.y-3,w:width+8,h:height+6},s))&&!nodeBoxes.some(s=>s.id!==n.id&&overlap({x:b.x,y:b.y,w:width,h:height},{x:s.x-s.r,y:s.y-s.r,w:s.r*2,h:s.r*2})));
   if(!box)continue;box={...box,w:width,h:height};seen.push({x:box.x-4,y:box.y-3,w:width+8,h:height+6});
   const nearX=Math.max(box.x,Math.min(x,box.x+width)),nearY=Math.max(box.y,Math.min(y,box.y+height));if(Math.hypot(nearX-x,nearY-y)>r+18)svgEl('line',{x1:x,y1:y,x2:nearX,y2:nearY,stroke:color(n),'stroke-opacity':'.4','stroke-width':'.8',class:'label-leader'},root);
   const g=svgEl('g',{class:'paper-label'+(n.id===state.selected?' selected':''),'data-label':n.id,role:'button',tabindex:0,transform:`translate(${box.x},${box.y})`},root);
   svgEl('rect',{width,height,rx:4,fill:'#fffefa','fill-opacity':'.95',stroke:important?color(n):'none'},g);
   const t=svgEl('text',{x:5,y:12,class:'label-main'},g);t.textContent=main;const t2=svgEl('text',{x:5,y:26,class:'label-secondary'},g);t2.textContent=secondary;
   g.onclick=ev=>{ev.stopPropagation();selectNode(n.id,false);};g.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();selectNode(n.id,false);}};shown++;
  }
  $('label-status').textContent=`${shown} 个可读标签 · 放大可见更多`;
 }
 function transform(){
  $('world').setAttribute('transform',`translate(${state.x},${state.y}) scale(${state.scale})`);
  document.querySelectorAll('.node-hit').forEach(e=>e.setAttribute('r',overview()?Math.max(7,6/state.scale):Math.min(32,Math.max(16,18/state.scale))));queueLabels();
 }
 function fit(){
  if(!state.nodes.length)return;const w=$('network').clientWidth,h=$('network').clientHeight,ps=[...state.positions.values()];
  const b=state.bounds||{x:Math.min(...ps.map(p=>p.x))-125,y:Math.min(...ps.map(p=>p.y))-75,width:Math.max(...ps.map(p=>p.x))-Math.min(...ps.map(p=>p.x))+300,height:Math.max(...ps.map(p=>p.y))-Math.min(...ps.map(p=>p.y))+165};
  state.scale=Math.min(w/b.width,h/b.height)*.94;
  state.x=(w-b.width*state.scale)/2-b.x*state.scale;state.y=Math.max(8,(h-b.height*state.scale)/2)-b.y*state.scale;transform();
 }
 function zoom(mult,cx=$('network').clientWidth/2,cy=$('network').clientHeight/2){const s=Math.min(5,Math.max(.12,state.scale*mult)),ratio=s/state.scale;state.x=cx-(cx-state.x)*ratio;state.y=cy-(cy-state.y)*ratio;state.scale=s;transform();}
 function renderGraph(reset=true){
  $('graph-stage').classList.toggle('overview-map',overview());currentSet();layout();draw();if(reset)fit();document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===state.mode));$('theme-filter').value=state.theme;
  document.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.theme===state.theme));
  $('view-description').textContent=state.mode==='ego'?`围绕 ${papers.get(state.selected)?.alias||papers.get(state.selected)?.label} 的一阶关系`:state.theme!=='all'?themes.get(state.theme).label:'参考数据 · 模型方法 · 科学应用';
  $('interaction-hint').textContent='点击论文看标题 · 点击连线查依据 · 拖动 / 缩放浏览';
  $('overview-return').disabled=state.mode==='core'&&state.theme==='all'&&!state.selected;$('empty-map').hidden=state.nodes.length!==0;renderList();
 }
 function openTheme(id){state.mode='all';state.theme=id;state.selected=null;state.edge=null;renderGraph();themeDetail(id);history.replaceState(null,'','?theme='+id);}
 function selectNode(id,focus=false){
  if(!papers.has(id))return;state.selected=id;state.edge=null;state.hover=null;$('node-tooltip').hidden=true;
  if(focus||!state.nodes.some(n=>n.id===id)){state.mode='ego';state.theme='all';renderGraph();}else{highlight();renderList();}
  paperDetail(id);history.replaceState(null,'','?paper='+id);$('detail-panel').scrollTop=0;
 }
 function contextHtml(c){return `<details class="context"><summary>PDF 第 ${c.page} 页 · ${escape(c.sectionTitle)}</summary><p>${escape(c.text)}</p><a href="${pageLink(c.page)}">回到中英正文 →</a>　<a href="assets/source.pdf#page=${c.page}" target="_blank" rel="noopener">英文原页 ↗</a></details>`;}
 function sourceLinks(n){const label=n.doi?'DOI · 出版论文':n.url?.includes('arxiv.org')?'arXiv 论文原文':n.url?.includes('ascl.net')||n.url?.includes('zenodo.org')?'软件版本记录':'出版物／作者条目';return `${n.url?`<a href="${escape(n.url)}" target="_blank" rel="noopener">${label} ↗</a>`:''}${n.adsUrl?`<a class="ads-record" href="${escape(n.adsUrl)}" target="_blank" rel="noopener">ADS 论文记录 ↗</a>`:''}${!n.url?`<a href="${escape(n.titleSourceUrl||'assets/source.pdf#page='+n.referencePage)}" target="_blank" rel="noopener">题名与书目依据 ↗</a>`:''}`;}
 function paperDetail(id){
  const n=papers.get(id),cs=n.contexts.map(id=>contexts.get(id)),pages=[...new Set(cs.map(c=>c.page))].sort((a,b)=>a-b),neighbors=new Map();
  allEdges(id).forEach(e=>{const key=other(e,id);if(!neighbors.has(key))neighbors.set(key,{id:key,citation:0,weight:0});const x=neighbors.get(key);if(e.type==='citation')x.citation++;else x.weight+=e.weight;});
  const sorted=[...neighbors.values()].sort((a,b)=>b.citation-a.citation||b.weight-a.weight);
  $('detail-panel').innerHTML=`<p class="detail-eyebrow">REFERENCE ${id.slice(4)} / 288</p><h2 class="full-paper-title">${escape(title(n))}</h2><p class="paper-byline">${escape(n.label)}${n.alias?' · '+escape(n.alias):''}</p><span class="tag"><i class="theme-dot" style="--theme:${color(n)}"></i>${escape(themes.get(n.theme).label)}</span><div class="detail-links">${sourceLinks(n)}</div>${n.doi?`<p class="doi-line">DOI: ${escape(n.doi)}</p>`:''}${n.titleSource?`<p class="metadata-source">标题来源：<a href="${escape(n.titleSourceUrl||n.url)}" target="_blank" rel="noopener">${escape(n.titleSource)} ↗</a></p>`:n.title?'':'<p class="metadata-source">原综述未提供标题，当前尚未核实；不以作者年份代替真实题名。</p>'}<p class="citation-text">${escape(n.citation)}</p>${n.note?`<p>${escape(n.note)}</p>`:''}<div class="detail-actions"><button id="ego-selected">聚焦这篇论文的关系</button><button id="copy-selected">复制论文分享链接</button></div><h3>相关论文 <small>· ${neighbors.size} 篇</small></h3><p class="small-note">下列关系不受图谱的主题及共现次数筛选限制。</p><div class="neighbor-list">${sorted.map(x=>{const p=papers.get(x.id);return `<button data-select="${x.id}" title="${escape(title(p))}"><span><strong>${escape(p.alias||title(p))}</strong><small>${escape(p.label)}</small></span><small>${x.citation?'引用关系':x.weight+' 段共现'}</small></button>`;}).join('')||'<p>暂无已提取的关系。</p>'}</div><h3>综述位置 <small>· ${n.mentionCount} 个提及段落</small></h3><div class="page-pills">${pages.map(p=>`<a href="${pageLink(p)}">第 ${p} 页</a>`).join('')||`<a href="assets/source.pdf#page=${n.referencePage}" target="_blank" rel="noopener">文献表原始条目 ↗</a>`}</div>${cs.length?`<details class="all-contexts"><summary>展开段落依据（${cs.length}）</summary>${cs.map(contextHtml).join('')}</details>`:''}`;
  $('ego-selected').onclick=()=>{state.mode='ego';state.theme='all';renderGraph();toast('已聚焦这篇论文的一阶关系');};
  $('copy-selected').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);toast('分享链接已复制');}catch{toast('可复制浏览器地址分享这篇论文');}};
 }
 function selectEdge(id){
  const e=edgeMap.get(id);if(!e)return;state.edge=id;state.selected=null;highlight();const a=papers.get(e.source),b=papers.get(e.target);
  $('detail-panel').innerHTML=`<p class="detail-eyebrow">${e.type==='citation'?'VERIFIED CITATION':'PARAGRAPH CO-OCCURRENCE'}</p><h2>${e.type==='citation'?'已核实引用':'综述段落共现'}</h2><div class="edge-paper-pair"><button data-select="${a.id}"><strong>${escape(title(a))}</strong><small>${escape(a.label)}</small></button><span>${e.type==='citation'?'↓ 引用':'↕ 共同讨论'}</span><button data-select="${b.id}"><strong>${escape(title(b))}</strong><small>${escape(b.label)}</small></button></div>${e.type==='citation'?`<p>${escape(e.evidence)}</p><div class="detail-links"><a href="${escape(e.evidenceUrl)}" target="_blank" rel="noopener">来源论文依据 ↗</a></div>`:`<p>综述在 ${e.weight} 个段落共同提及这两篇文献，不表示它们彼此引用。</p>${e.contexts.map(c=>contextHtml(contexts.get(c))).join('')}`}`;
  $('detail-panel').scrollTop=0;history.replaceState(null,'',location.pathname);
 }
 function themeDetail(id){const t=themes.get(id),items=D.nodes.filter(n=>n.theme===id);$('detail-panel').innerHTML=`<p class="detail-eyebrow">TOPIC · ${items.length} REFERENCES</p><h2>${escape(t.label)}</h2><p>文献按发表年份排列。悬停查看完整标题，点选任意论文进入详情；搜索始终覆盖全部 288 篇。</p><div class="topic-papers">${[...items].sort((a,b)=>b.year-a.year).map(n=>`<button data-select="${n.id}"><strong>${escape(title(n))}</strong><small>${escape(n.label)}</small></button>`).join('')}</div>`;}
 function welcome(){$('detail-panel').innerHTML=`<p class="detail-eyebrow">THE REVIEW · 起点</p><h2 class="full-paper-title">${escape(D.source.title)}</h2><p class="paper-byline">Melissa K. Ness · 2026</p><p>《光谱学中的数据驱动方法》</p><div class="detail-links"><a href="https://doi.org/${D.source.doi}" target="_blank" rel="noopener">综述原文 ↗</a><a href="index.html">中英对照全文 →</a></div><div class="welcome-guide"><p><b>1</b> 沿着连线，先看中部的方法主脉络。</p><p><b>2</b> 点击论文，查看完整标题与精确链接。</p><p><b>3</b> 点连线查依据，也可聚焦单篇关系。</p></div><div class="example-links"><button data-select="ref-182">The Cannon · 原始模型 →</button><button data-select="ref-279">DD-Payne · 经验与理论结合 →</button><button data-select="ref-118">Lux · 含噪标签与跨巡天 →</button></div><p class="small-note">默认直接展示 33 篇关键论文的关系。可切换全部 288 篇；点选后高亮直接关联，完整题名和出处保留在详情中。</p>`;}
 function renderList(){
  const q=norm(state.query.trim());$('paper-list').hidden=!q;$('clear-search').hidden=!q;
  if(!q){$('list-status').textContent=`可搜索完整标题、作者、年份、方法或 DOI`;$('paper-list').replaceChildren();return;}
  const terms=q.split(/\s+/);const matches=D.nodes.filter(n=>{const s=norm([n.title||'',n.alias||'',n.citation,n.doi||''].join(' '));return terms.every(t=>s.includes(t));}).sort((a,b)=>b.core-a.core||b.mentionCount-a.mentionCount);
  $('list-status').textContent=`找到 ${matches.length} 篇对应文献 · 点击聚焦`;
  $('paper-list').innerHTML=matches.map(n=>`<button class="paper-item" data-select="${n.id}" aria-current="${n.id===state.selected}"><i class="theme-dot" style="--theme:${color(n)}"></i><span><strong>${escape(title(n))}</strong><small>${escape(n.label)}${n.alias?' · '+escape(n.alias):''}</small></span></button>`).join('')||'<p>未找到对应论文。可用姓氏、题名关键词或 DOI 再试。</p>';
 }
 function clear(){state.selected=null;state.edge=null;state.hover=null;$('node-tooltip').hidden=true;if(state.mode==='ego'){state.mode='core';state.theme='all';renderGraph();}else highlight();welcome();history.replaceState(null,'',location.pathname);}
 function returnOverview(){state.mode='core';state.theme='all';state.selected=null;state.edge=null;state.query='';$('paper-search').value='';renderGraph();welcome();history.replaceState(null,'',location.pathname);}
 function fullscreen(){state.wide=!state.wide;document.querySelector('.explorer').classList.toggle('expanded',state.wide);document.body.classList.toggle('map-expanded',state.wide);$('expand-map').textContent=state.wide?'⛶ 退出大图':'⛶ 放大工作区';$('expand-map').setAttribute('aria-pressed',state.wide);setTimeout(fit,30);}
 const mobileQuery=matchMedia('(max-width:780px)'),library=document.querySelector('.library');
 function arrangeSearch(){const panel=document.querySelector('.inspector');if(mobileQuery.matches)document.querySelector('.explorer').insertBefore(library,document.querySelector('.workspace'));else panel.insertBefore(library,$('detail-panel'));}
 mobileQuery.addEventListener('change',arrangeSearch);arrangeSearch();
 $('core-count').textContent=D.nodes.filter(n=>n.core).length;
 $('theme-filter').insertAdjacentHTML('beforeend',D.themes.map(t=>`<option value="${t.id}">${escape(t.label)}</option>`).join(''));
 $('theme-legend').innerHTML=D.themes.map(t=>`<button data-theme="${t.id}" aria-pressed="false"><i style="--theme:${t.color}"></i>${escape(t.label)}</button>`).join('');
 $('citation-total').textContent=D.edges.filter(e=>e.type==='citation').length;
 $('coverage-note').textContent=`全部 288 条文献中，${D.nodes.filter(n=>n.title).length} 条已补充题名。正文自动匹配 ${D.nodes.filter(n=>n.mentionCount>0).length} 条文献、${D.contexts.length} 个段落，共 ${D.edges.filter(e=>e.type==='cooccurrence').length} 对段落共现。默认展示核心脉络；主干连线包括已核实引用、核心文献之间的共现，以及至少 2 段的共现，可切换“全部关系”。DOI／arXiv 精确定位到具体论文。`;
 document.addEventListener('click',e=>{const b=e.target.closest('[data-select]');if(b)selectNode(b.dataset.select,true);});
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;state.theme='all';state.edge=null;if(state.mode==='ego'&&!state.selected)state.selected='ref-182';if(state.mode!=='ego')state.selected=null;renderGraph();state.selected?paperDetail(state.selected):welcome();});
 $('theme-filter').onchange=e=>e.target.value==='all'?returnOverview():openTheme(e.target.value);
 $('weight-filter').onchange=e=>{state.minimum=Number(e.target.value);const reset=state.mode==='ego';renderGraph(reset);};
 $('connection-mode').onchange=e=>{state.connections=e.target.value;highlight();};
 $('show-citation').onchange=e=>{state.citation=e.target.checked;renderGraph(state.mode==='ego');};$('show-cooccurrence').onchange=e=>{state.cooccurrence=e.target.checked;renderGraph(state.mode==='ego');};
 document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>openTheme(b.dataset.theme));
 $('cannon-focus').onclick=()=>selectNode('ref-182',true);
 $('paper-search').oninput=e=>{state.query=e.target.value;renderList();};$('clear-search').onclick=()=>{state.query='';$('paper-search').value='';renderList();$('paper-search').focus();};
 $('clear-selection').onclick=clear;$('overview-return').onclick=returnOverview;$('expand-map').onclick=fullscreen;$('selected-banner').onclick=()=>$('detail-panel').scrollIntoView({behavior:'smooth',block:'nearest'});
 $('method-button').onclick=()=>$('method-dialog').showModal();$('close-method').onclick=()=>$('method-dialog').close();
 document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('paper-search').focus();}if(e.key==='Escape'&&!$('method-dialog').open){if(state.wide)fullscreen();else if(state.query){state.query='';$('paper-search').value='';renderList();}else clear();}});
 $('zoom-in').onclick=()=>zoom(1.25);$('zoom-out').onclick=()=>zoom(.8);$('fit-map').onclick=fit;
 $('network').addEventListener('wheel',e=>{e.preventDefault();const r=$('network').getBoundingClientRect();zoom(Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top);},{passive:false});
 const pointers=new Map();let dragged=false,pinch=null;
 $('network').addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});dragged=false;if(!e.target.closest('.node,.theme-card,.paper-label,.edge-hit'))$('network').setPointerCapture(e.pointerId);$('network').classList.add('panning');if(pointers.size===2){const[a,b]=[...pointers.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);}});
 $('network').addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const old=pointers.get(e.pointerId);if(pointers.size===1){const dx=e.clientX-old.x,dy=e.clientY-old.y;if(Math.abs(dx)+Math.abs(dy)>2){dragged=true;state.x+=dx;state.y+=dy;transform();}}pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const[a,b]=[...pointers.values()],dist=Math.hypot(a.x-b.x,a.y-b.y),r=$('network').getBoundingClientRect();if(pinch)zoom(dist/pinch,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top);pinch=dist;dragged=true;}});
 const release=e=>{pointers.delete(e.pointerId);if(pointers.size<2)pinch=null;if(!pointers.size)$('network').classList.remove('panning');};$('network').addEventListener('pointerup',release);$('network').addEventListener('pointercancel',release);
 // Retargeted pointer capture can hide node clicks; resolve a stationary click from its screen position.
 $('network').addEventListener('click',e=>{if(dragged){e.preventDefault();e.stopImmediatePropagation();dragged=false;return;}if(e.target===$('network')){const r=$('network').getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=null,dist=20;state.positions.forEach((p,id)=>{const d=Math.hypot(p.x*state.scale+state.x-x,p.y*state.scale+state.y-y);if(d<dist){best=id;dist=d;}});if(best){e.stopImmediatePropagation();selectNode(best,overview());}}},true);
 $('network').addEventListener('keydown',e=>{if(e.target!==$('network'))return;const d=35;if(e.key==='+'||e.key==='=')zoom(1.2);else if(e.key==='-')zoom(.8);else if(e.key==='0')fit();else if(e.key==='ArrowLeft')state.x+=d;else if(e.key==='ArrowRight')state.x-=d;else if(e.key==='ArrowUp')state.y+=d;else if(e.key==='ArrowDown')state.y-=d;else return;e.preventDefault();transform();});
 $('export-map').onclick=()=>{placeLabels();const source=$('network'),clone=source.cloneNode(true);clone.setAttribute('width',source.clientWidth);clone.setAttribute('height',source.clientHeight);clone.setAttribute('viewBox',`0 0 ${source.clientWidth} ${source.clientHeight}`);const orig=[source,...source.querySelectorAll('*')],dest=[clone,...clone.querySelectorAll('*')];orig.forEach((e,i)=>{const s=getComputedStyle(e);for(const p of ['fill','stroke','stroke-width','stroke-dasharray','stroke-opacity','fill-opacity','opacity','font-size','font-family','font-weight','paint-order','display'])dest[i].style.setProperty(p,s.getPropertyValue(p));});clone.querySelectorAll('.edge-hit,.node-hit').forEach(e=>e.remove());const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='ness-2026-references.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出当前可读图谱');};
 new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(overview()){layout();draw();}fit();},100);}).observe($('graph-stage'));
 welcome();renderGraph();const params=new URLSearchParams(location.search),requested=params.get('paper');if(papers.has(requested))selectNode(requested,true);else if(themes.has(params.get('theme')))openTheme(params.get('theme'));
})();
