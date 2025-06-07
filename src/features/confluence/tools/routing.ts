/**
 * Tool Routing
 *
 * Routes MCP tool calls to appropriate domain handlers
 */

import type { DomainHandlers } from "./handlers";

import { SPACES_TOOL_NAMES } from "../domains/spaces/mcp-tools";
// Import domain types for proper type casting
import type {
  GetSpaceByIdRequest,
  GetSpaceByKeyRequest,
  GetSpacesRequest,
} from "../domains/spaces/models";

import { PAGES_TOOL_NAMES } from "../domains/pages/mcp-tools";
import type {
  CreatePageRequest,
  GetChildPagesRequest,
  GetPageRequest,
  GetPagesBySpaceRequest,
  UpdatePageRequest,
} from "../domains/pages/models";

import { SEARCH_TOOL_NAMES } from "../domains/search/mcp-tools";
import type { SearchContentRequest } from "../domains/search/models";

/**
 * Route tool call to appropriate domain handler
 */
export async function routeToolCall(
  toolName: string,
  args: unknown,
  domainHandlers: DomainHandlers,
): Promise<unknown> {
  switch (toolName) {
    case SPACES_TOOL_NAMES.GET_SPACES:
      return await domainHandlers.spaces.getSpaces.handle(
        args as GetSpacesRequest,
      );

    case SPACES_TOOL_NAMES.GET_SPACE_BY_KEY:
      return await domainHandlers.spaces.getSpaceByKey.handle(
        (args as GetSpaceByKeyRequest).key,
      );

    case SPACES_TOOL_NAMES.GET_SPACE_BY_ID:
      return await domainHandlers.spaces.getSpaceById.handle(
        (args as GetSpaceByIdRequest).id,
      );

    case PAGES_TOOL_NAMES.GET_PAGE:
      return await domainHandlers.pages.getPage.handle(args as GetPageRequest);

    case PAGES_TOOL_NAMES.CREATE_PAGE:
      return await domainHandlers.pages.createPage.handle(
        args as CreatePageRequest,
      );

    case PAGES_TOOL_NAMES.UPDATE_PAGE:
      return await domainHandlers.pages.updatePage.handle(
        args as UpdatePageRequest,
      );

    case PAGES_TOOL_NAMES.GET_PAGES_BY_SPACE:
      return await domainHandlers.pages.getPagesBySpace.handle(
        (args as GetPagesBySpaceRequest).spaceId,
        {
          limit: (args as GetPagesBySpaceRequest).limit,
          start: (args as GetPagesBySpaceRequest).start,
        },
      );

    case PAGES_TOOL_NAMES.GET_CHILD_PAGES:
      return await domainHandlers.pages.getChildPages.handle(
        (args as GetChildPagesRequest).parentPageId,
        {
          limit: (args as GetChildPagesRequest).limit,
          start: (args as GetChildPagesRequest).start,
        },
      );

    case SEARCH_TOOL_NAMES.SEARCH:
      return await domainHandlers.search.searchContent.handle(
        args as SearchContentRequest,
      );

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
