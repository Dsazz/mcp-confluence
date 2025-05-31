/**
 * Confluence Tools Factory
 *
 * Creates instances of all Confluence tool handlers
 */

import type { ConfluenceClient } from "../api/index";
import { ConfluenceGetSpacesHandler } from "./handlers/get-spaces.handler";
import { ConfluenceGetPageHandler } from "./handlers/get-page.handler";
import { ConfluenceSearchPagesHandler } from "./handlers/search-pages.handler";
import { ConfluenceCreatePageHandler } from "./handlers/create-page.handler";
import { ConfluenceUpdatePageHandler } from "./handlers/update-page.handler";

/**
 * Interface for the collection of Confluence tools
 */
export interface ConfluenceTools {
  getSpaces: ConfluenceGetSpacesHandler;
  getPage: ConfluenceGetPageHandler;
  searchPages: ConfluenceSearchPagesHandler;
  createPage: ConfluenceCreatePageHandler;
  updatePage: ConfluenceUpdatePageHandler;
}

/**
 * Creates instances of all Confluence tool handlers
 *
 * @param client - The Confluence client instance
 * @returns Object containing all tool handler instances
 */
export function createConfluenceTools(client: ConfluenceClient): ConfluenceTools {
  return {
    getSpaces: new ConfluenceGetSpacesHandler(client),
    getPage: new ConfluenceGetPageHandler(client),
    searchPages: new ConfluenceSearchPagesHandler(client),
    createPage: new ConfluenceCreatePageHandler(client),
    updatePage: new ConfluenceUpdatePageHandler(client),
  };
} 