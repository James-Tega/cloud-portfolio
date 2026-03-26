(function(){

  // THEME
  document.getElementById('tbtn').addEventListener('click', function(){
    var h = document.documentElement;
    var dark = h.getAttribute('data-theme') === 'dark';
    h.setAttribute('data-theme', dark ? 'light' : 'dark');
    this.textContent = dark ? '\u2600 DARK MODE' : '\u2600 LIGHT MODE';
  });

  // CURSOR
  var cur = document.getElementById('cur');
  var ring = document.getElementById('ring');
  var mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', function(e){
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top = my + 'px';
  });
  (function loop(){
    rx += (mx - rx) * 0.22;
    ry += (my - ry) * 0.22;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();

  // PARTICLES — hero-aware with smooth scroll transition
  var cv = document.getElementById('cvs');
  var ctx = cv.getContext('2d');
  var W, H;
  function rsz(){ W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
  rsz();
  window.addEventListener('resize', rsz);

  // Two sets: hero particles (large) and background particles (small)
  var heroPts = [];
  var bgPts = [];
  for(var i = 0; i < 40; i++){
    heroPts.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 3 + 2
    });
  }
  for(var i = 0; i < 55; i++){
    bgPts.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.2 + 0.4
    });
  }

  (function draw(){
    ctx.clearRect(0, 0, W, H);
    var dk = document.documentElement.getAttribute('data-theme') === 'dark';

    // How far past the hero have we scrolled? 0 = on hero, 1 = fully past
    var heroH = window.innerHeight;
    var scrollRatio = Math.min(1, window.scrollY / heroH);
    // heroFade: 1 on hero, 0 when scrolled past
    var heroFade = 1 - scrollRatio;
    // bgFade: 0 on hero, 1 when scrolled past (but always slightly visible)
    var bgFade = 0.3 + scrollRatio * 0.7;

    // Draw hero glow backdrop — radial gradient behind particles
    if(heroFade > 0.01 && dk){
      var grd = ctx.createRadialGradient(W * 0.35, H * 0.5, 0, W * 0.35, H * 0.5, W * 0.6);
      grd.addColorStop(0, 'rgba(255,153,0,' + (0.04 * heroFade) + ')');
      grd.addColorStop(0.5, 'rgba(0,212,255,' + (0.025 * heroFade) + ')');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }

    // BG particles (always present, subtle)
    var bgDc = dk ? 'rgba(255,153,0,' + (0.45 * bgFade) + ')' : 'rgba(140,60,0,' + (0.65 * bgFade) + ')';
    var bgLa = (dk ? 0.12 : 0.28) * bgFade;
    for(var i = 0; i < bgPts.length; i++){
      var p = bgPts[i];
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > W) p.vx *= -1;
      if(p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = bgDc;
      ctx.fill();
    }
    for(var i = 0; i < bgPts.length; i++){
      for(var j = i + 1; j < bgPts.length; j++){
        var dx = bgPts[i].x - bgPts[j].x, dy = bgPts[i].y - bgPts[j].y;
        var d = Math.sqrt(dx*dx + dy*dy);
        if(d < 110){
          ctx.beginPath(); ctx.moveTo(bgPts[i].x, bgPts[i].y); ctx.lineTo(bgPts[j].x, bgPts[j].y);
          ctx.strokeStyle = (dk ? 'rgba(255,153,0,' : 'rgba(140,60,0,') + (bgLa * (1 - d/110)).toFixed(3) + ')';
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }

    // HERO particles — large, bright, fade out on scroll
    if(heroFade > 0.01){
      var heroDc = dk ? 'rgba(255,153,0,' + (0.8 * heroFade) + ')' : 'rgba(180,80,0,' + (0.85 * heroFade) + ')';
      var heroLa = (dk ? 0.22 : 0.45) * heroFade;
      var heroMaxDist = 160;
      for(var i = 0; i < heroPts.length; i++){
        var p = heroPts[i];
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0 || p.x > W) p.vx *= -1;
        if(p.y < 0 || p.y > H) p.vy *= -1;
        // Scale radius with heroFade
        var drawR = p.r * heroFade;
        ctx.beginPath();
        ctx.arc(p.x, p.y, drawR, 0, Math.PI * 2);
        ctx.fillStyle = heroDc;
        ctx.fill();
        // Soft glow on hero particles
        if(dk && heroFade > 0.3){
          ctx.beginPath();
          ctx.arc(p.x, p.y, drawR * 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,153,0,' + (0.04 * heroFade) + ')';
          ctx.fill();
        }
      }
      for(var i = 0; i < heroPts.length; i++){
        for(var j = i + 1; j < heroPts.length; j++){
          var dx = heroPts[i].x - heroPts[j].x, dy = heroPts[i].y - heroPts[j].y;
          var d = Math.sqrt(dx*dx + dy*dy);
          if(d < heroMaxDist){
            ctx.beginPath(); ctx.moveTo(heroPts[i].x, heroPts[i].y); ctx.lineTo(heroPts[j].x, heroPts[j].y);
            ctx.strokeStyle = (dk ? 'rgba(255,153,0,' : 'rgba(180,80,0,') + (heroLa * (1 - d/heroMaxDist)).toFixed(3) + ')';
            ctx.lineWidth = heroFade * 1.2; ctx.stroke();
          }
        }
      }
    }

    requestAnimationFrame(draw);
  })();

  // SCROLL: progress + back to top + active nav
  var prog = document.getElementById('prog');
  var btt = document.getElementById('btt');
  window.addEventListener('scroll', function(){
    var max = document.body.scrollHeight - window.innerHeight;
    prog.style.width = (max > 0 ? (window.scrollY / max * 100) : 0) + '%';
    btt.style.display = window.scrollY > 500 ? 'flex' : 'none';
    var c = '';
    document.querySelectorAll('section').forEach(function(s){
      if(window.scrollY >= s.offsetTop - 300) c = s.id;
    });
    document.querySelectorAll('.nd').forEach(function(n){
      n.classList.toggle('active', n.dataset.s === c);
    });
  });
  btt.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // SCROLL REVEAL
  var ro = new IntersectionObserver(function(e){
    e.forEach(function(x){ if(x.isIntersecting) x.target.classList.add('on'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(function(r){ ro.observe(r); });

  // TYPING ANIMATION
  var typed = document.getElementById('typed');
  var caret = document.getElementById('caret');
  var tout = document.getElementById('tout');
  var txt = 'aws sts get-caller-identity';
  var ti = 0;
  function typeIt(){
    if(ti < txt.length){
      typed.textContent += txt[ti];
      ti++;
      setTimeout(typeIt, 55 + Math.random() * 45);
    } else {
      caret.style.display = 'none';
      setTimeout(function(){ tout.style.opacity = '1'; }, 300);
    }
  }
  setTimeout(typeIt, 1400);

  // RESUME TABS
  document.getElementById('tabs').addEventListener('click', function(e){
    var btn = e.target.closest('.tab');
    if(!btn) return;
    document.querySelectorAll('.tab').forEach(function(b){ b.classList.remove('on'); });
    document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('on'); });
    btn.classList.add('on');
    document.getElementById('p-' + btn.dataset.tab).classList.add('on');
  });

  // PORTFOLIO FILTER
  document.getElementById('filters').addEventListener('click', function(e){
    var btn = e.target.closest('.fb');
    if(!btn) return;
    var cat = btn.dataset.filter;
    document.querySelectorAll('.fb').forEach(function(b){ b.classList.remove('on'); });
    btn.classList.add('on');
    document.querySelectorAll('.pcard').forEach(function(c){
      c.style.display = (cat === 'all' || c.dataset.cat === cat) ? 'block' : 'none';
    });
  });

  // PROJECT CARD GLOW
  document.querySelectorAll('.pcard').forEach(function(card){
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      card.style.background = 'radial-gradient(300px circle at ' + (e.clientX - r.left) + 'px ' + (e.clientY - r.top) + 'px, rgba(255,153,0,0.07), var(--surface) 60%)';
    });
    card.addEventListener('mouseleave', function(){ card.style.background = 'var(--surface)'; });
  });

  // CONTACT FORM
  document.getElementById('sbtn').addEventListener('click', function(){
    var n = document.getElementById('cn').value.trim();
    var e = document.getElementById('ce').value.trim();
    var m = document.getElementById('cm').value.trim();
    var msg = document.getElementById('fmsg');
    if(!n || !e || !m){
      msg.style.display = 'block';
      msg.style.color = 'var(--aws)';
      msg.textContent = 'Please fill in all fields.';
      return;
    }
    var btn = this;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(function(){
      msg.style.display = 'block';
      msg.style.color = 'var(--green)';
      msg.textContent = "Message sent! I'll get back to you soon.";
      btn.textContent = 'Send Message';
      btn.disabled = false;
      document.getElementById('cn').value = '';
      document.getElementById('ce').value = '';
      document.getElementById('cm').value = '';
    }, 900);
  });

  // VISITOR COUNTER
  fetch('https://demqbmsh72.execute-api.us-east-1.amazonaws.com/count', { method: 'POST' })
    .then(function(r){ return r.json(); })
    .then(function(d){ document.getElementById('vcnt').textContent = d.count || '—'; })
    .catch(function(){ document.getElementById('vcnt').textContent = '—'; });

})();
