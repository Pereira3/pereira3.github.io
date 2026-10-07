# Personal site

React + TypeScript site built with Vite, deployed to GitHub Pages.

## Run it locally

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

## Checks

Code is linted with [oxlint](https://oxc.rs) (catches likely bugs) and formatted with
[Prettier](https://prettier.io). [Husky](https://typicode.github.io/husky) runs both
automatically on every commit and push, and the deploy runs them again.

```bash
npm run lint      # lint
npm run format    # format
```

## To implement

Remove scrollable pages and interfaces.
Add git commit history for ongoing projects.
Verify manually captchas like Typing, Reaction, Puzzle and Memory.
Test and see Speech viewer, screen reader accessibility, prefers-reduced-motion, keyboard only use, website on phone (mainly hold captcha, runaway button and overall content fit), zoom (200%) and high contrast with forced-colors as true.

## Notes

Color palette in use:

- **Dark theme:** 012a4a, 013a63, 01497c, 014f86, 2a6f97, 2c7da0, 468faf, 61a5c2, 89c2d9, a9d6e5
- **Light theme:** e3f2fd, bbdefb, 90caf9, 64b5f6, 42a5f5, 2196f3, 1e88e5, 1976d2, 1565c0, 0d47a1
