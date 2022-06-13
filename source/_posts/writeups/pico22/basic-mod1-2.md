---
title: "pico22/crypto: basic-mod1/2"
date: 2022-04-05 13:42:32
tags:
- ctf
- pico22
- crypto
description: "Learn how to use JavaScript and Python3 to map numbers to character sets! This is my writeup for the picoCTF 2022 cryptography challenges \"basic-mod1/2\"."
permalink: ctfs/pico22/crypto/basic-mod1-2/
thumbnail: /asset/banner/banner-basic-mod.png
---

<style>
    .box {
        border: 1px solid rgba(100, 100, 100, .5);
        padding: 1rem;
        font-size: 90%;
        text-align: center;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
    .flex-container {
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
    }
</style>

## basic-mod1

<div class="box">
We found this weird message being passed around on the servers, we think we have a working decryption scheme. Take each number mod 37 and map it to the following character set: 0-25 is the alphabet (uppercase), 26-35 are the decimal digits, and 36 is an underscore. Wrap your decrypted message in the picoCTF flag format (i.e. <code>picoCTF{decrypted_message}</code>)
</div>

Let's go over what it's asking:

- Calculate `% 37` for each number
- Map each number to this specific charset:
  - 0-25 = Uppercase alphabet (A-Z)
  - 26-35 = Decimal digits (0-9)
  - 36 = Underscore ("_")

I was too lazy to learn Python and do that, so here it is in native Javascript:

```js
// Splitting into array
x = "54 211 168 309 262 110 272 73 54 137 131 383 188 332 [REDACTED]".split();
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

Looking back at the problem after I learned Python, here's a solution that's significantly cleaner:

```py
#!/usr/bin/env python3
import string
x = "54 211 168 309 262 110 272 73 54 137 131 383 188 332 [REDACTED]"
y = x.split()

a = string.ascii_uppercase + string.digits + "_"

# Insane list comprehension
z = [a[int(i) % 37] for i in y]
print("picoCTF{"+''.join(z)+"}")
```

```text
$ python3 solve.py
picoCTF{R0UND_N_R0UND_********}
```

---

## basic-mod2

<div class="box">
A new modular challenge!
Take each number mod 41 and find the modular inverse for the result. Then map to the following character set: 1-26 are the alphabet, 27-36 are the decimal digits, and 37 is an underscore.
Wrap your decrypted message in the picoCTF flag format (<code>picoCTF{decrypted_message}</code>).
</div>

Let's go over what it's asking once again:

- Calculate `% 41` for each number
- Map each number to this specific charset:
  - 1-26 = Uppercase alphabet (A-Z)
  - 27-36 = Decimal digits (0-9)
  - 37 = Underscore ("_")

Here's a stupidly long Javascript snippet I made to solve this:

```js
//Splitting into array
x = "54 211 168 309 262 110 272 73 54 137 131 383 188 332 [REDACTED]".split();
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

```text
picoCTF{1NV3R53LY_H4RD_********}
```

<a href="https://info.flagcounter.com/8Xkk"><img src="https://s01.flagcounter.com/count2/8Xkk/bg_212326/txt_C9CACC/border_C9CACC/columns_3/maxflags_12/viewers_3/labels_0/pageviews_1/flags_1/percent_0/" alt="Free counters!" border="0"></a>
