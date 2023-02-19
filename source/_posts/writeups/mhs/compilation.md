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

{% ccb scrollable:true lang:html gutter1:1-97 caption:'Chocolates: index.html' %}
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

Clicking that [link below](https://chocolates-mhsctf.0xmmalik.repl.co/admin-check?key=anotherkeylol) leads us to a bogus page (which only works if you've given the page an appropriate key; otherwise it will throw a `500 Internal Server Error`).

Looking at our Flask session cookie, we can trivially decode it with [flask-unsign](https://github.com/Paradoxis/Flask-Unsign) (it's also just base64):

{% ccb terminal:true html:true %}
<span style="color:#F99157">$ </span>flask-unsign --decode --cookie 'eyJhZG1pbiI6ImZhbHNlIiwidmlzaXRfdGl... <span style="color:#696969"><b>[REDACTED]</b></span>'
{'admin': 'false', 'visit_time': '<span style="color:#696969"><b>[REDACTED]</b></span>'}
{% endccb %}

This reveals some JSON which is sent, including an `admin` boolean currently set to `false`. We'll need to change it to `true` to get access to the admin page.

In order to this, we'll need to "sign" our own cookie — for this to work, we need to find the secret key which this website signed its own cookie with. We should be able to brute force this process given the hint the [author provided](https://mhsctf.0xmmalik.repl.co/wordlist/) (that the secret key is part of the `rockyou.txt` wordlist).

Once again, `flask-unsign` to the rescue:

{% ccb terminal:true html:true wrapped:true %}
<span style="color:#F99157">$ </span>flask-unsign --unsign --cookie 'eyJhZG1pbiI6ImZhbHNlIiwidmlzaXRfdGl... <span style="color:#696969"><b>[REDACTED]</b></span>' --wordlist rockyou.txt --no-literal-eval
[<span style="color:#277FFF"><b>*</b></span>] Session decodes to: {'admin': 'false', 'visit_time': '<span style="color:#696969"><b>[REDACTED]</b></span>'}
[<span style="color:#277FFF"><b>*</b></span>] Starting brute-forcer with 8 threads..
[<span style="color:#47D4B9"><b>+</b></span>] Found secret key after 11520 attempts
b'BATMAN'
{% endccb %}

There's our secret key. Let's sign our own cookie utilizing the same tool:

{% ccb terminal:true html:true %}
<span style="color:#F99157">$ </span>flask-unsign --sign --cookie "{'admin': 'true'}" --secret BATMAN
eyJhZG1pbiI6InRydWUifQ.Y_KIEg.aw64VbPT2hZEhcHhyd-dyi-eZ1w
{% endccb %}

Let's try it out. Edit the cookie with your preferred browser's developer tools, and refresh the page:

<img src="/asset/mhs/edited-cookie.png" style="border: solid 1px #1D1D1D; margin: 1rem 0;">

The flag is `valentine{1ts_jus7_100%_cacao}`.

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
    `nc 0.cloud.chals.io [PORT]`
files: '[rescue_mission.c](/asset/mhs/rescue_mission.c)'
{% endchallenge %}

Here are some notes which the author provided about the challenge:

{% box style:"text-align: left; padding: 5px;" %}
- Every round, enter a number between 1 and the ATK (attack) of the entity whose turn it is (your's or the enemy's). Your opponent will also select a number from this range and if these numbers match, the attack is blocked (unless the attacker is the boss, whose attacks are not blockable). If they do not match, the attacking entity scores a hit and some damage is dealt based on the attacker's ATK.
- At the beginning of a match, the entity with the smaller PRI (priority) attacks first.
- You will face 3 enemies before the final boss. Make sure to keep upgrading your stats in the Shop! You earn money by winning battles.
- The game is over once you have faced all 4 enemies, regardless of how well you do.
- The Valentine will be displayed once you defeat the boss.
{% endbox %}

Here are a couple of snippets from the program:

<div class="flex-container">

{% ccb terminal:true caption:'Rescue Mission: Gameplay' %}
Player, your turn!
YOUR STATS:
HP              ATK             PRI
100             3               4

OPPONENT STATS:
HP              ATK             PRI
73              4               8


Press [ENTER] to play turn...
#(1-3):
{% endccb %}

{% ccb terminal:true caption:'Shop Navigation' %}
SHOP ($15)

0. Leave Shop
1. HP  Upgrade
2. ATK Upgrade
3. PRI Upgrade
{% endccb %}

{% ccb terminal:true caption:'HP Category' %}
HP Upgrade ($15)

1. +3 HP  ($5)
2. +15 HP ($20)
3. +50 HP ($50)

3
Quantity?
{% endccb %}

</div>

Let's check out the source code provided to us:

{% ccb lang:c scrollable:true gutter1:1-209 caption:'rescue_mission.c' %}
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

typedef struct {
  int health;
  int attack;
  int priority;
} entity;

entity player = {100, 3, 4};
entity boss = {1, 250, -1};
int money = 15;

void clear() { printf("\e[1;1H\e[2J"); }

int doBattle(entity player, entity enemy) {
  int turn = player.priority > enemy.priority;
  int health[2] = {player.health, enemy.health};
  while (health[0] > 0 && health[1] > 0) {
    if (turn == 0) {
      clear();
      printf("Player, your turn!\nYOUR "
             "STATS:\nHP\t\tATK\t\tPRI\n%i\t\t%i\t\t%i\n\n",
             health[0], player.attack, player.priority);
      printf("OPPONENT STATS:\nHP\t\tATK\t\tPRI\n%i\t\t%i\t\t%i\n\n\nPress "
             "[ENTER] to play turn...",
             health[1], enemy.attack, enemy.priority);
      getchar();
      printf("\n#(1-%i): ", player.attack);
      int pnum;
      scanf("%i", &pnum);
      int anum = rand() % player.attack + 1;
      printf("\nYour #: %i\t\tAttacker #: %i", pnum, anum);
      if (pnum == anum) {
        printf("\n\nATTACK BLOCKED!");
      } else {
        int damage = rand() % (player.attack * 2) + player.attack * 2;
        printf("\n\nHIT! (%i)", damage);
        health[1] -= damage;
      }
      getchar();
      getchar();
    } else if (turn == 1) {
      clear();
      printf("Enemy turn!\nYOUR STATS:\nHP\t\tATK\t\tPRI\n%i\t\t%i\t\t%i\n\n",
             health[0], player.attack, player.priority);
      printf("OPPONENT STATS:\nHP\t\tATK\t\tPRI\n%i\t\t%i\t\t%i\n\n\nPress "
             "[ENTER] to play turn...",
             health[1], enemy.attack, enemy.priority);
      getchar();
      printf("\n#(1-%i): ", enemy.attack);
      int pnum;
      scanf("%i", &pnum);
      int anum = rand() % enemy.attack + 1;
      printf("\nYour #: %i\t\tAttacker #: %i", pnum, anum);
      if (pnum == anum && enemy.health != boss.health) {
        printf("\n\nATTACK BLOCKED!");
      } else {
        int damage = rand() % (enemy.attack * 2) + enemy.attack * 2;
        printf("\n\nHIT! (%i)", damage);
        health[0] -= damage;
      }
      getchar();
      getchar();
    }
    turn = (turn + 1) % 2;
  }
  if (health[0] <= 0) {
    return 0;
  }
  return enemy.health / 10 + enemy.attack - enemy.priority;
}

void doShop() {
  int done = 0;
  while (!done) {
    clear();
    printf("SHOP ($%i)\n\n0. Leave Shop\n1. HP  Upgrade\n2. ATK Upgrade\n3. "
           "PRI Upgrade\n\n",
           money);
    int selection;
    char quantity[20];
    scanf("%i", &selection);
    if (selection == 0) {
      done = 1;
    } else if (selection == 1) {
      clear();
      printf("HP Upgrade ($%i)\n\n1. +3 HP  ($5)\n2. +15 HP ($20)\n3. +50 HP "
             "($50)\n\n",
             money);
      scanf("%i", &selection);
      printf("Quantity? ");
      scanf("%s", &quantity);
      int price;
      int buff;
      if (selection == 1) {
        price = 5;
        buff = 3;
      } else if (selection == 2) {
        price = 20;
        buff = 15;
      } else if (selection == 3) {
        price = 50;
        buff = 50;
      } else {
        price = 0;
        buff = 0;
      }
      int qint = atoi(quantity);
      if (quantity[0] == '-') {
        qint *= -1;
      }
      int cost = qint * price;
      printf("\n\nTotal Price: $%i", cost);
      if (cost > money) {
        printf("\nNOT ENOUGH MONEY!\n\n");
        getchar();
        getchar();
      } else {
        money -= cost;
        player.health += buff * qint;
        printf("\nYou have $%i left.\n\n", money);
        getchar();
        getchar();
      }
    } else if (selection == 2) {
      clear();
      printf("ATK Upgrade ($%i)\n\n1. +1 ATK  ($10)\n\n", money);
      printf("Quantity? ");
      scanf("%s", &quantity);
      int price = 10;
      int buff = 1;
      int qint = atoi(quantity);
      if (quantity[0] == '-') {
        qint *= -1;
      }
      int cost = qint * price;
      printf("\n\nTotal Price: $%i", cost);
      if (cost > money) {
        printf("\nNOT ENOUGH MONEY!\n\n");
        getchar();
        getchar();
      } else {
        money -= cost;
        player.attack += buff * qint;
        printf("\nYou have $%i left.\n\n", money);
        getchar();
        getchar();
      }
    } else if (selection == 3) {
      clear();
      printf("PRI Upgrade ($%i)\n\n1. -1 PRI  ($20)\n\n", money);
      printf("Quantity? ");
      scanf("%s", &quantity);
      int price = 20;
      int buff = 1;
      int qint = atoi(quantity);
      if (quantity[0] == '-') {
        qint *= -1;
      }
      int cost = qint * price;
      printf("\n\nTotal Price: $%i", cost);
      if (cost > money) {
        printf("\nNOT ENOUGH MONEY!\n\n");
        getchar();
        getchar();
      } else {
        money -= cost;
        player.priority -= buff * qint;
        printf("\nYou have $%i left.\n\n", money);
        getchar();
        getchar();
      }
    }
  }
}

int main(void) {
  srand(time(NULL));
  clear();
  printf("Welcome to...\n");
  printf("...the MHSCTF BATTLE ARENA!\n[ENTER]");
  getchar();
  for (int i = 0; i < 3; i++) {
    doShop(money);
    entity enemy = {rand() % 100 + 50, rand() % 3 + 3, rand() % 10};
    int earned = doBattle(player, enemy);
    if (earned > 0) {
      printf("\n\nYOU WIN! +%i coins", earned);
      money += earned;
      getchar();
    } else {
      printf("\n\nENEMY WINS!");
      getchar();
    }
  }
  money = 15;
  printf("BOSS FIGHT TIME!\n\n");
  getchar();
  getchar();
  doShop();
  if (doBattle(player, boss)) {
    clear();
    printf("YOU SAVED ALEX!\n\n");
    printf("Here's your flag: [REDACTED]\n\n");
  }
  return 0;
}
{% endccb %}

It looks like there's actually no handler for [integer overflow/underflow](https://en.wikipedia.org/wiki/Integer_overflow) in this program. Even worse, the code uses [signed integers](https://en.wikipedia.org/wiki/Signed_number_representations), meaning we can overflow a number into the negatives and purchase a negative amount of an item from the shop, giving us more money.

For example, we can "buy" `$-2057356704`'s worth of the `+3 HP option` by passing an extraordinarily large quantity, effectively giving us infinite money:

{% ccb terminal:true gutter1:SERVER,,,,,,USER,,,,SERVER, %}
HP Upgrade ($15)

1. +3 HP  ($5)
2. +15 HP ($20)
3. +50 HP ($50)

1
Quantity? 1682356715232


Total Price: $-2057356704
You have $2057356719 left.
{% endccb %}

Hmm... this may be a bit trivial:

{% ccb terminal:true gutter1:SERVER,,,,,,,,,,USER, %}
Enemy turn!
YOUR STATS:
HP              ATK             PRI
483572996               3               4

OPPONENT STATS:
HP              ATK             PRI
71              5               1


Press [ENTER] to play turn...
#(1-5):
{% endccb %}

Let's make it easy for ourselves and purchase as much ATK as possible with this money so we can one-shot all the enemies:

{% ccb terminal:true gutter1:SERVER,,,,USER,,,SERVER, %}
ATK Upgrade ($2057356719)

1. +1 ATK  ($10)

Quantity? 123123123


Total Price: $1231231230
You have $826125489 left.
{% endccb %}

We can now absolutely obliterate everything in our way, and the boss is no exception:

{% ccb terminal:true gutter1:SERVER,,,,,,,,,,USER,,,,SERVER,,,,, highlight:20 %}
Player, your turn!
YOUR STATS:
HP              ATK             PRI
483572471               123123126               4

OPPONENT STATS:
HP              ATK             PRI
1               250             -1


Press [ENTER] to play turn...

#(1-123123126): 1

Your #: 1               Attacker #: 52492265

HIT! (385909077)
YOU SAVED ALEX!

Here's your flag: valentine{phew_s4f3_and_50und}
{% endccb %}

The flag is `valentine{phew_s4f3_and_50und}`.

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

We're given a `passing_notes.py` file, alongside the encrypted text:

```py passing_notes.py
from base64 import b64encode
from random import choice
from sage.all import GF

b64_alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\\="

field = list(GF(2**6))


def generate_secret_key(n):
  key = 1
  for _ in range(n):
    key *= choice(field)
    key += choice(field)
  return key


def encrypt(message, secret_key):
  message = b64encode(message)
  encrypted = ""
  mod_key = 6 * secret_key**6 + 3 * secret_key**4 + 7 * secret_key**3 + 15
  for char in message:
    encrypted += b64_alpha[field.index(field[b64_alpha.index(chr(char))] *
                                       mod_key)]
  return encrypted


key = generate_secret_key(10)
print(encrypt(b'[redacted]', key))
```

Decrypting:

```py
from base64 import *

b64_alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\\="

field = list(GF(2**6))

def decrypt(message, secret_key):
  mod_key = 6 * secret_key**6 + 3 * secret_key**4 + 7 * secret_key**3 + 15
  decrypted = ""
  for char in message:
    dec1 = b64_alpha.index(char)
    dec2 = field[dec1]
    dec3 = dec2 * pow(mod_key,-1)
    dec4 = field.index(dec3)
    dec5 = b64_alpha[dec4]

    decrypted += dec5
  return b64decode(decrypted)

ct = "V4m\GDMHaDM3WKy6tACXaEuXumQgtJufGEyXTAtIuDm5GEHS"
# all items in a ring stay in the ring 
for i in field: 
  key = i
  try:
    print(decrypt(ct, key))
  except:
    continue
```