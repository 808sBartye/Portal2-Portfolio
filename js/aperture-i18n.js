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
            wall_soc: "SOCIAL MEDIA",
            edu_return: "COFNIJ -&gt;",
            edu_grid_0: "TECHNIK PR.",
            edu_grid_1: "PROJECT MAN.",
            edu_grid_2: "CYBERSEC",
            edu_grid_3: "3D",
            edu_grid_4: "IT ADMIN.",
            edu_grid_5: "MEDIA &amp; GFX",
            status_edu: "Wykształcenie",
            return_nexus: "<span>&larr;</span> POWRÓT DO NEXUSA",
            next_project: "NASTĘPNY PROJEKT <span>&rarr;</span>",
            cham_a_sub_0: "Aperture Science UI",
            cham_a_sub_1: "Aplikacja mobilna",
            cham_a_tile_0: "Frontend &amp; 3D",
            cham_a_tile_1_t: "KOD ŹRÓDŁOWY",
            cham_a_tile_1: "Zobacz jak to działa",
            cham_a_tile_2: "Backend Architecture",
            cham_a_tile_3_t: "REPOZYTORIUM",
            cham_a_tile_3: "Baza kodu aplikacji",
            cham_a_tile_4_t: "KONTAKT",
            cham_a_tile_4: "Mail &amp; Telefon",
            cham_a_tile_5_t: "DOSTĘPNOŚĆ",
            cham_a_tile_5: "Otwarty na współpracę",
            cham_b_sub_0: "Kampania społeczna",
            cham_b_sub_1: "Media &amp; Transmisje live",
            cham_b_sub_2: "Prototypowanie Hardware / IoT",
            cham_b_tile_0_t: "SKALA DZIAŁANIA",
            cham_b_tile_0: "Ponad 2300 odbiorców",
            cham_b_tile_1_t: "LEGISLACJA &amp; NASK",
            cham_b_tile_1: "Sejm RP &amp; Eksperci",
            cham_b_tile_2_t: "PRODUKCJA EVENTÓW",
            cham_b_tile_2: "Transmisje wielokamerowe",
            cham_b_tile_3_t: "SKILLE MIĘKKIE",
            cham_b_tile_3: "Wystąpienia &amp; Certyfikaty",
            cham_b_tile_4_t: "PUBLIC PITCHING",
            cham_b_tile_4: "Prezentacje sceniczne",
            cham_b_tile_5_t: "NAGRODA PUBLICZNOŚCI",
            cham_b_tile_5: "Główne wyróżnienie",
            soc_cv_title: "[ WYBIERZ WERSJĘ CV ]",
            soc_cv_cancel: "[ X ] ANULUJ",
            soc_cv_pl: "🇵🇱 Wersja PL",
            soc_cv_en: "🇬🇧 Wersja ENG"
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
            wall_soc: "SOCIAL MEDIA",
            edu_return: "RETURN -&gt;",
            edu_grid_0: "SOFTWARE DEV",
            edu_grid_1: "PROJECT MAN.",
            edu_grid_2: "CYBERSEC",
            edu_grid_3: "3D DESIGN",
            edu_grid_4: "IT ADMIN.",
            edu_grid_5: "MEDIA &amp; UI",
            status_edu: "Education",
            return_nexus: "<span>&larr;</span> RETURN TO NEXUS",
            next_project: "NEXT PROJECT <span>&rarr;</span>",
            cham_a_sub_0: "Aperture Science UI",
            cham_a_sub_1: "Mobile application",
            cham_a_tile_0: "Frontend &amp; 3D",
            cham_a_tile_1_t: "SOURCE CODE",
            cham_a_tile_1: "Explore how it works",
            cham_a_tile_2: "Backend Architecture",
            cham_a_tile_3_t: "REPOSITORY",
            cham_a_tile_3: "Application codebase",
            cham_a_tile_4_t: "CONTACT CHANNELS",
            cham_a_tile_4: "Mail &amp; Phone",
            cham_a_tile_5_t: "OPERATIONAL STATUS",
            cham_a_tile_5: "Open for cooperation",
            cham_b_sub_0: "Educational social campaign",
            cham_b_sub_1: "Media &amp; Live broadcasts",
            cham_b_sub_2: "Hardware / IoT prototyping",
            cham_b_tile_0_t: "SCALE OF ACTION",
            cham_b_tile_0: "Over 2,300 participants",
            cham_b_tile_1_t: "LEGISLATION &amp; NASK",
            cham_b_tile_1: "Sejm of Poland &amp; Experts",
            cham_b_tile_2_t: "EVENT PRODUCTION",
            cham_b_tile_2: "Multi-camera streaming",
            cham_b_tile_3_t: "SOFT &amp; PITCHING SKILLS",
            cham_b_tile_3: "Presentations &amp; Certs",
            cham_b_tile_4_t: "PUBLIC PITCHING",
            cham_b_tile_4: "On-stage presentations",
            cham_b_tile_5_t: "PUBLIC CHOICE AWARD",
            cham_b_tile_5: "Main public distinction",
            soc_cv_title: "[ SELECT CV VERSION ]",
            soc_cv_cancel: "[ X ] CANCEL",
            soc_cv_pl: "🇵🇱 PL Version",
            soc_cv_en: "🇬🇧 ENG Version"
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
