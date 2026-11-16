// Which dark patterns this demo store ships with. The closed loop flips these one by one:
// Kane catches a pattern -> the coding agent fixes the store (sets it to false) -> Kane re-shops to prove it.
window.PATTERNS = {
  basketSneaking: true,    // a paid "protection plan" is added to the cart without the customer choosing it
  dripPricing: true,       // a mandatory fee appears only on the final payment step
  falseUrgency: true,      // a "deal ends in" countdown that restarts on every visit
  confirmShaming: true,    // the decline button guilt-trips the customer
  subscriptionTrap: true,  // cancelling the membership takes far more steps than joining
  forcedAction: true,      // customers must create an account to buy
};
