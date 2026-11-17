# Lumen Wake — design before implementation

## Competition deconstruction

Inspected the complete best-game-01 starter, RULES.txt and competition.yaml on 17 November 2026. The ordered rubric is: (1) complete playable loop visible in screenshots, (2) repeatable fun, growing challenge and meaningful choices, (3) responsive feel, feedback, sound and fair tuning, (4) original coherent art direction, (5) modular, clearly named source. Pairwise comparisons decide on the first meaningful difference. Most of the 1,536-token judge view is a contact sheet; its first image is large. Real gameplay quality also matters because finalists are played in Chrome.

Entrypoint: root main.ts, Node 22 standard library only. Offline, read-only repository; 1 CPU, 1 GiB RAM, 120 seconds. Write game/, screenshots/ and dossier.json to MAKEFUN_OUTPUT_DIR using the unchanged kit library. Two builds must match byte for byte. Static game/index.html and all reachable assets must live under game/. No remote fonts, requests or asset dependencies. Maximum 993 game entries / 48 MiB; index.html ≤1 MiB. Exactly 3–4 genuine browser screenshots; each ≤256 KiB, long side ≤1280 and short side ≥480. Use four 1280×800 JPEGs. Dossier uses the kit's exact gate caps.

Public GitHub repo must be newly created, OSI licensed, have the three live make.fun README badges, About link and required topics. Submit the pushed full SHA and genuine harness logs; no transcript reconstruction. Required original prompt and run record accompany bundle. No live recorder, fee or model gateway is required. Official local check covers intake/transcripts; the visual grade is server-only.

## Game promise and three-second onboarding

**Be the last light in a living storm.** Pilot a small glass-wing courier across a circular, ink-blue ocean. Collect amber sparks; return to the luminous central beacon to bank them. Space/click dashes through crimson storm creatures. Light a chain of five dawns, then survive the leviathan's final surge.

Title screen immediately shows the world, courier, beacon and three short illustrated rules: MOVE → COLLECT → RETURN. Enter or the primary button starts in one action. The first cluster is beside the starting player and a dotted trail leads home. The first three seconds have no damage; contextual text changes after collecting and banking. Keyboard WASD/arrows, Space/Shift dash, E pulse, Esc/P pause, M audio. Mouse hold steers toward pointer, click/right click dashes; touch drag steers with dedicated dash and pulse buttons. Buttons support keyboard focus.

## Core loop, tension and meaningful choices

Sparks orbit in small procedural constellations. Carry up to 12, with multiplier rising from ×1 to ×4 in cargo tiers. More cargo makes hunters faster. A hit loses half the unbanked cargo, one hull segment and the combo. Bank automatically near the beacon: cargo becomes secure score and dawn energy, with a radial shockwave that clears nearby threats. Dash invulnerability is short and collision is swept so fast motion cannot tunnel. Dashing through a hunter destroys it, grants combo score and sparks. A charged pulse is an emergency escape with a finite cooldown.

Five dawns use increasing energy goals. Between dawns choose one of three upgrades: faster dash recharge, wider collection magnet, or hull restoration and shield. Three enemy behaviors: direct hunters; orbiting shooters with visible windups; charging lancers that lock onto a telegraphed line. The final dawn adds a leviathan with rotating bullet fans and a visible shield that falls as light is banked. Victory is explicit after the final energy goal; game over at zero hull. Both have score, seed, best, peak multiplier, banked light, destroys, run time, and one-button retry. Endless mode continues after victory for score chasers.

## Difficulty and replayability

Use seeded xorshift32 for all gameplay randomness. ?seed=TEXT reproduces the world under identical fixed-step inputs. Daily mode derives a visible seed from UTC date; free flight uses a fresh local seed. Store best scores by mode and seed using guarded localStorage. Difficulty starts gently and ramps with dawn/time/cargo. A bounded director observes recent hits and successful banking, easing pressure for struggling players and increasing spawn pace for confident ones; deterministic state drives this adaptation. No instant spawns near the player, capped enemy/bullet counts, telegraphed attacks, and post-hit invulnerability preserve fairness.

## Art, sound and feel

Original procedural Canvas 2D art: ocean contour rings, fine geometric star charts, silhouetted offshore islands, a stained-glass radial beacon, ivory-and-teal courier wings, amber cargo orbit, vermilion threats and petal-shaped destruction. Cream editorial typography over dark slate panels. Interface layout: small wordmark top left, large dawn/objective in header, score/hull top right, compact cargo/risk and dash meters at bottom. Use a quiet cyan/amber/coral palette with restrained bloom. Motion trails, wake ripples, white impact flashes, short hitstop, spring-decaying shake, additive particle bursts, floating bank scores and combo chimes establish weight. Reduced-motion toggle disables shake/flash and reduces particles.

Sound is synthesized after first user gesture with Web Audio: soft pentatonic arpeggio, cargo chimes, dash sweep, impact bass, warm banking chord and dawn fanfare. Cap concurrent oscillators, stop/disconnect nodes on ended, suspend when paused, no audio files. Mute and motion preferences persist.

## Modules and invariants

- config.js: palette, dimensions, upgrade and wave definitions.
- math.js: seeded RNG, normalization, swept circle/segment intersection, bounded scalar helpers.
- simulation.js: pure fixed 1/60-second state machine, wave director, pickups, collision, score and upgrades. No DOM, clock or rendering dependencies.
- particles.js: bounded effects and event presentation; no gameplay random-number consumption.
- render.js: procedural world/courier/enemy rendering, camera shake and HUD-adjacent canvas cues.
- audio.js: bounded synthesized voices and adaptive sequencer.
- input.js: normalized keyboard/pointer/touch and action edges.
- ui.js: title, pause, upgrade, results and persistent records.
- main.js: fixed-step accumulator with bounded catch-up, visibility pause and lifecycle orchestration.
- verify.mjs: simulation determinism, swept collision, state transitions, upgrade guards, stress limits, timing and retained-memory observations.
- browser verification: actual inputs, screenshot loop, no page errors/network assets, mobile layout and frame measurements.

State invariants: finite coordinates, player inside arena, hp in [0,max], cargo in [0,cap], no duplicate bank, one upgrade per completed dawn, pause freezes simulation, terminal states do not accrue score. Bounded arrays for enemies, projectiles, sparks and particles. Gameplay simulation and visual RNG remain separate. Fixed-step catch-up capped at five to prevent a tab stall causing a death spiral.

## Evidence plan

Before submission run deterministic long simulations, property-like collision checks and edge cases; measure update p50/p95/p99 against 16.67 ms and report hardware-dependent results honestly. Measure actual browser draw/update timing separately. Repeated runs after GC test retained heap and object-count ceilings; no finite test proves absence of every leak. Browser playthrough produces authentic title, action, upgrade and victory/results screenshots at actual reachable states. Render nothing solely for a screenshot. Bundle original harness records and run official checks until all applicable local checks pass, then commit/push, set About and submit. Inspect returned server checks and status; repair genuine failures without wasting quota.

## Revision after first provisional judge result

The first submission passed every server gate and scored 72.7483% provisionally. Judge feedback favored its originality and risk economy but found the gameplay small in the contact sheet and progression less visible. The revised cover is an actual final-tide gameplay capture, with title, gift choice and results beneath. Five regions now have distinct palettes and generated landmarks. Nine functional gifts cycle through three sets, adding offensive dash width and kill bonuses, pulse range/recharge, protected banking, faster sails, bank-value bonuses and pulse healing. Split progression, combat, event emission and region presentation into focused modules. Re-run simulations, actual-input browser voyage, output determinism and the official checks before resubmitting. No transcript or screenshot is edited to change evidence.
