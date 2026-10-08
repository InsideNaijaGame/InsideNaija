const express=require("express");
const http=require("http");
const helmet=require("helmet");
const rateLimit=require("express-rate-limit");
const {Server}=require("socket.io");

const app=express();
const server=http.createServer(app);
const io=new Server(server);
const PORT=process.env.PORT||3000;

app.use(helmet({contentSecurityPolicy:false}));
app.use(express.json({limit:"20kb"}));
app.use(rateLimit({windowMs:15*60*1000,max:300}));

// Temporary live-deployment store.
// Before taking real-money/player progress into production, connect PostgreSQL/Supabase.
const users=new Map();
const online=new Map();
const chat=[];

const HTML=`<!doctype html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#07132f"><meta name="description" content="InsideNaija Nigerian multiplayer life simulator">
<title>InsideNaija</title>
<style>
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#07132f;color:#fff;font-family:Arial,sans-serif}
#game{position:fixed;inset:0}canvas{display:block}.hud{position:fixed;inset:0;pointer-events:none;z-index:5}.top{display:flex;gap:6px;padding:9px}.pill{pointer-events:auto;background:#07132fee;border:1px solid #ffffff22;border-radius:20px;padding:9px 10px;font-size:12px}.money{margin-right:auto}
.loc{position:absolute;left:10px;top:58px;background:#07132fee;padding:9px;border-radius:12px;font-size:12px}
#actions{position:absolute;right:10px;bottom:108px;display:flex;flex-direction:column;gap:7px;pointer-events:auto}.act{width:52px;height:52px;border:0;border-radius:50%;background:#fff;color:#07132f;font-size:18px;font-weight:bold}
#joy{position:absolute;left:18px;bottom:24px;width:112px;height:112px;border-radius:50%;background:#07132f88;border:1px solid #ffffff30;pointer-events:auto}#stick{position:absolute;left:36px;top:36px;width:40px;height:40px;border-radius:50%;background:#fff}
#nav{position:absolute;left:8px;right:8px;bottom:8px;display:flex;gap:4px;pointer-events:auto}.nav{flex:1;border:1px solid #ffffff22;border-radius:11px;background:#07132fee;color:#fff;padding:10px 3px;font-size:10px;font-weight:700}
#panel{display:none;position:fixed;inset:0;z-index:20;background:#07132ff8;padding:18px;overflow:auto}.sheet{max-width:650px;margin:auto}.card{background:#10204a;border:1px solid #ffffff18;border-radius:15px;padding:13px;margin:9px 0}.close,.action{border:0;border-radius:10px;padding:9px 12px;font-weight:bold}.close{background:#fff;color:#07132f}.action{background:#1877f2;color:#fff}.row{display:flex;justify-content:space-between;align-items:center;gap:10px}.tag{display:inline-block;background:#1877f2;border-radius:12px;padding:5px 8px;margin:2px;font-size:11px}
input{width:100%;padding:12px;border-radius:10px;border:1px solid #ffffff22;background:#07132f;color:#fff;margin:5px 0}
</style></head><body>
<div id="game"></div><div class="hud">
<div class="top"><div class="pill money">💰 ₦<span id="cash">25000</span></div><div class="pill">❤️ <span id="hp">100</span></div><div class="pill">⚡ <span id="energy">100</span></div><div class="pill">⭐ <span id="xp">0</span></div><div class="pill">👥 <span id="online">1</span></div></div>
<div class="loc">📍 <b id="district">Ikeja</b> · <span id="place">Main Road</span></div>
<div id="actions"><button class="act" onclick="interact()">✋</button><button class="act" onclick="vehicle()">🚗</button></div>
<div id="joy"><div id="stick"></div></div>
<div id="nav"><button class="nav" onclick="panel('home')">🏠 Home</button><button class="nav" onclick="panel('map')">🗺️ Map</button><button class="nav" onclick="panel('jobs')">💼 Jobs</button><button class="nav" onclick="panel('phone')">📱 Phone</button><button class="nav" onclick="panel('profile')">🧑 Me</button></div></div>
<div id="panel"><div class="sheet"><div class="row"><h2 id="title">InsideNaija</h2><button class="close" onclick="closePanel()">Close</button></div><div id="body"></div></div></div>
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script>
let token=localStorage.getItem("insideNaijaToken")||"",username=localStorage.getItem("insideNaijaUser")||"guest",vehicleMode=false;
let cash=25000,hp=100,energy=100,xp=0,x=0,z=8,scene,camera,renderer,player,keys={};
function init(){scene=new THREE.Scene();scene.background=new THREE.Color(0x86c8eb);camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,500);renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);document.getElementById("game").appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xbfe7ff,0x34452a,2.2));let sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(30,50,20);scene.add(sun);world();player=avatar();player.position.set(0,1,8);scene.add(player);animate();}
function box(w,h,d,c,x,y,z){let m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c}));m.position.set(x,y,z);scene.add(m);return m}
function world(){box(90,.3,90,0x6f965a,0,0,0);box(90,.35,14,0x30343b,0,.2,0);box(14,.36,90,0x30343b,0,.21,0);for(let a=-35;a<=35;a+=12){box(6,8,6,0xb8c0c9,a,4,-22);box(6,5,6,0xe0a06b,a,2.5,22)}}
function avatar(){let g=new THREE.Group();let skin=new THREE.MeshStandardMaterial({color:0x7a4428}),shirt=new THREE.MeshStandardMaterial({color:0x1877f2});let h=new THREE.Mesh(new THREE.SphereGeometry(.38,16,16),skin);h.position.y=2.15;g.add(h);let b=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.75,6,12),shirt);b.position.y=1.25;g.add(b);for(let q of [-.23,.23]){let l=new THREE.Mesh(new THREE.BoxGeometry(.18,.75,.22),new THREE.MeshStandardMaterial({color:0x20242a}));l.position.set(q,.5,0);g.add(l)}return g}
function move(dx,dz){let sp=vehicleMode?.18:.11,l=Math.hypot(dx,dz)||1;x+=dx/l*sp;z+=dz/l*sp;x=Math.max(-42,Math.min(42,x));z=Math.max(-42,Math.min(42,z));player.position.set(x,1,z);energy=Math.max(5,energy-.03);syncMove();hud()}
function animate(){requestAnimationFrame(animate);if(keys.w||keys.arrowup)move(0,-1);if(keys.s||keys.arrowdown)move(0,1);if(keys.a||keys.arrowleft)move(-1,0);if(keys.d||keys.arrowright)move(1,0);camera.position.lerp(new THREE.Vector3(x,9,z+14),.08);camera.lookAt(x,1,z);renderer.render(scene,camera)}
function hud(){document.getElementById("cash").textContent=Math.floor(cash);document.getElementById("hp").textContent=hp;document.getElementById("energy").textContent=Math.floor(energy);document.getElementById("xp").textContent=Math.floor(xp)}
function syncMove(){if(window.socket&&socket.connected)socket.emit("player:move",{x,z,district:"Ikeja"})}
function panel(t){document.getElementById("panel").style.display="block";let b=document.getElementById("body");document.getElementById("title").textContent={home:"🏠 Home",map:"🗺️ Nigeria Map",jobs:"💼 Jobs",phone:"📱 Phone",profile:"🧑 Profile"}[t]||"InsideNaija";
if(t==="home")b.innerHTML='<div class=card><b>Starter Home</b><p>Rest and manage your life.</p><button class=action onclick="rest()">Rest</button></div><div class=card>🏠 Mini Flat upgrade · ₦120,000</div>';
if(t==="map")b.innerHTML='<div class=card><b>Current: Ikeja, Lagos</b><p><span class=tag>Lagos</span><span class=tag>FCT / Abuja</span><span class=tag>Oyo / Ibadan</span><span class=tag>Rivers / Port Harcourt</span><span class=tag>+ 32 states</span></p></div>';
if(t==="jobs")b.innerHTML='<div class=card>🛵 Delivery Rider · ₦1,200 <button class=action onclick="job(1200,80)">Work</button></div><div class=card>🛒 Market Assistant · ₦900 <button class=action onclick="job(900,60)">Work</button></div><div class=card>💼 Office Shift · ₦1,800 <button class=action onclick="job(1800,110)">Work</button></div>';
if(t==="phone")b.innerHTML='<div class=card>💬 Messages · Friends · World Chat</div><div class=card>🏦 Bank · 🎒 Inventory · 🚗 Vehicles</div><div class=card>🏠 Homes · 🧑 Avatar · 🎯 Missions</div><div class=card><input id="chat" placeholder="World message"><button class=action onclick="sendChat()">Send</button><div id="chatlog"></div></div>';
if(t==="profile")b.innerHTML='<div class=card><b>@'+username+'</b><p>Level 1 · '+xp+' XP</p><span class=tag>InsideNaija Citizen</span></div><div class=card>Health '+hp+'% · Energy '+Math.floor(energy)+'%</div>'}
function closePanel(){document.getElementById("panel").style.display="none"}
function rest(){energy=Math.min(100,energy+45);hp=Math.min(100,hp+15);hud();alert("You rested at home.")}
function job(c,e){cash+=c;xp+=e;energy=Math.max(10,energy-15);hud();alert("Job completed: +₦"+c+" and +"+e+" XP")}
function interact(){xp+=10;hud();alert("City interaction complete. +10 XP")}
function vehicle(){vehicleMode=!vehicleMode;document.getElementById("place").textContent=vehicleMode?"Driving":"Main Road"}
function sendChat(){let v=document.getElementById("chat");if(window.socket&&v.value.trim())socket.emit("chat:message",{text:v.value});v.value=""}
document.addEventListener("keydown",e=>keys[e.key.toLowerCase()]=true);document.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
let joy=document.getElementById("joy"),stick=document.getElementById("stick"),active=false;joy.addEventListener("pointerdown",e=>{active=true;joy.setPointerCapture(e.pointerId)});joy.addEventListener("pointermove",e=>{if(!active)return;let r=joy.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),l=Math.hypot(dx,dy)||1,m=Math.min(35,l);dx=dx/l*m;dy=dy/l*m;stick.style.transform='translate('+dx+'px,'+dy+'px)';if(m>7)move(dx/35,dy/35)});joy.addEventListener("pointerup",()=>{active=false;stick.style.transform=""});
const socket=io({auth:{token:token||"guest"}});window.socket=socket;socket.on("presence",p=>document.getElementById("online").textContent=p.online);socket.on("chat:message",m=>{let el=document.getElementById("chatlog");if(el)el.innerHTML+="<p><b>@"+m.username+"</b>: "+m.text.replace(/[<>&]/g,"")+"</p>"});
init();hud();
</script></body></html>`;

app.get("/",(req,res)=>res.type("html").send(HTML));
app.get("/api/health",(req,res)=>res.json({ok:true,version:"2.0",online:online.size}));
app.get("/manifest.json",(req,res)=>res.json({name:"InsideNaija",short_name:"InsideNaija",start_url:"/",display:"standalone",theme_color:"#07132f",background_color:"#07132f"}));
app.get("/sw.js",(req,res)=>res.type("application/javascript").send(`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('fetch',e=>e.respondWith(fetch(e.request).catch(()=>caches.match(e.request))))`));

io.on("connection",socket=>{
  const username=socket.handshake.auth?.token&&socket.handshake.auth.token!=="guest"?String(socket.handshake.auth.token).slice(0,24):"guest-"+socket.id.slice(0,5);
  online.set(socket.id,{id:socket.id,username,x:0,z:8,district:"Ikeja"});
  socket.emit("world:state",[...online.values()]);
  io.emit("presence",{online:online.size});
  socket.on("player:move",p=>{let me=online.get(socket.id);if(!me)return;me.x=Number(p.x)||0;me.z=Number(p.z)||0;socket.broadcast.emit("player:moved",me)});
  socket.on("chat:message",p=>{let text=String(p.text||"").trim().slice(0,300);if(!text)return;let msg={username,text,at:new Date().toISOString()};chat.push(msg);if(chat.length>100)chat.shift();io.emit("chat:message",msg)});
  socket.on("disconnect",()=>{online.delete(socket.id);io.emit("presence",{online:online.size})});
});
server.listen(PORT,()=>console.log("InsideNaija running on "+PORT));