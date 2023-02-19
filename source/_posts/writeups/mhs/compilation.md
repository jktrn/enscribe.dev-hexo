---
title: "MHSCTF 2023: Writeup Compilation"
date: 2023-02-15 00:00:00
categories:
- ctfs
- mhs
tags:
- compilation
description: "From Flask cookie manipulation to ELF integer overflow, here is a compilation of writeups for selected challenges from MHSCTF 2023!"
category_column: "mhs"
permalink: ctfs/mhs/compilation/
thumbnail: /asset/banner/banner-ctfs.png
---

---

{% challenge %}
title: Chocolates
level: h2
solvers: flocto
authors: 0xmmalik
genre: web
points: 3
description: |
    The first thing I want to give everyone is chocolate, of course. I found this wonderful company that sells the most exquisite chocolates, but I heard that they sell a super special secret valentine chocolate that's hidden somewhere on their website. Here's the website, do you think you can find it for me?  
    [https://chocolates-mhsctf.0xmmalik.repl.co](https://chocolates-mhsctf.0xmmalik.repl.co)
{% endchallenge %}


Let's check out the provided website (hosted with Replit 💀):

<img src="/asset/mhs/chocolates-website.png" style="border: solid 1px #1D1D1D; margin: 1rem 0;">

Typically the first step is the good old inspect element; the only thing we find is a `style.css` file which provides the following:

```css Chocolates: style.css
@import url('https://fonts.googleapis.com/css?family=Roboto:400,500,700,300');
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

/* TEMP - here's a key in case i forget it: "?key=thedarkestchocolate" */
```
 
The author left a comment here which leads us to the key `?key=thedarkestchocolate`. It's seemingly the same page, but with the source now provided:

{% ccb scrollable:true lang:html gutter1:1-97 caption:'Chocolates:index.html' %}
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Taylor's Chocolates</title>
        <link rel="stylesheet" href="/static/style.css" />
        <link href="https://use.fontawesome.com/releases/v5.15.2/css/all.css" rel="stylesheet" />
    </head>
    <body>
        <div class="textglitch" style="text-align: center;">
            <a class="textglitch-link" href="/"><span>Taylor's Chocolates</span></a>
        </div>
        <div class="head" style="text-align: center;">
            <a class="head-cont"><span>💖 Happy Valentine's Day 💖</span></a>
        </div>

        <div class="head" style="text-align: center;">
            <!--<a class="head-cont nav-link" href="/hidden-page">Hidden Page</a> | -->
            <a class="head-cont nav-link" href="#milk-chocolates">Milk Chocolates</a> | 
            <a class="head-cont nav-link" href="#dark-chocolates">Dark Chocolates</a> |
            <a class="head-cont nav-link" href="#white-chocolates">White Chocolates</a> | 
            <a class="head-cont nav-link" href="#specialty-chocolates">Specialty Chocolates</a>
        </div>

        <div class="textglitch" style="text-align: center; font-size: 2vw;" id="milk-chocolates">
            <a class="textglitch-link" href="#"><span>Milk Chocolates</span></a>
        </div>
        <div class="content">
            <p>Our selection of milk chocolates includes:</p>
            <div class="content">
                <ul>
                    <li>normal milk chocolate ($5.34/bar)</li>
                    <li>almond milk chocolate ($6.44/bar)</li>
                    <li>coconut milk chocolate ($6.53/bar)</li>
                    <li>hazelnut milk chocolate ($7.88/bar)</li>
                </ul>
            </div>
        </div>
        <div class="textglitch" style="text-align: center; font-size: 2vw;" id="dark-chocolates">
            <a class="textglitch-link" href="#"><span>Dark Chocolates</span></a>
        </div>
        <div class="content">
            <p>Our selection of dark chocolates includes:</p>
            <div class="content">
                <ul>
                    <li>65% dark chocolate ($6.57/bar)</li>
                    <li>79% dark chocolate ($7.74/bar)</li>
                    <li>90% dark chocolate ($8.58/bar)</li>
                    <li>almond 79% dark chocolate ($8.84/bar)</li>
                    <li>hazelnut 79% dark chocolate ($10.28/bar)</li>
                    <li>97% dark chocolate ($10.76/bar)</li>
                </ul>
            </div>
        </div>

        <div class="textglitch" style="text-align: center; font-size: 2vw;" id="white-chocolates">
            <a class="textglitch-link" href="#"><span>White Chocolates</span></a>
        </div>
        <div class="content">
            <p>Our selection of white chocolates includes:</p>
            <div class="content">
                <ul>
                    <li>plain white chocolate ($6.22/bar)</li>
                    <li>candy corn white chocolate ($7.11/bar)</li>
                    <li>cookies 'n' cream white chocolate ($8.48/bar)</li>
                    <li>red velvet white chocolate ($9.23/bar)</li>
                </ul>
            </div>
        </div>
        
        <div class="textglitch" style="text-align: center; font-size: 2vw;" id="specialty-chocolates">
            <a class="textglitch-link" href="#"><span>Specialty Chocolates</span></a>
        </div>
        <div class="content">
            <p>Our selection of specialty chocolates includes:</p>
            <div class="content">
                <ul>
                    <li>strawberry swirl chocolate ($9.15/bar)</li>
                    <li>mint chocolate ($9.57/bar)</li>
                    <li>cherry raisin dark chocolate ($10.58/bar)</li>
                    <li>Mexican chili chocolate ($12.83/bar)</li>
                    <li>VALENTINE'S DAY SPECIAL - giant heart of chocolate ($29.56/heart)</li>
                </ul>
            </div>
        </div>
        
        <br /><br />
        
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
        <script src="glitch_link.js"></script>
    </body>
    <footer style="text-align:center;font-size:1vw;">
        <br /><br />
        MHSCTF 2023.
    </footer>
    <br />
</html>
{% endccb %}

Line 18 reveals a commented out `/hidden-page` endpoint, which requires us to provide a key. We give it `thedarkestchocolate`:

<img src="/asset/mhs/chocolates-secret.png" style="border: solid 1px #1D1D1D; margin: 1rem 0;">

Clicking that [link below](https://chocolates-mhsctf.0xmmalik.repl.co/admin-check?key=anotherkeylol) leads us to a bogus page.

Looking at our Flask session cookie, we can easily decode it with [flask-unsign](https://github.com/Paradoxis/Flask-Unsign):

{% ccb terminal:true html:true %}
<span style="color:#F99157">$ </span>flask-unsign --decode --cookie 'eyJhZG1pbiI6ImZhbHNlIiwidmlzaXRfdGl... <span style="color:#696969"><b>[REDACTED]</b></span>'
{'admin': 'false', 'visit_time': '<span style="color:#696969"><b>[REDACTED]</b></span>'}
{% endccb %}

This reveals some JSON which is sent, including an `admin` boolean currently set to `false`. We'll need to change it to `true` to get access to the admin page.

In order to this, we'll need to "sign" our own cookie — for this to work, we'll need to find the secret key which this website signed its own key with. We should be able to brute force this process with the hint which the [author provided](https://mhsctf.0xmmalik.repl.co/wordlist/) (that the secret key is part of the `rockyou.txt` wordlist).

[flask-unsign](https://github.com/Paradoxis/Flask-Unsign) trivially achieves this:

```sh
flask-unsign -u -c <cookie> -w wordlist.txt
```

The command finishes running pretty fast, and gives us `BATMAN` as the Flask secret key.

We can then sign our own Flask session cookie

```
flask-unsign -s -c "{'admin': 'true'}" --secret BATMAN
>>> eyJhZG1pbiI6InRydWUifQ.Y-bLkw.Tf-z4AWgdKE_BQ5At-wkwW8C5ik
```

Revisiting the site with this new signed cookie gives us the flag
`valentine{1ts_jus7_100%_cacao} `


---

{% challenge %}
title: Rescue Mission
level: h2
solvers: flocto
authors: 0xmmalik
genre: pwn
points: 6
description: |
    My Valentine, Alex, has been kidnapped and is being held hostage! Help me save Alex by defeating the boss in this game.  
    Notes: **[SEE BELOW]**  
    `nc 0.cloud.chals.io 15684`
files: '[rescue_mission.c](/asset/mhs/rescue_mission.c)'
{% endchallenge %}

{% box style:"text-align: left; padding: 5px;" %}
- Every round, enter a number between 1 and the ATK (attack) of the entity whose turn it is (your's or the enemy's). Your opponent will also select a number from this range and if these numbers match, the attack is blocked (unless the attacker is the boss, whose attacks are not blockable). If they do not match, the attacking entity scores a hit and some damage is dealt based on the attacker's ATK.
- At the beginning of a match, the entity with the smaller PRI (priority) attacks first.
- You will face 3 enemies before the final boss. Make sure to keep upgrading your stats in the Shop! You earn money by winning battles.
- The game is over once you have faced all 4 enemies, regardless of how well you do.
- The Valentine will be displayed once you defeat the boss.
{% endbox %}

---

{% challenge %}
title: Passing Notes
level: h2
solvers: SuperBeetleGamer
authors: 0xmmalik
genre: crypto
points: 7
description: |
    Passing secret notes? That practically *screams* Valentine's Day to me! So, I've devised a super-secure way to encrypt a message so you can send it to that special someone! I used my program to encrypt a Valentine just for you! The only thing is... I don't remember the key. Ah, whatever! Here you go: `V4m\GDMHaDM3WKy6tACXaEuXumQgtJufGEyXTAtIuDm5GEHS`  
    The `valentine{...}` wrapper is included in the encrypted text.
files: '[passing_notes.py](/asset/mhs/passing_notes.py)'
{% endchallenge %}