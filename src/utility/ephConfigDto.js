/*
 * ephConfigDto.js
 *
 * Builds the slimmed-down `eph_config` payload that the client actually
 * consumes. This keeps server-only bookkeeping fields (e.g.
 * `lastValidPositions`, `mageCoordinate`, `isAuraThresholdThreeCrossed`)
 * from being leaked over the wire, and locks down the public response
 * shape so refactors of `ephemeral_config` don't accidentally change the
 * client contract.
 *
 * Note: each DAO defines a `toJSON()` method that flattens the wrapped
 * model. Returning the DAO directly here is fine - JSON.stringify will
 * call toJSON automatically.
 */

export function buildEphConfigDto(eph_config) {
    return {
        score: eph_config.score,
        knightHealth: eph_config.knightHealth,
        knightWeapon: eph_config.knightWeapon,
        activePoisons: eph_config.activePoisons,
        activeEnigma: eph_config.activeEnigma,
        aura: eph_config.aura,
        currentGameStatus: eph_config.currentGameStatus,
        audioList: eph_config.audioList,
        screenLogs: eph_config.screenLogs,
        newGrid: eph_config.newGrid,
        newCardLocations: eph_config.newCardLocations,
    };
}
