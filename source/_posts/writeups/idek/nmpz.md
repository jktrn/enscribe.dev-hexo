---
title: "idekCTF 2022: NMPZ (OSINT)"
date: 2023-01-15 18:26:32
categories:
- ctfs
- idek
- osint
tags:
- geosint
description: "NMPZ: no moving, panning, or zooming. This is my writeup for a \"Geoguessr\"-esque OSINT challenge from idekCTF 2022!"
category_column: "idek/osint"
permalink: ctfs/idek/osint/nmpz/
thumbnail: /asset/banner/banner-osint.png
---

{% fontawesome %}

![Banner](/asset/idek/banner.svg)

### Intro

Recently my team ([Project Sekai](https://sekai.team/)) and I played [idekCTF 2022*](https://ctftime.org/event/1839) (with an asterisk... because it's 2023), which was an extraordinarily "race against the clock"-esque CTF with a ridiculously large pool of challenges - 58 of them, over a 48-hour runtime. We managed to snag a 1st place finish after countless hours of *not* touching grass, and I would like to share my personal favorite OSINT challenge of the competition - "NMPZ", an acronym in the [GeoGuessr](https://geoguessr.com/) community for "no **moving**, **panning**, or **zooming**." Although my team hadn't 100% correctly solved the challenge (we inferred part of the flag), here was our thought process tackling it. Enjoy!

---

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

{% ccb html:true caption:"README(.txt)" gutter1:1-16 %}
Figure out in which country each image was taken.
The first letter of every country's name will create the flag.
Countries with over 10 million inhabitants will have a capital letter.
Countries with less than one million inhabitants become an underscore.<br>
Example:
idek{TEST_flAg}
1.png: Turkey
2.png: Ecuador
3.png: Spain
4.png: Thailand
5.png: Vatican City
6.png: Finland
7.png: Lithuania
8.png: Argentina
9.png: Georgia
{% endccb %}

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

