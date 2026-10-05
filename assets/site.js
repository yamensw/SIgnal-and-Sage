'use strict';
(() => {
  const header = document.querySelector('header');
  const nav = document.querySelector('nav');
  const menu = document.querySelector('.menu');
  const progress = document.querySelector('.scroll-progress');
  const scroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 60);
    const total = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${total > 0 ? scrollY / total : 0})`;
  };
  window.addEventListener('scroll', scroll, {passive:true});
  scroll();
  menu?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false');
  }));
  document.addEventListener('keydown', e => {if(e.key === 'Escape') {nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');}});
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) nav?.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === 'index.html#' + e.target.id));
    }, {rootMargin:'-25% 0px -55% 0px'});
    document.querySelectorAll('main section[id]').forEach(s => observer.observe(s));
  }
  if (location.pathname.endsWith('day-to-day.html')) nav?.querySelector('a[href="day-to-day.html"]')?.classList.add('active');
  const container = document.getElementById('team-profiles');
  if (!container) return;
  const dialog = document.getElementById('profile-dialog');
  dialog?.querySelector('.close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', e => {if(e.target === dialog) dialog.close();});
  function element(tag, className, text) {
    const el=document.createElement(tag); if(className)el.className=className; if(text)el.textContent=text;return el;
  }
  function photoURL(value) {
    const url = new URL(String(value || ''), document.baseURI);
    if (url.origin !== location.origin || !/\.(webp|png|jpe?g)$/i.test(url.pathname)) throw Error('Use a local image path.');
    return url.href;
  }
  function renderTeam(team) {
    if(!Array.isArray(team)) throw Error('Invalid team data');
    const cards=team.map(person => {
      for(const key of ['name','title','bio','responsibilities','photo']) if(typeof person[key] !== 'string') throw Error('Invalid team profile');
      const card=element('button','team-card');card.type='button';
      const img=element('img');img.src=photoURL(person.photo);img.alt=person.name;img.loading='lazy';
      const info=element('div');info.append(element('h3','',person.name),element('span','role',person.title),element('p','',person.bio),element('span','text-link','Meet '+person.name.split(' ')[0]));
      card.append(img,info);
      card.addEventListener('click',()=>{
        for(const key of ['name','title','bio','responsibilities']) document.getElementById('profile-'+key).textContent=person[key];
        const portrait=document.getElementById('profile-photo');portrait.src=photoURL(person.photo);portrait.alt=person.name;
        const date = /^\d{4}-\d{2}-\d{2}$/.test(person.startDate||'') ? new Date(person.startDate+'T12:00:00') : null;
        document.getElementById('profile-start').textContent = date && !Number.isNaN(date.getTime()) ? 'With Signal & Sage since '+date.toLocaleDateString('en-GB',{month:'long',year:'numeric'}) : '';
        dialog.showModal();
      });
      return card;
    });
    container.replaceChildren(...cards);
  }
  fetch('team.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Profiles unavailable');return r.json();}).then(renderTeam).catch(()=>{
    container.replaceChildren(element('p','','Team profiles could not load. Please refresh the page.'));
  });
})();
