(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Intro overlay cleanup ---------- */
  var introOverlay = document.getElementById("introOverlay");
  if (introOverlay) {
    introOverlay.addEventListener("animationend", function () {
      introOverlay.style.display = "none";
    });
    // Safety net in case animationend doesn't fire (e.g. reduced motion / older browsers)
    setTimeout(function () {
      introOverlay.style.display = "none";
    }, 2200);
  }

  /* ---------- Typed caption ---------- */
  var captionEl = document.getElementById("typedCaption");
  var captionText = "Designing interfaces, building products, and evolving with AI.";
  if (captionEl) {
    if (reduceMotion) {
      captionEl.textContent = captionText;
    } else {
      var i = 0;
      var typeSpeed = 32;
      (function typeNext() {
        if (i <= captionText.length) {
          captionEl.textContent = captionText.slice(0, i);
          i++;
          setTimeout(typeNext, typeSpeed);
        }
      })();
    }
  }

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById("siteHeader");
  var backToTop = document.getElementById("backToTop");
  var lastKnownY = 0;
  var ticking = false;

  function onScrollUpdate() {
    lastKnownY = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", lastKnownY > 40);
    if (backToTop) backToTop.classList.toggle("is-visible", lastKnownY > window.innerHeight * 0.7);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScrollUpdate);
      ticking = true;
    }
  }, { passive: true });
  onScrollUpdate();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }
  if (backToTop) backToTop.addEventListener("click", scrollToTop);
  var footerTop = document.getElementById("footerTop");
  if (footerTop) footerTop.addEventListener("click", scrollToTop);

  var scrollCue = document.getElementById("scrollCue");
  if (scrollCue) {
    scrollCue.addEventListener("click", function () {
      var about = document.getElementById("about");
      if (about) about.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    navLinks.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scroll-spy nav highlighting ---------- */
  var sections = ["home", "about", "skills", "education", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var navLinkMap = {};
  document.querySelectorAll(".nav-link").forEach(function (link) {
    navLinkMap[link.dataset.nav] = link;
  });

  if ("IntersectionObserver" in window && sections.length) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          Object.keys(navLinkMap).forEach(function (key) {
            navLinkMap[key].classList.toggle("is-active", key === entry.target.id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (section) { spyObserver.observe(section); });
  }

  /* ---------- Scroll-linked parallax depth (hero photo) ---------- */
  if (!reduceMotion) {
    var heroVisual = document.querySelector(".hero-visual");
    window.addEventListener("scroll", function () {
      var y = window.scrollY || window.pageYOffset;
      if (heroVisual && y < window.innerHeight * 1.3) {
        heroVisual.style.transform = "translateY(" + (y * 0.08).toFixed(1) + "px)";
      }
    }, { passive: true });
  }

  /* ---------- Reveal-on-scroll (generic, applies to any .reveal element) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Subtle tilt on project media (mouse-driven, desktop only) ---------- */
  var supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (supportsHover && !reduceMotion) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      var maxTilt = 14;
      card.style.transition = "transform .35s var(--ease-out), box-shadow .35s var(--ease-out)";
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        var rotY = (px * maxTilt).toFixed(2);
        var rotX = (-py * maxTilt).toFixed(2);
        card.style.transform = "perspective(900px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg) scale3d(1.03,1.03,1.03)";
        var shadowX = (px * -18).toFixed(1);
        var shadowY = (py * -18).toFixed(1);
        card.style.boxShadow = shadowX + "px " + (parseFloat(shadowY) + 24) + "px 46px -20px rgba(51,48,42,.55)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
        card.style.boxShadow = "";
      });
    });
  }

  /* ---------- 3D background scene (WebGL/GLSL: sun + flowing light field) ----------
     A single full-screen fragment shader, not a mesh — this is what makes real mouse
     distortion and click ripples possible. Layered flow-noise builds the silk/ribbon look,
     colored warm gold near a sun in the upper-left fading to cool cyan/deep-blue across the
     rest of the frame. Mouse position is smoothed (inertia) before reaching the shader; clicks
     drop a ripple into a small ring buffer that decays over ~3s. Octave/ripple counts and pixel
     ratio scale down automatically on coarse-pointer/low-core devices. */
  (function initScene() {
    var canvas = document.getElementById("scene");
    if (!canvas) return;
    if (reduceMotion || typeof THREE === "undefined") {
      canvas.style.display = "none";
      return;
    }
    try {
      var lowPower = (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
      var OCTAVES = lowPower ? 2 : 3;
      var MAX_RIPPLES = lowPower ? 4 : 7;
      var pixelRatioCap = lowPower ? 1.3 : 2;

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));
      renderer.setSize(window.innerWidth, window.innerHeight);

      var scene = new THREE.Scene();
      var camera = new THREE.Camera(); // unused by the shader, required by renderer.render()

      // Full-viewport triangle (cheaper than two triangles, no diagonal seam)
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([
        -1, -1, 0, 3, -1, 0, -1, 3, 0
      ]), 3));

      var vertexShader = "void main() { gl_Position = vec4(position, 1.0); }";

      var fragmentShader = [
        "precision highp float;",
        "uniform vec2 uResolution;",
        "uniform float uTime;",
        "uniform vec2 uMouse;",
        "uniform float uAspect;",
        "uniform vec3 uRipples[MAX_RIPPLES];",
        "",
        "float hash21(vec2 p) {",
        "  p = fract(p * vec2(123.34, 456.21));",
        "  p += dot(p, p + 45.32);",
        "  return fract(p.x * p.y);",
        "}",
        "",
        "float flow(vec2 uv, float t, float speedMul, float scaleMul) {",
        "  float v = 0.0;",
        "  vec2 p = uv * scaleMul;",
        "  float amp = 0.55;",
        "  for (int i = 0; i < OCTAVES; i++) {",
        "    float fi = float(i);",
        "    v += amp * sin(p.x * (1.6 + fi * 0.9) + t * (0.22 + fi * 0.09) * speedMul",
        "               + sin(p.y * (1.3 + fi * 0.5) + t * 0.15 * speedMul) * 1.1);",
        "    p += vec2(v * 0.12, -v * 0.09);",
        "    amp *= 0.58;",
        "  }",
        "  return v;",
        "}",
        "",
        "float ribbonMask(float v, float freq, float width) {",
        "  float f = fract(v * freq);",
        "  float d = abs(f - 0.5);",
        "  return 1.0 - smoothstep(0.0, width, d);",
        "}",
        "",
        "void main() {",
        "  vec2 uv = gl_FragCoord.xy / uResolution.xy;",
        "  uv.y = 1.0 - uv.y;",
        "  vec2 auv = vec2(uv.x * uAspect, uv.y);",
        "  vec2 mouse = vec2(uMouse.x * uAspect, uMouse.y);",
        "",
        "  vec2 distort = vec2(0.0);",
        "  vec2 toMouse = auv - mouse;",
        "  float mDist = length(toMouse);",
        "  distort += normalize(toMouse + 0.0001) * exp(-mDist * 3.2) * 0.05;",
        "",
        "  float rippleGlow = 0.0;",
        "  for (int i = 0; i < MAX_RIPPLES; i++) {",
        "    vec3 r = uRipples[i];",
        "    float age = uTime - r.z;",
        "    if (r.z > -500.0 && age > 0.0 && age < 1.6) {",
        "      vec2 rp = vec2(r.x * uAspect, r.y);",
        "      float radius = age * 0.5;",
        "      float d = length(auv - rp);",
        "      float ring = smoothstep(radius - 0.035, radius, d) - smoothstep(radius, radius + 0.035, d);",
        "      float fade = exp(-age * 1.9);",
        "      rippleGlow += ring * fade * 1.6;",
        "      distort += normalize(auv - rp + 0.0001) * ring * fade * 0.05;",
        "    }",
        "  }",
        "",
        "  float mouseGlow = exp(-mDist * 5.5);",
        "",
        "  vec2 wuv = auv + distort;",
        "  float f1 = flow(wuv, uTime, 1.0, 1.0);",
        "  float f2 = flow(wuv + vec2(1.7, -0.8), uTime, 0.7, 1.6);",
        "  float f3 = flow(wuv + vec2(-2.3, 1.4), uTime, 0.45, 2.4);",
        "",
        "  float ribbonsNear = ribbonMask(f1, 1.0, 0.16) * 0.85;",
        "  float ribbonsMid = ribbonMask(f2, 1.4, 0.1) * 0.55;",
        "  float ribbonsFar = ribbonMask(f3, 1.9, 0.07) * 0.35;",
        "",
        "  vec2 sunPos = vec2(0.16 * uAspect, 0.16);",
        "  float sunDist = length(auv - sunPos);",
        "  float sunCore = exp(-sunDist * 26.0);",
        "  float sunWide = exp(-sunDist * 3.2);",
        "",
        "  vec3 deepBlue = vec3(0.03, 0.09, 0.22);",
        "  vec3 midBlue = vec3(0.05, 0.28, 0.5);",
        "  vec3 cyan = vec3(0.24, 0.62, 0.78);",
        "  vec3 warmGold = vec3(1.0, 0.72, 0.36);",
        "  vec3 warmAmber = vec3(1.0, 0.55, 0.24);",
        "",
        "  vec3 bg = mix(midBlue, deepBlue, auv.y);",
        "  bg = mix(bg, cyan * 0.5, ribbonsFar);",
        "",
        "  vec3 nearColor = mix(warmGold, cyan, smoothstep(0.0, 1.15, sunDist));",
        "  vec3 midColor = mix(warmAmber, midBlue, smoothstep(0.15, 1.3, sunDist));",
        "",
        "  vec3 color = bg;",
        "  color = mix(color, midColor, ribbonsMid);",
        "  color = mix(color, nearColor, ribbonsNear);",
        "",
        "  vec2 grid = auv * 34.0;",
        "  vec2 gi = floor(grid);",
        "  vec2 gf = fract(grid) - 0.5;",
        "  float h = hash21(gi);",
        "  float twinkle = 0.5 + 0.5 * sin(uTime * 0.8 + h * 30.0);",
        "  float sparkle = smoothstep(0.05, 0.0, length(gf)) * step(0.984, h);",
        "  color += vec3(0.85, 0.92, 1.0) * sparkle * twinkle * 0.7;",
        "",
        "  vec3 sunColor = mix(warmAmber, vec3(1.0, 0.98, 0.9), sunCore);",
        "  color += sunColor * (sunWide * 0.65 + sunCore * 1.3);",
        "  color += vec3(0.75, 0.9, 1.0) * rippleGlow;",
        "  color += vec3(0.7, 0.88, 1.0) * mouseGlow * 0.18;",
        "",
        "  float vig = smoothstep(1.5, 0.2, length(auv - vec2(0.75 * uAspect, 0.85)));",
        "  color *= mix(0.72, 1.0, vig);",
        "",
        "  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);",
        "}"
      ].join("\n")
        .replace(/OCTAVES/g, String(OCTAVES))
        .replace(/MAX_RIPPLES/g, String(MAX_RIPPLES));

      var rippleUniformArray = [];
      for (var ri = 0; ri < MAX_RIPPLES; ri++) rippleUniformArray.push(new THREE.Vector3(0, 0, -9999));

      var material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.16, 0.16) },
          uAspect: { value: window.innerWidth / window.innerHeight },
          uRipples: { value: rippleUniformArray }
        },
        depthTest: false,
        depthWrite: false
      });

      var mesh = new THREE.Mesh(geo, material);
      scene.add(mesh);

      // Mouse: raw target updated on move, smoothed toward each frame for inertia
      var mouseTarget = { x: 0.16, y: 0.16 };
      var mouseSmoothed = { x: 0.16, y: 0.16 };
      function setMouseFromClient(clientX, clientY) {
        mouseTarget.x = clientX / window.innerWidth;
        mouseTarget.y = clientY / window.innerHeight;
      }
      window.addEventListener("pointermove", function (e) {
        setMouseFromClient(e.clientX, e.clientY);
      }, { passive: true });
      window.addEventListener("touchmove", function (e) {
        if (e.touches && e.touches[0]) setMouseFromClient(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });

      // Click / tap: drop a ripple into the ring buffer
      var rippleSlot = 0;
      var clockStart = performance.now();
      function addRipple(clientX, clientY) {
        var x = clientX / window.innerWidth;
        var y = clientY / window.innerHeight;
        var t = (performance.now() - clockStart) / 1000;
        rippleUniformArray[rippleSlot].set(x, y, t);
        rippleSlot = (rippleSlot + 1) % MAX_RIPPLES;
      }
      window.addEventListener("click", function (e) { addRipple(e.clientX, e.clientY); });
      window.addEventListener("touchstart", function (e) {
        if (e.touches && e.touches[0]) {
          setMouseFromClient(e.touches[0].clientX, e.touches[0].clientY);
          addRipple(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      function animate() {
        requestAnimationFrame(animate);
        var t = (performance.now() - clockStart) / 1000;
        mouseSmoothed.x += (mouseTarget.x - mouseSmoothed.x) * 0.16;
        mouseSmoothed.y += (mouseTarget.y - mouseSmoothed.y) * 0.16;
        material.uniforms.uTime.value = t;
        material.uniforms.uMouse.value.set(mouseSmoothed.x, mouseSmoothed.y);
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener("resize", function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));
        material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        material.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
      });
    } catch (err) {
      canvas.style.display = "none";
    }
  })();

})();
