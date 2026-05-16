/**
 * aperture-transitions.js
 * Global Chamber Transition System — Aperture Science Portfolio
 *
 * EXIT  (link click) : plays destination-page sound immediately
 *                      (user gesture = guaranteed autoplay),
 *                      then fades overlay to black and navigates.
 * ENTRY (page load)  : fades overlay out — no sound (autoplay blocked).
 */

(function () {
    'use strict';

    /* ── Sound map ───────────────────────────────────────────────
       Key   = DESTINATION page filename (lowercase basename)
       Value = sound to play when navigating TO that page, or null
    ────────────────────────────────────────────────────────────── */
    const SOUND_BASE = 'assets/sounds/';

    const DEST_SOUNDS = {
        'index.html'     : null,
        'nexus.html'     : null,
        'chamber_a.html' : null,
        'chamber_b.html' : null,

        'education.html' : SOUND_BASE + 'spawn-in-chamber.wav',

        'projects.html'  : SOUND_BASE + 'into-chamber.wav',
        'social.html'    : SOUND_BASE + 'into-chamber.wav',
        'socials.html'   : SOUND_BASE + 'into-chamber.wav',
    };

    // How long to wait before actually navigating.
    // Should cover: overlay fade-out (1 s CSS) + a bit of sound.
    const NAV_DELAY = 1150; // ms

    /* ── Helpers ─────────────────────────────────────────────── */
    function getOverlay() {
        return document.querySelector('.chamber-overlay');
    }

    function destPageName(href) {
        // e.g. 'education.html', '../education.html', '/foo/education.html'
        return href.substring(href.lastIndexOf('/') + 1).toLowerCase();
    }

    function playSound(src) {
        if (!src) return;
        try {
            var audio = new Audio(src);
            audio.volume = 0.7;
            audio.play().catch(function () { /* ignore */ });
        } catch (e) { /* ignore */ }
    }

    /* ── Create overlay if not yet in DOM ───────────────────── */
    function ensureOverlay() {
        var viewport = document.getElementById('aperture-viewport');
        if (!viewport) return null;

        var overlay = viewport.querySelector('.chamber-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'chamber-overlay';
            viewport.insertBefore(overlay, viewport.firstChild);
        }
        return overlay;
    }

    /* ── ENTRY: reveal page (no sound) ─────────────────────── */
    function spawnIn() {
        var overlay = ensureOverlay();
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                if (overlay) {
                    overlay.style.opacity       = '0';
                    overlay.style.pointerEvents = 'none';
                }
            });
        });
    }

    /* ── EXIT: sound → black screen → navigate ──────────────── */
    function transitionTo(href) {
        var overlay = getOverlay();

        // Guard against double-trigger
        if (overlay && overlay.dataset.leaving === 'true') return;

        // 1. Play sound for the DESTINATION page (user gesture → no block)
        var dest  = destPageName(href);
        var sound = Object.prototype.hasOwnProperty.call(DEST_SOUNDS, dest)
            ? DEST_SOUNDS[dest]
            : null;
        playSound(sound);

        // 2. Fade overlay to black
        if (overlay) {
            overlay.dataset.leaving     = 'true';
            overlay.style.pointerEvents = 'all';
            overlay.style.opacity       = '1';
        }

        // 3. Navigate after animation completes
        setTimeout(function () {
            window.location.href = href;
        }, NAV_DELAY);
    }

    /* ── Intercept internal <a> clicks ─────────────────────── */
    function interceptLinks() {
        document.addEventListener('click', function (e) {
            var target = e.target;
            while (target && target.tagName !== 'A') {
                target = target.parentElement;
            }
            if (!target) return;

            var href = target.getAttribute('href');
            if (!href) return;

            // Skip external, anchors, _blank, non-html, data-no-transition
            if (
                href.startsWith('http')    ||
                href.startsWith('//')      ||
                href.startsWith('#')       ||
                href.startsWith('mailto:') ||
                target.target === '_blank' ||
                target.hasAttribute('data-no-transition')
            ) return;

            if (!href.endsWith('.html')) return;

            e.preventDefault();
            e.stopPropagation();
            transitionTo(href);
        }, true); // capture phase
    }

    /* ── Boot ───────────────────────────────────────────────── */
    window.addEventListener('load', function () {
        ensureOverlay();
        interceptLinks();
        spawnIn();
    });

    /* ── Global export for button onclick handlers ───────────── */
    window.transitionTo = transitionTo;

})();
