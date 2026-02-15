import { Filter } from "bad-words";

const filter = new Filter();

/**
 * Filters out swear words and inappropriate language
 * @param {string} text - The text to filter
 * @returns {string} - The filtered text with swear words replaced with ***
 */
export const filterBadWords = (text) => {
  if (!text || typeof text !== "string") return text;
  return filter.clean(text);
};

/**
 * Checks if text contains inappropriate words
 * @param {string} text - The text to check
 * @returns {boolean} - True if text contains bad words
 */
export const containsBadWords = (text) => {
  if (!text || typeof text !== "string") return false;
  return filter.isProfane(text);
};
