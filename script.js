/* ============================================================
   UniTwin AI — Interaction & Visualization Layer
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- LOADER ---------------- */
  const loader = document.getElementById('loader');
  buildLoaderSequence();
  runLoaderStatus();
  function runLoaderStatus(){
    const statusEl = document.getElementById('loaderStatus');
    const fillEl = document.getElementById('loaderBarFill');
    const steps = [
      'INITIALIZING UNITWIN AI',
      'LOADING DIGITAL TWIN',
      'CONNECTING SENSOR LAYER',
      'INITIALIZING AI ENGINE',
      'SYSTEM READY'
    ];
    steps.forEach((text,i)=>{
      setTimeout(()=>{
        if(statusEl) statusEl.textContent = text;
        if(fillEl) fillEl.style.width = Math.round(((i+1)/steps.length)*100)+'%';
      }, i*430);
    });
    setTimeout(() => {
      loader.classList.add('hidden');
      if(window.gsap){
        gsap.fromTo('.hero-content > *', {opacity:0, y:20}, {opacity:1, y:0, duration:0.9, stagger:0.08, ease:'power3.out'});
      }
    }, steps.length*430 + 250);
  }

  /* ---------------- CUSTOM CURSOR ---------------- */
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!isTouch && !reducedMotion){
    document.body.classList.add('has-custom-cursor');
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let rx=0, ry=0, dx=0, dy=0;
    window.addEventListener('mousemove', (e)=>{
      dx=e.clientX; dy=e.clientY;
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%,-50%)`;
    });
    function ringLoop(){
      rx += (dx-rx)*0.18; ry += (dy-ry)*0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(ringLoop);
    }
    ringLoop();
    document.querySelectorAll('a, button, input[type=range], .sensor-card, .app-card, .arch-block, .conn-item').forEach(el=>{
      el.addEventListener('mouseenter', ()=>ring.classList.add('hover'));
      el.addEventListener('mouseleave', ()=>ring.classList.remove('hover'));
    });
  }

  function buildLoaderSequence(){
    const svg = document.getElementById('loaderSvg');
    svg.setAttribute('viewBox','0 0 800 300');
    const ns = 'http://www.w3.org/2000/svg';
    const stages = [
      {x:70,y:150,label:'MACHINE'},
      {x:250,y:150,label:'SENSORS'},
      {x:430,y:150,label:'ESP32'},
      {x:600,y:150,label:'CLOUD/AI'},
      {x:750,y:150,label:'TWIN'}
    ];
    stages.forEach((s,i)=>{
      const c = document.createElementNS(ns,'circle');
      c.setAttribute('cx',s.x); c.setAttribute('cy',s.y); c.setAttribute('r',14);
      c.setAttribute('fill','none'); c.setAttribute('stroke','#1E304F'); c.setAttribute('stroke-width','1.5');
      c.style.opacity='0';
      c.style.animation = `loaderPop .4s ease ${i*0.25}s forwards`;
      svg.appendChild(c);
      const t = document.createElementNS(ns,'text');
      t.setAttribute('x',s.x); t.setAttribute('y',s.y+34); t.setAttribute('text-anchor','middle');
      t.setAttribute('font-family','JetBrains Mono, monospace'); t.setAttribute('font-size','9');
      t.setAttribute('fill','#5C6E8C'); t.textContent = s.label;
      t.style.opacity='0'; t.style.animation = `loaderPop .4s ease ${i*0.25}s forwards`;
      svg.appendChild(t);
      if(i>0){
        const line = document.createElementNS(ns,'line');
        line.setAttribute('x1',stages[i-1].x+14); line.setAttribute('y1',s.y);
        line.setAttribute('x2',s.x-14); line.setAttribute('y2',s.y);
        line.setAttribute('stroke','#00D9FF'); line.setAttribute('stroke-width','1.5');
        line.setAttribute('stroke-dasharray','160'); line.setAttribute('stroke-dashoffset','160');
        line.style.animation = `loaderLine .4s ease ${i*0.25-0.1}s forwards`;
        svg.appendChild(line);
      }
    });
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @keyframes loaderPop{to{opacity:1;}}
      @keyframes loaderLine{to{stroke-dashoffset:0;}}
    `;
    document.head.appendChild(styleTag);
  }

  /* ---------------- NAV ---------------- */
  const navLinks = document.querySelectorAll('.nav-links a');
  const navToggle = document.getElementById('navToggle');
  const navLinksEl = document.querySelector('.nav-links');
  navToggle.addEventListener('click', () => navLinksEl.classList.toggle('open'));
  navLinksEl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinksEl.classList.remove('open')));

  const sections = document.querySelectorAll('main section[id], header[id]');
  const spy = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const id = entry.target.getAttribute('id');
        navLinks.forEach(l=>l.classList.toggle('active', l.getAttribute('href') === '#'+id));
      }
    });
  },{rootMargin:'-40% 0px -50% 0px'});
  sections.forEach(s=>spy.observe(s));

  /* ---------------- SCROLL REVEAL ---------------- */
  document.querySelectorAll('.section-inner').forEach(el=>el.classList.add('reveal'));
  const revealObs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); revealObs.unobserve(e.target);} });
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>revealObs.observe(el));

  /* ---------------- HERO CANVAS: Machine -> Data -> Intelligence -> Twin ---------------- */
  initHeroCanvas();
  function initHeroCanvas(){
    const canvas = document.getElementById('heroCanvas');
    const ctx = canvas.getContext('2d');
    let w,h,dpr;
    function resize(){
      dpr = Math.min(window.devicePixelRatio||1,2);
      w = canvas.clientWidth = canvas.offsetWidth;
      h = canvas.clientHeight = canvas.offsetHeight;
      canvas.width = w*dpr; canvas.height = h*dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    window.addEventListener('resize', resize);
    resize();

    const nodes = () => ([
      {x:w*0.12,y:h*0.55,r:16,label:'MACHINE'},
      {x:w*0.34,y:h*0.4,r:10,label:'SENSORS'},
      {x:w*0.5,y:h*0.62,r:12,label:'ESP32'},
      {x:w*0.68,y:h*0.38,r:12,label:'CLOUD'},
      {x:w*0.84,y:h*0.58,r:14,label:'AI'},
      {x:w*0.95,y:h*0.35,r:10,label:'TWIN'}
    ]);
    let particles = [];
    function spawn(){
      const n = nodes();
      const seg = Math.floor(Math.random()*(n.length-1));
      particles.push({seg, t:0, speed:0.006+Math.random()*0.006});
    }
    let frame=0;
    function draw(){
      frame++;
      ctx.clearRect(0,0,w,h);
      const n = nodes();
      // connecting lines
      ctx.strokeStyle = 'rgba(30,48,79,0.9)';
      ctx.lineWidth=1;
      for(let i=0;i<n.length-1;i++){
        ctx.beginPath(); ctx.moveTo(n[i].x,n[i].y); ctx.lineTo(n[i+1].x,n[i+1].y); ctx.stroke();
      }
      // nodes
      n.forEach((node,i)=>{
        const pulse = 1+Math.sin(frame*0.03+i)*0.08;
        ctx.beginPath();
        ctx.arc(node.x,node.y,node.r*pulse,0,Math.PI*2);
        ctx.strokeStyle = i===4 ? '#FF9F1C' : '#00D9FF';
        ctx.globalAlpha = 0.7;
        ctx.lineWidth=1.4;
        ctx.stroke();
        ctx.globalAlpha=1;
      });
      // particles
      if(frame%18===0 && particles.length<40) spawn();
      particles.forEach(p=>{
        const a = n[p.seg], b = n[p.seg+1];
        const x = a.x+(b.x-a.x)*p.t;
        const y = a.y+(b.y-a.y)*p.t;
        ctx.beginPath();
        ctx.arc(x,y,2,0,Math.PI*2);
        ctx.fillStyle = '#00D9FF';
        ctx.shadowColor = '#00D9FF'; ctx.shadowBlur=6;
        ctx.fill();
        ctx.shadowBlur=0;
        p.t += p.speed;
      });
      particles = particles.filter(p=>p.t<1);
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------------- SECTION BACKGROUND CANVASES (subtle data streams) ---------------- */
  [ 'problemCanvas','aiCanvas' ].forEach(id=>initStreamCanvas(id));
  function initStreamCanvas(id){
    const canvas = document.getElementById(id);
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let w,h,dpr,lines=[];
    function resize(){
      dpr = Math.min(window.devicePixelRatio||1,2);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width=w*dpr; canvas.height=h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      lines = Array.from({length:14}, (_,i)=>({
        y: (h/14)*i + Math.random()*20,
        offset: Math.random()*1000,
        speed: 0.3+Math.random()*0.5
      }));
    }
    window.addEventListener('resize', resize);
    resize();
    function draw(t){
      ctx.clearRect(0,0,w,h);
      ctx.strokeStyle = id==='aiCanvas' ? 'rgba(255,159,28,0.12)' : 'rgba(0,217,255,0.08)';
      ctx.lineWidth=1;
      lines.forEach(line=>{
        ctx.beginPath();
        for(let x=0;x<=w;x+=8){
          const y = line.y + Math.sin((x*0.02)+(t*0.001*line.speed)+line.offset)*8;
          x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.stroke();
      });
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* Solution flow reveal is handled by GSAP ScrollTrigger below (falls back gracefully if GSAP is unavailable, since .flow-node is visible by default in CSS). */

  /* ---------------- ARCHITECTURE DIAGRAM ---------------- */
  const archData = [
    {label:'PHYSICAL\nMACHINE', desc:'The real-world asset being monitored — a motor, pump, or other equipment.'},
    {label:'SENSOR\nLAYER', desc:'Voltage, current, temperature, humidity and vibration sensors capture raw physical signals.'},
    {label:'ESP32\nEDGE DEVICE', desc:'Acquires, filters and packages sensor data at the edge before transmission.'},
    {label:'Wi-Fi /\nMQTT', desc:'Lightweight messaging protocol carries data from the edge device to the cloud.'},
    {label:'CLOUD\nPLATFORM', desc:'Stores incoming data and manages devices, using a broker and database.'},
    {label:'AI/ML\nENGINE', desc:'Analyzes data for anomalies, trends, health score and remaining useful life.'},
    {label:'DIGITAL\nTWIN', desc:'A live virtual representation of the physical machine\'s condition.'},
    {label:'WEB / MOBILE\nINTERFACE', desc:'Dashboards, alerts and reports for the end user.'}
  ];
  buildArchSvg('archSvg', false);
  buildArchSvg('fullArchSvg', true);

  // Cinematic scroll-driven reveal: architecture connecting line "draws in" as the section enters view
  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    const mainLine = document.querySelector('#archSvg line');
    if(mainLine){
      const len = mainLine.getTotalLength ? mainLine.getTotalLength() : 1360;
      mainLine.style.strokeDasharray = len;
      mainLine.style.strokeDashoffset = len;
      gsap.to(mainLine, {
        strokeDashoffset: 0, ease:'none',
        scrollTrigger: { trigger:'#architecture', start:'top 75%', end:'top 20%', scrub:1 }
      });
    }
    // Data flow section: gentle parallax on the vertical solution flow
    gsap.utils.toArray('.flow-node').forEach((node,i)=>{
      gsap.fromTo(node, {opacity:0, x: i%2===0 ? -30 : 30}, {
        opacity:1, x:0, duration:0.6, ease:'power2.out',
        scrollTrigger:{ trigger:node, start:'top 90%' }
      });
    });
  }

  function buildArchSvg(svgId, isFull){
    const svg = document.getElementById(svgId);
    const ns = 'http://www.w3.org/2000/svg';
    const n = archData.length;
    const boxW = 140, boxH = 84, gap = (1400-40-(boxW*n))/(n-1);
    const y = 118;
    const tooltip = document.getElementById('archTooltip');

    // connecting line
    const connLine = document.createElementNS(ns,'line');
    connLine.setAttribute('x1',20+boxW/2); connLine.setAttribute('y1',y+boxH/2);
    connLine.setAttribute('x2',1400-20-boxW/2); connLine.setAttribute('y2',y+boxH/2);
    connLine.setAttribute('stroke','#1E304F'); connLine.setAttribute('stroke-width','1.5');
    svg.appendChild(connLine);

    archData.forEach((d,i)=>{
      const x = 20 + i*(boxW+gap);
      const g = document.createElementNS(ns,'g');
      g.setAttribute('class','arch-block');
      g.setAttribute('data-i', i);

      const rect = document.createElementNS(ns,'rect');
      rect.setAttribute('x',x); rect.setAttribute('y',y);
      rect.setAttribute('width',boxW); rect.setAttribute('height',boxH);
      rect.setAttribute('fill', i===5 ? 'rgba(255,159,28,0.06)' : 'rgba(0,217,255,0.04)');
      rect.setAttribute('stroke','#1E304F'); rect.setAttribute('stroke-width','1.2');
      g.appendChild(rect);

      const lines = d.label.split('\n');
      lines.forEach((ln,li)=>{
        const t = document.createElementNS(ns,'text');
        t.setAttribute('x', x+boxW/2); t.setAttribute('y', y+boxH/2 - (lines.length-1)*7 + li*14 + 4);
        t.setAttribute('text-anchor','middle');
        t.setAttribute('font-size','11'); t.setAttribute('fill','#F3F6FA');
        t.setAttribute('font-family','JetBrains Mono, monospace'); t.setAttribute('letter-spacing','0.5');
        t.textContent = ln;
        g.appendChild(t);
      });

      const idx = document.createElementNS(ns,'text');
      idx.setAttribute('x', x+10); idx.setAttribute('y', y+16);
      idx.setAttribute('font-size','9'); idx.setAttribute('fill','#5C6E8C');
      idx.setAttribute('font-family','JetBrains Mono, monospace');
      idx.textContent = '0'+(i+1);
      g.appendChild(idx);

      g.addEventListener('mouseenter', (e)=>highlight(i,true));
      g.addEventListener('mouseleave', ()=>highlight(i,false));
      g.addEventListener('click', (e)=>{ if(!isFull) showTooltip(e,d); });
      g.addEventListener('mousemove', (e)=>{ if(!isFull) moveTooltip(e); });

      svg.appendChild(g);
    });

    function highlight(i, on){
      const blocks = svg.querySelectorAll('.arch-block rect');
      blocks[i].setAttribute('stroke', on ? '#00D9FF' : '#1E304F');
      blocks[i].setAttribute('stroke-width', on ? '2' : '1.2');
    }
    function showTooltip(e,d){
      if(!tooltip) return;
      tooltip.innerHTML = '<strong style="color:#00D9FF">'+d.label.replace('\n',' ')+'</strong><br>'+d.desc;
      tooltip.classList.add('show');
      moveTooltip(e);
    }
    function moveTooltip(e){
      if(!tooltip) return;
      const wrap = svg.closest('.arch-wrap');
      const rect = wrap.getBoundingClientRect();
      tooltip.style.left = (e.clientX-rect.left+14)+'px';
      tooltip.style.top = (e.clientY-rect.top+14)+'px';
    }
    if(!isFull){
      svg.addEventListener('mouseleave', ()=>tooltip.classList.remove('show'));
      document.addEventListener('click',(e)=>{ if(!svg.contains(e.target)) tooltip.classList.remove('show'); });
    }
  }

  // Full architecture modal open/close + zoom/pan
  const fullArchBtn = document.getElementById('fullArchBtn');
  const fullArchModal = document.getElementById('fullArchModal');
  const closeArchModal = document.getElementById('closeArchModal');
  const fullArchStage = document.getElementById('fullArchStage');
  const fullArchSvg = document.getElementById('fullArchSvg');
  let zoom=1, panX=0, panY=0, dragging=false, lastX=0, lastY=0;

  fullArchBtn.addEventListener('click', ()=>{ fullArchModal.classList.add('show'); applyTransform(); });
  closeArchModal.addEventListener('click', ()=> fullArchModal.classList.remove('show'));
  fullArchModal.addEventListener('click',(e)=>{ if(e.target===fullArchModal) fullArchModal.classList.remove('show'); });

  fullArchStage.addEventListener('wheel',(e)=>{
    e.preventDefault();
    zoom = Math.min(3, Math.max(0.5, zoom + (e.deltaY>0?-0.1:0.1)));
    applyTransform();
  },{passive:false});
  fullArchStage.addEventListener('mousedown',(e)=>{ dragging=true; lastX=e.clientX; lastY=e.clientY; });
  window.addEventListener('mouseup',()=>dragging=false);
  window.addEventListener('mousemove',(e)=>{
    if(!dragging) return;
    panX += e.clientX-lastX; panY += e.clientY-lastY;
    lastX=e.clientX; lastY=e.clientY;
    applyTransform();
  });
  function applyTransform(){
    fullArchSvg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  }

  /* ---------------- SENSOR LAYER ---------------- */
  const sensors = [
    {name:'Voltage Sensor', model:'ZMPT101B', param:'AC Voltage', reading:'230.4 V', purpose:'Measures the AC supply voltage feeding the machine, used to detect over/under-voltage conditions.'},
    {name:'Current Sensor', model:'ACS712', param:'AC Current', reading:'1.25 A', purpose:'Measures the operating current draw, useful for detecting overload or stalled-motor conditions.'},
    {name:'Temp & Humidity', model:'DHT22', param:'Temperature / Humidity', reading:'32.6 °C / 56.2 %', purpose:'Monitors the ambient and surface environment around the machine.'},
    {name:'Vibration Sensor', model:'MPU6050', param:'Vibration / Motion', reading:'2.1 mm/s', purpose:'Detects abnormal vibration patterns often linked to bearing wear or misalignment.'},
    {name:'Optional Sensors', model:'Expandable', param:'Custom parameters', reading:'—', purpose:'The sensor layer is designed to support additional sensors as the platform scales.'}
  ];
  const sensorGrid = document.getElementById('sensorGrid');
  const sensorDetail = document.getElementById('sensorDetail');
  sensors.forEach((s,i)=>{
    const card = document.createElement('div');
    card.className = 'sensor-card';
    card.innerHTML = `<h4>${s.name}</h4><div class="sensor-model">${s.model}</div><p>${s.param}</p>`;
    card.addEventListener('click', ()=>{
      sensorGrid.querySelectorAll('.sensor-card').forEach(c=>c.classList.remove('active'));
      card.classList.add('active');
      sensorDetail.innerHTML = `<strong>${s.name} (${s.model})</strong><br>Parameter: ${s.param}<br>Example reading: ${s.reading}<br>Purpose: ${s.purpose}`;
    });
    sensorGrid.appendChild(card);
  });
  sensorGrid.firstChild.click();

  /* ---------------- ESP32 EDGE CANVAS ---------------- */
  initEdgeCanvas();
  function initEdgeCanvas(){
    const canvas = document.getElementById('edgeCanvas');
    const ctx = canvas.getContext('2d');
    let w,h,dpr;
    function resize(){
      dpr = Math.min(window.devicePixelRatio||1,2);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width=w*dpr; canvas.height=h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    window.addEventListener('resize', resize); resize();
    let frame=0;
    const inputs = 4, outputs = 2;
    function draw(){
      frame++;
      ctx.clearRect(0,0,w,h);
      const cx=w/2, cy=h/2, chipSize=Math.min(w,h)*0.22;
      // chip
      ctx.strokeStyle='#00D9FF'; ctx.lineWidth=1.6;
      ctx.strokeRect(cx-chipSize/2, cy-chipSize/2, chipSize, chipSize);
      ctx.fillStyle='#00D9FF'; ctx.font='11px JetBrains Mono, monospace'; ctx.textAlign='center';
      ctx.fillText('ESP32', cx, cy+4);
      // input pins (left) data flowing in
      for(let i=0;i<inputs;i++){
        const py = cy - chipSize/2 + (chipSize/(inputs-1))*i;
        const startX = cx-chipSize/2 - w*0.32;
        ctx.strokeStyle='rgba(30,48,79,0.9)';
        ctx.beginPath(); ctx.moveTo(startX,py); ctx.lineTo(cx-chipSize/2,py); ctx.stroke();
        const t = ((frame*0.01)+i*0.25)%1;
        const px = startX + (cx-chipSize/2-startX)*t;
        ctx.beginPath(); ctx.arc(px,py,2.4,0,Math.PI*2);
        ctx.fillStyle='#00D9FF'; ctx.shadowColor='#00D9FF'; ctx.shadowBlur=6; ctx.fill(); ctx.shadowBlur=0;
      }
      // output pins (right) processed data out
      for(let i=0;i<outputs;i++){
        const py = cy - chipSize/4 + (chipSize/2)*i;
        const endX = cx+chipSize/2 + w*0.32;
        ctx.strokeStyle='rgba(30,48,79,0.9)';
        ctx.beginPath(); ctx.moveTo(cx+chipSize/2,py); ctx.lineTo(endX,py); ctx.stroke();
        const t = ((frame*0.012)+i*0.4)%1;
        const px = (cx+chipSize/2) + (endX-(cx+chipSize/2))*t;
        ctx.beginPath(); ctx.arc(px,py,2.4,0,Math.PI*2);
        ctx.fillStyle='#FF9F1C'; ctx.shadowColor='#FF9F1C'; ctx.shadowBlur=6; ctx.fill(); ctx.shadowBlur=0;
      }
      ctx.fillStyle='#5C6E8C'; ctx.font='9px JetBrains Mono, monospace';
      ctx.textAlign='left'; ctx.fillText('RAW SENSOR DATA', 8, 16);
      ctx.textAlign='right'; ctx.fillText('MQTT →', w-8, 16);
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------------- DIGITAL TWIN ---------------- */
  const twinCanvas = document.getElementById('twinCanvas');
  const tctx = twinCanvas.getContext('2d');
  let tw,th,tdpr;
  function resizeTwin(){
    tdpr = Math.min(window.devicePixelRatio||1,2);
    tw = twinCanvas.offsetWidth; th = twinCanvas.offsetHeight;
    twinCanvas.width=tw*tdpr; twinCanvas.height=th*tdpr; tctx.setTransform(tdpr,0,0,tdpr,0,0);
  }
  window.addEventListener('resize', resizeTwin); resizeTwin();

  const sim = { temp:32.6, curr:1.25, volt:230.4, vib:2.1, hum:56.2 };
  const DEFAULT_SIM = {...sim};
  let tFrame=0;

  function computeHealth(){
    let score = 100;
    score -= Math.max(0, (sim.temp-45))*1.1;
    score -= Math.max(0, (sim.curr-4))*4;
    score -= Math.abs(sim.volt-230)*0.25;
    score -= Math.max(0, (sim.vib-4))*5;
    score = Math.max(2, Math.min(100, Math.round(score)));
    return score;
  }
  function statusFromHealth(h){
    if(h>=80) return {label:'HEALTHY', color:'#3ECF8E'};
    if(h>=55) return {label:'WARNING', color:'#FF9F1C'};
    return {label:'CRITICAL', color:'#FF4D5E'};
  }

  function drawTwin(){
    tFrame++;
    tctx.clearRect(0,0,tw,th);
    const health = computeHealth();
    const status = statusFromHealth(health);
    const cx=tw/2, cy=th/2+10;
    const shake = health<55 ? (Math.random()-0.5)*(health<35?5:2) : Math.sin(tFrame*0.05)*0.6;

    // machine body (simplified industrial motor silhouette)
    tctx.save();
    tctx.translate(cx+shake, cy);
    const bw = Math.min(tw,th)*0.34, bh = bw*0.62;
    tctx.strokeStyle = status.color; tctx.lineWidth=1.6; tctx.globalAlpha=0.9;
    tctx.strokeRect(-bw/2,-bh/2,bw,bh);
    // shaft
    tctx.beginPath(); tctx.moveTo(bw/2,0); tctx.lineTo(bw/2+bw*0.35,0); tctx.stroke();
    // fins
    for(let i=-2;i<=2;i++){
      tctx.beginPath(); tctx.moveTo(i*bw*0.15, -bh/2); tctx.lineTo(i*bw*0.15, -bh/2-8); tctx.stroke();
    }
    tctx.globalAlpha=1;
    tctx.restore();

    // rotating shaft indicator (speed relates to current)
    const speed = 0.02 + sim.curr*0.015;
    tctx.save();
    tctx.translate(cx+shake+bw/2+bw*0.35+shake*0, cy);
    tctx.rotate(tFrame*speed);
    tctx.strokeStyle = status.color; tctx.lineWidth=1.4;
    tctx.beginPath(); tctx.moveTo(-8,0); tctx.lineTo(8,0); tctx.stroke();
    tctx.beginPath(); tctx.moveTo(0,-8); tctx.lineTo(0,8); tctx.stroke();
    tctx.restore();

    // pulsing aura ring = health
    tctx.beginPath();
    tctx.arc(cx,cy, bw*0.9 + Math.sin(tFrame*0.04)*3, 0, Math.PI*2);
    tctx.strokeStyle = status.color; tctx.globalAlpha=0.18; tctx.lineWidth=8;
    tctx.stroke(); tctx.globalAlpha=1;

    // vibration wave under machine
    tctx.beginPath();
    const waveY = cy+bh/1.4;
    for(let x=cx-bw;x<=cx+bw;x+=4){
      const amp = 3+sim.vib*1.4;
      const y = waveY + Math.sin((x*0.2)+tFrame*0.15)*amp;
      x===cx-bw ? tctx.moveTo(x,y) : tctx.lineTo(x,y);
    }
    tctx.strokeStyle = status.color; tctx.globalAlpha=0.6; tctx.lineWidth=1.2; tctx.stroke(); tctx.globalAlpha=1;

    requestAnimationFrame(drawTwin);
  }
  drawTwin();

  // Health gauge (SVG arc)
  const gaugeSvg = document.getElementById('healthGauge');
  const gaugeNs = 'http://www.w3.org/2000/svg';
  const gaugeBg = document.createElementNS(gaugeNs,'circle');
  gaugeBg.setAttribute('cx',100); gaugeBg.setAttribute('cy',100); gaugeBg.setAttribute('r',82);
  gaugeBg.setAttribute('fill','none'); gaugeBg.setAttribute('stroke','#1E304F'); gaugeBg.setAttribute('stroke-width','10');
  gaugeSvg.appendChild(gaugeBg);
  const gaugeFg = document.createElementNS(gaugeNs,'circle');
  gaugeFg.setAttribute('cx',100); gaugeFg.setAttribute('cy',100); gaugeFg.setAttribute('r',82);
  gaugeFg.setAttribute('fill','none'); gaugeFg.setAttribute('stroke-width','10'); gaugeFg.setAttribute('stroke-linecap','round');
  gaugeFg.setAttribute('transform','rotate(-90 100 100)');
  const circumference = 2*Math.PI*82;
  gaugeFg.setAttribute('stroke-dasharray', circumference);
  gaugeSvg.appendChild(gaugeFg);

  function updateHealthGauge(h, color){
    const offset = circumference * (1 - h/100);
    gaugeFg.setAttribute('stroke-dashoffset', offset);
    gaugeFg.setAttribute('stroke', color);
  }

  const healthNum = document.getElementById('healthNum');
  const twinStatusValue = document.getElementById('twinStatusValue');

  function updateReadouts(){
    document.getElementById('rVoltage').textContent = sim.volt.toFixed(1)+' V';
    document.getElementById('rCurrent').textContent = sim.curr.toFixed(2)+' A';
    document.getElementById('rTemp').textContent = sim.temp.toFixed(1)+' °C';
    document.getElementById('rHumidity').textContent = sim.hum.toFixed(1)+' %';
    document.getElementById('rVibration').textContent = sim.vib.toFixed(1)+' mm/s';

    const health = computeHealth();
    const status = statusFromHealth(health);
    healthNum.textContent = health+'%';
    healthNum.style.color = status.color;
    twinStatusValue.textContent = status.label;
    twinStatusValue.style.color = status.color;
    updateHealthGauge(health, status.color);

    // sync dashboard
    document.getElementById('dashVolt').textContent = sim.volt.toFixed(1)+' V';
    document.getElementById('dashCurr').textContent = sim.curr.toFixed(2)+' A';
    document.getElementById('dashTemp').textContent = sim.temp.toFixed(1)+' °C';
    document.getElementById('dashHum').textContent = sim.hum.toFixed(1)+' %';
    document.getElementById('dashVib').textContent = sim.vib.toFixed(1)+' mm/s';
    document.getElementById('dashHealth').textContent = health+' / 100';
    document.getElementById('dashPower').textContent = Math.round(sim.volt*sim.curr)+' W';
    document.getElementById('dashStatus').textContent = health<55 ? (health<35?'FAULT':'DEGRADED') : 'RUNNING';

    pushChartPoint(health);
    maybeAlert(health, status);

    if(window.UniTwinTwin && window.UniTwinTwin.updateFromSim){
      window.UniTwinTwin.updateFromSim(sim, health, status.color);
    }
  }

  // Sliders
  const sliderMap = [
    ['tempSlider','tempOut',v=>v.toFixed(1)+' °C','temp'],
    ['currSlider','currOut',v=>v.toFixed(2)+' A','curr'],
    ['voltSlider','voltOut',v=>v.toFixed(1)+' V','volt'],
    ['vibSlider','vibOut',v=>v.toFixed(1)+' mm/s','vib'],
    ['humSlider','humOut',v=>v.toFixed(1)+' %','hum']
  ];
  sliderMap.forEach(([sliderId,outId,fmt,key])=>{
    const slider = document.getElementById(sliderId);
    const out = document.getElementById(outId);
    slider.addEventListener('input', ()=>{
      sim[key] = parseFloat(slider.value);
      out.textContent = fmt(sim[key]);
      updateReadouts();
    });
  });
  document.getElementById('resetSimBtn').addEventListener('click', ()=>{
    Object.assign(sim, DEFAULT_SIM);
    sliderMap.forEach(([sliderId,outId,fmt,key])=>{
      document.getElementById(sliderId).value = sim[key];
      document.getElementById(outId).textContent = fmt(sim[key]);
    });
    updateReadouts();
  });

  /* ---------------- ANOMALY SIMULATION ---------------- */
  const anomalyBtn = document.getElementById('anomalyBtn');
  const anomalyLog = document.getElementById('anomalyLog');
  let anomalyRunning = false;
  function logAnomaly(text){
    if(!anomalyLog) return;
    anomalyLog.textContent = text;
    anomalyLog.classList.add('show');
  }
  function syncSlidersFromSim(){
    sliderMap.forEach(([sliderId,outId,fmt,key])=>{
      document.getElementById(sliderId).value = sim[key];
      document.getElementById(outId).textContent = fmt(sim[key]);
    });
  }
  if(anomalyBtn){
    anomalyBtn.addEventListener('click', ()=>{
      if(anomalyRunning) return;
      anomalyRunning = true;
      anomalyBtn.disabled = true;
      const startVib = sim.vib, startTemp = sim.temp;

      logAnomaly('⚠ ANOMALY DETECTED');
      let step = 0;
      const rampSteps = 14;
      const rampTimer = setInterval(()=>{
        step++;
        sim.vib = startVib + (12-startVib)*(step/rampSteps);
        sim.temp = startTemp + (68-startTemp)*(step/rampSteps);
        syncSlidersFromSim();
        updateReadouts();
        if(step>=rampSteps) clearInterval(rampTimer);
      }, 120);

      setTimeout(()=> logAnomaly('AI analysis in progress…'), 1800);
      setTimeout(()=> logAnomaly('ABNORMAL VIBRATION PATTERN IDENTIFIED'), 3400);
      setTimeout(()=> logAnomaly('PREDICTIVE MAINTENANCE RECOMMENDED'), 5000);
      setTimeout(()=>{
        // decay back to normal
        let dstep = 0;
        const decaySteps = 16;
        const fromVib = sim.vib, fromTemp = sim.temp;
        const decayTimer = setInterval(()=>{
          dstep++;
          sim.vib = fromVib + (DEFAULT_SIM.vib-fromVib)*(dstep/decaySteps);
          sim.temp = fromTemp + (DEFAULT_SIM.temp-fromTemp)*(dstep/decaySteps);
          syncSlidersFromSim();
          updateReadouts();
          if(dstep>=decaySteps){
            clearInterval(decayTimer);
            anomalyLog.classList.remove('show');
            anomalyBtn.disabled = false;
            anomalyRunning = false;
          }
        }, 100);
      }, 7000);
    });
  }

  /* ---------------- DASHBOARD CHARTS ---------------- */
  const chartIds = ['chartTemp','chartCurr','chartVib','chartHealth'];
  const chartData = { chartTemp:[], chartCurr:[], chartVib:[], chartHealth:[] };
  const chartColors = { chartTemp:'#FF9F1C', chartCurr:'#00D9FF', chartVib:'#FF4D5E', chartHealth:'#3ECF8E' };
  const chartCtxs = {};
  chartIds.forEach(id=>{
    const c = document.getElementById(id);
    function resizeChart(){
      const dpr = Math.min(window.devicePixelRatio||1,2);
      c.width = c.offsetWidth*dpr; c.height = c.offsetHeight*dpr;
      c.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
    }
    window.addEventListener('resize', resizeChart);
    resizeChart();
    chartCtxs[id] = c.getContext('2d');
    for(let i=0;i<30;i++) chartData[id].push(id==='chartHealth'?92:baselineFor(id));
  });
  function baselineFor(id){
    if(id==='chartTemp') return 32.6;
    if(id==='chartCurr') return 1.25;
    if(id==='chartVib') return 2.1;
    return 92;
  }
  function pushChartPoint(health){
    chartData.chartTemp.push(sim.temp); chartData.chartTemp.shift();
    chartData.chartCurr.push(sim.curr); chartData.chartCurr.shift();
    chartData.chartVib.push(sim.vib); chartData.chartVib.shift();
    chartData.chartHealth.push(health); chartData.chartHealth.shift();
  }
  function drawCharts(){
    chartIds.forEach(id=>{
      const ctx = chartCtxs[id];
      const canvas = document.getElementById(id);
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0,0,w,h);
      const data = chartData[id];
      const min = Math.min(...data), max = Math.max(...data);
      const range = (max-min)||1;
      ctx.beginPath();
      data.forEach((v,i)=>{
        const x = (w/(data.length-1))*i;
        const y = h - ((v-min)/range)*h*0.8 - h*0.1;
        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      });
      ctx.strokeStyle = chartColors[id]; ctx.lineWidth=1.6; ctx.stroke();
      // fill
      ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath();
      ctx.globalAlpha=0.08; ctx.fillStyle=chartColors[id]; ctx.fill(); ctx.globalAlpha=1;
    });
    requestAnimationFrame(drawCharts);
  }
  drawCharts();

  /* ---------------- ALERTS ---------------- */
  const alertList = document.getElementById('alertList');
  let lastAlertLevel = null;
  function maybeAlert(health, status){
    let level, text;
    if(sim.vib>10){ level='crit'; text='🔴 HIGH VIBRATION DETECTED'; }
    else if(sim.curr>6){ level='crit'; text='🔴 OVER-CURRENT CONDITION'; }
    else if(sim.temp>60){ level='warn'; text='🟠 TEMPERATURE RISING'; }
    else if(health<70){ level='warn'; text='🟡 ABNORMAL OPERATING TREND'; }
    else { level='ok'; text='🟢 SYSTEM OPERATING NORMALLY'; }

    if(level !== lastAlertLevel){
      lastAlertLevel = level;
      const item = document.createElement('div');
      item.className = 'alert-item '+level;
      const time = new Date().toLocaleTimeString();
      item.textContent = text+'  ·  '+time;
      alertList.prepend(item);
      while(alertList.children.length>6) alertList.removeChild(alertList.lastChild);
    }
  }
  updateReadouts();
  setInterval(updateReadouts, 2600);

  /* ---------------- HARDWARE CONNECTION MAP ---------------- */
  const connections = [
    {name:'ACS712', dir:'→ ESP32', desc:'Current sensor feeds analog current readings into ESP32.'},
    {name:'ZMPT101B', dir:'→ ESP32', desc:'Voltage sensor feeds analog voltage readings into ESP32.'},
    {name:'DHT22', dir:'→ ESP32', desc:'Digital temperature & humidity data line into ESP32.'},
    {name:'MPU6050', dir:'→ ESP32', desc:'I2C vibration/motion data into ESP32.'},
    {name:'OLED', dir:'← ESP32', desc:'ESP32 drives the OLED display via I2C for local readouts.'},
    {name:'Buzzer', dir:'← ESP32', desc:'ESP32 triggers the buzzer on alert conditions.'},
    {name:'LEDs', dir:'← ESP32', desc:'ESP32 drives status LEDs for power and alert indication.'}
  ];
  const connMap = document.getElementById('connMap');
  connections.forEach(c=>{
    const el = document.createElement('div');
    el.className = 'conn-item';
    el.innerHTML = `<strong>${c.name}</strong> ${c.dir}`;
    el.addEventListener('click', ()=>{
      connMap.querySelectorAll('.conn-item').forEach(i=>i.classList.remove('active'));
      el.classList.add('active');
      el.innerHTML = `<strong>${c.name}</strong> ${c.dir}<br><span style="color:#8FA0BE">${c.desc}</span>`;
    });
    connMap.appendChild(el);
  });

  /* ---------------- APPLICATIONS ---------------- */
  const appDetails = {
    motor:'Industrial motors are the most common UniTwin AI target — vibration and current signatures reveal bearing wear, imbalance, and overload before failure.',
    pump:'Pumps benefit from vibration and current monitoring to catch cavitation, seal wear, and misalignment early.',
    hvac:'HVAC systems can be tracked for compressor current draw and temperature efficiency trends over time.',
    solar:'Solar installations can be monitored for panel/inverter voltage and current alongside ambient environmental conditions.',
    factory:'Smart factories can extend UniTwin AI across many assets for a unified Industry 4.0 monitoring layer.',
    fleet:'Fleet and mobile equipment can use the same sensing stack to track machine health across a distributed fleet.'
  };
  const appCards = document.querySelectorAll('.app-card');
  const appDetail = document.getElementById('appDetail');
  appCards.forEach(card=>{
    card.addEventListener('click', ()=>{
      appCards.forEach(c=>c.classList.remove('active'));
      card.classList.add('active');
      const key = card.getAttribute('data-app');
      appDetail.textContent = appDetails[key];
      appDetail.classList.add('show');
    });
  });

});
