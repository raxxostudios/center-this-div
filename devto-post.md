---
title: "Can You Center This Div? (Spoiler: No, You Can't)"
published: false
tags: devchallenge, 418challenge, showdev
---

*This is a submission for the [DEV April Fools Challenge](https://dev.to/challenges/aprilfools-2026)*

## What I Built

A precision challenge where you drag a `<div>` to the exact center of the screen. The success threshold is **0.0001 pixels**. For context, a single pixel on a Retina display is about 0.5 physical pixels. The threshold is 5,000x smaller than that.

The global success counter reads **0**. It will always read 0.

The interface is a full JARVIS-style holographic HUD dashboard with:

- Real-time deviation readouts (X, Y, total distance) updating at 60fps
- Precision meter with logarithmic scale and labels (INSANE / CLOSE / WARM / MEH / LOST)
- Global leaderboard pulling top 20 closest attempts from Neon Postgres
- Live feed showing recent attempts from players worldwide
- Radar sweep with live player blips
- Earth Scale feature that maps your pixel error to real-world distance (your 2.4px miss = 49,873km on Earth)
- 2,500+ handwritten quotes based on how far off you are
- Share cards for every platform (1080x1080 Retina PNG)
- Hidden 418 teapot easter egg (particle cloud, draggable, zoomable, with steam)
- Light/dark mode

**Anti-value proposition:** This app takes the most solved problem in CSS and makes it unsolvable.

## Demo

**[center-this-div.vercel.app](https://center-this-div.vercel.app)**

Drag the div. Submit your attempt. Share your score. Join the leaderboard of people who almost centered a div but didn't.

When you submit, a HUD result card slams in with a glitch-text "NOT CENTERED" verdict, your exact deviation to 6 decimal places, your global rank, and a reminder that you were 47,000x over the threshold.

The share text includes your Earth Scale result:

> I got 7.975985px from center in "Can You Center This Div?"
> If the target was Earth, I missed by 689km.
> "700km. The distance from Amsterdam to Berlin."
> Rank #26 of 48. Successes: 0. Ever.

## Code

{% github raxxostudios/center-this-div %}

Dead simple stack, wildly overengineered execution:

- **Next.js 16** + React 19 + TypeScript
- **Neon Postgres** (serverless) for global leaderboard and stats
- **Phosphor Icons** for HUD iconography
- **Pure CSS** doing 90% of the visual work (no animation libraries)
- **Pointer Events API** with drag offset tracking for sub-pixel precision
- **Canvas API** for generating share card images

The entire game logic lives in a single custom hook (`useCenterGame`). API routes handle submissions, leaderboard, stats, and a cron cleanup that keeps the leaderboard fair.

## How I Built It

The game measures Euclidean distance from the div center to the target center using `Math.sqrt(devX^2 + devY^2)`. Results are stored as `REAL` in Postgres, giving about 7 significant digits of precision. More than enough to confirm you failed.

The HUD is pure CSS: custom properties, `perspective()` transforms on side panels, repeating gradient measurement lines, conic-gradient radar sweep, and keyframe animations for scan lines, ring pulses, and floating labels. No animation library.

The Earth Scale converts pixel deviation to kilometers using `deviationPx * (40,075km / targetWidthPx)`. Each distance tier has 10 handwritten quotes covering everything from "smaller than a virus" to "further than the Moon."

The 418 easter egg renders a Utah teapot as a 3D point cloud (~2,500 particles) with full drag rotation, scroll zoom, pinch zoom on mobile, and steam particles rising from the spout. All pure canvas, no 3D libraries.

Anti-cheat runs multiple layers server-side. Fabricated submissions get HTTP 418. The success counter never increments. It will stay at 0 forever.

## Prize Category

**Best Ode to Larry Masinter** and **Community Favorite**.

Larry Masinter authored RFC 2324 (HTCPCP), which gave us HTTP 418 "I'm a teapot." This project is a love letter to that spirit: taking something absurdly simple (centering a div) and over-engineering it into an impossible precision challenge, complete with a hidden 418 teapot easter egg rendered as a rotating particle cloud.

The entire app exists because one question was taken too seriously: "Can you center a div?" The answer, measured to 6 decimal places, is no. Nobody can. The counter proves it.

Built by [RAXXO Studios](https://raxxo.shop).
