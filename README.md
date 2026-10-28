# Still Here

A small, quiet site of lines about life, hardship, and finding yourself. Curated, attributed, and written to make the reader feel more capable, not just comforted.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000  (compiles into .next-dev)
npm run build      # static export into ./build (deploy anywhere: Vercel, Netlify, GitHub Pages)
```

Dev and build use separate folders on purpose, so running a build never breaks a running dev server.

## Two halves

**Ask & Find** (the home page) is a set of questions about yourself, one at a time, with a place to write the answer. Answers stay in the browser, dated, and can be answered again later. Each question can be shared as an image, printed as a ruled sheet, or printed with the answer. Whole categories print as a booklet. Everything exports to one text file from the Yours page.

**Read** is the shelf: curated lines, reflections, and original letters in eight rooms.

## How content works

Every piece and every question is a markdown file.

```
content/
  mind/  life/  hardship/  happiness/  self/  ambition/  love/  freedom/    <- Read
  ask/
    _start.md                 <- the "Start here" path, one question id per line
    who/  want/  lighter/  work/  people/  roots/  ahead/  time/  mind/  daily/
```

### A question

```md
---
order: 3
why: "Forever is too big to answer. One Monday is honest."
deeper: "What is stopping you from doing a smaller version of it this Monday?"
read: "life/the-filter"
---
If money were handled, what would you do on Monday morning at nine? Not forever. Just Monday.
```

`why` is the line under the question. `deeper` appears after the reader has written something. `read` links a piece from the shelf.

### A piece (Read)

Each room has a `_theme.md` (title, tagline, accent colour, intro letter) and one file per piece. `npm run content` compiles them into `src/data/content.json`, which the site reads. It runs automatically before `dev` and `build`.

### Three kinds of piece

**Line**: a short, attributed quote.

```md
---
type: line
author: "Seneca"
source: "Letters to Lucilius, 78"
note: "If today that is all you managed, you managed the brave thing."
tags: [courage]
---
Sometimes even to live is an act of courage.
```

**Reflection**: a quote from someone else, then a few paragraphs of ours.

```md
---
type: reflection
author: "Still Here"
title: "Own the rock"
quote: "One must imagine Sisyphus happy."
quoteAuthor: "Albert Camus"
quoteSource: "The Myth of Sisyphus"
---
Camus took the cruellest punishment in Greek myth...
```

**Letter**: an original piece written straight to the reader.

```md
---
type: letter
author: "Still Here"
title: "Ready"
---
You are waiting to feel ready...
```

Optional front matter: `url` (link on the source, used for books still in print), `tags`.

### Curation rule

A piece goes in only if it is true (not a platitude), attributed correctly, and leaves the reader more capable. Quotes from living authors stay short and are credited with a source. Nothing is reproduced at length from a book in copyright.

## Features

- Daily piece on the home page (same for everyone on the same day)
- Eight themed rooms, each opening with an original letter
- Save pieces (local to the device), random piece, light and dark mode
- Share as text or as a 1080x1350 image card for Instagram and WhatsApp
- Keyboard: left and right arrows move between pieces, S saves
- Installable PWA (manifest, icons, offline cache of visited pages)

## Android later

The site is a static export with all content in one JSON. Wrapping it with Capacitor gives a Play Store app from the same code, and `src/data/content.json` is the API any native app would read.
