/* ============================================================
   UniTwin AI — 3D Scene Module (Three.js, no build step)
   Provides: WebGL detection, procedural industrial motor,
   hero scene (ambient, parallax), digital twin scene
   (drag-rotate, wheel-zoom, exploded view, live data reactivity).
   Exposes window.UniTwinTwin.updateFromSim(sim, health, statusColor)
   ============================================================ */

(function(){

  function hasWebGL(){
    try{
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    }catch(e){ return false; }
  }

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = window.innerWidth < 760;

  if(!window.THREE || !hasWebGL()){
    document.body.classList.add('no-webgl');
    return; // 2D/SVG fallbacks already present in the DOM take over
  }

  /* ---------------- Procedural industrial motor ---------------- */
  function buildMotor(){
    const group = new THREE.Group();
    const parts = {};

    const metal = new THREE.MeshStandardMaterial({ color:0x8fa0be, metalness:0.75, roughness:0.35 });
    const metalDark = new THREE.MeshStandardMaterial({ color:0x2a3d5c, metalness:0.6, roughness:0.5 });
    const accent = new THREE.MeshStandardMaterial({ color:0x00d9ff, metalness:0.3, roughness:0.3, emissive:0x00d9ff, emissiveIntensity:0.25 });

    // Base plate
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 1.8), metalDark);
    base.position.set(0, -1.05, 0);
    group.add(base); parts.base = base; base.userData.home = base.position.clone();

    // Motor body (cylinder)
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.9, 28), metal);
    body.rotation.z = Math.PI/2;
    body.position.set(-0.2, -0.05, 0);
    group.add(body); parts.body = body; body.userData.home = body.position.clone();

    // Cooling fins (ring of thin boxes around body)
    const finsGroup = new THREE.Group();
    const finCount = 10;
    for(let i=0;i<finCount;i++){
      const fin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 0.14), metalDark);
      const angle = (i/finCount)*Math.PI*2;
      fin.position.set(-0.2, Math.sin(angle)*0.95, Math.cos(angle)*0.95);
      fin.rotation.x = angle;
      finsGroup.add(fin);
    }
    finsGroup.userData.home = new THREE.Vector3(-0.2,0,0);
    group.add(finsGroup); parts.fins = finsGroup;

    // Shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.3, 16), metal);
    shaft.rotation.z = Math.PI/2;
    shaft.position.set(1.55, -0.05, 0);
    group.add(shaft); parts.shaft = shaft; shaft.userData.home = shaft.position.clone();

    // Bearing (accent ring near shaft base)
    const bearing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 10, 24), accent);
    bearing.rotation.y = Math.PI/2;
    bearing.position.set(0.85, -0.05, 0);
    group.add(bearing); parts.bearing = bearing; bearing.userData.home = bearing.position.clone();

    // Fan at rear
    const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.12,16), metalDark);
    fan.rotation.z = Math.PI/2;
    fan.position.set(-1.15,-0.05,0);
    group.add(fan); parts.fan = fan; fan.userData.home = fan.position.clone();

    // Power input marker (small accent box on top)
    const powerIn = new THREE.Mesh(new THREE.BoxGeometry(0.22,0.22,0.22), accent);
    powerIn.position.set(-0.55, 0.55, 0);
    group.add(powerIn); parts.powerIn = powerIn; powerIn.userData.home = powerIn.position.clone();

    return { group, parts, shaftRef: shaft, fanRef: fan };
  }

  /* ---------------- Shared lighting rig ---------------- */
  function addLights(scene){
    const amb = new THREE.AmbientLight(0x5b6f92, 0.55);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(4,5,4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x00d9ff, 0.5);
    rim.position.set(-4,2,-3);
    scene.add(rim);
    const warm = new THREE.PointLight(0xff9f1c, 0.4, 12);
    warm.position.set(0,-2,3);
    scene.add(warm);
  }

  /* ================= HERO SCENE ================= */
  function initHero(){
    const mount = document.getElementById('hero3D');
    if(!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, mount.clientWidth/mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.3, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, isSmall?1.5:2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    addLights(scene);
    const { group, shaftRef, fanRef } = buildMotor();
    group.scale.setScalar(0.95);
    scene.add(group);

    // subtle particle field
    const particleCount = isSmall ? 60 : 160;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount*3);
    for(let i=0;i<particleCount;i++){
      positions[i*3] = (Math.random()-0.5)*14;
      positions[i*3+1] = (Math.random()-0.5)*8;
      positions[i*3+2] = (Math.random()-0.5)*10 - 2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions,3));
    const pMat = new THREE.PointsMaterial({ color:0x00d9ff, size:0.025, transparent:true, opacity:0.5 });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // sensor markers (world positions projected to 2D overlay)
    const sensorPoints = [
      { name:'TEMPERATURE', val:'32.6 °C', pos:new THREE.Vector3(-0.2,1.1,0.9) },
      { name:'CURRENT', val:'1.25 A', pos:new THREE.Vector3(-0.55,0.55,0) },
      { name:'VOLTAGE', val:'230.4 V', pos:new THREE.Vector3(-1.3,0.3,-0.8) },
      { name:'VIBRATION', val:'2.1 mm/s', pos:new THREE.Vector3(0.85,-0.6,0.9) },
      { name:'HUMIDITY', val:'56.2 %', pos:new THREE.Vector3(1.4,0.6,-0.6) }
    ];
    const overlay = document.getElementById('heroSensorOverlay');
    const markerEls = sensorPoints.map(s=>{
      const el = document.createElement('div');
      el.className = 'hero-sensor-marker';
      el.innerHTML = '<div class="dotmark"></div><span>'+s.name+'</span><span class="sensor-val">'+s.val+'</span>';
      overlay.appendChild(el);
      return el;
    });

    let mouseX=0, mouseY=0, targetX=0, targetY=0;
    mount.addEventListener('mousemove',(e)=>{
      const r = mount.getBoundingClientRect();
      mouseX = ((e.clientX-r.left)/r.width - 0.5);
      mouseY = ((e.clientY-r.top)/r.height - 0.5);
    });

    function resize(){
      camera.aspect = mount.clientWidth/mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }
    window.addEventListener('resize', resize);

    let frame=0;
    function animate(){
      frame++;
      targetX += (mouseX-targetX)*0.04;
      targetY += (mouseY-targetY)*0.04;
      camera.position.x = targetX*1.4;
      camera.position.y = 0.3 - targetY*0.8;
      camera.lookAt(0,0,0);

      if(!prefersReducedMotion){
        shaftRef.rotation.x += 0.045;
        fanRef.rotation.x += 0.045;
        group.rotation.y = Math.sin(frame*0.003)*0.12;
        points.rotation.y += 0.0006;
      }

      // project sensor markers to screen space
      sensorPoints.forEach((s,i)=>{
        const v = s.pos.clone().applyMatrix4(group.matrixWorld).project(camera);
        const x = (v.x*0.5+0.5)*mount.clientWidth;
        const y = (1-(v.y*0.5+0.5))*mount.clientHeight;
        markerEls[i].style.left = x+'px';
        markerEls[i].style.top = y+'px';
        markerEls[i].style.opacity = v.z < 1 ? '1' : '0';
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ================= DIGITAL TWIN SCENE (interactive) ================= */
  function initTwin(){
    const mount = document.getElementById('twin3D');
    if(!mount) return null;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth/mount.clientHeight, 0.1, 100);
    camera.position.set(0.5, 0.6, 6);

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, isSmall?1.5:2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    addLights(scene);
    const { group, parts, shaftRef, fanRef } = buildMotor();
    scene.add(group);

    // aura ring (health indicator)
    const auraGeo = new THREE.RingGeometry(1.65, 1.72, 48);
    const auraMat = new THREE.MeshBasicMaterial({ color:0x3ecf8e, transparent:true, opacity:0.35, side:THREE.DoubleSide });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.rotation.x = Math.PI/2;
    group.add(aura);

    // drag to rotate
    let dragging=false, lastX=0, lastY=0, rotY=0, rotX=0;
    mount.addEventListener('mousedown',(e)=>{ dragging=true; lastX=e.clientX; lastY=e.clientY; });
    window.addEventListener('mouseup',()=>dragging=false);
    window.addEventListener('mousemove',(e)=>{
      if(!dragging) return;
      rotY += (e.clientX-lastX)*0.006;
      rotX += (e.clientY-lastY)*0.006;
      rotX = Math.max(-0.5, Math.min(0.5, rotX));
      lastX=e.clientX; lastY=e.clientY;
    });
    // touch
    mount.addEventListener('touchstart',(e)=>{ dragging=true; lastX=e.touches[0].clientX; lastY=e.touches[0].clientY; },{passive:true});
    mount.addEventListener('touchmove',(e)=>{
      if(!dragging) return;
      rotY += (e.touches[0].clientX-lastX)*0.006;
      rotX += (e.touches[0].clientY-lastY)*0.006;
      rotX = Math.max(-0.5, Math.min(0.5, rotX));
      lastX=e.touches[0].clientX; lastY=e.touches[0].clientY;
    },{passive:true});
    mount.addEventListener('touchend',()=>dragging=false);

    // wheel zoom
    mount.addEventListener('wheel',(e)=>{
      e.preventDefault();
      camera.position.z = Math.min(9, Math.max(3.2, camera.position.z + (e.deltaY>0?0.35:-0.35)));
    },{passive:false});

    function resize(){
      camera.aspect = mount.clientWidth/mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }
    window.addEventListener('resize', resize);

    let exploded = false;
    function setExploded(state){
      exploded = state;
      const dir = state ? 1 : 0;
      const targets = {
        fins: new THREE.Vector3(-0.2, 0, 0).lerp(new THREE.Vector3(-1.4,0,0), dir),
        shaft: parts.shaft.userData.home.clone().lerp(new THREE.Vector3(2.6,-0.05,0), dir),
        bearing: parts.bearing.userData.home.clone().lerp(new THREE.Vector3(1.8,-0.05,0), dir),
        fan: parts.fan.userData.home.clone().lerp(new THREE.Vector3(-2.3,-0.05,0), dir),
        powerIn: parts.powerIn.userData.home.clone().lerp(new THREE.Vector3(-0.55,1.6,0), dir),
        base: parts.base.userData.home.clone().lerp(new THREE.Vector3(0,-2.1,0), dir)
      };
      if(window.gsap){
        gsap.to(parts.fins.position, {x:targets.fins.x, y:targets.fins.y, z:targets.fins.z, duration:0.8, ease:'power3.out'});
        gsap.to(parts.shaft.position, {x:targets.shaft.x, duration:0.8, ease:'power3.out'});
        gsap.to(parts.bearing.position, {x:targets.bearing.x, duration:0.8, ease:'power3.out'});
        gsap.to(parts.fan.position, {x:targets.fan.x, duration:0.8, ease:'power3.out'});
        gsap.to(parts.powerIn.position, {x:targets.powerIn.x, y:targets.powerIn.y, duration:0.8, ease:'power3.out'});
        gsap.to(parts.base.position, {y:targets.base.y, duration:0.8, ease:'power3.out'});
      } else {
        parts.fins.position.copy(targets.fins);
        parts.shaft.position.copy(targets.shaft);
        parts.bearing.position.copy(targets.bearing);
        parts.fan.position.copy(targets.fan);
        parts.powerIn.position.copy(targets.powerIn);
        parts.base.position.copy(targets.base);
      }
    }
    const explodeBtn = document.getElementById('explodeBtn');
    if(explodeBtn){
      explodeBtn.addEventListener('click', ()=>{
        setExploded(!exploded);
        explodeBtn.textContent = exploded ? 'Assembled View' : 'Exploded View';
      });
    }

    let vibJitter = 0;
    let shaftSpeed = 0.05;
    let currentColor = new THREE.Color(0x3ecf8e);
    let targetColor = new THREE.Color(0x3ecf8e);

    function updateFromSim(sim, health, colorHex){
      shaftSpeed = 0.02 + (sim.curr||1.25)*0.03;
      vibJitter = Math.max(0, ((sim.vib||2.1)-2)*0.01);
      targetColor = new THREE.Color(colorHex || '#3ecf8e');
      const auraScale = 1 + (health-92)*0.002;
      aura.scale.setScalar(Math.max(0.8, auraScale));
    }
    window.UniTwinTwin = { updateFromSim, setExploded:()=>{ setExploded(!exploded); if(explodeBtn) explodeBtn.textContent = exploded?'Assembled View':'Exploded View'; } };

    let frame=0;
    function animate(){
      frame++;
      currentColor.lerp(targetColor, 0.05);
      auraMat.color.copy(currentColor);
      parts.bearing.material.emissive = currentColor;
      parts.bearing.material.emissiveIntensity = 0.4;

      if(!prefersReducedMotion){
        shaftRef.rotation.x += shaftSpeed;
        fanRef.rotation.x += shaftSpeed;
        group.rotation.y = rotY + Math.sin(frame*0.01)*vibJitter;
        group.rotation.x = rotX;
        group.position.y = Math.sin(frame*0.4)*vibJitter*0.3;
        aura.rotation.z += 0.004;
      } else {
        group.rotation.y = rotY;
        group.rotation.x = rotX;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
    return { updateFromSim };
  }

  function boot(){
    initHero();
    initTwin();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
