---
title: "pico22/crypto: basic-mod1/2"
date: 2022-04-05 13:42:32
categories:
- ctfs
- pico22
- crypto
tags:
- crypto
- programming
description: "Learn how to use JavaScript and Python3 to map numbers to character sets! This is my writeup for the picoCTF 2022 cryptography challenges \"basic-mod1/2\"."
permalink: ctfs/pico22/crypto/basic-mod1-2/
thumbnail: /asset/banner/banner-basic-mod.png
hidden: true
---

## basic-mod1

{% box %}
We found this weird message being passed around on the servers, we think we have a working decryption scheme. Take each number mod 37 and map it to the following character set: 0-25 is the alphabet (uppercase), 26-35 are the decimal digits, and 36 is an underscore. Wrap your decrypted message in the picoCTF flag format (i.e. `picoCTF{decrypted_message}`)<br><br>
**Author**: Will Hong  
<details><summary>**Hints**:</summary>
1. Do you know what `mod 37`means?  
2. `mod` 37 means modulo 37. It gives the remainder of a number after being divided by 37.</details>
{% endbox %}

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

{% ccb html:true %}
<span class="meta prompt_">$ </span>node solve.js
picoCTF{R0UND_N_R0UND_<span style="color:#696969"><b>[REDACTED]</b></span>}
{% endccb %}


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

{% ccb html:true %}
<span class="meta prompt_">$ </span>python3 solve.py
picoCTF{R0UND_N_R0UND_<span style="color:#696969"><b>[REDACTED]</b></span>}
{% endccb %}

---

## basic-mod2

{% box %}
A new modular challenge!
Take each number mod 41 and find the modular inverse for the result. Then map to the following character set: 1-26 are the alphabet, 27-36 are the decimal digits, and 37 is an underscore.
Wrap your decrypted message in the picoCTF flag format (`picoCTF{decrypted_message}`).
{% endbox %}

Let's go over what it's asking once again:

- Calculate `% 41` for each number
- Map each number to this specific charset:
  - 1-26 = Uppercase alphabet (A-Z)
  - 27-36 = Decimal digits (0-9)
  - 37 = Underscore ("_")

Here's a stupidly long Javascript snippet I made to solve this:

```js
// Splitting into array
x = "54 211 168 309 262 110 272 73 54 137 131 383 188 332 [REDACTED]".split();
// Mapping to % 41 with modular inverse of 41
y = x.map(x => x % 41).map(x => modInverse(x, 41));
z = [];

// Mapping to charset
for (let i = 0; i < y.length; i++) {
    if (y[i] >= 1 && y[i] <= 26) z.push(String.fromCharCode(y[i] + 64));
    else if (y[i] >= 27 && y[i] <= 36) z.push(y[i] - 27);
    else if (y[i] == 37) z.push("_");
}

console.log(`picoCTF{${z.join("")}}`);

// credit to: https://rosettacode.org/wiki/Modular_inverse
function modInverse(a, b) {
    a %= b;
    for (var x = 1; x < b; x++) {
        if ((a * x) % b == 1) {
            return x;
        }
    }
}
```

{% ccb html:true %}
<span class="meta prompt_">$ </span>node solve.js
picoCTF{1NV3R53LY_H4RD_<span style="color:#696969"><b>[REDACTED]</b></span>}
{% endccb %}

{% flagcounter %}