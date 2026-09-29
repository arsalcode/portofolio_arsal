/**
 * Works 3D Curved Horizontal Carousel / Slider
 * Inspired by Awwwards Raphael Segerman Portfolio "Front Mode" 3D Cylindrical Showcase
 * Muhammad Arsal Portfolio
 */

(function () {
  'use strict';

  function initWorks3DCarousel() {
    const stage = document.getElementById('works3DStage');
    const track = document.getElementById('works3DTrack');
    if (!stage || !track) return;

    const cards = Array.from(track.querySelectorAll('.work-card'));
    if (!cards.length) return;

    const totalCards = cards.length;
    let currentIndex = 0;
    let targetIndex = 0;
    let currentX = 0;
    let targetX = 0;
    let isDragging = false;
    let startX = 0;
    let dragStartX = 0;
    let lastDragX = 0;
    let velocity = 0;
    let animFrameId = null;

    // UI Controls
    const currentNumEl = document.getElementById('carouselCurrentNum');
    const totalNumEl = document.querySelector('.carousel-total');
    const prevBtn = document.getElementById('carouselPrevBtn');
    const nextBtn = document.getElementById('carouselNextBtn');
    const dots = Array.from(document.querySelectorAll('.carousel-indicators .indicator-dot'));

    if (totalNumEl) {
      totalNumEl.textContent = String(totalCards).padStart(2, '0');
    }

    // Determine card spacing based on viewport width
    function getCardSpacing() {
      const w = window.innerWidth;
      if (w > 1200) return 560;
      if (w > 800) return 460;
      if (w > 540) return 380;
      return Math.min(w * 0.85, 340);
    }

    // Update 3D card transforms along cylindrical arc
    function updateTransforms() {
      const spacing = getCardSpacing();
      const progress = currentX / spacing; // floating progress

      cards.forEach((card, i) => {
        const delta = i - progress;
        const absDelta = Math.abs(delta);

        // Cylindrical angle: curves towards viewer in center, away on edges
        const angle = -Math.max(-45, Math.min(45, delta * 24));
        const translateX = delta * spacing;
        const translateZ = -Math.min(320, absDelta * 110);
        const scale = Math.max(0.74, 1 - absDelta * 0.12);
        const opacity = Math.max(0, 1 - absDelta * 0.36);
        const brightness = Math.max(0.45, 1 - absDelta * 0.35);
        const zIndex = Math.round(100 - absDelta * 10);

        card.style.transform = `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${angle}deg) scale(${scale})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = `brightness(${brightness.toFixed(2)})`;
        card.style.zIndex = zIndex;

        if (absDelta < 0.35) {
          card.classList.add('is-active-card');
          card.setAttribute('aria-hidden', 'false');
        } else {
          card.classList.remove('is-active-card');
          card.setAttribute('aria-hidden', 'true');
        }
      });

      // Update Controls Counter and Dots
      const roundedIndex = Math.max(0, Math.min(totalCards - 1, Math.round(progress)));
      if (currentNumEl) {
        currentNumEl.textContent = String(roundedIndex + 1).padStart(2, '0');
      }

      dots.forEach((dot, idx) => {
        if (idx === roundedIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // Animation loop with spring easing
    function tick() {
      if (!isDragging) {
        // Smoothly interpolate currentX toward targetX
        const dx = targetX - currentX;
        currentX += dx * 0.12;

        if (Math.abs(dx) < 0.1) {
          currentX = targetX;
        }
      }

      updateTransforms();

      // Continue animation loop
      animFrameId = requestAnimationFrame(tick);
    }

    function goToIndex(idx) {
      targetIndex = Math.max(0, Math.min(totalCards - 1, idx));
      const spacing = getCardSpacing();
      targetX = targetIndex * spacing;
    }

    // Prev / Next button clicks
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToIndex(targetIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToIndex(targetIndex + 1);
      });
    }

    // Indicator dots click
    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(idx)) goToIndex(idx);
      });
    });

    // Clicking side card glides it into focus
    cards.forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        // If clicking detail button or thumbnail, don't hijack
        if (e.target.closest('.thumb-item') || e.target.closest('.work-detail-btn')) return;

        if (Math.abs(idx - targetIndex) >= 0.5) {
          e.preventDefault();
          goToIndex(idx);
        }
      });
    });

    // Drag / Touch Handlers
    function onPointerDown(e) {
      // Don't drag if clicking interactive thumbnails or buttons
      if (e.target.closest('.thumb-item') || e.target.closest('.work-detail-btn') || e.target.closest('button')) return;

      isDragging = true;
      stage.classList.add('is-dragging');
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      startX = clientX;
      dragStartX = currentX;
      lastDragX = clientX;
      velocity = 0;
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const diffX = clientX - startX;
      velocity = clientX - lastDragX;
      lastDragX = clientX;

      const spacing = getCardSpacing();
      const maxDrag = (totalCards - 1) * spacing;

      // Realtime drag with resistance at boundary
      let newX = dragStartX - diffX;
      if (newX < 0) {
        newX = newX * 0.35; // bounce resistance left
      } else if (newX > maxDrag) {
        newX = maxDrag + (newX - maxDrag) * 0.35; // bounce resistance right
      }

      currentX = newX;
      targetX = newX;
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      stage.classList.remove('is-dragging');

      const spacing = getCardSpacing();
      // Snap to index considering throw velocity
      let estimatedIndex = (currentX - velocity * 8) / spacing;
      let snapIndex = Math.round(estimatedIndex);
      snapIndex = Math.max(0, Math.min(totalCards - 1, snapIndex));
      goToIndex(snapIndex);
    }

    // Attach drag listeners
    stage.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    stage.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Keyboard navigation when hovered
    window.addEventListener('keydown', (e) => {
      const rect = stage.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (!isVisible) return;

      if (e.key === 'ArrowLeft') {
        goToIndex(targetIndex - 1);
      } else if (e.key === 'ArrowRight') {
        goToIndex(targetIndex + 1);
      }
    });

    // Window resize handler
    window.addEventListener('resize', () => {
      const spacing = getCardSpacing();
      targetX = targetIndex * spacing;
      currentX = targetX;
      updateTransforms();
    });

    // Interactive Thumbnail Switching Inside Cards
    cards.forEach((card) => {
      const mainImg = card.querySelector('.work-main-image');
      const thumbs = card.querySelectorAll('.thumb-item');

      thumbs.forEach((thumb) => {
        function activateThumb() {
          const src = thumb.getAttribute('src');
          if (mainImg && src && mainImg.getAttribute('src') !== src) {
            mainImg.style.opacity = '0.5';
            mainImg.src = src;
            setTimeout(() => {
              mainImg.style.opacity = '1';
            }, 120);
          }
          thumbs.forEach((t) => t.classList.remove('active'));
          thumb.classList.add('active');
        }

        thumb.addEventListener('click', (e) => {
          e.stopPropagation();
          activateThumb();
        });

        thumb.addEventListener('mouseenter', () => {
          activateThumb();
        });
      });

      // "Buka Detail Proyek" Button opens modal
      const detailBtn = card.querySelector('.work-detail-btn');
      if (detailBtn) {
        detailBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cardIdx = parseInt(card.getAttribute('data-index'), 10);
          if (window.ProjectDriveArena && window.ProjectDriveArena.openModal) {
            const projs = window.ProjectDriveArena.projects;
            if (projs && projs[cardIdx]) {
              window.ProjectDriveArena.openModal(projs[cardIdx]);
            }
          }
        });
      }
    });

    // Start tick loop
    tick();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorks3DCarousel);
  } else {
    initWorks3DCarousel();
  }
})();
