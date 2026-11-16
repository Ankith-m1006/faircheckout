#!/usr/bin/env node
// FairCheckout: Kane CLI shops a store like an honest customer and reports dark patterns.
// Usage: faircheckout audit [--url URL] [--only id,id] [--concurrency N] [--headed]
import { spawn, execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const cmd = args[0];
const opt = (name, d) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : d; };
const flag = (name) => args.includes('--' + name);

if (cmd !== 'audit') {
  console.log('Usage: faircheckout audit [--url URL] [--only basket-sneaking,drip-pricing] [--concurrency 3] [--out name] [--headed]');
  process.exit(cmd ? 1 : 0);
}

const config = JSON.parse(readFileSync(join(ROOT, 'faircheckout.config.json'), 'utf8'));
const url = opt('url', config.url);
const only = opt('only', '')?.split(',').filter(Boolean);
const concurrency = Number(opt('concurrency', 3));
const outName = opt('out', 'index');
const checks = JSON.parse(readFileSync(join(ROOT, 'checks.json'), 'utf8')).checks.filter((c) => !only.length || only.includes(c.id));
// Path to Kane CLI's entry script (global npm install), or override with KANE_CLI_JS.
const KANE = process.env.KANE_CLI_JS || join(execSync('npm root -g').toString().trim(), '@testmuai', 'kane-cli', 'bin', 'kane-cli.cjs');
const fill = (s) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => config.vars[k] ?? `{{${k}}}`);

// Run one check through Kane CLI and return its verdict, summary and evidence pack.
function runCheck(check) {
  return new Promise((resolve) => {
    const kargs = ['run', fill(check.objective), '--url', url, '--max-steps', '20', '--timeout', '420', '--agent'];
    if (!flag('headed')) kargs.push('--headless');
    const started = Date.now();
    // Run Kane's own entry file with node so the customer goal reaches it as ONE argument (no shell quoting on Windows).
    const child = spawn(process.execPath, [KANE, ...kargs]);
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('close', () => {
      let end = null; const steps = []; let evidence = null;
      for (const line of out.split(/\r?\n/)) {
        const ev = line.match(/evidence serve (.+\.evidence)/); if (ev) evidence = ev[1].replace(/`$/, '');
        if (!line.startsWith('{')) continue;
        try {
          const j = JSON.parse(line);
          if (j.type === 'run_end') end = j;
          else if (j.status === 'done' || j.status === 'failed') steps.push({ status: j.status, remark: j.remark });
        } catch { /* not JSON */ }
      }
      const status = end?.status === 'passed' ? 'pass' : end ? 'fail' : 'error';
      resolve({ ...check, objective: fill(check.objective), status, summary: end?.summary ?? 'Kane did not finish this check (see raw log).', steps, evidence, seconds: Math.round((Date.now() - started) / 1000) });
      process.stdout.write(`${status === 'pass' ? 'PASS ' : status === 'fail' ? 'FAIL ' : 'ERROR'}  ${check.pattern.padEnd(18)} ${check.name}\n`);
    });
  });
}

async function pool(items, n, fn) {
  const results = []; let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; results[k] = await fn(items[k]); } }));
  return results;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

console.log(`FairCheckout: Kane is shopping ${url} as an honest customer (${checks.length} checks)...\n`);
// A crashed browser is not a store finding: retry that check once, and mark it 'error' (not 'fail') if it crashes again.
const INFRA = /context (ended|closed)|browser (closed|crashed|ended)|runner|timed? ?out|did not finish/i;
async function runWithRetry(check) {
  const first = await runCheck(check);
  if (first.status === 'pass' || !INFRA.test(first.summary)) return first;
  process.stdout.write(`       retrying ${check.id} (the browser stopped, not a store finding)
`);
  const second = await runCheck(check);
  return second.status === 'pass' || !INFRA.test(second.summary) ? second : { ...second, status: 'error' };
}
const results = await pool(checks, concurrency, runWithRetry);
const passed = results.filter((r) => r.status === 'pass').length;
const score = Math.round((passed / results.length) * 100);
const at = new Date().toISOString();

mkdirSync(join(ROOT, 'report'), { recursive: true });
writeFileSync(join(ROOT, 'report', `${outName === 'index' ? 'latest' : outName}.json`), JSON.stringify({ url, at, score, results }, null, 2));

// Fix list for the coding agent: only the failed checks, with the customer goal Kane could not complete.
const failed = results.filter((r) => r.status !== 'pass');
writeFileSync(join(ROOT, 'FIXES.md'), failed.length
  ? `# FairCheckout fixes (${at})\n\nStore: ${url}\nScore: ${score}/100. Fix each item, then run \`npm run audit\` again; Kane re-shops to confirm.\n\n` +
    failed.map((r, n) => `## ${n + 1}. ${r.pattern}: ${r.name}\n- What Kane saw: ${r.summary.replace(/\n/g, ' ')}\n- Fix: ${r.fix}\n- Law: ${r.law.join('; ')}\n- Re-check: \`npm run audit -- --only ${r.id}\`\n`).join('\n')
  : `# FairCheckout fixes (${at})\n\nNo dark patterns found on ${url}. Score ${score}/100.\n`);

const card = (r) => `<article class="f ${r.status}"><div class="h"><span class="b">${r.status === 'pass' ? 'Clean' : r.status === 'fail' ? 'Dark pattern' : 'Not checked'}</span><h3>${esc(r.pattern)}</h3></div>
  <p class="q">${esc(r.name)}</p><p>${esc(r.summary).replace(/\n/g, '<br>')}</p>
  ${r.status !== 'pass' ? `<p><b>Fix:</b> ${esc(r.fix)}</p><ul class="law">${r.law.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
  <details><summary>Kane's steps (${r.steps.length}, ${r.seconds}s)</summary><ol>${r.steps.map((s) => `<li class="${s.status}">${esc(s.remark)}</li>`).join('')}</ol>
  <p class="ev">Customer goal: ${esc(r.objective)}</p>${r.evidence ? `<p class="ev">Evidence pack: <code>kane-cli evidence serve ${esc(r.evidence)}</code></p>` : ''}</details></article>`;
writeFileSync(join(ROOT, 'report', `${outName}.html`), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FairCheckout report</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>:root{--ink:#1d1a16;--mute:#6a6158;--line:#e7dfd3;--bad:#b3261e;--good:#2f7a4f}*{box-sizing:border-box;margin:0}body{background:#faf7f2;color:var(--ink);font:16px/1.55 Inter,sans-serif;padding:32px 16px}main{max-width:860px;margin:0 auto}
h1{font:600 38px/1.1 Fraunces,serif;letter-spacing:-.02em}.meta{color:var(--mute);margin:8px 0 22px}.score{display:flex;gap:18px;align-items:center;background:var(--ink);color:#fff;border-radius:18px;padding:20px 24px;margin-bottom:22px}.score b{font:600 54px Fraunces,serif}
.f{background:#fff;border:1px solid var(--line);border-left:5px solid var(--good);border-radius:14px;padding:18px 20px;margin-bottom:14px}.f.fail{border-left-color:var(--bad)}.f.error{border-left-color:#c58a00}.h{display:flex;gap:12px;align-items:center}
.b{font:600 12px Inter;text-transform:uppercase;letter-spacing:.06em;border-radius:999px;padding:3px 10px;background:#e8f3ec;color:var(--good)}.fail .b{background:#fbe9e7;color:var(--bad)}.error .b{background:#fff4d6;color:#8a6200}
h3{font:600 21px Fraunces,serif}.q{color:var(--mute);margin:4px 0 8px}.law{font-size:14px;color:var(--mute);margin:6px 0 0 18px}details{margin-top:10px;font-size:14px}ol{margin:8px 0 0 18px}li.failed{color:var(--bad)}.ev{color:var(--mute);font-size:13px;margin-top:6px;word-break:break-all}
.foot{color:var(--mute);font-size:13px;margin-top:20px}</style></head><body><main>
<h1>FairCheckout report</h1><p class="meta">${esc(url)} · ${new Date(at).toUTCString()} · checked by Kane CLI in a real browser</p>
<div class="score"><b>${score}</b><div>${passed} of ${results.length} honest-customer checks passed<br><span style="opacity:.7">${failed.length ? `${failed.length} dark pattern${failed.length > 1 ? 's' : ''} found` : 'No dark patterns found'}</span></div></div>
${results.map(card).join('\n')}
<p class="foot">Legal references are for information, not legal advice. FairCheckout maps each finding to India's CCPA Guidelines for Prevention and Regulation of Dark Patterns (2023), EU rules and US FTC guidance.</p></main></body></html>`);

console.log(`\nScore ${score}/100 · ${passed}/${results.length} passed · report/${outName}.html · FIXES.md`);
process.exit(failed.length ? 1 : 0);
