# GEMINI.md - Project Context

## Overview
Instagram Simple Downloader is a browser extension (Manifest V2) that adds download and copy link buttons to Instagram posts, stories, and reels.

## Architecture
- **Type:** Browser Extension (Firefox/Chrome compatible)
- **Manifest Version:** 2 (Targeting V3 eventually)
- **Stack:** Vanilla JavaScript (ES6+), HTML, CSS (injected via JS).
- **Build System:** None (Raw source files loaded directly).
- **Testing:** Playwright for end-to-end verification.

## Key Decisions
- **No Bundler:** To keep the extension lightweight and reviewable, we use raw JS files split by functionality and loaded via `manifest.json`.
- **Direct DOM Manipulation:** necessary for injecting buttons into Instagram's dynamic UI.
- **MutationObserver:** Used to detect new content as the user scrolls.

## Current State
- Refactoring monolithic `app.js` into modular components.
- Implementing CI/CD via GitHub Actions.
