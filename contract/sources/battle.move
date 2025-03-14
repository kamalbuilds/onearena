module one_arena::battle {
    use std::string::String;
    use sui::event;
    use sui::random::{Self, Random};
    use one_arena::fighter::{Self, Fighter};
    use one_arena::leaderboard::{Self, Leaderboard};

    // ===== Constants =====
    const MAX_ROUNDS: u64 = 10;
    const DAMAGE_SCALE: u64 = 100;
    const SPEED_ADVANTAGE_BONUS: u64 = 15;

    // ===== Errors =====
    const ESameFighter: u64 = 0;

    // ===== Events =====
    public struct BattleResult has copy, drop {
        fighter1_id: ID,
        fighter2_id: ID,
        winner_id: ID,
        loser_id: ID,
        fighter1_damage_dealt: u64,
        fighter2_damage_dealt: u64,
        rounds: u64,
        fighter1_name: String,
        fighter2_name: String,
        winner_name: String,
    }

    public struct BattleRound has copy, drop {
        round: u64,
        attacker_id: ID,
        defender_id: ID,
        damage: u64,
        attacker_hp_remaining: u64,
        defender_hp_remaining: u64,
    }

    // ===== Public Functions =====

    /// Execute a battle between two fighters. Deterministic outcome based on stats + on-chain randomness.
    /// Both fighters must be owned by the caller (for testing/demo).
    /// In production, a matchmaking shared object would hold references.
    entry fun battle(
        fighter1: &mut Fighter,
        fighter2: &mut Fighter,
        leaderboard: &mut Leaderboard,
        r: &Random,
        ctx: &mut TxContext,
    ) {
        // Ensure fighters are different objects
        assert!(object::id(fighter1) != object::id(fighter2), ESameFighter);

        let mut gen = random::new_generator(r, ctx);

        // Simulate combat
        let mut f1_hp = fighter::hp(fighter1);
        let mut f2_hp = fighter::hp(fighter2);
        let mut f1_total_damage: u64 = 0;
        let mut f2_total_damage: u64 = 0;
        let mut round: u64 = 0;

        while (round < MAX_ROUNDS && f1_hp > 0 && f2_hp > 0) {
            round = round + 1;

            // Determine who attacks first based on speed + randomness
            let speed_roll = random::generate_u64_in_range(&mut gen, 0, 100);
            let f1_speed = fighter::speed(fighter1);
            let f2_speed = fighter::speed(fighter2);

            let f1_goes_first = if (f1_speed > f2_speed) {
                speed_roll < 65 // faster fighter has 65% chance to go first
            } else if (f2_speed > f1_speed) {
                speed_roll >= 65
            } else {
                speed_roll < 50
            };

            if (f1_goes_first) {
                // Fighter 1 attacks first
                let dmg = calculate_damage(
                    fighter::attack(fighter1),
                    fighter::defense(fighter2),
                    fighter::speed(fighter1),
                    fighter::speed(fighter2),
                    &mut gen,
                );
                if (dmg >= f2_hp) { f2_hp = 0 } else { f2_hp = f2_hp - dmg };
                f1_total_damage = f1_total_damage + dmg;

                event::emit(BattleRound {
                    round,
                    attacker_id: fighter::id(fighter1),
                    defender_id: fighter::id(fighter2),
                    damage: dmg,
                    attacker_hp_remaining: f1_hp,
                    defender_hp_remaining: f2_hp,
                });

                // Fighter 2 counter-attacks if alive
                if (f2_hp > 0) {
                    let dmg2 = calculate_damage(
                        fighter::attack(fighter2),
                        fighter::defense(fighter1),
                        fighter::speed(fighter2),
                        fighter::speed(fighter1),
                        &mut gen,
                    );
                    if (dmg2 >= f1_hp) { f1_hp = 0 } else { f1_hp = f1_hp - dmg2 };
                    f2_total_damage = f2_total_damage + dmg2;

                    event::emit(BattleRound {
                        round,
                        attacker_id: fighter::id(fighter2),
                        defender_id: fighter::id(fighter1),
                        damage: dmg2,
                        attacker_hp_remaining: f2_hp,
                        defender_hp_remaining: f1_hp,
                    });
                };
            } else {
                // Fighter 2 attacks first
                let dmg = calculate_damage(
                    fighter::attack(fighter2),
                    fighter::defense(fighter1),
                    fighter::speed(fighter2),
                    fighter::speed(fighter1),
                    &mut gen,
                );
                if (dmg >= f1_hp) { f1_hp = 0 } else { f1_hp = f1_hp - dmg };
                f2_total_damage = f2_total_damage + dmg;

                event::emit(BattleRound {
                    round,
                    attacker_id: fighter::id(fighter2),
                    defender_id: fighter::id(fighter1),
                    damage: dmg,
                    attacker_hp_remaining: f2_hp,
                    defender_hp_remaining: f1_hp,
                });

                // Fighter 1 counter-attacks if alive
                if (f1_hp > 0) {
                    let dmg2 = calculate_damage(
                        fighter::attack(fighter1),
                        fighter::defense(fighter2),
                        fighter::speed(fighter1),
                        fighter::speed(fighter2),
                        &mut gen,
                    );
                    if (dmg2 >= f2_hp) { f2_hp = 0 } else { f2_hp = f2_hp - dmg2 };
                    f1_total_damage = f1_total_damage + dmg2;

                    event::emit(BattleRound {
                        round,
                        attacker_id: fighter::id(fighter1),
                        defender_id: fighter::id(fighter2),
                        damage: dmg2,
                        attacker_hp_remaining: f1_hp,
                        defender_hp_remaining: f2_hp,
                    });
                };
            };
        };

        // Determine winner: whoever has more HP remaining (or fighter1 if tied)
        let f1_wins = if (f1_hp == 0 && f2_hp == 0) {
            // Both KO'd: whoever dealt more damage wins
            f1_total_damage >= f2_total_damage
        } else if (f1_hp == 0) {
            false
        } else if (f2_hp == 0) {
            true
        } else {
            // Time out: whoever has more HP remaining
            f1_hp >= f2_hp
        };

        if (f1_wins) {
            fighter::record_win(fighter1);
            fighter::record_loss(fighter2);
            leaderboard::record_result(leaderboard, fighter::id(fighter1), fighter::wins(fighter1));

            event::emit(BattleResult {
                fighter1_id: fighter::id(fighter1),
                fighter2_id: fighter::id(fighter2),
                winner_id: fighter::id(fighter1),
                loser_id: fighter::id(fighter2),
                fighter1_damage_dealt: f1_total_damage,
                fighter2_damage_dealt: f2_total_damage,
                rounds: round,
                fighter1_name: fighter::name(fighter1),
                fighter2_name: fighter::name(fighter2),
                winner_name: fighter::name(fighter1),
            });
        } else {
            fighter::record_win(fighter2);
            fighter::record_loss(fighter1);
            leaderboard::record_result(leaderboard, fighter::id(fighter2), fighter::wins(fighter2));

            event::emit(BattleResult {
                fighter1_id: fighter::id(fighter1),
                fighter2_id: fighter::id(fighter2),
                winner_id: fighter::id(fighter2),
                loser_id: fighter::id(fighter1),
                fighter1_damage_dealt: f1_total_damage,
                fighter2_damage_dealt: f2_total_damage,
                rounds: round,
                fighter1_name: fighter::name(fighter1),
                fighter2_name: fighter::name(fighter2),
                winner_name: fighter::name(fighter2),
            });
        };
    }

    // ===== Internal =====

    fun calculate_damage(
        attacker_atk: u64,
        defender_def: u64,
        attacker_speed: u64,
        defender_speed: u64,
        gen: &mut random::RandomGenerator,
    ): u64 {
        // Base damage = attack * (100 / (100 + defense))
        let base = (attacker_atk * DAMAGE_SCALE) / (DAMAGE_SCALE + defender_def);

        // Speed advantage bonus
        let speed_bonus = if (attacker_speed > defender_speed) {
            (base * SPEED_ADVANTAGE_BONUS) / 100
        } else {
            0
        };

        // Random variance: +/- 20%
        let variance_roll = random::generate_u64_in_range(gen, 80, 120);
        let damage = ((base + speed_bonus) * variance_roll) / 100;

        // Minimum 1 damage
        if (damage == 0) { 1 } else { damage }
    }
}
