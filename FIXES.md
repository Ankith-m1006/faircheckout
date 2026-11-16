# FairCheckout fixes (2026-11-16T09:23:30.722Z)

Store: http://localhost:5174/
Score: 0/100. Fix each item, then run `npm run audit` again; Kane re-shops to confirm.

## 1. Basket sneaking: Nothing is added to the cart that the customer did not choose
- What Kane saw: The cart added the ₹99 protection-plan amount even though the run only added the Cotton Tee and made no cart-page changes. With the ₹499 item and ₹49 shipping, the expected total is ₹548; the displayed ₹647 includes an extra ₹99. Investigate why the protection plan is included in the cart total without a cart-page selection. The total should remain ₹548 unless the shopper explicitly opts in to the ₹99 plan. evidence: objective_contradiction: the Total shown on the cart page equals ₹548
- Fix: Leave every paid add-on (plans, insurance, donations) unticked and out of the cart until the customer chooses it.
- Law: India: CCPA Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 (2) Basket sneaking; EU: Consumer Rights Directive Art. 22 (no pre-ticked boxes for extra payments); US: FTC Act Sec. 5 (unfair or deceptive practices)
- Re-check: `npm run audit -- --only basket-sneaking`

## 2. Drip pricing: The price on the last step matches the price shown in the cart
- What Kane saw: Removing the optional protection plan visibly unticked it, but the cart total stayed at ₹647. The payment page then showed a different total of ₹597, including a convenience fee that was not in the cart total. Update cart pricing immediately when an optional add-on is removed and show every fee before checkout, so the cart Total matches the payment Total to pay. evidence: objective_contradiction: Total ₹647 evidence: objective_contradiction: Total to pay ₹597
- Fix: Show every mandatory fee in the price from the first moment (product page and cart), never only on the final payment step.
- Law: India: CCPA Dark Patterns Guidelines 2023, Annexure 1 (8) Drip pricing; EU: Unfair Commercial Practices Directive, price transparency; DSA Art. 25; US: FTC Act Sec. 5; FTC guidance on hidden 'junk' fees
- Re-check: `npm run audit -- --only drip-pricing`

## 3. False urgency: Any countdown is a real deadline
- What Kane saw: The agent inspected the cart page instead of first going to the home page, then incorrectly concluded that there was no countdown. The visible page contained a banner reading “Festive deal ends in 04:57.” Update the run to navigate to the home page before checking. If a deal timer is visible, record its value, wait 20 seconds, reload, record it again, and compare the two values.
- Fix: Only show a countdown for a real deadline that keeps counting down for everyone; never restart it on reload.
- Law: India: CCPA Dark Patterns Guidelines 2023, Annexure 1 (1) False urgency; EU: Unfair Commercial Practices Directive, Annex I point 7 (false 'limited time' claims); US: FTC Act Sec. 5
- Re-check: `npm run audit -- --only false-urgency`

## 4. Confirm shaming: Saying no is respectful
- What Kane saw: The cart displays a decline choice that implies a customer who says no does not like saving money. This is not a neutral way to decline an optional membership. Change the decline option to neutral wording such as “No thanks” or “Continue without membership.” evidence: objective_contradiction: No thanks, I don't like saving money
- Fix: Use a neutral decline label such as 'No thanks'.
- Law: India: CCPA Dark Patterns Guidelines 2023, Annexure 1 (3) Confirm shaming; EU: DSA Art. 25 (no interfaces that distort free choice); US: FTC staff report 'Bringing Dark Patterns to Light' (2022)
- Re-check: `npm run audit -- --only confirm-shaming`

## 5. Subscription trap: Cancelling is as easy as joining
- What Kane saw: The test requires an online cancellation but permits only three clicks after joining. Those three clicks were already needed to open membership management, choose to leave, and continue; the next page still requires a cancellation reason to be selected. Revise the test's click budget to allow the required reason-selection and final confirmation steps, then assert cancellation only after the product's actual completion page is reached.
- Fix: Put a 'Cancel membership' button on the account page that cancels in one or two clicks, as easy as joining.
- Law: India: CCPA Dark Patterns Guidelines 2023, Annexure 1 (5) Subscription trap; EU: DSA Art. 25(3)(c) (cancelling must not be harder than subscribing); US: Restore Online Shoppers' Confidence Act (ROSCA), simple cancellation
- Re-check: `npm run audit -- --only subscription-trap`

## 6. Forced action: Customers can buy without being forced to sign up
- What Kane saw: The checkout page only offers account creation and includes a required password field; it does not provide a guest route to the payment step. Add a clearly available guest checkout action that proceeds to the payment step without asking the shopper to create an account or enter a password. evidence: objective_contradiction: you can continue to the payment page as a guest, without creating an account or entering a password
- Fix: Offer guest checkout; ask for an account only as an option after the order.
- Law: India: CCPA Dark Patterns Guidelines 2023, Annexure 1 (4) Forced action; EU: GDPR Art. 5(1)(c) data minimisation; DSA Art. 25; US: FTC Act Sec. 5
- Re-check: `npm run audit -- --only forced-action`
