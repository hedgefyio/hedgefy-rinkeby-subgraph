import {
  BigInt,
  JSONValue,
  json,
  ipfs,
  bigInt,
  ethereum,
} from "@graphprotocol/graph-ts";
import {
  BiddingAdded,
  BiddingRemoved,
  BiddingSelected,
  BiddingUpdated,
  DonationCreated,
  DonationRefunded,
  DonationsReceived,
  DonationUpdated,
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
  ClaimCondition,
  Donation,
  Investment,
  NFT,
  Premium,
  Ticket,
  Transaction,
  User,
} from "../generated/schema";
import { calcPremiumDonation, getInitialStakedPremium, loadOrCreate } from "./util";

export function handleBiddingAdded(event: BiddingAdded): void {
  let ticketId = `${event.address.toHex()}-${event.params.ticketId.toString()}`;
  let ticket = Ticket.load(ticketId);
  if (!ticket) return;

  let investor = loadOrCreate<User>(event.params.investor.toHex());
  investor.save();
  let investmentId = `${investor.id}-${event.params.ticketId.toString()}`;
  let investment = loadOrCreate<Investment>(investmentId);

  investment.investor = investor.id;
  investment.ticketName = event.params.ticketName;
  investment.tookPremium = false;
  investment.askingAmount = event.params.askingAmount;
  investment.ticketName = event.params.ticketName;
  investment.bidProcessType = event.params.bidProcessType;
  investment.reimbursedInvest = false;
  investment.removed = false;
  investment.askingExpireDate = event.params.askingExpireDate;
  investment.ticket = ticket.id;
  investment.ticketId = ticket.ticketId;
  investment.save();

  const ticketInvestments = ticket.investments;
  ticketInvestments.push(investment.id);
  ticket.investments = ticketInvestments;
  ticket.save();
}
export function handleBiddingRemoved(event: BiddingRemoved): void {
  let ticketId = `${event.address.toHex()}-${event.params.ticketId.toString()}`;
  let ticket = Ticket.load(ticketId);
  if (!ticket) return;

  let investor = User.load(event.params.investor.toHex());
  if (!investor) return;
  let investmentId = `${investor.id}-${event.params.ticketId.toString()}`;
  let investment = Investment.load(investmentId);
  if (!investment) return;
  investment.removed = true;
  investment.save();
  ticket.save();
}
export function handleBiddingSelected(event: BiddingSelected): void {
  let ticketId = `${event.address.toHex()}-${event.params.ticketId.toString()}`;
  let ticket = Ticket.load(ticketId);
  let investor = loadOrCreate<User>(event.params.investor.toHex());
  investor.save();

  let investmentId = `${investor.id}-${event.params.ticketId.toString()}`;
  let investment = loadOrCreate<Investment>(investmentId);

  investment.askingAmount = event.params.askingAmount;
  investment.bidProcessType = event.params.bidProcessType;
  investment.earning = event.params.premiumAmount;
  investment.save();
  if (!ticket) return;

  ticket.claimAmount = event.params.claimAmount;
  ticket.premiumAmount = event.params.premiumAmount;
  ticket.authorizedAmount = event.params.askingAmount.times(ticket.marginRatio);
  ticket.ticketStatus = 2; //Status: CLOSED
  ticket.selectedBidding = investment.id;

  ticket.save();
}
export function handleBiddingUpdated(event: BiddingUpdated): void {
  let investor = User.load(event.params.investor.toHex());
  if (!investor) return;
  let investmentId = `${investor.id}-${event.params.ticketId.toString()}`;
  let investment = Investment.load(investmentId);
  if (!investment) return;
  investment.askingAmount = event.params.askingAmount;
  investment.bidProcessType = event.params.bidProcessType;
  investment.askingExpireDate = event.params.askingExpireDate;
  investment.removed = false;
  investment.save();
}
export function handleHFClaimCreated(event: HFClaimCreated): void {
  let claimId = event.params.claimId.toString();
  let ticketId = `${event.address.toHex()}-${event.params.ticketId.toString()}`;
  let claim = new Claim(claimId);
  let ticket = Ticket.load(ticketId);
  if (!ticket) return;

  ticket.claim = claim.id;
  ticket.save();

  let claimCondition = new ClaimCondition(claimId);
  claimCondition.claimType = event.params.condition.claimType;
  claimCondition.claimConstraints = event.params.condition.constraints;
  claimCondition.claimParameters = event.params.condition.parameters;
  claimCondition.save();

  claim.ticket = ticket.id;
  claim.claimId = event.params.claimId;
  claim.round = new BigInt(event.params.round);
  claim.isApproved = event.params.isApproved;
  claim.claimStatus = event.params.claimStatus;
  claim.roundStartDate = new BigInt(0);
  claim.condition = claimCondition.id;

  claim.save();
}
export function handleHFClaimUpdated(event: HFClaimUpdated): void {
  let claim = Claim.load(event.params.claimId.toString());

  if (!claim) return;
  claim.roundStartDate = event.params.roundStartDate;
  claim.isApproved = event.params.isApproved;
  claim.lastDecisionDate = event.params.lastDecisionDate;
  claim.oracleData = event.params.oracleData;
  claim.round = new BigInt(event.params.round);
  claim.claimStatus = event.params.claimStatus;
  claim.ticket = event.params.ticketId.toHex();

  claim.save();
}
export function handleHFCoinBurned(event: HFCoinBurned): void {
  let ticketId = `${event.address.toHex()}-${event.params.ticketId.toString()}`;
  let ticket = Ticket.load(ticketId);
  if (!ticket) return;

  let user = loadOrCreate<User>(event.params.user.toHex());
  user.save();

  let transactionId = `${event.transaction.hash.toHex()}-${event.logIndex}`;

  let transaction = new Transaction(transactionId);

  transaction.hash = event.transaction.hash.toHex();
  transaction.timestamp = event.params.eventTimestamp;
  transaction.amount = event.params.amount;
  transaction.user = user.id;
  transaction.type = "BURNED";
  transaction.currency = event.params.currency;
  transaction.ticket = ticket.id;
  transaction.status = event.params.ticketStatus;

  transaction.save();
}
export function handleHFCoinMinted(event: HFCoinMinted): void {
  let ticketId = `${event.address.toHex()}-${event.params.ticketId.toString()}`;
  let ticket = Ticket.load(ticketId);
  if (!ticket) return;

  let user = loadOrCreate<User>(event.params.user.toHex());
  user.save();

  let transactionId = `${event.transaction.hash.toHex()}-${event.logIndex}`;

  let transaction = new Transaction(transactionId);

  transaction.hash = event.transaction.hash.toHex();
  transaction.timestamp = event.params.eventTimestamp;
  transaction.amount = event.params.amount;
  transaction.user = user.id;
  transaction.type = "MINTED";
  transaction.currency = event.params.currency;
  transaction.ticket = ticket.id;
  transaction.status = event.params.ticketStatus;

  transaction.save();
}
export function handleInvestReimbursed(event: InvestReimbursed): void {
  let investor = User.load(event.params.investor.toHex());
  if (!investor) return;
  let investmentId = `${investor.id}-${event.params.ticketId.toString()}`;
  let investment = Investment.load(investmentId);
  if (!investment) return;
  investment.expiredInvestAmount = event.params.reimburseAmount;
  investment.reimbursedInvest = true;
  investment.save();
}
export function handleInvestorEarned(event: InvestorEarned): void {
  let investor = User.load(event.params.investor.toHex());
  if (!investor) return;
  let investmentId = `${investor.id}-${event.params.ticketId.toString()}`;
  let investment = Investment.load(investmentId);
  if (!investment) return;
  investment.earning = event.params.earning;
  investment.save();
}
export function handleInvestsClaimed(event: InvestsClaimed): void {
  //DONE
  let ticketId = `${event.address.toHex()}-${event.params.ticketId.toString()}`;
  let ticket = Ticket.load(ticketId);
  if (!ticket) return;

  ticket.claimAmount = new BigInt(0);
  ticket.ticketStatus = 6; //Status: Claimed
  ticket.save();
}
export function handleNFTAdded(event: NFTAdded): void {
  let nftId = event.params.tokenId.toString();
  let ticketId = `${event.address.toHex()}-${event.params.ticketId.toString()}`;
  let nft = NFT.load(nftId);
  let ticket = Ticket.load(ticketId);
  if (!ticket || !nft) return;

  ticket.nft = nft.id;
  ticket.save();
}
export function handleNFTBurned(event: NFTBurned): void {}
export function handleNFTCreated(event: NFTCreated): void {
  let tokenId = event.params.tokenId;
  let nft = NFT.load(tokenId.toString());
  if (!nft) {
    nft = new NFT(tokenId.toString());
    nft.tokenId = tokenId;
  }
  nft.tokenContract = event.params.tokenContract.toHex();
  nft.tokenType = event.params.tokenType;
  nft.save();
}
export function handleNFTMinted(event: NFTMinted): void {
  let tokenId = event.params.tokenId;
  let nft = NFT.load(tokenId.toString());
  if (!nft) {
    nft = new NFT(tokenId.toString());
  }
  nft.tokenId = tokenId;
  nft.tokenUri = event.params.nftURI;
  nft.save();
}
export function handleNFTTransferred(event: NFTTransferred): void {}
export function handlePremiumCreated(event: PremiumCreated): void {
  let buyer = User.load(event.params.buyer.toHex());
  let ticketId = `${event.address.toHex()}-${event.params.ticketId.toString()}`;
  let ticket = Ticket.load(ticketId);
  if (!buyer || !ticket) return;

  let premium = new Premium(`${ticketId}-${buyer.id}`);

  premium.buyer = buyer.id;
  premium.ticket = ticket.id;
  premium.ticketName = event.params.ticketName;
  premium.bidProcessType = event.params.bidProcessType;
  premium.reimbursedPremium = event.params.reimbursedPremium;
  premium.askingClaimAmount = event.params.askingClaimAmount;
  premium.askingPremiumAmount = event.params.askingPremiumAmount;

  premium.save();

  ticket.premium = premium.id;
  ticket.premiumDonation = getInitialStakedPremium(ticket, premium)
  ticket.save();
}
export function handlePremiumReimbursed(event: PremiumReimbursed): void {
  let buyer = User.load(event.params.buyer.toHex());
  let ticketId = `${event.address.toHex()}-${event.params.ticketId.toString()}`;
  let ticket = Ticket.load(ticketId);
  if (!buyer || !ticket) return;

  let premium = new Premium(`${ticketId}-${buyer.id}`);
  premium.reimbursedPremium = true;

  premium.save();
}
export function handleTicketCreated(event: TicketCreated): void {
  let buyer = loadOrCreate<User>(event.params.user.toHex());
  buyer.save();

  let ticketId = `${event.address.toHex()}-${event.params.ticketId.toString()}`;

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
  ticket.closingDate = event.params.dates.closingDate;
  ticket.startDate = event.params.dates.startDate;
  ticket.endDate = event.params.dates.endDate;
  ticket.investments = [];
  ticket.save();
}
export function handleTicketStatusUpdate(event: TicketStatusUpdate): void {
  let ticket = Ticket.load(
    `${event.address.toHex()}-${event.params.ticketId.toString()}`
  );

  if (ticket != null) {
    ticket.bidProcessType = event.params.bidProcessType;
    ticket.claimAmount = event.params.claimAmount;
    ticket.premiumAmount = event.params.premiumAmount;
    ticket.authorizedAmount = event.params.authorizedAmount;
    ticket.marginRatio = event.params.marginRatio;
    ticket.ticketName = event.params.ticketName;
    ticket.ticketStatus = event.params.ticketStatus;
    ticket.closingDate = event.params.dates.closingDate;
    ticket.startDate = event.params.dates.startDate;
    ticket.endDate = event.params.dates.endDate;
    // other params that need to be saved
    ticket.save();
  }
}
export function handleDonationCreated(event: DonationCreated): void {
  let donor = loadOrCreate<User>(event.params.donor.toHex());
  donor.save();

  let donationId = `${donor.id}-${event.params.ticketId.toString()}`;
  let donation = new Donation(donationId);
  let ticketId = `${event.address.toHex()}-${event.params.ticketId.toString()}`;

  donation.amount = event.params.amount;
  donation.donor = donor.id;
  donation.option = event.params.option;
  donation.refunded = event.params.refunded;
  donation.ticket = ticketId;

  donation.save();

  calcPremiumDonation(ticketId, event.params.amount);
}

export function handleDonationRefunded(event: DonationRefunded): void {
  let donor = loadOrCreate<User>(event.params.donor.toHex());
  donor.save();

  let donationId = `${donor.id}-${event.params.ticketId.toString()}`;
  let donation = Donation.load(donationId);
  if (!donation) return;
  donation.refunded = event.params.refunded;
  donation.save();
}
export function handleDonationUpdated(event: DonationUpdated): void {
  let donor = loadOrCreate<User>(event.params.donor.toHex());
  donor.save();

  let ticketId = `${event.address.toHex()}-${event.params.ticketId.toString()}`;

  let donationId = `${donor.id}-${event.params.ticketId.toString()}`;
  let donation = Donation.load(donationId);

  if (!donation) return;

  donation.amount = donation.amount.plus(event.params.amount);

  donation.donor = donor.id;
  donation.option = event.params.option;
  donation.refunded = event.params.refunded;
  donation.ticket = ticketId;

  donation.save();

  calcPremiumDonation(ticketId, event.params.amount);

}
export function handleDonationsReceived(event: DonationsReceived): void {}
