---
title: "utc/prog: Port Authority"
date: 2022-07-27 23:07:37
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
---

{% fontawesome %}

<div class="flex-container">
    {% box padding-top:20px %}
        The harbour is in total chaos, the ships are no longer on course. The AI has disabled the brakes of all the ships and corrupted our control systems. The ships about to crash into each other, can you build a new AI that will rescue the ships and deliver the cargo?<br><br>
        *Author information: This challenge is developed by [Luuk Hofman](https://www.linkedin.com/in/luuk-hofman-01164259/) and [Diederik Bakker](https://www.linkedin.com/in/diederik-bakker/).*
    {% endbox %}
    <div>
        <img src="/asset/utc/ship.png" style="width:950px; margin: 1rem 0; filter: grayscale(100%);">
    </div>
</div>

{% info %}
Note: This is an **instance-based** challenge. No website URL will be provided!
{% endinfo %}

### Intro

This challenge was part of the Deloitte Hackazon Hacky Holidays "Unlock the City" 2022 CTF (yeah, what a name!). Labeled under the `#ppc` category, which apparently stands for "professional programming challenge", it was the final challenge under the "District 1" segment of the CTF and categorized under the Hard difficulty.

This was the first CTF problem which didn't just challenge my ability to critically think and problem solve - it also challenged my **motor control** and **hand-eye coordination**. Why? *Because I solved it by hand!* I believe this challenge was meant to be solved using 100% programming, but I wanted to challenge myself. This was the process.

---

## Foundations

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

{% ccb terminal:true lang:console html:true %}
<span class="meta prompt_">&#36;</span> node test.js
[+] Connected!
[-] {"type":"GAME_START","level":{"id":1,"board":{"width":1886,"height":1188,"obstructions":[{"type":"HARBOUR_BORDER","area":[{"x":577,"y":0},{"x":627,"y":215.7142857142857}]},{"type":"HARBOUR_BORDER","area":[{"x":875,"y":0},{"x":925,"y":215.7142857142857}]},{"type":"BORDER_ROCK","area":[{"x":0,"y":0},{"x":577,"y":51}]},{"type":"BORDER_ROCK","area":[{"x":925,"y":0},{"x":1886,"y":51}]}],"harbour":[{"x":700,"y":0},{"x":850,"y":107.85714285714285}]},"mechanics":{"borderCollision":false,"sequentialDocking":true},"ships":[null]}}
[-] {"type":"TICK","ships":[{"type":"SHIP_6","area":[{"x":472,"y":795},{"x":532,"y":1063.75}],"direction":"UP","speed":3,"id":0,"isDocked":false}]}
[-] {"type":"TICK","ships":[{"type":"SHIP_6","area":[{"x":472,"y":795},{"x":532,"y":1063.75}],"direction":"UP","speed":3,"id":0,"isDocked":false}]}
[-] {"type":"TICK","ships":[{"type":"SHIP_6","area":[{"x":472,"y":792},{"x":532,"y":1060.75}],"direction":"UP","speed":3,"id":0,"isDocked":false}]}
[-] {"type":"TICK","ships":[{"type":"SHIP_6","area":[{"x":472,"y":789},{"x":532,"y":1057.75}],"direction":"UP","speed":3,"id":0,"isDocked":false}]}
...
{% endccb %}

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

{% ccb lang:console terminal:true html:true %}
<span class="meta prompt_">&#36;</span> node test.js
[+] Connected!
ID: 0 | (211, 256) (271, 524) | DIR: UP
ID: 0 | (211, 256) (271, 524) | DIR: UP
ID: 0 | (211, 252) (271, 520) | DIR: UP
ID: 0 | (211, 248) (271, 516) | DIR: UP
...
{% endccb %}

Let's finally get to solving the challenge.

---

{% challenge %}
title: Level 1
level: h2
description: Do you know how websockets work?
solvers:
  - sahuang --flag
  - blueset
size: 110%
points: 25
{% endchallenge %}

The last thing I want to add was a web-based "controller", which can steer the ship on-click and start new levels. I moved all my code from a local `.js` file to [CodePen](https://codepen.io/) for instant page regeneration and accessability by teammates. Here's the HTML:

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

{% ccb highlight:5 terminal:true %}
...
ID: 0 | (688, 115) (748, 383) | DIR: UP
ID: 0 | (688, 115) (748, 383) | DIR: UP
ID: 0 | (688, 111) (748, 379) | DIR: UP
{"type":"WIN","flag":"CTF{CapTA1n-cRUCh}"}
{% endccb %}

We've succesfully completed Level 1!

---

{% challenge %}
title: Level 2
level: h2
description: Lets script it - don't forget the order!
solvers: 
    - sahuang --flag
    - blueset
size: 110%
points: 25
{% endchallenge %}

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

{% challenge %}
title: Level 3
level: h2
description: Can you deal with the rocks that appeared in our once so peaceful harbor?
solvers: sahuang
size: 110%
points: 50
{% endchallenge %}

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

{% ccb highlight:5 terminal:true %}
...
ID: 0 | (760, 105) (820, 343) | DIR: UP
ID: 1 | (736, 101) (796, 371) | DIR: UP
ID: 2 | (742, 113) (802, 393) | DIR: UP
{"type":"WIN","flag":"CTF{c4pt41N-m0rG4N}"}
{% endccb %}

---

{% challenge %}
title: Level 4
level: h2
description: The algorithm disturbed our radar system - boats that veer too far off track are lost and never seen again. Can you give them directions in time?
solvers: sahuang
size: 110%
points: 50
{% endchallenge %}

After I added the level 4 button alongside steer/loop buttons for the extra ship that popped up, I discovered that my solution for level 3 actually worked for level 4 as well:

![Level 4](/asset/utc/level4.gif)

This means I can flag this level without needing to code at all!:

<video style="margin:1rem 0" controls>
  <source src="/asset/utc/flag4.mp4" type="video/mp4">
Your browser does not support the video tag.
</video>

{% ccb highlight:6 terminal:true %}
...
ID: 0 | (742, 107) (802, 345) | DIR: UP
ID: 1 | (731, 105) (791, 385) | DIR: UP
ID: 2 | (752, 107) (812, 377) | DIR: UP
ID: 3 | (731, 114) (791, 395) | DIR: UP
{"type":"WIN","flag":"CTF{C4pt41N-4MErIc4}"}
{% endccb %}

---

{% challenge %}
title: Level 5
level: h2
description: A huge influx of ships is coming our way - can you lead them safely to the port? 
solvers:
    - enscribe --flag
    - sahuang
size: 110%
points: 200
{% endchallenge %}

Oh boy...

![Level 5](/asset/utc/level5.gif)

Level five gives us a large increase in rocks, a tiny harbor, and six total ships to work with at max speed. Unfortunately, there's not enough room for the ships to loop around in circles, so the solution to levels 3 and 4 won't work. We'll have to figure out something else.

Luckily, during some experimenation on level 1 I found out that you can actually do a full 180° turn by calling two consecutive turns in the code. In doing so, the ship won't hit any of the objects in its surroundings as compared to if it rotated 90° twice. We can observe this phenomenon below:

<div class="flex-container">
    <div>
        {% ccb lang:js gutter1:142-151 %}
        function turn180(id) {
            socket.send(JSON.stringify({
                type: "SHIP_STEER",
                shipId: id
            }));
            socket.send(JSON.stringify({
                type: "SHIP_STEER",
                shipId: id
            }));
        }
        {% endccb %}
    </div>
    <div style="margin:1rem 0">
        {% cimage url:/asset/utc/180.gif width:275 %}
    </div>
</div>

Also, if you noticed in the first GIF, the ships are spawning at around the same locations every time. With this, we can come up with a plan: create "obstacles" with x-y coordinates that will cause any ship that comes into the region to turn 180°. We'll create separate "lanes" for each ship that spawns, therefore stabilizing the playfield and allowing for a feasible manual solve:

![Lanes](/asset/utc/obstacles.png)

Now, how are these checks going to work? After a lot of experimenting I found that **three** total criteria should be met:
1. The ship is travelling in the same the direction passed as an argument when the `check()` function is called
2. The absolute difference between the x and y values of the object and the ship's top-left is less than a certain threshold (I chose 75px)
3. The global variable to determine whether or not the ship has been rotated 180° yet is false (`hasRotated`)

Here's a visual I drew in case you're lost. The red/green squares on the left indicate the status of each check during different stages of the turn:

![Check Visual](/asset/utc/checkvisual.svg)

We can now begin programming by creating an Obstacle class and manually placing them down throughout the map. This was just a lot of trial and error, so don't worry about these coordinates feeling random:

{% ccb lang:js gutter1:48-68 caption:'[JavaScript] Creating Obstacle class' %}
class Obstacle {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

let obstacles = [
    new Obstacle(450, 1060),    //1
    new Obstacle(750, 1060),    //2
    new Obstacle(1200, 1060),   //3
    new Obstacle(1600, 1060),   //4
    new Obstacle(604, 700),     //5
    new Obstacle(1070, 600),    //6
    new Obstacle(1730, 650),    //7
    new Obstacle(604, 70),      //8
    new Obstacle(674, 200),     //9
    new Obstacle(1070, 350),    //10
    new Obstacle(1530, 200),    //11
    new Obstacle(1730, 300),    //12
]
{% endccb %}

Next, let's create the aforementioned `hasRotated` object alongside the `check()` function, which will implement the three criteria:

{% ccb lang:js gutter1:70-77,S,152-165 caption:'[JavaScript] Implementing 180° checks' %}
let hasRotated = {
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false
}
//SKIP_LINE:(79-152)
// Checks if ship should turn 180°
function check(ship, obstacle, direction) {
    if (!hasRotated[ship.id] &&                         // Check 1
        Math.abs(ship.topLeft.y - obstacle.y) < 75 &&   // Check 2
        Math.abs(ship.topLeft.x - obstacle.x) < 75 &&   // Check 2
        ship.direction == direction) {                  // Check 3
        hasRotated[ship.id] = true;
        turn180(ship.id);
        // Sets hasRotated[ship.id] back to false in 1 second asynchronously
        setTimeout(() => {
            hasRotated[ship.id] = false
        }, "1000");
    }
}
{% endccb %}

Finally, let's call the `check()` function for each index in the `ships` array. Each tick, *every single* ship will go through these twelve checks. Although this might seem redundant, we have no way of assigning lanes to specific ships, as the IDs are randomized every time based on the order they're meant to dock. This method simply generalizes all of them, and shouldn't cause issues performance-wise:

{% ccb lang:js gutter1:86-108 caption:'[JavaScript] Implementing lane checks' %}
    if (obj.type == "TICK") {
        let ships = [];
        // For each ship in obj.ships, push class object into ships array
        for (const i of obj.ships) {
            ships.push(new Ship(i.id, i.area[0], i.area[1], i.direction));
        }
        // Call the string literal getter
        for (const i of ships) {
            log(i.printState);
            // Infinite checks!
            check(i, obstacles[0], "LEFT");
            check(i, obstacles[1], "RIGHT");
            check(i, obstacles[2], "LEFT");
            check(i, obstacles[3], "RIGHT");
            check(i, obstacles[4], "DOWN");
            check(i, obstacles[5], "DOWN");
            check(i, obstacles[6], "DOWN");
            check(i, obstacles[7], "UP");
            check(i, obstacles[8], "LEFT");
            check(i, obstacles[9], "UP");
            check(i, obstacles[10], "RIGHT");
            check(i, obstacles[11], "UP");
        }
{% endccb %}

In theory, these checks should cause the ships to bounce back and forth in their specific lanes. Let's check it out:

![Lanes](/asset/utc/lanes.gif)

Although we've managed to stabilize level 5, we need to be able to toggle the lanes off to manually solve the challenge. Let's add more checkboxes to the HTML and adjust the JS accordingly:

{% ccb lang:html gutter1:21-39 caption:'[HTML] Adding lane checkboxes' diff_add:10-18 %}
            <p>Loop Ships:</p>
            <div>
                <input type="checkbox" id="loop0" checked>Loop 0</input>
                <input type="checkbox" id="loop1" checked>Loop 1</input>
                <input type="checkbox" id="loop2" checked>Loop 2</input>
                <input type="checkbox" id="loop3" checked>Loop 3</input>
                <input type="checkbox" id="loop4" checked>Loop 4</input>
                <input type="checkbox" id="loop5" checked>Loop 5</input>
            </div>
            <p> Disable Obstacles: </p>
            <div>
                <input type="checkbox" id="toggle0">1/2</input>
                <input type="checkbox" id="toggle1">3/4</input>
                <input type="checkbox" id="toggle2">5/8</input>
                <input type="checkbox" id="toggle3">6/10</input>
                <input type="checkbox" id="toggle4">7/12</input>
                <input type="checkbox" id="toggle5">9/11</input>
            </div>
        </fieldset>
{% endccb %}

{% ccb lang:js gutter1:80-120 caption:'[JavaScript] Toggleable lanes' diff_add:1,17,20-21,24-25,28-29,32-33,36-37,40 scrollable:true %}
let checkList = findAll("toggle");

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
            // Infinite checks!
            if (!checkList[0].checked) {
                check(s, obstacles[0], "LEFT");
                check(s, obstacles[1], "RIGHT");
            }
            if (!checkList[1].checked) {
                check(s, obstacles[2], "LEFT");
                check(s, obstacles[3], "RIGHT");
            }
            if (!checkList[2].checked) {
                check(s, obstacles[4], "DOWN");
                check(s, obstacles[7], "UP");
            }
            if (!checkList[3].checked) {
                check(s, obstacles[5], "DOWN");
                check(s, obstacles[9], "UP");
            }
            if (!checkList[4].checked) {
                check(s, obstacles[6], "DOWN");
                check(s, obstacles[11], "UP");
            }
            if (!checkList[5].checked) {
                check(s, obstacles[8], "LEFT");
                check(s, obstacles[10], "RIGHT");
            }
        }
{% endccb %}

Now, we can strategize on how to solve the challenge manually. Our team deduced that the most ideal order for ships would look something like this:

![Strategy](/asset/utc/obstacles2.svg)

This order allows for the first ship to enter the port within two turns, and provides plenty of space for the second and third ships to work with. Although it would require a lot of restarting (as the order is always random), it's worth it to ease the difficulty of the challenge.

Moving on, we began work on the manual solve process. It was super tedious and involved a lot of mess-ups, especially around the port area. We discovered that the window to turn into the port was extraordinarily small, leading to many runs dying to something like this:

<div class="flex-container">
    <div>{% cimage url:/asset/utc/death1.png %}</div>
    <div>{% cimage url:/asset/utc/death2.png %}</div>
</div>

We decided it'd be best if we added another obstacle to perfectly turn us into the dock every time. This time around, it would have to be a 90° turn utlizing the middle of the ship instead of the top-left, as each ship is a different length and would therefore turn at different points when within the obstacles's hitbox:

![90 Turn](/asset/utc/90turn.svg)

Here is its implementation:

{% ccb lang:js gutter1:65-69,S,117-123,S,203-219 caption:'[JavaScript] Implementing \"auto-dock\"' diff_add:4,12,15-31 %}
    new Obstacle(1070, 350), //10
    new Obstacle(1530, 200), //11
    new Obstacle(1730, 300), //12
    new Obstacle(232, 575) //13
]
//SKIP_LINE:(70-116)
            if (!checkList[5].checked) {
                check(s, obstacles[8], "LEFT");
                check(s, obstacles[10], "RIGHT");
            }
            // Auto-docking obstacle
            check90(s, obstacles[12], "LEFT");
        }
//SKIP_LINE:(121-201)
function check90(s, o, d) {
    // Calculates middle of ship in coordinates
    let mid = Math.abs(Math.floor(s.topLeft.x + s.bottomRight.x) / 2);
    if (!hasRotated[s.id] &&
        Math.abs(s.topLeft.y - o.y) < 400 && // Large y for legroom
        Math.abs(mid - o.x) < 20 && // Small x for accuracy
        s.direction == d) {
        hasRotated[s.id] = true;
        socket.send(JSON.stringify({
            type: "SHIP_STEER",
            shipId: s.id
        }));
        setTimeout(() => {
            hasRotated[s.id] = false
        }, "1000");
    }
}

{% endccb %}

When you turn a ship through those rocks into the obstacle, the ship will now automatically turn to enter the dock perfectly:

![Autodock](/asset/utc/autodock.gif)

**NOW IT'S TIME TO SOLVE THE CHALLENGE MANUALLY!** It took multiple hours across several days, and included some chokes as tragic as this one:

![Choke](/asset/utc/choke.png)

But, finally, I got the solve run clipped here, with a small reaction 🤣:

<video style="margin:1rem 0" controls>
  <source src="/asset/utc/solve-cut.mp4" type="video/mp4">
Your browser does not support the video tag.
</video>

The flag is `CTF{CaPT41n-j4Ck-sp4rR0w}`. We're finally done.

Here is the final script:

{% ccb lang:js gutter1:1-44,,,45-219 caption:'[JavaScript] Final script' scrollable:true wrapped:true %}
// Regex so that I can freely paste the URL when the instance is changed
const url = "https://[REDACTED].challenge.hackazon.org/";
// Opens WebSocket connection
const socket = new WebSocket(`wss://${url.replace(/^https?:\/\//, "")}ws`);
// Object literal for level lookup
const passwords = [{
        level: 1,
        password: ""
    },
    {
        level: 2,
        password: "CTF{CapTA1n-cRUCh}"
    },
    {
        level: 3,
        password: "CTF{capt41n-h00k!}"
    },
    {
        level: 4,
        password: "CTF{c4pt41N-m0rG4N}"
    },
    {
        level: 5,
        password: "CTF{C4pt41N-4MErIc4}"
    }
];
const text = document.getElementById("textarea");

// Runs on socket open, equivalent to .addEventListener()
socket.onopen = function() {
    log("[+] Connected!");
};

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
        return `ID: ${this.id} | (${Math.floor(this.topLeft.x)}, ${Math.floor(this.topLeft.y)}) (${Math.floor(this.bottomRight.x)}, ${Math.floor(this.bottomRight.y)}) | DIR: ${this.direction}`;
    }
}

class Obstacle {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

let obstacles = [
    new Obstacle(450, 1060), //1
    new Obstacle(750, 1060), //2
    new Obstacle(1200, 1060), //3
    new Obstacle(1600, 1060), //4
    new Obstacle(604, 700), //5
    new Obstacle(1070, 600), //6
    new Obstacle(1730, 650), //7
    new Obstacle(604, 70), //8
    new Obstacle(674, 200), //9
    new Obstacle(1070, 350), //10
    new Obstacle(1530, 200), //11
    new Obstacle(1730, 300), //12
    new Obstacle(232, 575) //13
]

let hasRotated = {
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false
}

window.lastRot = 0;
let checkList = findAll("toggle");

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
            // Infinite checks!
            if (!checkList[0].checked) {
                check(i, obstacles[0], "LEFT");
                check(i, obstacles[1], "RIGHT");
            }
            if (!checkList[1].checked) {
                check(i, obstacles[2], "LEFT");
                check(i, obstacles[3], "RIGHT");
            }
            if (!checkList[2].checked) {
                check(i, obstacles[4], "DOWN");
                check(i, obstacles[7], "UP");
            }
            if (!checkList[3].checked) {
                check(i, obstacles[5], "DOWN");
                check(i, obstacles[9], "UP");
            }
            if (!checkList[4].checked) {
                check(i, obstacles[6], "DOWN");
                check(i, obstacles[11], "UP");
            }
            if (!checkList[5].checked) {
                check(i, obstacles[8], "LEFT");
                check(i, obstacles[10], "RIGHT");
            }
            // Auto-docking obstacle
            check90(i, obstacles[12], "LEFT");
        }
    } else {
        log(JSON.stringify(JSON.parse(event.data)));
    }
    // Guard clause for looping ships!
    if (performance.now() - window.lastRot < 500) return;
    window.lastRot = performance.now();
    // If statement for each element that begins with "loop"
    findAll("loop").forEach(function (element, index) {
        if (element.checked) {
            socket.send(JSON.stringify({
                type: "SHIP_STEER",
                shipId: `${index}`
            }));
        }
    });
};

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

function log(str) {
    text.value += "\n" + str;
    text.value = text.value.substring(text.value.length - 10000);
    text.scrollTop = text.scrollHeight;
}

function turn180(id) {
    socket.send(JSON.stringify({
        type: "SHIP_STEER",
        shipId: id
    }));
    socket.send(JSON.stringify({
        type: "SHIP_STEER",
        shipId: id
    }));
}

function check(s, o, d) {
    if (!hasRotated[s.id] &&
        Math.abs(s.topLeft.y - o.y) < 75 &&
        Math.abs(s.topLeft.x - o.x) < 75 &&
        s.direction == d) {
        hasRotated[s.id] = true;
        turn180(s.id);
        setTimeout(() => {
            hasRotated[s.id] = false
        }, "1000");
    }
}

function check90(s, o, d) {
    // Calculates middle of ship in coordinates
    let mid = Math.abs(Math.floor(s.topLeft.x + s.bottomRight.x) / 2);
    if (!hasRotated[s.id] &&
        Math.abs(s.topLeft.y - o.y) < 400 && // Large y for legroom
        Math.abs(mid - o.x) < 20 && // Small x for accuracy
        s.direction == d) {
        hasRotated[s.id] = true;
        socket.send(JSON.stringify({
            type: "SHIP_STEER",
            shipId: s.id
        }));
        setTimeout(() => {
            hasRotated[s.id] = false
        }, "1000");
    }
}
{% endccb %}

---

### Afterword

If you made it to this point of the writeup, I want to sincerely thank you for reading. This writeup genuinely took longer to create than it took to solve the challenge (about 30 hours across two weeks), as I had to recreate, record, crop, and optimize every aspect of the solve. I had to create my own multi-hundred-line plugins to implement custom code blocks specifically for this writeup. Everything from the line numbers in highlighted diffs of code to the diagrams were hand-done, as this is my passion: to create for people to learn in a concise, aesthetically pleasing manner. This is also an entry for the Hacky Holidays writeup competition, so wish me luck! 🤞

\- enscribe

---

{% flagcounter %}