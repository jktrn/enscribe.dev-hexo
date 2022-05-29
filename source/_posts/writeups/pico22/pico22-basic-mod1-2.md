---
title: "pico22/crypto: basic-mod1/2"
date: 2022-04-05 13:42:32
tags:
- ctf
- pico22
- crypto
description: "Writeup for the picoCTF 2022 crypto challenge [basic-mod1/2]."
permalink: ctfs/pico22/crypto/basic-mod1-2/
thumbnail: https://files.catbox.moe/5udwod.png
---

## basic-mod1

### 📜 Description (1)

We found this weird message being passed around on the servers, we think we have a working decrpytion scheme. Take each number mod 37 and map it to the following character set: 0-25 is the alphabet (uppercase), 26-35 are the decimal digits, and 36 is an underscore. Wrap your decrypted message in the picoCTF flag format (i.e. `picoCTF{decrypted_message}`)

---

### 🔍 Detailed Solution (1)

Let's go over what it's asking:

- Calculate `% 37` for each number
- Map each number to this specific charset:
  - 0-25 = Uppercase alphabet (A-Z)
  - 26-35 = Decimal digits (0-9)
  - 36 = Underscore ("_")

I was too lazy to learn python and do that, so here it is in native Javascript:

```js
// Splitting into array
x = "54 211 168 309 262 110 272 73 54 137 131 383 188 332 39 396 370 182 328 327 366 70".split();
// Mod 37
y = x.map(x => x % 37);
z = [];
for (let i = 0; i < y.length; i++) {
    // Mapping to charset
    if (y[i] >= 0 && y[i] <= 25) {
      z.push(String.fromCharCode(y[i] + 'A'.charCodeAt(0)));
    } else if (y[i] >= 26 && y[i] <= 35) {
      z.push(y[i] - 26);
    } else if (y[i] == 36) {
      z.push("_");
    }
}
// Combine back to string
z = z.join("");
console.log(`picoCTF{${z}}`);
```

Looking back at the problem after I learned `python3`, here's a solution that's significantly more efficient:

```py
#!/usr/bin/env python3
import string
x = "54 211 168 309 262 110 272 73 54 137 131 383 188 332 39 396 370 182 328 327 366 70"
y = x.split()

a = string.ascii_uppercase + string.digits + "_"

# Insane list comprehension
z = [a[int(i) % 37] for i in y]
print("picoCTF{"+''.join(z)+"}")
```

```js
`picoCTF{R0UND_N_R0UND_${secret}}`
```

## basic-mod2

### 📰 Description (2)

A new modular challenge!
Take each number mod 41 and find the modular inverse for the result. Then map to the following character set: 1-26 are the alphabet, 27-36 are the decimal digits, and 37 is an underscore.
Wrap your decrypted message in the picoCTF flag format (`picoCTF{decrypted_message}`).

---

### 🔎 Detailed Solution (2)

Let's go over what it's asking once again:

- Calculate `% 41` for each number
- Map each number to this specific charset:
  - 1-26 = Uppercase alphabet (A-Z)
  - 27-36 = Decimal digits (0-9)
  - 37 = Underscore ("_")

Here's a stupidly long Javascript snippet I made to solve this:

```js
//Splitting into array
x = "54 211 168 309 262 110 272 73 54 137 131 383 188 332 39 396 370 182 328 327 366 70".split();
//Mapping to % 41 with modular inverse of 41
y = x.map(x => x % 41).map(x => modInverse(x, 41));
z = [];

//Mapping to charset
for(let i = 0; i < y.length; i++) {
    if(y[i] >= 1 && y[i] <= 26) z.push(String.fromCharCode(y[i] + 64));
    else if(y[i] >= 27 && y[i] <= 36) z.push(y[i] - 27);
    else if(y[i] == 37) z.push("_");
}

console.log(`picoCTF{${z.join("")}}`);

//credit to: https://rosettacode.org/wiki/Modular_inverse
function modInverse(a, b) {
  a %= b;
  for (var x = 1; x < b; x++) {
      if ((a * x) % b == 1) {
          return x;
      }
  }
}
```

```js
`picoCTF{1NV3R53LY_H4RD_${secret}}`
```
