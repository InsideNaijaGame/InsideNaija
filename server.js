const express=require('express');
const http=require('http');
const helmet=require('helmet');
const rateLimit=require('express-rate-limit');
const {Server}=require('socket.io');
const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:true,credentials:true}});
const PORT=process.env.PORT||3000;
app.use(helmet({contentSecurityPolicy:false}));
app.use(express.json({limit:'20kb'}));
app.use(rateLimit({windowMs:15*60*1000,max:500}));
const online=new Map();const chat=[];const VERSION='3.0.0';
const HTML=`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#07142f">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="manifest" href="/manifest.json">
<title>InsideNaija</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#07142f;color:#e8eef8;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;touch-action:none;-webkit-user-select:none;user-select:none}
#c{position:fixed;inset:0;display:block;width:100%;height:100%}
#ui{position:fixed;inset:0;pointer-events:none;z-index:10}
.topbar{display:flex;gap:6px;padding:calc(8px + env(safe-area-inset-top)) 10px 6px;overflow-x:auto}
.pill{background:rgba(7,20,47,.92);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:7px 11px;font-size:12px;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.35)}
.pill.money{margin-right:auto;color:#7dffa8;font-weight:700}
.loc{position:absolute;left:10px;top:58px;background:rgba(7,20,47,.9);border:1px solid rgba(255,255,255,.15);padding:8px 12px;border-radius:12px;font-size:12px}
#toast{position:absolute;left:50%;top:20%;transform:translateX(-50%);background:rgba(7,20,47,.95);border:1px solid rgba(255,255,255,.2);padding:10px 16px;border-radius:12px;font-size:13px;opacity:0;transition:opacity .25s;max-width:86%;text-align:center;z-index:40}
#toast.show{opacity:1}
.joy-wrap{position:absolute;left:14px;bottom:calc(100px + env(safe-area-inset-bottom));width:130px;height:130px;pointer-events:auto;z-index:20}
.joy-base{width:100%;height:100%;border-radius:50%;background:rgba(7,20,47,.75);border:2px solid rgba(255,255,255,.28);position:relative}
.joy-stick{position:absolute;left:50%;top:50%;width:50px;height:50px;margin:-25px 0 0 -25px;border-radius:50%;background:#fff;box-shadow:0 3px 10px rgba(0,0,0,.4)}
.btn-run{position:absolute;right:18px;bottom:calc(175px + env(safe-area-inset-bottom));width:58px;height:58px;border-radius:50%;border:2px solid rgba(255,255,255,.3);background:rgba(7,20,47,.85);color:#fff;font-weight:800;font-size:12px;pointer-events:auto;z-index:20}
.btn-run.active{background:#1a6b3a;border-color:#4ade80}
.btn-act{position:absolute;right:18px;bottom:calc(105px + env(safe-area-inset-bottom));width:58px;height:58px;border-radius:50%;border:2px solid rgba(255,255,255,.3);background:rgba(7,20,47,.85);color:#fff;font-weight:800;font-size:11px;pointer-events:auto;z-index:20}
.nav{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-around;padding:8px 6px calc(10px + env(safe-area-inset-bottom));background:linear-gradient(transparent,rgba(7,20,47,.95));pointer-events:auto;z-index:25}
.nav button{flex:1;max-width:90px;background:0;border:0;color:#c5d4f0;font-size:11px;font-weight:600;padding:8px 4px;display:flex;flex-direction:column;align-items:center;gap:3px}
.nav button span{font-size:18px}
.nav button.active{color:#7dffa8}
#panel{position:fixed;inset:0;background:rgba(4,10,24,.72);z-index:50;display:none;pointer-events:auto;align-items:flex-end;justify-content:center}
#panel.open{display:flex}
.sheet{width:100%;max-width:480px;max-height:82vh;background:#0b1a36;border-radius:18px 18px 0 0;border:1px solid rgba(255,255,255,.12);overflow:hidden;display:flex;flex-direction:column}
.sheet-h{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.1)}
.sheet-h h2{font-size:16px;font-weight:700}
.sheet-h button{background:rgba(255,255,255,.08);border:0;color:#fff;width:32px;height:32px;border-radius:8px;font-size:16px}
.sheet-b{overflow-y:auto;padding:12px 14px 24px;flex:1;-webkit-overflow-scrolling:touch}
.card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;margin-bottom:10px}
.card h3{font-size:14px;margin-bottom:4px}
.card p{font-size:12px;color:#a8b8d4;line-height:1.4}
.btn{display:inline-block;background:#1d6b45;border:0;color:#fff;padding:9px 14px;border-radius:10px;font-size:13px;font-weight:600;margin-top:8px;cursor:pointer}
.btn.sec{background:rgba(255,255,255,.1)}
.row{display:flex;gap:8px;flex-wrap:wrap}
.chip{background:rgba(255,255,255,.08);padding:6px 10px;border-radius:8px;font-size:12px}
.msg{padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13px}
.msg .u{color:#7dffa8;font-weight:600}
#chat-input{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(255,255,255,.1)}
#chat-input input{flex:1;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 12px;color:#fff;font-size:14px;outline:0}
#chat-input button{background:#1d6b45;border:0;color:#fff;padding:0 14px;border-radius:10px;font-weight:600}
.phone-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:8px 4px}
.phone-app{display:flex;flex-direction:column;align-items:center;gap:6px;background:0;border:0;color:#e8eef8;font-size:11px;padding:8px 4px}
.phone-app .ico{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;background:linear-gradient(145deg,#1a3a6e,#0d2244);border:1px solid rgba(255,255,255,.12)}
#loading{position:fixed;inset:0;background:#07142f;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
#loading h1{font-size:28px;font-weight:800}
#loading .bar{width:200px;height:6px;background:rgba(255,255,255,.1);border-radius:4px;overflow:hidden}
#loading .fill{height:100%;width:0%;background:linear-gradient(90deg,#2dd4a8,#3b82f6);transition:width .3s}
#loading p{font-size:13px;color:#8aa0c0}
</style></head><body>
<div id="loading"><h1>InsideNaija</h1><div class="bar"><div class="fill" id="lfill"></div></div><p id="ltext">Starting…</p></div>
<canvas id="c"></canvas>
<div id="ui">
<div class="topbar"><div class="pill money" id="cash">₦25,000</div><div class="pill" id="hp">❤️ 100</div><div class="pill" id="en">⚡ 100</div><div class="pill" id="xp">⭐ Lv1</div><div class="pill" id="on">🟢 1</div></div>
<div class="loc" id="loc">Lagos · Ikeja</div>
<div id="toast"></div>
<div class="joy-wrap" id="joy"><div class="joy-base"><div class="joy-stick" id="stick"></div></div></div>
<button class="btn-run" id="runBtn">RUN</button>
<button class="btn-act" id="actBtn">E</button>
<nav class="nav">
<button id="navHome" class="active"><span>🏠</span>Home</button>
<button id="navMap"><span>🗺️</span>Map</button>
<button id="navPhone"><span>📱</span>Phone</button>
<button id="navProfile"><span>👤</span>Profile</button>
</nav>
</div>
<div id="panel"><div class="sheet"><div class="sheet-h"><h2 id="ptitle">Panel</h2><button id="pclose">✕</button></div><div class="sheet-b" id="pbody"></div></div></div>
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/socket.io-client@4.8.1/dist/socket.io.min.js"></script>
<script>
(function(){
'use strict';
const $=id=>document.getElementById(id);
const STATES=[['Abia','Umuahia'],['Adamawa','Yola'],['Akwa Ibom','Uyo'],['Anambra','Awka'],['Bauchi','Bauchi'],['Bayelsa','Yenagoa'],['Benue','Makurdi'],['Borno','Maiduguri'],['Cross River','Calabar'],['Delta','Asaba'],['Ebonyi','Abakaliki'],['Edo','Benin City'],['Ekiti','Ado-Ekiti'],['Enugu','Enugu'],['Gombe','Gombe'],['Imo','Owerri'],['Jigawa','Dutse'],['Kaduna','Kaduna'],['Kano','Kano'],['Katsina','Katsina'],['Kebbi','Birnin Kebbi'],['Kogi','Lokoja'],['Kwara','Ilorin'],['Lagos','Ikeja'],['Nasarawa','Lafia'],['Niger','Minna'],['Ogun','Abeokuta'],['Ondo','Akure'],['Osun','Osogbo'],['Oyo','Ibadan'],['Plateau','Jos'],['Rivers','Port Harcourt'],['Sokoto','Sokoto'],['Taraba','Jalingo'],['Yobe','Damaturu'],['Zamfara','Gusau'],['FCT','Abuja']];
const JOBS=[{id:'super',name:'Supermarket Worker',pay:8500,xp:12,energy:18,skill:'Retail'},{id:'factory',name:'Factory Worker',pay:12000,xp:18,energy:28,skill:'Labour'},{id:'driver',name:'Danfo Driver',pay:15000,xp:20,energy:25,skill:'Driving'},{id:'mechanic',name:'Mechanic',pay:14000,xp:22,energy:22,skill:'Tech'},{id:'security',name:'Security Officer',pay:10000,xp:14,energy:20,skill:'Security'},{id:'teacher',name:'Teacher',pay:18000,xp:25,energy:15,skill:'Education'},{id:'nurse',name:'Nurse',pay:20000,xp:28,energy:22,skill:'Health'},{id:'dev',name:'Software Developer',pay:45000,xp:40,energy:12,skill:'Tech'},{id:'trader',name:'Market Trader',pay:16000,xp:20,energy:20,skill:'Business'},{id:'vendor',name:'Food Vendor',pay:9000,xp:15,energy:18,skill:'Cooking'},{id:'creator',name:'Content Creator',pay:25000,xp:30,energy:10,skill:'Media'},{id:'ent',name:'Entrepreneur',pay:0,xp:5,energy:5,skill:'Business'}];
let player={username:'Player',displayName:'Newcomer',state:'Lagos',city:'Ikeja',age:22,gender:'M',money:25000,bank:5000,energy:100,health:100,hunger:20,happiness:70,level:1,xp:0,job:null,skills:{Retail:0,Labour:0,Driving:0,Tech:0,Security:0,Education:0,Health:0,Business:0,Cooking:0,Media:0},inventory:[],house:null,vehicle:null};
try{const s=JSON.parse(localStorage.getItem('inSave_v3')||'null');if(s)Object.assign(player,s)}catch(e){}
function save(){try{localStorage.setItem('inSave_v3',JSON.stringify(player))}catch(e){}}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._tm);t._tm=setTimeout(()=>t.classList.remove('show'),2200)}
function fmt(n){return '₦'+Math.floor(n).toLocaleString('en-NG')}
function setProgress(p,txt){$('lfill').style.width=p+'%';if(txt)$('ltext').textContent=txt}

const canvas=$('c');
let renderer,scene,camera,clock,playerMesh,remotes={},joyVec={x:0,z:0},keys={},running=false,lastSend=0,socket=null,interactables=[];

function createHumanoid(color){
  const g=new THREE.Group();
  const skin=0xc68642,shirt=color||0x2b6cb0,pants=0x1a202c,shoe=0x111111;
  const legGeo=new THREE.CylinderGeometry(0.12,0.14,0.7,8);
  const legMat=new THREE.MeshStandardMaterial({color:pants,roughness:0.8});
  const lLeg=new THREE.Mesh(legGeo,legMat);lLeg.position.set(-0.15,0.35,0);lLeg.castShadow=true;
  const rLeg=new THREE.Mesh(legGeo,legMat);rLeg.position.set(0.15,0.35,0);rLeg.castShadow=true;
  g.add(lLeg,rLeg);
  const torso=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.65,0.32),new THREE.MeshStandardMaterial({color:shirt,roughness:0.7}));
  torso.position.y=1.05;torso.castShadow=true;g.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.22,12,10),new THREE.MeshStandardMaterial({color:skin,roughness:0.6}));
  head.position.y=1.55;head.castShadow=true;g.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(0.23,10,8,0,Math.PI*2,0,Math.PI*0.55),new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.9}));
  hair.position.y=1.62;g.add(hair);
  const armGeo=new THREE.CylinderGeometry(0.08,0.09,0.6,8);
  const armMat=new THREE.MeshStandardMaterial({color:shirt,roughness:0.7});
  const lArm=new THREE.Mesh(armGeo,armMat);lArm.position.set(-0.38,1.05,0);lArm.castShadow=true;
  const rArm=new THREE.Mesh(armGeo,armMat);rArm.position.set(0.38,1.05,0);rArm.castShadow=true;
  g.add(lArm,rArm);
  const handGeo=new THREE.SphereGeometry(0.09,8,6);
  const handMat=new THREE.MeshStandardMaterial({color:skin});
  const lHand=new THREE.Mesh(handGeo,handMat);lHand.position.set(-0.38,0.7,0);
  const rHand=new THREE.Mesh(handGeo,handMat);rHand.position.set(0.38,0.7,0);
  g.add(lHand,rHand);
  const shoeGeo=new THREE.BoxGeometry(0.18,0.1,0.28);
  const shoeMat=new THREE.MeshStandardMaterial({color:shoe});
  const lShoe=new THREE.Mesh(shoeGeo,shoeMat);lShoe.position.set(-0.15,0.05,0.04);
  const rShoe=new THREE.Mesh(shoeGeo,shoeMat);rShoe.position.set(0.15,0.05,0.04);
  g.add(lShoe,rShoe);
  g.userData={lLeg,rLeg,lArm,rArm,lHand,rHand,head,torso,walkPhase:0};
  return g;
}
function animateHumanoid(mesh,moving,speed,dt){
  if(!mesh||!mesh.userData)return;
  const u=mesh.userData;
  if(moving){
    u.walkPhase+=dt*speed*10;
    const swing=Math.sin(u.walkPhase)*0.55;
    u.lLeg.rotation.x=swing;u.rLeg.rotation.x=-swing;
    u.lArm.rotation.x=-swing*0.8;u.rArm.rotation.x=swing*0.8;
    u.lHand.position.z=Math.sin(u.walkPhase)*0.12;u.rHand.position.z=-Math.sin(u.walkPhase)*0.12;
    u.torso.position.y=1.05+Math.abs(Math.sin(u.walkPhase*2))*0.03;
    u.head.position.y=1.55+Math.abs(Math.sin(u.walkPhase*2))*0.02;
  }else{
    u.walkPhase+=dt*2;
    const breath=Math.sin(u.walkPhase)*0.015;
    u.torso.position.y=1.05+breath;u.head.position.y=1.55+breath;
    u.lLeg.rotation.x*=0.9;u.rLeg.rotation.x*=0.9;u.lArm.rotation.x*=0.9;u.rArm.rotation.x*=0.9;
  }
}
function buildWorld(){
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshStandardMaterial({color:0x3d5c3a,roughness:0.95}));
  ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  const roadMat=new THREE.MeshStandardMaterial({color:0x2a2a2e,roughness:0.9});
  const roadH=new THREE.Mesh(new THREE.PlaneGeometry(120,8),roadMat);roadH.rotation.x=-Math.PI/2;roadH.position.y=0.02;scene.add(roadH);
  const roadV=new THREE.Mesh(new THREE.PlaneGeometry(8,120),roadMat);roadV.rotation.x=-Math.PI/2;roadV.position.y=0.02;scene.add(roadV);
  const lineMat=new THREE.MeshBasicMaterial({color:0xf5e642});
  for(let i=-50;i<=50;i+=6){
    const ln=new THREE.Mesh(new THREE.PlaneGeometry(0.15,2.5),lineMat);ln.rotation.x=-Math.PI/2;ln.position.set(i,0.03,0);scene.add(ln);
    const ln2=new THREE.Mesh(new THREE.PlaneGeometry(2.5,0.15),lineMat);ln2.rotation.x=-Math.PI/2;ln2.position.set(0,0.03,i);scene.add(ln2);
  }
  const colors=[0xc4a882,0xe8d5b7,0x8b7355,0xd4a574,0xb8956a,0x6b8e6b,0x5a7a9a,0x9a6b5a];
  const places=[
    {x:-18,z:-14,w:8,d:7,h:6,name:'Mega Mart',type:'shop'},
    {x:16,z:-12,w:7,d:6,h:5,name:'Danfo Park',type:'transport'},
    {x:-20,z:14,w:9,d:8,h:8,name:'Tech Hub',type:'job'},
    {x:18,z:16,w:6,d:6,h:4,name:'Amala Spot',type:'food'},
    {x:-8,z:-22,w:10,d:8,h:7,name:'Flat Block',type:'home'},
    {x:10,z:22,w:7,d:7,h:5,name:'Clinic',type:'health'},
    {x:-28,z:0,w:5,d:5,h:4,name:'Mechanic',type:'job'},
    {x:28,z:-6,w:6,d:5,h:3,name:'Keke Stand',type:'transport'},
    {x:0,z:-30,w:12,d:6,h:9,name:'Bank HQ',type:'bank'},
    {x:-14,z:28,w:8,d:6,h:5,name:'School',type:'job'}
  ];
  places.forEach(p=>{
    const col=colors[Math.floor(Math.random()*colors.length)];
    const b=new THREE.Mesh(new THREE.BoxGeometry(p.w,p.h,p.d),new THREE.MeshStandardMaterial({color:col,roughness:0.85}));
    b.position.set(p.x,p.h/2,p.z);b.castShadow=true;b.receiveShadow=true;scene.add(b);
    const roof=new THREE.Mesh(new THREE.BoxGeometry(p.w+0.3,0.25,p.d+0.3),new THREE.MeshStandardMaterial({color:0x4a3728,roughness:0.9}));
    roof.position.set(p.x,p.h+0.12,p.z);scene.add(roof);
    interactables.push({x:p.x,z:p.z,r:Math.max(p.w,p.d)/2+2,name:p.name,type:p.type});
  });
  for(let i=0;i<24;i++){
    const tx=(Math.random()-0.5)*100,tz=(Math.random()-0.5)*100;
    if(Math.abs(tx)<6||Math.abs(tz)<6)continue;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.2,1.2,6),new THREE.MeshStandardMaterial({color:0x5c4033}));
    trunk.position.set(tx,0.6,tz);trunk.castShadow=true;scene.add(trunk);
    const leaves=new THREE.Mesh(new THREE.SphereGeometry(0.9+Math.random()*0.4,8,6),new THREE.MeshStandardMaterial({color:0x2d6a3e,roughness:0.9}));
    leaves.position.set(tx,1.8,tz);leaves.castShadow=true;scene.add(leaves);
  }
  for(let i=-40;i<=40;i+=16){
    [[i,5],[i,-5],[5,i],[-5,i]].forEach(([lx,lz])=>{
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,3.5,6),new THREE.MeshStandardMaterial({color:0x333338}));
      pole.position.set(lx,1.75,lz);scene.add(pole);
      const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.2,8,6),new THREE.MeshStandardMaterial({color:0xffeebb,emissive:0xffcc66,emissiveIntensity:0.6}));
      lamp.position.set(lx,3.5,lz);scene.add(lamp);
    });
  }
  const carColors=[0x1e3a5f,0x8b1a1a,0x2d5a2d,0xf5f5f5,0xf0c040];
  for(let i=0;i<6;i++){
    const cx=(Math.random()>0.5?1:-1)*(10+Math.random()*25),cz=(Math.random()-0.5)*40;
    const body=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.7,3.6),new THREE.MeshStandardMaterial({color:carColors[i%carColors.length]}));
    body.position.set(cx,0.45,cz);body.castShadow=true;scene.add(body);
    const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.55,1.8),new THREE.MeshStandardMaterial({color:0x88aacc,transparent:true,opacity:0.7}));
    cabin.position.set(cx,1.0,cz-0.2);scene.add(cabin);
  }
}
function initThree(){
  setProgress(20,'Loading engine…');
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.BasicShadowMap;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x87ceeb);scene.fog=new THREE.Fog(0x87ceeb,40,90);
  camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,0.1,120);
  clock=new THREE.Clock();
  scene.add(new THREE.AmbientLight(0xffffff,0.55));
  const sun=new THREE.DirectionalLight(0xfff5e0,1.1);
  sun.position.set(30,50,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.near=1;sun.shadow.camera.far=100;
  sun.shadow.camera.left=-40;sun.shadow.camera.right=40;sun.shadow.camera.top=40;sun.shadow.camera.bottom=-40;
  scene.add(sun);
  setProgress(40,'Building Lagos…');buildWorld();
  setProgress(60,'Creating character…');
  playerMesh=createHumanoid(0x2563eb);
  playerMesh.position.set(0,0,8);scene.add(playerMesh);
  const tagCanvas=document.createElement('canvas');tagCanvas.width=256;tagCanvas.height=64;
  const ctx=tagCanvas.getContext('2d');
  ctx.fillStyle='rgba(7,20,47,0.85)';ctx.beginPath();ctx.roundRect(0,8,256,48,8);ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 28px system-ui';ctx.textAlign='center';ctx.fillText(player.displayName||'You',128,42);
  const tag=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(tagCanvas),transparent:true}));
  tag.scale.set(2.2,0.55,1);tag.position.y=2.1;playerMesh.add(tag);
  setProgress(80,'Connecting…');
  window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
}
function updateCamera(){
  const target=playerMesh.position;
  const yaw=playerMesh.rotation.y;
  const desired=new THREE.Vector3(target.x+Math.sin(yaw)*11,target.y+7,target.z+Math.cos(yaw)*11);
  camera.position.lerp(desired,0.08);
  camera.lookAt(target.x,target.y+1.2,target.z);
}
function nearestInteractable(){
  let best=null,bestD=4;
  const px=playerMesh.position.x,pz=playerMesh.position.z;
  for(const it of interactables){const d=Math.hypot(it.x-px,it.z-pz);if(d<bestD){bestD=d;best=it}}
  return best;
}
function doInteract(){
  const it=nearestInteractable();
  if(!it){toast('Nothing nearby. Walk to a building.');return}
  if(it.type==='shop'){
    openPanel('Shopping',()=>{
      $('pbody').innerHTML='<div class="card"><h3>Mega Mart</h3><p>Buy food & supplies</p><button class="btn" data-buy="food">Buy Food ₦1,500</button> <button class="btn sec" data-buy="snack">Snack ₦500</button></div>';
      $('pbody').querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{
        const cost=b.dataset.buy==='food'?1500:500;
        if(player.money<cost)return toast('Not enough naira');
        player.money-=cost;player.hunger=Math.max(0,player.hunger-(cost===1500?40:15));player.energy=Math.min(100,player.energy+10);player.happiness=Math.min(100,player.happiness+5);save();hud();toast('Bought!');
      });
    });
  }else if(it.type==='food'){
    openPanel('Amala Spot',()=>{
      $('pbody').innerHTML='<div class="card"><h3>Amala + Ewedu</h3><p>₦2,000 · restores energy</p><button class="btn" id="eat">Order</button></div>';
      $('eat').onclick=()=>{if(player.money<2000)return toast('Not enough naira');player.money-=2000;player.energy=Math.min(100,player.energy+25);player.hunger=Math.max(0,player.hunger-50);player.happiness+=8;save();hud();toast('Sweet amala!')};
    });
  }else{openJobs()}
}
function hud(){$('cash').textContent=fmt(player.money);$('hp').textContent='❤️ '+Math.round(player.health);$('en').textContent='⚡ '+Math.round(player.energy);$('xp').textContent='⭐ Lv'+player.level;$('loc').textContent=player.state+' · '+player.city}
function openPanel(title,fill){$('ptitle').textContent=title;$('pbody').innerHTML='';fill();$('panel').classList.add('open')}
function closePanel(){$('panel').classList.remove('open')}
$('pclose').onclick=closePanel;
function openPhone(){
  openPanel('Phone',()=>{
    const apps=[{ico:'💬',n:'Messages',fn:openChat},{ico:'💼',n:'Jobs',fn:openJobs},{ico:'🏦',n:'Bank',fn:openBank},{ico:'🗺️',n:'Map',fn:openMap},{ico:'📇',n:'Profile',fn:openProfile},{ico:'🎒',n:'Inventory',fn:openInventory},{ico:'🚌',n:'Transport',fn:openTransport},{ico:'⚙️',n:'Settings',fn:openSettings}];
    let h='<div class="phone-grid">';apps.forEach(a=>{h+='<button class="phone-app"><div class="ico">'+a.ico+'</div>'+a.n+'</button>'});h+='</div>';
    $('pbody').innerHTML=h;
    $('pbody').querySelectorAll('.phone-app').forEach((btn,i)=>{btn.onclick=()=>{closePanel();setTimeout(apps[i].fn,150)}});
  });
}
function openChat(){
  openPanel('Messages',()=>{
    let h='<div id="msgs" style="min-height:180px;max-height:40vh;overflow-y:auto">';
    chat.slice(-40).forEach(m=>{h+='<div class="msg"><span class="u">@'+m.username+'</span><br>'+m.text+'</div>'});
    h+='</div><div id="chat-input"><input id="cinput" placeholder="Type a message…" maxlength="200"><button id="csend">Send</button></div>';
    $('pbody').innerHTML=h;
    const send=()=>{const text=($('cinput').value||'').trim();if(!text||!socket)return;socket.emit('chat:message',{text});$('cinput').value=''};
    $('csend').onclick=send;$('cinput').onkeydown=e=>{if(e.key==='Enter')send()};
  });
}
function openJobs(){
  openPanel('Jobs',()=>{
    let h='';
    if(player.job)h+='<div class="card"><h3>Current: '+player.job.name+'</h3><p>Pay ~'+fmt(player.job.pay)+'/shift</p><button class="btn" id="work">Work Shift</button> <button class="btn sec" id="quit">Quit</button></div>';
    h+='<h3 style="margin:12px 0 8px;font-size:14px">Available jobs</h3>';
    JOBS.forEach(j=>{h+='<div class="card"><h3>'+j.name+'</h3><p>'+fmt(j.pay)+' · +'+j.xp+' XP · -'+j.energy+' energy</p><button class="btn" data-j="'+j.id+'">Apply</button></div>'});
    $('pbody').innerHTML=h;
    if($('work'))$('work').onclick=doWork;
    if($('quit'))$('quit').onclick=()=>{player.job=null;save();toast('Quit job');openJobs()};
    $('pbody').querySelectorAll('[data-j]').forEach(b=>{b.onclick=()=>{const j=JOBS.find(x=>x.id===b.dataset.j);player.job=j;save();toast('Hired as '+j.name);openJobs()}});
  });
}
function doWork(){
  if(!player.job)return;
  if(player.energy<player.job.energy)return toast('Too tired. Rest or eat first.');
  player.energy-=player.job.energy;player.money+=player.job.pay;player.xp+=player.job.xp;
  if(player.job.skill&&player.skills[player.job.skill]!==undefined)player.skills[player.job.skill]=Math.min(100,player.skills[player.job.skill]+2);
  while(player.xp>=player.level*100){player.xp-=player.level*100;player.level++;toast('Level up! Lv'+player.level)}
  player.hunger=Math.min(100,player.hunger+10);save();hud();toast('Shift done. Earned '+fmt(player.job.pay));
}
function openBank(){
  openPanel('Bank',()=>{
    $('pbody').innerHTML='<div class="card"><h3>Wallet</h3><p>'+fmt(player.money)+'</p></div><div class="card"><h3>Bank Account</h3><p>'+fmt(player.bank)+'</p><div class="row" style="margin-top:8px"><button class="btn" id="dep">Deposit ₦5,000</button><button class="btn sec" id="wd">Withdraw ₦5,000</button></div></div>';
    $('dep').onclick=()=>{if(player.money<5000)return toast('Not enough cash');player.money-=5000;player.bank+=5000;save();hud();openBank()};
    $('wd').onclick=()=>{if(player.bank<5000)return toast('Insufficient funds');player.bank-=5000;player.money+=5000;save();hud();openBank()};
  });
}
function openMap(){
  openPanel('Nigeria Map',()=>{
    let h='<input id="search" placeholder="Search state…" style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;margin-bottom:10px"><div id="slist"></div>';
    $('pbody').innerHTML=h;
    const render=q=>{
      const qq=(q||'').toLowerCase();let html='';
      STATES.filter(s=>!qq||s[0].toLowerCase().includes(qq)||s[1].toLowerCase().includes(qq)).forEach(s=>{
        html+='<div class="card" style="padding:10px;cursor:pointer" data-s="'+s[0]+'" data-c="'+s[1]+'"><h3 style="margin:0;font-size:13px">'+s[0]+'</h3><p style="margin:2px 0 0">'+s[1]+'</p></div>';
      });
      $('slist').innerHTML=html;
      $('slist').querySelectorAll('[data-s]').forEach(el=>{el.onclick=()=>{
        if(player.energy<15)return toast('Too tired to travel');
        player.energy-=15;player.state=el.dataset.s;player.city=el.dataset.c;player.money=Math.max(0,player.money-2000);save();hud();toast('Travelled to '+player.state);closePanel();
      }});
    };
    render('');$('search').oninput=e=>render(e.target.value);
  });
}
function openProfile(){
  openPanel('Profile',()=>{
    const sk=Object.entries(player.skills).filter(([,v])=>v>0).map(([k,v])=>k+': '+v).join(', ')||'None yet';
    $('pbody').innerHTML='<div class="card"><h3>'+(player.displayName||'Player')+'</h3><p>Lv'+player.level+' · '+player.state+'</p></div><div class="card"><h3>Stats</h3><p>Money '+fmt(player.money)+' · Bank '+fmt(player.bank)+'</p><p>Energy '+Math.round(player.energy)+' · Health '+Math.round(player.health)+'</p><p>Hunger '+Math.round(player.hunger)+' · Happiness '+Math.round(player.happiness)+'</p></div><div class="card"><h3>Job</h3><p>'+(player.job?player.job.name:'Unemployed')+'</p></div><div class="card"><h3>Skills</h3><p>'+sk+'</p></div><div class="card"><h3>Display name</h3><input id="dname" value="'+(player.displayName||'')+'" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff"><button class="btn" id="sname">Save</button></div>';
    $('sname').onclick=()=>{player.displayName=($('dname').value||'Player').slice(0,20);save();toast('Name updated')};
  });
}
function openInventory(){openPanel('Inventory',()=>{$('pbody').innerHTML='<div class="card"><h3>Your items</h3><p>'+(player.inventory.length?player.inventory.join(', '):'Empty — buy at shops')+'</p></div>'})}
function openTransport(){
  openPanel('Transport',()=>{
    const opts=[{n:'Walk',c:0,e:0},{n:'Okada',c:800,e:5},{n:'Keke',c:500,e:3},{n:'Taxi',c:2500,e:2},{n:'Bus',c:300,e:4}];
    let h='';opts.forEach(o=>{h+='<div class="card"><h3>'+o.n+'</h3><p>'+fmt(o.c)+' · energy -'+o.e+'</p><button class="btn" data-t="'+o.n+'" data-c="'+o.c+'" data-e="'+o.e+'">Use</button></div>'});
    $('pbody').innerHTML=h;
    $('pbody').querySelectorAll('[data-t]').forEach(b=>{b.onclick=()=>{const c=+b.dataset.c,e=+b.dataset.e;if(player.money<c)return toast('Not enough naira');player.money-=c;player.energy=Math.max(0,player.energy-e);save();hud();toast('Took '+b.dataset.t);closePanel()}});
  });
}
function openSettings(){openPanel('Settings',()=>{$('pbody').innerHTML='<div class="card"><h3>InsideNaija v3.0.0</h3><p>Mobile-first Nigerian life sim</p></div><div class="card"><button class="btn sec" id="reset">Reset local progress</button></div>';$('reset').onclick=()=>{localStorage.removeItem('inSave_v3');location.reload()}})}
$('navHome').onclick=()=>{closePanel();document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));$('navHome').classList.add('active')};
$('navMap').onclick=()=>{document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));$('navMap').classList.add('active');openMap()};
$('navPhone').onclick=()=>{document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));$('navPhone').classList.add('active');openPhone()};
$('navProfile').onclick=()=>{document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));$('navProfile').classList.add('active');openProfile()};
$('actBtn').onclick=doInteract;
$('runBtn').onclick=()=>{running=!running;$('runBtn').classList.toggle('active',running)};
(function(){
  const base=$('joy'),stick=$('stick');let active=false,cx,cy,maxR=40;
  function start(e){active=true;const r=base.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;move(e)}
  function move(e){if(!active)return;const t=e.touches?e.touches[0]:e;let dx=t.clientX-cx,dy=t.clientY-cy;const len=Math.hypot(dx,dy)||1;if(len>maxR){dx=dx/len*maxR;dy=dy/len*maxR}stick.style.transform='translate('+dx+'px,'+dy+'px)';joyVec.x=dx/maxR;joyVec.z=dy/maxR}
  function end(){active=false;stick.style.transform='translate(0,0)';joyVec.x=0;joyVec.z=0}
  base.addEventListener('touchstart',start,{passive:false});base.addEventListener('touchmove',e=>{e.preventDefault();move(e)},{passive:false});base.addEventListener('touchend',end);
  base.addEventListener('mousedown',start);window.addEventListener('mousemove',move);window.addEventListener('mouseup',end);
})();
window.addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='ShiftLeft'||e.code==='ShiftRight'){running=true;$('runBtn').classList.add('active')}if(e.code==='KeyE')doInteract()});
window.addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='ShiftLeft'||e.code==='ShiftRight'){running=false;$('runBtn').classList.remove('active')}});
function connectSocket(){
  try{
    socket=io({transports:['websocket','polling']});
    socket.on('connect',()=>{socket.emit('player:join',{username:player.displayName||'Player',x:playerMesh.position.x,z:playerMesh.position.z})});
    socket.on('presence',d=>{$('on').textContent='🟢 '+(d.online||1)});
    socket.on('world:state',list=>{list.forEach(p=>{if(p.id===socket.id)return;if(!remotes[p.id]){const m=createHumanoid(0x16a34a);m.position.set(p.x,0,p.z);scene.add(m);remotes[p.id]={mesh:m,x:p.x,z:p.z}}})});
    socket.on('player:moved',p=>{if(p.id===socket.id)return;if(!remotes[p.id]){const m=createHumanoid(0x16a34a);scene.add(m);remotes[p.id]={mesh:m}}const r=remotes[p.id];r.tx=p.x;r.tz=p.z});
    socket.on('player:left',id=>{if(remotes[id]){scene.remove(remotes[id].mesh);delete remotes[id]}});
    socket.on('chat:message',m=>{chat.push(m);if(chat.length>80)chat.shift();if($('msgs')){const d=document.createElement('div');d.className='msg';d.innerHTML='<span class="u">@'+m.username+'</span><br>'+m.text;$('msgs').appendChild(d);$('msgs').scrollTop=$('msgs').scrollHeight}});
  }catch(e){console.warn(e)}
}
function loop(){
  requestAnimationFrame(loop);
  const dt=Math.min(clock.getDelta(),0.05);
  let dx=joyVec.x,dz=joyVec.z;
  if(keys['KeyW']||keys['ArrowUp'])dz-=1;if(keys['KeyS']||keys['ArrowDown'])dz+=1;
  if(keys['KeyA']||keys['ArrowLeft'])dx-=1;if(keys['KeyD']||keys['ArrowRight'])dx+=1;
  const len=Math.hypot(dx,dz);let moving=false;
  if(len>0.05&&player.energy>0){
    moving=true;dx/=len;dz/=len;
    const speed=running?0.22:0.12;
    playerMesh.position.x=Math.max(-50,Math.min(50,playerMesh.position.x+dx*speed));
    playerMesh.position.z=Math.max(-50,Math.min(50,playerMesh.position.z+dz*speed));
    playerMesh.rotation.y=Math.atan2(dx,dz);
    player.energy=Math.max(0,player.energy-(running?0.04:0.015));
    if(Date.now()-lastSend>80&&socket&&socket.connected){lastSend=Date.now();socket.emit('player:move',{x:playerMesh.position.x,z:playerMesh.position.z})}
  }
  animateHumanoid(playerMesh,moving,running?1.4:1,dt);
  Object.values(remotes).forEach(r=>{
    if(r.tx!==undefined){
      const mx=r.tx-r.mesh.position.x,mz=r.tz-r.mesh.position.z,ml=Math.hypot(mx,mz);
      if(ml>0.05){r.mesh.position.x+=mx*0.15;r.mesh.position.z+=mz*0.15;r.mesh.rotation.y=Math.atan2(mx,mz);animateHumanoid(r.mesh,true,1,dt)}
      else animateHumanoid(r.mesh,false,1,dt);
    }
  });
  updateCamera();renderer.render(scene,camera);
  if(Math.random()<0.01){hud();save()}
}
setProgress(10,'Preparing…');initThree();hud();connectSocket();setProgress(100,'Ready!');
setTimeout(()=>{$('loading').style.display='none';loop();toast('Welcome to InsideNaija · Lagos')},400);
})();
</script></body></html>`;
app.get('/',(req,res)=>res.type('html').send(HTML));
app.get('/api/health',(req,res)=>res.json({ok:true,version:VERSION,online:online.size}));
app.get('/manifest.json',(req,res)=>res.json({name:'InsideNaija',short_name:'InsideNaija',start_url:'/',display:'standalone',orientation:'portrait',theme_color:'#07142f',background_color:'#07142f'}));
app.get('/sw.js',(req,res)=>res.type('application/javascript').send(`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.clients.claim());`));
io.on('connection',socket=>{
  const username='Player-'+socket.id.slice(0,5);
  online.set(socket.id,{id:socket.id,username,x:0,z:8});
  socket.emit('world:state',[...online.values()]);
  io.emit('presence',{online:online.size});
  socket.on('player:join',p=>{const me=online.get(socket.id);if(!me)return;if(p.username)me.username=String(p.username).slice(0,20);if(p.x!=null)me.x=Number(p.x)||0;if(p.z!=null)me.z=Number(p.z)||8;socket.broadcast.emit('player:moved',me)});
  socket.on('player:move',p=>{const me=online.get(socket.id);if(!me)return;me.x=Math.max(-50,Math.min(50,Number(p.x)||0));me.z=Math.max(-50,Math.min(50,Number(p.z)||0));socket.broadcast.emit('player:moved',me)});
  socket.on('chat:message',p=>{const me=online.get(socket.id);const text=String(p.text||'').trim().slice(0,240);if(!text)return;const msg={username:me?me.username:username,text,ts:new Date().toLocaleTimeString()};chat.push(msg);if(chat.length>80)chat.shift();io.emit('chat:message',msg)});
  socket.on('disconnect',()=>{online.delete(socket.id);io.emit('player:left',socket.id);io.emit('presence',{online:online.size})});
});
server.listen(PORT,()=>console.log('InsideNaija '+VERSION+' running on '+PORT));
