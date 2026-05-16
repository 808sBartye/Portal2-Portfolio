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

    // Helper for playing sounds
    function playSFX(src, volume = 0.3) {
        try {
            const audio = new Audio(SOUND_BASE + src);
            audio.volume = volume;
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

        // Ścieżki mają teraz dokładne nazwy jak strony (np. index-soundtrack.mp3, chamber_a-soundtrack.mp3)
        const bgmFile = pageName + '-soundtrack.mp3';
        
        // Niestety JS nie ma prostej metody sprawdzenia, czy plik istnieje bez robienia requestu.
        // Spróbujemy po prostu odtworzyć; jeśli pliku nie ma, wyrzuci błąd w catch.
        const bgm = new Audio(TRACK_BASE + bgmFile);
        bgm.loop = true;
        bgm.volume = 0.2;

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
                // Play click sound
                playSFX('portal_button_down_01.wav', 0.3);

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
    // This solves the hitbox mismatch and infinite trigger issues.
    window.playRobotAudio = function(robotName) {
        if (robotName === 'atlas') {
            setTimeout(() => {
                playSFX('atlas-animation.wav', 0.5);
            }, 500); // User-defined delay
        } else if (robotName === 'pbody') {
            setTimeout(() => {
                playSFX('pbody-animation.wav', 0.5);
            }, 400); // User-defined delay
        }
    };

    // Init
    window.addEventListener('load', function () {
        initBGM();
        setupClickDelegation();
    });

})();
