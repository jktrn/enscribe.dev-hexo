---
title: "shctf/web: R2D2"
date: 2022-04-05 10:55:00
tags:
- ctf
- shctf
- web
description: "Writeup for the Space Heroes CTF web challenge [R2D2]."
permalink: ctfs/shctf/web/r2d2/
---

## 📜 Description
We wouldn't miss the opportunity to make this dad joke. \
http://173.230.138.139/ \
https://spaceheroes-web-r2d2.chals.io

**Author:** v10l3nt

---

## 🔍 Detailed Solution

Upon visiting the URL we're greeted with this:

![r2d2-website](/images/r2d2-website.PNG)

Let's take a look at the source code with `F12`.

```html
<html>
<h1>Roger, Roger</h1>
<img src="/static/images/robots.jpeg" />
<h4>No, you are the one who is useless.</h4>
</html>
```
We see that the image on the website is named `robots.jpeg`. What happens if we visit `robots.txt`? 🤔
```sh
$ curl http://173.230.138.139/robots.txt
shctf{th1s-aster0id-1$-n0t-3ntir3ly-stable}
```