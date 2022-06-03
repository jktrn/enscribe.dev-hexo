---
title: "byu/osint: OSINT Compilation"
date: 2022-05-28 18:02:04
tags:
- ctf
- byu
- osint
description: "All BYUCTF 2022 OSINT challenges. I'm sorry you guys had to go through this."
permalink: ctfs/byu/osint/osint-compilation/
thumbnail: https://enscribe.dev/image/banner-ctfs-byu.png
---

<style>
    .box {
        border: 1px solid rgba(100, 100, 100, .5);
        padding: 1rem;
        font-size: 90%;
        text-align: center;
    }
</style>

![Banner](/image/byu/banner.png)

### Intro

So, we played BYU CTF 2022. There were **9 OSINT challenges**. 9. It was absolutely party-time for a CTF player w/ OSINT-emphasis like me, and a tragedy for people who dislike the inherently guessy nature behind the genre. Our team managed to solve them all, so here was our (albeit flawed) thought process behind it.

**Important note**: Some of our lines of reasoning don't make sense at all. That's normal for this category, and it comes from a shit ton of brainstorming and guesswork. I'll try my best to include wrong paths that we took, but for the sake of brevity some of it will be omitted.

Oh, also, here is a haiku to express my carnal, passionate, burning hatred for OSINT:

> *"Eternal Resentment"*
Submerged in my tears,
I yearn for painless release.
The dreadful OSINT...
> -- enscribe

Thank you, and enjoy.

---

## 🐼 I don't dream about noodles, dad

<p class="box">
    Whose signature is found beneath Po's foot?<br>
    Flag format - <code>byuctf{Firstname_Lastname}</code><br>
    <br>
    <img src="/image/byu/po1.png" width=200 alt="Po from Kung Fu Panda">
    <sub>po.png</sub>
</p>

I did a quick [Google Lens](https://lens.google/) search with my phone with the keyword "BYU" attached and [this](https://universe.byu.edu/2012/09/27/5-campus-locations-you-didnt-know-existed/) article turned up:

<img width=600 src="/image/byu/po2.png" alt="The Daily Universe">
<center><sub>Credit to <i>The Daily Universe</i></sub></center>


> Jason Turner is a BYU computer science program graduate who works at DreamWorks and created all the data for Po’s character. The statue is a tribute to his success, as well as the University’s program and alumni.

Since the tribute is for Jason Turner, we can assume the signature is below his foot. The flag is `byuctf{Jason_Turner}`.

---

## 🌐 Oh The Vanity

<p class="box">
The vanity and audacity of these scammers and their phishing attacks are just getting ridiculous. I read an article this month about a new way to mask phishing campaigns. They even included this photo. Find the date the article was published.<br>
Flag format: <code>byuctf{mm-dd-yyyy}</code>
<br>
<br>
<img width=600 src="/image/byu/sharky1.png" alt="sharky.png">
<sub>sharky.jpg</sub>
</p>

Reverse Google Search with a "phishing" crib:

<img width=500 src="/image/byu/sharky2.png" alt="sharky google search">

The [Vanity URL on darkreading.com](https://www.darkreading.com/cloud/vanity-urls-could-be-spoofed-for-social-engineering-attacks)  was published on May 11th, 2022.
The flag is `byuctf{05-11-22}`.

---

## 🧗‍♀️ B0uld3r1ng

<p class="box">
I met a guy named Sam while climbing here in California. Can't remember what it's called though. Kinda looks like reptilian don't you think?
<br><br>
<img width=600 src="/image/byu/bouldering1.png" alt="b0uld3r1ng.png">
<sub>b0uld3r1ng.png</sub>
</p>

Once again, I used Google Lens to figure out where the location of this image was. Turns out to be a place called the `Lizard's Mouth Rock` in Santa Barbara County, California:

![Lizard's Mouth](/image/byu/bouldering2.png)

The image given to us is a direct screenshot of an image posted by Maps contributer [Jonathan P.](https://www.google.com/maps/contrib/104742787928495148360), although that has little relevance to the challenge.

Moving on, although we have the location of the image taken the flag is in *explicit format*, meaning that it's somewhere on the internet wrapped with `byuctf{...}`. We noticed that a guy named "Sam" was mentioned, so we guessed that we could find him leaving a review of the place on a platform.

We checked through the following platforms: Yelp, Google Reviews, TripAdvisor, AllTrails⁠—yet, we couldn't find a recent reviewer by the name of Sam. Luckily, one of my team members searched up "Bouldering Lizard's Mouth" (based on the challenge name) and happened to stumble across [this website](https://www.mountainproject.com/area/105885134/the-lizards-mouth):

![Bouldering Website](/image/byu/bouldering3.png)

<center><sub><a href="https://www.mountainproject.com/area/105885134/the-lizards-mouth">The Lizard's Mouth</a> on Mountain Project</sub></center>

We scrolled down to the "Reviews" section and found this:

![Bouldering Comments](/image/byu/bouldering4.png)

Hey, look! A Sam! Let's check out their [profile](https://www.mountainproject.com/user/201354492/samuel-sender):

![Samuel Profile](/image/byu/bouldering5.png)

The flag is `byuctf{ju5t_5end_1t_br0_v8bLDrg}`.

---

## 💧 Squatter's Rights

<p class="box">
Somehow, somewhere, something in this picture has a flag, but my friend Blue Orca won’t tell me where it is!!!! Can you help me??
<br><br>
<img width=600 src="/image/byu/squatter1.png">
<sub><i>geoguesser.png</i></sub>
</p>

Hey, look! Another Google Lens problem! Although there's a lot of blue water towers out there, I luckily stumbled across one that looked really similar in Flint, Michigan:

<img width=300 src="/image/byu/squatter2.png">

Going to the [webpage](http://www.eureka4you.com/water-michigan/MI-Flint1.htm), it mentions that this water tower is in "Genesee County. Mid Michigan.", so with a quick Maps search I stumble across the "Wyatt P. Memorial Water Tower":

<img width=600 src="/image/byu/squatter3.png">

This is where the rabbit hole begins. I looked around the reviews section of this place and found the absolute weirdest, most hilarious reviews of all time:

> Robert Skouson
In all my days, I have never seen such a magnificent water tower.  Being in its presence has given me powers beyond comprehension.  I have mastered flight in the downward direction.  I have 100% recall of events that happened to me in the last 5 minutes.  I have also discovered I am completely invisible when no one is looking.   This water tower has changed my view of who I am, and my ultimate potential.

This guy even claims it to be holy water:

> Nicholas Martinez
This water from Wyatt P. Memorial Water tower has changed the way I see water, and drink it. Everytime I see this water tower, it makes me want quality water. Forget Poland Spring or Fiji. This is quality water! You know how in the Book of John Chapter 2, the Savior Jesus Christ turned water into wine? Well he actually turned already good wine to water from Wyatt P. Memorial Water tower.

This one might be my favorite:

> McKay Lush
Professionally speaking as a water tower enthusiast, this has to be one of the best water towers that I've ever visited and I've visited thousands. The divine structure of the 10 legs leading to the plumply, robust water basin is enough to get any man excited. The satisfying twang as you bang the side wall sends shivers down even the most hardened of souls. Never before has such a feat been attempted and accomplished. Truly this should be the EIGHTIETH WONDER OF THE WORLD.

I actually stumbled across the person it's named after, `Wyatt Pangerl`, and I was super curious as to what the hell was going on:

![Wyatt](/image/byu/squatter4.png)

So I opened a ticket. Turns out, this Wyatt guy, a member of their team, managed to get the water tower named after himself after a series of divine, godlike social engineering strategies (assumedly to the county) and exploitation of the [Squatter's Rights](https://homeguides.sfgate.com/squatters-rights-law-california-45887.html) law in California. He also claimed the location on Google Maps and put his burner phone there as well, which we called (he didn't pick up). When I found his Facebook (will not disclose), I saw a multitude of his friends commenting hilarious crap, calling him "ICONIC." and a "LEGEND." for managing to make it happen.

Yet, there was no flag.

I continued to look around and managed to fall deeper into the rabbit hole, OSINTing everything between the model of [Wyatt's car](https://www.kbb.com/chrysler/crossfire/2006/), a Chrysler Crossfire 2006 (🤣) to where his parents file taxes... I even managed to get an award from a head admin for being a dumbass:

![Award](/image/byu/squatter5.png)

Then, while on the go, I checked the location on my phone... And look what we've got:

<img src="/image/byu/squatter6.png" width=400>

Apparently for whatever stupid, scatter-brained, vapid, moronic reason this "From the owner" section isn't on Google Chrome. Screw you Wyatt, and your majestic, plump, baby-blue water  tower. The flag is `byuctf{h0w_d1d_1_st34l_4_w4t3r_t0w3r}`. Once again, screw you Wyatt. I hope your taxes are messed up forevermore.

**Edit (06/02/22)**: This "From the owner" section is [available on Desktop Google Chrome](https://www.google.com/search?q=Wyatt+P.+Memorial+Water+Tower), but only accessible if the knowledge panel is visible, which wasn't the case for me.

---

## 💾 Okta? More like OhNah

<p class="box">Recently, the group known as LAPSUS$ released indications they breached Microsoft & one of the Largest SSO companies, Okta. In some of their leaks they hinted that "most of the time if you don't do anything like __________, you won't be detected".
<br><br>
flag: <code>byuctf{answer_Timestamp in format: HH:MM}</code> two word answer seperated by an underscore.
</p>

Looks like a challenge regarding an imfamous hacking group. Seeing that the flag asks for a timestamp and the language is pseudo-colloquial, I'd safely assume that this text mentioned somewhere came from a messaging board. I downloaded *Telegram*, their main method of communication with the real world, joining their [announcements board](https://t.me/minsaudebr), yet upon a <kbd>Ctrl</kbd> + <kbd>F</kbd> I couldn't find this message anywhere. Their board mentions a [group chat](https://t.me/saudechat), but it was recently purged and terminated. When the admin confirmed that this wasn't the intended solution, I moved towards looking for screenshots surrounding the Okta leak. Our team found this [tweet from John Hammond](https://twitter.com/_JohnHammond/status/1506166671664463875) after a while:

<blockquote class="twitter-tweet" align=center width=500 data-lang="en" data-theme="dark"><p lang="en" dir="ltr">even da big ones<br>[shocked pikachu] <a href="https://t.co/YsvMMNQDPG">pic.twitter.com/YsvMMNQDPG</a></p>&mdash; John Hammond (@_JohnHammond) <a href="https://twitter.com/_JohnHammond/status/1506166671664463875?ref_src=twsrc%5Etfw">March 22, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

The flag is `byuctf{port_scanning_11:22}`.

A hint was later added to the challenge:
> think screenshots! it is not on telegram but another platform with that same first letter. tweeted by a famous red head i think

Would have been easier. Love you, John Hammond.

---

## 🔪 Murder Mystery

<p class="box">While searching for secrets of the past, you find a scrap of paper that contains the following information:<br><br>
<code>0110111001110010011010000111000001101001011001000100110001001011110100001111</code><br>
June 29, 1902<br><br>
Because you’re great at OSINT, you trace this information back to a famous inscription. What is that inscription?<br>
Flag - <code>byuctf{inscription_with_underscores}</code><br>
Note, the flag will not include the name or dates found in the inscription.
</p>

Instantly, we moved to [Cyberchef](https://gchq.github.io/CyberChef/) for the binary conversion, and it resulted in `nrhpidLKÐ`. We thought it was garbage at first, until a teammate noticed "NRHP ID" within the string, which is related to the [National Register of Historic Places](https://history.idaho.gov/nrhp/). Since there's a historic date also in the description, we can immediately conclude that this is the correct path to take. We isolated the last part and converted it into decimal instead - `80002319`.

Following the trail for `NRHP ID 80002319`, we found this [UpWiki Page](https://en.upwiki.one/wiki/Jesse_James_Home_Museum) About the "Jesse James Home Museum", which is the location registered under this ID.

When I looked up "jesse james famous inscription", I found a [Smithsonian Magazine](https://photocontest.smithsonianmag.com/photocontest/detail/the-original-grave-site-of-jesse-james-located-in-the-yard-of-the-james-fam/) page that photographs Mr. James; grave:

<img src="/image/byu/mystery1.png" width=600>

Removing the dates and names as the description specifies, the flag is `byuctf{murdered_by_a_traitor_and_coward_whose_name_is_not_worthy_to_appear_here}`.

---

## 🎂 Buckeye Billy Birthday

<p class="box">
Buckeye Billy, our lovely, nutty, history loving friend, has a birthday coming up! Billy is as cryptic as can be, and we have no idea what to get him for his birthday. We did find three hints on written on his desk. Can you help us find where we should buy a gift from?<br>
<a href="https://mywordle.strivemath.com/?word=sokhc">Hint 1</a>  <a href="https://mywordle.strivemath.com/?word=yocod">Hint 2</a>  <a href="https://mywordle.strivemath.com/?word=lffep">Hint 3</a><br>
format: <code>byuctf{storename}</code>
</p>


I took a look at the three hints, and they were Wordle games that resulted in `WATER`, `CALLS`, and `PROBE`. Since we were looking for a shop (meaning a location), we immediately turned to [what3words](https://what3words.com/) and stumbled across [this location](https://what3words.com/water.calls.probe) in Charlotte, Ohio:

![Water Calls Probe](/image/byu/bday1.png)

We tried a couple of stores around the area to no avail, until an admin told us in a ticket that we were in the wrong place. By extension, we decided to try out various permutations of `water`, `calls` and `probe`:

| what3word address                                        | Location                  |
| -------------------------------------------------------- | ------------------------- |
|⠀| |
| [///water.calls.probe](https://w3w.co/water.calls.probe) | Charlotte, North Carolina |
| [///calls.water.probe](https://w3w.co/calls.water.probe) | Detroit, Michigan         |
| [///probe.water.calls](https://w3w.co/probe.water.calls) | Houston, Texas            |
| [///water.probe.calls](https://w3w.co/water.probe.calls) | Cincinnati, Ohio          |
| [///calls.probe.water](https://w3w.co/calls.probe.water) | Albuquerque, New Mexico   |
| [///probe.calls.water](https://w3w.co/probe.calls.water) | Eastbourne, London        |

Most of them were bogus except [///water.probe.calls](https://what3words.com/water.probe.calls), which was on E. McMillan St, Cincinnati, Ohio. We assumed it was correct (and admin later confirmed) because the nickname "Buckeye Billy" comes from the fact that he loves the [Ohio State University Buckeyes](https://ohiostatebuckeyes.com/) football team. (Bonus: The Ohio Buckeye is a type of nut, and the description says that he is "nutty"). Our teammate somehow connected "history-loving" to old stores in Cincinnati, Ohio, and upon a Google search we found:

![Graeters Google Search](/image/byu/bday2.png)

The flag is `byuctf{graeters}`. This was a guessy challenge, so don't feel dumb. I felt dumb too.

---

## 💬 Buckeye Billy Blabbin'

<p class="box">Buckeye Billy discovered social media. And probably posts too much. Try to see what you can find. for this problem and others!<br>
Flag will be completely visible once solved! You will see <code>byuctf{}</code>.
</p>

Step 0 is to find his social media account, which we did by searching "Buckeye Billy" on [Twitter](https://twitter.com/William_buckeye):

![Buckeye Twitter](/image/byu/blabbin1.png)

We scoured his Twitter account on the Wayback Machine for it to no avail (and even found some [deleted stuff](https://web.archive.org/web/20220415232856/https://twitter.com/William_buckeye/status/1515109844771999745) from a previous internal CTF).

I slowly began to despise him... that Buckeye Billy. That stupid, perfectly circular nuthead with the even stupider BYU sombrero. We gave up on the challenge and I cried to the admin until he got annoyed and agreed to post a global hint:

> the more billy tweeted about something, the more of a hint it might be. The flag is on his account someplace.

He tweeted a lot about song lyrics:

<img src="/image/byu/blabbin2.png" width=400 alt="Song Tweets">

We decided it would be best to create a list of songs, in addition to counting occurrences of topics he discussed (for brainstorming purposes). We ended up with this list:

![Occurences List](/image/byu/blabbin3.png)

Hey, check that out in the Songs list. "3 Words", "One Place", "Greater", "Ice Cream"? That sounds a lot like our previous challenge, `Buckeye Billy Birthday`. Looks like these were meant to be solved in tandem. By extension, "Man in the Mirror" and "Magic Mirror" were also hinted at, and we found a [tweet](https://twitter.com/William_buckeye/status/1515113600750219265) of Billy posing in front of a mirror with a BYU hat. Uncoincidentally, this is the only mention of BYU in his entire profile (I believe):

<blockquote align=center class="twitter-tweet" data-lang="en" data-theme="dark"><p lang="en" dir="ltr">thanks <a href="https://twitter.com/byu_cosmo?ref_src=twsrc%5Etfw">@byu_cosmo</a> for the great hat! <a href="https://t.co/IbPentkUgE">pic.twitter.com/IbPentkUgE</a></p>&mdash; #1 Buckeye Fan billy (@William_buckeye) <a href="https://twitter.com/William_buckeye/status/1515113600750219265?ref_src=twsrc%5Etfw">April 15, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

My team used steganography tools on this image, and lo and behold:

![Flag in Steganography Analysis](/image/byu/blabbin5.png)

The flag is `byuctf{t@lk_0sinty_t0_m3}`. Also an extremely guessy challenge. Screw you, Buckeye Billy. And Wyatt too, if you're reading.

---

## 🎶 43

<p class="box">
It’s at your fingertips!! Who made this code?<br><br>
<code>S fsu om yjr aogr 3"45`</code><br><br>
format: <code>byuctf{blank_blank}</code></p>

Looks like something the [DCode Cipher Identifier](https://www.dcode.fr/cipher-identifier) could figure out:

```text
dCode's analyzer suggests to investigate:
Keyboard Shift Cipher ■■■■■■■■■▪
Substitution Cipher ▪
Shift Cipher ▪
Homophonic Cipher ▫
ROT Cipher ▫
```

I threw it into their [Keyboard Shift Cipher](https://www.dcode.fr/keyboard-shift-cipher) and got this:

```text
qwerty → A day in the \ife 2:34
qwerty ← D gdi p, ukt spht 4A56
qwerty ↓↻ W va7 ln ume slf4 e:v6
qwerty ↑4 S fsu om yjr aogr 3_45
qwerty ↓4 S fsu om yjr aogr 3{45
```

"A Day in the Life" is a song by the [Beatles](https://www.youtube.com/watch?v=usNsCeOV4GM) (a fascinatingly good one too), and I took a look the decoded timestamp `2:34` in the music video:

![Beatles video](/image/byu/43-1.png)

Although I couldn't find who the person in the timestamp was, someone in the comments named the individuals at timestamps:

![Comments](/image/byu/43-2.png)

![Nesmith](/image/byu/43-3.png)

The guy at 3:31 is the same as the guy at 2:34, so it's Michael Nesmith from the Monkees.

Looking up "Monkees 43" on Google, we discover that there's actually an old website called [monkeesrule43.com](https://www.monkeesrule43.com/articles.html).

This is where you guess all the names of the Monkees. Not sure of the logical thought process yet. Flag is `byuctf{micky_dolenz}`.

**Edit (06/02/22)**: The intended solve was to look at [monkeesrule43.com](https://www.monkeesrule43.com/articles.html). In their [FAQ page](https://www.monkeesrule43.com/faq.html), Question 13 asks:

> 13.)  What does the weird writing on Micky's page of the Monkees' 2001 summer tourbook mean?
> -Micky's page is written in a computer keyboard code. Each letter written stands for the letter to the left of it on a computer keyboard. For example, "Zovlu" means Micky & "Jo!" means Hi!

Damn you, Micky.

---

### Solvers

- 🐼 I don’t dream about noodles, dad: **enscribe**
- 🌐 Oh The Vanity: **sahuang**
- 🧗‍♀️ B0uld3r1ng: **sahuang**, enscribe, Battlemonger
- 💧 Squatter’s Rights: **enscribe**, sahuang
- 💾 Okta? More like OhNah: **Battlemonger**, enscribe
- 🔪 Murder Mystery : **Battlemonger**
- 🎂 Buckeye Billy Birthday: **Battlemonger**, sahuang, enscribe
- 💬 Buckeye Billy Blabbin’: **Battlemonger**, enscribe
- 🎶 43: **Battlemonger**, neil, enscribe

<sub>Thanks Battlemonger for carry!</sub>
