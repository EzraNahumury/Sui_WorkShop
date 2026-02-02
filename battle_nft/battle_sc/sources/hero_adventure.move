module battle_sc::battle_sc {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::{String};
    use sui::dynamic_object_field;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::event;

    const EAccessoryNotFound: u64 = 1;
    const ENotEnoughBet: u64 = 2;
    const EHeroNotEquipped: u64 = 3;
    const EInvalidChallenge: u64 = 4;

    public struct Hero has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        level: u64,
        total_wins: u64,
        total_losses: u64
    }

    public struct Accessory has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        category: String,
        bonus_power: u64
    }

    public struct BattleChallenge has key {
        id: UID,
        challenger_hero: address,
        challenger: address,
        bet_amount: Balance<SUI>,
        weapon_power: u64
    }

    public struct BattleResult has copy, drop {
        challenge_id: address,
        winner: address,
        loser: address,
        winner_hero: address,
        loser_hero: address,
        total_prize: u64,
        winner_power: u64,
        loser_power: u64
    }

    public struct ChallengeCreated has copy, drop {
        challenge_id: address,
        challenger: address,
        challenger_hero: address,
        weapon_power: u64,
        bet_amount: u64
    }

    public entry fun mint_hero(name: String, image_url: String, ctx: &mut TxContext) {
        let hero = Hero {
            id: object::new(ctx),
            name,
            description: std::string::utf8(b"A brave hero on an epic adventure"),
            image_url,
            level: 1,
            total_wins: 0,
            total_losses: 0
        };
        transfer::public_transfer(hero, tx_context::sender(ctx));
    }

    public entry fun mint_accessory(name: String, category: String, bonus_power: u64, image_url: String, ctx: &mut TxContext) {
        let accessory = Accessory {
            id: object::new(ctx),
            name,
            description: std::string::utf8(b"A powerful accessory for heroes"),
            image_url,
            category,
            bonus_power
        };
        transfer::public_transfer(accessory, tx_context::sender(ctx));
    }

    public entry fun equip_accessory(hero: &mut Hero, item: Accessory) {
        let category = item.category;
        dynamic_object_field::add(&mut hero.id, category, item);
    }

    public entry fun unequip_accessory(hero: &mut Hero, category: String, ctx: &mut TxContext) {
        assert!(dynamic_object_field::exists_(&hero.id, category), EAccessoryNotFound);
        
        let accessory = dynamic_object_field::remove<String, Accessory>(&mut hero.id, category);
        transfer::public_transfer(accessory, tx_context::sender(ctx));
    }

    public fun has_accessory(hero: &Hero, category: String): bool {
        dynamic_object_field::exists_(&hero.id, category)
    }

    fun get_hero_power(hero: &Hero): u64 {
        if (dynamic_object_field::exists_(&hero.id, std::string::utf8(b"Weapon"))) {
            let weapon = dynamic_object_field::borrow<String, Accessory>(&hero.id, std::string::utf8(b"Weapon"));
            weapon.bonus_power
        } else {
            0
        }
    }

    entry fun create_battle_challenge(
        hero: &Hero,
        bet: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let weapon_power = get_hero_power(hero);
        assert!(weapon_power > 0, EHeroNotEquipped);
        
        let bet_value = coin::value(&bet);
        
        let challenge = BattleChallenge {
            id: object::new(ctx),
            challenger_hero: object::id_address(hero),
            challenger: tx_context::sender(ctx),
            bet_amount: coin::into_balance(bet),
            weapon_power
        };
        
        let challenge_id = object::id_address(&challenge);
        
        event::emit(ChallengeCreated {
            challenge_id,
            challenger: tx_context::sender(ctx),
            challenger_hero: object::id_address(hero),
            weapon_power,
            bet_amount: bet_value
        });
        
        transfer::share_object(challenge);
    }

    entry fun accept_battle_challenge(
        challenge: BattleChallenge,
        my_hero: &mut Hero,
        bet: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let my_power = get_hero_power(my_hero);
        assert!(my_power > 0, EHeroNotEquipped);
        
        let BattleChallenge {
            id,
            challenger_hero,
            challenger,
            bet_amount: challenger_bet,
            weapon_power: challenger_power
        } = challenge;
        
        let challenge_id = object::uid_to_address(&id);
        object::delete(id);
        
        let mut my_bet_balance = coin::into_balance(bet);
        let my_bet_value = balance::value(&my_bet_balance);
        let challenger_bet_value = balance::value(&challenger_bet);
        
        assert!(my_bet_value == challenger_bet_value, ENotEnoughBet);
        
        balance::join(&mut my_bet_balance, challenger_bet);
        let total_prize = balance::value(&my_bet_balance);
        
        let (winner, loser, winner_hero_addr, loser_hero_addr, winner_pow, loser_pow) = if (my_power > challenger_power) {
            my_hero.total_wins = my_hero.total_wins + 1;
            my_hero.level = my_hero.level + 1;
            
            let prize_coin = coin::from_balance(my_bet_balance, ctx);
            transfer::public_transfer(prize_coin, tx_context::sender(ctx));
            
            (tx_context::sender(ctx), challenger, object::id_address(my_hero), challenger_hero, my_power, challenger_power)
        } else if (challenger_power > my_power) {
            my_hero.total_losses = my_hero.total_losses + 1;
            
            let prize_coin = coin::from_balance(my_bet_balance, ctx);
            transfer::public_transfer(prize_coin, challenger);
            
            (challenger, tx_context::sender(ctx), challenger_hero, object::id_address(my_hero), challenger_power, my_power)
        } else {
            let half = total_prize / 2;
            let challenger_refund = balance::split(&mut my_bet_balance, half);
            
            transfer::public_transfer(coin::from_balance(challenger_refund, ctx), challenger);
            transfer::public_transfer(coin::from_balance(my_bet_balance, ctx), tx_context::sender(ctx));
            
            (tx_context::sender(ctx), challenger, object::id_address(my_hero), challenger_hero, my_power, challenger_power)
        };
        
        event::emit(BattleResult {
            challenge_id,
            winner,
            loser,
            winner_hero: winner_hero_addr,
            loser_hero: loser_hero_addr,
            total_prize,
            winner_power: winner_pow,
            loser_power: loser_pow
        });
    }

    entry fun cancel_battle_challenge(challenge: BattleChallenge, ctx: &mut TxContext) {
        let BattleChallenge {
            id,
            challenger_hero: _,
            challenger,
            bet_amount,
            weapon_power: _
        } = challenge;
        
        assert!(challenger == tx_context::sender(ctx), EInvalidChallenge);
        
        object::delete(id);
        
        let refund = coin::from_balance(bet_amount, ctx);
        transfer::public_transfer(refund, challenger);
    }
}