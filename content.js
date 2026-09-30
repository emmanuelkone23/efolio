/* Remplit la page à partir de data.js et gère les interactions (hors 3D). */
(function () {
  "use strict";
  var D = window.PORTFOLIO || {};
  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("is-loading");

  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function initials(t) {
    return String(t || "").split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  /* Image avec visuel de remplacement qui indique le chemin attendu */
  function media(src, alt, label) {
    var box = el("div", "media");
    box.appendChild(el("div", "media__ph", "<span>" + esc(label) + "</span>" + (src ? "<small>Ajoutez : " + esc(src) + "</small>" : "")));
    if (src) {
      var img = new Image();
      img.alt = alt || "";
      img.decoding = "async";
      img.loading = "lazy";
      img.addEventListener("load", function () { box.classList.add("is-loaded"); });
      img.addEventListener("error", function () { img.remove(); });
      img.src = src;
      box.appendChild(img);
    }
    return box;
  }

  try {
    /* Textes simples */
    var parts = String(D.nom || "").trim().split(/\s+/);
    var binds = Object.assign({}, D, { prenom: parts[0] || "", nomFamille: parts.slice(1).join(" ") });
    document.querySelectorAll("[data-bind]").forEach(function (n) {
      var v = binds[n.dataset.bind];
      if (v != null) n.textContent = v;
    });
    if (D.nom) document.title = D.nom + " · " + (D.metier || "Portfolio");

    /* À propos */
    $("#portrait").appendChild(media(D.photo, D.nom, D.initiales || initials(D.nom)));
    $("#portrait .media").style.height = "100%";
    var ap = D.apropos || {};
    $("#aproposTitre").textContent = ap.titre || "";
    $("#aproposTexte").innerHTML = (ap.paragraphes || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    $("#stats").innerHTML = (D.chiffres || []).map(function (c) {
      return '<div><dt><span data-count="' + Number(c.valeur || 0) + '">' + Number(c.valeur || 0) + "</span>" + esc(c.suffixe) + "</dt><dd>" + esc(c.label) + "</dd></div>";
    }).join("");

    /* Parcours */
    $("#timeline").innerHTML = (D.parcours || []).map(function (p) {
      return '<li data-reveal><div class="tl__when">' + esc(p.periode) + (p.type ? '<br><span class="tl__type">' + esc(p.type) + "</span>" : "") +
        '</div><div class="tl__what"><h3>' + esc(p.titre) + "</h3><p>" + esc(p.lieu) + '</p></div><p class="tl__text">' + esc(p.texte) + "</p></li>";
    }).join("");

    /* Compétences */
    $("#skills").innerHTML = (D.competences || []).map(function (g) {
      var items = (g.items || []).map(function (it) {
        var nom = typeof it === "string" ? it : it.nom;
        var n = typeof it === "object" && it.niveau ? clamp(it.niveau, 0, 5) : 0;
        var lvl = "";
        if (n) {
          lvl = '<span class="lvl" role="img" aria-label="Niveau ' + n + ' sur 5">';
          for (var i = 1; i <= 5; i++) lvl += '<i class="' + (i <= n ? "on" : "") + '"></i>';
          lvl += "</span>";
        }
        return "<li><span>" + esc(nom) + "</span>" + lvl + "</li>";
      }).join("");
      return '<div class="skill" data-reveal><div class="skill__head"><h3>' + esc(g.groupe) + "</h3><span>" +
        String((g.items || []).length).padStart(2, "0") + "</span></div><ul>" + items + "</ul></div>";
    }).join("");

    /* Réalisations */
    var cards = $("#cards");
    (D.projets || []).forEach(function (p, i) {
      var b = el("button", "card");
      b.type = "button";
      b.setAttribute("aria-label", "Voir le projet " + (p.titre || ""));
      var inner = el("div", "card__inner");
      var m = media(p.image, p.titre, initials(p.titre));
      if (p.exemple) m.appendChild(el("span", "card__tag", "Exemple"));
      m.appendChild(el("span", "card__open", "↗"));
      inner.appendChild(m);
      inner.appendChild(el("div", "card__meta", "<span>" + esc(p.categorie) + "</span><span>" + esc(p.annee) + "</span>"));
      inner.appendChild(el("h3", null, esc(p.titre)));
      inner.appendChild(el("p", null, esc(p.resume)));
      b.appendChild(inner);
      b.addEventListener("click", function () { openProject(p); });
      cards.appendChild(b);
    });

    /* Documentation */
    $("#steps").innerHTML = (D.methode || []).map(function (s) {
      return '<li data-reveal><div><h4>' + esc(s.titre) + "</h4><p>" + esc(s.texte) + "</p></div></li>";
    }).join("");

    /* Contact */
    var c = D.contact || {};
    $("#mailText").textContent = c.email || "";
    $("#mailLink").href = "mailto:" + (c.email || "");
    $("#phone").innerHTML = c.telephone ? '<a href="tel:' + esc(String(c.telephone).replace(/\s+/g, "")) + '">' + esc(c.telephone) + "</a>" : "";
    $("#socials").innerHTML = (c.reseaux || []).map(function (r) {
      return '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.nom) + " ↗</a>";
    }).join("");
    $("#copyMail").addEventListener("click", function () {
      var btn = this;
      function done(ok) {
        btn.textContent = ok ? "Adresse copiée" : "Sélectionnez l'adresse";
        if (!ok) { var r = document.createRange(); r.selectNodeContents($("#mailText")); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
        setTimeout(function () { btn.textContent = "Copier l'adresse"; }, 2200);
      }
      try { navigator.clipboard.writeText(c.email || "").then(function () { done(true); }, function () { done(false); }); }
      catch (e) { done(false); }
    });
    $("#year").textContent = new Date().getFullYear();
  } catch (err) {
    console.error("Contenu du portfolio :", err);
  }

  /* Fiche projet */
  var modal = $("#modal");
  function openProject(p) {
    $("#modalKicker").textContent = [p.categorie, p.annee].filter(Boolean).join(" · ");
    $("#modalTitle").textContent = p.titre || "";
    $("#modalRole").textContent = p.role || "";
    $("#modalDesc").innerHTML = (p.description || [p.resume]).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("");
    $("#modalStack").innerHTML = (p.stack || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
    var g = $("#modalGallery");
    g.innerHTML = "";
    [p.image].concat(p.galerie || []).filter(Boolean).forEach(function (src, i) {
      g.appendChild(media(src, (p.titre || "") + " — image " + (i + 1), initials(p.titre)));
    });
    if (!g.children.length) g.appendChild(media("", p.titre, initials(p.titre)));
    var link = $("#modalLink");
    if (p.lien) { link.href = p.lien; link.hidden = false; } else link.hidden = true;
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
    modal.scrollTop = 0;
  }
  $("#modalClose").addEventListener("click", function () { modal.close(); });
  modal.addEventListener("click", function (e) { if (e.target === modal) modal.close(); });

  /* Thème */
  var themeBtn = $("#themeToggle");
  try { var saved = localStorage.getItem("pf-theme"); if (saved) root.dataset.theme = saved; } catch (e) {}
  themeBtn.addEventListener("click", function () {
    var dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("pf-theme", root.dataset.theme); } catch (e) {}
    window.dispatchEvent(new Event("themechange"));
  });

  /* Menu mobile */
  var nav = $("#nav"), menuBtn = $("#menuBtn");
  menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.textContent = open ? "Fermer" : "Menu";
  });
  document.querySelectorAll("#navLinks a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.textContent = "Menu";
    });
  });

  /* Horloge locale */
  var clock = $("#clock");
  function tick() {
    try {
      clock.textContent = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: D.fuseauHoraire || undefined, timeZoneName: "short" }).format(new Date());
    } catch (e) { clock.textContent = ""; }
  }
  tick(); setInterval(tick, 20000);

  /* Défilement horizontal des réalisations */
  var hs = $("#realisations"), track = $("#track"), hsBar = $("#hsBar"), hsDist = 0;
  function sizeHS() {
    if (window.innerWidth < 980) {
      hs.classList.remove("is-h"); hs.style.height = ""; track.style.transform = ""; hsDist = 0; return;
    }
    hs.classList.add("is-h");
    hsDist = Math.max(0, track.scrollWidth - window.innerWidth);
    hs.style.height = (hsDist + window.innerHeight) + "px";
  }

  /* Interactions liées au défilement */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main > section"));
  var links = {};
  document.querySelectorAll("#navLinks a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var shapeNames = ["Sphère", "Hélice", "Onde", "Anneau", "Constellation", "Monolithe", "Portrait"];
  var bar = $("#progressBar"), hudS = $("#hudSection"), hudShape = $("#hudShape"), hudPct = $("#hudPct"), hud = $(".hud");
  var current = null, ticking = false;

  function onScroll() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    var p = max > 0 ? y / max : 0;
    bar.style.transform = "scaleX(" + p + ")";
    hudPct.textContent = String(Math.round(p * 100)).padStart(3, "0");
    nav.classList.toggle("is-scrolled", y > 40);
    hud.classList.toggle("is-hidden", p > 0.985);

    if (hsDist) {
      var r = hs.getBoundingClientRect();
      var hp = clamp(-r.top / (r.height - vh), 0, 1);
      track.style.transform = "translate3d(" + (-hp * hsDist).toFixed(1) + "px,0,0)";
      hsBar.style.transform = "scaleX(" + hp + ")";
    }

    var mid = y + vh * 0.5, sec = sections[0];
    for (var i = 0; i < sections.length; i++) if (sections[i].offsetTop <= mid) sec = sections[i];
    if (sec !== current) {
      current = sec;
      hudS.textContent = sec.dataset.label || "";
      hudShape.textContent = shapeNames[+sec.dataset.shape] || "";
      Object.keys(links).forEach(function (k) { links[k].classList.toggle("is-active", k === sec.id); });
    }
  }
  function requestScroll() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", function () { sizeHS(); requestScroll(); });

  /* Inclinaison 3D des cartes au survol */
  if (!reduced && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".card").forEach(function (card) {
      var inner = card.firstChild;
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform = "rotateY(" + (x * 10).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg) translateZ(0)";
      });
      card.addEventListener("pointerleave", function () { inner.style.transform = ""; });
    });
  }

  /* Compteurs */
  function countUp(node) {
    var to = +node.dataset.count, t0 = null;
    if (reduced || !to) return;
    function step(t) {
      if (!t0) t0 = t;
      var k = clamp((t - t0) / 1600, 0, 1);
      node.textContent = Math.round(to * (1 - Math.pow(1 - k, 4)));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* Apparitions : seuls les éléments sous la ligne de flottaison sont masqués au départ */
  function setupReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (reduced || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.remove("pre");
        en.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (n, i) {
      if (n.getBoundingClientRect().top > window.innerHeight) {
        n.classList.add("pre");
        n.style.transitionDelay = (n.parentElement.children.length > 1 ? (Array.prototype.indexOf.call(n.parentElement.children, n) % 4) * 90 : 0) + "ms";
        io.observe(n);
      }
    });
    requestAnimationFrame(function () { root.classList.add("reveal-ready"); });
  }

  /* Chargement */
  var loader = $("#loader"), lc = $("#loaderCount"), lb = $("#loaderBar");
  var start = performance.now(), dur = reduced ? 200 : 1300;
  function loadStep(t) {
    var k = clamp((t - start) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
    lc.textContent = Math.round(e * 100);
    lb.style.transform = "scaleX(" + e + ")";
    if (k < 1) return requestAnimationFrame(loadStep);
    loader.classList.add("is-done");
    root.classList.remove("is-loading");
    window.dispatchEvent(new Event("portfolio:ready"));
    setTimeout(function () { loader.hidden = true; }, 1100);
  }
  sizeHS();
  setupReveal();
  onScroll();
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 1500); })]).then(function () {
    sizeHS(); onScroll();
    start = performance.now();
    requestAnimationFrame(loadStep);
  });
})();
