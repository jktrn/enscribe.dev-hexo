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

<div class="flex-container">
    {% box padding-top:25px %}
        The harbour is in total chaos, the ships are no longer on course. The AI has disabled the brakes of all the ships and corrupted our control systems. The ships about to crash into each other, can you build a new AI that will rescue the ships and deliver the cargo?<br><br>
        *Author information: This challenge is developed by [Luuk Hofman](https://www.linkedin.com/in/luuk-hofman-01164259/) and [Diederik Bakker](https://www.linkedin.com/in/diederik-bakker/).*
    {% endbox %}
    <div>
        <img src="/asset/utc/ship.png" style="width:950px; margin: 1rem 0;">
    </div>
</div>

{% info %}
<i class="fa-solid fa-circle-info"></i> Note: This is an **instance-based** challenge. No website URL will be provided!
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

{% customcodeblock lang:javascript gutter1:9-23 caption:"[JavaScript] Testing steering mechanic" diff_add:8-14 %}
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
{% endcustomcodeblock %}

![First Turn](/asset/utc/first-turn.gif)

From the provided GIF, we can see that the ship will turn clockwise on its central point when told to steer!

With this, we have a goal: **get the ship into the port by sending JSON instructions to the WebSocket server**. However, it's definitely a good idea to create some quality-of-life features first, such as:

- A way to convert our JSON data into an object we can reference
- A class which can construct objects for each ship
- An HTML/JS "controller", which can be used to steer the ships with UI and to start new levels

Firstly, cleaning up the output involves parsing what we receive from the server, which we can do with the `JSON.parse()` method. We'll assign it into a variable named `obj` (and also delete our steer-testing code):

{% customcodeblock lang:javascript gutter1:16,17,18,19,20,21,22,23,24,25,26,27,28,+,+,29 gutter2:⁠—,⁠—,⁠—,⁠—,⁠—,⁠—,⁠—,16,17,18,19,⁠—,⁠—,20,21,22 caption:'[JavaScript] Parsing JSON' diff_del:1-7 diff_add:14-15 %}
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
{% endcustomcodeblock %}

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

{% customcodeblock lang:javascript gutter1:18-28,,,29-47 caption:'[JavaScript] Ship class, instance creation, pretty logging' diff_add:1-15,20-30  %}
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
{% endcustomcodeblock %}

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

<div class="box">Do you know how websockets work? [25 points]</div>

We can move on to the final quality-of-life feature: a web-based "controller" that can steer the ship on-click and start new levels. I moved all my code from a local `.js` file to [CodePen](https://codepen.io/) for instant page regeneration and accessability by teammates. Here's the HTML:

{% codeblock lang:html [HTML] First start & steer buttons %}
<p>Start Level:</p>
<button id="lvl0">Level 1</button>

<p>Steer Ships:</p>
<button id="steer0">Steer 0</button>
{% endcodeblock %}

Here's the JS that adds functionality to these buttons. Note that these are made to be scalable/"future-proof", meaning I can freely add more buttons without needing to copy/paste slight alterations of the same code. I also made some changes upon switching to the CodePen, including deleting the `require()` method and preventing level 1 from automatically starting on-open:

{% customcodeblock lang:javascript caption:'[JavaScript] Future-proof DOM listeners & events' %}
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
{% endcustomcodeblock %}

<figure class="highlight js">
<figcaption><span>[JavaScript] Future-proof DOM listeners & events</span></figcaption>
    <table>
        <tr>
            <td class="gutter">
                <pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><div style="margin:1rem 0;"><span class="line"> </span></div><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br></pre>
            </td>
            <td class="gutter">
                <pre><span class="line">-</span><br><span class="line">-</span><br><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">-</span><br><span class="line">-</span><br><span class="line">-</span><br><span class="line">-</span><br><span class="line">-</span><br><span class="line">15</span><br><div style="margin:1rem 0;"><span class="line"> </span></div><span class="line">48</span><br><span class="line">49</span><br><span class="line">50</span><br><span class="line">51</span><br><span class="line">52</span><br><span class="line">53</span><br><span class="line">54</span><br><span class="line">55</span><br><span class="line">56</span><br><span class="line">57</span><br><span class="line">58</span><br><span class="line">59</span><br><span class="line">60</span><br><span class="line">61</span><br><span class="line">62</span><br><span class="line">63</span><br><span class="line">64</span><br><span class="line">65</span><br><span class="line">66</span><br><span class="line">67</span><br><span class="line">68</span><br><span class="line">69</span><br><span class="line">70</span><br><span class="line">71</span><br><span class="line">72</span><br><span class="line">73</span><br><span class="line">74</span><br><span class="line">75</span><br><span class="line">76</span><br><span class="line">77</span><br><span class="line">78</span><br></pre>
            </td>
            <td class="code">
                <pre><div class="diff-highlight-del" style="width:590px;"><span class="line"><span class="comment">// Make sure you install WebSocket with &quot;npm i ws&quot;!</span></span><br><span class="line"><span class="keyword">const</span> <span class="title class_">WebSocket</span> = <span class="built_in">require</span>(<span class="string">&#x27;ws&#x27;</span>);</span></div><span class="line"><span class="comment">// Regex so that I can freely paste the URL when the instance is changed</span></span><br><span class="line"><span class="keyword">const</span> url = <span class="string">&quot;https://[REDACTED].challenge.hackazon.org/&quot;</span>;</span><br><span class="line"><span class="comment">// Opens WebSocket connection</span></span><br><span class="line"><span class="keyword">const</span> socket = <span class="keyword">new</span> <span class="title class_">WebSocket</span>(<span class="string">`wss://<span class="subst">$&#123;url.replace(/^https?:\/\//, <span class="string">&quot;&quot;</span>)&#125;</span>ws`</span>);</span><br><div class="diff-highlight-add" style="width:590px;"><span class="line"><span class="comment">// Object literal for level lookup</span></span><br><span class="line"><span class="keyword">const</span> passwords = [&#123;</span><br><span class="line">        <span class="attr">level</span>: <span class="number">1</span>,</span><br><span class="line">        <span class="attr">password</span>: <span class="string">&quot;&quot;</span></span><br><span class="line">    &#125;</span><br><span class="line">];</span></div><span class="line"></span><br><span class="line"><span class="comment">// Runs on socket open, equivalent to .addEventListener()</span></span><br><span class="line">socket.<span class="property">onopen</span> = <span class="keyword">function</span>(<span class="params"></span>) &#123;</span><br><span class="line">    <span class="variable language_">console</span>.<span class="title function_">log</span>(<span class="string">&quot;[+] Connected!&quot;</span>);</span><br><div class="diff-highlight-del" style="width:590px"><span class="line">    <span class="comment">// Converts object to string</span></span><br><span class="line">    socket.<span class="title function_">send</span>(<span class="title class_">JSON</span>.<span class="title function_">stringify</span>(&#123;</span><br><span class="line">        <span class="string">&quot;type&quot;</span>: <span class="string">&quot;START_GAME&quot;</span>,</span><br><span class="line">        <span class="string">&quot;level&quot;</span>: <span class="number">1</span></span><br><span class="line">    &#125;));</span></div><span class="line">&#125;;</span><br><div class="skip-highlight" style="width:590px"><span class="line">(16 - 47)</span></div><div class="diff-highlight-add" style="width:590px;"><span class="line"><span class="comment">// Assigns onclick listeners for each level button</span></span><br><span class="line"><span class="title function_">findAll</span>(<span class="string">&quot;lvl&quot;</span>).<span class="title function_">forEach</span>(<span class="keyword">function</span>(<span class="params">element, index</span>) &#123;</span><br><span class="line">    element.<span class="property">onclick</span> = <span class="keyword">function</span>(<span class="params"></span>) &#123;</span><br><span class="line">        socket.<span class="title function_">send</span>(<span class="title class_">JSON</span>.<span class="title function_">stringify</span>(&#123;</span><br><span class="line">            <span class="attr">type</span>: <span class="string">&quot;START_GAME&quot;</span>,</span><br><span class="line">            <span class="attr">level</span>: passwords[index].<span class="property">level</span>,</span><br><span class="line">            <span class="attr">password</span>: passwords[index].<span class="property">password</span></span><br><span class="line">        &#125;));</span><br><span class="line">    &#125;;</span><br><span class="line">&#125;);</span><br><span class="line"></span><br><span class="line"><span class="comment">// Assigns onclick listeners for each steer button</span></span><br><span class="line"><span class="title function_">findAll</span>(<span class="string">&quot;steer&quot;</span>).<span class="title function_">forEach</span>(<span class="keyword">function</span>(<span class="params">element, index</span>) &#123;</span><br><span class="line">    element.<span class="property">onclick</span> = <span class="keyword">function</span>(<span class="params"></span>) &#123;</span><br><span class="line">        socket.<span class="title function_">send</span>(<span class="title class_">JSON</span>.<span class="title function_">stringify</span>(&#123;</span><br><span class="line">            <span class="attr">type</span>: <span class="string">&quot;SHIP_STEER&quot;</span>,</span><br><span class="line">            <span class="attr">shipId</span>: <span class="string">`<span class="subst">$&#123;index&#125;</span>`</span></span><br><span class="line">        &#125;));</span><br><span class="line">    &#125;;</span><br><span class="line">&#125;);</span><br><span class="line"></span><br><span class="line"><span class="comment">// Creates DOM array for each element with name id + int</span></span><br><span class="line"><span class="keyword">function</span> <span class="title function_">findAll</span>(<span class="params">id</span>) &#123;</span><br><span class="line">    <span class="keyword">let</span> i = <span class="number">0</span>;</span><br><span class="line">    <span class="keyword">let</span> list = [];</span><br><span class="line">    <span class="keyword">while</span> (<span class="variable language_">document</span>.<span class="title function_">getElementById</span>(id + i)) &#123;</span><br><span class="line">        list[i] = <span class="variable language_">document</span>.<span class="title function_">getElementById</span>(id + i);</span><br><span class="line">        i++;</span><br><span class="line">    &#125;</span><br><span class="line">    <span class="keyword">return</span> list;</span><br><span class="line">&#125;</span></div></pre>
            </td>
        </tr>
    </table>
</figure>

The preview on CodePen will look something like this:

![CodePen](/asset/utc/codepen.png)

Let's see if it actually works:

![First Buttons](/asset/utc/first-buttons.gif)

We could totally flag the challenge right now, but currently there's no way to see the filtered output we created. I know there's a "Console" button at the bottom-left of CodePen, but I'd like to see the output on the actual webpage, outside of the IDE. To do this, let's create a `log()` function to append strings to a `<textarea>` we'll add in the HTML:

<figure class="highlight js">
  <figcaption><span>[JavaScript] Converting to log() function</span></figcaption>
    <table>
        <tr>
            <td class="gutter">
                <pre><span class="line">+</span><br><div style="margin:1rem 0;"><span class="line"></span> </div><span class="line">38</span><br><span class="line">39</span><br><span class="line">40</span><br><span class="line">41</span><br><span class="line">42</span><br><span class="line">43</span><br><span class="line">44</span><br><span class="line">+</span><br><span class="line">45</span><br><span class="line">46</span><br><span class="line">47</span><br><span class="line">48</span><br><span class="line">49</span><br><div style="margin:1rem 0;"><span class="line"></span> </div><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br><span class="line">+</span><br></pre>
            </td>
            <td class="gutter">
                <pre><span class="line">11</span><br><div style="margin:1rem 0;"><span class="line"></span> </div><span class="line">37</span><br><span class="line">38</span><br><span class="line">39</span><br><span class="line">40</span><br><span class="line">41</span><br><span class="line">42</span><br><span class="line">-</span><br><span class="line">43</span><br><span class="line">44</span><br><span class="line">45</span><br><span class="line">46</span><br><span class="line">47</span><br><span class="line">48</span><br><div style="margin:1rem 0;"><span class="line"></span> </div><span class="line">83</span><br><span class="line">84</span><br><span class="line">85</span><br><span class="line">86</span><br><span class="line">87</span><br></pre>
            </td>
            <td class="code">
                <pre><div class="diff-highlight-add" style="width:590px;"><span class="line"><span class="keyword">const</span> text = <span class="variable language_">document</span>.<span class="title function_">getElementById</span>(<span class="string">&quot;textarea&quot;</span>);</span></div><div class="skip-highlight" style="width:590px;"><span class="line">(12 - 37)</span></div><span class="line">        <span class="comment">// For each ship in obj.ships, push class object into ships array</span></span><br><span class="line">        <span class="keyword">for</span>(<span class="keyword">const</span> i <span class="keyword">of</span> obj.<span class="property">ships</span>) &#123;</span><br><span class="line">            ships.<span class="title function_">push</span>(<span class="keyword">new</span> <span class="title class_">Ship</span>(i.<span class="property">id</span>, i.<span class="property">area</span>[<span class="number">0</span>], i.<span class="property">area</span>[<span class="number">1</span>], i.<span class="property">direction</span>));</span><br><span class="line">        &#125;</span><br><span class="line">        <span class="comment">// Call the string literal getter</span></span><br><span class="line">        <span class="keyword">for</span>(<span class="keyword">const</span> i <span class="keyword">of</span> ships) &#123;</span><br><div class="diff-highlight-del" style="width:590px;"><span class="line">            <span class="variable language_">console</span>.<span class="title function_">log</span>(i.<span class="property">printState</span>);</span></div><div class="diff-highlight-add" style="width:590px;"><span class="line">            <span class="title function_">log</span>(i.<span class="property">printState</span>);</span></div><span class="line">        &#125;</span><br><div class="diff-highlight-add" style="width:590px;"><span class="line">    &#125; <span class="keyword">else</span> &#123;</span><br><span class="line">      <span class="title function_">log</span>(<span class="title class_">JSON</span>.<span class="title function_">stringify</span>(<span class="title class_">JSON</span>.<span class="title function_">parse</span>(event.<span class="property">data</span>)));</span><br><span class="line">    &#125;</span></div><span class="line">&#125;;</span><br><div class="skip-highlight" style="width:590px;"><span class="line">(49 - 82)</span></div><div class="diff-highlight-add" style="width:590px;"><span class="line"><span class="keyword">function</span> <span class="title function_">log</span>(<span class="params">str</span>) &#123;</span><br><span class="line">    text.<span class="property">value</span> += <span class="string">&quot;\n&quot;</span> + str;</span><br><span class="line">    text.<span class="property">value</span> = text.<span class="property">value</span>.<span class="title function_">substring</span>(text.<span class="property">value</span>.<span class="property">length</span> - <span class="number">10000</span>);</span><br><span class="line">    text.<span class="property">scrollTop</span> = text.<span class="property">scrollHeight</span>;</span><br><span class="line">&#125;</span></div></pre>
            </td>
        </tr>
    </table>
</figure>

 We'll also spice up the page slightly with flexboxes, a `<fieldset>` and some CSS:

<figure class="highlight html">
<figcaption><span>[HTML] Adding fieldset and textarea</span></figcaption>
    <table>
        <tr>
            <td class="gutter">
                <pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br></pre>
            </td>
            <td class="code">
                <pre><div class="diff-highlight-add"><span class="line"><span class="tag">&lt;<span class="name">div</span> <span class="attr">class</span>=<span class="string">&quot;flex-container&quot;</span>&gt;</span></span><br><span class="line">    <span class="tag">&lt;<span class="name">div</span>&gt;</span></span><br><span class="line">        <span class="tag">&lt;<span class="name">fieldset</span>&gt;</span></span></div><span class="line">            <span class="tag">&lt;<span class="name">p</span>&gt;</span>Start Level:<span class="tag">&lt;/<span class="name">p</span>&gt;</span></span><br><div class="diff-highlight-add"><span class="line">            <span class="tag">&lt;<span class="name">div</span>&gt;</span></span></div><span class="line">                <span class="tag">&lt;<span class="name">button</span> <span class="attr">id</span>=<span class="string">&quot;lvl0&quot;</span>&gt;</span>Level 1<span class="tag">&lt;/<span class="name">button</span>&gt;</span></span><br><div class="diff-highlight-add"><span class="line">            <span class="tag">&lt;/<span class="name">div</span>&gt;</span></span></div><span class="line">            <span class="tag">&lt;<span class="name">p</span>&gt;</span>Steer Ships:<span class="tag">&lt;/<span class="name">p</span>&gt;</span></span><br><div class="diff-highlight-add"><span class="line">            <span class="tag">&lt;<span class="name">div</span>&gt;</span></span></div><span class="line">                <span class="tag">&lt;<span class="name">button</span> <span class="attr">id</span>=<span class="string">&quot;steer0&quot;</span>&gt;</span>Steer 0<span class="tag">&lt;/<span class="name">button</span>&gt;</span></span><br><div class="diff-highlight-add"><span class="line">            <span class="tag">&lt;/<span class="name">div</span>&gt;</span></span><br><span class="line">        <span class="tag">&lt;/<span class="name">fieldset</span>&gt;</span></span><br><span class="line">    <span class="tag">&lt;/<span class="name">div</span>&gt;</span></span><br><span class="line">    <span class="tag">&lt;<span class="name">div</span>&gt;</span></span><br><span class="line">        <span class="tag">&lt;<span class="name">textarea</span> <span class="attr">id</span>=<span class="string">&quot;textarea&quot;</span> <span class="attr">cols</span>=<span class="string">&quot;80&quot;</span> <span class="attr">rows</span>=<span class="string">&quot;20&quot;</span>&gt;</span><span class="tag">&lt;/<span class="name">textarea</span>&gt;</span></span><br><span class="line">    <span class="tag">&lt;/<span class="name">div</span>&gt;</span></span><br><span class="line"><span class="tag">&lt;/<span class="name">div</span>&gt;</span></span></div></pre>
            </td>
        </tr>
    </table>
</figure>

<div style="height:400px; overflow:auto; margin:1rem 0;">
<figure class="highlight css" style="margin:0">
<figcaption><span>[CSS] Some beauty treatment</span></figcaption>
    <table>
        <tr>
            <td class="gutter">
                <pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br><span class="line">26</span><br><span class="line">27</span><br><span class="line">28</span><br><span class="line">29</span><br><span class="line">30</span><br><span class="line">31</span><br><span class="line">32</span><br><span class="line">33</span><br><span class="line">34</span><br><span class="line">35</span><br><span class="line">36</span><br></pre>
            </td>
            <td class="code">
                <pre><span class="line"><span class="selector-class">.flex-container</span> &#123;</span><br><span class="line">    <span class="attribute">display</span>: flex;</span><br><span class="line">    <span class="attribute">flex-wrap</span>: nowrap;</span><br><span class="line">    <span class="attribute">justify-content</span>: center;</span><br><span class="line">    <span class="attribute">gap</span>: <span class="number">10px</span>;</span><br><span class="line">&#125;</span><br><span class="line"></span><br><span class="line"><span class="selector-tag">body</span> &#123;</span><br><span class="line">    <span class="attribute">background-color</span>: <span class="number">#1d1f21</span>;</span><br><span class="line">    <span class="attribute">color</span>: <span class="number">#c9cacc</span>;</span><br><span class="line">    <span class="attribute">font-size</span>: <span class="number">12px</span>;</span><br><span class="line">&#125;</span><br><span class="line"></span><br><span class="line"><span class="selector-tag">fieldset</span> &#123;</span><br><span class="line">    <span class="attribute">text-align</span>: center;</span><br><span class="line">    <span class="attribute">font-family</span>: <span class="string">&quot;Trebuchet MS&quot;</span>;</span><br><span class="line">&#125;</span><br><span class="line"></span><br><span class="line"><span class="selector-tag">textarea</span> &#123;</span><br><span class="line">    <span class="attribute">font-family</span>: <span class="string">&quot;Courier New&quot;</span>;</span><br><span class="line">&#125;</span><br><span class="line"></span><br><span class="line"><span class="selector-tag">p</span> &#123;</span><br><span class="line">    <span class="attribute">margin-top</span>: <span class="number">5px</span>;</span><br><span class="line">    <span class="attribute">margin-bottom</span>: <span class="number">5px</span>;</span><br><span class="line">&#125;</span><br><span class="line"></span><br><span class="line"><span class="selector-tag">button</span> &#123;</span><br><span class="line">    <span class="attribute">border</span>: none;</span><br><span class="line">    <span class="attribute">cursor</span>: pointer;</span><br><span class="line">    <span class="attribute">height</span>: <span class="number">25px</span>;</span><br><span class="line">    <span class="attribute">padding</span>: <span class="number">0px</span> <span class="number">10px</span>;</span><br><span class="line">    <span class="attribute">border-radius</span>: <span class="number">10px</span>;</span><br><span class="line">    <span class="attribute">color</span>: <span class="number">#222</span>;</span><br><span class="line">    <span class="attribute">font-size</span>: <span class="number">11px</span>;</span><br><span class="line">&#125;</span><br></pre>
            </td>
        </tr>
    </table>
</figure>
</div>

Here's the preview now:

<img src="/asset/utc/codepen2.png" style="border: 1px solid #333; margin:1rem 0;">

Sorry I was being extra. Let's flag the challenge now (sped up):

![Flag 1](/asset/utc/flag1.gif)

{% codeblock line_number:false %}
...
ID: 0 | (688, 115) (748, 383) | DIR: UP
ID: 0 | (688, 115) (748, 383) | DIR: UP
ID: 0 | (688, 111) (748, 379) | DIR: UP
{"type":"WIN","flag":"CTF{CapTA1n-cRUCh}"}
{% endcodeblock %}

We've succesfully completed Level 1!

---

### LEVEL 2

<div class="box">Lets script it - don't forget the order! [25 points]</div>

"Lets script it"? I've already scripted throughout the entirety of Level 1 to accommodate for future levels! Let's add a Level 2 button to our scalable, future-proof code 😉:

<figure class="highlight js">
<figcaption><span>[HTML] Adding level 1 flag to object literal</span></figcaption>
    <table>
        <tr>
            <td class="gutter">
                <pre><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br></pre>
            </td>
            <td class="code">
                <pre><span class="line"><span class="keyword">const</span> passwords = [&#123;</span><br><span class="line">        <span class="attr">level</span>: <span class="number">1</span>,</span><br><span class="line">        <span class="attr">password</span>: <span class="string">&quot;&quot;</span></span><br><span class="line">    &#125;<mark style="background-color:rgba(0,255,0,.05); color:white; margin:0; border-radius:5px;">,</mark></span><br><div class="diff-highlight-add"><span class="line">    &#123;</span><br><span class="line">        <span class="attr">level</span>: <span class="number">2</span>,</span><br><span class="line">        <span class="attr">password</span>: <span class="string">&quot;CTF&#123;CapTA1n-cRUCh&#125;&quot;</span></span><br><span class="line">    &#125;</span></div><span class="line">];</span><br></pre>
            </td>
        </tr>
    </table>
</figure>

<figure class="highlight html">
<figcaption><span>[HTML] Adding level 2 button</span></figcaption>
    <table>
        <tr>
            <td class="gutter">
                <pre><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br></pre>
            </td>
            <td class="code">
                <pre><span class="line"><span class="tag">&lt;<span class="name">fieldset</span>&gt;</span></span><br><span class="line">  <span class="tag">&lt;<span class="name">p</span>&gt;</span>Start Level:<span class="tag">&lt;/<span class="name">p</span>&gt;</span></span><br><span class="line">  <span class="tag">&lt;<span class="name">div</span>&gt;</span></span><br><span class="line">    <span class="tag">&lt;<span class="name">button</span> <span class="attr">id</span>=<span class="string">&quot;lvl0&quot;</span>&gt;</span>Level 1<span class="tag">&lt;/<span class="name">button</span>&gt;</span></span><br><div class="diff-highlight-add"><span class="line">    <span class="tag">&lt;<span class="name">button</span> <span class="attr">id</span>=<span class="string">&quot;lvl1&quot;</span>&gt;</span>Level 2<span class="tag">&lt;/<span class="name">button</span>&gt;</span></span></div><span class="line">  <span class="tag">&lt;/<span class="name">div</span>&gt;</span></span><br></pre>
            </td>
        </tr>
    </table>
</figure>

This is what appears when clicking the button:

![Level 2](/asset/utc/level2.gif)

Looks like we'll have to add two more steer buttons:

<figure class="highlight html">
<figcaption><span>[HTML] Adding steer 1/2 buttons</span></figcaption>
    <table>
        <tr>
            <td class="gutter">
                <pre><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br></pre>
            </td>
            <td class="code">
                <pre><span class="line">  <span class="tag">&lt;<span class="name">p</span>&gt;</span>Steer Ships:<span class="tag">&lt;/<span class="name">p</span>&gt;</span></span><br><span class="line">  <span class="tag">&lt;<span class="name">div</span>&gt;</span></span><br><span class="line">    <span class="tag">&lt;<span class="name">button</span> <span class="attr">id</span>=<span class="string">&quot;steer0&quot;</span>&gt;</span>Steer 0<span class="tag">&lt;/<span class="name">button</span>&gt;</span></span><br><div class="diff-highlight-add"><span class="line">    <span class="tag">&lt;<span class="name">button</span> <span class="attr">id</span>=<span class="string">&quot;steer1&quot;</span>&gt;</span>Steer 1<span class="tag">&lt;/<span class="name">button</span>&gt;</span></span><br><span class="line">    <span class="tag">&lt;<span class="name">button</span> <span class="attr">id</span>=<span class="string">&quot;steer2&quot;</span>&gt;</span>Steer 2<span class="tag">&lt;/<span class="name">button</span>&gt;</span></span></div><span class="line">  <span class="tag">&lt;/<span class="name">div</span>&gt;</span></span><br><span class="line"><span class="tag">&lt;/<span class="name">fieldset</span>&gt;</span></span><br></pre>
            </td>
        </tr>
    </table>
</figure>

It seems as though that you also need the ships to enter in a specific order. It will be difficult to multitask all three, but it's doable! Let's try to solve it (also very sped up):

![Flag 2](/asset/utc/flag2.gif)

```text
...
ID: 0 | (789, 105) (849, 294) | DIR: UP
ID: 1 | (796, 105) (856, 373) | DIR: UP
ID: 2 | (691, 108) (751, 389) | DIR: UP
{"type":"WIN","flag":"CTF{capt41n-h00k!}"}
```

Although we've solved level 2 manually, I have a gut feeling the next few ones won't be as trivial...

<a href="https://info.flagcounter.com/8Xkk"><img src="https://s01.flagcounter.com/count2/8Xkk/bg_212326/txt_C9CACC/border_C9CACC/columns_3/maxflags_12/viewers_3/labels_0/pageviews_1/flags_1/percent_0/" alt="Free counters!" border="0"></a>
