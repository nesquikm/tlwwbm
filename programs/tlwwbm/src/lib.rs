use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

use crate::instructions::config;
use crate::instructions::config::*;
use crate::instructions::topic;
use crate::instructions::topic::*;

use crate::error::AuthError;

declare_id!("38xz437giEUwsXjfHb7mJnYmTysz8jf4qoroPKBbj8aN");

#[program]
pub mod tlwwbm {
    use super::*;

    pub fn config_init(ctx: Context<InitConfig>) -> Result<()> {
        config::init(ctx)
    }

    pub fn config_set(
        ctx: Context<SetConfig>,
        topic_lock_time: u64,
        t_fee: u64,
        c_fee: u64,
        c_fee_increment: u64,
        topic_author_share: f64,
        last_comment_author_share: f64,
    ) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.config.admin,
            AuthError::NotAdmin
        );

        config::set(ctx, topic_lock_time, t_fee, c_fee, c_fee_increment, topic_author_share, last_comment_author_share)
    }

    pub fn config_delete(ctx: Context<DeleteConfig>) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.config.admin,
            AuthError::NotAdmin
        );

        Ok(())
    }

    pub fn topic_create(
        ctx: Context<CreateTopic>,
        topic_string: String,
        comment_string: String,
        fee_multiplier: u64,
    ) -> Result<()> {
        topic::create(ctx, topic_string, comment_string, fee_multiplier)
    }

    pub fn topic_comment(
        ctx: Context<CommentTopic>,
        topic_string: String,
        comment_string: String,
    ) -> Result<()> {
        topic::comment(ctx, topic_string, comment_string)
    }

    pub fn topic_lock(ctx: Context<LockTopic>, topic_string: String) -> Result<()> {
        topic::lock(ctx, topic_string)
    }

    pub fn topic_delete(ctx: Context<DeleteTopic>, topic_string: String) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.topic.topic_author.key(),
            AuthError::NotAuthor
        );
        topic::delete(ctx, topic_string)
    }
}
