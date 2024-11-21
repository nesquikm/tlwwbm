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

    pub fn config_set_topic_lock_time(ctx: Context<SetTopicLockTime>, time: u64) -> Result<()> {
        require!(
            ctx.accounts.autority.key() == ctx.accounts.config.admin,
            AuthError::NotAdmin
        );

        config::set_topic_lock_time(ctx, time)
    }

    pub fn config_delete(ctx: Context<DeleteConfig>) -> Result<()> {
        require!(
            ctx.accounts.autority.key() == ctx.accounts.config.admin,
            AuthError::NotAdmin
        );

        Ok(())
    }

    pub fn topic_create(
        ctx: Context<CreateTopic>,
        topic_string: String,
        comment_string: String,
    ) -> Result<()> {
        topic::create(ctx, topic_string, comment_string)
    }

    pub fn topic_comment(ctx: Context<CommentTopic>, comment_string: String) -> Result<()> {
        topic::comment(ctx, comment_string)
    }

    pub fn topic_lock(ctx: Context<LockTopic>) -> Result<()> {
        topic::lock(ctx)
    }

    pub fn topic_delete(ctx: Context<DeleteTopic>) -> Result<()> {
        topic::delete(ctx)
    }
}
