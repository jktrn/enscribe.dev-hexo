---
title: picoCTF 2022
date: 2022-04-10 17:07:16
hidden: true
description: "Information regarding placement, solves, and writeups for picoCTF 2022."
permalink: ctfs/pico22/
thumbnail: https://enscribe.dev/asset/banner/banner-ctfs.png
---

<style>
    .column {
        float: left;
        width: 50%;
        padding: 5px;
    }

    .row::after {
        content: "";
        clear: both;
        display: table;
    }
</style>

<div class="box">
    <b>Start Time</b>: Tue, 15 March 2022, 10:00 PDT<br>
    <b>End Time</b>: Tue, 29 March 2022, 13:00 PDT<br>
    <b>CTFTime</b>: <a href="https://ctftime.org/event/1578">click here!</a>
</div>

<div class="box">
    <b>Team Name</b>: <code>NLE CHAKRA</code><br>
    <b>Place</b>: 86 of 1329 (US Middle/High School)<br>
    <b>Points</b>: 8900
</div>

<div class="box">
    <b>Writeups</b>:<br><br>
    <div class="row">
        <div class="column">
            <a href="/ctfs/pico22/pwn/buffer-overflow-series/"><img width=400 src="/asset/banner/banner-buffer-overflow.png" style="width:100%"></a>
            <sub>pico22/pwn: <a href="/ctfs/pico22/pwn/buffer-overflow-series/">Buffer overflow series</a></sub>
        </div>
        <div class="column">
            <a href="/ctfs/pico22/beginners-compilation/"><img width=400 src="/asset/banner/banner-beginners.png" style="width:100%"></a>
            <sub>pico22/: <a href="/ctfs/pico22/beginners-compilation">Beginner's Compilation</a></sub>
        </div>
    </div>
</div>

<div class="box no-highlight">
    <details>
        <summary><b>View Team Board:</b></summary>

| Username           | Score |
|--------------------|-------|
| enscribe (captain) | 5600  |
| RobertuhBruh       | 3300  |
| MRTEA              | 100   |
| joyly              | 0     |
| Darkvirgo15        | 0     |

<br>
</details>
<details>
    <summary><b>View Solves:</b></summary>

| Name                 | Points | Category  | Status   | Writeup                                                                     |
|----------------------|--------|-----------|----------|-----------------------------------------------------------------------------|
| ⠀                    |        |           |          |                                                                             |
| basic-file-exploit   | 100    | pwn       | Solved   | [click here!](https://enscribe.dev/ctfs/pico22/pwn/beginners-compilation/)     |
| buffer overflow 0    | 100    | pwn       | Solved   | [click here!](https://enscribe.dev/ctfs/pico22/pwn/buffer-overflow-series/) |
| CVE-XXXX-XXXX        | 100    | pwn       | Solved   |                                                                             |
| buffer overflow 1    | 200    | pwn       | Solved   | [click here!](https://enscribe.dev/ctfs/pico22/pwn/buffer-overflow-series/) |
| RPS                  | 200    | pwn       | Solved   |                                                                             |
| x-sixty-what         | 200    | pwn       | Solved   |                                                                             |
| buffer overflow 2    | 300    | pwn       | Solved   |                                                                             |
| buffer overflow 3    | 300    | pwn       | Solved   |                                                                             |
| flag leak            | 300    | pwn       | Solved   |                                                                             |
| ropfu                | 300    | pwn       | Solved   | [click here!](https://enscribe.dev/ctfs/pico22/pwn/beginners-compilation/)                  |
| wine                 | 300    | pwn       | Unsolved |                                                                             |
| function overwrite   | 400    | pwn       | Unsolved |                                                                             |
| stack cache          | 400    | pwn       | Unsolved |                                                                             |
| solfire              | 500    | pwn       | Unsolved |                                                                             |
| basic-mod1           | 100    | crypto    | Solved   | [click here!](https://enscribe.dev/ctfs/pico22/beginners-compilation/)        |
| basic-mod2           | 100    | crypto    | Solved   | [click here!](https://enscribe.dev/ctfs/pico22/beginners-compilation/)        |
| credstuff            | 100    | crypto    | Solved   |                                                                             |
| morse-code           | 100    | crypto    | Solved   |                                                                             |
| substitution0        | 100    | crypto    | Solved   |                                                                             |
| substitution1        | 100    | crypto    | Solved   |                                                                             |
| substitution2        | 100    | crypto    | Solved   |                                                                             |
| transposition-trial  | 100    | crypto    | Solved   |                                                                             |
| Vigenere             | 100    | crypto    | Solved   |                                                                             |
| Very Smooth          | 300    | crypto    | Unsolved |                                                                             |
| Sequences            | 400    | crypto    | Unsolved |                                                                             |
| Sum-O-Primes         | 400    | crypto    | Unsolved |                                                                             |
| NSA Backdoor         | 500    | crypto    | Unsolved |                                                                             |
| Enhance!             | 100    | forensics | Solved   |                                                                             |
| File types           | 100    | forensics | Solved   |                                                                             |
| Lookey here          | 100    | forensics | Solved   |                                                                             |
| Packets Primer       | 100    | forensics | Solved   |                                                                             |
| Redaction gone wrong | 100    | forensics | Solved   |                                                                             |
| Sleuthkit Intro      | 100    | forensics | Solved   |                                                                             |
| Sleuthkit Apprentice | 200    | forensics | Solved   |                                                                             |
| Eavesdrop            | 300    | forensics | Solved   |                                                                             |
| Operation Oni        | 300    | forensics | Solved   |                                                                             |
| St3g0                | 300    | forensics | Solved   |                                                                             |
| Operation Orchid     | 400    | forensics | Solved   |                                                                             |
| SideChannel          | 400    | forensics | Solved   |                                                                             |
| Torrent Analyze      | 400    | forensics | Unsolved |                                                                             |
| file-run1            | 100    | re        | Solved   |                                                                             |
| file-run2            | 100    | re        | Solved   |                                                                             |
| GDB Test Drive       | 100    | re        | Solved   |                                                                             |
| patchme.py           | 100    | re        | Solved   |                                                                             |
| Safe Opener          | 100    | re        | Solved   |                                                                             |
| unpackme.py          | 100    | re        | Solved   |                                                                             |
| bloat.py             | 200    | re        | Solved   |                                                                             |
| Fresh Java           | 200    | re        | Solved   |                                                                             |
| Bbbbloat             | 300    | re        | Solved   |                                                                             |
| unpackme             | 300    | re        | Solved   |                                                                             |
| Keygenme             | 400    | re        | Unsolved |                                                                             |
| Wizardlike           | 500    | re        | Unsolved |                                                                             |
| Includes             | 100    | web       | Solved   |                                                                             |
| Inspect HTML         | 100    | web       | Solved   |                                                                             |
| Local Authority      | 100    | web       | Solved   |                                                                             |
| Search source        | 100    | web       | Solved   |                                                                             |
| Forbidden Paths      | 200    | web       | Solved   |                                                                             |
| Power Cookie         | 200    | web       | Solved   |                                                                             |
| Roboto Sans          | 200    | web       | Solved   |                                                                             |
| Secrets              | 200    | web       | Solved   |                                                                             |
| SQL Direct           | 300    | web       | Solved   |                                                                             |
| SQLiLite             | 300    | web       | Solved   |                                                                             |
| Live Art             | 500    | web       | Unsolved |                                                                             |
| Noted                | 500    | web       | Unsolved |                                                                             |

</details>
</div>
