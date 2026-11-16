# FairCheckout fixes (2026-11-16T09:57:54.632Z)

Store: http://localhost:5174/?tricks=on
Score: 0/100. Fix each item, then run `npm run audit` again; Kane re-shops to confirm.

## 1. Basket sneaking: Nothing is added to the cart that the customer did not choose
- What Kane saw: The cart added the ₹99 protection-plan charge to the total without a matching customer selection. Cotton Tee is ₹499 and shipping is ₹49, so the shown total should have been ₹548 unless the protection plan was selected. Make optional protection opt-in only, keep its checkbox and charge in sync, and calculate the cart total from only the items and options the customer has selected. evidence: objective_contradiction: Final verification failed: "the Total shown on the cart page equals ₹548."
- Fix: Leave every paid add-on (plans, insurance, donations) unticked and out of the cart until the customer chooses it.
- Law: India: CCPA Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 (2) Basket sneaking; EU: Consumer Rights Directive Art. 22 (no pre-ticked boxes for extra payments); US: FTC Act Sec. 5 (unfair or deceptive practices)
- Re-check: `npm run audit -- --only basket-sneaking`

## 2. Drip pricing: The price on the last step matches the price shown in the cart
- What Kane saw: After the protection plan was unticked, the cart total was not updated to reflect the remaining item and shipping. The payment screen then used a different amount, causing the totals to disagree. Update cart pricing immediately when an optional add-on is unticked, and ensure the amount shown in the cart matches the amount shown on payment. evidence: objective_contradiction: Final verification failed: "{{payment_total}} equals the {{cart_total}}"
- Fix: Show every mandatory fee in the price from the first moment (product page and cart), never only on the final payment step.
- Law: India: CCPA Dark Patterns Guidelines 2023, Annexure 1 (8) Drip pricing; EU: Unfair Commercial Practices Directive, price transparency; DSA Art. 25; US: FTC Act Sec. 5; FTC guidance on hidden 'junk' fees
- Re-check: `npm run audit -- --only drip-pricing`

## 3. False urgency: Any countdown is a real deadline
- What Kane saw: The agent misread the home page and took the no-countdown path instead of recording the displayed deal timer, waiting, reloading, and comparing the two values. Update the agent to inspect promotional banners as well as main page content for countdown wording such as “deal ends,” extract the time shown, then complete the wait-and-reload comparison.
- Fix: Only show a countdown for a real deadline that keeps counting down for everyone; never restart it on reload.
- Law: India: CCPA Dark Patterns Guidelines 2023, Annexure 1 (1) False urgency; EU: Unfair Commercial Practices Directive, Annex I point 7 (false 'limited time' claims); US: FTC Act Sec. 5
- Re-check: `npm run audit -- --only false-urgency`

## 4. Confirm shaming: Saying no is respectful
- What Kane saw: The cart displays the decline option as “No thanks, I don't like saving money,” which frames declining membership as an unreasonable choice rather than letting the customer decline neutrally. Replace the decline link with neutral wording such as “No thanks” or “Continue without membership.” evidence: objective_contradiction: No thanks, I don't like saving money
- Fix: Use a neutral decline label such as 'No thanks'.
- Law: India: CCPA Dark Patterns Guidelines 2023, Annexure 1 (3) Confirm shaming; EU: DSA Art. 25 (no interfaces that distort free choice); US: FTC staff report 'Bringing Dark Patterns to Light' (2022)
- Re-check: `npm run audit -- --only confirm-shaming`

## 5. Subscription trap: Cancelling is as easy as joining
- What Kane saw: The cancellation journey reaches a page that requires the member to call member care, so it does not let them finish cancelling online. Add a clear online cancellation button on the final membership page and show an on-page confirmation once cancellation is complete. evidence: objective_contradiction: The final cancellation page requires calling member care and offers no online cancellation control.
- Fix: Put a 'Cancel membership' button on the account page that cancels in one or two clicks, as easy as joining.
- Law: India: CCPA Dark Patterns Guidelines 2023, Annexure 1 (5) Subscription trap; EU: DSA Art. 25(3)(c) (cancelling must not be harder than subscribing); US: Restore Online Shoppers' Confidence Act (ROSCA), simple cancellation
- Re-check: `npm run audit -- --only subscription-trap`

## 6. Forced action: Customers can buy without being forced to sign up
- What Kane saw: After Checkout, the site shows only account-creation fields and a create-account button. It does not offer a way to continue as a guest. Add a clear guest-continuation option that takes the shopper to payment without requesting account creation or a password. evidence: error_ui_text: Checkout explicitly requires account creation and a password; no guest continuation exists. evidence: objective_contradiction: Assert that you can continue to the payment page as a guest, without creating an account or entering a password.
- Fix: Offer guest checkout; ask for an account only as an option after the order.
- Law: India: CCPA Dark Patterns Guidelines 2023, Annexure 1 (4) Forced action; EU: GDPR Art. 5(1)(c) data minimisation; DSA Art. 25; US: FTC Act Sec. 5
- Re-check: `npm run audit -- --only forced-action`
