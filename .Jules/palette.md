## 2024-05-22 - [Injecting Styles for Accessibility]
**Learning:** In raw JS extensions without external CSS, inline styles fail accessibility standards (no `:focus-visible`).
**Action:** Inject a scoped `<style>` block to support pseudo-classes for proper keyboard navigation and visual feedback.

## 2025-05-23 - [Accessible Colors & Lightweight Feedback]
**Learning:** Default "Red" (rgb(255,0,0)) and "Green" (rgb(0,255,0)) fail contrast checks with white text. Darker shades (#D32F2F, #2E7D32) are required.
**Action:** Always verify contrast ratios for injected UI elements, especially when overlaying on variable content.
