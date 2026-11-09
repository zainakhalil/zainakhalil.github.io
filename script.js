const places = [
  {name:'Cairo', country:'Egypt', note:'Family roots · where the stories begin', kind:'home', lat:30.0444, lng:31.2357, symbol:'✳'},
  {name:'Chicago', country:'Illinois, USA', note:'UIC · B.S. Data Science', kind:'home', lat:41.8781, lng:-87.6298, symbol:'⌂'},
  {name:'Urbana-Champaign', country:'Illinois, USA', note:'UIUC · MCS in Data Science', kind:'home', lat:40.1106, lng:-88.2073, symbol:'⌂'},
  {name:'Sohag', country:'Egypt', note:'A little farther south', kind:'trip', lat:26.5591, lng:31.6948},
  {name:'Istanbul', country:'Türkiye', note:'Between two continents', kind:'trip', lat:41.0082, lng:28.9784},
  {name:'Tangier', country:'Morocco', note:'North coast', kind:'trip', lat:35.7595, lng:-5.8340},
  {name:'Chefchaouen', country:'Morocco', note:'The blue city', kind:'trip', lat:35.1688, lng:-5.2636},
  {name:'Rabat', country:'Morocco', note:'Capital city', kind:'trip', lat:34.0209, lng:-6.8498},
  {name:'Fes', country:'Morocco', note:'Old medina wanderings', kind:'trip', lat:34.0181, lng:-5.0078},
  {name:'Cancún', country:'Mexico', note:'Yucatán Peninsula', kind:'trip', lat:21.1619, lng:-86.8515},
  {name:'Cabo San Lucas', country:'Mexico', note:'Baja California Sur', kind:'trip', lat:22.8905, lng:-109.9167},
  {name:'La Paz', country:'Mexico', note:'Sea of Cortez', kind:'trip', lat:24.1426, lng:-110.3128},
  {name:'Puerto Vallarta', country:'Mexico', note:'Pacific coast', kind:'trip', lat:20.6534, lng:-105.2253},
  {name:'Dominican Republic', country:'Caribbean', note:'A Caribbean stop', kind:'trip', lat:18.4861, lng:-69.9312},
  {name:'Puerto Rico', country:'Caribbean', note:'Island days', kind:'trip', lat:18.4655, lng:-66.1057},
  {name:'San Diego', country:'California, USA', note:'West coast', kind:'trip', lat:32.7157, lng:-117.1611},
  {name:'Los Angeles', country:'California, USA', note:'West coast', kind:'trip', lat:34.0522, lng:-118.2437},
  {name:'Dallas', country:'Texas, USA', note:'A Texas stop', kind:'trip', lat:32.7767, lng:-96.7970},
  {name:'Ann Arbor', country:'Michigan, USA', note:'A Midwest visit', kind:'trip', lat:42.2808, lng:-83.7430}
];

const svg = document.getElementById('map-svg');
const pinLayer = document.getElementById('map-pins');
const list = document.getElementById('place-list');
const callout = document.getElementById('map-callout');
const base = {x:0,y:0,w:1000,h:560};
let activeFilter = 'all';
let selectedIndex = -1;
let view = {...base};
let dragStart = null;

const project = place => ({x:(place.lng+130)/170*1000,y:(60-place.lat)/55*560});
const visiblePlaces = () => places.map((p,i)=>({p,i})).filter(({p})=>activeFilter==='all'||p.kind===activeFilter);

function setView(next, animate=true){
  view={x:next.x,y:next.y,w:next.w,h:next.h};
  svg.style.transition=animate?'viewBox .55s cubic-bezier(.2,.7,.2,1)':'none';
  svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);
}

function fitPlaces(items, animate=true){
  if(!items.length){setView(base,animate);return}
  const pts=items.map(({p})=>project(p));
  const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);
  const dx=Math.max(pts.length===1?280:140,Math.max(...xs)-Math.min(...xs)+180);
  const dy=Math.max(pts.length===1?170:100,Math.max(...ys)-Math.min(...ys)+140);
  const ratio=1000/560;
  let w=Math.min(1000,Math.max(dx,dy*ratio)),h=w/ratio;
  if(h>560){h=560;w=1000}
  const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
  setView({x:Math.max(0,Math.min(1000-w,cx-w/2)),y:Math.max(0,Math.min(560-h,cy-h/2)),w,h},animate);
}

function renderPins(){
  pinLayer.innerHTML=places.map((p,i)=>{
    const {x,y}=project(p);
    return `<g class="map-pin ${p.kind==='trip'?'trip':''} ${selectedIndex===i?'selected':''}" data-index="${i}" tabindex="0" role="button" aria-label="${p.name}, ${p.country}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><circle class="pin-halo" r="8.5"/><circle class="pin-core" r="3.2"/><title>${p.name}, ${p.country}</title></g>`;
  }).join('');
  pinLayer.querySelectorAll('.map-pin').forEach(pin=>{
    pin.addEventListener('click',()=>selectPlace(Number(pin.dataset.index),true));
    pin.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectPlace(Number(pin.dataset.index),true)}});
  });
}

function renderList(){
  const visible=visiblePlaces();
  list.innerHTML=visible.map(({p,i})=>`<button class="place-item ${selectedIndex===i?'selected':''}" data-index="${i}" data-kind="${p.kind}" type="button"><span class="place-symbol">${p.symbol||'·'}</span><span class="place-text"><b>${p.name}</b><small>${p.country}</small></span></button>`).join('');
  document.getElementById('visible-count').textContent=visible.length;
  list.querySelectorAll('.place-item').forEach(button=>button.addEventListener('click',()=>selectPlace(Number(button.dataset.index),true)));
  pinLayer.querySelectorAll('.map-pin').forEach(pin=>{
    const place=places[Number(pin.dataset.index)];
    pin.style.display=activeFilter==='all'||place.kind===activeFilter?'':'none';
  });
}

function selectPlace(index, zoom){
  selectedIndex=index;
  const place=places[index];
  const point=project(place);
  renderPins();renderList();
  callout.innerHTML=`<span class="callout-kicker">${place.kind==='home'?'HOME BASE':'ON THE MAP'}</span><b>${place.name}</b><small>${place.note} · ${place.country}</small>`;
  if(zoom){const w=390,h=w/(1000/560);setView({x:Math.max(0,Math.min(1000-w,point.x-w/2)),y:Math.max(0,Math.min(560-h,point.y-h/2)),w,h});}
}

document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{
  activeFilter=button.dataset.filter;selectedIndex=-1;
  document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===button));
  callout.innerHTML='<span class="callout-kicker">PICK A PIN</span><b>Places, in passing</b><small>Tap a dot or a place name to zoom in.</small>';
  renderList();fitPlaces(visiblePlaces());
}));

document.getElementById('map-reset').addEventListener('click',()=>{
  activeFilter='all';selectedIndex=-1;
  document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));
  callout.innerHTML='<span class="callout-kicker">PICK A PIN</span><b>Places, in passing</b><small>Tap a dot or a place name to zoom in.</small>';
  renderList();setView(base);
});

document.getElementById('zoom-in').addEventListener('click',()=>{
  const w=view.w*.72,h=view.h*.72;setView({x:view.x+(view.w-w)/2,y:view.y+(view.h-h)/2,w,h});
});
document.getElementById('zoom-out').addEventListener('click',()=>{
  const w=Math.min(base.w,view.w/0.72),h=Math.min(base.h,view.h/0.72);setView({x:Math.max(0,Math.min(base.w-w,view.x-(w-view.w)/2)),y:Math.max(0,Math.min(base.h-h,view.y-(h-view.h)/2)),w,h});
});

svg.addEventListener('wheel',event=>{
  event.preventDefault();
  const rect=svg.getBoundingClientRect(),px=(event.clientX-rect.left)/rect.width,py=(event.clientY-rect.top)/rect.height;
  const factor=event.deltaY<0?.82:1.22,w=Math.min(1000,view.w*factor),h=Math.min(560,view.h*factor);
  setView({x:Math.max(0,Math.min(1000-w,view.x+(view.w-w)*px)),y:Math.max(0,Math.min(560-h,view.y+(view.h-h)*py)),w,h},false);
},{passive:false});

svg.addEventListener('pointerdown',event=>{
  if(event.target.closest('.map-pin'))return;
  dragStart={x:event.clientX,y:event.clientY,view:{...view}};svg.classList.add('dragging');svg.setPointerCapture(event.pointerId);svg.style.transition='none';
});
svg.addEventListener('pointermove',event=>{
  if(!dragStart)return;
  const rect=svg.getBoundingClientRect(),dx=(event.clientX-dragStart.x)/rect.width*dragStart.view.w,dy=(event.clientY-dragStart.y)/rect.height*dragStart.view.h;
  view={...dragStart.view,x:Math.max(0,Math.min(1000-dragStart.view.w,dragStart.view.x-dx)),y:Math.max(0,Math.min(560-dragStart.view.h,dragStart.view.y-dy))};
  svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);
});
function endDrag(){dragStart=null;svg.classList.remove('dragging')}
svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);

renderPins();renderList();
