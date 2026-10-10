/**
 * Project Drive Arena - Track-Locked Flight (Maju & Mundur Sepanjang Lintasan Jalan)
 * Muhammad Arsal Portfolio
 */

(function () {
  'use strict';

  // Projects Data matching 4 Milestones / Pins
  const projects = [
    {
      id: 1,
      code: "01",
      station: "MILESTONE 01 / FINTECH",
      tag: "Fintech / Full-Stack",
      title: "Payme: E-Wallet Proof of Concept (PoC) & Central Back-Office",
      shortDesc: "Prototype ekosistem dompet digital end-to-end: simulasi transaksi P2P, pembelian paket data, riwayat mutasi, sistem reward poin, dan dashboard audit KYC.",
      fullDesc: "Prototype ekosistem dompet digital end-to-end dengan simulasi transaksi peer-to-peer, pembelian paket data, riwayat transaksi, reward berbasis poin, serta dashboard admin untuk manajemen pengguna, verifikasi KYC, dan audit mutasi saldo.",
      year: "2026",
      tech: ["Laravel", "REST API", "Tailwind CSS", "MySQL"],
      images: [
        "images/project/project1/1.webp",
        "images/project/project1/2.webp",
        "images/project/project1/3.webp",
        "images/project/project1/4.webp",
        "images/project/project1/5.webp",
        "images/project/project1/6.webp",
        "images/project/project1/7.webp"
      ],
      pinColor: "#ffffff",
      innerColor: "#1a1d24",
      textColor: "#ffffff"
    },
    {
      id: 2,
      code: "02",
      station: "MILESTONE 02 / E-COMMERCE",
      tag: "E-Commerce / WhatsApp",
      title: "Floral E-Commerce & WhatsApp Integration Platform",
      shortDesc: "Katalog interaktif bunga papan, standing flower, & bouquet untuk pasar B2B & B2C dengan product image zoom dan integrasi click-to-chat WhatsApp instan.",
      fullDesc: "Katalog interaktif bunga papan, standing flower, table flower, dan hand bouquet untuk pasar B2B dan B2C, dengan product image zoom serta integrasi click-to-chat WhatsApp dari eksplorasi produk hingga pemesanan.",
      year: "2026",
      tech: ["Laravel", "JavaScript", "WhatsApp API", "Bootstrap"],
      images: [
        "images/project/project2/1.webp",
        "images/project/project2/2.webp",
        "images/project/project2/3.webp"
      ],
      pinColor: "#ffffff",
      innerColor: "#1a1d24",
      textColor: "#ffffff"
    },
    {
      id: 3,
      code: "03",
      station: "MILESTONE 03 / ARTIFICIAL INTELLIGENCE",
      tag: "AI / NLP / Computer Vision",
      title: "Sistem Konsultasi Herbal Tradisional berbasis AI",
      shortDesc: "Aplikasi mobile cerdas menggabungkan NLP IndoBERT voice chat dan Computer Vision YOLO untuk identifikasi tanaman herbal real-time dengan basis BALITTRO.",
      fullDesc: "Aplikasi mobile yang menggabungkan NLP IndoBERT dan Speech-to-Text untuk konsultasi voice chat, serta Computer Vision YOLO26 untuk identifikasi tanaman herbal secara real-time dengan basis pengetahuan BALITTRO dan validasi praktisi medis.",
      year: "2026",
      tech: ["Python", "IndoBERT", "YOLO Vision", "Mobile App", "FastAPI"],
      images: [
        "images/project/project3/1.webp",
        "images/project/project3/2.webp",
        "images/project/project3/3.webp",
        "images/project/project3/4.webp"
      ],
      pinColor: "#ffffff",
      innerColor: "#1a1d24",
      textColor: "#ffffff"
    },
    {
      id: 4,
      code: "04",
      station: "MILESTONE 04 / MOBILE & CHATBOT",
      tag: "Mobile / Chatbot",
      title: "ZISmart: Zakat Management Mobile App & Chatbot Integration",
      shortDesc: "Aplikasi mobile edukasi, kalkulator zakat otomatis, serta chatbot interaktif dengan pengujian QA lintas SDK dan performa optimal pada Android 12–14.",
      fullDesc: "Aplikasi mobile untuk edukasi, kalkulasi, dan transaksi Zakat, Infaq, dan Sadaqah dengan chatbot interaktif, pengujian QA lintas SDK, serta performa optimal pada Android 12 hingga 14. Hasil penelitian telah dipublikasikan dalam jurnal ilmiah.",
      year: "2026",
      tech: ["Flutter / Android", "NLP Chatbot", "Laravel API", "QA Testing"],
      images: [
        "images/project/project4/1.webp",
        "images/project/project4/2.webp",
        "images/project/project4/3.webp"
      ],
      pinColor: "#ffffff",
      innerColor: "#1a1d24",
      textColor: "#ffffff"
    }
  ];

  // DOM Elements
  let canvas, ctx;
  let arenaWrapper;
  let hudCard, hudStation, hudTitle, hudDesc, hudTags, hudDetailBtn;
  let autoDriveBtn, btnPrevStation, btnNextStation;
  let dpadUp, dpadDown;
  let modal, modalTitle, modalTag, modalDesc, modalTechList, modalGalleryMain, modalGalleryThumbs, modalCloseBtn;

  // Canvas State & Dimensions
  let width = 0;
  let height = 0;
  let dpr = 1;
  let roadWidth = 68;
  const tierRatios = [0.16, 0.38, 0.60, 0.82];

  // Track Distance State
  let totalTrackLength = 0;
  let splineSamples = [];
  let stationPins = [];

  // Plane Flight State (Locked to Track Distance)
  const plane = {
    distance: 0, // distance in pixels along track [0..totalTrackLength]
    x: 0,
    y: 0,
    angle: 0,
    bankAngle: 0,
    speed: 0,
    scale: 0.9, // 👉 UKURAN PESAWAT: Ubah angka ini (Contoh: 0.7 = lebih kecil, 1.0 = normal, 1.3 = lebih besar, 1.5 = jumbo)
    maxForward: 4.8,
    maxReverse: -3.6,
    accel: 0.22,
    brake: 0.32,
    friction: 0.94
  };

  // Keyboard / Touch Inputs (Maju & Mundur Only)
  const keys = {
    forward: false,
    backward: false
  };

  // State Management
  let isAutoDrive = true;
  let currentTargetIndex = 0;
  let activeStation = null;
  let stationDwellTimer = 0;

  // Jet Contrails / Vapor Particles
  const particles = [];

  // Catmull-Rom Spline Interpolator
  function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return {
      x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
    };
  }

  // Initialize
  function init() {
    canvas = document.getElementById('projectDriveCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    arenaWrapper = document.getElementById('projectDriveArena');

    // HUD Elements
    hudCard = document.getElementById('stationHudCard');
    hudStation = document.getElementById('hudStationCode');
    hudTitle = document.getElementById('hudStationTitle');
    hudDesc = document.getElementById('hudStationDesc');
    hudTags = document.getElementById('hudStationTags');
    hudDetailBtn = document.getElementById('hudDetailBtn');

    // Controls
    autoDriveBtn = document.getElementById('btnToggleAutoDrive');
    btnPrevStation = document.getElementById('btnPrevStation');
    btnNextStation = document.getElementById('btnNextStation');

    // Touch Throttle (Maju & Mundur Only)
    dpadUp = document.getElementById('dpadUp');
    dpadDown = document.getElementById('dpadDown');

    // Modal
    modal = document.getElementById('projectDetailModal');
    modalTitle = document.getElementById('modalProjectTitle');
    modalTag = document.getElementById('modalProjectTag');
    modalDesc = document.getElementById('modalProjectDesc');
    modalTechList = document.getElementById('modalTechList');
    modalGalleryMain = document.getElementById('modalGalleryMain');
    modalGalleryThumbs = document.getElementById('modalGalleryThumbs');
    modalCloseBtn = document.getElementById('modalCloseBtn');

    // Canvas Resize & Spline Setup
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('load', resizeCanvas);
    setTimeout(resizeCanvas, 300);
    setTimeout(resizeCanvas, 800);
    setTimeout(resizeCanvas, 1500);

    // Setup Listeners
    setupInputs();
    setupButtons();
    setupModal();
    setupMagneticController();

    // Start Animation Loop
    requestAnimationFrame(gameLoop);
  }

  function resizeCanvas() {
    if (!arenaWrapper || !canvas) return;
    const rect = arenaWrapper.getBoundingClientRect();
    width = rect.width || arenaWrapper.offsetWidth || window.innerWidth || 1200;
    const availableH = arenaWrapper.clientHeight || rect.height;
    height = availableH > 200 ? Math.round(availableH) : Math.round(Math.max(460, Math.min(600, window.innerHeight * 0.64)));

    dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);

    roadWidth = Math.max(56, Math.min(76, width * 0.08));

    // Rebuild track spline & distances
    buildWindingRoadSpline();

    // Position plane at Station 01 if at start
    if (stationPins.length > 0 && plane.distance === 0) {
      plane.distance = stationPins[0].trackDist;
      updatePlaneCoordinates();
    }

    // Re-adjust HUD Card if visible
    if (activeStation !== null && activeStation !== undefined && hudCard && hudCard.classList.contains('visible')) {
      const pinY = tierRatios[activeStation] * height;
      const cardH = hudCard.offsetHeight || 180;
      const clampedY = Math.max(cardH / 2 + 14, Math.min(height - cardH / 2 - 14, pinY));
      hudCard.style.top = clampedY + 'px';
    }
  }

  // Build the 4 Straight Flight Runways (Bablas ke Kanan Keluar Layar, Muncul di Kiri)
  function buildWindingRoadSpline() {
    const tierStartX = -200;
    const tierEndX = width + 200;
    const tierLength = tierEndX - tierStartX;
    totalTrackLength = 4 * tierLength;

    stationPins = [];

    for (let i = 0; i < 4; i++) {
      const pinX = width * 0.50;
      const pinY = tierRatios[i] * height;
      const pinDist = i * tierLength + (pinX - tierStartX);

      stationPins[i] = {
        x: pinX,
        y: pinY,
        angle: 0,
        trackDist: pinDist
      };
    }
  }

  // Lookup exact coordinates, heading, and banking along the track (Bablas ke Kanan Keluar Layar, Muncul di Kiri)
  function getTrackPosition(dist) {
    if (width === 0 || height === 0 || totalTrackLength === 0) {
      return { x: 0, y: 0, angle: 0, bank: 0 };
    }

    const tierStartX = -200;
    const tierEndX = width + 200;
    const tierLength = tierEndX - tierStartX;

    const d = ((dist % totalTrackLength) + totalTrackLength) % totalTrackLength;
    const tierIdx = Math.floor(d / tierLength) % 4;
    const tierDist = d - tierIdx * tierLength; // [0 .. tierLength]

    const x = tierStartX + tierDist;
    const y = tierRatios[tierIdx] * height;
    const angle = 0; // Always facing directly to the right!
    const bank = 0;

    return { x, y, angle, bank };
  }

  function updatePlaneCoordinates() {
    const pos = getTrackPosition(plane.distance);
    plane.x = pos.x;
    plane.y = pos.y;
    plane.angle = pos.angle;
    plane.bankAngle = pos.bank;
  }

  function setupInputs() {
    window.addEventListener('keydown', (e) => {
      if (modal && modal.classList.contains('active')) return;

      // Maju (Forward along track)
      if (['ArrowUp', 'KeyW', 'ArrowRight', 'KeyD'].includes(e.code)) {
        keys.forward = true;
        disableAutoDrive();
        e.preventDefault();
      }
      // Mundur (Backward along track)
      if (['ArrowDown', 'KeyS', 'ArrowLeft', 'KeyA'].includes(e.code)) {
        keys.backward = true;
        disableAutoDrive();
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW', 'ArrowRight', 'KeyD'].includes(e.code)) keys.forward = false;
      if (['ArrowDown', 'KeyS', 'ArrowLeft', 'KeyA'].includes(e.code)) keys.backward = false;
    });

    // Touch Throttle Buttons (Maju & Mundur Only) - Rubber Elastic Stretch
    const arcadeWrapper = document.getElementById('arcadeTouchDpad');
    const bindTouch = (elem, keyName, pullClass) => {
      if (!elem) return;
      const start = (e) => {
        e.preventDefault();
        keys[keyName] = true;
        disableAutoDrive();
        if (arcadeWrapper) {
          arcadeWrapper.classList.add(pullClass);
          if (window.gsap) {
            const pullY = keyName === 'forward' ? -8 : 8;
            gsap.to(arcadeWrapper, {
              scaleX: 0.93,
              scaleY: 1.12,
              y: pullY,
              duration: 0.15,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }
        }
      };
      const end = (e) => {
        e.preventDefault();
        keys[keyName] = false;
        if (arcadeWrapper) {
          arcadeWrapper.classList.remove(pullClass);
          if (window.gsap) {
            gsap.to(arcadeWrapper, {
              scaleX: 1,
              scaleY: 1,
              x: 0,
              y: 0,
              duration: 1.2,
              ease: 'elastic.out(1.2, 0.35)',
              overwrite: 'auto'
            });
          }
        }
      };
      elem.addEventListener('mousedown', start);
      elem.addEventListener('mouseup', end);
      elem.addEventListener('mouseleave', end);
      elem.addEventListener('touchstart', start, { passive: false });
      elem.addEventListener('touchend', end, { passive: false });
      elem.addEventListener('touchcancel', end, { passive: false });
    };

    bindTouch(dpadUp, 'forward', 'pulling-up');
    bindTouch(dpadDown, 'backward', 'pulling-down');

    // Allow clicking runway bars or pins directly on the canvas to fly there
    if (canvas) {
      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // 1. Check clicking any of the 4 straight roads across the screen
        const barH = 56;
        for (let i = 0; i < tierRatios.length; i++) {
          const centerY = tierRatios[i] * height;
          const by = centerY - barH / 2;
          if (clickY >= by - 8 && clickY <= by + barH + 8) {
            flyToStation(i);
            return;
          }
        }

        // 2. Direct pin clicks
        stationPins.forEach((pin, idx) => {
          if (!pin) return;
          const dist = Math.hypot(clickX - pin.x, clickY - (pin.y - 36));
          if (dist < 34) {
            flyToStation(idx);
          }
        });
      });

      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let hovering = false;
        const barH = 56;
        for (let i = 0; i < tierRatios.length; i++) {
          const centerY = tierRatios[i] * height;
          const by = centerY - barH / 2;
          if (mouseY >= by && mouseY <= by + barH) {
            hovering = true;
            break;
          }
        }

        if (!hovering) {
          stationPins.forEach((pin) => {
            if (!pin) return;
            const dist = Math.hypot(mouseX - pin.x, mouseY - (pin.y - 36));
            if (dist < 34) hovering = true;
          });
        }

        canvas.style.cursor = hovering ? 'pointer' : 'default';
      });
    }
  }

  // Magnetic Cursor Attraction with Elastic Rubber Snap-Back (Dennis Snellenberg Magnetic)
  function setupMagneticController() {
    const dpad = document.getElementById('arcadeTouchDpad');
    if (!dpad) return;

    const strength = 38;
    const textStrength = 18;

    dpad.addEventListener('mousemove', (e) => {
      const rect = dpad.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      const targetX = relX * strength;
      const targetY = relY * strength;

      if (window.gsap) {
        gsap.to(dpad, {
          x: targetX,
          y: targetY,
          duration: 0.45,
          ease: 'power3.out',
          overwrite: 'auto'
        });
        const innerItems = dpad.querySelectorAll('.dpad-text, .dpad-arrow-icon');
        gsap.to(innerItems, {
          x: relX * textStrength,
          y: relY * textStrength,
          duration: 0.45,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      } else {
        dpad.style.transform = `translate(${targetX}px, ${targetY}px)`;
      }
    });

    dpad.addEventListener('mouseleave', () => {
      if (window.gsap) {
        gsap.to(dpad, {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          duration: 1.2,
          ease: 'elastic.out(1.2, 0.35)',
          overwrite: 'auto'
        });
        const innerItems = dpad.querySelectorAll('.dpad-text, .dpad-arrow-icon');
        gsap.to(innerItems, {
          x: 0,
          y: 0,
          duration: 1.2,
          ease: 'elastic.out(1.2, 0.35)',
          overwrite: 'auto'
        });
      } else {
        dpad.style.transform = 'translate(0px, 0px)';
      }
    });
  }

  function disableAutoDrive() {
    if (isAutoDrive) {
      isAutoDrive = false;
      updateAutoDriveButtonUI();
    }
  }

  function setupButtons() {
    if (autoDriveBtn) {
      autoDriveBtn.addEventListener('click', () => {
        isAutoDrive = !isAutoDrive;
        updateAutoDriveButtonUI();
        if (isAutoDrive) {
          stationDwellTimer = 0;
        }
      });
    }

    // Direct Station Jump Buttons
    document.querySelectorAll('.btn-station-jump').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = parseInt(btn.getAttribute('data-station'), 10);
        flyToStation(targetId - 1);
      });
    });

    if (btnPrevStation) {
      btnPrevStation.addEventListener('click', () => {
        let prev = (currentTargetIndex - 1 + projects.length) % projects.length;
        flyToStation(prev);
      });
    }

    if (btnNextStation) {
      btnNextStation.addEventListener('click', () => {
        let next = (currentTargetIndex + 1) % projects.length;
        flyToStation(next);
      });
    }

    if (hudDetailBtn) {
      hudDetailBtn.addEventListener('click', () => {
        if (activeStation !== null) {
          openProjectModal(projects[activeStation]);
        }
      });
    }
  }

  function updateAutoDriveButtonUI() {
    if (!autoDriveBtn) return;
    if (isAutoDrive) {
      autoDriveBtn.classList.add('active');
      autoDriveBtn.innerHTML = '<span class="status-pulse-dot"></span><span>Auto-Flight: ON</span>';
    } else {
      autoDriveBtn.classList.remove('active');
      autoDriveBtn.innerHTML = '<span class="status-off-dot"></span><span>Pilot Manual (Maju / Mundur)</span>';
    }
  }

  function flyToStation(index) {
    if (index < 0 || index >= projects.length) return;
    currentTargetIndex = index;
    isAutoDrive = true;
    stationDwellTimer = 0;
    updateAutoDriveButtonUI();

    const pin = stationPins[index];
    if (pin) {
      // Smoothly advance distance toward target pin
      plane.distance = pin.trackDist;
      updatePlaneCoordinates();
    }
  }

  // Update Flight Physics Loop
  function update() {
    if (totalTrackLength === 0) return;

    if (isAutoDrive) {
      updateAutoFlight();
    } else {
      updateManualFlight();
    }

    // Advance position along track (locked to track, zero chance of melenceng)
    plane.distance = (plane.distance + plane.speed + totalTrackLength) % totalTrackLength;
    updatePlaneCoordinates();

    // Spawn Supersonic Twin Jet Afterburner Contrails (Setengah Merah & Setengah Putih)
    if ((Math.abs(plane.speed) > 0.4 || isAutoDrive) && plane.x >= -20 && plane.x <= width + 20) {
      const pScale = plane.scale || 1.0;
      [-6.5, 6.5].forEach(offsetY => {
        const engX = plane.x + Math.cos(plane.angle) * (-34 * pScale) - Math.sin(plane.angle) * (offsetY * pScale);
        const engY = plane.y + Math.sin(plane.angle) * (-34 * pScale) + Math.cos(plane.angle) * (offsetY * pScale);
        // Sisi kiri (offsetY < 0) = Asap Merah, Sisi kanan (offsetY > 0) = Asap Putih
        const smokeColor = offsetY < 0 ? 'rgba(239, 68, 68, ' : 'rgba(255, 255, 255, ';

        particles.push({
          x: engX + (Math.random() - 0.5) * 3,
          y: engY + (Math.random() - 0.5) * 3,
          vx: -Math.cos(plane.angle) * 1.3 + (Math.random() - 0.5) * 0.4,
          vy: -Math.sin(plane.angle) * 1.3 + (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2.8 + 2.2,
          color: smokeColor,
          alpha: 0.7,
          life: 42
        });
      });
    }

    // Decay contrails
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha = (p.life / 42) * 0.7;
      p.size += 0.15;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Check station arrival
    checkStationArrival();
  }

  function updateManualFlight() {
    if (keys.forward) {
      plane.speed = Math.min(plane.speed + plane.accel, plane.maxForward);
    } else if (keys.backward) {
      plane.speed = Math.max(plane.speed - plane.brake, plane.maxReverse);
    } else {
      plane.speed *= plane.friction;
      if (Math.abs(plane.speed) < 0.05) plane.speed = 0;
    }
  }

  function updateAutoFlight() {
    // If resting at station
    if (stationDwellTimer > 0) {
      stationDwellTimer--;
      plane.speed *= 0.86;
      if (Math.abs(plane.speed) < 0.05) plane.speed = 0;
      return;
    }

    // Find nearest upcoming station
    let nextStation = null;
    let minForwardDist = Infinity;

    stationPins.forEach((pin, idx) => {
      let fDist = pin.trackDist - plane.distance;
      if (fDist < -5) fDist += totalTrackLength;
      if (fDist < minForwardDist) {
        minForwardDist = fDist;
        nextStation = idx;
      }
    });

    let desiredSpeed = 3.4;
    // Approaching pin: gently brake to land
    if (minForwardDist < 65) {
      desiredSpeed = Math.max(1.2, (minForwardDist / 65) * 3.4);
      if (minForwardDist < 12) {
        stationDwellTimer = 170; // Stop for ~2.8s
        currentTargetIndex = nextStation;
        plane.speed = 0;
        return;
      }
    }

    if (plane.speed < desiredSpeed) plane.speed += plane.accel * 0.8;
    else plane.speed -= plane.brake * 0.4;
  }

  function checkStationArrival() {
    let nearestStation = null;
    let minDistance = 55;

    stationPins.forEach((pin, index) => {
      let d = Math.abs(pin.trackDist - plane.distance);
      if (d > totalTrackLength / 2) d = totalTrackLength - d;
      if (d < minDistance) {
        nearestStation = index;
      }
    });

    if (nearestStation !== activeStation) {
      activeStation = nearestStation;
      if (activeStation !== null) {
        showStationHUD(projects[activeStation]);
      } else {
        hideStationHUD();
      }
    }
  }

  function showStationHUD(proj) {
    if (!hudCard) return;

    if (hudStation) hudStation.textContent = proj.tag || proj.station;
    if (hudTitle) hudTitle.textContent = proj.title;
    if (hudDesc) hudDesc.textContent = proj.shortDesc;

    if (hudTags) {
      hudTags.innerHTML = '';
      hudTags.style.display = 'none';
    }

    // Dynamic vertical positioning directly aligned with active pin & runway
    if (activeStation !== null && activeStation !== undefined) {
      const pinY = tierRatios[activeStation] * height;
      const cardH = hudCard.offsetHeight || 180;
      // Clamp so card never clips top or bottom edge of arena
      const clampedY = Math.max(cardH / 2 + 14, Math.min(height - cardH / 2 - 14, pinY));
      hudCard.style.top = clampedY + 'px';
    }

    hudCard.classList.add('visible');

    // Highlight button in top controls
    document.querySelectorAll('.btn-station-jump').forEach(btn => {
      if (parseInt(btn.getAttribute('data-station'), 10) === proj.id) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function hideStationHUD() {
    if (!hudCard) return;
    hudCard.classList.remove('visible');

    document.querySelectorAll('.btn-station-jump').forEach(btn => {
      btn.classList.remove('active');
    });
  }

  // Canvas Drawing (100% Transparent Background)
  function draw() {
    ctx.clearRect(0, 0, width, height);

    // 0. Subtle Navigational Cartography Grid
    drawNavGrid();

    // 1. 4 Straight Parallel Road Bars (Persis Lurus, Bersih, Tanpa Border, Tanpa Lampu, Tanpa Warna Ijo)
    drawStraightRunways();

    // 2. Numbered Milestone Map Pins with Sonar Radar Waves
    drawPins();

    // 3. Jet Contrails / Vapor Trails
    drawContrails();

    // 4. High-Tech Airplane (Pesawat Terbang)
    drawAirplane();
  }

  // Faint Navigational Coordinate Grid
  function drawNavGrid() {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    const spacing = 70;
    for (let x = spacing; x < width; x += spacing) {
      for (let y = spacing; y < height; y += spacing) {
        ctx.fillRect(x - 1, y - 1, 2, 2);
      }
    }
    ctx.restore();
  }

  // Draw 4 Completely Straight Horizontal Roads (Garis Kiri & Kanan Solid + Garis Tengah Putus-putus)
  function drawStraightRunways() {
    const barX = 0;
    const barW = width;
    const halfRoadH = 26; // Jarak tepi kiri & kanan dari garis tengah

    // Detect active tier
    let currentTier = activeStation;
    if (currentTier === null || currentTier === undefined) {
      let minDist = Infinity;
      tierRatios.forEach((r, idx) => {
        const d = Math.abs(r * height - plane.y);
        if (d < minDist) {
          minDist = d;
          currentTier = idx;
        }
      });
    }

    tierRatios.forEach((ratio, idx) => {
      const centerY = ratio * height;
      const isActive = idx === currentTier;

      ctx.save();

      // 1. Garis Kiri & Kanan (Tepian Jalan Solid Putih, Terbuka Tanpa Border Kotak)
      ctx.strokeStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = isActive ? 2 : 1.5;

      // Garis tepi atas (sisi kiri jalan)
      ctx.beginPath();
      ctx.moveTo(barX, centerY - halfRoadH);
      ctx.lineTo(barX + barW, centerY - halfRoadH);
      ctx.stroke();

      // Garis tepi bawah (sisi kanan jalan)
      ctx.beginPath();
      ctx.moveTo(barX, centerY + halfRoadH);
      ctx.lineTo(barX + barW, centerY + halfRoadH);
      ctx.stroke();

      // 2. Garis Tengah Marka Putus-putus (Mengalir Dinamis)
      ctx.strokeStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = isActive ? 2.8 : 2.2;
      ctx.setLineDash([20, 16]);
      ctx.lineDashOffset = isActive ? -plane.distance : 0;
      ctx.beginPath();
      ctx.moveTo(barX, centerY);
      ctx.lineTo(barX + barW, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    });
  }

  // Draw Numbered Map Pins (📍 01, 02, 03, 04)
  function drawPins() {
    const time = Date.now() * 0.003;

    stationPins.forEach((pin, idx) => {
      if (!pin) return;
      const proj = projects[idx];
      const isCurrent = activeStation === idx;
      const pinColor = proj.pinColor;

      ctx.save();
      ctx.translate(pin.x, pin.y);

      // Sonar Radar Wave Rings (Lingkaran Radar Memancar Halus)
      const ringCycle = ((time * 1.2 + idx * 0.5) % 2);
      const ringRadius = 14 + ringCycle * 26;
      const ringAlpha = Math.max(0, 1 - ringCycle / 2) * (isCurrent ? 0.65 : 0.35);
      ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Pin drop shadow on asphalt
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gentle floating animation when active
      const bob = isCurrent ? Math.sin(time * 4) * 6 : 0;
      ctx.translate(0, bob);

      // Glowing pulse behind active pin (Clean White Ambient)
      if (isCurrent) {
        const pulseGrad = ctx.createRadialGradient(0, -36, 10, 0, -36, 46);
        pulseGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        pulseGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = pulseGrad;
        ctx.beginPath();
        ctx.arc(0, -36, 46, 0, Math.PI * 2);
        ctx.fill();
      }

      // Teardrop Pin Body
      ctx.fillStyle = proj.pinColor;
      ctx.beginPath();
      ctx.arc(0, -36, 20, Math.PI * 0.78, Math.PI * 2.22, false);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      // Pin subtle lighting stroke
      ctx.strokeStyle = proj.pinColor === '#ffffff' ? 'rgba(0, 0, 0, 0.18)' : 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner Circle
      ctx.fillStyle = proj.innerColor;
      ctx.beginPath();
      ctx.arc(0, -36, 12, 0, Math.PI * 2);
      ctx.fill();

      // Bold Number (01, 02, 03, 04)
      ctx.fillStyle = proj.textColor;
      ctx.font = 'bold 12px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(proj.code, 0, -35.5);

      ctx.restore();
    });
  }

  // Draw Contrails (Jejak Asap / Uap Putih Mesin Jet)
  function drawContrails() {
    ctx.save();
    particles.forEach(p => {
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // Draw F-15 Strike Eagle Fighter Jet (Pesawat ZET F-15 - Setengah Merah Setengah Putih Indonesia)
  function drawAirplane() {
    let planeAlpha = 1;
    const fadeDistance = 120;
    if (plane.x < fadeDistance) {
      planeAlpha = Math.max(0, (plane.x + 45) / (fadeDistance + 45));
    } else if (plane.x > width - fadeDistance) {
      planeAlpha = Math.max(0, (width + 45 - plane.x) / (fadeDistance + 45));
    }

    if (planeAlpha <= 0.01) return;

    ctx.save();
    ctx.globalAlpha = planeAlpha;
    ctx.translate(plane.x, plane.y);
    ctx.rotate(plane.angle);
    ctx.scale(plane.scale || 1.0, plane.scale || 1.0); // Skala Ukuran Pesawat Jet

    // Banking compression during turns
    const bankScale = 1 - Math.abs(plane.bankAngle) * 0.25;

    // 1. F-15 Iconic Planform Drop Shadow (Bayangan Jet Tempur F-15)
    ctx.save();
    ctx.translate(-7, 22);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
    ctx.beginPath();
    ctx.moveTo(42, 0); // Moncong hidung F-15 aerodinamis membulat halus
    ctx.bezierCurveTo(41.5, -2, 38, -3.2, 33, -3.8);
    ctx.lineTo(24, -4.5);
    ctx.lineTo(16, -9.5); // Air intake ramp
    ctx.lineTo(12, -9.5);
    ctx.lineTo(-14, -30 * bankScale); // Ujung sayap depan
    ctx.lineTo(-23, -30 * bankScale); // Clipped wingtip
    ctx.lineTo(-20, -10);
    ctx.lineTo(-22, -7);
    ctx.lineTo(-39, -19 * bankScale); // Stabilator
    ctx.lineTo(-43, -14 * bankScale);
    ctx.lineTo(-34, -4);
    ctx.lineTo(-34, 4);
    ctx.lineTo(-43, 14 * bankScale);
    ctx.lineTo(-39, 19 * bankScale); // Stabilator kanan
    ctx.lineTo(-22, 7);
    ctx.lineTo(-20, 10);
    ctx.lineTo(-23, 30 * bankScale); // Clipped wingtip kanan
    ctx.lineTo(-14, 30 * bankScale);
    ctx.lineTo(12, 9.5);
    ctx.lineTo(16, 9.5); // Air intake ramp kanan
    ctx.lineTo(24, 4.5);
    ctx.bezierCurveTo(38, 3.2, 41.5, 2, 42, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Forward Radar & Supersonic Beam (Sorotan Radar Moncong F-15)
    const beamGrad = ctx.createRadialGradient(40, 0, 2, 175, 0, 115);
    beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
    beamGrad.addColorStop(0.2, 'rgba(239, 68, 68, 0.18)');
    beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.moveTo(40, -4);
    ctx.lineTo(175, -46);
    ctx.lineTo(175, 46);
    ctx.lineTo(40, 4);
    ctx.closePath();
    ctx.fillStyle = beamGrad;
    ctx.fill();

    // 3. Underwing External Fuel Drop Tanks (Tangki Bahan Bakar Eksternal F-15)
    // Tangki Kiri (Merah)
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    roundRectPath(ctx, -14, -18 * bankScale - 2, 18, 4, 2);
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Tangki Kanan (Putih)
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    roundRectPath(ctx, -14, 18 * bankScale - 2, 18, 4, 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 4. Twin Pratt & Whitney Turbofan Exhaust Nozzles & Afterburner
    [-6.5, 6.5].forEach(yPos => {
      // Titanium ceramic nozzle petals
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.rect(-34, yPos - 3.8, 6, 7.6);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Nozzle interior dark core
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-34, yPos, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Afterburner supersonic exhaust flames
      if (Math.abs(plane.speed) > 0.4 || isAutoDrive) {
        const flameLength = 18 + Math.random() * 8;
        const abGrad = ctx.createLinearGradient(-34, 0, -34 - flameLength, 0);
        if (yPos < 0) {
          abGrad.addColorStop(0, '#ffffff');
          abGrad.addColorStop(0.25, '#fbbf24');
          abGrad.addColorStop(0.6, '#ef4444');
          abGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
        } else {
          abGrad.addColorStop(0, '#ffffff');
          abGrad.addColorStop(0.3, '#67e8f9');
          abGrad.addColorStop(0.7, '#0284c7');
          abGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
        }
        ctx.fillStyle = abGrad;
        ctx.beginPath();
        ctx.moveTo(-34, yPos - 3.2);
        ctx.lineTo(-34 - flameLength, yPos);
        ctx.lineTo(-34, yPos + 3.2);
        ctx.closePath();
        ctx.fill();

        // Inner shock diamond core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-34 - flameLength * 0.35, yPos, flameLength * 0.2, 1.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // ==========================================
    // 5. F-15 CLIPPED DELTA WINGS (SAYAP KHAS F-15 EAGLE)
    // ==========================================
    // --- SISI KIRI (MERAH INDONESIA) [Y <= 0] ---
    const leftWingGrad = ctx.createLinearGradient(0, 0, 0, -30 * bankScale);
    leftWingGrad.addColorStop(0, '#dc2626');
    leftWingGrad.addColorStop(0.5, '#ef4444');
    leftWingGrad.addColorStop(1, '#b91c1c');
    ctx.fillStyle = leftWingGrad;
    ctx.beginPath();
    ctx.moveTo(12, -9.5); // Pangkal sayap di belakang intake
    ctx.lineTo(-14, -30 * bankScale); // Sudut depan sayap
    ctx.lineTo(-23, -30 * bankScale); // Ujung sayap terpotong (clipped tip)
    ctx.lineTo(-20, -10); // Pangkal belakang sayap
    ctx.lineTo(-10, -9.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Aileron & Flap Lines Kiri
    ctx.strokeStyle = 'rgba(254, 202, 202, 0.45)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(-16, -26 * bankScale);
    ctx.moveTo(-18, -12);
    ctx.lineTo(-22, -26 * bankScale);
    ctx.stroke();

    // Missile Rail Kiri (AIM-9 / AIM-120 Wingtip Rail)
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-24, -31 * bankScale, 12, 1.8);

    // --- SISI KANAN (PUTIH BERSIH) [Y >= 0] ---
    const rightWingGrad = ctx.createLinearGradient(0, 0, 0, 30 * bankScale);
    rightWingGrad.addColorStop(0, '#ffffff');
    rightWingGrad.addColorStop(0.5, '#f8fafc');
    rightWingGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = rightWingGrad;
    ctx.beginPath();
    ctx.moveTo(12, 9.5); // Pangkal sayap di belakang intake
    ctx.lineTo(-14, 30 * bankScale); // Sudut depan sayap
    ctx.lineTo(-23, 30 * bankScale); // Ujung sayap terpotong (clipped tip)
    ctx.lineTo(-20, 10); // Pangkal belakang sayap
    ctx.lineTo(-10, 9.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Aileron & Flap Lines Kanan
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-10, 10);
    ctx.lineTo(-16, 26 * bankScale);
    ctx.moveTo(-18, 12);
    ctx.lineTo(-22, 26 * bankScale);
    ctx.stroke();

    // Missile Rail Kanan (White/Grey Wingtip Rail)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-24, 29.2 * bankScale, 12, 1.8);

    // Blinking Wingtip Nav Lights
    const time = Date.now() * 0.006;
    const blink = Math.sin(time * 4) > 0 ? 1 : 0.35;
    // Kiri Merah
    ctx.fillStyle = `rgba(239, 68, 68, ${blink})`;
    ctx.beginPath();
    ctx.arc(-23, -30 * bankScale, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Kanan Putih
    ctx.fillStyle = `rgba(255, 255, 255, ${blink})`;
    ctx.beginPath();
    ctx.arc(-23, 30 * bankScale, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // ==========================================
    // 6. ALL-MOVING HORIZONTAL STABILATORS (EKOR F-15)
    // ==========================================
    // Stabilator Kiri (Merah)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-22, -7);
    ctx.lineTo(-39, -19 * bankScale);
    ctx.lineTo(-43, -14 * bankScale);
    ctx.lineTo(-34, -4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Stabilator Kanan (Putih)
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(-22, 7);
    ctx.lineTo(-39, 19 * bankScale);
    ctx.lineTo(-43, 14 * bankScale);
    ctx.lineTo(-34, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // ==========================================
    // 7. F-15 DISTINCTIVE WEDGE AIR INTAKES (LUBANG UDARA KOTAK F-15)
    // ==========================================
    // Intake Kiri (Merah)
    const intakeRed = ctx.createLinearGradient(16, 0, 16, -9.5);
    intakeRed.addColorStop(0, '#dc2626');
    intakeRed.addColorStop(1, '#991b1b');
    ctx.fillStyle = intakeRed;
    ctx.beginPath();
    ctx.moveTo(24, -4.5);
    ctx.lineTo(16, -9.5); // Intake lip miring khas F-15
    ctx.lineTo(0, -9.5);
    ctx.lineTo(0, -4.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Lubang Dalam Intake Kiri
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(21, -5.2);
    ctx.lineTo(17, -8.8);
    ctx.lineTo(15, -8.8);
    ctx.lineTo(19, -5.2);
    ctx.closePath();
    ctx.fill();

    // Intake Kanan (Putih)
    const intakeWhite = ctx.createLinearGradient(16, 0, 16, 9.5);
    intakeWhite.addColorStop(0, '#ffffff');
    intakeWhite.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = intakeWhite;
    ctx.beginPath();
    ctx.moveTo(24, 4.5);
    ctx.lineTo(16, 9.5); // Intake lip miring khas F-15
    ctx.lineTo(0, 9.5);
    ctx.lineTo(0, 4.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Lubang Dalam Intake Kanan
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(21, 5.2);
    ctx.lineTo(17, 8.8);
    ctx.lineTo(15, 8.8);
    ctx.lineTo(19, 5.2);
    ctx.closePath();
    ctx.fill();

    // ==========================================
    // 8. MAIN FUSELAGE & DUAL ENGINE NACELLES (SETENGAH MERAH SETENGAH PUTIH)
    // ==========================================
    // --- SISI KIRI (MERAH INDONESIA) [Y <= 0] ---
    const fuseRedGrad = ctx.createLinearGradient(0, 0, 0, -9.5);
    fuseRedGrad.addColorStop(0, '#f43f5e');
    fuseRedGrad.addColorStop(0.4, '#dc2626');
    fuseRedGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = fuseRedGrad;
    ctx.beginPath();
    ctx.moveTo(42, 0); // Moncong hidung F-15 aerodinamis membulat halus (tidak lancip jarum)
    ctx.bezierCurveTo(41.5, -2, 38, -3.2, 33, -3.8);
    ctx.lineTo(24, -4.5); // Depan intake
    ctx.lineTo(0, -4.5);
    ctx.lineTo(-4, -8.5); // Tonjolan mesin kiri
    ctx.lineTo(-28, -8.5);
    ctx.lineTo(-30, -3.5);
    ctx.lineTo(-30, 0); // Centerline belakang
    ctx.closePath();
    ctx.fill();

    // --- SISI KANAN (PUTIH INDONESIA) [Y >= 0] ---
    const fuseWhiteGrad = ctx.createLinearGradient(0, 0, 0, 9.5);
    fuseWhiteGrad.addColorStop(0, '#ffffff');
    fuseWhiteGrad.addColorStop(0.4, '#f8fafc');
    fuseWhiteGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = fuseWhiteGrad;
    ctx.beginPath();
    ctx.moveTo(42, 0); // Moncong hidung F-15 aerodinamis membulat halus
    ctx.bezierCurveTo(41.5, 2, 38, 3.2, 33, 3.8);
    ctx.lineTo(24, 4.5); // Depan intake
    ctx.lineTo(0, 4.5);
    ctx.lineTo(-4, 8.5); // Tonjolan mesin kanan
    ctx.lineTo(-28, 8.5);
    ctx.lineTo(-30, 3.5);
    ctx.lineTo(-30, 0); // Centerline belakang
    ctx.closePath();
    ctx.fill();

    // Garis Pemisah Tengah Sempurna (Centerline Split 50:50)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(42, 0);
    ctx.lineTo(-30, 0);
    ctx.stroke();

    // Subtle Radome Cap Curve (Lengkung Sambungan Kubah Moncong F-15)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(33, 0, 3.8, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Speedbrake Outline di Punggung Tengah F-15
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(2, -3);
    ctx.lineTo(-14, -3);
    ctx.lineTo(-14, 3);
    ctx.lineTo(2, 3);
    ctx.stroke();

    // ==========================================
    // 9. F-15 TALL TWIN VERTICAL STABILIZERS (SIRIP EKOR GANDA TEGAK KHAS F-15)
    // ==========================================
    // Sirip Kiri (Merah)
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(-16, -9.5);
    ctx.lineTo(-33, -14 * bankScale); // Ujung atas sirip F-15
    ctx.lineTo(-37, -14 * bankScale); // Mass balance pod tip
    ctx.lineTo(-32, -9); // Rudder trailing edge
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Sirip Kanan (Putih)
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(-16, 9.5);
    ctx.lineTo(-33, 14 * bankScale); // Ujung atas sirip F-15
    ctx.lineTo(-37, 14 * bankScale); // Mass balance pod tip
    ctx.lineTo(-32, 9); // Rudder trailing edge
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // ==========================================
    // 10. TANDEM BUBBLE COCKPIT CANOPY (KOKPIT DUA KURSI F-15E STRIKE EAGLE)
    // ==========================================
    ctx.save();
    // Glass Sisi Kiri (Tinted Merah/Emas)
    const glassLeft = ctx.createLinearGradient(34, 0, 8, -3.2);
    glassLeft.addColorStop(0, '#fb7185');
    glassLeft.addColorStop(0.5, '#0284c7');
    glassLeft.addColorStop(1, '#0f172a');
    ctx.fillStyle = glassLeft;
    ctx.beginPath();
    ctx.moveTo(34, 0);
    ctx.quadraticCurveTo(22, -3.8, 8, -2.4);
    ctx.lineTo(8, 0);
    ctx.closePath();
    ctx.fill();

    // Glass Sisi Kanan (Tinted Cyan/Biru Langit)
    const glassRight = ctx.createLinearGradient(34, 0, 8, 3.2);
    glassRight.addColorStop(0, '#38bdf8');
    glassRight.addColorStop(0.5, '#0ea5e9');
    glassRight.addColorStop(1, '#0f172a');
    ctx.fillStyle = glassRight;
    ctx.beginPath();
    ctx.moveTo(34, 0);
    ctx.quadraticCurveTo(22, 3.8, 8, 2.4);
    ctx.lineTo(8, 0);
    ctx.closePath();
    ctx.fill();

    // Tandem Two-Seat Pilot Silhouettes
    ctx.fillStyle = '#1e293b';
    // Front Pilot
    ctx.beginPath();
    ctx.arc(24, 0, 1.4, 0, Math.PI * 2);
    ctx.fill();
    // Rear WSO (Weapon Systems Officer)
    ctx.beginPath();
    ctx.arc(14, 0, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Frame Kanopi Kaca (3 Frame Arches)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(28, -2.6);
    ctx.lineTo(28, 2.6);
    ctx.moveTo(19, -3.4);
    ctx.lineTo(19, 3.4);
    ctx.stroke();

    // Refleksi Kilau Kaca Kokpit
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(23, -1, 8, 1, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Front HUD Green Projector Glow
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(29, 0, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function roundRectPath(c, x, y, w, h, r) {
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
  }

  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  // Project Detail Modal Logic
  function setupModal() {
    if (!modal) return;

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  function openProjectModal(proj) {
    if (!modal || !proj) return;

    if (modalTitle) modalTitle.textContent = proj.title;
    if (modalTag) modalTag.textContent = proj.tag;
    if (modalDesc) modalDesc.textContent = proj.fullDesc;

    if (modalTechList) {
      modalTechList.innerHTML = proj.tech.map(t => `<span class="modal-tech-badge">${t}</span>`).join('');
    }

    if (modalGalleryMain && proj.images.length > 0) {
      modalGalleryMain.src = proj.images[0];
      modalGalleryMain.alt = proj.title;
    }

    if (modalGalleryThumbs) {
      modalGalleryThumbs.innerHTML = proj.images.map((src, idx) => `
        <button type="button" class="thumb-btn ${idx === 0 ? 'active' : ''}" data-src="${src}" aria-label="Thumbnail ${idx + 1}">
          <img src="${src}" alt="Thumb ${idx + 1}" loading="lazy">
        </button>
      `).join('');

      modalGalleryThumbs.querySelectorAll('.thumb-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetSrc = btn.getAttribute('data-src');
          if (modalGalleryMain) modalGalleryMain.src = targetSrc;
          modalGalleryThumbs.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Expose API
  window.ProjectDriveArena = {
    projects: projects,
    openModal: openProjectModal,
    flyTo: flyToStation
  };

  // Launch when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
