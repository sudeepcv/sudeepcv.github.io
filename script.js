async function loadData() {
  try {
    const res = await fetch('data.json');
    const data = await res.json();
    populate(data);
  } catch (err) {
    console.error('Failed to load data.json', err);
    // Friendly on-page message for users who open index.html via file://
    const banner = document.getElementById('errorBanner');
    if(banner){
      banner.classList.remove('hidden');
      banner.innerHTML = `Failed to load content from <code>data.json</code>. If you opened this file directly (file://), your browser blocks local fetches. Please serve the folder over HTTP. Example: <code>python3 -m http.server 8000</code> and open <a href="http://localhost:8000">http://localhost:8000</a>`;
    }
  }
}

function el(tag, cls = '', attrs = {}){
  const node = document.createElement(tag);
  if(cls) node.className = cls;
  for(const k in attrs) node.setAttribute(k, attrs[k]);
  return node;
}

function showErrorBanner(msg){
  try{
    const banner = document.getElementById('errorBanner');
    if(banner){
      banner.classList.remove('hidden');
      banner.innerHTML = msg;
    } else {
      console.error('Error banner element missing:', msg);
    }
  } catch(e){ console.error('Failed to show error banner', e); }
}

window.addEventListener('error', function(ev){
  const m = `<strong>JS error:</strong> ${ev.message} <br/><em>${ev.filename}:${ev.lineno}:${ev.colno}</em><pre>${ev.error && ev.error.stack ? ev.error.stack : ''}</pre>`;
  showErrorBanner(m);
});

window.addEventListener('unhandledrejection', function(ev){
  const reason = ev.reason && ev.reason.stack ? ev.reason.stack : JSON.stringify(ev.reason);
  const m = `<strong>Unhandled rejection:</strong> ${reason}`;
  showErrorBanner(m);
});

function populate(d){
  // set document title from data.json (user's name and optional role)
  try{
    if(d && d.name){
      document.title = d.name + (d.title ? ' — ' + d.title : '');
    }
  }catch(e){ /* ignore */ }

  // set favicon / apple-touch-icon to profile image (prefer local asset if available)
  try{
    if(d && d.profileImage){
      let iconHref = d.profileImage;
      // if the profileImage is an absolute URL, check for a local basename first
      if(/^(https?:)?\/\//.test(iconHref)){
        const local = localPathFor(iconHref);
        if(local) iconHref = local;
      }
      // create or update favicon link
      let link = document.querySelector('link[rel="icon"]');
      if(!link){ link = document.createElement('link'); link.setAttribute('rel','icon'); document.head.appendChild(link); }
      link.setAttribute('href', iconHref);

      // apple touch icon
      let apple = document.querySelector('link[rel="apple-touch-icon"]');
      if(!apple){ apple = document.createElement('link'); apple.setAttribute('rel','apple-touch-icon'); document.head.appendChild(apple); }
      apple.setAttribute('href', iconHref);
    }
  }catch(e){ /* ignore */ }
  // helper: derive local asset path from external URL
  function localPathFor(url){
    try{
      const u = new URL(url);
      const parts = u.pathname.split('/');
      const name = parts.pop() || parts.pop(); // handle trailing slash
      return name ? `assets/${name}` : null;
    } catch(e){ return null; }
  }

  // helper: create an img element that tries local asset first (assets/<basename>),
  // then external URL, and finally calls onFinalFail() if both fail.
  function createImgWithLocalFallback(externalUrl, alt, onFinalFail){
    const img = document.createElement('img');
    img.alt = alt || '';
    img.loading = 'lazy';
    img.className = '';
    const local = localPathFor(externalUrl);
    let attempts = 0;
    img.onerror = function(){
      attempts++;
      if(attempts === 1 && local){
        img.src = local;
      } else if(attempts === 1 && !local){
        // first error and no local -> final
        if(typeof onFinalFail === 'function') onFinalFail();
      } else if(attempts === 2){
        // tried local then external and failed
        if(typeof onFinalFail === 'function') onFinalFail();
      }
    };
    // start: try local if available, else external
    if(local){ img.src = local; }
    else { img.src = externalUrl; }
    // also set a timeout in case some servers are slow (optional)
    return img;
  }

  // Header
  const profileImage = document.getElementById('profileImage');
  const profileImageMobile = document.getElementById('profileImageMobile');
  if(profileImage){
    profileImage.src = d.profileImage;
    profileImage.alt = d.name + ' profile image';
  }
  if(profileImageMobile){
    profileImageMobile.src = d.profileImage;
    profileImageMobile.alt = d.name + ' profile image';
  }

  // Hero
  const heroProfile = document.getElementById('heroProfile');
  const heroName = document.getElementById('heroName');
  const heroTitle = document.getElementById('heroTitle');
  const heroTagline = document.getElementById('heroTagline');
  const heroCtas = document.getElementById('heroCtas');
  if(heroProfile) heroProfile.src = d.profileImage;
  if(heroName) heroName.textContent = d.name;
  if(heroTitle) heroTitle.textContent = d.title;
  if(heroTagline) heroTagline.textContent = d.tagline;
  if(heroCtas){
    heroCtas.innerHTML = '';
    if(d.links && d.links.github){
      const a = el('a', 'inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700', {href: d.links.github, target: '_blank', rel:'noopener noreferrer'});
      a.textContent = 'View GitHub';
      heroCtas.appendChild(a);
    }
    if(d.links && d.links.linkedin){
      const b = el('a', 'inline-flex items-center px-3 py-2 border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50', {href: d.links.linkedin, target: '_blank', rel:'noopener noreferrer'});
      b.textContent = 'LinkedIn';
      heroCtas.appendChild(b);
    }
  }

  const nameEl = document.getElementById('name');
  const nameMobileEl = document.getElementById('nameMobile');
  const titleEl = document.getElementById('title');
  const taglineMobileEl = document.getElementById('taglineMobile');
  if(nameEl) nameEl.textContent = d.name;
  if(nameMobileEl) nameMobileEl.textContent = d.name;
  if(titleEl) titleEl.textContent = d.title;
  if(taglineMobileEl) taglineMobileEl.textContent = d.tagline;

  // About
  const aboutTextEl = document.getElementById('aboutText');
  if(aboutTextEl) {
    aboutTextEl.textContent = d.about;
  } else {
    // If there's no about section in this template, don't crash — log for debugging
    console.warn('#aboutText element not found — skipping about section render');
  }

  // Social links (header and mobile)
  const socialLinks = document.getElementById('socialLinks');
  const mobileSocial = document.getElementById('mobileSocial');
  const links = d.links || {};

  const addLink = (container, href, label, svg) => {
    // ensure the container exists and href provided
    if(!container || !href) return;
    const a = el('a', 'text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full p-1', {href, target: '_blank', rel: 'noopener noreferrer', 'aria-label': label});
    a.innerHTML = svg;
    container.appendChild(a);
  };

  addLink(socialLinks, links.github, 'GitHub', icons.github);
  addLink(socialLinks, links.linkedin, 'LinkedIn', icons.linkedin);
  addLink(socialLinks, links.stackoverflow, 'StackOverflow', icons.stackoverflow);
  if(links.email) addLink(socialLinks, 'mailto:'+links.email, 'Email', icons.email);

  addLink(mobileSocial, links.github, 'GitHub', icons.github);
  addLink(mobileSocial, links.linkedin, 'LinkedIn', icons.linkedin);
  addLink(mobileSocial, links.stackoverflow, 'StackOverflow', icons.stackoverflow);
  if(links.email) addLink(mobileSocial, 'mailto:'+links.email, 'Email', icons.email);

  // Skills
  const skillsGrid = document.getElementById('skillsGrid');
  if(skillsGrid){
    skillsGrid.innerHTML = '';
    (d.skills || []).forEach(skill => {
    // support both string and object forms: "Java" or { name: "Java", logo: "https://..." }
    const s = typeof skill === 'string' ? { name: skill } : skill || { name: '' };
    const card = el('div', 'skill-badge bg-white border border-gray-100 px-3 py-2 rounded-lg shadow-sm flex items-center space-x-3 transform transition duration-300 hover:scale-105', {'role': 'listitem'});

    if(s.logo){
      const imgContainer = el('div', 'w-6 h-6 flex items-center justify-center');
      const img = createImgWithLocalFallback(s.logo, s.name + ' logo', () => {
        // final fallback -> show initials
        imgContainer.innerHTML = '';
        const initials = (s.name || '').split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();
        const badge = el('div', 'w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-semibold', {'aria-hidden':'true'});
        badge.textContent = initials || '?';
        imgContainer.appendChild(badge);
      });
      img.className = 'skill-logo w-6 h-6 rounded';
      imgContainer.appendChild(img);
      card.appendChild(imgContainer);
    } else {
      // fallback to initials
      const initials = (s.name || '').split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();
      const badge = el('div', 'w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-semibold', {'aria-hidden':'true'});
      badge.textContent = initials || '?';
      card.appendChild(badge);
    }

    const label = el('div', 'text-sm text-gray-800');
    label.textContent = s.name;
    card.appendChild(label);

      skillsGrid.appendChild(card);
    });
    console.log('Loaded skills:', (d.skills || []).length);
  } else {
    console.warn('#skillsGrid element not found — skills rendering skipped');
  }


  // Experience
  const exp = document.getElementById('experienceTimeline');
  if(exp){
    exp.innerHTML = '';
    (d.experience || []).forEach(item => {
  const wrap = el('div', 'flex items-start space-x-4');
  // marker container will center the logo or marker
  const marker = el('div', 'flex-shrink-0 mt-1 experience-marker');
    // show company logo if available, otherwise show timeline marker
    if(item.logo){
      const img = document.createElement('img');
      img.src = item.logo;
      img.alt = item.company + ' logo';
      img.className = 'company-logo rounded-md';
      img.loading = 'lazy';
      // fallback to marker if image fails
      img.onerror = () => { marker.innerHTML = '<div class="w-3 h-3 bg-blue-600 rounded-full ring-2 ring-white shadow"></div>'; };
      marker.appendChild(img);
    } else {
      marker.innerHTML = '<div class="w-3 h-3 bg-blue-600 rounded-full ring-2 ring-white shadow"></div>';
    }
    const body = el('div', 'prose-sm');
    const h3 = el('h3', 'text-lg font-semibold text-gray-900');
    h3.textContent = item.role + ' @ ' + item.company;
    const p = el('p', 'text-sm text-gray-600');
    p.textContent = item.period;
    body.appendChild(h3);
    body.appendChild(p);
    const ul = el('ul', 'mt-2 list-disc pl-5 space-y-1');
    (item.details || []).forEach(dtl => {
      const li = document.createElement('li');
      li.textContent = dtl;
      ul.appendChild(li);
    });
    body.appendChild(ul);
    wrap.appendChild(marker);
    wrap.appendChild(body);
      exp.appendChild(wrap);
    });
    console.log('Loaded experience items:', (d.experience || []).length);
  } else {
    console.warn('#experienceTimeline element not found — experience rendering skipped');
  }

  // Education
  const edu = document.getElementById('educationList');
  if(edu){
    edu.innerHTML = '';
    (d.education || []).forEach(e => {
      const div = el('div', 'p-3 rounded-md bg-gray-50');
      const deg = el('div', 'font-semibold text-gray-900');
      deg.textContent = e.degree + ' — ' + e.institution;
      const yr = el('div', 'text-sm text-gray-600');
      yr.textContent = e.year;
      div.appendChild(deg);
      div.appendChild(yr);
      edu.appendChild(div);
    });
    console.log('Loaded education items:', (d.education || []).length);
  } else {
    console.warn('#educationList element not found — education rendering skipped');
  }

  // Footer — use current year dynamically
  const footerText = document.getElementById('footerText');
  try{
    const year = new Date().getFullYear();
    if(footerText) footerText.textContent = `© ${year} ${d.name}. All rights reserved.`;
  }catch(e){ if(footerText) footerText.textContent = `© ${d.name}. All rights reserved.`; }

  // projects removed by user — nothing to render here

  // Simple entrance animations via IntersectionObserver
  const animTargets = document.querySelectorAll('#skillsGrid > div, #experienceTimeline > div, #educationList > div');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('animate-fade-up');
        obs.unobserve(entry.target);
      }
    });
  }, {threshold: 0.1});
  animTargets.forEach(t => obs.observe(t));

  // Fallback: in some environments IntersectionObserver may not fire quickly — ensure items are visible
  setTimeout(() => {
    document.querySelectorAll('#skillsGrid > div, #experienceTimeline > div, #educationList > div').forEach(elm => {
      elm.classList.add('animate-fade-up');
    });
  }, 600);

  // Navigation: smooth scroll for nav links and active link highlighting
  try{
    const navLinks = document.querySelectorAll('a.nav-link');
    navLinks.forEach(a => {
      a.addEventListener('click', (e) => {
        // only handle in-page anchors
        const href = a.getAttribute('href') || '';
        if(href.startsWith('#')){
          e.preventDefault();
          const target = document.querySelector(href);
          if(target){
            target.scrollIntoView({behavior:'smooth', block:'start'});
            // update focus for accessibility
            target.setAttribute('tabindex', '-1');
            target.focus({preventScroll:true});
          }
        }
      });
    });

    // observe sections to toggle .nav-active on nav links
    const sections = document.querySelectorAll('section.section-viewport, section#hero, section#skills, section#experience, section#education');
    const navMap = {};
    navLinks.forEach(a => {
      const href = a.getAttribute('href');
      if(href && href.startsWith('#')) navMap[href.slice(1)] = a;
    });

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        const id = ent.target.id;
        const link = navMap[id];
        if(link){
          if(ent.isIntersecting){
            link.classList.add('nav-active');
          } else {
            link.classList.remove('nav-active');
          }
        }
      });
    }, {threshold: 0.55});
    sections.forEach(s => sectionObserver.observe(s));
    
    // build right-side dot nav for quick section jumps
    try{
      const dotNav = document.createElement('div');
      dotNav.className = 'dot-nav';
      const sectionList = Array.from(sections).filter(s => s.id);
      sectionList.forEach((s, idx) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.title = s.id;
        dot.addEventListener('click', () => {
          s.scrollIntoView({behavior:'smooth', block:'start'});
        });
        dotNav.appendChild(dot);
      });
      document.body.appendChild(dotNav);

      // highlight dot based on intersection
      const dotObserver = new IntersectionObserver(entries => {
        entries.forEach(ent => {
          const id = ent.target.id;
          const idx = sectionList.findIndex(x => x.id === id);
          if(idx >= 0){
            const dots = document.querySelectorAll('.dot-nav .dot');
            dots.forEach(d => d.classList.remove('active'));
            if(ent.isIntersecting){
              const active = dots[idx];
              if(active) active.classList.add('active');
            }
          }
        });
      }, {threshold:0.55});
      sectionList.forEach(s => dotObserver.observe(s));
    }catch(e){ console.warn('Dot nav build failed', e); }
  }catch(e){ console.warn('Nav enhancement failed', e); }
}

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('mobileNavBtn');
  const nav = document.getElementById('mobileNav');
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('hidden');
  });
});

const icons = {
  github: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.9.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.38-3.88-1.38-.53-1.35-1.3-1.71-1.3-1.71-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.52.11-3.17 0 0 .98-.31 3.2 1.19a11.07 11.07 0 012.92-.39c.99 0 2 .13 2.92.39 2.22-1.5 3.2-1.19 3.2-1.19.63 1.65.23 2.87.11 3.17.75.81 1.2 1.84 1.2 3.1 0 4.42-2.7 5.39-5.27 5.67.42.36.8 1.1.8 2.22 0 1.6-.02 2.88-.02 3.27 0 .31.21.67.8.56A10.52 10.52 0 0023.5 12C23.5 5.73 18.27.5 12 .5z"/></svg>',
  linkedin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor"><path d="M4.98 3.5C3.88 3.5 3 4.38 3 5.48c0 1.1.88 1.98 1.98 1.98h.02C5.98 7.46 6.86 6.58 6.86 5.48 6.86 4.38 5.98 3.5 4.98 3.5zM3.5 8.98h3v11.02h-3V8.98zM9.5 8.98h2.88v1.5h.04c.4-.75 1.37-1.54 2.82-1.54 3.02 0 3.58 1.99 3.58 4.57v6.49h-3V15.8c0-1.08-.02-2.47-1.51-2.47-1.51 0-1.74 1.18-1.74 2.4v4.07h-3V8.98z"/></svg>',
  stackoverflow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor"><path d="M17.82 20.5H6.18v-3h11.64v3zM7.11 17.6l.32-2.95 9.63 1.04-.32 2.95-9.63-1.04zM8.2 12.9l.9-2.8 8.8 3.84-.9 2.8-8.8-3.84zM11.06 5.9l1.64-2.36 6.6 4.57-1.64 2.36-6.6-4.57z"/></svg>',
  email: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>'
};

// small CSS-based animations class addition
// create style for animate-fade-up dynamically in case styles.css isn't loaded yet
const style = document.createElement('style');
style.innerHTML = `
.animate-fade-up{opacity:1; transform:none; transition:opacity .6s ease, transform .6s ease}
#skillsGrid > div, #experienceTimeline > div, #educationList > div{opacity:0; transform:translateY(10px)}
`;
document.head.appendChild(style);

function initAfterDom(){
  // load JSON and render the page
  loadData();

  // Mobile nav toggle (safe: elements exist after DOM ready)
  const btn = document.getElementById('mobileNavBtn');
  const nav = document.getElementById('mobileNav');
  if(btn && nav){
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('hidden');
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAfterDom);
} else {
  initAfterDom();
}
