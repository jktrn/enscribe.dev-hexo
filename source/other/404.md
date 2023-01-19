---
title: 404 Not Found! (ugh)
permalink: /404.html
---

<div align=center>

<h1>enscribe is stupid and moved this article!</h1>

<b>You'll be redirected to the homepage in <span id="timeout">10</span> seconds.</b>
Really sorry about this; the post is probably somewhere in `/articles`. 

If it doesn't work (or you're impatient), feel free to click [here](/).

</div>

<script>
let countTime = 10;

function count() {
  
  document.getElementById('timeout').textContent = countTime;
  countTime -= 1;
  if(countTime === 0){
    location.href = 'https://enscribe.dev/'
  }
  setTimeout(() => {
    count();
  }, 1000);
}

count();
</script>