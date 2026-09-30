/**
 * Continuous Infinite Marquee Project Showcase
 * Autoplay continuous smooth ticker with pause on cursor hover & click to open modal
 * Muhammad Arsal Portfolio
 */

(function () {
  'use strict';

  function initWorksMarquee() {
    const wrapper = document.getElementById('worksMarqueeWrapper');
    if (!wrapper) return;

    const cards = Array.from(wrapper.querySelectorAll('.work-card.marquee-card'));
    if (!cards.length) return;

    // Hover pause behavior is natively powered by CSS (:hover animation-play-state: paused),
    // but we add JavaScript events for rock-solid cross-browser & mobile touch support.
    wrapper.addEventListener('mouseenter', () => {
      wrapper.classList.add('is-paused');
    });

    wrapper.addEventListener('mouseleave', () => {
      wrapper.classList.remove('is-paused');
    });

    // Touch device support: tap to pause/resume
    let touchTimeout = null;
    wrapper.addEventListener(
      'touchstart',
      () => {
        wrapper.classList.add('is-paused');
      },
      { passive: true }
    );

    wrapper.addEventListener(
      'touchend',
      () => {
        clearTimeout(touchTimeout);
        touchTimeout = setTimeout(() => {
          wrapper.classList.remove('is-paused');
        }, 1200);
      },
      { passive: true }
    );

    // Click handler on each card -> opens the project modal
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        const idx = parseInt(card.getAttribute('data-index'), 10);
        if (isNaN(idx)) return;

        if (window.ProjectDriveArena && typeof window.ProjectDriveArena.openModal === 'function') {
          const proj = window.ProjectDriveArena.projects[idx];
          if (proj) {
            window.ProjectDriveArena.openModal(proj);
          }
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorksMarquee);
  } else {
    initWorksMarquee();
  }
})();
