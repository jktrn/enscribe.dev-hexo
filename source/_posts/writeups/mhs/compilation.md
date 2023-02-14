---
title: "MHSCTF 2023: Writeup Compilation"
date: 2023-02-14 11:08:53
categories:
- ctfs
- mhs
tags:
- compilation
description: "From elegant graph theory algorithms to Flask cookie spoofing, these are various writeups for selected challenges from MHSCTF 2023!"
category_column: "mhs"
permalink: ctfs/mhs/compilation/
thumbnail: /asset/banner/banner-ctfs.png
---

### Intro

I was recently invited by the academic team "DN" (the name, surprisingly, has no inappropriate connotation) to compete in Mentor High School's second CTF iteration, MHSCTF 2023. Although the competition ran for 15 days, we maxed out their 11 challenges in just under 16 hours (ignoring solve resets). These four writeups are part of the verification process which comes with prize-receiving — enjoy!

---

{% challenge %}
title: Matchmaker
level: h2
solvers:
- flocto --flag
- enscribe
authors: 0xmmalik
genre: prog
points: 9
description: |
    I've just had the most brilliant idea 😮 I want to write a program that takes all the students and how much they like each other to pair them up so I can maximize the total love in the classroom! Of course, when I say "I," I really mean... "you" ;)  
    Notes: **[SEE BELOW]**  
    `nc 0.cloud.chals.io 22304`
{% endchallenge %}

Here are the notes the author provided alongside the challenge description, abridged for brevity:

- The connection times out after 60 seconds, and there will be 3 iterations
- The input will be given in $N$ lines where $N$ is the number of students. The first line represents the zeroth student, the second line represents the first student, and so on ($50 < N < 100$, $N \pmod 2 = 0$)
- Each line of input consists of $N - 1$ integers $R$ (ranged $0 < R < 100$, inclusive) that represent that student's rating of everybody but themselves
- Determine the pairings that maximize the students' ratings for each other
    - **Example**: If Student 1 -> Student 7 = 98 and Student 7 -> Student 1 = 87, and Students 1 and 7 are paired, the "score" of this pairing would be $98 + 87 = 185$
- The output should list all maximized pairs (including duplicates; order of the pairs does not matter)
    - **Example**: If Student 0 -> Student 3, Student 1 -> Student 2, and Student 4 -> Student 5, the desired output is: `0,3;1,2;2,1;3,0;4,5;5,4`
- The connection will close if the output is incorrect, and reiterate if correct

Let's see some sample input from the server:

{% ccb lang:py gutter1:1-4 caption:matchmaker.py %}
from pwn import *

p = remote('0.cloud.chals.io', 22304)
print(r.recvuntilS(b'> '))
{% endccb %}

{% ccb html:true terminal:true wrapped:true %}
<span style="color:#F99157">$ </span> python3 matchmaker.py
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 22304: Done
86 60 67 84 44 4 36 59 100 63 51 6 92 66 36 99 3 69 55 11 21 66 66 81 21 63 76 44 4 87 13 67 0 97 28 13 68 96 47 49 0 18 63 26 73 68 13 63 47 61 0 53 74 56 6 12 5 66 54 47 79 81 84 43 19 6 62 52 6 100 86 64 1 4 38 89 93 6 72 93 63 46 90 29 81 89 5 9 77 23 87 94 73
76 0 74 52 56 60 57 78 48 93 85 66 29 70 96 40 76 62 46 66 69 31 99 47 12 42 43 12 47 19 26 8 26 45 29 27 17 14 15 54 57 78 69 73 55 16 88 50 96 97 34 49 78 3 91 53 28 66 28 28 9 38 87 20 66 28 37 38 94 61 96 99 45 39 52 5 27 5 96 41 31 83 86 32 92 35 96 10 2 97 3 19 88
SKIP_LINE(...)
{% endccb %}

We can do a bit of analysis on what we've received so far.

The line `86 60 67...` can be translated into something along the lines of:
- Student 0 -> Student 1 = 86
- Student 0 -> Student 2 = 60
- Student 0 -> Student 3 = 67

Let's do the same thing for the second line, `76 0 74...`:
- Student 1 -> Student 0 = 76
- Student 1 -> Student 2 = 0
- Student 1 -> Student 3 = 74

Notice how the student will always skip their own index, which aligns with the author's notes detailing how the integers "represent the students ratings of everybody but themselves." Let's crack on with the actual algorithm which will be used for solving this!

### The Blossom Algorithm

This challenge is a classic example of a concept called "maximum weight matching", which is extraordinarily fundamental in the graph theory subdiscipline in discrete mathematics.

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

---