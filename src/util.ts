import { BigDecimal, BigInt, Entity, store } from "@graphprotocol/graph-ts";
import { Investment, Premium, Ticket } from "../generated/schema";

export const BIGINT_ZERO = new BigInt(0);

export function bMax(value1: BigInt, value2: BigInt): BigInt {
  if (value1.gt(value2)) return value1;
  return value2;
}

export function bMin(value1: BigInt, value2: BigInt): BigInt {
  if (value2.gt(value1)) return value1;
  return value2;
}

export function load<T extends Entity>(id: string): T | null {
  return changetype<T | null>(store.get(nameof<T>(), id));
}

export function loadOrCreate<T extends Entity>(id: string): T {
  let obj = load<T>(id);
  if (!obj) {
    obj = instantiate<T>(id);
  }
  return obj;
}

export function getInitialStakedPremium(
  ticket: Ticket,
  premium: Premium
): BigInt {
  if (ticket.bidProcessType === "FixedPremium") {
    return ticket.premiumAmount;
  }
  return premium.askingPremiumAmount;
}

export function calcPremiumDonation(ticketId: string, amount: BigInt): void {
  let ticket = Ticket.load(ticketId);
  if (!ticket) return;
  let premium = Premium.load(`${ticketId}-${ticket.buyer.toString()}`);
  if (!premium) return;
  ticket.donatedAmount = ticket.donatedAmount.plus(amount);
  if (ticket.bidProcessType === "FixedPremium")
    ticket.premiumDonation = ticket.premiumAmount.plus(ticket.donatedAmount);
  else
    ticket.premiumDonation = premium.askingPremiumAmount.plus(
      ticket.donatedAmount
    );
  ticket.save();
}

