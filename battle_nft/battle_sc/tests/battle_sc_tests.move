#[test_only]
module battle_sc::battle_sc_tests {
    use sui::test_scenario;
    use battle_sc::battle_sc::{Self, Hero, Accessory};
    use std::string;
    use sui::coin;
    use sui::sui::SUI;

    #[test]
    fun test_equip_and_unequip_accessory() {
        let user = @0xA;
        
        let mut scenario = test_scenario::begin(user);
        
        {
            let ctx = test_scenario::ctx(&mut scenario);
            hero_adventure::mint_hero(
                string::utf8(b"Brave Knight"),
                string::utf8(b"https://example.com/hero.png"),
                ctx
            );
        };
        
        test_scenario::next_tx(&mut scenario, user);
        
        {
            let ctx = test_scenario::ctx(&mut scenario);
            hero_adventure::mint_accessory(
                string::utf8(b"Excalibur"),
                string::utf8(b"Weapon"),
                100,
                string::utf8(b"https://example.com/sword.png"),
                ctx
            );
        };
        
        test_scenario::next_tx(&mut scenario, user);
        
        {
            let mut hero = test_scenario::take_from_sender<Hero>(&scenario);
            let weapon = test_scenario::take_from_sender<Accessory>(&scenario);
            
            hero_adventure::equip_accessory(&mut hero, weapon);
            
            assert!(hero_adventure::has_accessory(&hero, string::utf8(b"Weapon")), 0);
            
            test_scenario::return_to_sender(&scenario, hero);
        };
        
        test_scenario::next_tx(&mut scenario, user);
        
        {
            let mut hero = test_scenario::take_from_sender<Hero>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            hero_adventure::unequip_accessory(&mut hero, string::utf8(b"Weapon"), ctx);
            
            assert!(!hero_adventure::has_accessory(&hero, string::utf8(b"Weapon")), 1);
            
            test_scenario::return_to_sender(&scenario, hero);
        };
        
        test_scenario::next_tx(&mut scenario, user);
        
        {
            assert!(test_scenario::has_most_recent_for_sender<Accessory>(&scenario), 2);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_mint_hero_with_image() {
        let user = @0xA;
        let mut scenario = test_scenario::begin(user);
        
        {
            let ctx = test_scenario::ctx(&mut scenario);
            hero_adventure::mint_hero(
                string::utf8(b"Dragon Slayer"),
                string::utf8(b"https://drive.google.com/file/d/abc123/view"),
                ctx
            );
        };
        
        test_scenario::next_tx(&mut scenario, user);
        
        {
            assert!(test_scenario::has_most_recent_for_sender<Hero>(&scenario), 0);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_mint_accessory_with_image() {
        let user = @0xA;
        let mut scenario = test_scenario::begin(user);
        
        {
            let ctx = test_scenario::ctx(&mut scenario);
            hero_adventure::mint_accessory(
                string::utf8(b"Legendary Sword"),
                string::utf8(b"Weapon"),
                150,
                string::utf8(b"https://imgur.com/sword123.png"),
                ctx
            );
        };
        
        test_scenario::next_tx(&mut scenario, user);
        
        {
            assert!(test_scenario::has_most_recent_for_sender<Accessory>(&scenario), 0);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_create_battle_challenge() {
        let user = @0xA;
        let mut scenario = test_scenario::begin(user);
        
        // Mint hero
        {
            let ctx = test_scenario::ctx(&mut scenario);
            hero_adventure::mint_hero(
                string::utf8(b"Warrior"),
                string::utf8(b"https://example.com/warrior.png"),
                ctx
            );
        };
        
        test_scenario::next_tx(&mut scenario, user);
        
        // Mint weapon
        {
            let ctx = test_scenario::ctx(&mut scenario);
            hero_adventure::mint_accessory(
                string::utf8(b"Battle Axe"),
                string::utf8(b"Weapon"),
                80,
                string::utf8(b"https://example.com/axe.png"),
                ctx
            );
        };
        
        test_scenario::next_tx(&mut scenario, user);
        
        // Equip weapon
        {
            let mut hero = test_scenario::take_from_sender<Hero>(&scenario);
            let weapon = test_scenario::take_from_sender<Accessory>(&scenario);
            
            hero_adventure::equip_accessory(&mut hero, weapon);
            
            test_scenario::return_to_sender(&scenario, hero);
        };
        
        test_scenario::next_tx(&mut scenario, user);
        
        // Create battle challenge
        {
            let hero = test_scenario::take_from_sender<Hero>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            // Create coin for bet (100_000_000 MIST = 0.1 SUI)
            let bet_coin = coin::mint_for_testing<SUI>(100_000_000, ctx);
            
            hero_adventure::create_battle_challenge(&hero, bet_coin, ctx);
            
            test_scenario::return_to_sender(&scenario, hero);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_create_challenge_without_weapon_fails() {
        let user = @0xA;
        let mut scenario = test_scenario::begin(user);
        
        // Mint hero without weapon
        {
            let ctx = test_scenario::ctx(&mut scenario);
            hero_adventure::mint_hero(
                string::utf8(b"Unarmed Hero"),
                string::utf8(b"https://example.com/hero.png"),
                ctx
            );
        };
        
        test_scenario::next_tx(&mut scenario, user);
        
        // Try to create challenge without weapon - should fail
        {
            let hero = test_scenario::take_from_sender<Hero>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            let bet_coin = coin::mint_for_testing<SUI>(100_000_000, ctx);
            
            hero_adventure::create_battle_challenge(&hero, bet_coin, ctx);
            
            test_scenario::return_to_sender(&scenario, hero);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_complete_battle_flow() {
        let player_a = @0xA;
        let player_b = @0xB;
        
        let mut scenario = test_scenario::begin(player_a);
        
        // Player A: Create hero and weapon
        {
            let ctx = test_scenario::ctx(&mut scenario);
            hero_adventure::mint_hero(
                string::utf8(b"Hero A"),
                string::utf8(b"https://example.com/heroA.png"),
                ctx
            );
        };
        
        test_scenario::next_tx(&mut scenario, player_a);
        
        {
            let ctx = test_scenario::ctx(&mut scenario);
            hero_adventure::mint_accessory(
                string::utf8(b"Strong Sword"),
                string::utf8(b"Weapon"),
                100,
                string::utf8(b"https://example.com/sword.png"),
                ctx
            );
        };
        
        test_scenario::next_tx(&mut scenario, player_a);
        
        // Player A: Equip weapon
        {
            let mut hero = test_scenario::take_from_sender<Hero>(&scenario);
            let weapon = test_scenario::take_from_sender<Accessory>(&scenario);
            
            hero_adventure::equip_accessory(&mut hero, weapon);
            
            test_scenario::return_to_sender(&scenario, hero);
        };
        
        // Player B: Create hero and weapon
        test_scenario::next_tx(&mut scenario, player_b);
        
        {
            let ctx = test_scenario::ctx(&mut scenario);
            hero_adventure::mint_hero(
                string::utf8(b"Hero B"),
                string::utf8(b"https://example.com/heroB.png"),
                ctx
            );
        };
        
        test_scenario::next_tx(&mut scenario, player_b);
        
        {
            let ctx = test_scenario::ctx(&mut scenario);
            hero_adventure::mint_accessory(
                string::utf8(b"Weak Sword"),
                string::utf8(b"Weapon"),
                50,
                string::utf8(b"https://example.com/sword2.png"),
                ctx
            );
        };
        
        test_scenario::next_tx(&mut scenario, player_b);
        
        // Player B: Equip weapon
        {
            let mut hero = test_scenario::take_from_sender<Hero>(&scenario);
            let weapon = test_scenario::take_from_sender<Accessory>(&scenario);
            
            hero_adventure::equip_accessory(&mut hero, weapon);
            
            test_scenario::return_to_sender(&scenario, hero);
        };
        
        // Player A: Create challenge
        test_scenario::next_tx(&mut scenario, player_a);
        
        {
            let hero = test_scenario::take_from_sender<Hero>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            let bet_coin = coin::mint_for_testing<SUI>(100_000_000, ctx);
            
            hero_adventure::create_battle_challenge(&hero, bet_coin, ctx);
            
            test_scenario::return_to_sender(&scenario, hero);
        };
        
        // Player B: Accept challenge (should win because Player A has higher power)
        test_scenario::next_tx(&mut scenario, player_b);
        
        {
            let mut hero_b = test_scenario::take_from_sender<Hero>(&scenario);
            let challenge = test_scenario::take_shared<hero_adventure::BattleChallenge>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            let bet_coin = coin::mint_for_testing<SUI>(100_000_000, ctx);
            
            hero_adventure::accept_battle_challenge(challenge, &mut hero_b, bet_coin, ctx);
            
            test_scenario::return_to_sender(&scenario, hero_b);
        };
        
        test_scenario::end(scenario);
    }
}