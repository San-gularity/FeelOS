# feelos

ai-powered chaotic windows xp desktop environment.

## what is this?

a windows xp-style desktop where you can create any app you can imagine. double-click an icon and an ai generates what that app might look like - instantly hallucinated into existence.

want a terminal? a file browser? microsoft paint? minecraft? the ai dreams up a plausible xp-styled interface for whatever you ask for.

## how it works

- vanilla js frontend with draggable/resizable windows
- uses claude haiku 4.5 to generate app html on the fly
- results are cached so apps look consistent
- no backend needed - calls anthropic api directly from browser

## setup

1. copy `.env.example` to `.env`
2. add your anthropic api key: `VITE_ANTHROPIC_API_KEY=sk-ant-...`
3. `bun install`
4. `just dev` (or `bun run dev`)
5. visit http://localhost:5173

## usage

- right-click desktop → "new app" → name it anything
- double-click to open
- drag windows around, resize them
- right-click icons to rename or delete
- desktop state persists in localstorage

## why?

because it's fun to watch an ai hallucinate operating systems.
