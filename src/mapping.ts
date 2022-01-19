import { BigInt, JSONValue, json, ipfs } from "@graphprotocol/graph-ts";
import {
  HFEvent,
  HFClaimEvent,
  HFCoinBurned,
  HFCoinMinted,
  HFNFTMinted,
  InvestAdded,
  InvestReimbursed,
  InvestorEarned,
  InvestsClaimed,
  PremiumReimbursed,
  TicketStatusUpdate,
} from "../generated/HFEvent/HFEvent";
import { Ticket, Buyer } from "../generated/schema";
import { log } from "@graphprotocol/graph-ts";

export function handleTicketStatusUpdate(event: TicketStatusUpdate): void {
  let buyerId = event.params.user.toHex();
  let buyer = Buyer.load(buyerId);
  if (buyer == null) {
    buyer = new Buyer(buyerId);
  }
  let ticketId = event.address
    .toHex()
    .concat("-")
    .concat(event.params.ticketId.toString());
  let ticket = new Ticket(ticketId);
  ticket.buyer = buyer.id;
  ticket.ticketId = event.params.ticketId;
  ticket.premiumAmount = event.params.premiumAmount;
  ticket.totalInvestments = event.params.totalInvestments;
  ticket.ticketName = event.params.ticketName;
  ticket.previousStatus = event.params.previousStatus;
  ticket.ticketStatus = event.params.ticketStatus;
  ticket.payoutRatio = event.params.payoutRatio;
  ticket.closingDate = event.params.closingDate;
  ticket.startDate = event.params.startDate;
  ticket.endDate = event.params.endDate;
  ticket.save();
}
