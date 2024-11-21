use anchor_lang::prelude::*;

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
        payer = autority,
        space = 8 + Topic::INIT_SPACE,
        seeds = [
            Topic::SEED_PREFIX.as_bytes(),
            topic_string.as_bytes(),
        ],
        bump,
    )]
    pub topic: Account<'info, Topic>,
    #[account(mut)]
    pub autority: Signer<'info>,
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
    pub autority: Signer<'info>,
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
        close=autority,
    )]
    pub topic: Account<'info, Topic>,
    pub autority: Signer<'info>,
}

pub fn create(
    ctx: Context<CreateTopic>,
    topic_string: String,
    comment_string: String,
) -> Result<()> {
    msg!("Creating a topic");

    let author = ctx.accounts.autority.key();

    let config = &ctx.accounts.config;

    let topic = &mut ctx.accounts.topic;
    topic.create(config, &author, topic_string, comment_string)?;

    Ok(())
}

pub fn comment(ctx: Context<CommentTopic>, comment_string: String) -> Result<()> {
    msg!("Commenting a topic");

    let author = ctx.accounts.autority.key();

    let topic = &mut ctx.accounts.topic;
    topic.comment(&author, comment_string)?;

    Ok(())
}

pub fn lock(ctx: Context<LockTopic>) -> Result<()> {
    msg!("Locking a topic");

    let topic = &mut ctx.accounts.topic;

    topic.lock()?;

    Ok(())
}

pub fn delete(ctx: Context<DeleteTopic>) -> Result<()> {
    msg!("Deleting a topic");

    let topic = &mut ctx.accounts.topic;

    topic.delete()?;

    Ok(())
}
