'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('./word-things-core.js');

const token = (lexicalId, displayText) => {
  const lexical = core.LEXICON.get(lexicalId);
  assert.ok(lexical, `missing test lexeme: ${lexicalId}`);
  const result = core.cloneToken(lexical);
  result.lexicalId = lexicalId;
  if (displayText) result.displayText = displayText;
  if (displayText && result.subtype === 'noun' && result.plural === displayText) result.agreement = '3rd-plural';
  return result;
};

const validate = (tokens, profile = 'cvc-supported') => core.validateSentenceTokens(tokens, profile);

test('accepts a complete intransitive clause with an explicit noun-phrase subject', () => {
  const result = validate([token('noun-dad'), token('verb-ran')]);
  assert.equal(result.ok, true);
  assert.equal(result.structure.type, 'simple-sentence');
  assert.equal(result.structure.clauses[0].subject.type, 'noun-phrase');
  assert.equal(result.structure.clauses[0].predicate.subtype, 'verb-intransitive');
});

test('rejects a trailing article', () => {
  const result = validate([token('noun-dad'), token('verb-ran'), token('article-the')]);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'unexpected-token');
});

test('rejects an incomplete transitive predicate', () => {
  const result = validate([token('noun-dad'), token('verb-hit', 'hits')]);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'transitive-object-required');
});

test('accepts a complete transitive clause', () => {
  const result = validate([token('noun-dad'), token('verb-hit', 'hits'), token('noun-mom')]);
  assert.equal(result.ok, true);
  assert.equal(result.structure.clauses[0].complement.context, 'object');
});

test('enforces singular and plural agreement', () => {
  assert.equal(validate([
    token('article-the'), token('noun-dog'), token('verb-run', 'runs')
  ]).ok, true);

  const pluralDog = token('noun-dog', 'dogs');
  assert.equal(validate([token('article-the'), pluralDog, token('verb-run', 'run')]).ok, true);

  const mismatch = validate([token('article-the'), pluralDog, token('verb-run', 'runs')]);
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.code, 'agreement');
});

test('uses first-person agreement', () => {
  assert.equal(validate([token('pronoun-i'), token('verb-run', 'run')]).ok, true);
  const mismatch = validate([token('pronoun-i'), token('verb-run', 'runs')]);
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.code, 'agreement');
});

test('parses an adjective noun phrase', () => {
  const result = validate([
    token('article-the'), token('adj-big'), token('noun-dog'), token('verb-run', 'runs')
  ]);
  assert.equal(result.ok, true);
  assert.deepEqual(
    result.structure.clauses[0].subject.words.map(word => word.subtype),
    ['article', 'adjective', 'noun']
  );
});

test('parses a complete prepositional phrase', () => {
  const result = validate([token('noun-dad'), token('verb-ran'), token('prep-in'), token('noun-mud')]);
  assert.equal(result.ok, true);
  assert.equal(result.structure.clauses[0].prepositionalPhrases.length, 1);

  const incomplete = validate([token('noun-dad'), token('verb-ran'), token('prep-in')]);
  assert.equal(incomplete.ok, false);
  assert.equal(incomplete.code, 'preposition-incomplete');
});

test('requires conjunctions to join complete clauses', () => {
  const result = validate([
    token('noun-dad'), token('verb-ran'), token('conj-and'), token('noun-mom'), token('verb-sat')
  ]);
  assert.equal(result.ok, true);
  assert.equal(result.structure.type, 'compound-sentence');
  assert.equal(result.structure.clauses.length, 2);

  const incomplete = validate([token('noun-dad'), token('verb-ran'), token('conj-and')]);
  assert.equal(incomplete.ok, false);
  assert.equal(incomplete.code, 'conjunction-incomplete');
});

test('enforces reading profiles and keeps helper exceptions explicit', () => {
  const helperSentence = [token('pronoun-i'), token('verb-ran')];
  assert.equal(validate(helperSentence, 'cvc-supported').ok, true);
  const strict = validate(helperSentence, 'cvc-strict');
  assert.equal(strict.ok, false);
  assert.equal(strict.code, 'profile-blocked-surface');
  assert.equal(core.isHelperSurface(helperSentence[0]), true);
});

test('does not allow transformed surface forms to bypass the active profile', () => {
  const dogs = token('noun-dog', 'dogs');
  const pluralSentence = [token('article-the'), dogs, token('verb-run', 'run')];
  assert.equal(validate(pluralSentence, 'cvc-supported').ok, true);
  assert.equal(core.isSurfaceAllowed(dogs, 'dogs', 'cvc-strict'), false);
  assert.equal(validate(pluralSentence, 'cvc-strict').code, 'profile-blocked-surface');

  const runs = token('verb-run', 'runs');
  assert.equal(core.isSurfaceAllowed(runs, 'runs', 'cvc-strict'), false);
});

test('serialize and restore preserve token identity and grammatical behavior', () => {
  const original = [token('noun-dad'), token('verb-hit', 'hits'), token('noun-mom')];
  const restored = original.map(item => core.restoreToken(core.serializeToken(item)));
  assert.equal(validate(restored).ok, true);
  assert.deepEqual(restored.map(item => item.lexicalId), ['noun-dad', 'verb-hit', 'noun-mom']);
  assert.equal(restored[1].forms['3rd-singular'], 'hits');
  assert.equal(core.isSurfaceAllowed(restored[1], 'hits', 'cvc-supported'), true);
});

test('legacy migration recovers known tokens but never guesses unknown grammar', () => {
  const known = core.migrateLegacyText('Dad ran.');
  assert.equal(known.punctuation, '.');
  assert.equal(known.hasUnknown, false);
  assert.equal(validate(known.tokens).ok, true);

  const uncertain = core.migrateLegacyText('Dad zoomed.');
  assert.equal(uncertain.hasUnknown, true);
  assert.equal(uncertain.tokens[1].subtype, 'legacy-unknown');
  assert.equal(validate(uncertain.tokens).ok, false);
});
