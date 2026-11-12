// ===== ON MY SCREEN & SHELF =====
// type: 'movie' | 'show' | 'book'. rating: out of 5 (decimals welcome). take: your thoughts (leave '' for now).
const media = [
  {type:'book', title:'The Good Parts', by:'Evann Normandin', rating:3.7, take:''},
];

// ===== FROM MY KITCHEN =====
// Put photos in photos/food/ and add {src:'photos/food/name.jpg', alt:'What it shows'}.
// alt is for screen readers only. Add caption:'...' to show text under a photo.
// Short clips: {video:'photos/food/name.mp4', poster:'photos/food/name-poster.jpg', caption:'...'}
const dishes = [
  {src:'photos/food/spread-1.jpg', alt:'Cooking for a crowd: the long-table edition'},
  {video:'photos/food/party-rigatoni.mp4', poster:'photos/food/party-rigatoni-poster.jpg', alt:'Vodka rigatoni, labeled and ready for the party'},
  {src:'photos/food/rice-nuts.jpg', alt:'Rice, roasted meat, and a heavy hand with toasted nuts'},
  {src:'photos/food/pancakes.jpg', alt:'Pancakes under a landslide of berries'},
  {video:'photos/food/molokhia.mp4', poster:'photos/food/molokhia-poster.jpg', alt:'Molokhia night, with all the sides'},
  {src:'photos/food/spread-2.jpg', alt:'Trays on trays'},
  {src:'photos/food/saucy.jpg', alt:'Something saucy with fresh herbs'},
  {video:'photos/food/loaf.mp4', poster:'photos/food/loaf-poster.jpg', alt:'Fresh out of the oven'},
  {src:'photos/food/chicken-night.jpg', alt:'Build-your-own night'},
  {src:'photos/food/mango.jpg', alt:'Mango Ninja Creami'},
  {video:'photos/food/grazing-table.mp4', poster:'photos/food/grazing-table-poster.jpg', alt:'A table of dishes for friends'},
  {src:'photos/food/rice-nuts-2.jpg', alt:'Rice piled with toasted nuts'},
  {src:'photos/food/spread-3.jpg', alt:'Dinner, family-style'},
  {src:'photos/food/spread-4.jpg', alt:'More is more'},
];

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const typeLabel = {movie:'Movie', show:'Show', book:'Book'};

function renderMedia(filter='all'){
  const list = document.getElementById('media-list');
  const items = media.filter(m => filter==='all' || m.type===filter);
  list.innerHTML = items.length ? items.map(m => `
    <article class="media-card">
      <div class="media-top"><span class="media-type ${m.type}">${typeLabel[m.type]||m.type}</span>${m.year?`<span>${esc(m.year)}</span>`:''}</div>
      <h3>${esc(m.title)}</h3>
      ${m.by?`<p class="media-by">${m.type==='book'?'by ':''}${esc(m.by)}</p>`:''}
      <div class="media-score" aria-label="Rated ${m.rating} out of 5"><span class="score-bar"><i style="width:${Math.max(0,Math.min(100,m.rating/5*100))}%"></i></span><span class="score-num">${m.rating}<small> / 5</small></span></div>
      ${m.take?`<p class="media-take">${esc(m.take)}</p>`:`<p class="media-take pending">Full thoughts coming soon.</p>`}
    </article>`).join('') : '<p class="media-empty">Nothing here yet. Give me a weekend.</p>';
}

document.querySelectorAll('.media-filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.media-filter').forEach(b => b.classList.toggle('active', b===button));
  renderMedia(button.dataset.type);
}));

function renderKitchen(){
  const section = document.getElementById('kitchen');
  if(!dishes.length){section.hidden = true; return}
  section.hidden = false;
  const grid = document.getElementById('kitchen-grid');
  grid.innerHTML = dishes.map(d => {
    const media = d.video
      ? `<video src="${d.video}" poster="${d.poster||''}" muted loop playsinline preload="none" aria-label="${esc(d.caption||d.alt||'A dish I made')}"></video><span class="dish-play">▶ clip</span>`
      : `<img src="${d.src}" alt="${esc(d.caption||d.alt||'A dish I made')}" loading="lazy" />`;
    return `<figure class="dish${d.video?' is-video':''}">${media}${d.caption?`<figcaption>${esc(d.caption)}</figcaption>`:''}</figure>`;
  }).join('');
  // Clips play only while on screen (and never for people who prefer reduced motion).
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const videos = grid.querySelectorAll('video');
  if(!still && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if(e.isIntersecting){ e.target.play().catch(()=>{}); } else { e.target.pause(); }
    }), {threshold:.4});
    videos.forEach(v => io.observe(v));
  }
  videos.forEach(v => v.closest('.dish').addEventListener('click', () => v.paused ? v.play().catch(()=>{}) : v.pause()));
}

renderMedia();
renderKitchen();
