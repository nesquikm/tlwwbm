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
    EmptyTopicString,
    #[msg("Comment cannot be empty")]
    EmptyCommentString,
    #[msg("Topic string too long")]
    TopicStringTooLong,
    #[msg("Comment string too long")]
    CommentStringTooLong,
    #[msg("Can be done only by the author")]
    NotAuthor,
}

#[error_code]
pub enum AuthError {
    #[msg("Can be done only by the admin")]
    NotAdmin,
}
