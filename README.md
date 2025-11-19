# Directus MCP Server

A Model Context Protocol (MCP) server bridge for Directus.

This bridge allows AI agents (like those in Windsurf/Antigravity IDE) to interact with your Directus instance via the MCP protocol.

## Configuration

Set the following environment variables:

- `DIRECTUS_URL`: Your Directus instance URL (default: `http://localhost:8055`)
- `DIRECTUS_TOKEN`: Your Directus API token

## Usage with Docker

```bash
# Assuming directus is running on 8055, and you have a user with API token
docker run -i --rm \
  --network=host \
  -e DIRECTUS_URL="http://localhost:8055" \
  -e DIRECTUS_TOKEN="your-token" \
  ghcr.io/splitpierre/directus-mcp-server:main

# Updating
docker pull ghcr.io/splitpierre/directus-mcp-server:main
```

## Configuration for Antigravity/Windsurf IDE

Add the following to your `~/.gemini/antigravity/mcp_config.json` (or equivalent config file):

```json
{
  "mcpServers": {
    "directus-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--network=host",
        "-e",
        "DIRECTUS_URL",
        "-e",
        "DIRECTUS_TOKEN",
        "ghcr.io/splitpierre/directus-mcp-server:main"
      ],
      "env": {
        "DIRECTUS_URL": "http://localhost:8055",
        "DIRECTUS_TOKEN": "your-directus-token"
      },
      "disabledTools": [
        "flows",
        "trigger-flow"
      ]
    }
  }
}
```

> [!NOTE]
> The `--network=host` flag is required if your Directus instance is running on `localhost`. If Directus is on a remote server, you can omit this flag.
