module sui_token::sui_token;

use sui::coin::{Self, TreasuryCap};
use std::ascii;

public struct SUI_TOKEN has drop {}

// Fungsi ini OTOMATIS jalan saat kamu publish. Tidak perlu panggil manual lagi!
fun init(witness: SUI_TOKEN, ctx: &mut TxContext) {
    let (treasury_cap, metadata) = coin::create_currency(
        witness, 
        6, 
        b"DIAN", 
        b"NIAS 69", 
        b"NIAS ANJING 69", 
        option::some(sui::url::new_unsafe(ascii::string(b"https://media.licdn.com/dms/image/v2/D4E03AQHUDQvhHxff0A/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1692931092037?e=2147483647&v=beta&t=rYR9QV0mQ4QSIwPB15rpoK3EnAKYUwIAk1kPtUYlDdA"))), 
        ctx
    );

    // Metadata dibekukan (agar tidak bisa diubah), TreasuryCap dikirim ke kamu
    transfer::public_freeze_object(metadata);
    transfer::public_transfer(treasury_cap, ctx.sender());
}

public fun mint(
    treasury_cap: &mut TreasuryCap<SUI_TOKEN>, 
    amount: u64, 
    recipient: address, 
    ctx: &mut TxContext
) {
    coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
}