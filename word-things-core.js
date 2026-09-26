(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WordThingsCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const surface = (text, features = [], exception = null) => ({ text, features, exception });
  const surfaces = (...items) => Object.fromEntries(items.map(item => [item.text.toLowerCase(), item]));
  const regularNoun = (id, text, plural, options = {}) => ({
    id, text, subtype: 'noun', agreement: '3rd-singular', singular: text, plural,
    countable: options.countable !== false, uncountable: options.countable === false,
    bareAllowed: Boolean(options.bareAllowed),
    surfaces: surfaces(
      surface(text, ['short-vowel', 'cvc']),
      surface(plural, ['short-vowel', 'cvc', 'inflection-s'], 'inflection')
    )
  });
  const verb = (id, text, subtype, forms, surfaceItems, options = {}) => ({
    id, text, subtype, finite: true, tense: options.tense || 'present', forms,
    surfaces: surfaces(...surfaceItems)
  });
  const sameForm = text => ({
    '1st-singular': text, '3rd-singular': text, '3rd-plural': text,
    '1st-plural': text, '2nd': text, default: text
  });
  const presentForms = (base, third) => ({
    '1st-singular': base, '3rd-singular': third, '3rd-plural': base,
    '1st-plural': base, '2nd': base, default: base
  });
  const helper = text => surface(text, [], 'grammar-helper');

  // Phonics metadata is attached to every surface form. Presets decide which
  // features and explicitly named exception classes may be displayed.
  const READING_PROFILES = {
    'cvc-supported': {
      id: 'cvc-supported',
      label: 'CVC + helpers',
      description: 'Short-vowel CVC words plus clearly marked grammar words and endings.',
      allowedFeatures: ['short-vowel', 'cvc'],
      allowedExceptions: ['grammar-helper', 'inflection']
    },
    'cvc-strict': {
      id: 'cvc-strict',
      label: 'Strict CVC',
      description: 'Only short-vowel CVC surface forms; no silent helper words or endings.',
      allowedFeatures: ['short-vowel', 'cvc'],
      allowedExceptions: []
    }
  };

  const WORD_BANK = {
    articles: [
      { id: 'article-a', text: 'a', subtype: 'article', surfaces: surfaces(helper('a'), helper('an')) },
      { id: 'article-the', text: 'the', subtype: 'article', surfaces: surfaces(helper('the')) }
    ],
    determiners: [
      { id: 'det-my', text: 'my', subtype: 'determiner', surfaces: surfaces(helper('my')) },
      { id: 'det-this', text: 'this', subtype: 'determiner', number: 'singular', surfaces: surfaces(helper('this')) }
    ],
    adjectives: [
      { id: 'adj-big', text: 'big', subtype: 'adjective', surfaces: surfaces(surface('big', ['short-vowel', 'cvc'])) },
      { id: 'adj-red', text: 'red', subtype: 'adjective', surfaces: surfaces(surface('red', ['short-vowel', 'cvc'])) },
      { id: 'adj-sad', text: 'sad', subtype: 'adjective', surfaces: surfaces(surface('sad', ['short-vowel', 'cvc'])) },
      { id: 'adj-hot', text: 'hot', subtype: 'adjective', surfaces: surfaces(surface('hot', ['short-vowel', 'cvc'])) },
      { id: 'adj-wet', text: 'wet', subtype: 'adjective', surfaces: surfaces(surface('wet', ['short-vowel', 'cvc'])) }
    ],
    nouns: [
      { id: 'noun-dad', text: 'dad', subtype: 'noun', agreement: '3rd-singular', singular: 'dad', countable: true, bareAllowed: true, proper: true, surfaces: surfaces(surface('dad', ['short-vowel', 'cvc'])) },
      { id: 'noun-mom', text: 'mom', subtype: 'noun', agreement: '3rd-singular', singular: 'mom', countable: true, bareAllowed: true, proper: true, surfaces: surfaces(surface('mom', ['short-vowel', 'cvc'])) },
      regularNoun('noun-cat', 'cat', 'cats'),
      regularNoun('noun-dog', 'dog', 'dogs'),
      regularNoun('noun-kid', 'kid', 'kids'),
      regularNoun('noun-pig', 'pig', 'pigs'),
      regularNoun('noun-hen', 'hen', 'hens'),
      regularNoun('noun-fox', 'fox', 'foxes'),
      regularNoun('noun-bug', 'bug', 'bugs'),
      regularNoun('noun-sun', 'sun', 'suns'),
      { id: 'noun-mud', text: 'mud', subtype: 'noun', agreement: '3rd-singular', singular: 'mud', countable: false, uncountable: true, bareAllowed: true, surfaces: surfaces(surface('mud', ['short-vowel', 'cvc'])) }
    ],
    pronouns: [
      { id: 'pronoun-i', text: 'I', subtype: 'pronoun', agreement: '1st-singular', case: 'subject', surfaces: surfaces(helper('I')) },
      { id: 'pronoun-me', text: 'me', subtype: 'pronoun', agreement: '1st-singular', case: 'object', surfaces: surfaces(helper('me')) },
      { id: 'pronoun-we', text: 'we', subtype: 'pronoun', agreement: '1st-plural', case: 'subject', surfaces: surfaces(helper('we')) },
      { id: 'pronoun-you', text: 'you', subtype: 'pronoun', agreement: '2nd', case: 'both', surfaces: surfaces(helper('you')) },
      { id: 'pronoun-he', text: 'he', subtype: 'pronoun', agreement: '3rd-singular', case: 'subject', surfaces: surfaces(helper('he')) },
      { id: 'pronoun-she', text: 'she', subtype: 'pronoun', agreement: '3rd-singular', case: 'subject', surfaces: surfaces(helper('she')) },
      { id: 'pronoun-it', text: 'it', subtype: 'pronoun', agreement: '3rd-singular', case: 'both', surfaces: surfaces(helper('it')) },
      { id: 'pronoun-they', text: 'they', subtype: 'pronoun', agreement: '3rd-plural', case: 'subject', surfaces: surfaces(helper('they')) }
    ],
    verbs: [
      verb('verb-ran', 'ran', 'verb-intransitive', sameForm('ran'), [surface('ran', ['short-vowel', 'cvc'])], { tense: 'past' }),
      verb('verb-sat', 'sat', 'verb-intransitive', sameForm('sat'), [surface('sat', ['short-vowel', 'cvc'])], { tense: 'past' }),
      verb('verb-hid', 'hid', 'verb-intransitive', sameForm('hid'), [surface('hid', ['short-vowel', 'cvc'])], { tense: 'past' }),
      verb('verb-run', 'run', 'verb-intransitive', presentForms('run', 'runs'), [surface('run', ['short-vowel', 'cvc']), surface('runs', ['short-vowel', 'cvc', 'inflection-s'], 'inflection')]),
      verb('verb-nap', 'nap', 'verb-intransitive', presentForms('nap', 'naps'), [surface('nap', ['short-vowel', 'cvc']), surface('naps', ['short-vowel', 'cvc', 'inflection-s'], 'inflection')]),
      verb('verb-hop', 'hop', 'verb-intransitive', presentForms('hop', 'hops'), [surface('hop', ['short-vowel', 'cvc']), surface('hops', ['short-vowel', 'cvc', 'inflection-s'], 'inflection')]),
      verb('verb-hit', 'hit', 'verb-transitive', presentForms('hit', 'hits'), [surface('hit', ['short-vowel', 'cvc']), surface('hits', ['short-vowel', 'cvc', 'inflection-s'], 'inflection')]),
      verb('verb-hug', 'hug', 'verb-transitive', presentForms('hug', 'hugs'), [surface('hug', ['short-vowel', 'cvc']), surface('hugs', ['short-vowel', 'cvc', 'inflection-s'], 'inflection')]),
      verb('verb-be', 'is', 'verb-linking', {
        '1st-singular': 'am', '3rd-singular': 'is', '3rd-plural': 'are',
        '1st-plural': 'are', '2nd': 'are', default: 'is'
      }, [helper('am'), helper('is'), helper('are')])
    ],
    adverbs: [
      { id: 'adverb-fast', text: 'fast', subtype: 'adverb', surfaces: surfaces(helper('fast')) }
    ],
    prepositions: [
      { id: 'prep-in', text: 'in', subtype: 'preposition', surfaces: surfaces(helper('in')) },
      { id: 'prep-on', text: 'on', subtype: 'preposition', surfaces: surfaces(helper('on')) },
      { id: 'prep-at', text: 'at', subtype: 'preposition', surfaces: surfaces(helper('at')) }
    ],
    conjunctions: [
      { id: 'conj-and', text: 'and', subtype: 'conjunction', surfaces: surfaces(helper('and')) },
      { id: 'conj-but', text: 'but', subtype: 'conjunction', surfaces: surfaces(helper('but')) },
      { id: 'conj-or', text: 'or', subtype: 'conjunction', surfaces: surfaces(helper('or')) }
    ]
  };

  const LEVELS = [
    { level: 1, xpRequired: 0, unlocks: ['nouns', 'pronouns', 'verbs'], unlockLabel: 'Nouns, Pronouns & Verbs', nextLabel: 'Articles', punctUnlocks: ['.'] },
    { level: 2, xpRequired: 5, unlocks: ['articles'], unlockLabel: 'Articles unlocked', nextLabel: 'Adjectives', punctUnlocks: [] },
    { level: 3, xpRequired: 20, unlocks: ['adjectives'], unlockLabel: 'Adjectives unlocked', nextLabel: 'Determiners', punctUnlocks: [] },
    { level: 4, xpRequired: 45, unlocks: ['determiners'], unlockLabel: 'Determiners unlocked', nextLabel: '! and ?', punctUnlocks: [] },
    { level: 5, xpRequired: 80, unlocks: [], unlockLabel: '! and ? unlocked', nextLabel: 'Adverbs', punctUnlocks: ['!', '?'] },
    { level: 6, xpRequired: 130, unlocks: ['adverbs'], unlockLabel: 'Adverbs unlocked', nextLabel: 'Prepositions', punctUnlocks: [] },
    { level: 7, xpRequired: 200, unlocks: ['prepositions'], unlockLabel: 'Prepositions unlocked', nextLabel: 'Conjunctions', punctUnlocks: [] },
    { level: 8, xpRequired: 300, unlocks: ['conjunctions'], unlockLabel: 'Conjunctions unlocked', nextLabel: '', punctUnlocks: [] }
  ];

  const SCORE_VALUES = {
    pronoun: 1, noun: 4,
    'verb-intransitive': 1, 'verb-transitive': 5, 'verb-linking': 3,
    article: 2, determiner: 4, adjective: 3, adverb: 3,
    preposition: 3, conjunction: 5
  };

  const LEXICON = new Map();
  Object.entries(WORD_BANK).forEach(([category, entries]) => {
    entries.forEach(entry => {
      entry.category = category;
      LEXICON.set(entry.id, entry);
    });
  });

  function getProfile(profileOrId) {
    return typeof profileOrId === 'string'
      ? (READING_PROFILES[profileOrId] || READING_PROFILES['cvc-supported'])
      : (profileOrId || READING_PROFILES['cvc-supported']);
  }

  function getSurfaceMetadata(token, text = token && (token.displayText || token.text)) {
    if (!token || !token.surfaces || !text) return null;
    return token.surfaces[String(text).toLowerCase()] || null;
  }

  function isSurfaceAllowed(token, text, profileOrId) {
    const meta = getSurfaceMetadata(token, text);
    if (!meta) return false;
    const profile = getProfile(profileOrId);
    if (meta.exception) return profile.allowedExceptions.includes(meta.exception);
    return meta.features.every(feature => profile.allowedFeatures.includes(feature));
  }

  function isHelperSurface(token, text = token && (token.displayText || token.text)) {
    const meta = getSurfaceMetadata(token, text);
    return Boolean(meta && meta.exception);
  }

  function getVisibleWords(category, profileOrId) {
    return (WORD_BANK[category] || []).filter(entry => isSurfaceAllowed(entry, entry.text, profileOrId));
  }

  function cloneToken(entry) {
    return {
      ...entry,
      forms: entry.forms ? { ...entry.forms } : undefined,
      surfaces: entry.surfaces ? Object.fromEntries(Object.entries(entry.surfaces).map(([key, value]) => [key, { ...value, features: [...value.features] }])) : undefined,
      displayText: entry.text
    };
  }

  function isNounType(type) { return type === 'noun' || type === 'pronoun'; }
  function isVerbType(type) { return type === 'verb-intransitive' || type === 'verb-transitive' || type === 'verb-linking'; }
  function isNPStart(type) { return type === 'article' || type === 'determiner' || type === 'adjective' || isNounType(type); }

  // Local magnetic compatibility is intentionally permissive. It governs
  // attraction and resistance only; validateSentenceTokens governs completion.
  function getConnectionResult(leftWord, rightWord) {
    if (!leftWord || !rightWord) return { allowed: false, strength: 0 };
    const left = leftWord.subtype;
    const right = rightWord.subtype;
    if (left === 'article' && isNounType(right)) return { allowed: true, strength: 2 };
    if (left === 'determiner' && isNounType(right)) return { allowed: true, strength: 2 };
    if ((left === 'article' || left === 'determiner') && right === 'adjective') return { allowed: true, strength: 2 };
    if (left === 'adjective' && (right === 'adjective' || right === 'noun')) return { allowed: true, strength: right === 'noun' ? 2 : 1 };
    if (isNounType(left) && isVerbType(right)) return { allowed: true, strength: 3 };
    if (isNounType(left) && right === 'adverb') return { allowed: true, strength: 1 };
    if (left === 'adverb' && isVerbType(right)) return { allowed: true, strength: 1 };
    if (left === 'verb-transitive' && (isNPStart(right) || right === 'adverb')) return { allowed: true, strength: 2 };
    if (left === 'verb-linking' && (isNPStart(right) || right === 'adverb')) return { allowed: true, strength: 2 };
    if (left === 'verb-intransitive' && (right === 'adverb' || right === 'preposition' || right === 'conjunction')) return { allowed: true, strength: 1 };
    if (left === 'adverb' && (right === 'adverb' || right === 'preposition' || right === 'conjunction')) return { allowed: true, strength: 1 };
    if (left === 'noun' && (right === 'preposition' || right === 'conjunction')) return { allowed: true, strength: 1 };
    if (left === 'pronoun' && (right === 'preposition' || right === 'conjunction')) return { allowed: true, strength: 1 };
    if (left === 'preposition' && isNPStart(right)) return { allowed: true, strength: 2 };
    if (left === 'conjunction' && isNPStart(right)) return { allowed: true, strength: 2 };
    return { allowed: false, strength: 0 };
  }

  function fail(code, index, message) { return { ok: false, code, index, message }; }

  function parseNounPhrase(tokens, start, context) {
    let index = start;
    const words = [];
    let determiner = null;
    if (tokens[index] && (tokens[index].subtype === 'article' || tokens[index].subtype === 'determiner')) {
      determiner = tokens[index++];
      words.push(determiner);
    }
    while (tokens[index] && tokens[index].subtype === 'adjective') words.push(tokens[index++]);
    const head = tokens[index];
    if (!head || !isNounType(head.subtype)) return fail('noun-phrase-incomplete', index, 'This noun phrase still needs a noun or pronoun.');
    words.push(head);
    index += 1;

    if (head.subtype === 'pronoun') {
      if (determiner || words.some(word => word.subtype === 'adjective')) return fail('pronoun-modified', start, 'A pronoun cannot use this article, determiner, or adjective.');
      if (context === 'subject' && head.case === 'object') return fail('object-pronoun-subject', start, 'This pronoun cannot be the subject.');
      if (context !== 'subject' && head.case === 'subject') return fail('subject-pronoun-object', start, 'This pronoun cannot be used here.');
    } else {
      const articleText = determiner && String(determiner.displayText || determiner.text).toLowerCase();
      if ((articleText === 'a' || articleText === 'an') && head.uncountable) {
        return fail('article-uncountable', start, '“A” and “an” cannot name one of this kind of noun.');
      }
      if ((articleText === 'a' || articleText === 'an') && head.agreement === '3rd-plural') {
        return fail('article-plural', start, '“A” and “an” need a singular noun.');
      }
      if (determiner && determiner.number === 'singular' && head.agreement === '3rd-plural') {
        return fail('determiner-number', start, 'This determiner needs a singular noun.');
      }
      if (head.countable && head.agreement === '3rd-singular' && !head.bareAllowed && !determiner) {
        return fail('singular-needs-determiner', start, 'This singular noun needs an article or determiner.');
      }
    }
    return { ok: true, node: { type: 'noun-phrase', context, determiner, head, words }, end: index };
  }

  function requiredVerbForm(verbToken, agreement) {
    if (!verbToken || !verbToken.forms) return verbToken && (verbToken.displayText || verbToken.text);
    return verbToken.forms[agreement] || verbToken.forms.default || verbToken.text;
  }

  function parsePrepositionalPhrase(tokens, start) {
    const preposition = tokens[start];
    if (!preposition || preposition.subtype !== 'preposition') return fail('preposition-expected', start, 'A preposition is needed here.');
    const object = parseNounPhrase(tokens, start + 1, 'preposition-object');
    if (!object.ok) return fail('preposition-incomplete', object.index, 'This preposition still needs a complete noun phrase.');
    return { ok: true, node: { type: 'prepositional-phrase', preposition, object: object.node }, end: object.end };
  }

  function parseClause(tokens, start, profileOrId) {
    const subject = parseNounPhrase(tokens, start, 'subject');
    if (!subject.ok) return subject;
    let index = subject.end;
    const preVerbAdverbs = [];
    while (tokens[index] && tokens[index].subtype === 'adverb') preVerbAdverbs.push(tokens[index++]);
    const predicate = tokens[index];
    if (!predicate || !isVerbType(predicate.subtype) || predicate.finite === false) {
      return fail('finite-verb-required', index, 'A complete clause needs a finite verb.');
    }
    const requiredForm = requiredVerbForm(predicate, subject.node.head.agreement);
    const shownForm = predicate.displayText || predicate.text;
    if (shownForm.toLowerCase() !== requiredForm.toLowerCase()) {
      return fail('agreement', index, `The subject needs “${requiredForm}.”`);
    }
    if (!isSurfaceAllowed(predicate, requiredForm, profileOrId)) {
      return fail('profile-blocked-form', index, `“${requiredForm}” is not available in this reading profile.`);
    }
    index += 1;
    let complement = null;
    if (predicate.subtype === 'verb-transitive') {
      complement = parseNounPhrase(tokens, index, 'object');
      if (!complement.ok) return fail('transitive-object-required', index, 'This action verb needs an object.');
      index = complement.end;
    } else if (predicate.subtype === 'verb-linking') {
      if (tokens[index] && tokens[index].subtype === 'adjective') {
        const adjectives = [];
        while (tokens[index] && tokens[index].subtype === 'adjective') adjectives.push(tokens[index++]);
        complement = { ok: true, node: { type: 'adjective-complement', words: adjectives }, end: index };
      } else {
        complement = parseNounPhrase(tokens, index, 'complement');
        if (!complement.ok) return fail('linking-complement-required', index, 'This linking verb needs a describing word or noun phrase.');
        index = complement.end;
      }
    }
    const postVerbAdverbs = [];
    while (tokens[index] && tokens[index].subtype === 'adverb') postVerbAdverbs.push(tokens[index++]);
    const prepositionalPhrases = [];
    while (tokens[index] && tokens[index].subtype === 'preposition') {
      const phrase = parsePrepositionalPhrase(tokens, index);
      if (!phrase.ok) return phrase;
      prepositionalPhrases.push(phrase.node);
      index = phrase.end;
    }
    return {
      ok: true,
      node: { type: 'clause', subject: subject.node, predicate, complement: complement && complement.node, preVerbAdverbs, postVerbAdverbs, prepositionalPhrases },
      end: index
    };
  }

  function validateSentenceTokens(tokens, profileOrId = 'cvc-supported') {
    if (!Array.isArray(tokens) || tokens.length === 0) return fail('empty', 0, 'Add words to build a sentence.');
    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index];
      const shown = token.displayText || token.text;
      if (!isSurfaceAllowed(token, shown, profileOrId)) {
        return fail('profile-blocked-surface', index, `“${shown}” is not available in this reading profile.`);
      }
    }
    const clauses = [];
    const conjunctions = [];
    let index = 0;
    let clause = parseClause(tokens, index, profileOrId);
    if (!clause.ok) return clause;
    clauses.push(clause.node);
    index = clause.end;
    while (index < tokens.length) {
      const conjunction = tokens[index];
      if (conjunction.subtype !== 'conjunction') {
        return fail('unexpected-token', index, `“${conjunction.displayText || conjunction.text}” does not complete this sentence structure.`);
      }
      conjunctions.push(conjunction);
      index += 1;
      clause = parseClause(tokens, index, profileOrId);
      if (!clause.ok) return fail('conjunction-incomplete', clause.index, 'A conjunction must join two complete supported clauses.');
      clauses.push(clause.node);
      index = clause.end;
    }
    return { ok: true, complete: true, structure: { type: clauses.length > 1 ? 'compound-sentence' : 'simple-sentence', clauses, conjunctions }, end: index };
  }

  function scoreSentence(tokens, profileOrId) {
    const analysis = validateSentenceTokens(tokens, profileOrId);
    if (!analysis.ok) return 0;
    return tokens.reduce((total, token) => total + (SCORE_VALUES[token.subtype] || 0), 0) + (analysis.structure.clauses.length * 3);
  }

  function serializeToken(token) {
    return {
      lexicalId: token.id && LEXICON.has(token.id) ? token.id : token.lexicalId,
      text: token.text,
      displayText: token.displayText || token.text,
      subtype: token.subtype,
      category: token.category,
      agreement: token.agreement,
      singular: token.singular,
      plural: token.plural,
      countable: token.countable,
      uncountable: token.uncountable,
      bareAllowed: token.bareAllowed,
      proper: token.proper,
      case: token.case,
      finite: token.finite,
      tense: token.tense,
      currentForm: token.displayText || token.text
    };
  }

  function restoreToken(savedToken) {
    if (!savedToken || typeof savedToken !== 'object') return null;
    const lexical = savedToken.lexicalId && LEXICON.get(savedToken.lexicalId);
    const token = lexical ? cloneToken(lexical) : { ...savedToken };
    Object.assign(token, savedToken);
    token.displayText = savedToken.displayText || savedToken.currentForm || savedToken.text;
    if (!token.surfaces && lexical) token.surfaces = cloneToken(lexical).surfaces;
    return token;
  }

  function findLexemeBySurface(text) {
    const normalized = String(text || '').toLowerCase();
    for (const lexical of LEXICON.values()) {
      if (lexical.surfaces && lexical.surfaces[normalized]) return lexical;
    }
    return null;
  }

  function migrateLegacyText(text) {
    const terminal = /[.!?]$/.test(text) ? text.slice(-1) : null;
    const clean = terminal ? text.slice(0, -1) : text;
    const tokens = clean.split(/\s+/).filter(Boolean).map(word => {
      const lexical = findLexemeBySurface(word);
      if (!lexical) {
        return { text: word, displayText: word, subtype: 'legacy-unknown', legacy: true, surfaces: surfaces(surface(word, [], 'legacy')) };
      }
      const token = cloneToken(lexical);
      token.displayText = word;
      if (token.subtype === 'noun' && token.plural && word.toLowerCase() === token.plural.toLowerCase()) token.agreement = '3rd-plural';
      return token;
    });
    return { tokens, punctuation: terminal, migrated: true, hasUnknown: tokens.some(token => token.legacy) };
  }

  return {
    READING_PROFILES, WORD_BANK, LEVELS, SCORE_VALUES, LEXICON,
    getProfile, getSurfaceMetadata, isSurfaceAllowed, isHelperSurface, getVisibleWords,
    cloneToken, isNounType, isVerbType, getConnectionResult,
    parseNounPhrase, parseClause, validateSentenceTokens, requiredVerbForm, scoreSentence,
    serializeToken, restoreToken, findLexemeBySurface, migrateLegacyText
  };
});
