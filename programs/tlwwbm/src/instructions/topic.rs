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
        seeds = [
            Config::SEED_PREFIX.as_bytes(),
        ],
        bump,
    )]
    pub config: Account<'info, Config>,
    #[account(
        mut,
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
pub struct LockTopic<'info> {
    #[account(
        seeds = [
            Config::SEED_PREFIX.as_bytes(),
        ],
        bump,
    )]
    pub config: Account<'info, Config>,
    #[account(
        mut,
        seeds = [
            Topic::SEED_PREFIX.as_bytes(),
            topic_string.as_bytes(),
        ],
        bump,
    )]
    pub topic: Account<'info, Topic>,
    #[account(mut, address = topic.topic_author)]
    topic_author: SystemAccount<'info>,
    #[account(mut, address = topic.last_comment_author)]
    last_comment_author: SystemAccount<'info>,
    #[account(mut, address = config.admin)]
    admin: SystemAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
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
    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn create(
    ctx: Context<CreateTopic>,
    topic_string: String,
    comment_string: String,
    fee_multiplier: u64,
) -> Result<()> {
    msg!("Creating a topic");

    let author = ctx.accounts.authority.key();

    let config = &ctx.accounts.config;

    let topic = &mut ctx.accounts.topic;

    let deposit = config.t_fee * fee_multiplier;

    transfer_to_topic(
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        topic.to_account_info(),
        deposit,
    )?;

    topic.create(
        config,
        &author,
        topic_string,
        comment_string,
        fee_multiplier,
        deposit,
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

    let config = &ctx.accounts.config;

    let topic = &mut ctx.accounts.topic;

    let deposit =
        (config.c_fee + topic.comment_count * config.c_fee_increment) * topic.fee_multiplier;

    transfer_to_topic(
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        topic.to_account_info(),
        deposit,
    )?;

    topic.comment(&author, comment_string, deposit)?;

    Ok(())
}

pub fn lock(ctx: Context<LockTopic>, _topic_string: String) -> Result<()> {
    msg!("Locking a topic");

    let config = &ctx.accounts.config;
    let topic = &mut ctx.accounts.topic;
    let author = &ctx.accounts.topic_author;
    let last_comment_author = &ctx.accounts.last_comment_author;
    let admin = &ctx.accounts.admin;

    let raised = topic.raised;

    let to_author = (raised as f64 * config.topic_author_share) as u64;
    let to_last_comment_author = (raised as f64 * config.last_comment_author_share) as u64;
    let to_admin = raised - to_author - to_last_comment_author;

    transfer_from_topic(
        topic.to_account_info(),
        author.to_account_info(),
        last_comment_author.to_account_info(),
        admin.to_account_info(),
        to_author,
        to_last_comment_author,
        to_admin,
    )?;

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

fn transfer_from_topic<'info>(
    topic: AccountInfo<'info>,
    author: AccountInfo<'info>,
    last_comment_author: AccountInfo<'info>,
    admin: AccountInfo<'info>,
    to_author: u64,
    to_last_comment_author: u64,
    to_admin: u64,
) -> Result<()> {
    **topic.to_account_info().try_borrow_mut_lamports()? -= to_author + to_last_comment_author + to_admin;

    **author.try_borrow_mut_lamports()? += to_author;
    **last_comment_author.try_borrow_mut_lamports()? += to_last_comment_author;
    **admin.try_borrow_mut_lamports()? += to_admin;

    Ok(())
}
