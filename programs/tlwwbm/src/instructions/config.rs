use anchor_lang::prelude::*;

use crate::state::config::Config;

#[derive(Accounts)]
pub struct InitConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Config::INIT_SPACE,
        seeds = [
            Config::SEED_PREFIX.as_bytes(),
        ],
        bump,
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetTopicLockTime<'info> {
    #[account(
        mut,
        seeds = [
            Config::SEED_PREFIX.as_bytes(),
        ],
        bump,
    )]
    pub config: Account<'info, Config>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteConfig<'info> {
    #[account(
        mut,
        seeds = [
            Config::SEED_PREFIX.as_bytes(),
        ],
        bump,
        close=authority,
    )]
    pub config: Account<'info, Config>,
    pub authority: Signer<'info>,
}

pub fn init(ctx: Context<InitConfig>) -> Result<()> {
    msg!("Init config");

    let config = &mut ctx.accounts.config;
    config.init(ctx.accounts.authority.key)?;

    Ok(())
}

pub fn set_topic_lock_time(ctx: Context<SetTopicLockTime>, time: u64) -> Result<()> {
    msg!("Set topic lock time");

    let config = &mut ctx.accounts.config;
    config.set_topic_lock_time(time)?;

    Ok(())
}
