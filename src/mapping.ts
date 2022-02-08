import { BigInt, JSONValue, json, ipfs } from "@graphprotocol/graph-ts";
import {
  BiddingAdded,
  BiddingRemoved,
  BiddingSelected,
  BiddingUpdated,
  HFClaimCreated,
  HFClaimUpdated,
  HFCoinBurned,
  HFCoinMinted,
  InvestorEarned,
  InvestReimbursed,
  InvestsClaimed,
  NFTAdded,
  NFTBurned,
  NFTCreated,
  NFTMinted,
  NFTTransferred,
  PremiumCreated,
  PremiumReimbursed,
  TicketCreated,
  TicketStatusUpdate,
} from "../generated/HFEvent/HFEvent";
import {
  Claim,
  Investment,
  NFT,
  Ticket,
  TicketDate,
  User,
} from "../generated/schema";
import { log } from "@graphprotocol/graph-ts";

export function handleBiddingAdded(event: BiddingAdded): void {}
export function handleBiddingRemoved(event: BiddingRemoved): void {}
export function handleBiddingSelected(event: BiddingSelected): void {}
export function handleBiddingUpdated(event: BiddingUpdated): void {}
export function handleHFClaimCreated(event: HFClaimCreated): void {}
export function handleHFClaimUpdated(event: HFClaimUpdated): void {}
export function handleHFCoinBurned(event: HFCoinBurned): void {}
export function handleHFCoinMinted(event: HFCoinMinted): void {}
export function handleInvestReimbursed(event: InvestReimbursed): void {}
export function handleInvestorEarned(event: InvestorEarned): void {}
export function handleInvestsClaimed(event: InvestsClaimed): void {}
export function handleNFTAdded(event: NFTAdded): void {}
export function handleNFTBurned(event: NFTBurned): void {}
export function handleNFTCreated(event: NFTCreated): void {
  let nftId = event.address
  .toHex()
  .concat("-")
  .concat(event.params.tokenId.toString());

  let nft = new NFT(nftId);
  nft.tokenContract = event.params.tokenContract.toHex();
  nft.tokenId = event.params.tokenId;
  nft.tokenType = event.params.tokenTyp;
  nft.save();
}
export function handleNFTMinted(event: NFTMinted): void {}
export function handleNFTTransferred(event: NFTTransferred): void {}
export function handlePremiumCreated(event: PremiumCreated): void {}
export function handlePremiumReimbursed(event: PremiumReimbursed): void {}

export function handleTicketCreated(event: TicketCreated): void {
  let buyerId = event.params.user.toHex();
  let buyer = User.load(buyerId);
  if (buyer == null) {
    buyer = new User(buyerId);
    buyer.save();
  }

  let ticketId = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toString());

  let ticketDate = new TicketDate(ticketId);
  ticketDate.closingDate = event.params.dates.closingDate;
  ticketDate.startDate = event.params.dates.startDate;
  ticketDate.endDate = event.params.dates.endDate;
  ticketDate.ticket = ticketId;
  ticketDate.save();

  let ticket = new Ticket(ticketId);
  ticket.buyer = buyer.id;
  ticket.ticketId = event.params.ticketId;
  ticket.bidProcessType = event.params.bidProcessType;
  ticket.claimAmount = event.params.claimAmount;
  ticket.premiumAmount = event.params.premiumAmount;
  ticket.authorizedAmount = event.params.authorizedAmount;
  ticket.marginRatio = event.params.marginRatio;
  ticket.ticketName = event.params.ticketName;
  ticket.ticketStatus = event.params.ticketStatus;
  ticket.dates = ticketDate.id;
  ticket.save();
}

export function handleTicketStatusUpdate(event: TicketStatusUpdate): void {
  let id = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toHex());

  let ticket = Ticket.load(id);

  if (ticket != null) {
    ticket.ticketStatus = event.params.ticketStatus;
    // other params that need to be saved
    ticket.save();
  }
}
