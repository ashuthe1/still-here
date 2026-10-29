# Still Here

A quiet place to get to know yourself. Still Here asks one gentle question at a time, about who you are, what you want, work, love, time, and what you are grateful for, and gives you a private space to write the answer. Answers stay on your device, dated, so you can answer again later and see how you have moved. Share a question or an answer as an image, print a sheet to write on by hand, or print a whole category as a booklet. A second section, Read, is a small shelf of curated lines and letters.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build and deploy

```bash
npm run build      # static site in ./out
```

On Vercel, import the repo with the Next.js preset and default settings. Elsewhere, deploy the `out` folder to any static host: Netlify, Cloudflare Pages, GitHub Pages. There is no server, no database, and no environment variables.

## Android

The Android app is the same static export wrapped with Capacitor. It needs Android Studio with the SDK installed and JDK 21.

```bash
npm run build && npx cap sync android   # rebuild the web app and copy it into android/
cd android && ./gradlew assembleDebug   # debug APK in android/app/build/outputs/apk/debug/
npx cap open android                    # or open the project in Android Studio for a signed release
```

## Content

Every question and every piece is one markdown file under `content/`. Questions live in `content/ask/<category>/`, reading pieces in `content/<room>/`. Add a file, run `npm run dev`, and it appears.

## License

MIT
