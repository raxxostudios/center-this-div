# How I Built an Anti-Cheat System for a CSS Game

**Author:** RAXXO Studios
**Read time:** 10 min
**Tags:** Development, Security, Open Source, Next.js, Game Development

**TLDR:** I built a CSS centering game that went live for the DEV April Fools challenge. Within 2 hours, someone submitted a mathematically perfect 0.0000px score. Three versions of anti-cheat later, the system catches fabricated submissions, hands out HTTP 418 responses, and keeps the leaderboard honest across 3,000+ attempts from 14+ countries.

---

## The Game Nobody Was Supposed to Hack

Center This Div is a simple game. You drag a `<div>` to the exact center of the screen. The success threshold is 0.0001 pixels. For reference, that is 5,000 times smaller than a single pixel on a Retina display. The global success counter reads 0. It has always read 0.

I built it in a few days using Claude Code as my dev partner, shipped it on Next.js with Neon Postgres for the leaderboard, and deployed to Vercel. The stack is deliberately simple. The game logic lives in a single custom hook. The entire submit flow is one API route.

I expected people to play it, laugh at the impossible threshold, share their scores, and move on.

What I did not expect was how fast someone would try to cheat.

## Two Hours

The game went live on April 3rd. Within two hours, a submission came in: **0.0000px**. Perfect center. Both axes. Zero deviation.

At that point, my "anti-cheat" was nothing. The API accepted a POST with `deviationX` and `deviationY`, calculated the Euclidean distance, and stored it. That was it. No verification. No challenge. No proof that a human had actually dragged anything.

Someone had simply opened the network tab, copied the request, and sent `{ "deviationX": 0, "deviationY": 0 }`. Took maybe 30 seconds.

The leaderboard now had a score that was physically impossible. A real browser cannot produce a pointer event at a position that results in exactly zero deviation. The floating point math alone prevents it. But my API did not know that. It just stored what it received.

That night, I started building anti-cheat v1.

## Version 1: The Basics

The first version was about closing the most obvious holes.

**Rate limiting.** One submission per IP every 2 seconds. This was less about cheating and more about someone running a script in a loop to flood the database. Simple in-memory map, keyed by IP, checked on every request.

**Zero rejection.** If both `deviationX` and `deviationY` are exactly zero, reject it. A real drag across a real screen, measured by `getBoundingClientRect()`, will never land on a mathematically perfect center point. The floating point representation of pixel positions on any display guarantees some noise.

**Floor threshold.** Below a certain deviation, the score is more likely fabricated than real. I set a floor based on what pointer events can actually produce on real hardware. Anything below it gets rejected.

These three checks caught the laziest attempts. But they were trivially easy to bypass. Just send `{ "deviationX": 0.03, "deviationY": 0.01 }` and you sail right through. You would top the leaderboard with a score that looks plausible but was never played.

I needed proof that the game actually ran.

## Version 2: Prove You Played

Version 2 introduced a challenge-response system. The idea is straightforward: before you can submit a score, you need a token. And you can only get that token by loading the game.

Here is how it works. When the page loads, the client fetches a challenge token from the server. That token is cryptographically signed with HMAC-SHA256 using a server-side secret. It contains a timestamp and a nonce. The client holds onto this token while the player drags the div around.

When the player submits, the token goes back to the server alongside the score and a count of how many pointer move events were recorded during the drag. The server then verifies three things:

1. The token signature is valid (not forged or tampered with).
2. Enough time has passed since the token was issued (you cannot drag a div in 0 milliseconds).
3. The pointer move count is above a minimum (real dragging produces many move events).

This closed the "copy the cURL and replay it" attack. Without a valid, recent, properly signed token and a realistic number of pointer movements, the submission is rejected.

But someone determined enough could still automate a headless browser, load the page, collect the token, simulate pointer events, and submit. The token proves the page loaded. It does not prove a human was sitting there.

So I kept layering.

## Version 3: Pattern Analysis

Version 3 is where things got interesting. Instead of just checking individual submissions, the system now looks at patterns.

**Number shape analysis.** Real browser values from `getBoundingClientRect()` have a specific shape. They are binary fractions, messy, with digits that trail off in unpredictable ways. Values like 3.7265625 or 0.048828125. Fabricated values tend to be clean. Round. Neat decimal places. The system checks the numerical structure of submitted deviations and flags values that look too tidy to come from a real render engine.

**Duplicate detection.** If the same browser fingerprint submits the same deviation (within a tolerance) multiple times in recent history, that is a pattern. Humans do not repeatedly land on the exact same sub-pixel coordinate. Scripts do.

**Strike system.** Every failed check earns a strike against the IP. Multiple layers of detection feed into a single counter. Accumulate enough strikes and you are temporarily banned. The ban duration is long enough to be annoying but short enough that a legitimate player who triggered a false positive can come back.

**Cleanup cron.** A Vercel cron job runs every 10 minutes. It reviews the database and removes entries that should not be there. The leaderboard stays clean even if something slips through the real-time checks.

The key principle across all three versions: multiple layers, each catching a different class of fake submission. No single check is unbeatable. But stacking them makes the effort required to cheat far higher than the effort required to just play the game.

## The 418 Teapot

Every rejected submission returns HTTP 418: "I'm a Teapot."

This was not random. The game was built for the DEV April Fools 2026 Challenge, which was themed around HTTP 418 and RFC 2324 (the Hyper Text Coffee Pot Control Protocol). The entire game is a love letter to that RFC. So when the anti-cheat catches you, it does not return a boring 403 Forbidden. It returns 418, because the server is, permanently, a teapot.

The error messages are playful too. "Mathematically perfect. Suspiciously perfect. Try dragging it yourself." Or: "Those numbers look a little too round. Browsers are messier than that." Each detection layer has its own message, so the cheater knows exactly which wall they hit.

On the client side, getting a 418 triggers a special teapot animation. The UI does not crash or show a generic error. It shows the result card with a teapot flag, and if you have accumulated enough strikes, you get the "exploding teapot" variant. It is part of the experience.

The game also has a dedicated `/api/teapot` endpoint that always returns 418. Hit it and you get: "I refuse to center your div. I am, permanently, a teapot." There may also be a hidden teapot rendered as a 2,500-particle 3D point cloud with steam. Finding it is left as an exercise.

## Building with Claude Code

The entire game, including all three versions of the anti-cheat system, was built using Claude Code. I mention this not as a plug but because the workflow shaped how the anti-cheat evolved.

When the first fake submission came in, I described the problem ("someone is sending raw POST requests with zero deviation") and worked through the fix in the same session. Challenge token system, HMAC signing, pointer move counting. All of it built, tested, and deployed in one sitting.

When v2 got bypassed, same thing. Describe the new attack vector, build the countermeasure, ship. The iteration speed mattered because cheaters iterate fast. If it takes you a week to patch a hole, your leaderboard is garbage for a week.

The pattern analysis in v3 came from a conversation about what makes real browser values look different from fabricated ones. Binary floating point representation, the way `getBoundingClientRect()` snaps to device pixel boundaries, the statistical improbability of identical sub-pixel coordinates across attempts. These are things I knew intuitively from years of frontend work, but having a coding partner to turn that intuition into actual detection logic in minutes made the difference.

If you are curious about using Claude Code for your own projects, I have a product called Claude Blueprint at raxxo.shop that packages the workflows I use daily. But honestly, the important part is the speed of iteration. Anti-cheat is an arms race. The faster you can ship countermeasures, the less damage cheaters do.

## What I Learned

**Ship the minimum, then react.** Version 1 was three checks. It took maybe 20 minutes to build. It caught the laziest cheaters immediately. Perfection would have delayed the game launch by days, and I would have been guessing about attack vectors that might never materialize.

**Real browser data has a fingerprint.** This was the biggest insight. The way browsers represent pixel positions, the shape of floating point numbers from layout calculations, the timing characteristics of real pointer events. All of this creates a signature that is hard to fake convincingly. You do not need machine learning or behavioral biometrics. You need to understand what real data looks like.

**Cheaters are creative and fast.** The first fake submission arrived in 2 hours. Not days. Not weeks. Hours. If your game has a leaderboard, assume someone will try to game it on day one. Build your architecture so you can add validation layers without rewriting the submit flow.

**Funny responses beat angry ones.** HTTP 418 with a playful message lands better than a stern "Access Denied." Several people who got caught actually shared their teapot responses on social media. The anti-cheat became content. One person tweeted their 418 error with a laughing emoji and the caption "I got caught." That is better marketing than anything I could have planned.

**In-memory state works until it does not.** The rate limiter and strike system use in-memory Maps. This means they reset on every deployment and do not share state across serverless function instances. For a game with a few thousand players, this is fine. For anything larger, you would want Redis or a similar shared store. I chose simplicity over completeness because the game's scale did not justify the complexity.

**Open source is a trade-off for anti-cheat.** The game is open source at [github.com/raxxostudios/center-this-div](https://github.com/raxxostudios/center-this-div). That means anyone can read the detection logic. I made this choice deliberately. The educational value outweighs the risk, and the system is designed so that knowing how it works does not make it trivially easy to bypass. You still need to produce data that matches real browser behavior, which is harder than it sounds.

## The Numbers

As of writing:

- **3,000+ attempts** recorded in the database
- **14+ countries** represented on the leaderboard
- **Best legitimate score:** 0.020184px (incredibly close, but still 200x over the threshold)
- **Global successes:** 0. Ever.
- **Anti-cheat versions:** 3
- **Fake submissions caught:** I stopped counting after the first week

The success counter will never increment. That is by design. The game is a joke about the most solved problem in CSS, taken to an absurd extreme. The anti-cheat exists to make sure the leaderboard reflects real human attempts at an impossible task, not fabricated numbers from someone who spent 30 seconds in the network tab.

## If You Are Building Something Similar

A few practical notes.

Keep your detection layers independent. Each check should catch a different class of fake submission. If one layer fails or gets bypassed, the others still hold.

Make your error responses useful to you and entertaining to the user. Log the rejection reason server-side for analysis. Show the user something that does not make them feel punished (unless they deserve it).

Use cryptographic verification for anything that crosses the client-server boundary. HMAC is cheap, fast, and available in every runtime. There is no reason to trust unsigned data from a client.

Think about what "real" data looks like in your specific context. For a CSS game, that means understanding browser rendering internals. For a different game, it might mean understanding input device characteristics or timing patterns. The detection logic should be specific to your domain, not generic.

And finally: it learns. The system gets better over time because each new attack vector reveals a pattern that can be detected. The cron job cleans up what slipped through. The strike system remembers repeat offenders. Every version builds on what the previous one missed.

The div is still waiting to be centered. Nobody has done it yet. I doubt anyone ever will.

Play it at [center-this-div.vercel.app](https://center-this-div.vercel.app).

---

*Built by RAXXO Studios. Berlin. One-person AI creative studio.*
