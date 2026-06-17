/* bombFormula.js
 *
 * Standard dice-scaled bomb damage formula, shared by the artifact handler
 * (knight lands on a bomb) and the post-move handler (bomb is adjacent).
 */

export function computeBombDamage(diceNumber) {
    return Math.ceil(
        (10 * (Math.log(Math.pow(2, diceNumber)) + Math.log(Math.pow(1.5, diceNumber)))) /
        Math.pow(Math.E, 1 / diceNumber) +
        10 / diceNumber
    );
}
