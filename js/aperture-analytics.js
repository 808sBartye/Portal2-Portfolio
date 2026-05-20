/**
 * aperture-analytics.js
 * Google Analytics 4 Custom Events Tracking — Aperture Science Portfolio
 */
(function() {
    'use strict';

    // Helper to log analytics events
    function logEvent(name, params) {
        if (typeof gtag === 'function') {
            gtag('event', name, params);
        }
    }

    // Wrap global functions for tracking
    function wrapGlobalFunctions() {
        // 1. Wrap transitionTo (from aperture-transitions.js)
        if (typeof window.transitionTo === 'function') {
            const originalTransitionTo = window.transitionTo;
            window.transitionTo = function(href) {
                logEvent('page_transition', {
                    'from_page': window.location.pathname.split('/').pop() || 'index.html',
                    'to_page': href,
                    'method': 'portal_transition'
                });
                originalTransitionTo(href);
            };
        }

        // 2. Wrap showSection (from chamber_a.html and chamber_b.html)
        if (typeof window.showSection === 'function') {
            const originalShowSection = window.showSection;
            window.showSection = function(sectionId) {
                logEvent('section_view', {
                    'section_id': sectionId,
                    'chamber': window.location.pathname.split('/').pop() || ''
                });
                originalShowSection(sectionId);
            };
        }

        // 3. Wrap playRobotAudio (from projects.js / aperture-audio.js)
        if (typeof window.playRobotAudio === 'function') {
            const originalPlayRobotAudio = window.playRobotAudio;
            window.playRobotAudio = function(robotName) {
                logEvent('robot_interaction', {
                    'robot_name': robotName,
                    'action': 'click'
                });
                originalPlayRobotAudio(robotName);
            };
        }
    }

    // Click delegation for links and UI elements
    function setupClickTracking() {
        document.addEventListener('click', function(e) {
            let target = e.target;
            
            // Check if we clicked a link <a>
            while (target && target.tagName !== 'A') {
                target = target.parentElement;
            }

            if (target) {
                const href = target.getAttribute('href');
                if (href) {
                    // Outbound links
                    if (href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:')) {
                        let platform = 'external';
                        if (href.includes('linkedin.com')) platform = 'linkedin';
                        else if (href.includes('instagram.com')) platform = 'instagram';
                        else if (href.includes('github.com')) platform = 'github';

                        logEvent('outbound_click', {
                            'link_url': href,
                            'link_text': target.innerText.trim() || target.getAttribute('aria-label') || 'icon',
                            'platform': platform
                        });
                        return;
                    }

                    // CV downloads
                    if (href.includes('.pdf') || target.classList.contains('cv-btn')) {
                        const lang = href.toLowerCase().includes('eng') || href.toLowerCase().includes('_en') ? 'en' : 'pl';
                        logEvent('cv_download', {
                            'language': lang,
                            'file_name': href.split('/').pop()
                        });
                        return;
                    }

                    // Internal links (that don't use transitionTo, e.g. standard links)
                    if (href.endsWith('.html') && typeof window.transitionTo !== 'function') {
                        logEvent('page_transition', {
                            'from_page': window.location.pathname.split('/').pop() || 'index.html',
                            'to_page': href,
                            'method': 'standard_link'
                        });
                    }
                }
            }

            // UI Control Panel Interactions
            target = e.target;
            
            // Cog button
            if (target.closest('#control-gear-btn')) {
                logEvent('ui_interaction', {
                    'interaction_type': 'control_panel_toggle'
                });
                return;
            }

            // Mute button
            if (target.closest('#mute-btn')) {
                const isMutedNow = localStorage.getItem('aperture_muted') === 'true';
                logEvent('ui_interaction', {
                    'interaction_type': 'mute_toggle',
                    'value': isMutedNow ? 'unmuted' : 'muted'
                });
                return;
            }

            // Language change
            if (target.closest('#lang-pl-btn')) {
                logEvent('ui_interaction', {
                    'interaction_type': 'language_change',
                    'value': 'pl'
                });
                return;
            }
            if (target.closest('#lang-en-btn')) {
                logEvent('ui_interaction', {
                    'interaction_type': 'language_change',
                    'value': 'en'
                });
                return;
            }

            // Grid items in education
            const gridItem = target.closest('.grid-item');
            if (gridItem && gridItem.dataset.index !== undefined) {
                const label = gridItem.querySelector('.grid-label') ? gridItem.querySelector('.grid-label').innerText : gridItem.dataset.index;
                logEvent('ui_interaction', {
                    'interaction_type': 'education_grid_click',
                    'value': label
                });
                return;
            }

            // Back button in education / chambers
            if (target.closest('#btn-return') || target.closest('.back-btn')) {
                logEvent('ui_interaction', {
                    'interaction_type': 'close_details'
                });
                return;
            }

            // Return to nexus / projects buttons
            if (target.closest('.return-btn')) {
                logEvent('ui_interaction', {
                    'interaction_type': 'return_to_nexus'
                });
                return;
            }
            if (target.closest('.next-project-btn')) {
                logEvent('ui_interaction', {
                    'interaction_type': 'next_project'
                });
                return;
            }
        }, true); // Capture phase to catch clicks early

        // Volume slider change tracking
        document.addEventListener('change', function(e) {
            if (e.target && e.target.id === 'audio-volume-slider') {
                logEvent('ui_interaction', {
                    'interaction_type': 'volume_change',
                    'value': e.target.value
                });
            }
        });
    }

    // Initialize tracking
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            wrapGlobalFunctions();
            setupClickTracking();
        });
    } else {
        wrapGlobalFunctions();
        setupClickTracking();
    }
})();
