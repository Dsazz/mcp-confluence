/**
 * Use Case Factories
 *
 * Factory functions for creating page use-cases with proper dependencies
 */

import type { SpaceRepository } from "../../spaces/models";
import type { PageRepository } from "../models";
import {
  CreatePageUseCase,
  DeletePageUseCase,
  GetChildPagesUseCase,
  GetPageByIdUseCase,
  GetPageVersionUseCase,
  GetPagesBySpaceUseCase,
  SearchPagesUseCase,
  UpdatePageUseCase,
} from "./index";

/**
 * Dependencies for page use-cases
 */
export interface PageUseCaseDependencies {
  pageRepository: PageRepository;
  spaceRepository?: SpaceRepository;
}

/**
 * Factory for creating GetPageByIdUseCase with full dependencies
 */
export function createGetPageByIdUseCase(
  dependencies: PageUseCaseDependencies,
): GetPageByIdUseCase {
  return new GetPageByIdUseCase(
    dependencies.pageRepository,
    dependencies.spaceRepository,
  );
}

/**
 * Factory for creating CreatePageUseCase with full dependencies
 */
export function createCreatePageUseCase(
  dependencies: PageUseCaseDependencies,
): CreatePageUseCase {
  return new CreatePageUseCase(
    dependencies.pageRepository,
    dependencies.spaceRepository,
  );
}

/**
 * Factory for creating UpdatePageUseCase with full dependencies
 */
export function createUpdatePageUseCase(
  dependencies: PageUseCaseDependencies,
): UpdatePageUseCase {
  return new UpdatePageUseCase(
    dependencies.pageRepository,
    dependencies.spaceRepository,
  );
}

/**
 * Factory for creating DeletePageUseCase
 */
export function createDeletePageUseCase(
  dependencies: PageUseCaseDependencies,
): DeletePageUseCase {
  return new DeletePageUseCase(dependencies.pageRepository);
}

/**
 * Factory for creating SearchPagesUseCase
 */
export function createSearchPagesUseCase(
  dependencies: PageUseCaseDependencies,
): SearchPagesUseCase {
  return new SearchPagesUseCase(dependencies.pageRepository);
}

/**
 * Factory for creating GetPagesBySpaceUseCase
 */
export function createGetPagesBySpaceUseCase(
  dependencies: PageUseCaseDependencies,
): GetPagesBySpaceUseCase {
  return new GetPagesBySpaceUseCase(dependencies.pageRepository);
}

/**
 * Factory for creating GetChildPagesUseCase
 */
export function createGetChildPagesUseCase(
  dependencies: PageUseCaseDependencies,
): GetChildPagesUseCase {
  return new GetChildPagesUseCase(dependencies.pageRepository);
}

/**
 * Factory for creating GetPageVersionUseCase
 */
export function createGetPageVersionUseCase(
  dependencies: PageUseCaseDependencies,
): GetPageVersionUseCase {
  return new GetPageVersionUseCase(dependencies.pageRepository);
}

/**
 * Factory for creating all page use-cases at once
 */
export function createPageUseCases(dependencies: PageUseCaseDependencies) {
  return {
    getPageById: createGetPageByIdUseCase(dependencies),
    createPage: createCreatePageUseCase(dependencies),
    updatePage: createUpdatePageUseCase(dependencies),
    deletePage: createDeletePageUseCase(dependencies),
    searchPages: createSearchPagesUseCase(dependencies),
    getPagesBySpace: createGetPagesBySpaceUseCase(dependencies),
    getChildPages: createGetChildPagesUseCase(dependencies),
    getPageVersion: createGetPageVersionUseCase(dependencies),
  };
}
