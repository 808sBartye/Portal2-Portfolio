/**
 * APERTURE SCIENCE INTERACTIVE PORTFOLIO - i18n Localization System
 */

window.apertureI18n = {
    lang: localStorage.getItem('aperture_lang') || 'pl',
    dict: {
        pl: {
            panel_title: "GŁÓWNY PANEL STEROWANIA",
            panel_audio: "&gt; AUDIO",
            panel_mute: "WYCISZ DŹWIĘK",
            panel_unmute: "PRZYWRÓĆ DŹWIĘK",
            panel_lang: "&gt; JĘZYK",
            panel_view: "&gt; TRYB WIDOKU",
            menu_edu: "Wykształcenie",
            menu_proj: "Projekty",
            menu_soc: "Social Media",
            loading_test: "Ładowanie środowiska testowego...",
            wall_menu: "MENU",
            wall_edu: "WYKSZTAŁCENIE",
            wall_proj: "PROJEKTY",
            wall_soc: "SOCIAL MEDIA"
        },
        en: {
            panel_title: "MAIN CONTROL PANEL",
            panel_audio: "&gt; AUDIO",
            panel_mute: "MUTE AUDIO",
            panel_unmute: "UNMUTE AUDIO",
            panel_lang: "&gt; LANGUAGE",
            panel_view: "&gt; VIEW MODE",
            menu_edu: "Education",
            menu_proj: "Projects",
            menu_soc: "Social Media",
            loading_test: "Loading testing environment...",
            wall_menu: "MENU",
            wall_edu: "EDUCATION",
            wall_proj: "PROJECTS",
            wall_soc: "SOCIAL MEDIA"
        }
    },

    init: function() {
        this.apply();
    },

    setLang: function(newLang) {
        this.lang = newLang;
        localStorage.setItem('aperture_lang', newLang);
        this.apply();

        // Update language switcher buttons in control panel
        const plBtn = document.getElementById('lang-pl-btn');
        const enBtn = document.getElementById('lang-en-btn');
        if (plBtn && enBtn) {
            if (newLang === 'en') {
                plBtn.classList.remove('active');
                enBtn.classList.add('active');
            } else {
                enBtn.classList.remove('active');
                plBtn.classList.add('active');
            }
        }

        window.dispatchEvent(new CustomEvent('apertureLangChanged', { detail: newLang }));
    },

    apply: function() {
        const currentDict = this.dict[this.lang] || this.dict.pl;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (currentDict[key] !== undefined) {
                el.innerHTML = currentDict[key];
            }
        });
    }
};

window.addEventListener('load', () => {
    window.apertureI18n.init();
});
