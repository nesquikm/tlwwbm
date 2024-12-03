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
pub struct SetConfig<'info> {
    #[account(
        mut,
        seeds = [
            Config::SEED_PREFIX.as_bytes(),
        ],
        bump,
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
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
    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn init(ctx: Context<InitConfig>) -> Result<()> {
    msg!("Init config");

    let config = &mut ctx.accounts.config;
    config.init(ctx.accounts.authority.key)?;

    Ok(())
}

pub fn set(
    ctx: Context<SetConfig>,
    topic_lock_time: u64,
    t_fee: u64,
    c_fee: u64,
    c_fee_increment: u64,
    topic_author_share: f64,
    last_comment_author_share: f64,
) -> Result<()> {
    msg!("Set config values");

    let config = &mut ctx.accounts.config;
    config.set(topic_lock_time, t_fee, c_fee, c_fee_increment, topic_author_share, last_comment_author_share)?;

    Ok(())
}
