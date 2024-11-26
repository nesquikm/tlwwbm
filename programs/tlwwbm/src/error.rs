use anchor_lang::prelude::*;

#[error_code]
pub enum TopicError {
    #[msg("Topic already locked")]
    Locked,
    #[msg("Topic cannot be locked yet")]
    NotLockable,
    #[msg("Topic cannot be deleted")]
    NotDeletable,
    #[msg("Topic cannot be empty")]
    TopicStringEmpty,
    #[msg("Comment cannot be empty")]
    CommentStringEmpty,
    #[msg("Topic string too long")]
    TopicStringTooLong,
    #[msg("Comment string too long")]
    CommentStringTooLong,
    #[msg("Miltiplier must be greater than 0")]
    MultiplierZero,
}

#[error_code]
pub enum AuthError {
    #[msg("Can be done only by the admin")]
    NotAdmin,
    #[msg("Can be done only by the author")]
    NotAuthor,
}

#[error_code]
pub enum ConfigError {
    #[msg("Share value invalid")]
    ShareInvalid,
}
