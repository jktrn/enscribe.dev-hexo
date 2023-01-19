---
title: Kleptomaniac
date: 2022-05-28 22:50:00
tags:
permalink: /linuxbro-has-bad-ascii/
hidden: true
thumbnail: https://enscribe.dev/image/banner-ctfs.png
---

We are presented with a single file, `main.py`, a "secret value", and a `netcat` command to connect to the service.  When you conenct to the service you are greeted with a message welcoming you to the Thieves Lair, and it asks you to prove your membership by predicting the future. It then prints a message asking you to pick a number between 0 and a very large number. If you guess wrong, it tells you the correct value it was thinking of, and asksyou to guess a new number, this repeates forever. If we guess the right number, we get the flag. My first thought was to hire a psychic to try to predict the future, but none of them could help, so that was a waste of $100. Apparently they only do "vague" predictions of the future.

Secondly, the `main.py` file is the code that the server is running.  Reading through it, it simply defines a pseudo-random number generator, generates some random data, and asks you to guess it.  On the face, this seems impossible, that's kind of the point of pseudo-random number generators.

Buckle up, this one requires some explanation.

## Background

This challenge is a modified version of the theorized `Dual_EC_DRBG` (referred to as DualEC) backdoor.  DualEC is a "PRNG" or pseudo-random number generator that was originally proposed by NIST for adoption as a standard, which would mean lots of software would use it as a default PRNG.  DualEC is based on Elliptic Curve Cryptography (ECC).
ECC is based around elliptic curves, or curves that take the form of `y^2 = x^3 + ax + b`.  

The `a` and `b` values are standardized based on what curve you're using. In the case of DualEC, those numbers can be found [here](https://neuromancer.sk/std/nist/P-256#). A generic curve of the form `y^2 = x^3 + ax + b` looks like this:

```text
                                        *                                       
                                       %%/                                      
                                        %                                       
                                        %                          ./           
                                        %                         #             
                                        %                        #              
                                        %                      #                
                                        %                    .(                 
                            .(######,   %                   #                   
                       #*               #,               *#                     
                    #                   %  (#         .#                        
                  (.                    %      #####                            
                 #                      %                                       
                *                       %                                       
                #                       %                                       
                #                       %                                       
 %%%%%%%%%%%%%%%#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                #                       %                                       
                #                       %                                       
                 *                      %                                       
                 /                      %                                       
                   #                    %      *####*                           
                    .#                  %  #           #(                       
                       .#,             ##                 #                     
                                ..      %                   #                   
                                        %                     #                 
                                        %                      .#               
                                        %                        #              
                                        %                         ,*            
                                        %                           #           
                                        %                                       
                                       /%    

```

Encrypting data with ECC involves picking a point on the curve, and performing an operation on the point to reach a new point.  It's very hard to figure out how many times this operation was performed if you only know the start and end points.  This is the core of ECC's "trapdoor function".  A trapdoor function is very easy to do in one direction, and very very hard to do in the other direction.  If you have a start point (or end), and the number of times to perform your operation, it's easy to find the other point. If you have two points, but don't know how many operations were performed, you have to try every possibility.

To use ECC as a PRNG, we need to take some input, and use it to seed our random number generation.  Computers are deterministic, they don't make random data. So in order to genereate pseudo-random (essentially, random enough) data, we need to start with something that is random.  You can use keystrokes, mouse clicks, mouse position, etc.  Cloudflare famously uses image data from a camera pointed at a wall of lava lamps.  Once we have our seed, we can keep getting a stream of numbers, and as long as nobody knows our seed, we're fine. If someone knows the seed or the current state, they can seed a generator of their own and get the same output that we would get. IF we use the random data to generate something like a cryptographic key, an adversary would only have to generate and guess a very small number of keys since they know all future outputs of our generator.

DualEC attempts to generate pseudo-random numbers in the following way:

We start with some points on the curve, `P` and `Q` (these are normally defined by the standard, in this case they are provided by the CTF).Since they're points, they each have an `X` and `Y` coordinate.  We also have an initial state "s" (just a random number, our seed) for our random number generator.

Then we apply a mathmateical function to the point `P`, `s` number of times, this gives us a new point `sP`. Then we take the `x` coordinate of this new point `sP` and call it `r`.

We use `r` and `Q` to generate another random point, called `rQ`, We take the `x` coordinate of that and then we throw away the first 16 bits. The resulting bits `G` are your random bits to use for whatever you need (like key generation!).

Now we need to update our state, which means update `s` so that the next time we ask for random data, we get different data. We do this, by taking `r` and `P`, and calculating `rP`, and using the resulting `x` coordinate of that point for `s`.

Take a look at this cool chart I made to show it off!

```text
 ------rP<---
 |          |
 |          |
 |          |
 --->s--sP--r-->rQ-->G
```

## The Scary Part

**Minor spookiness:**
When we cut off 16 bits from `rQ`'s `x` coordinate, that's not really that many.  2^16 is only 65,536, trivial for a computer to calculate. This means we could generate a list of every possible x-value for `rQ`, and then see which of those x-coordinates have a corresponding y-coordinate on the curve.  That's not great, but because applying `r` to `Q` is one-way trapdoor function, we're fine, right?

**Major Spookiness:**
What if there was a secret magic relationship between `P` and `Q`?  Maybe there was a secret magic number `e` such that `P = eQ`?  If `e` is sufficiently large, it's very hard to find and prove that relationship.  You would just have to brute force all possible values. If we had that, we could do `e(rQ) = r(eQ) = rP`. `rP` is the  point that we use to update `s` (by taking it's x-value).  This means if any of your pseudo-random output was leaked, an attacker who knows the magic `e` could use it to figure out what state your PRNG is in, and calculate all future values.  This is very bad if you're using those values in cryptography.

**Explaining Our Solution Script:**
This script contains 2 hardcoded values (we're lazy, sue us) `cur` and `nex`.  `cur` is the answer we receive from the first failed submission, and `nex` is the answer we receive from the second failed submission.  `cur` and `nex` are two different values of `G` from the chart above.   We take `curr`, and for every value between 1 and 65536 we operate on it with `e`, the secret value we were given.  This gives us 65536 possible  values for `rP` (and therefore `s`).  We take all of those values and attempt to calculate a new `G`, and check if any of them are equal to `nex`. If we find a match, we know that we have the state used to calculate `nex`.  Then we just follow the algorithm and update `s`, generate a new `G`, and submit it to the server!

flag: `sdctf{W0W_aR3_y0u_Th3_NSA}`

(Also the challenge name is a reference to "Kleptography", a field based around cryptographic backdoors)

References:

- [A Relatively Easy Way to Understand Primer on Elliptic-Curve Cryptography](https://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-elliptic-curve-cryptography/)
- [Computerphile video on Dual_EC_DBRG](https://www.youtube.com/watch?v=nybVFJVXbww)
- The `find_point_on_p256`, `mod_inv` and `p256_mod_sqrt` functions helpfully borrowed from [here](https://github.com/AntonKueltz/dual-ec-poc).

```py
import math
import concurrent.futures

#Helper for the next 2 functions
def invModPrime(num, mod):
  return pow(num, mod - 2, mod)

# Doubles a given point over the provided curve
# Helper function for mulECPointScalar
def doubleECPoint(curve, P):
  (a, b, prime) = curve
  (px, py) = P
  if P == (0, 0):
    return (0, 0)
  lam = (3 * px * px + a) * invModPrime(2 * py, prime)
  rx = (lam * lam - px - px) % prime
  ry = (lam * (px - rx) - py) % prime
  return (rx, ry)

# Adds two given points over the provided curve
# Helper function for mulECPointScalar
def addECPoints(curve, P, Q):
  (a, b, prime) = curve
  (px, py) = P
  (qx, qy) = Q
  if P == (0, 0):
    return Q
  elif Q == (0, 0):
    return P
  elif P == Q:
    return doubleECPoint(curve, P)
  lam = (qy - py) * invModPrime(qx - px, prime)
  rx = (lam * lam - px - qx) % prime
  ry = (lam * (px - rx) - py) % prime
  return (rx, ry)
  
# Multiply a given point with a scalar over the provided curve
# This is the function we use with "r" to generate rP, and rQ
def mulECPointScalar(curve, P, d):
  if d == 0:
    return (0, 0)
  elif d == 1:
    return P
  elif d % 2 == 1:
    Q = mulECPointScalar(curve, P, d-1)
    return addECPoints(curve, P, Q)
  else:
    Q = mulECPointScalar(curve, P, d//2)
    return doubleECPoint(curve, Q)

def p256_mod_sqrt(c):
    # only works for field P256 is over
    p = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff
    t1 = pow(c, 2, p)
    t1 = (t1 * c) % p
    t2 = pow(t1, 2**2, p)
    t2 = (t2 * t1) % p
    t3 = pow(t2, 2**4, p)
    t3 = (t3 * t2) % p
    t4 = pow(t3, 2**8, p)
    t4 = (t4 * t3) % p
    r = pow(t4, 2**16, p)
    r = (r * t4) % p
    r = pow(r, 2**32, p)
    r = (r * c) % p
    r = pow(r, 2**96, p)
    r = (r * c) % p
    return pow(r, 2**94, p)


#determines whether a point falls on our curve
def find_point_on_p256(x):
    # equation: y^2 = x^3-ax+b
    y2 = (x * x * x) - (3 * x) + b
    y2 = y2 % prime
    y = p256_mod_sqrt(y2)
    return y2 == (y * y) % prime, y

cur = 0x74a15759fbb06a0414068b06182ed551185ef23b6d1aa7e3e2582c630ce14d #the output of the first failed attempt from the service
nex = 0x98e8c6b029d16839e4bc9dda764e2b52cae47c9daedc46e621a2a8a30465de #the output of the second failed attempt from the service
e = 631834454084342672581625543416943218421278045524087283337045687114865341 #Spooky secret value provided in the challenge description
NIST_256_CURVE = (-3, 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b, 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff)
P = (0x1c1259e8bc9ba0823e5ad8480586b26d1f33f52600a3204aeb57c8f4d87434b9, 0xb422ac1753c053f6270bbcab5aa63cfad40534a8d1df8e5425ed597b6c5cf4c2)
Q = (0xc97445f45cdef9f0d3e05e1e585fc297235b82b5be8ff3efca67c59852018192, 0xb28ef557ba31dfcbdd21ac46e2a91e3c304f44cb87058ada2cb815151e610046)

def forloop(i):
    temp = int(format(i,'16b') + format(cur,'62b'),2)
    if find_point_on_p256(temp)[0]:
        state = mulECPointScalar(NIST_256_CURVE, (temp,find_point_on_p256(temp)[1]), e)[0]
        if (mulECPointScalar(NIST_256_CURVE, Q, state)[0] & 0x00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff) == nex:
            print("yes")
            state = mulECPointScalar(NIST_256_CURVE, P, state)[0]
            print(hex(mulECPointScalar(NIST_256_CURVE, Q, state)[0] & 0x00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff))

def main():
    executor = concurrent.futures.ProcessPoolExecutor(32)
    futures = [executor.submit(forloop, i) for i in range(1, 65536)]
    concurrent.futures.wait(futures)

if __name__ == '__main__':
    main()
    print("done with all loops")
```
