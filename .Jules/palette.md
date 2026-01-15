## 2024-05-22 - [Injecting Styles for Accessibility]
**Learning:** In raw JS extensions without external CSS, inline styles fail accessibility standards (no `:focus-visible`).
**Action:** Inject a scoped `<style>` block to support pseudo-classes for proper keyboard navigation and visual feedback.

## 2024-05-24 - [Developer Colors vs Accessibility]
**Learning:** Utilities often default to "pure" colors (red #F00, green #0F0) which fail WCAG contrast on white.
**Action:** Always check contrast of status colors. Use accessible equivalents (e.g., #D32F2F, #2E7D32) even for simple "download" buttons.
