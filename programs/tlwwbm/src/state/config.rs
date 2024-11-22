use anchor_lang::prelude::*;

use anchor_lang::solana_program::clock::SECONDS_PER_DAY;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;

const DEFAULT_TOPIC_LOCK_TIME: u64 = SECONDS_PER_DAY * 2;

const DEFAULT_T_FEE: u64 = LAMPORTS_PER_SOL / 100;
const DEFAULT_C_FEE: u64 = LAMPORTS_PER_SOL / 100 / 2;
const DEFAULT_C_FEE_INCREMENT: u64 = LAMPORTS_PER_SOL / 100 / 4;
#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,

    pub topic_lock_time: u64,

    pub t_fee: u64,

    pub c_fee: u64,
    pub c_fee_increment: u64,
}

impl Config {
    pub const SEED_PREFIX: &'static str = "config";

    pub fn init(&mut self, admin: &Pubkey) -> Result<()> {
        self.admin = *admin;

        self.topic_lock_time = DEFAULT_TOPIC_LOCK_TIME; // 2 days

        self.t_fee = DEFAULT_T_FEE;

        self.c_fee = DEFAULT_C_FEE;
        self.c_fee_increment = DEFAULT_C_FEE_INCREMENT;

        Ok(())
    }

    pub fn set(&mut self, topic_lock_time: u64, t_fee: u64, c_fee: u64, c_fee_increment: u64) -> Result<()> {
        self.topic_lock_time = topic_lock_time;

        self.t_fee = t_fee;

        self.c_fee = c_fee;
        self.c_fee_increment = c_fee_increment;

        Ok(())
    }

    pub fn delete(&self) -> Result<()> {
        Ok(())
    }
}
