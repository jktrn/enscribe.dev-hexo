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

![Banner](/asset/blog/wtf-is-a-ctf/banner.jpg)

<div class="subtitle">Courtesy <a href="https://thedailytexan.com/staff_name/joshua-guenther/">Joshua Guenther</a></div>

0-day vulnerabilities. Privilege escalation. Real-time application exploiting and hacking. These are just a few of the countless facets of a **capture-the-flag**, a form of cybersecurity competition in which teams combat each other to accrue points under time pressure. Solve challenges, exploit weaknesses, and climb the leaderboard to earn prizes.
 
## Types of CTFs

There are two signature types of CTFs:

{% grid columns:2 %}
<i class="fa-solid fa-flag"></i> Jeopardy:
    description: |
        Competition organizers design challenges in several distinct categories: web, crypto, pwn, reverse, forensics, etc. Challenges — typically in the format of a file or website — are solved by discovering a text-based "flag" planted within them, in the format `flag{th15_i5_a_f1ag}`. This is by far the most common form of CTF, with multiple online-based competitions being hosted internationally on a weekly basis.
        <br><br>
        ![Jeopardy](/asset/blog/wtf-is-a-ctf/jeopardy.svg)
<i class="fa-solid fa-arrow-down-up-across-line"></i> Attack-Defense:
    description: |
        Teams are given a remote service, host, or network to protect whilst an enemy team attempts to exploit its processes to gain access. Teams need to both attack and defend simultaneously, making these competitions rare and difficult. DEFCON, widely considered to be the World Cup/Olympics of cybersecurity, hosts an annual Attack-Defense CTF with the greatest collegiate and professional teams in the world.
        <br><br>
        ![Attack-Defense](/asset/blog/wtf-is-a-ctf/attack-defense.jpg)
        <div class="subtitle">Courtesy <a href="https://twitter.com/r3kapig">r3kapig</a></div>
{% endgrid %}

## What do these categories entail?

{% grid columns:2 %}
<i class="fa-solid fa-bomb" style="color:#f44336"></i> pwn:
    description: |
        Also known as **binary exploitation**, these challenges involve exploiting compiled Linux executables hosted on servers to obtain flags, often through deprecated C functions that the program uses. It requires knowledge of assembly code, the stack structure, exploit-writing (via Python and [pwntools](https://docs.pwntools.com/en/stable/)), and attack vectors (i.e. [format string](https://owasp.org/www-community/attacks/Format_string_attack), [buffer overflow](https://en.wikipedia.org/wiki/Buffer_overflow)).
<i class="fa-solid fa-lock" style="color:#2196f3"></i> crypto: 
    description: |
        Short for **cryptography** ([NOT CRYPTOCURRENCY](https://www.cryptoisnotcryptocurrency.com/) ಠ_ಠ), these challenges are ciphertext and/or encryption-based. They often involve both contemporary ([RSA](https://en.wikipedia.org/wiki/RSA_(cryptosystem)), [Diffie-Helman](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange), and [XOR](https://en.wikipedia.org/wiki/XOR_cipher)) and old/obscure (i.e. Vigenere, Pigpen, Caesar) cryptosystems. Lots of math and paper-reading involved, and recommended if you do competitive programming!
<i class="fa-solid fa-magnifying-glass" style="color:#4caf50"></i> forensics:
    description: |
        These challenges involve analysis of files — often `.pcap` [packet captures](https://www.solarwinds.com/resources/it-glossary/pcap), steganography, OS captures/images/memory dumps, or audio snippets. Files can occasionally be partially/fully corrupt, or obfuscated in an seemingly unrecoverable manner. Requires an understanding of software like [FTK Imager](https://www.exterro.com/ftk-imager), [Volatility](https://www.volatilityfoundation.org/), and [Wireshark](https://www.wireshark.org/).
<i class="fa-solid fa-recycle" style="color:#9c27b0"></i> reverse: 
    description: |
        Short for **reverse engineering**, these challenges involve disassembling/analyzing a compiled program (of various different languages) to identify and exploit its vulnerabilities. Similar to `pwn`, this category requires knowledge of C, assembly code, and various open-source softwares (i.e. [Ghidra](https://ghidra-sre.org/), [Binary Ninja](https://binary.ninja/), [IDA](https://hex-rays.com/ida-free/)).
<i class="fa-solid fa-globe" style="color:#00bcd4"></i> web:
    description: |
        These challenges involve finding secrets and/or exploiting vulnerabilities in a web application. As a very popular category, types of attacks vectors and execution can significantly vary. Some examples include [path traversal](https://owasp.org/www-community/attacks/Path_Traversal), [insecure deserialization](https://portswigger.net/web-security/deserialization), DOM-based [cookie manipulation](https://portswigger.net/web-security/dom-based/cookie-manipulation), [SQL injection](https://www.w3schools.com/sql/sql_injection.asp), and more!
<i class="fa-solid fa-eye"></i> osint:
    description: |
        Short for **open-source intelligence**, these challenges utilize the internet's resources against small snippets of information (i.e. pictures, social media, screenshots, email) to gain sensitive/personally identifying information. [GEOINT](https://en.wikipedia.org/wiki/Geospatial_intelligence) involves geographic coordinates, which must be acquired from metadata-stripped images.
{% endgrid %}

## Why should I play?

Capture-the-flag is one of the best (and only) ways to gain a hands-on experience within the cybersecurity field. They're a way to expose yourself to bleeding-edge technologies, exploits, and even people. Assembling a team allows you to learn from each other, as often people have strengths and weaknesses in the various categories. The competition itself might offer opportunities, cash prizes or other benefits, and it is a fantastic way build your resume and network. 

## I want to start, but I don't know where?

Although the field may seem extremely overwhelming and difficult to get into, there's infinite resources on the internet to get you up to spec with prerequisite knowledge:

- **[CTFTime](https://ctftime.org/)**: Serves as a "hub" for the global CTF community, with information regarding upcoming competitions, leaderboards, writeups (how-to-solve walkthroughs), and more!
- **[picoCTF](https://picoctf.org/resources)**: A CTF run by Carnegie Mellon University, providing handy learning guides for each CTF category, "Primer" documentation, and the "picoGym", which contains every challenge from its previous annual competitions.
- **[CTF101](https://ctf101.org/)**: Extremely handy documentation/wiki for common CTF practices and challenges per-category.
- **[OverTheWire](https://overthewire.org/wargames/)**: A "wargame" year-round CTF with hundreds of level-based challenges to help practice security concepts.

---

<img src="https://s01.flagcounter.com/count2/8Xkk/bg_161616/txt_C9CACC/border_E9D3B6/columns_3/maxflags_12/viewers_3/labels_0/pageviews_1/flags_1/percent_0/">