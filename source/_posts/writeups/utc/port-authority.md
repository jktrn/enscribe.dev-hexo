---
title: "utc/prog: Port Authority"
date: 2022-07-16 23:07:37
categories:
- ctfs
- utc
- prog
tags: programming, websocket
description: "Play a JSON-controlled strategy game through a WebSocket! This is my writeup for the Hackazon Unlock the City programming challenge \"Port Authority\"."
permalink: ctfs/utc/prog/port-authority/
thumbnail: https://enscribe.dev/asset/banner/banner-ctfs.png
---

<script src="https://kit.fontawesome.com/129342a70b.js" crossorigin="anonymous"></script>

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

    .text-info {
        border: 1px solid #35678C;
        border-radius: 5px;
        background-color: #35678C;
        padding: 1rem;
        font-size: 90%;
        text-align: center;
    }

    .flex-container {
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        gap: 1rem;
    }

    .centered-element {
        margin: 0;
        position: absolute;
         top: 50%;
        transform: translateY(-50%);
    }

    img {
        border-radius: 5px;
    }
</style>

<div class="flex-container">
    <div class="box" style="padding-top:20px;">
        The harbour is in total chaos, the ships are no longer on course. The AI has disabled the brakes of all the ships and corrupted our control systems. The ships about to crash into each other, can you build a new AI that will rescue the ships and deliver the cargo?<br><br>
        <i>Author information: This challenge is developed by <a href="https://www.linkedin.com/in/luuk-hofman-01164259/">Luuk Hofman</a> and <a href="https://www.linkedin.com/in/diederik-bakker/">Diederik Bakker</a>.</i>
    </div>
    <div>
        <img src="/asset/utc/ship.png" style="width:950px; margin-top: 1rem; margin-bottom: 1rem;">
    </div>
</div>

<div class="text-info" style="margin-bottom: 1rem;">
<i class="fa-solid fa-circle-info"></i> Note: This is an <b>instance-based</b> challenge. No website URL will be provided!
</div>

We're initially provided with a link that takes us to a nice-looking webgame called the "Port Traffic Control Interface":

![Initial Website](/asset/utc/initial-website.png)

Although we can't directly interact with the game using keyboard controls, there's a manual on the top-right which details the task:

![Manual Website](/asset/utc/manual-website.png)

According to this, we can start playing the game and controlling the ships that appear through a [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/) connection, which is an API that enables two-way connection between a user's browser and a server. Information can be freely sent/received without requiring a reply.

<a href="https://info.flagcounter.com/8Xkk"><img src="https://s01.flagcounter.com/count2/8Xkk/bg_212326/txt_C9CACC/border_C9CACC/columns_3/maxflags_12/viewers_3/labels_0/pageviews_1/flags_1/percent_0/" alt="Free counters!" border="0"></a>
