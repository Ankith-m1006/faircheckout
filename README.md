# FairCheckout

**Your checkout, shopped by an honest customer.**

FairCheckout sends [Kane CLI](https://www.testmuai.com/support/docs/kane-cli-introduction/) through a store's checkout like a real customer with one simple goal ("buy one tee and nothing else"). When a goal can't be met honestly, that's a dark pattern. FairCheckout shows where it happened, names the rule it breaks, writes a fix list for your coding agent, and shops again to prove the fix.

Live: https://faircheckout.vercel.app · [demo video](https://youtu.be/aUFhXNQ4aVw) · [before report (0/6)](https://faircheckout.vercel.app/report/before.html) · [after report (6/6)](https://faircheckout.vercel.app/report/after.html) · [tricked store](https://faircheckout.vercel.app/store/?tricks=on) · [fixed store](https://faircheckout.vercel.app/store/)

## What it checks

| Check | Honest-customer goal Kane runs | Dark pattern |
|---|---|---|
| basket-sneaking | Add one item, change nothing, cart total = item + shipping | Paid extras added without consent |
| drip-pricing | Final "total to pay" = the cart total | Mandatory fees revealed only at the end |
| false-urgency | A countdown keeps counting after a reload | Timers that restart for everyone |
| confirm-shaming | The "no" option is neutral | Guilt-trip decline buttons |
| subscription-trap | Join, then cancel online in at most 3 clicks | Cancel mazes ending in "call us" |
| forced-action | Reach payment as a guest | Forced sign-up |

Each finding is mapped to India's CCPA *Guidelines for Prevention and Regulation of Dark Patterns, 2023* (Annexure 1), EU rules (DSA Art. 25, Consumer Rights Directive Art. 22, UCPD) and US FTC guidance / ROSCA. For information, not legal advice.

## Run it (under 30 seconds to start)

```bash
npm install -g @testmuai/kane-cli
kane-cli login --oauth
git clone https://github.com/Ankith-m1006/faircheckout && cd faircheckout
node bin/faircheckout.mjs audit --url "https://faircheckout.vercel.app/store/?tricks=on" --only basket-sneaking
```

Full audit of your own store: put its URL, one product name and "price + shipping" in `faircheckout.config.json`, then `node bin/faircheckout.mjs audit`. Output:

- `report/index.html`: each finding, Kane's steps, the rule it breaks, the fix, and the Kane evidence pack.
- `FIXES.md`: a fix list written for a coding agent (Claude Code, Cursor, Codex).
- Exit code 1 while any dark pattern remains, so it can gate a release in CI.

Options: `--only id,id`, `--concurrency 3`, `--out name`, `--headed` (watch Kane shop).

## The closed loop (in this repo's history)

1. `a3987f9`: the demo store ships six dark patterns. Kane: **0/6**. Kane explained the basket sneaking in its own words: the cart showed ₹647 instead of ₹548 because a ₹99 plan was pre-selected.
2. The coding agent reads `FIXES.md` and fixes the store.
3. `c73c99e`: Kane re-shops: **6/6 clean**.

## What we learned building it

- **Kane is a careful shopper.** Asked to "check nothing extra is in the cart", it unticked the sneaked plan itself and passed. Real customers don't notice, so every check models the inattentive customer and compares exact totals.
- **Browsers crash; stores shouldn't be blamed.** A crashed Kane run is retried once and reported as "not checked", never as a dark pattern.
- **Windows quoting:** spawning `kane-cli` through a shell split the customer goal into words. FairCheckout runs Kane's entry script directly so the goal arrives as one argument.

## Layout

- `store/`: Kirana Threads, a fictional demo shop; `store/patterns.js` holds the six patterns (`?tricks=on` turns them all on for the live demo).
- `checks.json`: the six honest-customer goals, fixes and legal references.
- `bin/faircheckout.mjs`: the audit runner (Kane `--agent` NDJSON → report, FIXES.md, exit code).
- `report/`: generated reports.

MIT licence.
