#!/usr/bin/env node

/**
 * Directus MCP Server Bridge
 *
 * Bridges stdio transport (used by IDEs) to HTTP JSON-RPC (used by Directus MCP)
 * This allows AI agents in Windsurf/Antigravity IDE to interact with Directus data
 */

const { createInterface } = require("readline");
const { stdin, stdout, stderr, env } = require("process");

// Configuration from environment variables
const DIRECTUS_URL = env.DIRECTUS_URL || "http://localhost:8055";
const DIRECTUS_TOKEN = env.DIRECTUS_TOKEN;
const MCP_ENDPOINT = `${DIRECTUS_URL}/mcp`;

if (!DIRECTUS_TOKEN) {
  stderr.write("ERROR: DIRECTUS_TOKEN environment variable is required\n");
  process.exit(1);
}

// Track pending requests
let pendingRequests = 0;
let stdinClosed = false;

// Setup readline interface for stdin
const rl = createInterface({
  input: stdin,
  output: stdout,
  terminal: false,
});

/**
 * Forward JSON-RPC message to Directus MCP endpoint
 */
async function forwardToDirectus(message) {
  try {
    const response = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      stderr.write(`HTTP Error ${response.status}: ${errorText}\n`);

      // Return JSON-RPC error response
      return {
        jsonrpc: "2.0",
        id: message.id,
        error: {
          code: -32000,
          message: `HTTP ${response.status}: ${response.statusText}`,
          data: errorText,
        },
      };
    }

    // Handle empty responses (204 No Content, 202 Accepted)
    if (
      response.status === 204 ||
      response.status === 202 ||
      response.headers.get("content-length") === "0"
    ) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    stderr.write(`Error forwarding to Directus: ${error.message}\n`);
    stderr.write(`Stack: ${error.stack}\n`);

    // Return JSON-RPC error response
    return {
      jsonrpc: "2.0",
      id: message.id,
      error: {
        code: -32603,
        message: "Internal error",
        data: error.message,
      },
    };
  }
}

/**
 * Check if we should exit
 */
// function checkExit() {
//   if (stdinClosed && pendingRequests === 0) {
//     stderr.write("MCP server bridge closed\n");
//     process.exit(0);
//   }
// }

/**
 * Process incoming JSON-RPC message from stdin
 */
async function processMessage(line) {
  pendingRequests++;

  try {
    const message = JSON.parse(line);

    // Log incoming message to stderr (for debugging)
    stderr.write(`→ ${JSON.stringify(message)}\n`);

    // Forward to Directus and get response
    const response = await forwardToDirectus(message);

    // Log outgoing response to stderr (for debugging)
    if (response) {
      stderr.write(`← ${JSON.stringify(response)}\n`);

      // Only send response if it's not a notification (has id)
      if (message.id !== undefined && message.id !== null) {
        stdout.write(JSON.stringify(response) + "\n");
      }
    } else {
      stderr.write(`← (empty)\n`);
    }
  } catch (error) {
    stderr.write(`Error processing message: ${error.message}\n`);

    // Send error response
    const errorResponse = {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: "Parse error",
        data: error.message,
      },
    };

    stdout.write(JSON.stringify(errorResponse) + "\n");
  } finally {
    pendingRequests--;
    // checkExit();
  }
}

// Handle incoming messages from stdin
rl.on("line", (line) => {
  if (line.trim()) {
    processMessage(line);
  }
});

// Handle stdin close
// rl.on("close", () => {
  // stdinClosed = true;
  // checkExit();
// });

// Log startup
stderr.write(`Directus MCP Server Bridge started\n`);
stderr.write(`Forwarding to: ${MCP_ENDPOINT}\n`);
