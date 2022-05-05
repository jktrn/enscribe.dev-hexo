---
title: Contact 📞
date: 2022-04-05 16:20:02
description: "Here's all of my socials, methods of contact, etc. Check them out!"
---
<script src="https://kit.fontawesome.com/129342a70b.js" crossorigin="anonymous"></script>

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
        background: #111111
    }

    .front {
        display: block;
        position: relative;
        padding: 20px 42px;
        border-radius: 12px;
        font-size: 1.25rem;
        font-family: "Meslo LG";
        color: white;
        background: #2a2a2c;
        will-change: transform;
        transform: translateY(-4px);
        transition:
            transform 600ms cubic-bezier(.3, .7, .4, 1);
    }

    .pushable:hover {
        filter: brightness(110%);
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

## 👤 personal

<button class="pushable">
    <a href="https://enscribe.dev/profile/discord">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">
            <i class="fa-brands fa-discord"></i> discord
        </span>
    </a>
</button>

<button class="pushable">
    <a href="https://enscribe.dev/profile/github">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">
            <i class="fa-brands fa-github"></i> github
        </span>
    </a>
</button>

<button class="pushable">
    <a href="https://enscribe.dev/profile/youtube">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">
            <i class="fa-brands fa-youtube"></i> youtube
        </span>
    </a>
</button>

<button class="pushable">
    <a href="https://enscribe.dev/profile/ctftime">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">
            <i class="fa-solid fa-flag"></i> ctftime
        </span>
    </a>
</button>

---

## 🎮 gaming

<button class="pushable">
    <a href="https://enscribe.dev/profile/osu">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">
            <i class="fa-solid fa-circle-xmark"></i> osu!
        </span>
    </a>
</button>

<button class="pushable">
    <a href="https://enscribe.dev/profile/steam">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">
            <i class="fa-brands fa-steam"></i> steam
        </span>
    </a>
</button>

<button class="pushable">
    <a href="https://enscribe.dev/profile/tetrio">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">
            <i class="fa-solid fa-gamepad"></i> tetr.io
        </span>
    </a>
</button>
