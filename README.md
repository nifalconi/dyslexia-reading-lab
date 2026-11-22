# Reading Lab — find text settings that are easier to read

A small, bilingual (English / Spanish) website for people with dyslexia — or anyone who finds dense text tiring. It helps you find the font, spacing and size that work for *you*, and then apply them to every website with the free [DyslexiaAway](https://github.com/ernvk23/dyslexia-away) browser extension.

**Live site:** https://nifalconi.github.io/dyslexia-reading-lab/

## Pages

| Page | What it does |
|---|---|
| `index.html` — Try it | Live preview: font, letter spacing, word spacing, line height, size and background. Paste your own text. Shows the exact values to type into DyslexiaAway. |
| `test.html` — Find my settings | A 5-minute test: 13 short passages across 4 rounds (font, spacing, line height, size). It times each reading, checks one simple question, asks how easy it felt, and recommends settings. |
| `guide.html` — Guide & research | What the research says about spacing, fonts, size and line length, with 16 references (DOIs verified). |
| `extension.html` — DyslexiaAway | Review of the extension (code checked at v1.14.1), step-by-step setup and alternatives. |

## Design notes

- Values use **em**, the same unit DyslexiaAway uses, so they copy across exactly.
- Fonts (Lexend, Atkinson Hyperlegible Next, Andika, OpenDyslexic) are self-hosted under the SIL Open Font License — no Google Fonts, no tracking, no cookies. Settings are kept in `localStorage`.
- **Opt-in anonymous results:** at the end of the test, visitors can choose to share their picks, reading speeds and ratings (plus optional self-reported dyslexia, language and phone/computer). They are posted to a Google Form owned by the author; nothing is sent without that click.
- Plain HTML/CSS/JS, no build step. Language: `?lang=es` or the EN · ES toggle.
- Not a diagnostic tool.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## License

Code: MIT. Fonts: SIL Open Font License 1.1 (see `assets/fonts/*-OFL.txt`).
