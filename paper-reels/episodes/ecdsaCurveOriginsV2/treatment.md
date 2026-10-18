# ECDSA seeds: treatment (v2 remake)

1. **Format:** `paper` (60 to 80 s). The source is a research blog post, not arXiv, so the item is registered as a topic (`ecdsa-curve-origins`) in a temporary database only.
2. **One idea:** The secret-looking NIST curve seeds came from an old C random number generator started from 1997-98 clock times, so a hidden backdoor is now much less plausible.
3. **Newcomer's questions:** What is the fear? (l01) What was the answer? (l02) What are these curves? (l03) What is a seed and why was it suspicious? (l04-l05) How did Claude find it? (l06) What is the hidden thing to recover? (l07) How do you recover it from partial output? (l08) Where did the generator start? (l09) Example? (l10) How sure is this? (l11) So what? (l12) What is still unknown? (l13)
4. **Jargon plan:** backdoor (l01, "a secret way in"), elliptic curves (l03, "math shapes that protect digital signatures"), seed (l04, "one random number"), lrand48 (l06, "a C function"), state (l07, "one number inside"), lattice reduction (l08, "a math method"), draw (l10).
5. **Protagonist object:** the P-256 seed C49D3608 86E70493 6A6678E1 139D26B7 819F7E90: shown in l04, rebuilt as draw 1,842 in l10.
6. **Hook options:** (a) "For years, people feared a backdoor, a secret way in, in a top crypto standard." + "The answer was an old computer clock." (chosen: claim plus surprise; frame 0 shows BACKDOOR? over a padlock, same words as the thumbnail). (b) "The NSA picked these numbers. Nobody knew how." (c) "A 1997 clock settles a crypto mystery."
7. **Picture:** padlock -> clock (hook); curve + seed box (seed); robot + 1990s code + state box with output wires (guess); bit rows seen/hidden + skewed lattice that straightens, then a chain of states stepped backwards onto a 1997-98 time axis (rewind); clock + counter landing on 1,842 (p256); ten 160-bit bars + receipt (proof); open-question cards + loop clock (close).
8. **Receipt:** "Each recovered 48-bit state regenerates all 160 bits of its seed, which does not happen by chance." (How it was found; PDF page 3 of the saved print), read in l11.
9. **Shot list:** see storyboard scenes hook 0.0, seed 7.8, guess 26.3, rewind 38.9, p256 53.3, proof 60.9, close 70.0 (s). Transitions: whip main, zoom/punch accents, cut into close.
10. **Numbers budget:** 1,842 (P-256 draw, Anthropic's result, re-checked with the post's code), 160 bits (per seed, regenerated exactly), 10 seeds (5 NIST + 5 ANSI X9.62), 876 (skipped usable draw). Dates 1997/1998/2000 are context.
11. **Caveat:** "much less plausible", not "proven safe"; still open: B-163 seed, most base points (P-192 and five X9.62 base points were recovered), why draw 876 was skipped.
12. **Loop and ending:** last line "The answer was a clock." returns to the hook; end card shows only hemanth_with_ai plus a credit line.
13. **Post text angle:** "The NSA's mystery curve seeds were an old clock" / "For 25 years people asked where the NIST curve seeds came from. Claude found lrand48 and a 1997 timestamp."
14. **Script:**

l01: For years, people feared a backdoor, a secret way in, in a top crypto standard.
l02: The answer was an old computer clock.
l03: Elliptic curves are math shapes that protect digital signatures. In 2000, NIST published a set of standard curves.
l04: Each curve grows from one random number, its seed. The NSA gave the seeds, with no source.
l05: A chosen seed could hide a weak curve. A rumour named a joke phrase. Nobody found it.
l06: Anthropic asked Claude. It guessed that 1990s code made each seed with a C function, lrand48.
l07: lrand48 hides one number inside, its state. The state decides every output.
l08: Each seed shows only part of each output. A math method, lattice reduction, still rebuilt the state.
l09: Then Claude ran the generator backwards to its start. Each start was a clock time, from May 1997 to April 1998.
l10: The P-256 seed is draw 1,842, from a clock set on August 16, 1997.
l11: Each rebuilt state gives back all 160 bits of its seed. That does not happen by chance.
l12: So a hidden backdoor is now much less plausible.
l13: Still open: one seed, most base points, and why the makers skipped draw 876, also a usable curve. The answer was a clock.
