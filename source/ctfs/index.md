---
title: Capture the Flag Info 🏴
date: 2022-04-04 12:38:45
description: "Here's information, statistics, and writeups for all of my previous cybersecurity Capture the Flag (CTF) competitions."
---

| Placement    | Name                                                    | Date             | Team            | Points | CTFtime                                       |
|--------------|---------------------------------------------------------|------------------|-----------------|--------|-----------------------------------------------|
|              |                                                         |                  |                 |        | ⠀                                             |
| TBD          | 📐 [ångstromCTF 2022]()                                 | 29-04 May 2022   | `Project Sekai` | TBD    | [click here!](https://ctftime.org/event/1588) |
| TBD          | 🕵️ [NahamCon 2022]()                                    | 28-30 April 2022 | `Project Sekai` | TBD    | [click here!](https://ctftime.org/event/1630) |
| TBD          | 🦅 [PatriotCTF]()                                       | 29-30 April 2022 | `View Source`   | TBD    | [click here!](https://ctftime.org/event/1616) |
| TBD          | 🌃 [MidnightFlag 2022]()                                | 23-23 April 2022 | `View Source`   | TBD    | [click here!](https://ctftime.org/event/1610) |
| 03 of 758 🥉 | 👥 [CrewCTF 2022](https://enscribe.dev/ctfs/crew/)      | 15-17 April 2022 | `Project Sekai` | 21000  | [click here!](https://ctftime.org/event/1568) |
| 04 of 501 🥈 | 🔐 [JerseyCTF II](https://enscribe.dev/ctfs/jersey/)    | 09-10 April 2022 | `View Source`   | 11315  | [click here!](https://ctftime.org/event/1590) |
| 07 of ~55    | 💾 [TSA CTF 2021](https://enscribe.dev/ctfs/tsa21/)     | 01-03 June 2021  | `VHTPA`         | n/a    | n/a (private)                                 |
| 19 of 477    | 🤠 [TAMUctf 2022](https://enscribe.dev/ctfs/tamu/)      | 15-17 April 2022 | `Project Sekai` | 3528   | [click here!](https://ctftime.org/event/1557) |
| 26 of 426    | 🐲 [DCTF 2022](https://enscribe.dev/ctfs/dctf/)         | 15-17 April 2022 | `View Source`   | 1600   | [click here!](https://ctftime.org/event/1569) |
| 36 of 778    | 🌌 [Space Heroes CTF](https://enscribe.dev/ctfs/shctf/) | 01-03 April 2022 | `WhileSEC`      | 3483   | [click here!](https://ctftime.org/event/1567) |
| 86 of 1329   | 🚩 [picoCTF 2022](https://enscribe.dev/ctfs/pico22/)    | 15-29 March 2022 | `NLE CHAKRA`    | 8900   | [click here!](https://ctftime.org/event/1578) |


</details>

---

## What is a CTF?
In cybersecurity, capture-the-flag competitions (CTFs) are a typically team-based activity in which players will partake in various challenges to accrue points and secure positions on a leaderboard. There are two signature types of CTFs:
- **Jeopardy**: Competition organizers design challenges in several distinct categories: web exploitation (web/webex), forensics, reverse engineering (re/rev), binary exploitation (binex/pwn), cryptography (crypto), etc. Challenges are solved by finding a flag planted within them, in the format `flag{th15_i5_a_f1ag}`. *(This is the type I participate in!)*
- **Attack-Defense**: Teams are given a remote service, device, or host to protect whilst an enemy team attempts to exploit its processes to gain access.

## What do these categories entail?
- **👩‍💻 Binary Exploitation/`binex/pwn`**: These challenges involve exploiting Linux executables hosted on servers to obtain flags, often through deprecated/vulnerable C-language functions that the executable uses. Requires an understanding of assembly code, the stack data structure, and exploit-writing (via Python and [pwntools](https://docs.pwntools.com/en/stable/)).
- **👁‍🗨 Cryptography/`crypto`**: These challenges consist of identifying and decoding provided ciphertexts, often in both old/obscure encryption methods (i.e. Vigenere, Pigpen, Caesar) and more contemporary ones ([RSA](https://en.wikipedia.org/wiki/RSA_(cryptosystem)), [Diffie-Hellman](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange), and [XOR](https://en.wikipedia.org/wiki/XOR_cipher) cryptosystems).
- **🔍 Forensics**: These challenges involve analysis of files — often [packet captures](https://www.solarwinds.com/resources/it-glossary/pcap), images (steganography), or unknown data types. Files can occasionally be partially/fully corrupt, or obfuscated in an seemingly unrecoverable manner. 
- **🔃 Reverse Engineering/`re/rev`**: These challenges involve attempting to reverse engineer a compiled program to identify and exploit its vulnerabilities. Similar to `pwn`, this category requires knowledge of the C programming language, assembly code, and various open-source software to analyse/decompile the provided executables (i.e. [Ghidra](https://ghidra-sre.org/), [Binary Ninja](https://binary.ninja/), [IDA](https://hex-rays.com/ida-free/))
- **🌐 Web Exploitation/`web`**: These challenges involve finding secrets and/or exploiting vulnerabilities in a website/web application. This can range from finding a comment in its `index.html` to SQL/command injection.

## What team do you currently play on?
Currently I'm freelance, and typically get picked up when advertising myself as a pwn/crypto player in any `#looking-for-group` channel. However, I am looking for a permanent, preferably advanced team to play with. Please feel free to message me if you're looking for one!

## I want to start, but I don't know where?!
Although the field may seem extremely overwhelming and difficult to get into, there are a seemingly endless amount of resources available on the internet to get you up to spec with prerequisite knowledge:
- **[picoCTF](https://picoctf.org/resources)**: A CTF run by Carnegie Mellon University, providing handy learning guides for each CTF category, "Primer" documentation, and the `picoGym`, which contains every challenge from its previous annual competitions.
- **[CTF101](https://ctf101.org/)**: Extremely handy documentation/wiki for common CTF practices and challenges per-category.
- **[OverTheWire](https://overthewire.org/wargames/)**: A "wargame" year-round CTF with hundreds of level-based challenges to help practice security concepts.
- **[CTFTime](https://ctftime.org/)**: Serves as a "hub" for the global CTF community, with information regarding upcoming competitions, leaderboards, writeups (how-to-solve walkthroughs), and more!