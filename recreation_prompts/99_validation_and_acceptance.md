# Validáció és átvételi kritériumok

1. Fordítás hibátlan: `npx --yes tsc -p tsconfig.json --noEmit`
2. Indulás: `node dist/server.js` — a PORT env-ből, kiírja: "listening on <PORT>"
3. HTTP QA-ellenőrzések a futó appon:
4. Valódi lokális adatbázis-használat ellenőrzése (data/app.db).

Utolsó ismert állapot: fordult=false · elindult=false · QA 0 / 0 · idő 65.7 perc · újraírások: 24