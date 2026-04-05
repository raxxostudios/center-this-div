# Launching a Side Project on ProductHunt as a Solo Maker

**Author:** RAXXO Studios
**Read time:** 10 min
**Tags:** Business, Product Launch, Open Source, Indie Game, Build In Public

**TLDR:** I built a free CSS centering game for an April Fools challenge. It went viral on Reddit (134K views), got traction on LinkedIn, and now I am launching it on ProductHunt as a solo maker with no team, no network, and zero expectations of revenue. Here is what actually happened.

---

## Tomorrow I launch on ProductHunt. I have no idea what to expect.

In about 12 hours, "Can You Center This Div?" goes live on ProductHunt. It is a free, open-source browser game where you drag a div to the exact center of the screen. The success threshold is 0.0001 pixels. Nobody has ever won. The global success counter reads 0.

I am not launching a SaaS. I am not launching a startup. I am launching a joke that got out of hand.

This is what that actually looks like from the inside.

---

## How a joke became a project

At the end of March, DEV.to announced their April Fools 2026 challenge. The prompt was simple: build something absurd. I had 4 days.

The idea came from the most tired joke in frontend development. "Can you center a div?" Every developer has heard it. Every developer has done it. I wanted to flip it. What if centering a div was genuinely impossible?

So I set the success threshold to 0.0001 pixels. For context, a single pixel on a Retina display is about 0.5 physical pixels. The threshold is 5,000 times smaller than that. You cannot hit it. Nobody can. That is the entire joke.

Then the scope crept. Hard.

What started as a draggable box became a full JARVIS-style holographic HUD dashboard. Real-time deviation readouts updating at 60fps. A precision meter on a logarithmic scale. A global leaderboard powered by Neon Postgres. A radar sweep showing live player attempts from around the world. An "Earth Scale" feature that translates your pixel error into real-world distance (miss by 2.4 pixels and the app tells you that is 49,873 kilometers, further than the circumference of the planet).

I also wrote over 2,500 handwritten quotes based on how far off you are. Built a 3D teapot easter egg as a particle cloud with drag rotation, scroll zoom, and steam particles. Added share card generation on canvas for every platform. Light mode, dark mode, anti-cheat on the server side.

Four days of work. The tech stack is dead simple (Next.js 16, React 19, Neon Postgres, pure CSS). The execution is absurdly overengineered. That was the point.

The game went live on April 3rd at [center-this-div.vercel.app](https://center-this-div.vercel.app). Source code is public at [github.com/raxxostudios/center-this-div](https://github.com/raxxostudios/center-this-div).

---

## Reddit happened first

I posted on r/webdev, r/javascript, r/ProgrammerHumor, and r/nextjs. Within 48 hours, the numbers looked like this:

- 134,000 views across all posts
- 265 upvotes
- Dozens of comments (mostly people sharing their Earth Scale results)

The r/ProgrammerHumor crowd loved it. Developers were screenshotting their results and posting them in the comments. "I missed by 47,000 kilometers. Neither is my life centered." That kind of thing.

What surprised me: nobody asked about the tech. Almost nobody clicked through to the GitHub repo. The virality was entirely about the joke, not the code. People shared it because it was funny, not because it was well-built.

That was the first lesson. The engineering does not matter for distribution. The hook does.

---

## LinkedIn surprised me

I posted a stripped-down version on LinkedIn. No thread format. Just a short post with the core pitch: "I turned the most solved problem in CSS into an unsolvable game."

1,500+ impressions in the first 2 days. For a personal profile with no real following, that is decent. The engagement was different from Reddit. LinkedIn comments were more about the concept ("this is brilliant marketing") and less about actually playing the game.

A few people messaged me directly. One asked if I built it with AI. (Parts of it, yes. I run a one-person AI creative studio. That is the whole point.) Another asked how long it took. Four days, I told them. They did not believe me.

---

## The conversion problem nobody talks about

Here is the number that matters: 134,000 views. 0 orders.

Zero.

RAXXO Studios (that is me, one person, at [raxxo.shop](https://raxxo.shop)) sells digital products. Templates, tools, workflow systems for developers and creators. The game is free, but the shop exists. The brand is there. The link is there.

134K people saw the game. Some percentage clicked through to the studio. Nobody bought anything.

This is the part that "build in public" posts usually skip. Going viral feels great for about 6 hours. Then you look at your Shopify dashboard and it reads the same number as yesterday. The attention did not convert because there was no conversion path. A free game attracts people who want free games. They are not shopping for a 33 EUR workflow template.

I am not complaining. The game was never built to sell anything. But if you are a solo maker thinking "I just need to go viral once," let me save you the fantasy. Viral and revenue are different problems.

---

## Preparing for ProductHunt

ProductHunt has a different audience than Reddit. More startup founders, more indie hackers, more people who actually pay for tools. That is why I am launching there, even though the product is free.

Here is what I actually prepared:

**Screenshots.** PH requires gallery images. I made 4: the main HUD view, the result card, the Earth Scale overlay, and the 418 teapot easter egg. All 1270x760, clean, high contrast. The thumbnail is the JARVIS HUD with the precision meter front and center.

**Tagline.** "The most over-engineered centering challenge. 0 successes. Ever." 62 characters. Short enough to read without truncation.

**Description.** Three paragraphs. What it is, what makes it absurd, and the tech stack. No buzzwords. No "revolutionizing" anything. It is a game where you fail at centering a div. That is the pitch.

**Maker comment.** This is the first thing people read after clicking. I wrote it as a short backstory: DEV challenge, 4 days to build, scope creep from a draggable box to a full HUD dashboard, the fact that the success counter will never increment. PH audiences respond to build stories. They want to know what you went through.

**Social links.** GitHub repo, live URL, RAXXO Studios link. Nothing else. No Discord, no newsletter signup, no "join my community." I have a blog with 122 articles at [raxxo.shop/blogs/lab](https://raxxo.shop/blogs/lab) but I did not push it. Maker comments that feel like sales pitches get downvoted.

---

## The PH quirks nobody warns you about

If you have never launched on ProductHunt, here are the things that caught me off guard.

**You cannot launch immediately.** You schedule it. I wanted to post on April 5th, but PH launches are date-locked. You pick a date, and it goes live at midnight Pacific Time on that date. My launch is April 6th. That means I will be asleep (Berlin time) when it goes live.

**Images are mandatory.** No screenshots, no listing. PH will not let you submit without gallery images. I had to go back and create dedicated assets. The in-game screenshots I already had were the wrong aspect ratio.

**Your first comment is your pitch.** The maker comment is the most important piece of copy on the entire listing. It shows up right below the description. If it is generic ("Hey PH! Excited to share this!") you have already lost. I spent more time on the maker comment than on the description.

**The upvote game is real.** I have seen makers openly ask their network to upvote at midnight PT. I have seen Slack groups coordinated around launch times. I do not have that. No team. No maker community. No startup friends. Just the product page and whatever organic traffic finds it.

That last point is the solo maker reality. When a team of 5 launches on PH, they have 5 people sharing, 5 people's networks engaging, 5 people responding to comments in real-time. When I launch, it is just me, waking up 9 hours after the listing went live, hoping someone played the game and left a comment.

---

## Solo maker, for real

RAXXO Studios is a one-person operation. I design, I build, I write, I ship. The studio runs on AI-assisted workflows (that is literally what I sell). But AI does not upvote your ProductHunt listing. AI does not leave a genuine comment about how the game made them laugh. AI does not share your link in a Slack channel.

The solo maker advantage is speed. I went from idea to shipped game in 4 days. No standups, no design reviews, no "let's circle back on the scope." The solo maker disadvantage is everything else. Distribution, community, word of mouth. All of that requires other humans.

I have been writing about this stuff for a while. 122 articles on the RAXXO blog covering AI tools, creative workflows, developer productivity. Building an audience through content is slow. It compounds over months, not days. A ProductHunt launch is the opposite: one big spike, then silence.

The honest truth: I am launching on PH because it is the next platform on my list. Reddit is done. LinkedIn is done. DEV.to submission is live. ProductHunt is the last channel that makes sense for this project. After that, I move on to the next build.

---

## What I actually expect

Let me be direct about expectations, because most "launch day" posts are weirdly optimistic.

**I expect 50 to 200 upvotes.** That is the realistic range for a free open-source game from an unknown maker with no existing PH presence. Top 10 of the day would be a surprise. Top 5 would be a shock.

**I expect 500 to 2,000 new players.** Based on the Reddit-to-play conversion rate (roughly 3 to 5% of viewers actually tried the game), a modest PH showing should drive a few hundred players to the leaderboard.

**I expect 0 revenue.** The game is free. The studio sells other products, but the overlap between "person who found a free CSS game on ProductHunt" and "person who will buy a 33 EUR workflow template" is approximately zero. I am not delusional about this.

**I expect 2 to 3 good conversations.** The best thing about PH launches is not the upvotes. It is the comments from other makers who are building similar things. Those conversations have led to more interesting outcomes than any traffic spike.

---

## What I would do differently

If I could rewind to April 1st, here is what I would change.

**I would have built a conversion path into the game itself.** Not a popup. Not a modal. Something subtle, like "Built by RAXXO Studios. See what else we make." with a link that goes to a filtered collection page, not the homepage. The homepage is too broad. A curated page of free tools would have been a better landing spot.

**I would have launched on PH first, not Reddit.** Reddit gave me the biggest numbers but the least qualified traffic. PH audiences are more likely to explore a maker's other work. I burned the "new and novel" energy on a platform that does not reward follow-through.

**I would have recorded a 30-second demo video.** PH listings with video get significantly more engagement than static screenshots. I had the game running, the HUD looked great, and I still did not record a walkthrough. Pure laziness.

**I would have set up email capture.** Not on the game (that would break the experience). On the result card. After someone gets their score, a small "Get notified when I ship my next ridiculous project" link. Zero friction. I left that on the table.

---

## The meta-lesson

Here is what I keep coming back to. The game took 4 days to build. The launch prep (screenshots, copy, scheduling, social posts, blog article) took 2 more days. Distribution is not free. Even for a free product.

Every maker I know underestimates the work after "deploy." The code is maybe 40% of the effort. The other 60% is convincing anyone to look at it.

Center This Div works because the hook is instantly clear. You center a div. You fail. You share your failure. The virality is baked into the mechanic, not bolted on after the fact. That was luck, not strategy. I did not plan for the Earth Scale quotes to become the most shared feature. They just were.

If I were giving advice (and I am suspicious of anyone who gives advice after one semi-viral project), it would be this: build the share moment before you build the feature. The share card, the screenshot, the one-line summary that makes someone repost. That is the product. Everything else is infrastructure.

---

## What happens after tomorrow

The PH launch will spike traffic for 24 hours. Then it will drop back to baseline. That is how platforms work.

After that, Center This Div becomes what it was always going to be: a fun thing in my portfolio. A proof that over-engineering a joke can be its own reward. A line item on the RAXXO Studios project page that makes people smile.

I will write a follow-up with the actual PH numbers once the launch settles. Views, upvotes, comments, traffic, conversion (or lack thereof). No spin. Just data.

If you want to try the game before the launch: [center-this-div.vercel.app](https://center-this-div.vercel.app). Drag the div. Fail. Share your score.

The success counter reads 0. It will always read 0.

---

*RAXXO Studios is a one-person AI creative studio. More at [raxxo.shop](https://raxxo.shop).*
