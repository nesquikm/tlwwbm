use anchor_lang::{prelude::*, system_program};

use crate::state::{config::Config, topic::Topic};

#[derive(Accounts)]
#[instruction(topic_string: String)]
pub struct CreateTopic<'info> {
    #[account(
        seeds = [
            Config::SEED_PREFIX.as_bytes(),
        ],
        bump,
    )]
    pub config: Account<'info, Config>,
    #[account(
        init,
        payer = authority,
        space = 8 + Topic::INIT_SPACE,
        seeds = [
            Topic::SEED_PREFIX.as_bytes(),
            topic_string.as_bytes(),
        ],
        bump,
    )]
    pub topic: Account<'info, Topic>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(topic_string: String)]
pub struct CommentTopic<'info> {
    #[account(
        mut,
        seeds = [
            Topic::SEED_PREFIX.as_bytes(),
            topic_string.as_bytes(),
        ],
        bump,
    )]
    pub topic: Account<'info, Topic>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(topic_string: String)]
pub struct LockTopic<'info> {
    #[account(
        mut,
        seeds = [
            Topic::SEED_PREFIX.as_bytes(),
            topic_string.as_bytes(),
        ],
        bump,
    )]
    pub topic: Account<'info, Topic>,
}

#[derive(Accounts)]
#[instruction(topic_string: String)]
pub struct DeleteTopic<'info> {
    #[account(
        mut,
        seeds = [
            Topic::SEED_PREFIX.as_bytes(),
            topic_string.as_bytes(),
        ],
        bump,
        close=authority,
    )]
    pub topic: Account<'info, Topic>,
    pub authority: Signer<'info>,
}

pub fn create(
    ctx: Context<CreateTopic>,
    topic_string: String,
    comment_string: String,
) -> Result<()> {
    msg!("Creating a topic");

    let author = ctx.accounts.authority.key();

    let config = &ctx.accounts.config;

    let topic = &mut ctx.accounts.topic;
    topic.create(config, &author, topic_string, comment_string)?;

    transfer_to_topic(
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.topic.to_account_info(),
        config.t_fee,
    )?;

    Ok(())
}

pub fn comment(
    ctx: Context<CommentTopic>,
    _topic_string: String,
    comment_string: String,
) -> Result<()> {
    msg!("Commenting a topic");

    let author = ctx.accounts.authority.key();

    let topic = &mut ctx.accounts.topic;
    topic.comment(&author, comment_string)?;

    Ok(())
}

pub fn lock(ctx: Context<LockTopic>, _topic_string: String) -> Result<()> {
    msg!("Locking a topic");

    let topic = &mut ctx.accounts.topic;

    topic.lock()?;

    Ok(())
}

pub fn delete(ctx: Context<DeleteTopic>, _topic_string: String) -> Result<()> {
    msg!("Deleting a topic");

    let topic = &mut ctx.accounts.topic;

    topic.delete()?;

    Ok(())
}

fn transfer_to_topic<'info>(
    system_program: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    topic: AccountInfo<'info>,
    lamports: u64,
) -> Result<()> {
    let cpi_context = CpiContext::new(
        system_program,
        system_program::Transfer {
            from: payer,
            to: topic,
        },
    );
    system_program::transfer(cpi_context, lamports)?;

    Ok(())
}
