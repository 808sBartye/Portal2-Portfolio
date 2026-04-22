# APERTURE SCIENCE INTERACTIVE PORTFOLIO - MASTER SPECIFICATION

## 1. WIZJA PROJEKTU I STOS TECHNOLOGICZNY
Projekt to interaktywne portfolio w formie Single Page Application (SPA), osadzone w uniwersum Portal 2. Nie używamy frameworków typu React/Vue.
* **Rdzeń:** HTML5, CSS3 (zmienne, Grid/Flexbox), Vanilla JavaScript (ES6 Modules).
* **Animacje UI i DOM:** GSAP (GreenSock) – absolutnie kluczowe dla płynnych przejść, hoverów i typografii.
* **Renderowanie 3D i Shadery (Krytyczne dla sekcji Projektów i Social Media):** Three.js (WebGL).
* **Efekty 2D (Rozpad ikon):** HTML5 Canvas API + dedykowane shadery (fragment/vertex).
* **Zasada projektowa:** Desktop-First (16:9 z obcinaniem `object-fit: cover` dla 4:3). Mobile otrzymuje uproszczony fallback (bez 3D/paralaksy).

## 2. ARCHITEKTURA SPA I ROUTING
Aplikacja działa w jednym pliku `index.html`. 
* **Views Manager:** Moduł JS odpowiedzialny za montowanie i demontowanie kontenerów DOM dla poszczególnych widoków (`#menu`, `#education`, `#projects`, `#social`).
* **Transitions:** Przejścia między głównymi sekcjami mają być docelowo obsługiwane przez hooki na odtworzenie prerenderowanych plików wideo (ukrywających ładowanie assetów).

## 3. SEKCJA 1: MAIN MENU
Minimalistyczne, perfekcyjne odwzorowanie ekranu startowego Portal 2.
* **Tło:** `<video autoplay loop muted>` odtwarzające `menu_background.mp4`.
* **UI:** Pionowa lista nawigacyjna z lewej strony. Czcionka: Univers/DIN (biała).
* **Interakcja:** Hover na elemencie menu wywołuje płynną animację GSAP (skok opacity, pojawienie się wskaźnika Aperture/kreski).
* **Akcja:** Kliknięcie ładuje wybraną sekcję (obecnie przez fade do czerni).

## 4. SEKCJA 2: WYKSZTAŁCENIE (CHAMBER 01)
Klimat: Zrujnowane laboratorium, mech, awarie zasilania.
* **Warstwy (Z-Index):** Tło (`education_background.jpg`), statyczne Oka GLaDOS, UI Panel we wnęce (`screen.jpg`), Niewidzialny CSS Grid 4x3 z 12 ikonami PNG.
* **FNaF Parallax (JS):** Ruch myszką przesuwa tło w stopniu X, a panel UI w stopniu Y (gdzie X > Y). Daje to iluzję głębi 3D na płaskich warstwach. Najechanie na UI Panel (hover) gładko zeruje paralaksę.
* **Dynamiczna GLaDOS:** Oko kamery z tła (osobny wycięty asset) musi fizycznie obracać się za kursorem (obliczenia `Math.atan2` w JS). Po 5 sekundach bezruchu wchodzi w tryb idle (losowe skanowanie).
* **Animacja "The Dissolve" (Kliknięcie w ikonę):** 1. Grid ikon znika (uruchomienie skryptu Canvas).
    2. Ikona rozpada się na cząsteczki ("disintegration shader"), które wylatują poza ekran.
    3. Rekonstrukcja powiększonej ikony na środku.
    4. GSAP symuluje dojazd kamery (powiększenie kontenera ekranu).
    5. Wyświetlenie danych JSON efektem Typewriter (litera po literze, bardzo szybko).
    6. Przycisk "Cofnij" odwraca sekwencję.

## 5. SEKCJA 3: PROJEKTY (PORTAL HUB & ROOMS)
To w 100% środowisko 3D oparte na Three.js.
* **Hub (Nexus):** Betonowy walec/oktagon. Obracanie kamery myszką. 3 aktywne portale we wnękach.
* **Technologia Portali:** Środek portalu używa Render Target (lub zaawansowanego shadera paralaksy), aby w czasie rzeczywistym pokazywać i uwzględniać perspektywę wnętrza komory docelowej.
* **Przejście:** Kliknięcie w portal odpala animację kamery w głąb portalu, aktywuje shader aberracji chromatycznej i radial blur.
* **Środowiska (Komory):**
    * *Komora A (Natura):* Światło wolumetryczne, mech, zardzewiały Companion Cube, ekran to pęknięty LED w ścianie.
    * *Komora B (Retro):* Biuro lata 70., rzutnik slajdów, światło w zapylonym powietrzu, ekran z winietą i film grain.
    * *Komora C (Industrial):* Telewizor CRT na ramieniu robota, barrel distortion, scanlines, awaryjne oświetlenie.
* **Logika UI (World Space 3D):** Niezależnie od scenerii, kliknięcie w monitor (3D object) płynnie animuje kamerę prostopadle do ekranu (wypełnia 80% kadru). Tło dostaje silny Depth of Field (blur).
* **Nawigacja na ekranie:** Siatka 4x3. Hover przygasza resztę, a wybrany box rozwija się w dół pokazując tekst z opisem projektu. Przycisk "Szybka podróż" z efektem glitcha zmienia komorę bez powrotu do Hubu.

## 6. SEKCJA 4: SOCIAL MEDIA (FINALE / GLaDOS CHAMBER)
Błyszczące, sterylne środowisko High Gloss (Three.js).
* **Otoczenie:** Idealnie białe ściany, odbijająca podłoga. Pod sufitem gigantyczna GLaDOS (jej główne oko śledzi kursor z dużym opóźnieniem - heavy mass physics).
* **Postument:** 4 "Rdzenie Osobowości" (Personality Cores) z Portal 2 w układzie 2x2.
* **Fizyka Idle:** Rdzenie unikają "wzroku" gracza (patrzą na boki) i delikatnie drżą (silniki żyroskopowe).
* **Interakcja (Hover "Snap"):** Najechanie na rdzeń wyzwala:
    1. Agresywny "snap" obiektywu rdzenia w stronę kamery użytkownika.
    2. Wysokiej częstotliwości drżenie (jitter).
    3. Otwarcie mechanicznej przysłony (aperture), ujawnienie logotypu (np. GitHub/LinkedIn) we wnętrzu.
    4. Potężny rozbłysk (Bloom/Lens Flare) ze środka oka.
* **UI:** World Space UI wykorzystujące Signed Distance Fields (SDF) dla idealnie ostrych tekstów z nazwą platformy zawieszonych w 3D nad rdzeniami.