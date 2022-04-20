import { BigInt, Entity, log, store } from "@graphprotocol/graph-ts";
import { Premium, Ticket } from "../generated/schema";

export function load<T extends Entity>(id: string): T | null {
  log.debug("Name of object = {}", [nameof<T>()]);
  return changetype<T | null>(store.get(nameof<T>(), id));
}

export function loadOrCreate<T extends Entity>(id: string): T {
  let obj = load<T>(id);
  if (!obj) {
    obj = instantiate<T>(id);
  }
  return obj;
}

export function calcPremiumDonation(ticketId: string, amount: BigInt): bool {
  let ticket = Ticket.load(ticketId);
  if (!ticket) return false;
  let premium = Premium.load(`${ticketId}-${ticket.buyer.toString()}`);
  if (!premium) return false;
  ticket.donatedAmount = ticket.donatedAmount.plus(amount);
  if (ticket.bidProcessType == "FixedPremium")
    ticket.premiumDonation = ticket.premiumAmount.plus(ticket.donatedAmount);
  else
    ticket.premiumDonation = premium.askingPremiumAmount.plus(
      ticket.donatedAmount
    );
  ticket.save();
  return true;
}
