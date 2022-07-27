---
title: "utc/prog: Port Authority"
date: 2022-07-16 23:07:37
categories:
- ctfs
- utc
- prog
tags: 
- programming
- websocket
description: "Play a JSON-controlled strategy game through a WebSocket! This is my writeup for the Hackazon Unlock the City programming challenge \"Port Authority\"."
permalink: ctfs/utc/prog/port-authority/
thumbnail: /asset/banner/banner-port-authority.png
hidden: true
---

{% fontawesome %}

<div class="flex-container">
    {% box padding-top:20px %}
        The harbour is in total chaos, the ships are no longer on course. The AI has disabled the brakes of all the ships and corrupted our control systems. The ships about to crash into each other, can you build a new AI that will rescue the ships and deliver the cargo?<br><br>
        *Author information: This challenge is developed by [Luuk Hofman](https://www.linkedin.com/in/luuk-hofman-01164259/) and [Diederik Bakker](https://www.linkedin.com/in/diederik-bakker/).*
    {% endbox %}
    <div>
        <img src="/asset/utc/ship.png" style="width:950px; margin: 1rem 0;">
    </div>
</div>

{% info %}
Note: This is an **instance-based** challenge. No website URL will be provided!
{% endinfo %}

We're initially provided with a link that takes us to a nice-looking webgame called the "Port Traffic Control Interface":

![Initial Website](/asset/utc/initial-website.gif)

Although we can't directly interact with the game using keyboard controls, there's a manual on the top-right which details the task:

![Manual Website](/asset/utc/manual-website.png)

According to this, we can start playing the game and controlling the ships that appear through a [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/) connection, which is an API that enables two-way communication between a user's browser and a server. [This documentation](https://javascript.info/websocket) describes the protocol alongside how to open/close and send/receive using JavaScript.

Heavily referencing the aforementioned documentation, I started off by installing the WebSocket package with `npm i ws`, and then creating a `test.js` with the following code:

{% codeblock lang:js [JavaScript] First WebSocket connection %}
// Make sure you install WebSocket with "npm i ws"!
const WebSocket = require('ws');
// Regex so that I can freely paste the URL when the instance is changed
const url = "https://[REDACTED].challenge.hackazon.org/";
// Opens WebSocket connection
const socket = new WebSocket(`wss://${url.replace(/^https?:\/\//, "")}ws`);

// Runs on socket open, equivalent to .addEventListener()
socket.onopen = function() {
    console.log("[+] Connected!");
    // Converts object to string
    socket.send(JSON.stringify({
        "type": "START_GAME",
        "level": 1
    }));
};

// Runs when output from server is received
socket.onmessage = function(event) {
    // Output is received in event
    console.log(`[-] ${event.data}`);
};
{% endcodeblock %}

Look what happens when we establish a connection - the game starts running, and we start receiving per-tick input from the server in our console:

![Start Website](/asset/utc/start-website.gif)

{% codeblock lang:console line_number:false %}
> node test.js
[+] Connected!
[-] {"type":"GAME_START","level":{"id":1,"board":{"width":1886,"height":1188,"obstructions":[{"type":"HARBOUR_BORDER","area":[{"x":577,"y":0},{"x":627,"y":215.7142857142857}]},{"type":"HARBOUR_BORDER","area":[{"x":875,"y":0},{"x":925,"y":215.7142857142857}]},{"type":"BORDER_ROCK","area":[{"x":0,"y":0},{"x":577,"y":51}]},{"type":"BORDER_ROCK","area":[{"x":925,"y":0},{"x":1886,"y":51}]}],"harbour":[{"x":700,"y":0},{"x":850,"y":107.85714285714285}]},"mechanics":{"borderCollision":false,"sequentialDocking":true},"ships":[null]}}
[-] {"type":"TICK","ships":[{"type":"SHIP_6","area":[{"x":472,"y":795},{"x":532,"y":1063.75}],"direction":"UP","speed":3,"id":0,"isDocked":false}]}
[-] {"type":"TICK","ships":[{"type":"SHIP_6","area":[{"x":472,"y":795},{"x":532,"y":1063.75}],"direction":"UP","speed":3,"id":0,"isDocked":false}]}
[-] {"type":"TICK","ships":[{"type":"SHIP_6","area":[{"x":472,"y":792},{"x":532,"y":1060.75}],"direction":"UP","speed":3,"id":0,"isDocked":false}]}
[-] {"type":"TICK","ships":[{"type":"SHIP_6","area":[{"x":472,"y":789},{"x":532,"y":1057.75}],"direction":"UP","speed":3,"id":0,"isDocked":false}]}
...
{% endcodeblock %}

Let's see what happens when we send the `SHIP_STEER` command to the server after five seconds. We can do that with the [`setTimeout()`](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout) method in our `socket.onopen` listener:

{% ccb lang:javascript gutter1:9-23 caption:"[JavaScript] Testing steering mechanic" diff_add:8-14 %}
socket.onopen = function() {
    console.log("[+] Connected!");
    // Converts object to string
    socket.send(JSON.stringify({
        "type": "START_GAME",
        "level": 1
    }));
    // Sends steer command after one second
    setTimeout(() => {
        socket.send(JSON.stringify({
            "type": "SHIP_STEER",
            "shipId": 0
        }));
    }, 5000);
};
{% endccb %}

![First Turn](/asset/utc/first-turn.gif)

From the provided GIF, we can see that the ship will turn clockwise on its central point when told to steer!

With this, we have a goal: **get the ship into the port by sending JSON instructions to the WebSocket server**. However, it's definitely a good idea to create some quality-of-life features first, such as:

- A way to convert our JSON data into an object we can reference
- A class which can construct objects for each ship
- An HTML/JS "controller", which can be used to steer the ships with UI and to start new levels

Firstly, cleaning up the output involves parsing what we receive from the server, which we can do with the `JSON.parse()` method. We'll assign it into a variable named `obj` (and also delete our steer-testing code):

{% ccb lang:javascript gutter1:16-28,+x2,29 gutter2:⁠—x7,16-19,⁠—x2,20-22 caption:'[JavaScript] Parsing JSON' diff_del:1-7 diff_add:14-15 %}
    // Sends steer command after one second 
    setTimeout(() => {
        socket.send(JSON.stringify({
            "type": "SHIP_STEER",
            "shipId": 0
        }));
    }, 5000);
};

// Runs when output from server is received
socket.onmessage = function(event) {
    // Output is received in event
    console.log(`[-] ${event.data}`);    
    // Converts server output into object
    let obj = JSON.parse(event.data);
};
{% endccb %}

Each tick, `obj` will change to an object structured this way:

<figure class="highlight js"><figcaption><span>[JSON] Tick output (click to expand!)</span></figcaption><table><tr><td class="code"><div id="test"></div></td></tr></table></figure>

<script type="text/javascript" src="/scripts/renderjson.js"></script>
<script>
    renderjson.set_show_to_level("1");
    renderjson.set_icons('⊕ ', '⊖ ');
    document.getElementById("test").appendChild(
        renderjson({"type":"TICK","ships":[{"type":"SHIP_6","area":[{"x":472,"y":795},{"x":532,"y":1063.75}],"direction":"UP","speed":3,"id":0,"isDocked":false}]})
    );
</script>

Check out the `obj.type` key - there'll be multiple types of these (including but not limited to `"LOSS"`, `"GAME_START"`). We'll make it so that if `obj.type` is `"TICK"`, it will create a new Class instance for each object in the `obj.ships` array:

{% ccb lang:javascript gutter1:18-28,,,29-47 caption:'[JavaScript] Ship class, instance creation, pretty logging' diff_add:1-15,21-30  %}
class Ship {
    // Initializes class object instance
    constructor(id, topLeft, bottomRight, direction) {
        this.id = id;
        this.topLeft = topLeft;
        this.bottomRight = bottomRight;
        this.direction = direction;
    }
    // Getter + abusing template literals
    get printState() {
        return `ID: ${this.id} | (${Math.floor(this.topLeft.x)}, 
${Math.floor(this.topLeft.y)}) (${Math.floor(this.bottomRight.x)}, 
${Math.floor(this.bottomRight.y)}) | DIR: ${this.direction}`;
    }
}

// Runs when output from server is received
socket.onmessage = function(event) {
    // Converts server output into object
    let obj = JSON.parse(event.data);
    if(obj.type == "TICK") {
        let ships = [];
        // For each ship in obj.ships, push class object into ships array
        for(const i of obj.ships) {
            ships.push(new Ship(i.id, i.area[0], i.area[1], i.direction));
        }
        // Call the string literal getter
        for(const i of ships) {
            console.log(i.printState);
        }
    }
};
{% endccb %}

With this new Class, we can get both our own `ships` array *and* really clean logging from the server:

{% codeblock lang:console line_number:false %}
> node test.js
[+] Connected!
ID: 0 | (211, 256) (271, 524) | DIR: UP
ID: 0 | (211, 256) (271, 524) | DIR: UP
ID: 0 | (211, 252) (271, 520) | DIR: UP
ID: 0 | (211, 248) (271, 516) | DIR: UP
...
{% endcodeblock %}

Let's finally get to solving the challenge.

### LEVEL 1

{% box %}
Do you know how websockets work? [25 points]
{% endbox %}

We can move on to the final quality-of-life feature: a web-based "controller" that can steer the ship on-click and start new levels. I moved all my code from a local `.js` file to [CodePen](https://codepen.io/) for instant page regeneration and accessability by teammates. Here's the HTML:

{% codeblock lang:html [HTML] First start & steer buttons %}
<p>Start Level:</p>
<button id="lvl0">Level 1</button>

<p>Steer Ships:</p>
<button id="steer0">Steer 0</button>
{% endcodeblock %}

Here's the JS that adds functionality to these buttons. Note that these are made to be scalable/"future-proof", meaning I can freely add more buttons without needing to copy/paste slight alterations of the same code. I also made some changes upon switching to the CodePen, including deleting the `require()` method and preventing level 1 from automatically starting on-open:

{% ccb lang:javascript gutter1:1-6,+x6,7-16,S,+x31 gutter2:⁠—x2,1-14,⁠—x5,15,S,48-78 caption:'[JavaScript] Future-proof DOM listeners & events' diff_add:7-12,24-54 diff_del:1-2,17-21 %}
// Make sure you install WebSocket with "npm i ws"!
const WebSocket = require('ws');
// Regex so that I can freely paste the URL when the instance is changed
const url = "https://[REDACTED].challenge.hackazon.org/";
// Opens WebSocket connection
const socket = new WebSocket(`wss://${url.replace(/^https?:\/\//, "")}ws`);
// Object literal for level lookup
const passwords = [{
        level: 1,
        password: ""
    }
];

// Runs on socket open, equivalent to .addEventListener()
socket.onopen = function() {
    console.log("[+] Connected!");
    // Converts object to string
    socket.send(JSON.stringify({
        "type": "START_GAME",
        "level": 1
    }));
};
// SKIP_LINE:(16-47)
// Assigns onclick listeners for each level button
findAll("lvl").forEach(function(element, index) {
    element.onclick = function() {
        socket.send(JSON.stringify({
            type: "START_GAME",
            level: passwords[index].level,
            password: passwords[index].password
        }));
    };
});
 
// Assigns onclick listeners for each steer button
findAll("steer").forEach(function(element, index) {
    element.onclick = function() {
        socket.send(JSON.stringify({
            type: "SHIP_STEER",
            shipId: `${index}`
        }));
    };
});
 
// Creates DOM array for each element with name id + int
function findAll(id) {
    let i = 0;
    let list = [];
    while (document.getElementById(id + i)) {
        list[i] = document.getElementById(id + i);
        i++;
    }
    return list;
}
{% endccb %}

The preview on CodePen will look something like this:

![CodePen](/asset/utc/codepen.png)

Let's see if it actually works:

![First Buttons](/asset/utc/first-buttons.gif)

We could totally flag the challenge right now, but currently there's no way to see the filtered output we created. I know there's a "Console" button at the bottom-left of CodePen, but I'd like to see the output on the actual webpage, outside of the IDE. To do this, let's create a `log()` function to append strings to a `<textarea>` we'll add in the HTML:

{% ccb lang:javascript gutter1:+,S,38-44,+,45,+x3,46,S,+x5 gutter2:11,S,37-42,—,43-48,S,83-87 caption:'[JavaScript] Converting to log() function' diff_add:1,10,12-14,17-21 diff_del:9 %}
const text = document.getElementById("textarea");
//SKIP_LINE:(12-37)
        // For each ship in obj.ships, push class object into ships array
        for(const i of obj.ships) {
            ships.push(new Ship(i.id, i.area[0], i.area[1], i.direction));
        }
        // Call the string literal getter
        for(const i of ships) {
            console.log(i.printState);
            log(i.printState);        
        }
    } else {
      log(JSON.stringify(JSON.parse(event.data)));
    }
};
//SKIP_LINE:(49-82)
function log(str) {
    text.value += "\n" + str;
    text.value = text.value.substring(text.value.length - 10000);
    text.scrollTop = text.scrollHeight;
}
{% endccb %}

 We'll also spice up the page slightly with flexboxes, a `<fieldset>` and some CSS:

 {% ccb lang:html gutter1:1-17 caption:'[HTML] Adding &lt;fieldset&gt; and &lt;textarea&gt;' diff_add:1-3,5,7,9,11-17 %}
<div class="flex-container">
    <div>
        <fieldset>
            <p>Start Level:</p>
            <div>
                <button id="lvl0">Level 1</button>
            </div>
            <p>Steer Ships:</p>
            <div>
                <button id="steer0">Steer 0</button>
            </div>
        </fieldset>
    </div>
    <div>
        <textarea id="textarea" cols="80" rows="20"></textarea>
    </div>
</div>{% endccb %}

{% ccb lang:css gutter1:1-36 caption:'[CSS] Some beauty treatment' scrollable:true %}
.flex-container {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    gap: 10px;
}

body {
    background-color: #1d1f21;
    color: #c9cacc;
    font-size: 12px;
}

fieldset {
    text-align: center;
    font-family: "Trebuchet MS";
}

textarea {
    font-family: "Courier New";
}

p {
    margin-top: 5px;
    margin-bottom: 5px;
}

button {
    border: none;
    cursor: pointer;
    height: 25px;
    padding: 0px 10px;
    border-radius: 10px;
    color: #222;
    font-size: 11px;
}
{% endccb %}

Here's the preview now:

<img src="/asset/utc/codepen2.png" style="border: 1px solid #333; margin:1rem 0;">

Sorry I was being extra. Let's flag the challenge now (sped up):

![Flag 1](/asset/utc/flag1.gif)

{% ccb highlight:5 %}
...
ID: 0 | (688, 115) (748, 383) | DIR: UP
ID: 0 | (688, 115) (748, 383) | DIR: UP
ID: 0 | (688, 111) (748, 379) | DIR: UP
{"type":"WIN","flag":"CTF{CapTA1n-cRUCh}"}
{% endccb %}

We've succesfully completed Level 1!

---

### LEVEL 2

{% box %}
Lets script it - don't forget the order! [25 points]
{% endbox %}

"Lets script it"? I've already scripted throughout the entirety of Level 1 to accommodate for future levels! Let's add a Level 2 button to our scalable, future-proof code 😉:

{% ccb lang:javascript gutter1:6-14 caption:'[HTML] Adding level 1 flag to object literal' diff_add:5-8 %}
const passwords = [{
        level: 1,
        password: ""
    },
    {
        level: 2,
        password: "CTF{CapTA1n-cRUCh}"
    }
];
{% endccb %}

{% ccb lang:html gutter1:3-8 caption:'[HTML] Adding level 2 button' diff_add:5 %}
<fieldset>
    <p>Start Level:</p>
        <div>
            <button id="lvl0">Level 1</button>
            <button id="lvl1">Level 2</button>  
        </div>
{% endccb %}

This is what appears when clicking the button:

![Level 2](/asset/utc/level2.gif)

Looks like we'll have to add two more steer buttons:

{% ccb lang:html gutter1:9-15 caption:'[HTML] Adding steer 1/2 buttons' diff_add:4-5 %}
    <p>Steer Ships:</p>
        <div>
            <button id="steer0">Steer 0</button>
            <button id="steer1">Steer 1</button>
            <button id="steer2">Steer 2</button>  
        </div>
</fieldset>
{% endccb %}

It seems as though that you also need the ships to enter in a specific order. It will be difficult to multitask all three, but it's doable! Let's try to solve it (also very sped up):

![Flag 2](/asset/utc/flag2.gif)

{% ccb highlight:5 %}
...
ID: 0 | (789, 105) (849, 294) | DIR: UP
ID: 1 | (796, 105) (856, 373) | DIR: UP
ID: 2 | (691, 108) (751, 389) | DIR: UP
{"type":"WIN","flag":"CTF{capt41n-h00k!}"}
{% endccb %}

Although we've solved level 2 manually, I have a gut feeling the next few ones won't be as trivial...

---

### LEVEL 3

{% box %}
Can you deal with the rocks that appeared in our once so peaceful harbor? [50 points]
{% endbox %}

After adding another button to start Level 3, this is the field we start with:

![Level 3](/asset/utc/level3.gif)

They added some rocks to the board, and the ships are now moving at a faster speed. This is unfeasable to complete via multitasking, so we'll have to come up with a method to keep the ships in place.

Here's the plan: let's make it so that these ships will constantly rotate at a certain interval - in doing so, they'll complete a 360° loop within a small area, and we can commandeer them one-at-a-time by disabling the loop for certain ships. Let's start by adding checkboxes to enable the loop:

{% ccb lang:html gutter1:10-22 caption:'[HTML] Adding checkboxes for loop toggle' diff_add:7-12 %}
    <p>Steer Ships:</p>
    <div>
        <button id="steer0">Steer 0</button>
        <button id="steer1">Steer 1</button>
        <button id="steer2">Steer 2</button>
    </div>
    <p>Loop Ships:</p>
    <div>
        <input type="checkbox" id="loop0" checked>Loop 0</input>
        <input type="checkbox" id="loop1" checked>Loop 1</input>
        <input type="checkbox" id="loop2" checked>Loop 2</input>
    </div>
</fieldset>

{% endccb %}

Regarding the JavaScript, I'll be using `performance.now()` and checking if the difference between it and `window.lastRot` is greater than 500ms. This check will happen every tick, and in theory will create a consistently steering ship that doesn't produce `"ILLEGAL_MOVE"`s for inputting too quickly:

{% ccb lang:js gutter1:40-71 caption:'[JavaScript] Implementing looped rotations' diff_add:1,20-31 %}
window.lastRot = 0;

// Runs when output from server is received
socket.onmessage = function (event) {
    // Converts server output into object
    let obj = JSON.parse(event.data);
    if (obj.type == "TICK") {
        let ships = [];
        // For each ship in obj.ships, push class object into ships array
        for (const i of obj.ships) {
            ships.push(new Ship(i.id, i.area[0], i.area[1], i.direction));
        }
        // Call the string literal getter
        for (const i of ships) {
            log(i.printState);
        }
    } else {
        log(JSON.stringify(JSON.parse(event.data)));
    }
    // Guard clause for looping ships!
    if (performance.now() - window.lastRot < 500) return;
    window.lastRot = performance.now();
    // Sends steer if checkbox is checked
    findAll("loop").forEach(function (element, index) {
        if (element.checked) {
            socket.send(JSON.stringify({
                type: "SHIP_STEER",
                shipId: `${index}`
            }));
        }
    });
};
{% endccb %}

Let's see if it works:

![Looping](/asset/utc/looping.gif)

We've managed to stabilize the playing field for a manual solve! Let's flag the level:

<video style="margin:1rem 0" controls>
  <source src="/asset/utc/flag3.mp4" type="video/mp4">
Your browser does not support the video tag.
</video>

{% ccb highlight:5 %}
...
ID: 0 | (760, 105) (820, 343) | DIR: UP
ID: 1 | (736, 101) (796, 371) | DIR: UP
ID: 2 | (742, 113) (802, 393) | DIR: UP
{"type":"WIN","flag":"CTF{c4pt41N-m0rG4N}"}
{% endccb %}

We've solved level 3!

### LEVEL 4

{% box %}
The algorithm disturbed our radar system - boats that veer too far off track are lost and never seen again. Can you give them directions in time? [50 points]
{% endbox %}

After I added the level 4 button alongside steer/loop buttons for the extra ship that popped up, I discovered that my solution for level 3 actually worked for level 4 as well:

![Level 4](/asset/utc/level4.gif)

This means I can flag this level without needing to code at all!:



{% flagcounter %}