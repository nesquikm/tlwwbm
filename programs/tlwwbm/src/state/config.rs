use anchor_lang::prelude::*;

use anchor_lang::solana_program::clock::SECONDS_PER_DAY;

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,
    pub topic_lock_time: u64,
}

impl Config {
    pub const SEED_PREFIX: &'static str = "config";

    pub fn init(&mut self, admin: &Pubkey) -> Result<()> {
        self.admin = *admin;
        self.topic_lock_time = SECONDS_PER_DAY * 2; // 2 days

        Ok(())
    }

    pub fn set_topic_lock_time(&mut self, time: u64) -> Result<()> {
        self.topic_lock_time = time;

        Ok(())
    }

    pub fn delete(&self) -> Result<()> {
        Ok(())
    }
}
