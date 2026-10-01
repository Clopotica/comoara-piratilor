# Verificări pentru tabla interactivă

Necesită Node.js, Playwright și Microsoft Edge. Dacă Playwright este instalat într-un alt director, variabila `PLAYWRIGHT_MODULE` poate indica modulul respectiv. `BROWSER_CHANNEL` permite alegerea altui canal Chromium instalat.

```powershell
node tools/check-layout.cjs
node tools/check-touch.cjs
node tools/check-controls.cjs
```

Verificarea de layout parcurge cele 100 de hărți, ecranele principale, jurnalul, naratoarea și variantele cele mai încărcate ale probelor din ambele niveluri. Verifică încadrarea, suprapunerile și țintele tactile de minimum 48 px la 1920×1080, 1280×720, 1024×768, 3840×2160, 800×600, 390×844 și 320×640. Capturile și raportul JSON sunt salvate în directorul temporar `clopotica-layout`; acesta poate fi schimbat prin `LAYOUT_OUTPUT`. `LAYOUT_SIZES` acceptă o listă JSON de rezoluții pentru o verificare punctuală.

Verificarea tactilă joacă prima lume prin atingeri în browser, inclusiv toate cele șase insule, comenzile din antet, ecranul complet în timpul filmului și păstrarea poziției tastaturii după un indiciu. Verifică și respingerea unui login invalid, restaurarea sesiunii și ieșirea din cont. Opțional, `TEST_USER` și `TEST_PASSWORD` permit verificarea autentificării valide; fără ele, testul pornește de la o sesiune locală de test. Datele de autentificare nu sunt salvate în fișiere.

Testele pornesc un server local temporar și nu modifică progresul sau conturile din aplicația publicată. Emularea tactilă în browser nu înlocuiește verificarea hardware pe tabla folosită în clasă.

Verificarea `check-controls.cjs` completează testul de layout: verifică dacă butoanele active sunt vizibile integral în zona de joc și dacă centrul lor poate fi atins, fără să fie acoperit de bara de jos. Acoperă ambele niveluri din cinci lumi și spații de afișare reduse, inclusiv 960×540 pentru o tablă Full HD la zoom 200%. Compară coordonatele comenzilor înainte și după afișarea indiciului. `CONTROL_SIZES` acceptă rezoluții JSON, iar `CONTROL_OUTPUT` stabilește directorul capturilor și al raportului.

Pentru verificarea tactilă exclusiv pe tablă, `TOUCH_VIEWPORT` poate fi setat la `{"width":960,"height":540}`; acest spațiu corespunde unei table Full HD la zoom 200%.
