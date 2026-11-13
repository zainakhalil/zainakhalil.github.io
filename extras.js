// ===== ON MY SCREEN & SHELF =====
// type: 'movie' | 'show' | 'book'. rating + outOf (defaults to 5). note: optional subtitle.
// take: your thoughts, as a string or a list of paragraphs. Leave it out and the card just shows the score.
const media = [
  {type:'book', title:'The Good Parts', by:'Evann Normandin', rating:3.7, outOf:5, take:[
    "A fresh idea and a genuinely sad book. The writing makes every scene easy to picture, so it reads slowly, almost like you are building the story in your head. It also takes a while to get going, and the pacing made it hard for me to stay hooked. The ending felt realistic but left me unsatisfied.",
    "David was my favorite character; he brings so much light to the story. Landon and Rose show what love looks like through every kind of heartbreak, and the weight each of them carries from keeping their grief bottled up."
  ]},
  {type:'show', title:'One Day', rating:10, outOf:10},
  {type:'show', title:'Young Sherlock', rating:10, outOf:10},
  {type:'show', title:'A Series of Unfortunate Events', rating:10, outOf:10},
  {type:'movie', title:'Five Feet Apart', rating:9.7, outOf:10},
  {type:'movie', title:'6 Days', note:'Arabic film', rating:9.2, outOf:10},
  {type:'show', title:'Money Heist', rating:9, outOf:10},
  {type:'movie', title:'Home Alone', rating:9, outOf:10},
  {type:'show', title:'His & Hers', rating:8.8, outOf:10},
  {type:'movie', title:'The Love Hypothesis', rating:4, outOf:5},
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
  {src:'photos/food/rice-nuts-2.jpg', alt:'Rice piled with toasted nuts'},
  {src:'photos/food/spread-3.jpg', alt:'Dinner, family-style'},
  {src:'photos/food/spread-4.jpg', alt:'More is more'},
];

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const typeLabel = {movie:'Movie', show:'Show', book:'Book'};

function renderMedia(filter='all'){
  const list = document.getElementById('media-list');
  const items = media.filter(m => filter==='all' || m.type===filter);
  list.innerHTML = items.length ? items.map(m => {
    const outOf = m.outOf || 5, perfect = m.rating >= outOf;
    const takes = m.take ? [].concat(m.take) : [];
    return `
    <article class="media-card${perfect?' perfect':''}${takes.join('').length>200?' long':''}">
      <div class="media-top"><span class="media-type ${m.type}">${typeLabel[m.type]||m.type}</span>${perfect?'<span class="fave">★ perfect score</span>':''}</div>
      <h3>${esc(m.title)}</h3>
      ${m.by||m.note?`<p class="media-by">${m.by?(m.type==='book'?'by ':'')+esc(m.by):esc(m.note)}</p>`:''}
      <div class="media-score" aria-label="Rated ${m.rating} out of ${outOf}"><span class="score-bar"><i style="width:${Math.max(0,Math.min(100,m.rating/outOf*100))}%"></i></span><span class="score-num">${m.rating}<small> / ${outOf}</small></span></div>
      ${takes.map(t=>`<p class="media-take">${esc(t)}</p>`).join('')}
    </article>`;
  }).join('') : '<p class="media-empty">Nothing here yet. Give me a weekend.</p>';
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
