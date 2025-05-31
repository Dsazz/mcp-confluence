import type {
  Space,
  Page,
  SearchResult,
  Comment,
  PaginationInfo,
  ResponseMetadata,
} from "../../features/confluence/api/confluence.models.types.js";
import type {
  ConfluenceApiSpacesResponse,
  ConfluenceApiSearchResponse,
  ToolErrorResponse,
} from "../../features/confluence/api/confluence.responses.types.js";
import type {
  BuildableMockFactory,
  MockFactory,
  ErrorMockFactory,
} from "./mock-factory.interfaces.js";

// Confluence API Mock Factory Registry Interface
export interface ConfluenceApiMockRegistry {
  pages: BuildableMockFactory<Page>;
  spaces: BuildableMockFactory<Space>;
  searchResults: BuildableMockFactory<SearchResult>;
  comments: BuildableMockFactory<Comment>;
  pagination: MockFactory<PaginationInfo>;
  metadata: MockFactory<ResponseMetadata>;
  apiResponses: {
    spaces: MockFactory<ConfluenceApiSpacesResponse>;
    search: MockFactory<ConfluenceApiSearchResponse>;
  };
  errors: ErrorMockFactory<ToolErrorResponse>;
}

// HTTP Response Mock Factory Interface
export interface HttpResponseMockFactory {
  success<T>(data: T, status?: number): HttpResponse<T>;
  error(status: number, message: string, details?: Record<string, unknown>): HttpResponse<ErrorResponseData>;
  notFound(resource: string): HttpResponse<ErrorResponseData>;
  unauthorized(message?: string): HttpResponse<ErrorResponseData>;
  forbidden(action: string, resource: string): HttpResponse<ErrorResponseData>;
  serverError(message?: string): HttpResponse<ErrorResponseData>;
}

// Error response data structure
export interface ErrorResponseData {
  error: {
    code: string;
    message: string;
    details?: string;
  };
  timestamp: string;
  requestId: string;
}

// Generic HTTP Response type for mocking
export interface HttpResponse<T = Record<string, unknown>> {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
  config?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
  };
}

// Confluence API Error type for comprehensive error testing
export interface ConfluenceApiError {
  type: string;
  status: number;
  code: string;
  message: string;
  details: string;
  timestamp: string;
  requestId: string;
  context?: Record<string, unknown>;
} 