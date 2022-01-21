import { BigInt, JSONValue, json, ipfs } from "@graphprotocol/graph-ts";
import { TicketStatusUpdate } from "../generated/HFEvent/HFEvent";
import { Claim, Investment, Ticket, User } from "../generated/schema";
import { log } from "@graphprotocol/graph-ts";

// We need to create TicketCreate event
// export function handleTicketCreate(event: TicketCreate): void {
//   let buyerId = event.params.user.toHex();
//   let buyer = User.load(buyerId);
//   if (buyer == null) {
//     buyer = new User(buyerId);
//     buyer.save();
//   }
//   let ticketId = event.address
//     .toHex()
//     .concat("-")
//     .concat(event.params.ticketId.toString());
//   let ticket = new Ticket(ticketId);
//   ticket.buyer = buyer.id;
//   ticket.ticketId = event.params.ticketId;
//
//   All the other params
//
//   ticket.save();
// }

// We need to update TicketStatusUpdate
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

export function handleBiddingAdded(event: BiddingAdded): void {
  let investorId = event.params.investor.toHex();
  let ticketId = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toHex());
  let investor = User.load(investorId);
  let ticket = Ticket.load(ticketId);

  if (investor == null) {
    let investor = new User(investorId);
  }

  let investmentId = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toHex());

  // create investment
}

export function handleBiddingUpdated(event: BiddingUpdated): void {
  let ticketId = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toHex());

  let ticket = Ticket.load(ticketId);

  if (ticket != null) {
    ticket.bidProcessType = event.params.bidProcessType;
    // update ticket params
    ticket.save();
  }
}

export function handleBiddingRemoved(event: BiddingRemoved): void {
  let investorId = event.params.investor.toHex();
  let investor = User.load(investorId);

  let ticketId = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toHex());

  let ticket = Ticket.load(ticketId);
  if (ticket != null) {
    ticket.bidProcessType = event.params.bidProcessType;
    // update ticket params
    ticket.save();
  }
}

export function handleBiddingSelected(event: BiddingSelected): void {
  let investorId = event.params.investor.toHex();
  let investor = User.load(investorId);

  let ticketId = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toHex());

  let ticket = Ticket.load(ticketId);
  // update ticket
}

export function handleInvestorEarned(event: InvestorEarned): void {
  let investorId = event.params.investor.toHex();
  let investor = User.load(investorId);

  let ticketId = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toHex());

  let ticket = Ticket.load(ticketId);
  // update ticket
}

export function handleInvestReimbursed(event: InvestReimbursed): void {
  let investorId = event.params.investor.toHex();
  let investor = User.load(investorId);

  let ticketId = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toHex());

  let ticket = Ticket.load(ticketId);
  // update ticket
}

export function handlePremiumReimbursed(event: PremiumReimbursed): void {
  let buyerId = event.params.buyer.toHex();
  let buyer = User.load(buyerId);

  let ticketId = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toHex());

  let ticket = Ticket.load(ticketId);
  // update ticket
}

export function handleInvestsClaimed(event: InvestsClaimed): void {
  let buyerId = event.params.buyer.toHex();
  let buyer = User.load(buyerId);

  let ticketId = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toHex());

  let ticket = Ticket.load(ticketId);
  // update ticket
}

export function handleHFCoinMinted(event: HFCoinMinted): void {
  let userId = event.params.user.toHex();
  let user = User.load(userId);

  let ticketId = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toHex());

  let ticket = Ticket.load(ticketId);
  // update ticket
}

export function handleHFCoinBurned(event: HFCoinBurned): void {
  let userId = event.params.user.toHex();
  let user = User.load(userId);

  let ticketId = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toHex());

  let ticket = Ticket.load(ticketId);
  // update ticket
}

export function handleHFClaimEvent(event: HFClaimEvent): void {
  let userId = event.params.user.toHex();
  let user = User.load(userId);

  let ticketId = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toHex());

  // probably will need to update this ID
  let claimId = event.params.claimId.toHex();

  let ticket = Ticket.load(ticketId);
  // update ticket

  let claim = Claim.load(claimId);
  // update claim
}
