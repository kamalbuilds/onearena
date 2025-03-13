module one_arena::fighter {
    use std::string::String;
    use sui::event;
    use sui::random::{Self, Random};

    // ===== Constants =====
    const MIN_STAT: u64 = 10;
    const MAX_STAT: u64 = 100;
    const BASE_HP: u64 = 100;
    const XP_PER_WIN: u64 = 30;
    const XP_PER_LOSS: u64 = 10;
    const XP_TO_LEVEL: u64 = 100;
    const MAX_LEVEL: u64 = 50;
    const STAT_GAIN_PER_LEVEL: u64 = 2;

    // ===== Errors =====
    const EAlreadyMaxLevel: u64 = 0;
    const ENotEnoughXP: u64 = 1;

    // ===== Objects =====
    public struct Fighter has key, store {
        id: UID,
        name: String,
        dna: u256,
        attack: u64,
        defense: u64,
        speed: u64,
        hp: u64,
        level: u64,
        xp: u64,
        wins: u64,
        losses: u64,
    }

    // ===== Events =====
    public struct FighterMinted has copy, drop {
        fighter_id: ID,
        name: String,
        dna: u256,
        attack: u64,
        defense: u64,
        speed: u64,
        hp: u64,
        owner: address,
    }

    public struct FighterLeveledUp has copy, drop {
        fighter_id: ID,
        new_level: u64,
        attack: u64,
        defense: u64,
        speed: u64,
        hp: u64,
    }

    // ===== Public Functions =====

    /// Mint a new fighter with random stats derived from on-chain randomness
    entry fun mint(
        name: String,
        r: &Random,
        ctx: &mut TxContext,
    ) {
        let mut gen = random::new_generator(r, ctx);
        let dna = random::generate_u256(&mut gen);

        // Derive stats from randomness
        let attack = MIN_STAT + (random::generate_u64_in_range(&mut gen, 0, MAX_STAT - MIN_STAT));
        let defense = MIN_STAT + (random::generate_u64_in_range(&mut gen, 0, MAX_STAT - MIN_STAT));
        let speed = MIN_STAT + (random::generate_u64_in_range(&mut gen, 0, MAX_STAT - MIN_STAT));
        let hp = BASE_HP + (random::generate_u64_in_range(&mut gen, 0, 50));

        let fighter = Fighter {
            id: object::new(ctx),
            name,
            dna,
            attack,
            defense,
            speed,
            hp,
            level: 1,
            xp: 0,
            wins: 0,
            losses: 0,
        };

        event::emit(FighterMinted {
            fighter_id: object::id(&fighter),
            name: fighter.name,
            dna: fighter.dna,
            attack: fighter.attack,
            defense: fighter.defense,
            speed: fighter.speed,
            hp: fighter.hp,
            owner: ctx.sender(),
        });

        transfer::transfer(fighter, ctx.sender());
    }

    /// Award XP for a win and auto-level if enough XP
    public(package) fun record_win(fighter: &mut Fighter) {
        fighter.wins = fighter.wins + 1;
        fighter.xp = fighter.xp + XP_PER_WIN;
        try_level_up(fighter);
    }

    /// Award XP for a loss and auto-level if enough XP
    public(package) fun record_loss(fighter: &mut Fighter) {
        fighter.losses = fighter.losses + 1;
        fighter.xp = fighter.xp + XP_PER_LOSS;
        try_level_up(fighter);
    }

    /// Manually trigger level up if XP is sufficient
    entry fun level_up(fighter: &mut Fighter) {
        assert!(fighter.level < MAX_LEVEL, EAlreadyMaxLevel);
        assert!(fighter.xp >= XP_TO_LEVEL, ENotEnoughXP);
        do_level_up(fighter);
    }

    // ===== Accessors =====
    public fun id(fighter: &Fighter): ID { object::id(fighter) }
    public fun name(fighter: &Fighter): String { fighter.name }
    public fun dna(fighter: &Fighter): u256 { fighter.dna }
    public fun attack(fighter: &Fighter): u64 { fighter.attack }
    public fun defense(fighter: &Fighter): u64 { fighter.defense }
    public fun speed(fighter: &Fighter): u64 { fighter.speed }
    public fun hp(fighter: &Fighter): u64 { fighter.hp }
    public fun level(fighter: &Fighter): u64 { fighter.level }
    public fun xp(fighter: &Fighter): u64 { fighter.xp }
    public fun wins(fighter: &Fighter): u64 { fighter.wins }
    public fun losses(fighter: &Fighter): u64 { fighter.losses }

    // ===== Internal =====
    fun try_level_up(fighter: &mut Fighter) {
        if (fighter.xp >= XP_TO_LEVEL && fighter.level < MAX_LEVEL) {
            do_level_up(fighter);
        }
    }

    fun do_level_up(fighter: &mut Fighter) {
        fighter.xp = fighter.xp - XP_TO_LEVEL;
        fighter.level = fighter.level + 1;

        // Boost stats on level up
        fighter.attack = fighter.attack + STAT_GAIN_PER_LEVEL;
        fighter.defense = fighter.defense + STAT_GAIN_PER_LEVEL;
        fighter.speed = fighter.speed + STAT_GAIN_PER_LEVEL;
        fighter.hp = fighter.hp + STAT_GAIN_PER_LEVEL * 2;

        event::emit(FighterLeveledUp {
            fighter_id: object::id(fighter),
            new_level: fighter.level,
            attack: fighter.attack,
            defense: fighter.defense,
            speed: fighter.speed,
            hp: fighter.hp,
        });
    }
}
