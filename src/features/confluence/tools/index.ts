// Tool parameter types
export type {
  GetSpacesParams,
  GetPageParams,
  SearchPagesParams,
  CreatePageParams,
  UpdatePageParams,
  ConfluenceToolName,
} from "./tools.types";

export { CONFLUENCE_TOOLS } from "./tools.types";

// Tool handlers
export { ConfluenceGetSpacesHandler } from "./handlers/get-spaces.handler";
export { ConfluenceGetPageHandler } from "./handlers/get-page.handler";
export { ConfluenceSearchPagesHandler } from "./handlers/search-pages.handler";
export { ConfluenceCreatePageHandler } from "./handlers/create-page.handler";
export { ConfluenceUpdatePageHandler } from "./handlers/update-page.handler";

// Tool factory
export type { ConfluenceTools } from "./tools.factory";
export { createConfluenceTools } from "./tools.factory";

// Tool schemas
export {
  pageIdSchema,
  spaceKeySchema,
  getSpacesSchema,
  getPageSchema,
  searchPagesSchema,
  createPageSchema,
  updatePageSchema,
} from "./tools.schemas";
