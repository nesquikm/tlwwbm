use anchor_lang::prelude::*;

use crate::error::TopicError;

use super::config::Config;

const TOPIC_STRING_MAX_LEN: usize = 128;
const COMMENT_STRING_MAX_LEN: usize = 128;

#[account]
#[derive(InitSpace)]
pub struct Topic {
    pub topic_author: Pubkey,
    pub last_comment_author: Pubkey,

    #[max_len(TOPIC_STRING_MAX_LEN)]
    pub topic_string: String,

    #[max_len(COMMENT_STRING_MAX_LEN)]
    pub last_comment_string: String,

    pub comment_count: u64,

    pub created_at: i64,
    pub commented_at: i64,

    pub can_be_locked_after: i64,

    pub is_locked: bool,

    pub fee_multiplier: u64,

    pub raised: u64,
}
impl Topic {
    pub const SEED_PREFIX: &'static str = "topic";

    pub fn create(
        &mut self,
        config: &Config,
        author: &Pubkey,
        topic_string: String,
        comment_string: String,
        fee_multiplier: u64,
        deposit: u64,
    ) -> Result<()> {
        require!(!topic_string.is_empty(), TopicError::TopicStringEmpty);
        require!(
            topic_string.len() <= TOPIC_STRING_MAX_LEN,
            TopicError::TopicStringTooLong
        );

        require!(!comment_string.is_empty(), TopicError::CommentStringEmpty);
        require!(
            comment_string.len() <= COMMENT_STRING_MAX_LEN,
            TopicError::CommentStringTooLong
        );

        require!(fee_multiplier > 0, TopicError::MultiplierZero);

        let now = Clock::get().unwrap().unix_timestamp;
        let can_be_locked_after = now + config.topic_lock_time as i64;

        self.topic_author = *author;
        self.last_comment_author = *author;

        self.topic_string = topic_string;
        self.last_comment_string = comment_string;

        self.comment_count = 0;

        self.created_at = now;
        self.commented_at = now;

        self.can_be_locked_after = can_be_locked_after;

        self.is_locked = false;

        self.fee_multiplier = fee_multiplier;

        self.raised = deposit;

        Ok(())
    }
    pub fn comment(&mut self, author: &Pubkey, comment_string: String, deposit: u64) -> Result<()> {
        require!(self.is_locked == false, TopicError::Locked);
        require!(!comment_string.is_empty(), TopicError::CommentStringEmpty);
        require!(
            comment_string.len() <= COMMENT_STRING_MAX_LEN,
            TopicError::CommentStringTooLong
        );

        let now = Clock::get().unwrap().unix_timestamp;

        self.last_comment_author = *author;
        self.last_comment_string = comment_string;
        self.comment_count += 1;
        self.commented_at = now;
        self.raised += deposit;

        Ok(())
    }

    pub fn lock(&mut self) -> Result<()> {
        require!(self.is_locked == false, TopicError::Locked);

        require!(self.can_be_locked(), TopicError::NotLockable);

        self.is_locked = true;

        Ok(())
    }

    pub fn delete(&mut self) -> Result<()> {
        require!(self.can_be_deleted(), TopicError::NotDeletable);

        Ok(())
    }

    pub fn can_be_locked(&self) -> bool {
        let now = Clock::get().unwrap().unix_timestamp;
        now >= self.can_be_locked_after
    }

    pub fn can_be_deleted(&self) -> bool {
        !self.is_locked && !self.was_commented()
    }

    pub fn was_commented(&self) -> bool {
        self.comment_count > 0
    }
}
