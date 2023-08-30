---
title: Profiles · enscribe.dev
date: 2022-04-05 16:20:02
description: "My social media/gaming profiles alongside methods of contact."
thumbnail: /static/banner.png
hidden: true
layout: page
permalink: /profiles/
---

<style>
    .pushable {
        position: relative;
        border: none;
        background: transparent;
        padding: 0;
        cursor: pointer;
        outline-offset: 4px;
        transition: filter 250ms;
        margin: 12px 12px 12px 12px;
    }

    .shadow {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 12px;
        background: hsl(0deg 0% 0% / 0.25);
        will-change: transform;
        transform: translateY(2px);
        transition:
            transform 600ms cubic-bezier(.3, .7, .4, 1);
    }

    .edge {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 12px;
        background: #171717
    }

    .front {
        display: block;
        position: relative;
        padding: 20px 42px;
        border-radius: 12px;
        font-size: 1.25rem;
        font-family: "JetBrains Mono", monospace;
        color: white;
        background: #1D1D1D;
        will-change: transform;
        transform: translateY(-4px);
        transition:
            transform 600ms cubic-bezier(.3, .7, .4, 1);
    }

    .pushable:hover .front {
        transform: translateY(-6px);
        transition:
            transform 250ms cubic-bezier(.3, .7, .4, 1.5);
    }

    .pushable:active .front {
        transform: translateY(-2px);
        transition: transform 34ms;
    }

    .pushable:hover .shadow {
        transform: translateY(4px);
        transition:
            transform 250ms cubic-bezier(.3, .7, .4, 1.5);
    }

    .pushable:active .shadow {
        transform: translateY(1px);
        transition: transform 34ms;
    }

    .pushable:focus:not(:focus-visible) {
        outline: none;
    }
</style>

<button class="pushable" style="margin-top:1.5rem">
    <a href="/profiles/discord">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">
            <i class="fa-brands fa-discord"></i> discord
        </span>
    </a>
</button>

<button class="pushable">
    <a href="/profiles/github">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">
            <i class="fa-brands fa-github"></i> github
        </span>
    </a>
</button>

<button class="pushable">
    <a href="/profiles/twitter">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">
            <i class="fa-brands fa-x-twitter"></i> twitter
        </span>
    </a>
</button>

<button class="pushable">
    <a href="/profiles/ctftime">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">
            <i class="fa-solid fa-flag"></i> ctftime
        </span>
    </a>
</button>

## <i class="fa-solid fa-gamepad"></i>

<button class="pushable">
    <a href="/profiles/osu">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">
            <i class="fa-solid fa-circle-xmark"></i> osu!
        </span>
    </a>
</button>

<button class="pushable">
    <a href="/profiles/tetrio">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">
            <i class="fa-solid fa-grip-vertical"></i> tetr.io
        </span>
    </a>
</button>