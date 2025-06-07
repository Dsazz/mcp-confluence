/**
 * Domain Handlers Factory
 *
 * Creates and configures domain handlers with proper dependency injection
 */

import { logger } from "@core/logging";

import { createHttpClient } from "../client";
import { createConfluenceConfigFromEnv } from "../client/config";
import {
  CreatePageHandler,
  CreatePageUseCase,
  GetChildPagesHandler,
  GetChildPagesUseCase,
  GetPageByIdUseCase,
  GetPageHandler,
  GetPagesBySpaceHandler,
  GetPagesBySpaceUseCase,
  PageRepositoryImpl,
  SearchPagesHandler,
  SearchPagesUseCase,
  UpdatePageHandler,
  UpdatePageUseCase,
} from "../domains/pages";
import {
  SearchContentHandler,
  SearchContentUseCase,
  SearchRepositoryImpl,
} from "../domains/search";
// Import domain components
import {
  GetAllSpacesUseCase,
  GetSpaceByIdHandler,
  GetSpaceByIdUseCase,
  GetSpaceByKeyHandler,
  GetSpaceByKeyUseCase,
  GetSpacesHandler,
  SpaceRepositoryImpl,
} from "../domains/spaces";

/**
 * Domain handlers interface
 */
export interface DomainHandlers {
  spaces: {
    getSpaces: GetSpacesHandler;
    getSpaceByKey: GetSpaceByKeyHandler;
    getSpaceById: GetSpaceByIdHandler;
  };
  pages: {
    getPage: GetPageHandler;
    createPage: CreatePageHandler;
    updatePage: UpdatePageHandler;
    searchPages: SearchPagesHandler;
    getPagesBySpace: GetPagesBySpaceHandler;
    getChildPages: GetChildPagesHandler;
  };
  search: {
    searchContent: SearchContentHandler;
  };
}

/**
 * Create domain handlers with dependency injection
 */
export function createDomainHandlers(): DomainHandlers {
  try {
    // Initialize configuration and HTTP client
    const config = createConfluenceConfigFromEnv();
    const httpClient = createHttpClient(config, { apiVersion: "v2" });

    // Initialize repositories
    const spaceRepository = new SpaceRepositoryImpl(httpClient);
    const pageRepository = new PageRepositoryImpl(httpClient);
    const searchRepository = new SearchRepositoryImpl(httpClient);

    // Initialize use cases
    const getAllSpacesUseCase = new GetAllSpacesUseCase(spaceRepository);
    const getSpaceByKeyUseCase = new GetSpaceByKeyUseCase(spaceRepository);
    const getSpaceByIdUseCase = new GetSpaceByIdUseCase(spaceRepository);
    const getPageUseCase = new GetPageByIdUseCase(pageRepository);
    const createPageUseCase = new CreatePageUseCase(pageRepository);
    const updatePageUseCase = new UpdatePageUseCase(pageRepository);
    const searchPagesUseCase = new SearchPagesUseCase(pageRepository);
    const getPagesBySpaceUseCase = new GetPagesBySpaceUseCase(pageRepository);
    const getChildPagesUseCase = new GetChildPagesUseCase(pageRepository);
    const searchContentUseCase = new SearchContentUseCase(searchRepository);

    // Initialize handlers
    const getSpacesHandler = new GetSpacesHandler(getAllSpacesUseCase);
    const getSpaceByKeyHandler = new GetSpaceByKeyHandler(getSpaceByKeyUseCase);
    const getSpaceByIdHandler = new GetSpaceByIdHandler(getSpaceByIdUseCase);
    const getPageHandler = new GetPageHandler(getPageUseCase);
    const createPageHandler = new CreatePageHandler(createPageUseCase);
    const updatePageHandler = new UpdatePageHandler(updatePageUseCase);
    const searchPagesHandler = new SearchPagesHandler(searchPagesUseCase);
    const getPagesBySpaceHandler = new GetPagesBySpaceHandler(
      getPagesBySpaceUseCase,
    );
    const getChildPagesHandler = new GetChildPagesHandler(getChildPagesUseCase);
    const searchContentHandler = new SearchContentHandler(searchContentUseCase);

    return {
      spaces: {
        getSpaces: getSpacesHandler,
        getSpaceByKey: getSpaceByKeyHandler,
        getSpaceById: getSpaceByIdHandler,
      },
      pages: {
        getPage: getPageHandler,
        createPage: createPageHandler,
        updatePage: updatePageHandler,
        searchPages: searchPagesHandler,
        getPagesBySpace: getPagesBySpaceHandler,
        getChildPages: getChildPagesHandler,
      },
      search: {
        searchContent: searchContentHandler,
      },
    };
  } catch (error) {
    logger.error("Failed to create domain handlers:", {
      prefix: "CONFLUENCE",
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
