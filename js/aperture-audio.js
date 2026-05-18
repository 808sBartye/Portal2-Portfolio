/**
 * aperture-audio.js
 * Global Audio System — Aperture Science Portfolio
 * 
 * Handles:
 * 1. Background Music (BGM) based on current page
 * 2. Hover SFX for interactive elements
 * 3. Click SFX for interactive elements + Robot interactions
 * 4. Link navigation with transition delay
 */

(function () {
    'use strict';

    const SOUND_BASE = 'assets/sounds/';
    const TRACK_BASE = 'assets/tracks/';

    window.apertureAudio = window.apertureAudio || { bgm: null };

    function getEffectiveVolume() {
        if (localStorage.getItem('aperture_muted') === 'true') return 0;
        let saved = localStorage.getItem('aperture_volume');
        let vol = saved !== null ? parseFloat(saved) : 0.3;
        return isNaN(vol) ? 0.3 : vol;
    }

    // Helper for playing sounds
    function playSFX(src) {
        const effVol = getEffectiveVolume();
        if (effVol <= 0) return;

        try {
            const audio = new Audio(SOUND_BASE + src);
            audio.volume = Math.max(0, Math.min(1, effVol));
            audio.play().catch(() => { });
        } catch (e) { }
    }

    // 1. Muzyka w tle (Soundtrack / BGM) - Dopasowanie 1:1 z nazwami plików
    function initBGM() {
        const currentPath = window.location.pathname;
        let pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1).toLowerCase();

        // Domyślna strona jeśli URL to katalog
        if (pageName === '' || pageName === '/') {
            pageName = 'index';
        } else {
            pageName = pageName.replace('.html', '');
        }

        const bgmFile = pageName + '-soundtrack.mp3';

        const bgm = new Audio(TRACK_BASE + bgmFile);
        bgm.loop = true;

        window.apertureAudio.bgm = bgm;
        bgm.volume = Math.max(0, Math.min(1, getEffectiveVolume() * 0.7));

        bgm.play().catch(error => {
            console.warn(`Autoplay zablokowany lub brak pliku ${bgmFile}, spróbuję przy interakcji.`, error);
            const startBgm = () => {
                bgm.play().catch(e => console.warn(`Nie udało się odtworzyć BGM: ${bgmFile}`));
                document.removeEventListener('mousedown', startBgm);
            };
            document.addEventListener('mousedown', startBgm);
        });
    }

    // Selectors for interactive elements
    const interactiveSelectors = 'a, button, .education-card, .expand-description, .rozszerz-opis, [role="button"], .grid-item, .info-bar, .grid-tile, .core-link';

    // 2. Globalna Delegacja Kliknięć (Mousedown)
    function setupClickDelegation() {
        document.addEventListener('mousedown', function (e) {
            // Check for standard interactive elements
            const target = e.target.closest(interactiveSelectors);

            if (target) {
                // Ignore specific control panel buttons handled separately
                if (target.closest('#control-gear-btn') || target.closest('#mute-btn') || target.closest('#audio-volume-slider') || target.closest('#lang-selectors')) {
                    return;
                }

                // Play click sound
                playSFX('portal_button_down_01.wav');

                // Handle Links
                if (target.tagName.toLowerCase() === 'a') {
                    const href = target.getAttribute('href');

                    if (!href) return;

                    // External links / New tab
                    if (target.getAttribute('target') === '_blank' || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:')) {
                        return; // Let the browser open it normally
                    }

                    // Internal links
                    if (href.endsWith('.html')) {
                        e.preventDefault();

                        // Use existing transition logic if available
                        if (typeof window.transitionTo === 'function') {
                            window.transitionTo(href);
                        } else {
                            // Fallback if aperture-transitions.js is missing
                            const overlay = document.querySelector('.chamber-overlay') || document.querySelector('.page-transition-overlay');
                            if (overlay) {
                                overlay.style.opacity = '1';
                                overlay.style.pointerEvents = 'all';
                            }

                            setTimeout(() => {
                                window.location.href = href;
                            }, 800);
                        }
                    }
                }
            }
        });
    }

    // Export robot audio function so projects.js can trigger it directly
    window.playRobotAudio = function (robotName) {
        if (robotName === 'atlas') {
            setTimeout(() => {
                playSFX('atlas-animation.wav');
            }, 500);
        } else if (robotName === 'pbody') {
            setTimeout(() => {
                playSFX('pbody-animation.wav');
            }, 400);
        }
    };

    // 3. Obsługa Modala CV
    function initCVModal() {
        const overlay = document.getElementById('cv-modal-overlay');
        const closeBtn = document.getElementById('close-cv-modal');
        const triggers = document.querySelectorAll('.cv-trigger');

        if (!overlay) return;

        triggers.forEach(trigger => {
            trigger.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                playSFX('portal_button_down_01.wav');
                overlay.classList.add('active');
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                playSFX('portal_button_down_01.wav');
                overlay.classList.remove('active');
            });
        }

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                playSFX('portal_button_down_01.wav');
                overlay.classList.remove('active');
            }
        });

        const cvBtns = overlay.querySelectorAll('.cv-btn');
        cvBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                overlay.classList.remove('active');
            });
        });
    }

    // 4. Obsługa Panelu Sterowania (Control Panel w prawym górnym rogu)
    function initControlPanel() {
        const viewport = document.getElementById('aperture-viewport');
        if (!viewport) return;

        if (document.getElementById('aperture-control-panel')) return;

        const panelHTML = `
            <div id="aperture-control-panel" class="control-panel-wrapper">
                <div id="control-gear-btn" role="button" aria-label="Control Panel">
                    <i class="fas fa-cog gear-icon"></i>
                </div>
                <div id="control-panel">
                    <div class="panel-header" data-i18n="panel_title">GŁÓWNY PANEL STEROWANIA</div>
                    <div class="panel-section">
                        <span class="section-title" data-i18n="panel_audio">&gt; AUDIO</span>
                        <div class="volume-slider-container">
                            <input type="range" id="audio-volume-slider" class="aperture-slider" min="0" max="1" step="0.05" value="0.3">
                            <span id="volume-value">30%</span>
                        </div>
                        <button id="mute-btn" class="aperture-btn" data-i18n="panel_mute">WYCISZ DŹWIĘK</button>
                    </div>
                    <div class="panel-section">
                        <span class="section-title" data-i18n="panel_lang">&gt; JĘZYK</span>
                        <div id="lang-selectors" class="btn-group">
                            <button id="lang-pl-btn" class="aperture-btn active">🇵🇱 PL</button>
                            <button id="lang-en-btn" class="aperture-btn">🇬🇧 ENG</button>
                        </div>
                    </div>
                    <div class="panel-section">
                        <span class="section-title" data-i18n="panel_view">&gt; TRYB WIDOKU</span>
                        <div class="btn-group">
                            <button class="aperture-btn active" disabled>3D LAB</button>
                            <button class="aperture-btn" disabled>STATIC</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        viewport.insertAdjacentHTML('beforeend', panelHTML);

        const panelWrapper = document.getElementById('aperture-control-panel');
        const gearBtn = document.getElementById('control-gear-btn');
        const slider = document.getElementById('audio-volume-slider');
        const display = document.getElementById('volume-value');
        const muteBtn = document.getElementById('mute-btn');
        const plBtn = document.getElementById('lang-pl-btn');
        const enBtn = document.getElementById('lang-en-btn');

        let savedVol = localStorage.getItem('aperture_volume');
        let currentVol = savedVol !== null ? parseFloat(savedVol) : 0.3;
        if (isNaN(currentVol)) currentVol = 0.3;
        let isMuted = localStorage.getItem('aperture_muted') === 'true';

        slider.value = currentVol;

        const currentLang = localStorage.getItem('aperture_lang') || 'pl';
        if (plBtn && enBtn) {
            if (currentLang === 'en') {
                plBtn.classList.remove('active');
                enBtn.classList.add('active');
            } else {
                enBtn.classList.remove('active');
                plBtn.classList.add('active');
            }

            plBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                playSFX('portal_button_down_01.wav');
                if (window.apertureI18n) window.apertureI18n.setLang('pl');
                updateVolumeUI();
            });

            enBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                playSFX('portal_button_down_01.wav');
                if (window.apertureI18n) window.apertureI18n.setLang('en');
                updateVolumeUI();
            });
        }

        function updateVolumeUI() {
            const isEng = (localStorage.getItem('aperture_lang') || 'pl') === 'en';
            if (isMuted) {
                muteBtn.textContent = isEng ? 'UNMUTE AUDIO' : 'PRZYWRÓĆ DŹWIĘK';
                muteBtn.classList.add('active');
                slider.disabled = true;
                display.textContent = isEng ? 'MUTED' : 'WYC.';
            } else {
                const v = parseFloat(slider.value);
                muteBtn.textContent = isEng ? 'MUTE AUDIO' : 'WYCISZ DŹWIĘK';
                muteBtn.classList.remove('active');
                slider.disabled = false;
                display.textContent = Math.round(v * 100) + '%';
            }

            if (window.apertureAudio && window.apertureAudio.bgm) {
                window.apertureAudio.bgm.volume = Math.max(0, Math.min(1, getEffectiveVolume() * 0.7));
            }
        }

        updateVolumeUI();
        if (window.apertureI18n) window.apertureI18n.apply();

        gearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playSFX('portal_button_down_01.wav');
            panelWrapper.classList.toggle('open');
        });

        document.addEventListener('mousedown', (e) => {
            if (!panelWrapper.contains(e.target)) {
                panelWrapper.classList.remove('open');
            }
        });

        slider.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            localStorage.setItem('aperture_volume', v);
            if (isMuted) {
                isMuted = false;
                localStorage.setItem('aperture_muted', 'false');
            }
            updateVolumeUI();
        });

        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isMuted = !isMuted;
            localStorage.setItem('aperture_muted', isMuted);
            updateVolumeUI();
            if (!isMuted) {
                playSFX('portal_button_down_01.wav');
            }
        });
    }

    // Init
    window.addEventListener('load', function () {
        initBGM();
        setupClickDelegation();
        initCVModal();
        initControlPanel();
    });

})();
