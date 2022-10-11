---
title: "WTF is a CTF?"
date: 2022-10-10 18:52:22
categories:
- blog
tags:
- ctfs
description: "An introduction to the world of \"Capture-the-Flag\" competitions, what they entail, and why you should play!"
permalink: blog/wtf-is-a-ctf/
thumbnail: https://enscribe.dev/asset/banner/banner-ctfs.png
---

{% fontawesome %}

0-day vulnerabilities. Privilege escalation. Real-time application exploiting and hacking. These are just a few of the countless facets of a **capture-the-flag**, a form of cybersecurity competition in which teams combat each other to accrue points under time pressure. Solve challenges, exploit weaknesses, and climb the leaderboard to earn prizes.
 
## Types of CTFs

There are two signature types of CTFs:

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