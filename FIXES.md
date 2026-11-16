# FairCheckout fixes (2026-11-16T10:02:27.543Z)

Store: https://faircheckout.vercel.app/store/?tricks=on
Score: 0/100. Fix each item, then run `npm run audit` again; Kane re-shops to confirm.

## 1. Basket sneaking: Nothing is added to the cart that the customer did not choose
- What Kane saw: The cart automatically included a ₹99 protection plan even though the shopper only added the Cotton Tee. The added plan raised the total by ₹99. Do not select optional protection automatically. Leave it unchecked unless the shopper explicitly chooses it, then rerun the cart-total check. evidence: objective_contradiction: Final verification failed: "the Total shown on the cart page equals ₹548."
- Fix: Leave every paid add-on (plans, insurance, donations) unticked and out of the cart until the customer chooses it.
- Law: India: CCPA Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 (2) Basket sneaking; EU: Consumer Rights Directive Art. 22 (no pre-ticked boxes for extra payments); US: FTC Act Sec. 5 (unfair or deceptive practices)
- Re-check: `npm run audit -- --only basket-sneaking`
