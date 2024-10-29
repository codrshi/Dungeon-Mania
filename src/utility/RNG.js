/* RNG.js
 *
 * This utility file returns a random number in the given range [a,b].
 */

export function getRandom(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}