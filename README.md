# Directus MCP Server

A Model Context Protocol (MCP) server bridge for Directus.

This bridge allows AI agents (like those in Windsurf/Antigravity IDE) to interact with your Directus instance via the MCP protocol.

## Configuration

Set the following environment variables:

- `DIRECTUS_URL`: Your Directus instance URL (default: `http://localhost:8055`)
- `DIRECTUS_TOKEN`: Your Directus API token

## Usage with Docker

```bash
docker run -i --rm \
  -e DIRECTUS_URL="https://your-directus.com" \
  -e DIRECTUS_TOKEN="your-token" \
  ghcr.io/splitpierre/directus-mcp-server:latest
```
