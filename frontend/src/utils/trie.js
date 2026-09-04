/**
 * Trie (Prefix Tree) Data Structure for Fast Keyword / Autocomplete Matching
 */

export class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.originalWord = null;
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Insert a word into the Trie.
   * Case-insensitive indexing while preserving the canonical casing.
   */
  insert(word) {
    if (!word || typeof word !== 'string') return;
    const cleanWord = word.trim();
    if (!cleanWord) return;

    let node = this.root;
    const normalized = cleanWord.toLowerCase();

    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }

    node.isEndOfWord = true;
    node.originalWord = cleanWord;
  }

  /**
   * Search for all words matching the given prefix.
   * @param {string} prefix - Search prefix
   * @param {number} limit - Maximum number of results to return
   * @returns {string[]} Array of matching original words
   */
  searchPrefix(prefix, limit = 8) {
    if (!prefix || typeof prefix !== 'string') return [];
    const normalizedPrefix = prefix.toLowerCase().trim();
    if (!normalizedPrefix) return [];

    let node = this.root;

    // Navigate to the end of the prefix
    for (let i = 0; i < normalizedPrefix.length; i++) {
      const char = normalizedPrefix[i];
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }

    // Collect all words under this node up to limit
    const results = [];
    this._collectWords(node, results, limit);
    return results;
  }

  /**
   * Helper method to perform DFS and collect words from a given node.
   */
  _collectWords(node, results, limit) {
    if (results.length >= limit) return;

    if (node.isEndOfWord && node.originalWord) {
      results.push(node.originalWord);
    }

    // Sort child keys alphabetically for consistent deterministic ordering
    const sortedKeys = Object.keys(node.children).sort();
    for (const char of sortedKeys) {
      if (results.length >= limit) break;
      this._collectWords(node.children[char], results, limit);
    }
  }

  /**
   * Check if a word exists in the Trie.
   */
  contains(word) {
    if (!word || typeof word !== 'string') return false;
    const normalized = word.toLowerCase().trim();
    let node = this.root;

    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];
      if (!node.children[char]) return false;
      node = node.children[char];
    }

    return node.isEndOfWord;
  }

  /**
   * Factory method to build and populate a Trie from an array of words.
   * @param {string[]} words
   * @returns {Trie}
   */
  static fromArray(words) {
    const trie = new Trie();
    if (Array.isArray(words)) {
      for (const word of words) {
        trie.insert(word);
      }
    }
    return trie;
  }
}

export default Trie;
