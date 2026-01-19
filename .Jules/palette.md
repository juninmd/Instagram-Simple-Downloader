## 2024-05-22 - [Injecting Styles for Accessibility]
**Learning:** In raw JS extensions without external CSS, inline styles fail accessibility standards (no `:focus-visible`).
**Action:** Inject a scoped `<style>` block to support pseudo-classes for proper keyboard navigation and visual feedback.

## 2025-05-23 - [Accessible Colors & Lightweight Feedback]
**Learning:** Default "Red" (rgb(255,0,0)) and "Green" (rgb(0,255,0)) fail contrast checks with white text. Darker shades (#D32F2F, #2E7D32) are required.
**Action:** Always verify contrast ratios for injected UI elements, especially when overlaying on variable content.

## 2025-05-24 - [State Changes & Screen Readers]
**Learning:** Changing button text (e.g., "Downloading...") is not announced by screen readers by default. Using `aria-live="polite"` on the text element ensures users are aware of status changes.
**Action:** Use `aria-live` regions for dynamic content updates within interactive elements.

## 2025-05-24 - [Disabled State Styling]
**Learning:** Setting `button.disabled = true` does not automatically change the cursor to `not-allowed` if a class defines `cursor: pointer`.
**Action:** Explicitly define `:disabled` pseudo-class styles in CSS rather than using inline styles, to ensure consistent visual feedback.

## 2024-05-24 - [Success Feedback & Motion]
**Learning:** Persisting a spinner during a success message ("Started!") confuses users about the operation status.
**Action:** Replace loading indicators with static success icons (like a checkmark) immediately upon completion, and respect `prefers-reduced-motion` for spinners.

## 2025-05-25 - [Micro-interactions & Tooltips]
**Learning:** Visual state changes (like success/error) are enhanced by micro-animations (pop/shake), but these must be paired with descriptive text (tooltips/aria-labels) for clarity.
**Action:** Combine CSS animations for emotional feedback with dynamic `title` attributes for cognitive clarity, ensuring `prefers-reduced-motion` is respected.
