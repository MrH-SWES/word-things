# Word Things sentence builder audit

Reviewed 2026-09-24 at commit `2f64e2f484f10d93bfff9eefe607a0309cbecf9f`.

Scope: `index.html`, the only tracked application file. This is the progressive-unlock app the user intended, distinct from `math-things/apps/sentences/`. Findings about that other implementation must not be carried over as findings about this one.

## Intended experience

A progressively expanding language manipulative: students drag physical word tiles together, observe attraction and resistance, change noun number and see verb agreement change, finish a sentence with a punctuation bead, and unlock additional grammatical tools. The user's new requirement is access for beginning decoders through CVC, CCVC, and CVCC word banks while retaining opportunities to learn sentence structure.

Preserve the progression, physical tiles, magnetic interaction, grouped dragging, agreement transformations, sentence collection, Lexend typography, and Word Things identity. Group dragging already exists for physically snapped clusters, although those clusters do not represent a full phrase/clause grammar model. The earlier recommendation to rebuild the Math Things app should not be applied wholesale here.

## Actual progression

| Level | Points | New tools |
|---|---:|---|
| 1 | 0 | Nouns and verbs; period. The opening bank is actually restricted to I and play. |
| 2 | 5 | Articles |
| 3 | 20 | Adjectives |
| 4 | 45 | Determiners |
| 5 | 80 | Exclamation and question marks |
| 6 | 130 | Adverbs |
| 7 | 200 | Prepositions |
| 8 | 300 | Conjunctions and comma |

The opening “I play.” yields exactly five points, enough for the first unlock. Dev mode bypasses locks. Progress is stored in browser localStorage.

## Verified defects

The actual application functions were executed in a Node VM, with DOM access stubbed and visual score-badge rendering suppressed. Synthetic contiguous tile positions were supplied to exercise completeness logic. No browser interaction or visual rendering was claimed.

| Check | Actual result |
|---|---|
| I + play | Correct agreement, accepted complete, five points |
| the + dog + run | Changes to “the dog runs”; accepted complete |
| kids + eat + the | Accepted complete despite trailing article |
| kids + is | Changes to “kids are”; accepted complete despite missing complement |
| the dog runs on the ball | Rejected: no supported connections to/from the preposition |
| kids run and play | Rejected: no supported connections to/from the conjunction |
| a big water runs | Accepted: intervening adjective bypasses direct article–uncountable guard |
| Every preposition against every bank entry in both directions | Zero allowed connections |
| Every conjunction against every bank entry in both directions | Zero allowed connections |
| Apply every ordinary level unlock | Pronouns never unlock |

The first-person agreement errors found in the other app do not carry over: this app has explicit person/number forms and correctly produces “I play.”

## Why it is unfinished

1. **Pairwise compatibility is doing the job of sentence grammar.** It can allow individual neighbors but cannot reliably establish that a full clause is complete. As a result, incomplete strings can be finished, stored, and scored.
2. **The later unlocks outrun their implementation.** Prepositions and conjunctions appear as rewards, but the connection engine cannot use them. Pronouns are absent from the unlock definitions after the special opening experience.
3. **The sentence vault loses structure.** It saves text, score, and timestamp. `pullFromVault` recreates every retrieved word with subtype `noun`, discarding verb forms, number, and grammatical identities. Revisiting a sentence therefore damages its editability.
4. **Beginning-reader access is missing.** The 59 bank entries have no phonics tags. There is no word or sentence audio implementation. Word selection requires dragging div elements; no keyboard equivalent is implemented. The viewport disables user zoom.
5. **Progress labels overclaim.** “10 nouns & verbs mastered” is tied to a point threshold, not tracking ten mastered words. The visible points strip caps at 50 while later thresholds reach 300. Progression should be retained but made accurate.

## Beginning-decoder design

Keep grammatical unlocks and decoding permissions independent. At a given grammar stage, render only vocabulary/forms matching the teacher-selected reading profile, plus explicitly approved helper words. Support independently selectable CVC, CCVC, and CVCC sets and cumulative presets.

Curate by sound–spelling correspondences rather than letter count. Include metadata for the displayed forms, not just dictionary/base forms. “Run,” “runs,” and “running” have different decoding demands. New grammar tools must not silently introduce untaught spelling patterns.

Replace the hard-coded opening “I play” with an equally reliable profile-appropriate opening, such as “Dad ran” for a curated CVC bank. Proper names/kinship names and decodable past-tense forms need explicit grammatical metadata so they do not require articles or receive incorrect endings. This example is proposed vocabulary, not currently available.

Offer optional teacher-approved helper words such as “a,” “the,” and “on” with audio support. Strict banks contain no silent exceptions. Some grammatical structures require words outside a strict pattern set; handle that openly through the teacher's selections.

Add a distinct hear-word action, then whole-sentence playback; phrase playback can follow. Hearing must not accidentally place or drag a tile. Ensure each selected bank has enough compatible words to construct meaningful sentences and advance through the supported unlocks.

## Recommended implementation order

1. Fix clause completion and represent supported grammatical roles explicitly; repair preposition/conjunction behavior and pronoun availability.
2. Preserve full token identity and grammatical metadata in saved/reopened sentences, including migration or cautious handling of existing text-only entries.
3. Add a modest, curated phonics-tagged vocabulary, teacher profiles, profile-aware opening, and transformations checked against the active decoding permissions.
4. Add word/sentence audio, touch/keyboard alternatives, and accurate progression labels. Keep the existing physical design and progression.

## Effort estimate

Approximate engineering effort for a bounded scope: about one focused day for a first beginning-decoder version supporting simple sentences, including the essential completion fixes; roughly two to three focused days total to repair later structures, vault restoration, access controls, and device verification. Vocabulary curation and actual tablet behavior are the main uncertainties. These are estimates, not delivery guarantees.

## Acceptance checks

- [ ] First sentence works in each reading profile and opens the next intended tool.
- [ ] No displayed or transformed word violates a strict profile; helper exceptions are explicit.
- [ ] Trailing articles and incomplete verb complements cannot finish or earn sentence points.
- [ ] Unlocked prepositions/conjunctions support the declared constructions; pronouns become available at an intentional stage.
- [ ] Retrieved sentences preserve word identities, forms, agreement, and editability.
- [ ] Students can hear a word without adding it and hear a finished sentence.
- [ ] Touch and keyboard support the core operations; zoom and usable target sizes support access.
- [ ] Progress labels match actual unlocks and make no unsupported mastery claims.

Application code remains unchanged. This is a local assessment; nothing has been committed, pushed, or deployed. Browser, touch, and audible playback tests remain pending; the browser executable was unavailable in this session.
