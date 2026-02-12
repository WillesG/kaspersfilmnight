# 🎬 Kasper's Film Night — Handleiding

Welkom bij je filmavond website! Hier lees je hoe je alles kunt aanpassen.

---

## 📁 Bestanden

| Bestand | Wat doet het |
|---------|--------------|
| `index.html` | Hoofdpagina met de huidige filmavond |
| `wishlist.html` | Verlanglijst met stemfunctie |
| `archief.html` | Archief van gekeken films |
| `style.css` | Alle opmaak (kleuren, lettertypes, layout) |
| `data.js` | **⭐ DIT BESTAND PAS JE AAN!** |
| `app.js` | Code voor de hoofdpagina |
| `wishlist.js` | Code voor het stemmen |
| `archief.js` | Code voor beoordelingen |

---

## ✏️ De Website Aanpassen

### Een Nieuwe Filmavond Instellen

1. Open `data.js` in een teksteditor (Kladblok, VS Code, etc.)
2. Zoek het `CURRENT_EVENT` gedeelte bovenaan
3. Pas deze waardes aan:

```javascript
const CURRENT_EVENT = {
    title: "Jouw Film Titel",
    year: "2024",
    date: "Zaterdag 15 februari",
    time: "19:00 uur",
    youtubeId: "abc123xyz",  // Zie hieronder!
    poster: "",               // Laat leeg of voeg URL toe
    message: "Neem lekkers mee! 🍿"
};
```

4. Sla het bestand op
5. Upload naar Neocities

---

### YouTube Video ID Vinden

De YouTube ID staat in de URL na `v=`:

```
https://www.youtube.com/watch?v=cqGjhVJWtEg
                               ^^^^^^^^^^^
                               Dit is de ID!
```

Kopieer alleen dat stukje en plak het als `youtubeId`.

---

## ⭐ Verlanglijst Beheren

### Optie 1: Via data.js (aanbevolen)

Voeg films toe aan de `WISHLIST_MOVIES` lijst:

```javascript
const WISHLIST_MOVIES = [
    {
        id: "wish1",          // Unieke ID (bijv. wish1, wish2, etc.)
        title: "Film Naam",
        year: "2024",
        poster: ""            // Leeg laten of afbeelding URL
    },
    // Meer films hieronder...
];
```

### Optie 2: Via Admin Mode

1. Open de **Verlanglijst** pagina in je browser
2. Druk **F12** om developer tools te openen
3. Ga naar de **Console** tab
4. Typ: `enableAdmin("popcorn")` en druk Enter
5. Nu verschijnt er een formulier om films toe te voegen!
6. Je kunt ook films verwijderen met de rode ✕ knop

Om admin mode uit te zetten: `disableAdmin()`

---

## 📚 Film naar Archief Verplaatsen

Na een filmavond, voeg de film toe aan `ARCHIVE_MOVIES` in `data.js`:

```javascript
const ARCHIVE_MOVIES = [
    {
        id: "arch1",
        title: "Film Die Je Keek",
        year: "2024",
        watchedDate: "30 januari 2025",
        poster: ""
    },
    // Oudere films eronder...
];
```

**Tip:** Verwijder de film ook uit `WISHLIST_MOVIES` als hij daar nog staat!

---

## 🎨 Extra Tips

### Filmposters Toevoegen

Je kunt poster afbeeldingen toevoegen! Zoek een poster URL online:

```javascript
{
    id: "wish1",
    title: "Spider-Man",
    year: "2023",
    poster: "https://voorbeeld.com/spiderman-poster.jpg"
}
```

### Admin Wachtwoord Veranderen

Zoek deze regel in `data.js`:

```javascript
const ADMIN_PASSWORD = "popcorn";
```

Verander `"popcorn"` naar je eigen geheime wachtwoord!

---

## 🌐 Uploaden naar Neocities

1. Ga naar [neocities.org](https://neocities.org) en log in
2. Klik op **"Edit Site"** of **"Dashboard"**
3. Sleep **ALLE bestanden** naar je site (of gebruik de upload knop)
4. Klaar! Je site is live!

**Belangrijk:** Upload altijd alle bestanden samen, niet alleen degene die je hebt aangepast.

---

## ❓ Hoe Werkt Het?

### Reacties & Stemmen
- Reacties en stemmen worden opgeslagen in de **browser** van elke bezoeker (localStorage)
- Dit betekent: als iemand stemt op zijn eigen telefoon, ziet hij zijn eigen stem
- Als iemand zijn browserdata wist, zijn de reacties/stemmen weg

### Waarom localStorage?
- Neocities host alleen **statische bestanden** (geen database mogelijk)
- Dit is een simpele oplossing die werkt zonder server
- Voor echte gedeelde reacties zou je een externe service nodig hebben (zoals Firebase)

### Werkt het niet?
- **Lokaal testen:** localStorage werkt soms niet als je het bestand direct opent. Upload naar Neocities om te testen!
- **Console checken:** Druk F12 en kijk bij Console voor foutmeldingen

---

## 🎉 Veel Plezier!

Pas `data.js` aan wanneer je een nieuwe filmavond plant. Je vrienden kunnen dan de site bezoeken om te zien wat er komt, stemmen op de verlanglijst, en reacties achterlaten!

Vragen? Vraag je vader! 😄

---

*Gemaakt met ❤️ en heel veel 🍿 voor Kasper's Film Night*
