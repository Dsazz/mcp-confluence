/**
 * Confluence Page Formatter
 *
 * Formats Confluence page responses into human-readable markdown text
 */

import type { GetPageResponse } from "../api/index";

/**
 * Formats a Confluence page response into human-readable markdown
 */
export function formatPageResponse(response: GetPageResponse): string {
  const { page, relationships, context } = response;
  
  let output = "";
  
  // Page Header
  output += `# ${page.title}\n\n`;
  
  // Basic Information
  output += "## Page Information\n\n";
  output += `- **ID**: ${page.id}\n`;
  output += `- **Created**: ${new Date(page.createdAt).toLocaleDateString()}\n`;
  output += `- **Last Updated**: ${new Date(page.version.createdAt).toLocaleDateString()}\n`;
  output += `- **Version**: ${page.version.number}\n`;
  output += `- **Status**: ${page.status}\n\n`;
  
  // Links Section
  output += "## Links\n\n";
  if (page._links.webui) {
    // Extract base URL from webui link if available
    const baseUrl = extractBaseUrl(page._links.webui);
    output += `- [View Page](${baseUrl}${page._links.webui})\n`;
    
    if (page._links.editui) {
      output += `- [Edit Page](${baseUrl}${page._links.editui})\n`;
    }
  }
  output += "\n";
  
  // Space Information
  if (context.space) {
    output += "## Space\n\n";
    output += `- **Space ID**: ${context.space.id}\n`;
    if (context.space.name) {
      output += `- **Name**: ${context.space.name}\n`;
    }
    if (context.space.key) {
      output += `- **Key**: ${context.space.key}\n`;
    }
    output += `- **Type**: ${context.space.type}\n\n`;
  }
  
  // Relationships
  if (relationships) {
    output += "## Statistics\n\n";
    output += `- **Comments**: ${relationships.commentCount}\n`;
    const childCount = relationships.children?.length || 0;
    output += `- **Child Pages**: ${childCount}\n\n`;
  }
  
  // Content Preview
  if (page.body?.storage?.value) {
    output += "## Content Preview\n\n";
    
    // Extract text content from HTML storage format
    const cleanContent = extractTextFromHtml(page.body.storage.value);
    const preview = cleanContent.length > 200 
      ? `${cleanContent.substring(0, 200)}...` 
      : cleanContent;
      
    if (preview.trim()) {
      output += `${preview}\n\n`;
    } else {
      output += "*Content contains tables, images, or complex formatting. View online for full content.*\n\n";
    }
  }
  
  // Navigation
  if (context.breadcrumbs && context.breadcrumbs.length > 0) {
    output += "## Navigation\n\n";
    const breadcrumbPath = context.breadcrumbs
      .map(crumb => crumb.title)
      .join(" > ");
    output += `**Path**: ${breadcrumbPath}\n\n`;
  }
  
  return output.trim();
}

/**
 * Extracts base URL from a webui link
 */
function extractBaseUrl(webuiLink: string): string {
  // Try to extract base URL pattern from the webui link
  // This is a simple heuristic - in production you might want to get this from config
  if (webuiLink.includes('/wiki/')) {
    const parts = webuiLink.split('/wiki/');
    return `${parts[0]}/wiki`;
  }
  return 'https://your-confluence-instance.atlassian.net/wiki';
}

/**
 * Extracts plain text from HTML content
 */
function extractTextFromHtml(html: string): string {
  // Remove HTML tags and decode common entities
  return html
    .replace(/<[^>]*>/g, ' ')              // Remove HTML tags
    .replace(/&nbsp;/g, ' ')               // Replace non-breaking spaces
    .replace(/&amp;/g, '&')                // Decode ampersands
    .replace(/&lt;/g, '<')                 // Decode less than
    .replace(/&gt;/g, '>')                 // Decode greater than
    .replace(/&quot;/g, '"')               // Decode quotes
    .replace(/&#39;/g, "'")                // Decode apostrophes
    .replace(/\s+/g, ' ')                  // Collapse multiple spaces
    .trim();                               // Remove leading/trailing whitespace
} 