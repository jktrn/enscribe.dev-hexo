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

I was recently invited by the academic team "DN" (the name, surprisingly, has no inappropriate connotation) to compete in Mentor High School's second CTF iteration, [MHSCTF 2023](https://ctftime.org/event/1861). Although the competition ran for 15 days, we maxed out their 11 challenges in **just under 16 hours** (ignoring solve resets) and managed to take first place. These four writeups were part of the verification process, which came with prize-receiving — enjoy!

---

{% challenge %}
title: Matchmaker 🩸
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

- The connection times out after 60 seconds, and there will be 3 iterations.
- The input will be given in $N$ lines, where $N$ represents the number of students. The first line represents the zeroth student, the second line represents the first student, and so on ($50 < N < 100$, $N \bmod 2 = 0$).
- Each line of input contains $N - 1$ integers $R$ (ranged $0 < R < 100$, inclusive); $R$ represents a student's rating of another student at that index, repeated for everybody but themselves.

I've cut the notes provided in half to make it a bit more digestable. Before we continue, let's see some sample input from the server for context:

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

<div style="display: flex;">
  <div style="flex: 1;">
    <p>The first line, <code>86 60 67...</code>, can be translated into:
    <ul>
      <li>Student 0 -&gt; Student 1 = 86</li>
      <li>Student 0 -&gt; Student 2 = 60</li>
      <li>Student 0 -&gt; Student 3 = 67</li>
    </ol>
  </div>
  <div style="flex: 1;">
    <p>Let's do the same thing for the second line, <code>76 0 74...</code>:</p>
    <ul>
      <li>Student 1 -&gt; Student 0 = 76</li>
      <li>Student 1 -&gt; Student 2 = 0</li>
      <li>Student 1 -&gt; Student 3 = 74</li>
    </ol>
  </div>
</div>

Notice how the student will always skip their own index, which aligns with the author's notes detailing how the integers "represent the students ratings of everybody but themselves." Let's continue with the rest of the notes:

- Determine the pairings that maximize the students' ratings for each other
    - **Example**: If Student 1 -> Student 7 = 98 and Student 7 -> Student 1 = 87, and Students 1 and 7 are paired, the "score" of this pairing would be $98 + 87 = 185$
- The output should list all maximized pairs (including duplicates; order of the pairs does not matter)
    - **Example**: If Student 0 -> Student 3, Student 1 -> Student 2, and Student 4 -> Student 5, the desired output is: `0,3;1,2;2,1;3,0;4,5;5,4`
- The connection will close if the output is incorrect, and reiterate if correct

Let's crack on with the actual algorithm which will be used for solving this!

### Graph Theory Fundamentals

This challenge is a classic example of a concept called "maximum weight matching", which is fundamental in **graph theory** and **discrete mathematics**. Although there is a relatively high prerequisite knowledge floor for understanding these concepts, I'll explain them as best as I can.

Firstly, let's define a **graph**. A graph is a set of **vertices** (or nodes), which are connected by **edges**. Not to be confused with the [Cartesian coordinate system](https://en.wikipedia.org/wiki/Cartesian_coordinate_system), graphs are represented by the [ordered pair](https://en.wikipedia.org/wiki/Ordered_pair) $G = (V, E)$ in which $V$ is a [set](https://en.wikipedia.org/wiki/Set_(mathematics)) of vertices and $E$ is a set of edges:

![Graph](/asset/mhs/graph.svg)

{% info %}
**Note**: The set of edges $E$ is formally defined as $E \subset \\{(x, y) | (x, y) \in V^2 \textrm{ and } x \neq y\\}$. By this definition, $x$ and $y$ are the vertices that are connected to the edge $e$, called the **endpoints**. It can also be said that $e$ is **incident** to $x$ and $y$.
{% endinfo %}

We can create a **matching** $M \subseteq E$ within the graph $G$, in which $M$ is a collection of edges such that every vertex $v$ of $V$ is incident to at **most** one edge of $M$ (meaning two edges cannot share the same vertex). When the highest possible cardinality (number of matches) of $G$ is reached, the matching is considered **maximum**, and any vertex $v$ not incident to any edge in $M$ is considered **exposed**. For example, the following is a maximum matching performed on the graph above:

![Matching](/asset/mhs/matching.svg)

{% info %}
**Note**: Since there is an exposed vertex in this graph (and because the size of $V$ is odd), $G$ is not considered **perfect**. A **perfect maximum matching** occurs when the size of $V$ is even  and there are no exposed vertices.
{% endinfo %}

Now, let's put **weights** into consideration (i.e. the students' ratings). With a **weighted graph** $G = (V, E)$, we can attribute a function $w$ that assigns a weight $w(e)$ to each edge $e \in E$ (defining $w : E \rightarrow \mathbb{N}$, natural numbers):

![Weights](/asset/mhs/weights.svg)

 The total weight of a matching $M$, written as $w(M)$, can be defined as:

$$
w(M) = \sum_{e \in M}w(e) \\\\
$$

Solving for $w(M)$ in the example graph above:

$$
w(M) = w((1, 2)) + w((3, 4)) + w((5, 6)) + w((8, 9)) \\\\
w(M) = 5 + 2 + 9 + 6 = 22
$$

Our goal is to maximize $w(M)$ — it is *definitely* not maximized above, since $W(M)$ is not at its highest possible value. We will be tackling it with a weighted implementation of [Edmonds' blossom algorithm](https://en.wikipedia.org/wiki/Blossom_algorithm). Although the blossom algorithm was typically meant for an $\href{https\://en.wikipedia.org/wiki/Big_O_notation}{\mathcal{O}}(|E||V|^2)$ [maximum cardinality matching](https://en.wikipedia.org/wiki/Maximum_cardinality_matching) (maximizing the size of $M$ itself), various implementations exist online which match with respect to a weighted graph, considered [maximum weight matching](https://en.wikipedia.org/wiki/Maximum_weight_matching) (and running in $\mathcal{O}(n^3)$ time).

Firstly, let's get started with how it works.

### The Blossom Algorithm

The core idea behind the blossom algorithm itself involves two concepts: **augmenting paths** and **blossom contraction**.

Given a graph $G = (V, E)$, a path in $G$ can be considered an **alternating path** if edges in the path are alternatively in $M$ and not in $M$. **Augmenting paths** are a type of alternating path that start and end with two exposed vertices:

![Augmenting Paths](/asset/mhs/augmenting-paths.svg)

The reason why augmenting paths are so special is because they can be optimized to become a maximum matching.
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

- Every round, enter a number between 1 and the ATK (attack) of the entity whose turn it is (your's or the enemy's). Your opponent will also select a number from this range and if these numbers match, the attack is blocked (unless the attacker is the boss, whose attacks are not blockable). If they do not match, the attacking entity scores a hit and some damage is dealt based on the attacker's ATK.
- At the beginning of a match, the entity with the smaller PRI (priority) attacks first.
- You will face 3 enemies before the final boss. Make sure to keep upgrading your stats in the Shop! You earn money by winning battles.
- The game is over once you have faced all 4 enemies, regardless of how well you do.
- The Valentine will be displayed once you defeat the boss.

---