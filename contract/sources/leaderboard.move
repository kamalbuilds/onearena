module one_arena::leaderboard {
    use sui::event;
    use sui::table::{Self, Table};

    // ===== Constants =====
    const MAX_LEADERBOARD_SIZE: u64 = 100;

    // ===== Objects =====

    /// Admin capability for managing the leaderboard
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Shared leaderboard tracking top fighters by wins
    public struct Leaderboard has key {
        id: UID,
        /// Maps fighter ID -> win count
        entries: Table<ID, u64>,
        /// Ordered list of top fighter IDs (best first)
        top_fighters: vector<ID>,
        /// Total battles recorded
        total_battles: u64,
    }

    // ===== Events =====
    public struct LeaderboardUpdated has copy, drop {
        fighter_id: ID,
        new_wins: u64,
        rank: u64,
    }

    public struct LeaderboardCreated has copy, drop {
        leaderboard_id: ID,
    }

    // ===== Init =====

    /// Create the leaderboard as a shared object and give admin cap to deployer
    fun init(ctx: &mut TxContext) {
        let leaderboard = Leaderboard {
            id: object::new(ctx),
            entries: table::new(ctx),
            top_fighters: vector::empty(),
            total_battles: 0,
        };

        event::emit(LeaderboardCreated {
            leaderboard_id: object::id(&leaderboard),
        });

        transfer::share_object(leaderboard);

        let admin = AdminCap { id: object::new(ctx) };
        transfer::transfer(admin, ctx.sender());
    }

    // ===== Public(package) Functions =====

    /// Record a battle result and update rankings
    public(package) fun record_result(
        leaderboard: &mut Leaderboard,
        fighter_id: ID,
        total_wins: u64,
    ) {
        leaderboard.total_battles = leaderboard.total_battles + 1;

        // Update or insert entry
        if (table::contains(&leaderboard.entries, fighter_id)) {
            let entry = table::borrow_mut(&mut leaderboard.entries, fighter_id);
            *entry = total_wins;
        } else {
            table::add(&mut leaderboard.entries, fighter_id, total_wins);
        };

        // Update top_fighters ranking
        update_rankings(leaderboard, fighter_id, total_wins);
    }

    // ===== View Functions =====

    /// Get the top N fighter IDs
    public fun top_fighters(leaderboard: &Leaderboard, count: u64): vector<ID> {
        let len = vector::length(&leaderboard.top_fighters);
        let limit = if (count < len) { count } else { len };
        let mut result = vector::empty<ID>();
        let mut i = 0;
        while (i < limit) {
            vector::push_back(&mut result, *vector::borrow(&leaderboard.top_fighters, i));
            i = i + 1;
        };
        result
    }

    /// Get win count for a specific fighter
    public fun wins_for(leaderboard: &Leaderboard, fighter_id: ID): u64 {
        if (table::contains(&leaderboard.entries, fighter_id)) {
            *table::borrow(&leaderboard.entries, fighter_id)
        } else {
            0
        }
    }

    /// Get rank of a fighter (1-indexed, 0 if not ranked)
    public fun rank_of(leaderboard: &Leaderboard, fighter_id: ID): u64 {
        let len = vector::length(&leaderboard.top_fighters);
        let mut i = 0;
        while (i < len) {
            if (*vector::borrow(&leaderboard.top_fighters, i) == fighter_id) {
                return i + 1
            };
            i = i + 1;
        };
        0
    }

    /// Get total battles recorded
    public fun total_battles(leaderboard: &Leaderboard): u64 {
        leaderboard.total_battles
    }

    /// Get leaderboard size
    public fun size(leaderboard: &Leaderboard): u64 {
        vector::length(&leaderboard.top_fighters)
    }

    // ===== Admin Functions =====

    /// Reset the leaderboard (admin only). Creates a fresh leaderboard.
    entry fun reset(_admin: &AdminCap, leaderboard: &mut Leaderboard) {
        leaderboard.top_fighters = vector::empty();
        leaderboard.total_battles = 0;
        // Note: table entries remain but rankings are cleared
    }

    // ===== Internal =====

    fun update_rankings(leaderboard: &mut Leaderboard, fighter_id: ID, wins: u64) {
        let top = &mut leaderboard.top_fighters;

        // Remove fighter if already in list
        let len = vector::length(top);
        let mut existing_idx: u64 = len; // sentinel: not found
        let mut i = 0;
        while (i < len) {
            if (*vector::borrow(top, i) == fighter_id) {
                existing_idx = i;
                break
            };
            i = i + 1;
        };

        if (existing_idx < len) {
            vector::remove(top, existing_idx);
        };

        // Find insertion point (sorted descending by wins)
        let new_len = vector::length(top);
        let mut insert_at: u64 = new_len;
        i = 0;
        while (i < new_len) {
            let other_id = *vector::borrow(top, i);
            let other_wins = *table::borrow(&leaderboard.entries, other_id);
            if (wins > other_wins) {
                insert_at = i;
                break
            };
            i = i + 1;
        };

        // Insert at correct position
        vector::insert(top, fighter_id, insert_at);

        // Trim to max size
        while (vector::length(top) > MAX_LEADERBOARD_SIZE) {
            vector::pop_back(top);
        };

        // Emit rank update
        let rank = insert_at + 1;
        if (rank <= MAX_LEADERBOARD_SIZE) {
            event::emit(LeaderboardUpdated {
                fighter_id,
                new_wins: wins,
                rank,
            });
        };
    }

    // ===== Test Helpers =====
    #[test_only]
    public fun new_for_testing(ctx: &mut TxContext): Leaderboard {
        Leaderboard {
            id: object::new(ctx),
            entries: table::new(ctx),
            top_fighters: vector::empty(),
            total_battles: 0,
        }
    }

    #[test_only]
    public fun share_for_testing(lb: Leaderboard) {
        transfer::share_object(lb);
    }
}
