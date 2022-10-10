---
title: CTFs · Jason's Space
description: "Here's information, statistics, and writeups for all of my previous cybersecurity Capture the Flag (CTF) competitions."
thumbnail: https://enscribe.dev/asset/banner/banner-ctfs.png
permalink: /ctfs/
hidden: true
layout: page
---

{% fontawesome %}

{% grid columns:2 %}
<i class="fa-solid fa-music" style="color:#E9D3B6"></i> SekaiCTF 2022:
    description: |
        <b>Date</b>: Sep 30 - Oct 02, 2022<br>
        <b>Team</b>: <a href="https://sekai.team/"><i class="fa-solid fa-music"></i> Project Sekai</a>
    button:
        text: VIEW
        link: https://github.com/project-sekai-ctf/sekaictf-2022
    badge:
        type: darkblue
        text: <i class="fa-solid fa-pen-nib"></i> author
    badge2:
        type: blue
        text: <i class="fa-solid fa-flag"></i> 24.82
    border: 5BAEAE
<i class="fa-solid fa-shield-cat" style="color:#E9D3B6"></i> BYUCTF 2022:
    description: |
        <b>Date</b>: May 27 — May 28, 2022<br>
        <b>Team</b>: <a href="https://sekai.team/"><i class="fa-solid fa-music"></i> Project Sekai</a>
    button:
        text: VIEW
        link: /ctfs/byu/
    badge:
        type: gold
        text: <i class="fa-solid fa-ranking-star"></i> 01/435
    badge2:
        type: blue
        text: <i class="fa-solid fa-flag"></i> 42.74
<i class="fa-solid fa-flag-usa" style="color:#E9D3B6"></i> PatriotCTF 2022:
    description: |
        <b>Date</b>: Apr 29 - Apr 30, 2022<br>
        <b>Team</b>: <a href="https://ctftime.org/team/175828"><i class="fa-solid fa-file-code"></i> View Source</a>
    button:
        text: VIEW
        link: /ctfs/patriot/
    badge:
        type: silver
        text: <i class="fa-solid fa-ranking-star"></i> 02/436
    badge2:
        type: blue
        text: <i class="fa-solid fa-flag"></i> 34.71
<i class="fa-solid fa-people-group" style="color:#E9D3B6"></i> CrewCTF 2022:
    description: |
        <b>Date</b>: Apr 15 — Apr 17, 2022<br>
        <b>Team</b>: <a href="https://sekai.team/"><i class="fa-solid fa-music"></i> Project Sekai</a>
    button:
        text: VIEW
        link: /ctfs/crew/
    badge:
        type: bronze
        text: <i class="fa-solid fa-ranking-star"></i> 03/758
    badge2:
        type: blue
        text: <i class="fa-solid fa-flag"></i> 25.13
<i class="fa-solid fa-shield-halved" style="color:#E9D3B6"></i> NahamCon 2022:
    description: |
        <b>Date</b>: Apr 28 — Apr 30, 2022<br>
        <b>Team</b>: <a href="https://sekai.team/"><i class="fa-solid fa-music"></i> Project Sekai</a>
    button:
        text: VIEW
        link: /ctfs/naham/
    badge:
        type: brown
        text: <i class="fa-solid fa-ranking-star"></i> 06/3273
    badge2:
        type: blue
        text: <i class="fa-solid fa-flag"></i> 25.38
<i class="fa-solid fa-school" style="color:#E9D3B6"></i> TSA CTF 2021:
    description: |
        <b>Date</b>: Jun 01 — Jun 02, 2021<br>
        <b>Team</b>: VHTPA
    button:
        text: VIEW
        link: /ctfs/tsa21/
    badge:
        type: brown
        text: <i class="fa-solid fa-ranking-star"></i> 07/~55
<i class="fa-solid fa-user-astronaut" style="color:#E9D3B6"></i> Space Heroes CTF:
    description: |
        <b>Date</b>: Apr 01 — Apr 02, 2022<br>
        <b>Team</b>: WhileSEC
    button:
        text: VIEW
        link: /ctfs/shctf/
    badge:
        type: darkbrown
        text: <i class="fa-solid fa-ranking-star"></i> 36/778
<i class="fa-solid fa-graduation-cap" style="color:#E9D3B6"></i> picoCTF 2022:
    description: |
        <b>Date</b>: Mar 15 — Mar 21, 2022<br>
        <b>Team</b>: NLE CHAKRA
    button:
        text: VIEW
        link: /ctfs/pico22/
    badge:
        type: darkbrown
        text: <i class="fa-solid fa-ranking-star"></i> 86/1329
{% endgrid %}


## What is a CTF?

In cybersecurity, capture-the-flag competitions (CTFs) are a typically team-based activity in which players complete various challenges which accrue points and secure positions on a leaderboard. There are two signature types of CTFs:

- **Jeopardy**: Competition organizers design challenges in several distinct categories: web exploitation, forensics, reverse engineering, binary exploitation, cryptography, etc. Challenges - typically in the format of a file or website - are solved by discovering a text-based "flag" planted within them, in the format `flag{th15_i5_a_f1ag}`. *(This is the type I participate in!)*
- **Attack-Defense**: Teams are given a remote service, device, or host to protect whilst an enemy team attempts to exploit its processes to gain access.

## What do these categories entail?

<div class="no-highlight" style="margin-top:1rem">
<details><summary><b>pwn</b> (Binary exploitation)</summary><br>These challenges involve exploiting Linux executables hosted on servers to obtain flags, often through deprecated/vulnerable C-language functions that the program uses. Requires an understanding of assembly code, the stack data structure, and exploit-writing (via Python and <a href="https://docs.pwntools.com/en/stable/">pwntools</a>).<br><br></details>
<details><summary><b>crypto</b> (Cryptography)</summary><br>These challenges consist of identifying and decoding provided ciphertexts, often in both old/obscure encryption methods (i.e. Vigenere, Pigpen, Caesar) and more contemporary ones (<a href="https://en.wikipedia.org/wiki/RSA_(cryptosystem">RSA</a>), <a href="https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange">Diffie-Hellman</a>, and <a href="https://en.wikipedia.org/wiki/XOR_cipher">XOR</a> cryptosystems).<br><br></details>
<details><summary><b>forensics</b></summary><br>These challenges involve analysis of files — often <a href="https://www.solarwinds.com/resources/it-glossary/pcap">packet captures</a>, steganography, OS captures/images/memory dumps, or audio snippets. Files can occasionally be partially/fully corrupt, or obfuscated in an seemingly unrecoverable manner.<br><br></details>
<details><summary><b>rev</b> (Reverse engineering)</summary><br>These challenges involve attempting to reverse engineer a compiled program to identify and exploit its vulnerabilities. Similar to &quot;pwn&quot;, this category requires knowledge of the C programming language, assembly code, and various open-source software to analyze/decompile the provided executables (i.e. <a href="https://ghidra-sre.org/">Ghidra</a>, <a href="https://binary.ninja/">Binary Ninja</a>, <a href="https://hex-rays.com/ida-free/">IDA</a>)<br><br></details>
<details><summary><b>web</b> (Web exploitation)</summary><br>These challenges involve finding secrets and/or exploiting vulnerabilities in a website/web application. This can range from basic SQL/command injection to crazy Chrome 0-days.<br><br></details>
<details><summary><b>osint</b> (Open-source intelligence)</summary><br>These challenges often utilizing the internet's resources against small snippets of information (i.e. pictures, social media, screenshots, email) to gain sensitive information about the topic. There is a small subset of this category dubbed "GEOSINT", where geographic coordinates must be acquired from metadata-stripped images.<br></details>
</div>

## What team do play with?

I mainly play with **[Project Sekai](https://sekai.team/)**, but I (think) I'm free to join teams in competitions they're not playing in. Feel free to DM to confirm!

## I want to start, but I don't know where?

Although the field may seem extremely overwhelming and difficult to get into, there are a seemingly endless amount of resources available on the internet to get you up to spec with prerequisite knowledge:

- **[picoCTF](https://picoctf.org/resources)**: A CTF run by Carnegie Mellon University, providing handy learning guides for each CTF category, "Primer" documentation, and the "picoGym", which contains every challenge from its previous annual competitions.
- **[CTF101](https://ctf101.org/)**: Extremely handy documentation/wiki for common CTF practices and challenges per-category.
- **[OverTheWire](https://overthewire.org/wargames/)**: A "wargame" year-round CTF with hundreds of level-based challenges to help practice security concepts.
- **[CTFTime](https://ctftime.org/)**: Serves as a "hub" for the global CTF community, with information regarding upcoming competitions, leaderboards, writeups (how-to-solve walkthroughs), and more!

---

<img src="https://s01.flagcounter.com/count2/8Xkk/bg_161616/txt_C9CACC/border_E9D3B6/columns_3/maxflags_12/viewers_3/labels_0/pageviews_1/flags_1/percent_0/">