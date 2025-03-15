#[test_only]
module one_arena::leaderboard_tests {
    use sui::test_scenario;
    use one_arena::leaderboard::{Self, Leaderboard};

    #[test]
    fun test_leaderboard_record_and_rank() {
        let admin = @0xAD;
        let mut scenario = test_scenario::begin(admin);

        test_scenario::next_tx(&mut scenario, admin);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            let leaderboard = leaderboard::new_for_testing(ctx);
            leaderboard::share_for_testing(leaderboard);
        };

        test_scenario::next_tx(&mut scenario, admin);
        {
            let mut lb = test_scenario::take_shared<Leaderboard>(&scenario);

            let id1 = object::id_from_address(@0x1);
            let id2 = object::id_from_address(@0x2);
            let id3 = object::id_from_address(@0x3);

            leaderboard::record_result(&mut lb, id1, 5);
            leaderboard::record_result(&mut lb, id2, 10);
            leaderboard::record_result(&mut lb, id3, 3);

            assert!(leaderboard::rank_of(&lb, id2) == 1, 0);
            assert!(leaderboard::rank_of(&lb, id1) == 2, 1);
            assert!(leaderboard::rank_of(&lb, id3) == 3, 2);

            assert!(leaderboard::wins_for(&lb, id1) == 5, 3);
            assert!(leaderboard::wins_for(&lb, id2) == 10, 4);

            assert!(leaderboard::total_battles(&lb) == 3, 5);
            assert!(leaderboard::size(&lb) == 3, 6);

            test_scenario::return_shared(lb);
        };

        // Update existing fighter's wins - should re-rank
        test_scenario::next_tx(&mut scenario, admin);
        {
            let mut lb = test_scenario::take_shared<Leaderboard>(&scenario);
            let id1 = object::id_from_address(@0x1);
            let id2 = object::id_from_address(@0x2);

            leaderboard::record_result(&mut lb, id1, 15);

            assert!(leaderboard::rank_of(&lb, id1) == 1, 7);
            assert!(leaderboard::rank_of(&lb, id2) == 2, 8);

            test_scenario::return_shared(lb);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_top_fighters() {
        let admin = @0xAD;
        let mut scenario = test_scenario::begin(admin);

        test_scenario::next_tx(&mut scenario, admin);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            let leaderboard = leaderboard::new_for_testing(ctx);
            leaderboard::share_for_testing(leaderboard);
        };

        test_scenario::next_tx(&mut scenario, admin);
        {
            let mut lb = test_scenario::take_shared<Leaderboard>(&scenario);

            let id1 = object::id_from_address(@0x1);
            let id2 = object::id_from_address(@0x2);

            leaderboard::record_result(&mut lb, id1, 5);
            leaderboard::record_result(&mut lb, id2, 10);

            let top = leaderboard::top_fighters(&lb, 1);
            assert!(vector::length(&top) == 1, 0);
            assert!(*vector::borrow(&top, 0) == id2, 1);

            let top2 = leaderboard::top_fighters(&lb, 5);
            assert!(vector::length(&top2) == 2, 2);

            test_scenario::return_shared(lb);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_unranked_fighter() {
        let admin = @0xAD;
        let mut scenario = test_scenario::begin(admin);

        test_scenario::next_tx(&mut scenario, admin);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            let leaderboard = leaderboard::new_for_testing(ctx);
            leaderboard::share_for_testing(leaderboard);
        };

        test_scenario::next_tx(&mut scenario, admin);
        {
            let lb = test_scenario::take_shared<Leaderboard>(&scenario);
            let unknown_id = object::id_from_address(@0x999);

            assert!(leaderboard::rank_of(&lb, unknown_id) == 0, 0);
            assert!(leaderboard::wins_for(&lb, unknown_id) == 0, 1);

            test_scenario::return_shared(lb);
        };

        test_scenario::end(scenario);
    }
}
