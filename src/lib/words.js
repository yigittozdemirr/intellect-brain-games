/**
 * English word list for Word Scramble game.
 * Organized by length for level scaling.
 */

const WORDS_4 = [
  "game","play","mind","code","jump","fast","word","flip","blue","star",
  "fire","tree","moon","gold","coin","hero","luck","spin","math","grid",
  "quiz","rush","find","sort","swap","link","draw","drop","push","pull",
  "rain","snow","wind","bird","fish","frog","bear","wolf","lion","duck",
  "book","read","song","bell","drum","lamp","door","wall","path","road",
];

const WORDS_5 = [
  "brain","smart","think","focus","speed","match","score","combo","pixel",
  "level","power","flash","quick","blitz","chain","burst","quest","crown",
  "light","spark","storm","cloud","heart","magic","tower","sword","stone",
  "dream","world","ocean","river","plant","earth","flame","frost","dance",
  "music","paint","color","smile","happy","brave","noble","royal","ghost",
  "robot","ninja","pirate","angel","giant",
];

const WORDS_6 = [
  "puzzle","memory","reflex","streak","master","rocket","dragon","shield",
  "trophy","battle","castle","forest","island","planet","desert","jungle",
  "temple","bridge","garden","market","palace","cavern","spirit","energy",
  "silver","golden","bronze","copper","meteor","comet","nebula","galaxy",
  "breeze","autumn","winter","spring","summer","frozen","molten","shadow",
  "nature","circle","square","bounce","launch","action","motion","target",
];

const WORDS_7 = [
  "connect","pattern","sequence","reflect","balance","explore","journey",
  "fantasy","kingdom","crystal","diamond","emerald","mystery","thunder",
  "monster","warrior","soldier","captain","ancient","horizon","volcano",
  "tornado","cyclone","rainbow","blossom","dolphin","penguin","giraffe",
  "panther","leopard","cheetah","courage","freedom","justice","harmony",
  "triumph","digital","network","problem","science","thought","imagine",
];

const WORDS_8 = [
  "thinking","learning","training","building","creating","discover",
  "remember","multiply","strategy","progress","platform","treasure",
  "mountain","waterful","electric","magnetic","firework","moonlight",
  "stardust","midnight","starfish","elephant","hedgehog","kangaroo",
  "dinosaur","champion","language","question","abstract","concrete",
];

export const WORD_LISTS = {
  4: WORDS_4,
  5: WORDS_5,
  6: WORDS_6,
  7: WORDS_7,
  8: WORDS_8,
};

/** Get a word list for a given level (level determines min word length) */
export function getWordsForLevel(level) {
  const length = Math.min(4 + Math.floor((level - 1) / 2), 8);
  return { words: WORD_LISTS[length] || WORDS_4, length };
}
