# 3,000 Attempts, 14 Countries, Zero Winners: What I Learned Building a Viral Game

**Author:** RAXXO Studios
**Read time:** 10 min
**Tags:** Business, Content, Open Source, Build In Public, Game Development

**TLDR:** I built a free browser game for the DEV.to April Fools challenge where you try to center a div to within 0.0001 pixels. It hit 134K views on Reddit, spread to 14 countries, attracted cheaters within 2 hours, and taught me more about content strategy in one week than 58 days of daily posting ever did.

---

## The numbers

3,247 attempts. 14 countries on the leaderboard. 134K views on a single Reddit post. Zero winners.

That last number is by design. The success threshold for Center This Div is 0.0001 pixels. For context, a single pixel on a Retina display is about 0.5 physical pixels. The threshold is 5,000 times smaller than that. The best legitimate score anyone has posted is 0.020184 pixels. Still 200 times too far off.

The global success counter sits at zero. It will always sit at zero.

I built the entire thing in a few hours on April 3, 2026, submitted it to the DEV.to April Fools challenge, and then something unexpected happened. People actually cared.

## How a joke became a product lesson

Center This Div started as a simple idea: take the most solved problem in web development and make it unsolvable. Every developer knows how to center a div. It's the first thing you learn, the first Stack Overflow answer you bookmark, the meme that never dies.

So I flipped it. Draggable div. Full holographic HUD dashboard showing your deviation in real time. Global leaderboard powered by Neon Postgres. Earth Scale feature that maps your pixel error to real-world distance (your 2.4 pixel miss equals 49,873 km on Earth's surface). And 2,500 handwritten quotes roasting you based on how badly you failed.

The tech stack is straightforward. Next.js 16, React 19, TypeScript, Neon Postgres on Vercel. Pure CSS doing 90% of the visual work. No animation libraries. The entire game logic lives in one custom hook. I built it with Claude Code, and most of the development time went into writing the quotes and tuning the HUD animations, not the actual game logic.

The whole thing is open source: [github.com/raxxostudios/center-this-div](https://github.com/raxxostudios/center-this-div).

## The Reddit moment

I posted Center This Div on r/webdev. Within 24 hours: 134K views, 265 upvotes, and a comment section full of developers sharing their scores, arguing about whether it was actually impossible, and trying to reverse-engineer the anti-cheat system.

But here's the part nobody tells you about Reddit marketing: .shop domains get spam-filtered. My actual website is raxxo.shop. Reddit's spam filter flagged every link I tried to post from that domain. I had to restructure the entire post around the vercel.app deployment URL and the GitHub repo link. No direct link to my shop. No direct link to my brand. Just the game and the code.

That filtering taught me something useful. Reddit doesn't want you to sell. Reddit wants you to share. The post worked because the game itself was the content, not a wrapper around a sales pitch.

## Going multi-platform

Reddit was the spark, but it wasn't the only channel.

LinkedIn surprised me. I posted a shorter version framed around the build process and the anti-cheat engineering. Over 1,500 impressions, which for a post about a joke game on a professional network is more engagement than most "thought leadership" gets. Developers on LinkedIn actually responded to the technical details. They wanted to know how the anti-cheat worked, how the Earth Scale calculations mapped, how the HUD was pure CSS with no libraries.

The DEV.to submission lives on its own, competing in the April Fools challenge. Deadline is April 12. Winners announced April 16. I entered it under two categories: Best Ode to Larry Masinter (the author of RFC 2324, which gave us HTTP 418 "I'm a teapot") and Community Favorite.

The 14 countries in the leaderboard happened organically. I didn't target international audiences. I didn't translate anything. The game is visual, competitive, and the leaderboard is public. People shared it in their local dev communities and it spread.

## Cheater drama

Cheaters appeared within 2 hours of the Reddit post going up.

The first wave was simple. People opened browser dev tools, found the API endpoint, and submitted fabricated scores. Someone posted a 0.0000001 pixel deviation. The leaderboard was compromised before I'd finished my coffee.

Anti-cheat v1 was basic server-side validation. Reject submissions that are physically impossible given the container dimensions and pointer precision. It caught the most obvious fakes but left gaps.

Anti-cheat v2 added timing analysis. Real human interactions follow specific patterns. The drag duration, the number of pointer events, the velocity curve. A legitimate attempt takes at least a few seconds. A fabricated request arrives in milliseconds with no movement data.

Anti-cheat v3 added behavioral fingerprinting. The system now tracks pointer movement patterns, validates that the submission origin matches actual game state, and cross-references timing data against statistical baselines. Fabricated submissions get HTTP 418. (Yes, the teapot status code. Because if you're going to cheat at a joke game, you deserve to be called a teapot.)

Here's the thing I didn't expect: the anti-cheat became part of the story. People in the Reddit comments started discussing the detection methods. Someone tried to figure out the exact threshold for v3 rejection. The cat-and-mouse game between cheaters and the anti-cheat system generated more engagement than the actual game.

## The 418 teapot

Speaking of 418. I hid an easter egg in the game. If you find the trigger (I'm not going to spoil it here), a full 3D Utah teapot renders on screen as a particle cloud. About 2,500 particles. Full drag rotation, scroll zoom, pinch zoom on mobile, steam particles rising from the spout. All pure canvas, no 3D libraries.

It became a talking point. People shared screenshots of the teapot. They discussed the RFC 2324 reference. Someone pointed out that the teapot's particle count was close to the number of game attempts, which was a coincidence but a good one.

The lesson: easter eggs give people something to discover and share. Discovery creates a second wave of engagement that the main feature can't generate on its own. The game is the hook. The teapot is the story people tell their friends.

## Lesson 1: One hook beats 58 days of daily content

Before Center This Div, I ran RAXXO Studios' social presence the way every content strategist recommends. Daily posts. Consistent schedule. Raccoon mascot videos (Lexxa, our AI creative director). 58 days straight of daily publishing.

The result: steady but slow growth. Each post reaching a few hundred people. Incremental. Safe. Forgettable.

One game with a real hook (an impossible challenge with a public leaderboard) did more for brand visibility in 48 hours than two months of daily content did in total.

I'm not saying consistency doesn't matter. I'm saying consistency without a hook is just noise. The raccoon videos will continue. But now they have a flagship moment to orbit around.

The takeaway is simple. Find the hook first. The impossible threshold. The public leaderboard. The "nobody has ever won" claim that makes developers say "hold my coffee." Then build content around that hook. Not the other way around.

## Lesson 2: Free gets attention, but attention doesn't pay bills

134K views on Reddit. 1,500+ impressions on LinkedIn. 14 countries in the leaderboard. 3,000+ attempts. Organic sharing across developer communities worldwide.

Revenue from all of that: 0 EUR.

Zero orders. Zero conversions. Zero clicks to the shop (partly because Reddit filtered those links, but still).

This is the gap that every "build in public" narrative skips over. Attention is not revenue. Virality is not a business model. 134K people saw my game, and not a single one bought anything from raxxo.shop.

That's not the game's fault. The game did its job. It created awareness. The failure was mine. I didn't build a bridge between "this is fun" and "this studio makes tools you'd pay for."

## Lesson 3: Build the bridge

So I'm building it now.

RAXXO Studios is a one-person AI creative studio. I make tools for developers and creators. Products like Blueprint (a Claude Code configuration system), FULLMOON (an automated codebase audit), and Git Dojo (a terminal-based git learning system). All of them live at raxxo.shop.

Center This Div proved the studio can make things people want to use. The missing piece was connecting that proof to the products people could buy.

Here's what I'm doing differently going forward. Every free project now has a clear path to the shop. Not a hard sell. Not a popup. A natural mention. "This game was built by RAXXO Studios, here's what else we make." A footer link. A README mention. A byline in the leaderboard.

The game already has the RAXXO Studios branding in the UI. The GitHub repo links back. The DEV.to post credits the studio. But none of those touchpoints explain what the studio actually sells or why a developer would care.

The bridge isn't about turning free into paid. It's about making sure that when someone thinks "that studio makes cool stuff," they can find the cool stuff that costs money in one click.

## Lesson 4: Anti-cheat is a feature, not a bug

I initially thought of anti-cheat as damage control. Cheaters were corrupting the leaderboard, so I had to fix it. Three versions in a few days.

But then something clicked. The anti-cheat system generated more discussion than any other aspect of the project. People wanted to know how it worked. Developers analyzed the detection methods. The HTTP 418 response for cheaters became a meme in the comments.

When I shared the anti-cheat evolution on LinkedIn, that was the post that got real engagement. Not "I built a game." That's boring. "Cheaters broke my game in 2 hours so I built a 3-layer behavioral detection system" is a story. It has conflict. It has escalation. It has a satisfying resolution (the teapot response code).

The lesson applies beyond games. Your problems are your content. The things that go wrong, the things you have to fix, the systems you build in response. Those are the stories that resonate. Not the polished launch announcement. The messy, real, "here's what actually happened" retrospective.

## What actually works for growth

After a week of watching Center This Div spread, here's my updated mental model for what drives organic reach as a solo creator.

**Hook specificity matters.** "I built a game" gets ignored. "I built a game where you center a div to within 0.0001 pixels and nobody has ever won" gets clicks. The more specific and absurd the claim, the more people want to verify it.

**Public competition drives sharing.** The leaderboard is the engine. People don't just play. They screenshot their rank, share it, and challenge others. Every share is organic distribution.

**Open source builds trust.** The GitHub repo being public meant developers could verify the game was legit, study the code, and contribute. It also meant the anti-cheat was visible, which made the cat-and-mouse game more interesting.

**Platform constraints shape strategy.** Reddit filtering .shop domains forced me to lead with the product, not the brand. That turned out to be the better approach anyway.

**Problems are content.** The cheater drama generated more engagement than the launch itself. Document your problems publicly. People relate to the struggle more than the success.

## What's next

The DEV.to challenge deadline is April 12. Winners announced April 16. I'm competing in two categories and the community vote matters, so the next week is about getting the game in front of as many developers as possible.

Beyond the challenge, Center This Div stays live. The leaderboard keeps running. The success counter stays at zero. And every new attempt is another data point for the anti-cheat system to learn from.

For RAXXO Studios, this project validated something I suspected but couldn't prove: one remarkable thing beats a hundred forgettable things. The raccoon videos continue, but the content calendar now prioritizes hooks over frequency.

The game is free. The code is open. The leaderboard is waiting.

And no, you still can't center the div.

---

*Center This Div is live at [center-this-div.vercel.app](https://center-this-div.vercel.app). Source code at [github.com/raxxostudios/center-this-div](https://github.com/raxxostudios/center-this-div). Built by [RAXXO Studios](https://raxxo.shop).*
