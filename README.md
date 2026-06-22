# NursePlus

Professionele, moderne en schaalbare website-basis in Deno met een eenvoudige server-side structuur, herbruikbare partials en drie pagina's:

- Home
- Diensten
- Contact

## Kenmerken

- Deno-first, zonder onnodige dependencies
- Heldere projectstructuur met scheiding van verantwoordelijkheden
- Herbruikbare partials voor navigatie en footer
- Unieke SEO tags per pagina
- Responsive navigatie met premium hamburger animatie
- Toegankelijke mobile menu interacties (ESC, buitenklik, link-klik)
- Productieklare basis met minimale configuratie

## Projectstructuur

```text
project/
├── main.ts
├── deno.json
├── routes/
│   ├── home.ts
│   ├── diensten.ts
│   └── contact.ts
├── partials/
│   ├── nav.ts
│   └── footer.ts
├── views/
│   └── layout.ts
└── public/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── nav.js
    └── images/
```

## Beschikbare scripts

- `deno task dev`  
  Start development server met file watching.
- `deno task build`  
  Voert een type-check uit als build-validatie.
- `deno task start`  
  Start de productie-server zonder watch mode.

# Installatie

1. Zorg dat Deno is geïnstalleerd.
2. Open een terminal in de projectmap.
3. Voer uit:

```bash
deno cache main.ts
deno task dev
```

Voor productie/start modus:

```bash
deno task start
```

Standaard draait de server op `http://localhost:8000`.
# NursePlus
