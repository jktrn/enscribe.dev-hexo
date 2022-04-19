---
title: "pico22/crypto: basic-mod1"
date: 2022-04-05 13:42:32
tags:
- ctf
- pico22
- crypto
description: "Writeup for the picoCTF 2022 crypto challenge [basic-mod1]."
permalink: ctfs/pico22/crypto/basic-mod1/
---

## 📜 Description
We found this weird message being passed around on the servers, we think we have a working decrpytion scheme. Download the message [here](https://artifacts.picoctf.net/c/396/message.txt). Take each number mod 37 and map it to the following character set: 0-25 is the alphabet (uppercase), 26-35 are the decimal digits, and 36 is an underscore. Wrap your decrypted message in the picoCTF flag format (i.e. `picoCTF{decrypted_message}`)

---

## 🔍 Detailed Solution

```js
x = "54 211 168 309 262 110 272 73 54 137 131 383 188 332 39 396 370 182 328 327 366 70".split(" ");
y = x.map(x => x % 37);
z = [];
for (let i = 0; i < y.length; i++) {
	if (y[i] >= 0 && y[i] <= 25) z.push(String.fromCharCode(y[i] + 'A'.charCodeAt(0)));
	else if (y[i] >= 26 && y[i] <= 35) z.push(y[i] - 26);
	else if (y[i] == 36) z.push("_");
}
z = z.join("");
console.log(`picoCTF{${z}}`);
```
```
picoCTF{R0UND_N_R0UND_********}
```