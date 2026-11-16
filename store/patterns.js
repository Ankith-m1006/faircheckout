// Which dark patterns this demo store ships with. The closed loop flips these one by one:
// Kane catches a pattern -> the coding agent fixes the store (sets it to false) -> Kane re-shops to prove it.
window.PATTERNS = {
  basketSneaking: false,    // a paid "protection plan" is added to the cart without the customer choosing it
  dripPricing: false,       // a mandatory fee appears only on the final payment step
  falseUrgency: false,      // a "deal ends in" countdown that restarts on every visit
  confirmShaming: false,    // the decline button guilt-trips the customer
  subscriptionTrap: false,  // cancelling the membership takes far more steps than joining
  forcedAction: false,      // customers must create an account to buy
};

// Live demo switch: open the store with ?tricks=on to see the original store with all six dark patterns.
if (new URLSearchParams(location.search).get('tricks') === 'on') {
  for (const k of Object.keys(window.PATTERNS)) window.PATTERNS[k] = true;
}
