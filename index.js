/*
** Hipku version 0.0.2
** Copyright (c) Gabriel Martin 2014
** All rights reserved
** Available under the MIT license
** http://gabrielmartin.net/projects/hipku
*/
;
var Hipku = (function() {
/*
** ##############
** Public Methods
** ##############
*/

/*
** Object holds all public methods and is returned by the module
*/
var publicMethods = {};

/*
** Public method to encode IP Addresses as haiku
*/
var encode = function(ip) {
  var ipv6, decimalOctetArray, factoredOctetArray, encodedWordArray,
    haikuText;

  ipv6 = ipIsIpv6(ip);
  decimalOctetArray = splitIp(ip, ipv6);
  factoredOctetArray = factorOctets(decimalOctetArray, ipv6);
  encodedWordArray = encodeWords(factoredOctetArray, ipv6);
  haikuText = writeHaiku(encodedWordArray, ipv6);

  return haikuText;
};

/*
** Public method to decode haiku into IP Addresses
*/
var decode = function(haiku) {
  var wordArray, ipv6, factorArray, octetArray, ipString;

  wordArray = splitHaiku(haiku);
  ipv6 = haikuIsIpv6(wordArray);
  factorArray = getFactors(wordArray, ipv6);
  octetArray = getOctets(factorArray, ipv6);
  ipString = getIpString(octetArray, ipv6);

  return ipString;
};

/*
** Attach the public methods to the return object
*/
publicMethods.encode = encode;
publicMethods.decode = decode;

/*
** #############################
** Helper functions for encoding
** #############################
*/

function ipIsIpv6(ip) {
  if (ip.indexOf(':') != -1) { return true; }
  else if (ip.indexOf('.') != -1) { return false; }
  else {
    throw new Error('Formatting error in IP Address input.' +
      ' ' + 'Contains neither ":" or "."');
  }
}

function splitIp(ip, ipv6) {
  var octetArray, separator, v6Base, numOctets, decimalOctetArray;

  octetArray = [];
  decimalOctetArray = [];
  v6Base = 16;

  if (ipv6) {
    separator = ':';
    numOctets = 8;
  } else {
    separator = '.';
    numOctets = 4;
  }

  /*
  ** Remove newline and space characters
  */
  ip = ip.replace(/[\n\ ]/g, '');
  octetArray = ip.split(separator);

  /*
  ** If IPv6 address is in abbreviated format, we need to replace missing octets with 0
  */
  if (octetArray.length < numOctets) {
    if (ipv6) {
      var numMissingOctets = (numOctets - octetArray.length);

      octetArray = padOctets(octetArray, numMissingOctets);
    } else {
      throw new Error('Formatting error in IP Address input.' +
      ' ' + 'IPv4 address has fewer than 4 octets.');
    }
  }

  /*
  ** Conter IPv6 addresses from hex to decimal
  */
  if (ipv6) {
    for (var i = 0; i < octetArray.length; i++) {
      decimalOctetArray[i] = parseInt(octetArray[i], v6Base);
    }
  } else {
    decimalOctetArray = octetArray;
  }

  return decimalOctetArray;
}

/*
** If IPv6 is abbreviated, pad with appropriate number of 0 octets
*/
function padOctets(octetArray, numMissingOctets) {
  var paddedOctet, aLength;

  paddedOctet = 0;
  aLength = octetArray.length;

  /*
  ** If the first or last octets are blank, zero them
  */
  if (octetArray[0] === '') {
    octetArray[0] = paddedOctet;
  }
  if (octetArray[aLength - 1] === '') {
    octetArray[aLength - 1] = paddedOctet;
  }

  /*
  ** Check the rest of the array for blank octets and pad as needed
  */
  for (var i = 0; i < aLength; i++) {
    if (octetArray[i] === '') {
      octetArray[i] = paddedOctet;

      for (var j = 0; j < numMissingOctets; j++) {
        octetArray.splice(i, 0, paddedOctet);
      }
    }
  }

  return octetArray;
}

/*
** Convert each decimal octet into a factor of the divisor (16 or 256)
** and a remainder
*/
function factorOctets(octetArray, ipv6) {
  var divisor, factoredOctetArray;

  factoredOctetArray = [];

  if (ipv6) {
    divisor = 256;
  } else {
    divisor = 16;
  }

  for (var i = 0; i < octetArray.length; i++) {
    var octetValue, factor1, factor2;

    octetValue = octetArray[i];

    factor1 = octetArray[i] % divisor;
    octetValue = octetValue - factor1;
    factor2 = octetValue / divisor;

    factoredOctetArray.push(factor2);
    factoredOctetArray.push(factor1);
  }

  return factoredOctetArray;
}

function encodeWords(factorArray, ipv6) {
  var key, encodedWordArray;

  encodedWordArray = [];
  key = getKey(ipv6);

  for (var i = 0; i < factorArray.length; i++) {
    var dict;

    dict = key[i];
    encodedWordArray[i] = dict[factorArray[i]];
  }

  return encodedWordArray;
}


/*
** Return an array of dictionaries representing the correct word
** order for the haiku
*/
function getKey(ipv6) {
  var key;

  if (ipv6) {
    key = [ adjectives,
      nouns,
      adjectives,
      nouns,
      verbs,
      adjectives,
      adjectives,
      adjectives,
      adjectives,
      adjectives,
      nouns,
      adjectives,
      nouns,
      verbs,
      adjectives,
      nouns ];
  } else {
    key = [ animalAdjectives,
      animalColors,
      animalNouns,
      animalVerbs,
      natureAdjectives,
      natureNouns,
      plantNouns,
      plantVerbs ];
  }

  return key;
}

function writeHaiku(wordArray, ipv6) {
  var octet, schemaResults, schema, nonWords, haiku;

  octet = 'OCTET'; // String to place in schema to show word slots
  schemaResults = getSchema(ipv6, octet);
  schema = schemaResults[0];
  nonWords = schemaResults[1];

  /*
  ** Replace each instance of 'octet' in the schema with a word from
  ** the encoded word array
  */
  for (var i = 0; i < wordArray.length; i++) {
    for (var j = 0; j < schema.length; j++) {
      if (schema[j] === octet) {
        schema[j] = wordArray[i];
        break;
      }
    }
  }

  /*
  ** Capitalize appropriate words
  */
  schema = capitalizeHaiku(schema);
  haiku = schema.join('');

  return haiku;
}

function getSchema(ipv6, octet) {
  var schema, newLine, period, space, nonWords;

  schema = [];
  newLine = '\n';
  period = '.';
  space = ' ';
  nonWords = [newLine, period, space];

  if (ipv6) {
      schema = [octet,
      octet,
      'and',
      octet,
      octet,
      newLine,
      octet,
      octet,
      octet,
      octet,
      octet,
      octet,
      octet,
      period,
      newLine,
      octet,
      octet,
      octet,
      octet,
      octet,
      period,
      newLine];
  } else {
      schema = ['The',
      octet,
      octet,
      octet,
      newLine,
      octet,
      'in the',
      octet,
      octet,
      period,
      newLine,
      octet,
      octet,
      period,
      newLine];
  }

  /*
  ** Add spaces before words except the first word
  */
  for (var i = 1; i < schema.length; i++) {
      var insertSpace = true;

      /*
      ** If the next entry is a nonWord, don't add a space
      */
      for (var j = 0; j < nonWords.length; j++) {
        if (schema[i] === nonWords[j]) {
            insertSpace = false;
        }
      }

      /*
      ** If the previous entry is a newLine, don't add a space
      */
      if (schema[i - 1] === newLine) {
          insertSpace = false;
      }

      if (insertSpace) {
          schema.splice(i, 0, space);
          i = i + 1;
      }
  }

  return [schema, nonWords];
}

function capitalizeHaiku(haikuArray) {
  var period = '.';

  /*
  ** Always capitalize the first word
  */
  haikuArray[0] = capitalizeWord(haikuArray[0]);

  for (var i = 1; i < haikuArray.length; i++) {

    if (haikuArray[i] === period && i + 2 < haikuArray.length) {
      /*
      ** If the current entry is a period then the next entry will be
      ** a newLine or a space, so check two positions ahead and
      ** capitalize that entry, so long as it's a word
      */
      haikuArray[i + 2] = capitalizeWord(haikuArray[i + 2]);
    }
  }

  return haikuArray;
}

function capitalizeWord(word) {
  word = word.substring(0,1).toUpperCase() +
    word.substring(1, word.length);

  return word;
}

/*
** #############################
** Helper functions for decoding
** #############################
*/

function splitHaiku(haiku) {
  var wordArray;

  haiku = haiku.toLowerCase();

  /*
  ** Replace newline characters with spaces
  */
  haiku = haiku.replace(/\n/g, ' ');

  /*
  ** Remove anything that's not a letter, a space or a dash
  */
  haiku = haiku.replace(/[^a-z\ -]/g, '');
  wordArray = haiku.split(' ');

  /*
  ** Remove any blank entries
  */
  for (var i = 0; i < wordArray.length; i++) {
    if (wordArray[i] === '') {
      wordArray.splice(i, 1);
    }
  }

  return wordArray;
}

function haikuIsIpv6(wordArray) {
  var ipv6, key, dict;

  key = getKey(false);
  dict = key[0];
  ipv6 = true;

  /*
  ** Compare each word in the haiku against each word in the first
  ** dictionary defined in the IPv4 key. If there's a match, the
  ** current haiku is IPv4. If not, IPv6.
  */
  for (var i = 0; i < wordArray.length; i++) {
    var currentWord = wordArray[i];

    for (var j = 0; j < dict.length; j++) {
      if (currentWord === dict[j]) {
          ipv6 = false;
          break;
      }
    }

    if (ipv6 === false) {
      break;
    }
  }

  return ipv6;
}

/*
** Return an array of factors and remainders for each encoded
** octet-value
*/
function getFactors(wordArray, ipv6) {
  var key, factorArray, wordArrayPosition;

  key = getKey(ipv6);
  factorArray = [];
  wordArrayPosition = 0;

  /*
  ** Get the first dictionary from the key. Check the first entry in
  ** the encoded word array to see if it's in that dictionary. If it
  ** is, store the dictionary offset and move onto the next dictionary
  ** and the next word in the encoded words array. If there isn't a
  ** match, keep the same dictionary but check the next word in the
  ** array. Keep going till we have an offset for each dictionary in
  ** the key.
  */
  for (var i = 0; i < key.length; i++) {
    var result, factor, newPosition;

    result = [];
    result = getFactorFromWord(key[i], key.length,
                wordArray, wordArrayPosition);
    factor = result[0];
    newPosition = result[1];
    wordArrayPosition = newPosition;

    factorArray.push(factor);
  }

  return factorArray;
}

function getFactorFromWord(dict, maxLength, words, position) {
  var factor = null;

  for (var j = 0; j < dict.length; j++) {
    var dictEntryLength, wordToCheck;

    /*
    ** Get the number of words in the dictionary entry
    */
    dictEntryLength = dict[j].split(' ').length;

    /*
    ** build a string to compare against the dictionary entry
    ** by joining the appropriate number of wordArray entries
    */
    wordToCheck =
      words.slice(position, position + dictEntryLength);
    wordToCheck = wordToCheck.join(' ');

    if (dict[j] === wordToCheck) {
      factor = j;

      /*
      ** If the dictionary entry word count is greater than one,
      ** increment the position counter by the difference to
      ** avoid rechecking words we've already checkced
      */
      position = position + (dictEntryLength - 1);
      break;
    }
  }

  position = position + 1;

  if (factor === null) {
    if (position >= maxLength) {
      /*
      ** We've reached the entry of the haiku and still not matched
      ** all necessary dictionaries, so throw an error
      */
      throw new Error('Decoding error: one or more dictionary words' +
                       'missing from input haiku');
    } else {
      /*
      ** Couldn't find the current word in the current dictionary,
      ** try the next word
      */
      return getFactorFromWord(dict, maxLength, words, position);
    }
  } else {
    /*
    ** Found the word - return the dictionary offset and the new
    ** word array position
    */
    return [factor, position];
  }
}

function getOctets(factorArray, ipv6) {
  var octetArray, multiplier;

  octetArray = [];
  if (ipv6) {
    multiplier = 256;
  } else {
    multiplier = 16;
  }

  for (var i = 0; i < factorArray.length; i = i + 2) {
    var factor1, factor2, octet;

    factor1 = factorArray[i];
    factor2 = factorArray[i + 1];
    octet = (factor1 * multiplier) + factor2;

    if (ipv6) {
      octet = octet.toString(16);
    }

    octetArray.push(octet);
  }

  return octetArray;
}

function getIpString(octetArray, ipv6) {
  var ipString, separator;

  ipString = '';

  if (ipv6) {
    separator = ':';
  } else {
    separator = '.';
  }

  for (var i = 0; i < octetArray.length; i++) {
    if (i > 0) {
      ipString += separator;
    }
    ipString += octetArray[i];
  }

  return ipString;
}

/*
** ############
** Dictionaries
** ############
*/

var adjectives, nouns, verbs, animalAdjectives, animalColors,
animalNouns, animalVerbs, natureAdjectives, natureNouns,
plantNouns, plantVerbs;

/*
** IPv4 dictionaries
*/

animalAdjectives = ['agile',
  'bashful',
  'clever',
  'clumsy',
  'drowsy',
  'fearful',
  'graceful',
  'hungry',
  'lonely',
  'morose',
  'placid',
  'ruthless',
  'silent',
  'thoughtful',
  'vapid',
  'weary'];

animalColors = ['beige',
  'black',
  'blue',
  'bright',
  'bronze',
  'brown',
  'dark',
  'drab',
  'green',
  'gold',
  'grey',
  'jade',
  'pale',
  'pink',
  'red',
  'white'];

animalNouns = ['ape',
  'bear',
  'crow',
  'dove',
  'frog',
  'goat',
  'hawk',
  'lamb',
  'mouse',
  'newt',
  'owl',
  'pig',
  'rat',
  'snake',
  'toad',
  'wolf'];

animalVerbs = ['aches',
  'basks',
  'cries',
  'dives',
  'eats',
  'fights',
  'groans',
  'hunts',
  'jumps',
  'lies',
  'prowls',
  'runs',
  'sleeps',
  'thrives',
  'wakes',
  'yawns'];

natureAdjectives = ['ancient',
  'barren',
  'blazing',
  'crowded',
  'distant',
  'empty',
  'foggy',
  'fragrant',
  'frozen',
  'moonlit',
  'peaceful',
  'quiet',
  'rugged',
  'serene',
  'sunlit',
  'wind-swept'];

natureNouns = ['canyon',
  'clearing',
  'desert',
  'foothills',
  'forest',
  'grasslands',
  'jungle',
  'meadow',
  'mountains',
  'prairie',
  'river',
  'rockpool',
  'sand-dune',
  'tundra',
  'valley',
  'wetlands'];

plantNouns = ['autumn colors',
  'cherry blossoms',
  'chrysanthemums',
  'crabapple blooms',
  'the dry palm fronds',
  'fat horse chestnuts',
  'forget-me-nots',
  'jasmine petals',
  'lotus flowers',
  'ripe blackberries',
  'the maple seeds',
  'the pine needles',
  'tiger lillies',
  'water lillies',
  'willow branches',
  'yellowwood leaves'];

plantVerbs = ['blow',
  'crunch',
  'dance',
  'drift',
  'drop',
  'fall',
  'grow',
  'pile',
  'rest',
  'roll',
  'show',
  'spin',
  'stir',
  'sway',
  'turn',
  'twist'];

/*
** IPv6 dictionaries
*/

adjectives = ['ace',
  'apt',
  'arched',
  'ash',
  'bad',
  'bare',
  'beige',
  'big',
  'black',
  'bland',
  'bleak',
  'blond',
  'blue',
  'blunt',
  'blush',
  'bold',
  'bone',
  'both',
  'bound',
  'brash',
  'brass',
  'brave',
  'brief',
  'brisk',
  'broad',
  'bronze',
  'brushed',
  'burned',
  'calm',
  'ceil',
  'chaste',
  'cheap',
  'chilled',
  'clean',
  'coarse',
  'cold',
  'cool',
  'corn',
  'crass',
  'crazed',
  'cream',
  'crisp',
  'crude',
  'cruel',
  'cursed',
  'cute',
  'daft',
  'damp',
  'dark',
  'dead',
  'deaf',
  'dear',
  'deep',
  'dense',
  'dim',
  'drab',
  'dry',
  'dull',
  'faint',
  'fair',
  'fake',
  'false',
  'famed',
  'far',
  'fast',
  'fat',
  'fierce',
  'fine',
  'firm',
  'flat',
  'flawed',
  'fond',
  'foul',
  'frail',
  'free',
  'fresh',
  'full',
  'fun',
  'glum',
  'good',
  'grave',
  'gray',
  'great',
  'green',
  'grey',
  'grim',
  'gruff',
  'hard',
  'harsh',
  'high',
  'hoarse',
  'hot',
  'huge',
  'hurt',
  'ill',
  'jade',
  'jet',
  'jinxed',
  'keen',
  'kind',
  'lame',
  'lank',
  'large',
  'last',
  'late',
  'lean',
  'lewd',
  'light',
  'limp',
  'live',
  'loath',
  'lone',
  'long',
  'loose',
  'lost',
  'louche',
  'loud',
  'low',
  'lush',
  'mad',
  'male',
  'masked',
  'mean',
  'meek',
  'mild',
  'mint',
  'moist',
  'mute',
  'near',
  'neat',
  'new',
  'nice',
  'nude',
  'numb',
  'odd',
  'old',
  'pained',
  'pale',
  'peach',
  'pear',
  'peeved',
  'pink',
  'piqued',
  'plain',
  'plum',
  'plump',
  'plush',
  'poor',
  'posed',
  'posh',
  'prim',
  'prime',
  'prompt',
  'prone',
  'proud',
  'prune',
  'puce',
  'pure',
  'quaint',
  'quartz',
  'quick',
  'rare',
  'raw',
  'real',
  'red',
  'rich',
  'ripe',
  'rough',
  'rude',
  'rushed',
  'rust',
  'sad',
  'safe',
  'sage',
  'sane',
  'scorched',
  'shaped',
  'sharp',
  'sheared',
  'short',
  'shrewd',
  'shrill',
  'shrunk',
  'shy',
  'sick',
  'skilled',
  'slain',
  'slick',
  'slight',
  'slim',
  'slow',
  'small',
  'smart',
  'smooth',
  'smug',
  'snide',
  'snug',
  'soft',
  'sore',
  'sought',
  'sour',
  'spare',
  'sparse',
  'spent',
  'spoilt',
  'spry',
  'squat',
  'staid',
  'stale',
  'stark',
  'staunch',
  'steep',
  'stiff',
  'strange',
  'straw',
  'stretched',
  'strict',
  'striped',
  'strong',
  'suave',
  'sure',
  'svelte',
  'swank',
  'sweet',
  'swift',
  'tall',
  'tame',
  'tan',
  'tart',
  'taut',
  'teal',
  'terse',
  'thick',
  'thin',
  'tight',
  'tiny',
  'tired',
  'toothed',
  'torn',
  'tough',
  'trim',
  'trussed',
  'twin',
  'used',
  'vague',
  'vain',
  'vast',
  'veiled',
  'vexed',
  'vile',
  'warm',
  'weak',
  'webbed',
  'wrong',
  'wry',
  'young'];

nouns = ['ants',
  'apes',
  'asps',
  'balls',
  'barb',
  'barbs',
  'bass',
  'bats',
  'beads',
  'beaks',
  'bears',
  'bees',
  'bells',
  'belts',
  'birds',
  'blades',
  'blobs',
  'blooms',
  'boars',
  'boats',
  'bolts',
  'books',
  'bowls',
  'boys',
  'bream',
  'brides',
  'broods',
  'brooms',
  'brutes',
  'bucks',
  'bulbs',
  'bulls',
  'burls',
  'cakes',
  'calves',
  'capes',
  'cats',
  'char',
  'chests',
  'choirs',
  'clams',
  'clans',
  'clouds',
  'clowns',
  'cod',
  'coins',
  'colts',
  'cones',
  'cords',
  'cows',
  'crabs',
  'cranes',
  'crows',
  'cults',
  'czars',
  'darts',
  'dates',
  'deer',
  'dholes',
  'dice',
  'discs',
  'does',
  'dogs',
  'doors',
  'dopes',
  'doves',
  'drakes',
  'dreams',
  'drones',
  'ducks',
  'dunes',
  'eels',
  'eggs',
  'elk',
  'elks',
  'elms',
  'elves',
  'ewes',
  'eyes',
  'faces',
  'facts',
  'fawns',
  'feet',
  'ferns',
  'fish',
  'fists',
  'flames',
  'fleas',
  'flocks',
  'flutes',
  'foals',
  'foes',
  'fools',
  'fowl',
  'frogs',
  'fruits',
  'gangs',
  'gar',
  'geese',
  'gems',
  'germs',
  'ghosts',
  'gnomes',
  'goats',
  'grapes',
  'grooms',
  'grouse',
  'grubs',
  'guards',
  'gulls',
  'hands',
  'hares',
  'hawks',
  'heads',
  'hearts',
  'hens',
  'herbs',
  'hills',
  'hogs',
  'holes',
  'hordes',
  'ide',
  'jars',
  'jays',
  'kids',
  'kings',
  'kites',
  'lads',
  'lakes',
  'lambs',
  'larks',
  'lice',
  'lights',
  'limbs',
  'looms',
  'loons',
  'mares',
  'masks',
  'mice',
  'mimes',
  'minks',
  'mists',
  'mites',
  'mobs',
  'molds',
  'moles',
  'moons',
  'moths',
  'newts',
  'nymphs',
  'orbs',
  'orcs',
  'owls',
  'pearls',
  'pears',
  'peas',
  'perch',
  'pigs',
  'pikes',
  'pines',
  'plains',
  'plants',
  'plums',
  'pools',
  'prawns',
  'prunes',
  'pugs',
  'punks',
  'quail',
  'quails',
  'queens',
  'quills',
  'rafts',
  'rains',
  'rams',
  'rats',
  'rays',
  'ribs',
  'rocks',
  'rooks',
  'ruffs',
  'runes',
  'sands',
  'seals',
  'seas',
  'seeds',
  'serfs',
  'shards',
  'sharks',
  'sheep',
  'shells',
  'ships',
  'shoals',
  'shrews',
  'shrimp',
  'skate',
  'skies',
  'skunks',
  'sloths',
  'slugs',
  'smew',
  'smiles',
  'snails',
  'snakes',
  'snipes',
  'sole',
  'songs',
  'spades',
  'sprats',
  'sprouts',
  'squabs',
  'squads',
  'squares',
  'squid',
  'stars',
  'stoats',
  'stones',
  'storks',
  'strays',
  'suns',
  'swans',
  'swarms',
  'swells',
  'swifts',
  'tars',
  'teams',
  'teeth',
  'terns',
  'thorns',
  'threads',
  'thrones',
  'ticks',
  'toads',
  'tools',
  'trees',
  'tribes',
  'trolls',
  'trout',
  'tunes',
  'tusks',
  'veins',
  'verbs',
  'vines',
  'voles',
  'wasps',
  'waves',
  'wells',
  'whales',
  'whelks',
  'whiffs',
  'winds',
  'wolves',
  'worms',
  'wraiths',
  'wrens',
  'yaks'];

verbs = ['aid',
  'arm',
  'awe',
  'axe',
  'bag',
  'bait',
  'bare',
  'bash',
  'bathe',
  'beat',
  'bid',
  'bilk',
  'blame',
  'bleach',
  'bleed',
  'bless',
  'bluff',
  'blur',
  'boast',
  'boost',
  'boot',
  'bore',
  'botch',
  'breed',
  'brew',
  'bribe',
  'brief',
  'brine',
  'broil',
  'browse',
  'bruise',
  'build',
  'burn',
  'burst',
  'call',
  'calm',
  'carve',
  'chafe',
  'chant',
  'charge',
  'chart',
  'cheat',
  'check',
  'cheer',
  'chill',
  'choke',
  'chomp',
  'choose',
  'churn',
  'cite',
  'clamp',
  'clap',
  'clasp',
  'claw',
  'clean',
  'cleanse',
  'clip',
  'cloak',
  'clone',
  'clutch',
  'coax',
  'crack',
  'crave',
  'crunch',
  'cry',
  'cull',
  'cure',
  'curse',
  'cuss',
  'dare',
  'daze',
  'dent',
  'dig',
  'ding',
  'doubt',
  'dowse',
  'drag',
  'drain',
  'drape',
  'draw',
  'dread',
  'dredge',
  'drill',
  'drink',
  'drip',
  'drive',
  'drop',
  'drown',
  'dry',
  'dump',
  'eat',
  'etch',
  'face',
  'fail',
  'fault',
  'fear',
  'feed',
  'feel',
  'fetch',
  'fight',
  'find',
  'fix',
  'flap',
  'flay',
  'flee',
  'fling',
  'flip',
  'float',
  'foil',
  'forge',
  'free',
  'freeze',
  'frisk',
  'gain',
  'glimpse',
  'gnaw',
  'goad',
  'gouge',
  'grab',
  'grasp',
  'graze',
  'grieve',
  'grip',
  'groom',
  'guard',
  'guards',
  'guide',
  'gulp',
  'gush',
  'halt',
  'harm',
  'hate',
  'haul',
  'haunt',
  'have',
  'heal',
  'hear',
  'help',
  'herd',
  'hex',
  'hire',
  'hit',
  'hoist',
  'hound',
  'hug',
  'hurl',
  'irk',
  'jab',
  'jeer',
  'join',
  'jolt',
  'keep',
  'kick',
  'kill',
  'kiss',
  'lash',
  'leash',
  'leave',
  'lift',
  'like',
  'love',
  'lug',
  'lure',
  'maim',
  'make',
  'mask',
  'meet',
  'melt',
  'mend',
  'miss',
  'mould',
  'move',
  'nab',
  'name',
  'need',
  'oust',
  'paint',
  'paw',
  'pay',
  'peck',
  'peeve',
  'pelt',
  'please',
  'pluck',
  'poach',
  'poll',
  'praise',
  'prick',
  'print',
  'probe',
  'prod',
  'prompt',
  'punch',
  'quash',
  'quell',
  'quote',
  'raid',
  'raise',
  'raze',
  'ride',
  'roast',
  'rouse',
  'rule',
  'scald',
  'scalp',
  'scar',
  'scathe',
  'score',
  'scorn',
  'scour',
  'scuff',
  'sear',
  'see',
  'seek',
  'seize',
  'send',
  'sense',
  'serve',
  'shake',
  'shear',
  'shift',
  'shoot',
  'shun',
  'slap',
  'slay',
  'slice',
  'smack',
  'smash',
  'smell',
  'smite',
  'snare',
  'snatch',
  'sniff',
  'snub',
  'soak',
  'spare',
  'splash',
  'split',
  'spook',
  'spray',
  'squash',
  'squeeze',
  'stab',
  'stain',
  'starve',
  'steal',
  'steer',
  'sting',
  'strike',
  'stun',
  'tag',
  'tame',
  'taste',
  'taunt',
  'teach',
  'tend'];

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = publicMethods;
} else {
  return publicMethods;
}

})();
