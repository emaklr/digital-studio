# Approved Abeeb Digital Studio homepage

This is the approved visual reference for the current website redesign. It shows the desktop and mobile experiences together. Treat it as the source of truth for hierarchy, visual balance, dashboard composition, colour and responsive behaviour.

![Approved desktop and mobile homepage](abeeb-approved-homepage.webp)

## Core direction

A premium digital studio website, not a marketing flyer. Use a calm white/light-blue editorial canvas, deep navy as a grounding colour, and the AB logo's royal/electric blues for emphasis. Typography should be confident and carefully scaled. Use generous spacing, subtle borders, restrained shadows and measured transitions.

## Hero: a real software interface

- Hero copy and calls to action sit beside a bespoke software dashboard.
- The dashboard is built from semantic React components and CSS/SVG: navigation, summary metrics, project activity chart, activity feed, active project progress and milestone workflow.
- Dashboard figures are illustrative UI content, not live client metrics. Keep the "sample workspace" context clear.
- Do not use a background template image, a flattened website screenshot, architectural/house photography, or laptop-and-phone product collages as the hero.
- The dashboard must be real markup, remain legible, and rearrange at smaller breakpoints.

## Responsive behaviour

Desktop uses a split hero with the message on the left and the dashboard on the right. Tablet should stack the hero before dashboard content becomes cramped. Mobile is a separate composition:
- Keep the hero message and primary actions first.
- Put the compact dashboard directly beneath, hide the desktop sidebar, use a two-column stat grid, and stack chart/activity/project panels in a readable order.
- Recompose service cards as compact horizontal rows and package cards as a single vertical column.
- Stack custom-project and agency partnership panels and make the contact action full width.
- No clipped panels, overflowing tables, fixed desktop-width elements or horizontal page scrolling.

## Shared visual rules

- Brand palette: white, pale blue-grey, deep navy, royal blue and bright sky blue.
- No decorative arrow glyphs on navigation, cards, buttons or links.
- Buttons should feel weighted and deliberate: smooth hover lift and gradual pressed state, never bounce.
- Honour `prefers-reduced-motion`.
- Keep text contrast and touch targets usable on phones.

## Pricing implementation note

The concept shows Naira package amounts for visual illustration. The live package UI must read the canonical prices from `lib/services.ts` and display USD while checkout calculates NGN using the configured rate. Do not hard-code different amounts into the homepage. Any pricing-currency change must update the canonical service data, server checkout calculation and payment verification together.

## Implementation boundary

The image is a design reference, not a page background or a static UI to display. The website must be composed of responsive, accessible, working components and retain existing booking, enquiry and payment flows.
