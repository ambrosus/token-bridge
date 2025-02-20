use crate::structs::*;
use crate::utils::transfer::{mint_spl_to_user, transfer_spl_to_user};
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    keccak::hash,
    sysvar::instructions::{get_instruction_relative, ID as SYSVAR_INSTRUCTIONS_ID},
};
use anchor_spl::token::Token;
use anchor_spl::token_interface::{Mint, TokenAccount};

#[derive(Accounts)]
pub struct Receive<'info> {
    #[account(
        constraint = !state.pause,
        seeds = [GlobalState::SEED_PREFIX], bump
    )]
    pub state: Account<'info, GlobalState>,

    #[account(mut)]
    pub receiver: Signer<'info>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = receiver,
    )]
    pub receiver_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = receiver,
        space = NonceAccount::ACCOUNT_SIZE,
        seeds = [NonceAccount::SEED_PREFIX, receiver.key().as_ref()], bump,
    )]
    pub receiver_nonce_account: Account<'info, NonceAccount>,

    #[account(
        seeds = [TokenConfig::SEED_PREFIX, mint.key().as_ref()], bump = bridge_token.bump
    )]
    pub bridge_token: Account<'info, TokenConfig>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = bridge_token,
    )]
    pub bridge_token_account: Option<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,

    /// CHECK: The address check is needed because otherwise
    /// the supplied Sysvar could be anything else.
    /// The Instruction Sysvar has not been implemented
    /// in the Anchor framework yet, so this is the safe approach.
    #[account(address = SYSVAR_INSTRUCTIONS_ID)]
    pub ix_sysvar: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn receive(ctx: Context<Receive>, serialized_args: Vec<u8>) -> Result<()> {
    let nonce = &mut ctx.accounts.receiver_nonce_account;
    let bridge_token = &ctx.accounts.bridge_token;

    let args = ReceivePayload::try_from_slice(&serialized_args)
        .map_err(|_| error!(CustomError::InvalidSerialization))?;
    let args_hash = hash(&serialized_args);

    // check signature
    let num_signatures = 5;
    let ix = get_instruction_relative(-1, &ctx.accounts.ix_sysvar.to_account_info())?;
    let signed_message = &ix.data[ix.data.len().saturating_sub(32)..];
    let signer_pubkeys = &ix.data
        [ix.data.len().saturating_sub(32 * num_signatures + 32)..ix.data.len().saturating_sub(32)];
    let signer_pubkey = hash(signer_pubkeys);

    require!(
        signed_message == args_hash.to_bytes(),
        CustomError::InvalidSignature
    );
    require!(
        signer_pubkey.to_bytes() == ctx.accounts.state.receive_signer.to_bytes(),
        CustomError::InvalidSignature
    );


    require!(
        args.chain_to == SOLANA_CHAIN_ID,
        CustomError::InvalidSignature
    );

    require!(
        ctx.accounts.mint.key() == args.token_address_to,
        CustomError::InvalidSignature
    );

    let args_nonce = u64::from_be_bytes(args.flag_data[0..8].try_into().unwrap());
    require!(args_nonce == nonce.nonce_counter, CustomError::InvalidNonce);

    if ctx.accounts.bridge_token.is_mintable {
        mint_spl_to_user(
            ctx.accounts.bridge_token.to_account_info(),
            ctx.accounts.receiver_token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            args.amount_to,
            ctx.accounts.token_program.to_account_info(),
            bridge_token.clone().into_inner(),
        )?;
    } else {
        transfer_spl_to_user(
            ctx.accounts.bridge_token.to_account_info(),
            ctx.accounts.bridge_token_account.clone().expect("no bridge ata").to_account_info(),
            ctx.accounts.receiver_token_account.to_account_info(),
            args.amount_to,
            ctx.accounts.token_program.to_account_info(),
            bridge_token.clone().into_inner(),
        )?;
    }

    // update user nonce
    nonce.nonce_counter += 1;

    // event
    emit!(args);

    Ok(())
}
