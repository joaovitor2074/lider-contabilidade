/* =========================================================
   LÍDER CONTABILIDADE — interações e animações
   ========================================================= */
(() => {
  'use strict';

  /* ===== CONFIGURAÇÃO — edite aqui ===== */
  const CONFIG = {
    // WhatsApp com DDI + DDD + número, só dígitos. Ex.: '5598912345678'.
    // Enquanto estiver vazio, os botões de contato abrem o Direct do Instagram.
    whatsapp: '5599981889169',
    instagram: 'lidercontabilidade',
    defaultMessage: 'Olá! Vim pelo site da Líder Contabilidade e gostaria de mais informações.',
  };

  window.__LC_READY = true;

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const motionOK = hasGSAP && !reduceMotion;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  if (!motionOK) root.classList.add('no-gsap');

  /* ---------- Links de contato ---------- */
  const hasWA = /^\d{10,15}$/.test(CONFIG.whatsapp);
  const igProfile = `https://www.instagram.com/${CONFIG.instagram}/`;
  const igDirect = `https://ig.me/m/${CONFIG.instagram}`;
  const contactUrl = (msg) =>
    hasWA ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg || CONFIG.defaultMessage)}` : igDirect;
  const setExternal = (a, url) => { a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; };

  if (!hasWA) root.classList.add('no-wa');
  $$('[data-contact]').forEach((a) => setExternal(a, contactUrl(a.dataset.msg)));
  $$('[data-ig]').forEach((a) => setExternal(a, igProfile));
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Toast ---------- */
  const toastEl = $('.toast');
  let toastTimer;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 3800);
  };

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    lenis.stop();
  } else {
    root.classList.add('no-lenis');
  }

  const header = $('.header');
  const scrollToTarget = (target) => {
    const offset = target === 0 ? 0 : -((header && header.offsetHeight) || 70) + 1;
    if (lenis) {
      lenis.scrollTo(target, { offset, duration: 1.4 });
    } else {
      const y = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = id === '#inicio' ? 0 : document.querySelector(id);
    if (target === null) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(target);
  });

  /* ---------- Header, barra de progresso e voltar ao topo ---------- */
  const progressBar = $('.scroll-progress span');
  const toTop = $('.to-top');
  const toTopCircle = $('.to-top-ring circle');
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(y / max, 1) : 0;

    header.classList.toggle('is-scrolled', y > 30);
    if (!root.classList.contains('menu-open')) {
      if (y > lastY && y > 520) header.classList.add('is-hidden');
      else if (y < lastY || y <= 520) header.classList.remove('is-hidden');
    }
    lastY = y;

    if (progressBar) progressBar.style.transform = `scaleX(${p})`;
    if (toTop) toTop.classList.toggle('is-visible', y > 800);
    if (toTopCircle) toTopCircle.style.strokeDashoffset = String(100 - p * 100);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Link ativo no menu ---------- */
  const navLinks = $$('.nav-links a');
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${en.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean).forEach((s) => navIO.observe(s));

  /* ---------- Menu mobile ---------- */
  const menuToggle = $('.menu-toggle');
  function openMenu() {
    root.classList.add('menu-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fechar menu');
    header.classList.remove('is-hidden');
    if (lenis) lenis.stop();
  }
  function closeMenu() {
    if (!root.classList.contains('menu-open')) return;
    root.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    if (lenis) lenis.start();
  }
  menuToggle.addEventListener('click', () => (root.classList.contains('menu-open') ? closeMenu() : openMenu()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 1080) closeMenu(); });

  /* ---------- Divisão de texto em palavras ---------- */
  function splitWords(el) {
    if (el.dataset.splitDone) return $$('.w-in', el);
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent;
          if (!text.trim()) { child.textContent = text.length ? ' ' : ''; return; }
          const frag = document.createDocumentFragment();
          text.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.className = 'w-in';
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(el);
    el.dataset.splitDone = '1';
    $$('.gold-text', el).forEach((g) => g.classList.add('is-split'));
    const words = $$('.w-in', el);
    words.forEach((w, i) => w.parentNode.style.setProperty('--wi', i));
    return words;
  }

  /* ---------- Revelações ao rolar ---------- */
  $$('[data-split-reveal]').forEach(splitWords);

  const onRevealEnd = (e) => {
    const el = e.currentTarget;
    if (e.target !== el || !['opacity', 'clip-path'].includes(e.propertyName)) return;
    el.removeEventListener('transitionend', onRevealEnd);
    el.removeAttribute('data-reveal');
    el.classList.remove('is-in');
  };

  const revealIO = new IntersectionObserver((entries) => {
    let n = 0;
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      if (!el.style.getPropertyValue('--d') && el.closest('[data-stagger]')) {
        el.style.setProperty('--d', `${(n++) * 0.09}s`);
      }
      el.classList.add('is-in');
      revealIO.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  $$('[data-reveal]').forEach((el) => {
    el.addEventListener('transitionend', onRevealEnd);
    revealIO.observe(el);
  });
  $$('[data-split-reveal]').forEach((el) => revealIO.observe(el));

  /* ---------- Contadores ---------- */
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 2200;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!reduceMotion) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        countIO.unobserve(en.target);
        animateCount(en.target);
      });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach((el) => {
      el.textContent = `${el.dataset.prefix || ''}0${el.dataset.suffix || ''}`;
      countIO.observe(el);
    });
  }

  /* ---------- Abas (Missão / Visão / Valores) ---------- */
  const tabList = $('.tab-list');
  if (tabList) {
    const tabs = $$('[role="tab"]', tabList);
    const indicator = $('.tab-indicator', tabList);
    const moveIndicator = (tab) => {
      indicator.style.width = `${tab.offsetWidth}px`;
      indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
    };
    const activate = (tab, focus) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.classList.toggle('is-active', selected);
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        panel.hidden = !selected;
        panel.classList.toggle('is-active', selected);
      });
      moveIndicator(tab);
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => activate(t));
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        activate(tabs[(i + dir + tabs.length) % tabs.length], true);
      });
    });
    const syncIndicator = () => moveIndicator(tabs.find((t) => t.classList.contains('is-active')) || tabs[0]);
    syncIndicator();
    window.addEventListener('resize', syncIndicator);
    if (document.fonts) document.fonts.ready.then(syncIndicator);
    new ResizeObserver(syncIndicator).observe(tabList);
  }

  /* ---------- FAQ ---------- */
  $$('.faq-item').forEach((item) => {
    const btn = $('.faq-q', item);
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      $$('.faq-item.is-open').forEach((o) => {
        if (o === item) return;
        o.classList.remove('is-open');
        $('.faq-q', o).setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (hasGSAP) setTimeout(() => ScrollTrigger.refresh(), 650);
    });
  });

  /* ---------- Formulário de contato ---------- */
  const form = $('.contact-form');
  if (form) {
    const tel = $('#f-tel', form);
    const formatPhone = (d) => {
      if (d.length > 10) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
      if (d.length > 6) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
      if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
      return d;
    };
    tel.addEventListener('input', () => { tel.value = formatPhone(tel.value.replace(/\D/g, '').slice(0, 11)); });

    if (!hasWA) {
      const note = $('.form-note', form);
      if (note) note.textContent = 'Ao enviar, sua mensagem é copiada e o Direct do Instagram abre para você colar e enviar.';
    }

    form.addEventListener('input', (e) => {
      const field = e.target.closest('.field');
      if (field) field.classList.remove('is-invalid');
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nomeEl = $('#f-nome', form);
      const assuntoEl = $('#f-assunto', form);
      const nome = nomeEl.value.trim();
      const telDigits = tel.value.replace(/\D/g, '');
      const assunto = assuntoEl.value;
      const mensagem = $('#f-msg', form).value.trim();

      let ok = true;
      const check = (el, valid) => {
        el.closest('.field').classList.toggle('is-invalid', !valid);
        if (!valid) ok = false;
      };
      check(nomeEl, nome.length >= 2);
      check(tel, telDigits.length >= 10);
      check(assuntoEl, !!assunto);

      if (!ok) {
        toast('Preencha seu nome, WhatsApp e o assunto para continuar.');
        const first = $('.is-invalid input, .is-invalid select', form);
        if (first) first.focus();
        return;
      }

      const text =
        `Olá! Vim pelo site da Líder Contabilidade.\n\n` +
        `*Nome:* ${nome}\n*WhatsApp:* ${tel.value}\n*Assunto:* ${assunto}` +
        (mensagem ? `\n*Mensagem:* ${mensagem}` : '');

      if (hasWA) {
        window.open(contactUrl(text), '_blank', 'noopener');
        toast('Abrindo o WhatsApp…');
      } else {
        if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
        toast('Mensagem copiada! Cole no Direct do Instagram para enviar.');
        window.open(igDirect, '_blank', 'noopener');
      }
      form.reset();
    });
  }

  /* ---------- Efeitos de ponteiro (desktop) ---------- */
  if (finePointer && !reduceMotion) {
    // Cartões com inclinação 3D + brilho que segue o mouse
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 9}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    // Botões magnéticos
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.32}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    // Cursor personalizado
    const ring = $('.cursor-ring');
    const label = $('.cursor-label');
    if (ring) {
      let mx = -100, my = -100, rx = -100, ry = -100, started = false;
      window.addEventListener('pointermove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!started) { started = true; rx = mx; ry = my; root.classList.add('has-cursor'); loop(); }
      }, { passive: true });
      document.addEventListener('mouseleave', () => root.classList.remove('has-cursor'));
      document.addEventListener('mouseenter', () => { if (started) root.classList.add('has-cursor'); });
      const loop = () => {
        rx += (mx - rx) * 0.2;
        ry += (my - ry) * 0.2;
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        requestAnimationFrame(loop);
      };
      document.addEventListener('pointerover', (e) => {
        const withLabel = e.target.closest('[data-cursor-label]');
        const hoverable = e.target.closest('a, button, input, select, textarea, label, [data-tilt], .chips li');
        ring.classList.toggle('has-label', !!withLabel);
        ring.classList.toggle('is-hover', !!hoverable && !withLabel);
        label.textContent = withLabel ? withLabel.dataset.cursorLabel : '';
      });
    }
  }

  /* ---------- Partículas douradas do hero ---------- */
  const initParticles = () => {
    const canvas = $('.hero-particles');
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = null, parts = [];
    const count = window.innerWidth < 768 ? 26 : 60;
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const make = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      vy: -(Math.random() * 0.35 + 0.08),
      vx: (Math.random() - 0.5) * 0.16,
      a: Math.random() * 0.5 + 0.2,
      t: Math.random() * Math.PI * 2,
    });
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.t += 0.02;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        const alpha = p.a * (0.55 + 0.45 * Math.sin(p.t));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 154, 50, ${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    resize();
    parts = Array.from({ length: count }, make);
    window.addEventListener('resize', resize);
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { if (!raf) draw(); }
      else if (raf) { cancelAnimationFrame(raf); raf = null; }
    }).observe(canvas);
  };

  /* ---------- Intro do hero ---------- */
  function enableHeroParallax() {
    if (!finePointer || !motionOK) return;
    const hero = $('.hero');
    const layers = [['.hero-photo', 10], ['.hero-frame', -16], ['.fc-1', 28], ['.fc-2', 22], ['.hero-badge', -20]];
    const movers = layers
      .map(([sel, depth]) => {
        const el = $(sel);
        if (!el) return null;
        return {
          depth,
          x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3.out' }),
        };
      })
      .filter(Boolean);
    hero.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      movers.forEach((m) => { m.x(nx * m.depth); m.y(ny * m.depth); });
    });
    hero.addEventListener('pointerleave', () => movers.forEach((m) => { m.x(0); m.y(0); }));
  }

  function heroIntro() {
    const words = splitWords($('.hero-title'));
    root.classList.add('hero-ready');
    if (!motionOK) return;

    const radius = 'round 999px 999px 28px 28px';
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: enableHeroParallax });
    tl.from('.header', { yPercent: -100, autoAlpha: 0, duration: 1.1, clearProps: 'transform,opacity,visibility' }, 0)
      .from('.hero .pill', { y: 24, autoAlpha: 0, duration: 1 }, 0.15)
      .from(words, { yPercent: 120, rotate: 6, duration: 1.4, stagger: 0.055, clearProps: 'transform' }, 0.25)
      .from('.hero-lead', { y: 30, autoAlpha: 0, duration: 1.1 }, 0.75)
      .from('.hero-actions > *', { y: 26, autoAlpha: 0, duration: 1, stagger: 0.1, clearProps: 'transform' }, 0.9)
      .from('.hero-trust li', { y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 1.05)
      .fromTo('.hero-photo',
        { clipPath: `inset(100% 0% 0% 0% ${radius})` },
        { clipPath: `inset(0% 0% 0% 0% ${radius})`, duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.1)
      .from('.hero-photo img', { scale: 1.35, duration: 2.2 }, 0.3)
      .from('.hero-frame', { autoAlpha: 0, x: -24, y: -24, duration: 1.4 }, 0.9)
      .from('.hero-badge', { autoAlpha: 0, scale: 0.4, rotate: -120, duration: 1.4 }, 1.1)
      .from('.float-card', { autoAlpha: 0, y: 40, scale: 0.9, duration: 1.2, stagger: 0.18 }, 1.2)
      .from('.scroll-cue', { autoAlpha: 0, y: 20, duration: 1 }, 1.5);
  }

  /* ---------- Animações ligadas à rolagem (GSAP) ---------- */
  function initScrollAnimations() {
    if (!motionOK) return;

    // Hero: parallax ao sair da tela
    gsap.to('.hero-visual', {
      yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero-content', {
      y: -70, opacity: 0.25, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // Frase de impacto: palavras acendem com a rolagem
    const statement = $('[data-scrub]');
    if (statement) {
      const words = splitWords(statement);
      gsap.fromTo(words, { opacity: 0.13 }, {
        opacity: 1, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: statement, start: 'top 85%', end: 'bottom 50%', scrub: true },
      });
    }

    // Parallax das imagens
    $$('[data-parallax]').forEach((img) => {
      gsap.fromTo(img, { '--py': '-7%' }, {
        '--py': '7%', ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // Diferenciais: rolagem horizontal fixada (desktop)
    const mm = gsap.matchMedia();
    mm.add('(min-width: 992px)', () => {
      const section = $('.why');
      const track = $('.why-track');
      const bar = $('.why-progress span');
      const distance = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
      const tween = gsap.to(track, {
        x: () => -distance(), ease: 'none',
        scrollTrigger: {
          trigger: section, start: 'top top', end: () => `+=${distance()}`,
          pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => { bar.style.transform = `scaleX(${self.progress})`; },
        },
      });
      $$('.why-card', track).forEach((card) => {
        const icon = $('.why-icon, .why-cta-mark', card);
        if (!icon) return;
        gsap.from(icon, {
          scale: 0, rotate: -90, duration: 0.9, ease: 'back.out(2)',
          scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 88%', toggleActions: 'play none none reverse' },
        });
      });
      return () => { bar.style.transform = ''; };
    });

    // Como funciona: linha dourada + passos ativos
    gsap.fromTo('.steps-line span', { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.steps', start: 'top 65%', end: 'bottom 65%', scrub: true },
    });
    $$('.step').forEach((step) => {
      ScrollTrigger.create({
        trigger: step, start: 'top 65%',
        onEnter: () => step.classList.add('is-active'),
        onLeaveBack: () => step.classList.remove('is-active'),
      });
    });

    // CTA e rodapé
    gsap.to('.cta-watermark', {
      rotate: 18, yPercent: -12, ease: 'none',
      scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.fromTo('.footer-mark', { xPercent: 8 }, {
      xPercent: -8, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true },
    });

    if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  // Progresso do carrossel de diferenciais no celular
  const whyViewport = $('.why-viewport');
  const whyBar = $('.why-progress span');
  if (whyViewport && whyBar) {
    const syncWhy = () => {
      if (window.innerWidth >= 992) return;
      const max = whyViewport.scrollWidth - whyViewport.clientWidth;
      const p = max > 0 ? whyViewport.scrollLeft / max : 0;
      whyBar.style.transform = `scaleX(${Math.max(0.08, p)})`;
    };
    whyViewport.addEventListener('scroll', syncWhy, { passive: true });
    window.addEventListener('resize', syncWhy);
    syncWhy();
  }

  /* ---------- Botão flutuante ---------- */
  const startChatFloat = () => {
    const cf = $('.chat-float');
    if (!cf) return;
    cf.classList.add('is-ready');
    setTimeout(() => {
      cf.classList.add('show-tip');
      setTimeout(() => cf.classList.remove('show-tip'), 4500);
    }, 7000);
  };

  /* ---------- Preloader ---------- */
  function runPreloader(onDone) {
    const pl = $('.preloader');
    if (!pl) { root.classList.remove('is-loading'); onDone(); return; }
    const countEl = $('.pl-count', pl);
    const bar = $('.pl-bar span', pl);
    const minTime = reduceMotion ? 300 : 2000;
    const maxTime = 4500;
    const start = performance.now();
    let loaded = document.readyState === 'complete';
    let shown = 0;
    let finished = false;
    if (!loaded) window.addEventListener('load', () => { loaded = true; }, { once: true });

    const finish = () => {
      if (finished) return;
      finished = true;
      setTimeout(() => {
        pl.classList.add('is-done');
        root.classList.remove('is-loading');
        setTimeout(onDone, reduceMotion ? 0 : 320);
        setTimeout(() => pl.remove(), 1300);
      }, 160);
    };

    const tick = (now) => {
      const t = now - start;
      const cap = loaded || t > maxTime ? 1 : 0.9;
      const target = Math.min(t / minTime, cap);
      shown += (target - shown) * 0.14;
      if (target === 1 && shown > 0.994) shown = 1;
      countEl.textContent = Math.round(shown * 100);
      bar.style.transform = `scaleX(${shown})`;
      if (shown >= 1) { finish(); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Início ---------- */
  initParticles();
  initScrollAnimations();
  runPreloader(() => {
    if (lenis) lenis.start();
    heroIntro();
    startChatFloat();
    if (location.hash.length > 1) {
      const target = document.querySelector(location.hash);
      if (target) setTimeout(() => scrollToTarget(target), 400);
    }
  });
})();
