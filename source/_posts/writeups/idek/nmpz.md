---
title: "idekCTF 2022: NMPZ (OSINT)"
date: 2023-01-15 18:26:32
categories:
- ctfs
- idek
- osint
tags:
- geosint
description: "\"No moving, panning, or zooming\" — a GeoGuessr-esque OSINT challenge from idekCTF 2022 testing geographical literacy."
short_description: "\"No moving, panning, or zooming\" — a GeoGuessr-esque OSINT challenge testing geographical literacy."
category_column: "idek/osint"
permalink: ctfs/idek/osint/nmpz/
thumbnail: /asset/banner/banner-nmpz.png
---

![Banner](/asset/idek/banner.svg)

### Intro

Recently my team ([Project Sekai](https://sekai.team/)) and I played [idekCTF 2022*](https://ctftime.org/event/1839) (with an asterisk... because it's 2023), which was an extraordinarily "race against the clock"-esque CTF with a ridiculously large pool of challenges - 58 of them, over a 48-hour runtime. We managed to snag a 1st place finish after countless hours of *not* touching grass (despite analyzing it throughout this challenge), and I would like to share my personal favorite OSINT challenge of the competition - "NMPZ", an acronym in the [GeoGuessr](https://geoguessr.com/) community for "no **moving**, **panning**, or **zooming**." Although my team hadn't 100% correctly solved the challenge (we inferred part of the flag), here was our thought process tackling it. Enjoy!

---

![NMPZ Banner](/asset/idek/banner-nmpz.svg)

<div class="flex-container">
<div>
{% challenge %}
title: NMPZ
level: h2
size: 110%
authors: jazzzooo
genre: osint
points: 474
description: |
    Are you as good as Rainbolt at GeoGuessr? Prove your skills by geo-guessing these 17 countries.
files: '[nmpz.zip](/asset/idek/nmpz.zip)'
{% endchallenge %}
</div>
<div>
{% ccb html:true terminal:true %}
<span class="meta prompt_">$</span> <span class="built_in">tree</span>
<span class="string">.</span>
<span class="string">├──</span> <span class="number">1.png</span>
<span class="string">├──</span> <span class="number">2.png</span>
...
<span class="string">├──</span> <span class="number">17.png</span>
<span class="string">└──</span> <span class="meta prompt_">README</span>
{% endccb %}
</div>
</div>

The provided `README` file contains the following:

{% ccb html:true caption:"README(.txt)" gutter1:1-4 %}
Figure out in which country each image was taken.
The first letter of every country's name will create the flag.
Countries with over 10 million inhabitants will have a capital letter.
Countries with less than one million inhabitants become an underscore.
{% endccb %}

Here is a table of the provided example flag (`idek{TEST_flAg}`), and how the flag construction works:

<div class="table-center">

| Image | Country of Origin                                                                    | [Population](https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population) | Flag |
|-------|--------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|------|
| ⠀     |                                                                                      |                                                                                              |      |
| 1.png | {% countryflag Turkey %} [Turkey](https://en.wikipedia.org/wiki/Turkey)              | 84,680,273 ([2021](https://en.wikipedia.org/wiki/Demographics_of_Turkey))                    | `T`  |
| 2.png | {% countryflag Ecuador %} [Ecuador](https://en.wikipedia.org/wiki/Ecuador)           | 18,145,568 ([2023](https://en.wikipedia.org/wiki/Demographics_of_Ecuador))                   | `E`  |
| 3.png | {% countryflag Spain %} [Spain](https://en.wikipedia.org/wiki/Spain)                 | 47,615,034 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Spain))                     | `S`  |
| 4.png | {% countryflag Thailand %} [Thailand](https://en.wikipedia.org/wiki/Thailand)        | 66,883,467 ([2023](https://en.wikipedia.org/wiki/Demographics_of_Thailand))                  | `T`  |
| 5.png | {% countryflag VA %} [Vatican City](https://en.wikipedia.org/wiki/Vatican_City)      | 825 ([2019](https://en.wikipedia.org/wiki/Vatican_City#Demographics))                        | `_`  |
| 6.png | {% countryflag Finland %} [Finland](https://en.wikipedia.org/wiki/Finland)           | 5,528,796 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Finland))                    | `f`  |
| 7.png | {% countryflag Lithuania %} [Lithuania](https://en.wikipedia.org/wiki/Lithuania)     | 2,839,020 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Lithuania))                  | `l`  |
| 8.png | {% countryflag Argentina %} [Argentina](https://en.wikipedia.org/wiki/Argentina)     | 47,327,407 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Argentina))                 | `A`  |
| 9.png | {% countryflag Georgia %} [Georgia](https://en.wikipedia.org/wiki/Georgia_(country)) | 3,688,600 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Georgia_(country)))          | `g`  |

</div>
<br>

We're given... 17 different screenshots of locations on [Google Street View](https://www.google.com/streetview/). Currently, our goal is to find the country of origin for each and every single one of these screenshots, and to combine each letter together to form the flag (as per the `README`). Here's a quick preview of all of them:

<div style="height:400px; overflow-y: auto; margin: 1rem 0; background-color:rgb(29,29,29); padding:1rem; border-radius:5px;">

{% grid columns:3 no_container:true %}
1.png:
    description: |
        Captured: March 2022<br><br>
        ![1.png](/asset/idek/1.png)
2.png: 
    description: |
        Captured: November 2011<br><br>
        ![2.png](/asset/idek/2.png)
3.png:
    description: |
        Captured: June 2019<br><br>
        ![3.png](/asset/idek/3.png)
4.png:
    description: |
        Captured: December 2014<br><br>
        ![4.png](/asset/idek/4.png)
5.png:
    description: |
        Captured: September 2021<br><br>
        ![5.png](/asset/idek/5.png)
6.png:
    description: |
        Captured: August 2013<br><br>
        ![6.png](/asset/idek/6.png)
7.png:
    description: |
        Captured: November 2014<br><br>
        ![7.png](/asset/idek/7.png)
8.png:
    description: |
        Captured: April 2013<br><br>
        ![8.png](/asset/idek/8.png)
9.png:
    description: |
        Captured: August 2014<br><br>
        ![9.png](/asset/idek/9.png)
10.png:
    description: |
        Captured: November 2014<br><br>
        ![10.png](/asset/idek/10.png)
11.png:
    description: |
        Captured: September 2012<br><br>
        ![11.png](/asset/idek/11.png)
12.png:
    description: |
        Captured: November 2022<br><br>
        ![12.png](/asset/idek/12.png)
13.png:
    description: |
        Captured: October 2020<br><br>
        ![13.png](/asset/idek/13.png)
14.png:
    description: |
        Captured: June 2015<br><br>
        ![14.png](/asset/idek/14.png)
15.png:
    description: |
        Captured: March 2012<br><br>
        ![15.png](/asset/idek/15.png)
16.png:
    description: |
        Captured: June 2016<br><br>
        ![16.png](/asset/idek/16.png)
17.png:
    description: |
        Captured: June 2013<br><br>
        ![17.png](/asset/idek/17.png)

{% endgrid %}

</div>

Let's get to work.

---

### 1.png

![1.png](/asset/idek/1.png)

Looks like we're on a waterfront walkway with a beautiful view of a harbor. A quick [Google Lens](https://lens.google/) results in a "[Muerta da Urca](https://www.google.com/search?q=mureta+da+urca)" in Rio de Janeiro, {% countryflag Brazil %} **[Brazil](https://en.wikipedia.org/wiki/Brazil)**:

![1-lens.png](/asset/idek/1-lens.png)

Oh, yeah, there's totally a World Wonder in the background by the way... [Christ the Redeemer](https://en.wikipedia.org/wiki/Christ_the_Redeemer_(statue)):

{% cimage src:/asset/idek/1-christ.png width:500px %}

Since Brazil had a population of ~215 million in [2022](https://en.wikipedia.org/wiki/Demographics_of_Brazil), it'll be capitalized in the flag. For brevity's sake, I'll be omitting the populations from here on out - however, I'll still include them (alongside sources) in the upcoming progress tables.

Trivial! 1/17 down.

{% info %}
**Flag Progress**: `idek{B`\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_`}`
{% endinfo %}

---

### 2.png

![2.png](/asset/idek/2.png)

Wow... this is the most {% countryflag Russia %} [**Russia**](https://en.wikipedia.org/wiki/Russia) photo I've ever seen! If you don't believe me, here's a Google Lens of the very evident [St. Basil's Cathedral](https://en.wikipedia.org/wiki/Saint_Basil%27s_Cathedral) looming in the background:

![2-lens.png](/asset/idek/2-lens.png)

{% info %}
**Flag Progress**: `idek{BR`\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_`}`
{% endinfo %}

---

### 3.png

![3.png](/asset/idek/3.png)

Finally, no more trivial landmarks in the background! Looks like we're now on the roadside of some European business-y area. I quickly noticed a name on the brown sign attached to the streetlight:

{% cimage src:/asset/idek/3-zoom.png width:500px %}

It reads "Kalamaja", which upon a quick Google results in a small city district in [Tallinn](https://en.wikipedia.org/wiki/Tallinn), {% countryflag Estonia %} [**Estonia**](https://en.wikipedia.org/wiki/Estonia): 

![3-google.png](/asset/idek/3-google.png)

{% info %}
**Flag Progress**: `idek{BRe`\_\_\_\_\_\_\_\_\_\_\_\_\_\_`}`
{% endinfo %}

---

### 4.png

![4.png](/asset/idek/4.png)

The middle of nowhere... a classic. Let's see what the Google Lens yields:

![4-lens.png](/asset/idek/4-lens.png)

The first result identifies a [Stuart Highway](https://en.wikipedia.org/wiki/Stuart_Highway), which runs straight through central {% countryflag Australia %} [**Australia**](https://en.wikipedia.org/wiki/Australia) (a.k.a. the middle of nowhere). Also, if you look closely, there's a reflector sign in the center of the photo which looks exactly like the Australian bollard on [geohints.com](https://geohints.com/Bollards), a resource for GeoGuessr players: 

<div class="flex-container">
<div>{% cimage src:/asset/idek/4-bollard.png sub:"Zoomed in bollard" %}</div>
<div>{% cimage src:/asset/idek/4-comparison.png sub:"GeoHints Australian bollard" %}</div>
</div>

Additionally, a key "Australian" identifier would be the orangey dirt on the roadsides, which is common around the country.

{% info %}
**Flag Progress**: `idek{BReA`\_\_\_\_\_\_\_\_\_\_\_\_`}`
{% endinfo %}

---

### 5.png

![5.png](/asset/idek/5.png)

This one was extraordinarily rough. According to the author themselves:

{% quote "- jazzzooo" %}
its hilarious that every single person got one country wrong, but the letter was the same so it didnt matter... you included ;)
{% endquote %}

...and apparently this was the one that everyone was messing up!

Let's move on to my approach. I noticed a few things:

![5-lettered.png](/asset/idek/5-lettered.svg)

<ol class="upper-alpha">
    <li>The extraordinarily ambiguous "Third St" on top of the grey SUV in front of us</li>
    <li>The words "Al-Siraad Plaza" plastered to the side of the grey building on the left</li>
    <li>The words "Ab-Furqan" on the poster above the white/green checkered wall on the left</li>
    <li>Arabic script on the walls of the white/green building on the right</li>
    <li>An advertisement for "Peri Peri Pizza" on the far right</li>
    <li>Consistently yellow license plates</li>
</ol>

All signs point to an Arabic-speaking country. In addition, since we solved each image out of order (and knew the next character would be an underscore) the flag contained the word segment `BREA-`, which only had three possibilities to form a proper word: `BREAD`, `BREAK`, and `BREAM` (which we ruled out due to unlikeliness). As a result, we simply guessed the country to be {% countryflag Kazakhstan %} [**Kazakhstan**](https://en.wikipedia.org/wiki/Kazakhstan) (even though it doesn't have official Google Street View coverage and Arabic isn't a nationally recognized language).

#### GeoGuessr Meta: The Infamous Snorkel

Now... here is the absolutely crazy part. After solving the challenge, the author revealed to me what the actual country was:

{% quote "- jazzzooo" %}
do you see the little snorkel on the right front corner of your car in 5.png?
i implore you to google "geoguessr snorkel" haha
{% endquote %}

I had no idea what they were talking about, so I zoomed in on the car and lo and behold, snorkel:

{% cimage src:/asset/idek/5-snorkel.png width:400px %}

I did a quick Google search, and found a tweet from the official GeoGuessr [Twitter](https://twitter.com/geoguessr/) account:

{% twitter url:'twitter.com/geoguessr/status/1564621460034969606' width:400 %}

Apparently, this was one of the strategies that GeoGuessr pros use to quickly identify countries: using the car the Photo Sphere was taken from to their advantage, considered to be part of the "meta" game. The "{% countryflag Kenya %} [**Kenyan**](https://en.wikipedia.org/wiki/Kenya) Snorkel" was one of the more infamous ones, and I had no idea it existed. I was absolutely blown away.

{% info %}
**Flag Progress**: `idek{BReAK`\_\_\_\_\_\_\_\_\_\_\_\_`}`
{% endinfo %}

---

### 6.png

![6.png](/asset/idek/6.png)

Ah, yes, another "middle of nowhere." This time, however, it's a bit easier! Here's the Google Lens yield:

![6-lens.png](/asset/idek/6-lens.png)

Yep, that's definitely {% countryflag Iceland %} [**Iceland**](https://en.wikipedia.org/wiki/Iceland). Here are some things you use to identify Iceland:

- 99% of the time there will be overcast skies
- Off-green, almost yellow-ish grass. Here is an example from [GeoHints](https://geohints.com/Scenery):

![6-geohints.png](/asset/idek/6-geohints.png)

- Bollards! These ones are bright yellow with a diagonally pointed top, and a white reflector:

<div class="flex-container">
<div>{% cimage src:/asset/idek/6-bollard.png sub:"Zoomed in bollard" %}</div>
<div>{% cimage src:/asset/idek/6-comparison.png sub:"GeoHints Icelandic bollard" %}</div>
</div>

This character will be an underscore (`_`), since the population of Iceland is 376,000 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Iceland)).

{% info %}
**Flag Progress**: `idek{BReAK_`\_\_\_\_\_\_\_\_\_\_\_`}`
{% endinfo %}

---

### 7.png

![7.png](/asset/idek/7.png)

Wow... I've never seen a neighborhood this massive with not a single piece of foliage in sight. Here's the Google Lens output:

![7-lens.png](/asset/idek/7-lens.png)

Definitely [Ulaanbaatar](https://en.wikipedia.org/wiki/Ulaanbaatar), {% countryflag Mongolia %} [**Mongolia**](https://https://en.wikipedia.org/wiki/Mongolia)! We confirmed it with the license plate of the car on the left:

<div class="flex-container">
<div>{% cimage src:/asset/idek/7-plate.png width:400 sub:"Zoomed in plate" %}</div>
<div>{% cimage src:/asset/idek/7-comparison.png width:400 sub:"Generic Mongolian plate" %}</div>
</div>

{% info %}
**Flag Progress**: `idek{BReAK_m`\_\_\_\_\_\_\_\_\_\_`}`
{% endinfo %}

---

### 8.png

![8.png](/asset/idek/8.png)

This was arguably one of the hardest to solve (and one that we got incorrect). Here's the Google Lens output:

![8-lens.png](/asset/idek/8-lens.png)

No idea! Our original guess was the {% countryflag Philippines %} [Philippines](https://en.wikipedia.org/wiki/Philippines) or {% countryflag Indonesia %} [Indonesia](https://en.wikipedia.org/wiki/Indonesia), but `BReAK_m(P/I)_` didn't make any sense. We moved on to the next image and discovered it was an underscore (`_`), and eventually came to the conclusion that the country had to either start with `E` or `Y` to make any sense (to make either `BReAK_m`(`Y`/`y`) or `BReAK_m`(`E`/`e`)). The only recognized country which starts with Y is {% countryflag Yemen %} [Yemen](https://en.wikipedia.org/wiki/Yemen), which was an unlikely guess because of the consistent greenery, foliage, and hills (in the Arabian Peninsula, practically all desert). 

In accordance with `E`/`e` as the only likely character, we eventually settled on either {% countryflag "El Salvador" %} [**El Salvador**](https://en.wikipedia.org/wiki/El_Salvador) or {% countryflag Ecuador %} [**Ecuador**](https://en.wikipedia.org/wiki/Ecuador), so this character would be either uppercase or lowercase.

{% info %}
**Flag Progress**: `idek{BReAK_m(E/e)`\_\_\_\_\_\_\_\_`}`
{% endinfo %}

---

### 9.png

![9.png](/asset/idek/9.png)

A Photo Sphere in the middle of the sea! Looks like we're in a pretty large city, and it's giving off tourist resort-y vibes. Here's the Google Lens output:

![9-lens.png](/asset/idek/9-lens.png)

It looks like it's identified the cityscape as belonging to {% countryflag Monaco %} [**Monaco**](https://en.wikipedia.org/wiki/Monaco). It's even identified the facade of one of the buildings in the city as the [Opéra de Monte-Carlo](https://en.wikipedia.org/wiki/Op%C3%A9ra_de_Monte-Carlo):

![9-facade.png](/asset/idek/9-facade.png)

Let's add an underscore to the flag, since Monaco's population is 37,308 ([2016](https://en.wikipedia.org/wiki/Demographics_of_Monaco)).

{% info %}

**Flag Progress**: `idek{BReAK_m(E/e)_`\_\_\_\_\_\_\_\_`}`

{% endinfo %}

---

### 10.png

![10.png](/asset/idek/10.png)

We're now given a small town in the hills of an assumingly European country (overall house aesthetic). Here's the Google Lens output:

![10-lens.png](/asset/idek/10-lens.png)

Lens results are giving me either {% countryflag Switzerland %} [**Switzerland**](https://en.wikipedia.org/wiki/Switzerland) or {% countryflag Norway %} [**Norway**](https://en.wikipedia.org/wiki/Norway). My suspicions for Switzerland were confirmed when I saw its recognizable square flag hanging off one of the houses:

![10-zoom.png](/asset/idek/10-zoom.png)

{% info %}
**Flag Progress**: `idek{BReAK_m(E/e)_s`\_\_\_\_\_\_\_`}`
{% endinfo %}

---

### 11.png

![11.png](/asset/idek/11.png)

Splat in the middle of an inconspicuous-looking suburb! Here's the Google Lens output when you focus in on the bollards on the street (since there's nothing of interest anywhere else):

![11-lens.png](/asset/idek/11-lens.png)

Scrolling through the outputs results in distinctly {% countryflag Poland %} [**Polish**](https://en.wikipedia.org/wiki/Poland) bollards:

<div class="flex-container">
<div>{% cimage src:/asset/idek/11-bollard.png sub:"Zoomed in bollard" %}</div>
<div>{% cimage src:/asset/idek/11-comparison.png sub:"GeoHints Polish bollard" %}</div>
</div>

{% info %}
**Flag Progress**: `idek{BReAK_m(E/e)_sP`\_\_\_\_\_\_`}`
{% endinfo %}

---

### 12.png

![12.png](/asset/idek/12.png)

More Europe! Here's the Google Lens output:

![12-lens.png](/asset/idek/12-lens.png)

It looks like it's so generically European that Google Lens can't seem to pin a single country down. Let's zoom in to see any pertinent details:

![12-zoom.png](/asset/idek/12-zoom.png)

The vertical sign reads "ELEKTRO", whilst the lower horizontal sign reads "Weißensteiner", two distinctly German words (with the latter being a surname, romanized into "[Weissensteiner](https://forebears.io/surnames/weissensteiner)"). Although we could automatically assume  {% countryflag Germany %} [Germany](https://en.wikipedia.org/wiki/Germany), there are multiple other German-speaking European countries, so we'll have to narrow it down further.

Here's the solution: simply Google "Elektro Weißensteiner" and you'll find that it's an electronics store based in {% countryflag Austria %} [**Austria**](https://en.wikipedia.org/wiki/Austria):

![12-google.png](/asset/idek/12-google.png)

{% info %}
**Flag Progress**: `idek{BReAK_m(E/e)_sPa`\_\_\_\_\_`}`
{% endinfo %}

---

## Pit Stop

We've now come to a completely arbitrary stopping point - from here on out, each `.png` will become exponentially harder... so let's just recap what we've gotten so far. Note that incorrect countries will be *italicized*:

<div class="table-center">

| Image             | Country of Origin                                                                                                                                                         | [Population](https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population)                                                               | Flag    |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| ⠀                 |                                                                                                                                                                           |                                                                                                                                                            |         |
| [1.png](#1-png)   | {% countryflag Brazil %} [Brazil](https://en.wikipedia.org/wiki/Brazil)                                                                                                   | 215,652,035 ([2023](https://en.wikipedia.org/wiki/Demographics_of_Brazil))                                                                                 | `B`     |
| [2.png](#2-png)   | {% countryflag Russia %} [Russia](https://en.wikipedia.org/wiki/Russia)                                                                                                   | 146,980,061 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Russia))                                                                                 | `R`     |
| [3.png](#3-png)   | {% countryflag Estonia %} [Estonia](https://en.wikipedia.org/wiki/Estonia)                                                                                                | 1,331,796 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Estonia))                                                                                  | `e`     |
| [4.png](#4-png)   | {% countryflag Australia %} [Australia](https://en.wikipedia.org/wiki/Australia)                                                                                          | 26,033,493 ([2023](https://en.wikipedia.org/wiki/Demographics_of_Australia))                                                                               | `A`     |
| [5.png](#5-png)   | {% countryflag Kazakhstan %} [*Kazakhstan*](https://en.wikipedia.org/wiki/Kazakhstan)                                                                                     | 19,392,112 ([2023](https://en.wikipedia.org/wiki/Demographics_of_Kazakhstan))                                                                              | `K`     |
| [6.png](#6-png)   | {% countryflag Iceland %} [Iceland](https://en.wikipedia.org/wiki/Iceland)                                                                                                | 385,230 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Iceland))                                                                                    | `_`     |
| [7.png](#7-png)   | {% countryflag Mongolia %} [Mongolia](https://en.wikipedia.org/wiki/Mongolia)                                                                                             | 3,477,605 ([2023](https://en.wikipedia.org/wiki/Demographics_of_Mongolia))                                                                                 | `m `    |
| [8.png](#8-png)   | {% countryflag "El Salvador" %} [*El Salvador*](https://en.wikipedia.org/wiki/El_Salvador) / {% countryflag Ecuador %} [*Ecuador*](https://en.wikipedia.org/wiki/Ecuador) | 6,825,935 ([2021](https://en.wikipedia.org/wiki/Demographics_of_El_Salvador)) / 18,145,568 ([2023](https://en.wikipedia.org/wiki/Demographics_of_Ecuador)) | `e`/`E` |
| [9.png](#9-png)   | {% countryflag Monaco %} [Monaco](https://en.wikipedia.org/wiki/Monaco)                                                                                                   | 39,150 ([2021](https://en.wikipedia.org/wiki/Demographics_of_Monaco))                                                                                      | `_`     |
| [10.png](#10-png) | {% countryflag Switzerland %} [Switzerland](https://en.wikipedia.org/wiki/Switzerland)                                                                                    | 8,789,726 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Switzerland))                                                                              | `s`     |
| [11.png](#11-png) | {% countryflag Poland %} [Poland](https://en.wikipedia.org/wiki/Poland)                                                                                                   | 37,796,000 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Poland))                                                                                  | `P`     |
| [12.png](#12-png) | {% countryflag Austria %} [Austria](https://en.wikipedia.org/wiki/Austria)                                                                                                | 9,090,868 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Austria))                                                                                  | `a`     |

</div>
<br>

Let's proceed with the rest of this challenge.

---

### 13.png

![13.png](/asset/idek/13.png)

This is probably the quintessential "North America" picture ever - impossibly flat land, a random city skyline in the background, and huge fields. A Google Lens search yields nothing we don't already know:

![13-lens.png](/asset/idek/13-lens.png)

Currently, our only issue here is telling between either {% countryflag Canada %} [Canada](https://en.wikipedia.org/wiki/Canada) or the {% countryflag "United States" %} [United States](https://en.wikipedia.org/wiki/United_States). Let's narrow it down a bit more.

The only telling sign here is **road markings**. Since I live in the US, I know that two-way roads (with one lane per direction) are typically marked with either **broken double** yellow lines or **solid double** yellow lines. Although **single dashed** yellow lines exist in the US, they are much more common in Canada (albeit still existing in the US). Here's a diagram I threw up, which you can combine with the overall "feel" of an image to make a calculated guess:

![13-streets.svg](/asset/idek/13-streets.svg)

Alongside this, not a single common word in English starts with the prefix `spau-`, so ruling out the US is a no-brainer. However, the above knowledge about road markings is useful when you have no flag to infer characters from!

{% info %}
**Flag Progress**: `idek{BReAK_m(E/e)_sPaC`\_\_\_\_`}`
{% endinfo %}

---

### 14.png

![14.png](/asset/idek/14.png)

This one was actually really, really clever. Although a Google Lens yields nothing of use (since its viewpoint is a random tropical area), take a look at the bottom right-hand corner of the image:

![14-bottom.png](/asset/idek/14-bottom.png)

Is that an acute accent mark on top of the letter I (`í`)? Inferring from the shape of the other letters, it looks like this segment of the word spells out `-íal`, which many Spanish words end with. We can safely narrow this down to a Latin-American/Spanish-speaking country.

Let's keep inferring from the flag. It currently says `BReAK_m(E/e)_sPaC`, so we can safely guess that the next country should start with `e` or `E` to continue the next likely word, "space." {% countryflag Ecuador %} [Ecuador](https://en.wikipedia.org/wiki/Ecuador) and {% countryflag "El Salvador" %} [El Salvador](https://en.wikipedia.org/wiki/El_Salvador) are the only Spanish-speaking countries that start with `e` or `E`, and I was able to narrow it down to Ecuador solely from the license plate of the car on the right, which looks like a taxi:

<div class="flex-container">
<div>{% cimage src:/asset/idek/14-plate.png sub:"Zoomed in plate" width:400px %}</div>
<div>{% cimage src:/asset/idek/14-comparison.jpg sub:"Ecuadorian plate for commercial vehicles (taxis, buses)" width:400px %}</div>
</div>

{% info %}
**Flag Progress**: `idek{BReAK_m(E/e)_sPaCE`\_\_\_`}`
{% endinfo %}

---

### 15.png

![15.png](/asset/idek/15.png)

We are now presented with... some dilapidated, snowy houses! This will be difficult to narrow down.

Google Lens yielded nothing of use, but I did identify some Cyrillic writing on the dumpster to the left:

![15-bin.png](/asset/idek/15-bin.png)

When a Google search for a "KMA" trash company in Eastern Europe/Russia resulted in nothing relevant, I became absolutely stumped with this challenge. 

#### The Guesswork Begins

This was around the time my team started to suspect the flag for the challenge read "break me spacebar", which is a meme in the GeoGuessr community for how content creator [Rainbolt](https://www.youtube.com/@georainbolt) hits his spacebar really loudly when guessing a location on the map:

![15-spacebar.png](/asset/idek/15-spacebar.png)

In accordance with the word "spacebar", I narrowed the country down to the only Russian-speaking country (in terms of officially recognized languages) with starts with "B": {% countryflag Belarus %} [Belarus](https://en.wikipedia.org/wiki/Belarus). 

#### GeoGuessr Meta: Snow Coverage

So... Belarus was incorrect. However, it had a population under 10 million (similarly to the correct answer), meaning that the letter `b` was correct, regardless. The real country this image was taken in was {% countryflag Bulgaria %} [Bulgaria](https://en.wikipedia.org/wiki/Bulgaria), which a pro player would guess due to the typical snow coverage of Google Street View. According to this [GeoGuessr Tips](https://somerandomstuff1.wordpress.com/2019/02/08/geoguessr-the-top-tips-tricks-and-techniques/#bulgaria) article:

> Hungary is one of three European countries that can have similar, bleak, winter scenery with trees without leaves and snowfall beside the road. The other two countries are Bulgaria and small parts of Czechia.

> Much of Bulgarian Street View was taken in winter and thus the trees are often without leaves and the Street View scenes in Bulgaria are often fairly bleak. Within Europe, Hungary and parts of Czechia have similar bleak wintery scenery. Bulgaria is one of the poorest countries in Europe and the Bulgarian roads reflect this fact. These roads are commonly crumbling and filled with cracks and holes.

So when you see a combination of dilapidation/bleakness and snowiness, Bulgaria, {% countryflag Hungary %} [Hungary](https://en.wikipedia.org/wiki/Hungary), or the {% countryflag "Czech Republic" %} [Czech Republic](https://en.wikipedia.org/wiki/Czech_Republic) would be your best guesses.

{% info %}
**Flag Progress**: `idek{BReAK_m(E/e)_sPaCEb`\_\_`}`
{% endinfo %}

---

### 16.png

![16.png](/asset/idek/16.png)

Beautiful hills and mountains... However, I genuinely have no idea where this could be!

Let's start off with what little we have, and analyze the black and white chevron marker in the center of the image:

![16-zoom.png](/asset/idek/16-zoom.png)

I initially scoured the internet for countries which use this specific chevron and came across this map, courtesy of user [u/isaacSW](https://www.reddit.com/r/geoguessr/comments/lwa9wr/map_of_european_road_curve_chevron_signs/) on the [r/geoguessr](https://www.reddit.com/r/geoguessr/) subreddit:

![16-map.webp](/asset/idek/16-map.webp)

According to this map, the only countries which use white-on-black turn chevrons are the {% countryflag "United Kingdom" %} [United Kingdom](https://en.wikipedia.org/wiki/United_Kingdom), {% countryflag Switzerland %} [Switzerland](https://en.wikipedia.org/wiki/Switzerland), {% countryflag Italy %} [Italy](https://en.wikipedia.org/wiki/Italy), {% countryflag Greece %} [Greece](https://en.wikipedia.org/wiki/Greece), {% countryflag Albania %} [Albania](https://en.wikipedia.org/wiki/Albania), and occasionally {% countryflag Spain %} [Spain](https://en.wikipedia.org/wiki/Spain).

Since this part of the flag says "spacebar", the only choice which starts with "A" is Albania, so we will be using `a` for this character.

#### GeoGuessr Meta: Rifts in the Sky

After the challenge was completed, the author revealed something really interesting about this image... "**rifts in the sky**":

{% twitter url:'twitter.com/pchaltv/status/1562906335125336067' %}

Apparently, for countries like Albania, {% countryflag Montenegro %} [Montenegro](https://en.wikipedia.org/wiki/Montenegro), and {% countryflag Senegal %} [Senegal](https://en.wikipedia.org/wiki/Senegal), there are camera imperfections in the Photo Sphere which result in creases in the sky:

![16-rift.png](/asset/idek/16-rift.png)

We can see the rift itself in `16.png` in the top center of the image:

![16-rift2.png](/asset/idek/16-rift2.png)

Little meta tricks and trivia like these are what make GeoGuessr such an interesting game.

{% info %}
**Flag Progress**: `idek{BReAK_m(E/e)_sPaCEba`\_`}`
{% endinfo %}

---

### 17.png

![17.png](/asset/idek/17.png)

To be honest, we didn't solve this one at all - we just completed the sentence "break me spacebar" and guessed the last character was either `R` or `r`. Our original {% countryflag Cambodia %} [Cambodia](https://en.wikipedia.org/wiki/Cambodia) guess didn't make any sense, anyways :P

#### GeoGuessr Meta: The Sakhalin Plant

The author of the challenge revealed that the last location was {% countryflag Russia %} [**Russia**](https://en.wikipedia.org/wiki/Russia), on the large island of [Sakhalin](https://en.wikipedia.org/wiki/Sakhalin) north of {% countryflag Japan %} [Japan](https://en.wikipedia.org/wiki/Japan):

{% cimage src:/asset/idek/17-map.png width:500px %}

The intended method of identifying the location was to analyze this patch of particular foliage in the image:

{% cimage src:/asset/idek/17-plant.png width:400px %}

This plant is called [butterbur](https://en.wikipedia.org/wiki/Petasites_japonicus) (*Petasites japonicus*, or simply "The Sakhalin Plant"), and it's native to Sakhalin, Japan, {% countryflag China %} [China](https://en.wikipedia.org/wiki/China), and {% countryflag "North Korea" %}/{% countryflag "South Korea" %} [Korea](https://en.wikipedia.org/wiki/Korea). Apparently, GeoGuessr pros can instantly identify this particular area of Russia from this plant alone!

{% info %}
**Flag Progress**: `idek{BReAK_m(E/e)_sPaCEbaR}`
{% endinfo %}

## Afterword

With this, the entire flag is revealed, and was successfully submitted with a lowercase `e` for the eighth character (the country was actually {% countryflag Eswatini %} [Eswatini](https://en.wikipedia.org/wiki/Eswatini)); the flag is `idek{BReAK_me_sPaCEbaR}`.

This challenge would have not been possible if the flag wasn't made up of recognizable English words. When we were approaching the end, we simply inferred that the last bit spelled "spacebar" - although we could have brute forced all 8 different capitalizations of "bar" (2^3) by the time we finished "sPaCE", we felt like doing so would have detracted from the fun of the challenge.

Overall, I didn't just learn more about GEOSINT-style challenges - I came to a greater understanding of how absolutely massive Earth is. I guess that's part of the fun in playing GeoGuessr!

Here is a final table of all the countries (and what I guessed incorrectly):

<div class="table-center">

| Image             | Correct Country                                                                        | [Population](https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population) | Flag | Incorrect Guess                                                                          |
|-------------------|----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|------|------------------------------------------------------------------------------------------|
| ⠀                 |                                                                                        |                                                                                              |      |                                                                                          |
| [1.png](#1-png)   | {% countryflag Brazil %} [Brazil](https://en.wikipedia.org/wiki/Brazil)                | 215,652,035 ([2023](https://en.wikipedia.org/wiki/Demographics_of_Brazil))                   | `B`  |                                                                                          |
| [2.png](#2-png)   | {% countryflag Russia %} [Russia](https://en.wikipedia.org/wiki/Russia)                | 146,980,061 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Russia))                   | `R`  |                                                                                          |
| [3.png](#3-png)   | {% countryflag Estonia %} [Estonia](https://en.wikipedia.org/wiki/Estonia)             | 1,331,796 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Estonia))                    | `e`  |                                                                                          |
| [4.png](#4-png)   | {% countryflag Australia %} [Australia](https://en.wikipedia.org/wiki/Australia)       | 26,033,493 ([2023](https://en.wikipedia.org/wiki/Demographics_of_Australia))                 | `A`  |                                                                                          |
| [5.png](#5-png)   | {% countryflag Kenya %} [Kenya](https://en.wikipedia.org/wiki/Kenya)                   | 47,564,296 ([2019](https://en.wikipedia.org/wiki/Demographics_of_Kenya))                     | `K`  | {% countryflag Kazakhstan %} [Kazakhstan](https://en.wikipedia.org/wiki/Kazakhstan)      |
| [6.png](#6-png)   | {% countryflag Iceland %} [Iceland](https://en.wikipedia.org/wiki/Iceland)             | 385,230 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Iceland))                      | `_`  |                                                                                          |
| [7.png](#7-png)   | {% countryflag Mongolia %} [Mongolia](https://en.wikipedia.org/wiki/Mongolia)          | 3,477,605 ([2023](https://en.wikipedia.org/wiki/Demographics_of_Mongolia))                   | `m ` |                                                                                          |
| [8.png](#8-png)   | {% countryflag Eswatini %} [Eswatini](https://en.wikipedia.org/wiki/Eswatini)          | 1,202,000 ([2021](https://en.wikipedia.org/wiki/Demographics_of_Eswatini))                   | `e`  | {% countryflag "El Salvador" %} [El Salvador](https://en.wikipedia.org/wiki/El_Salvador) |
| [9.png](#9-png)   | {% countryflag Monaco %} [Monaco](https://en.wikipedia.org/wiki/Monaco)                | 39,150 ([2021](https://en.wikipedia.org/wiki/Demographics_of_Monaco))                        | `_`  |                                                                                          |
| [10.png](#10-png) | {% countryflag Switzerland %} [Switzerland](https://en.wikipedia.org/wiki/Switzerland) | 8,789,726 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Switzerland))                | `s`  |                                                                                          |
| [11.png](#11-png) | {% countryflag Poland %} [Poland](https://en.wikipedia.org/wiki/Poland)                | 37,796,000 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Poland))                    | `P`  |                                                                                          |
| [12.png](#12-png) | {% countryflag Austria %} [Austria](https://en.wikipedia.org/wiki/Austria)             | 9,090,868 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Austria))                    | `a`  |                                                                                          |
| [13.png](#13-png) | {% countryflag Canada %} [Canada](https://en.wikipedia.org/wiki/Canada)                | 39,082,640 ([2023](https://en.wikipedia.org/wiki/Demographics_of_Canada))                    | `C`  |                                                                                          |
| [14.png](#14-png) | {% countryflag Ecuador %} [Ecuador](https://en.wikipedia.org/wiki/Ecuador)             | 18,146,244 ([2023](https://en.wikipedia.org/wiki/Demographics_of_Ecuador))                   | `E`  |                                                                                          |
| [15.png](#15-png) | {% countryflag Bulgaria %} [Bulgaria](https://en.wikipedia.org/wiki/Bulgaria)          | 6,520,314 ([2021](https://en.wikipedia.org/wiki/Demographics_of_Bulgaria))                   | `b`  | {% countryflag Belarus %} [Belarus](https://en.wikipedia.org/wiki/Belarus)               |
| [16.png](#16-png) | {% countryflag Albania %} [Albania](https://en.wikipedia.org/wiki/Albania)             | 2,829,741 ([2021](https://en.wikipedia.org/wiki/Demographics_of_Albania))                    | `a`  |                                                                                          |
| [17.png](#17-png) | {% countryflag Russia %} [Russia](https://en.wikipedia.org/wiki/Russia)                | 146,980,061 ([2022](https://en.wikipedia.org/wiki/Demographics_of_Russia))                   | `R`  |                                                                                          |

</div>
<br>

## Resources

Here are some of the websites I used throughout the challenge-solving process:

- [GeoHints](https://geohints.com/) - Provides images and key characteristics of every covered country in Google Street View
- [GeoTips](https://geotips.net/) - Lots of meta stuff (e.g. camera quality, cars vs. trekkers, etc.)
- [r/geoguessr](https://www.reddit.com/r/geoguessr/) - Useful community diagrams and wiki
- [The Digital Labyrinth - GeoGuessr](https://somerandomstuff1.wordpress.com/2019/02/08/geoguessr-the-top-tips-tricks-and-techniques/) - An absolutely massive blog post with everything you need to know about the game and its tricks
- [World License Plates](http://www.worldlicenseplates.com/) - Scanned license plates of the majority of countries, including old and new designs
- [Google Lens](https://lens.google/) - A powerful image recognition tool which can identify objects, text, landmarks, foliage, you name it and provide similar images

---

{% flagcounter %}