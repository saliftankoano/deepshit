# DeepShit MCP Code Critic

A brutally honest code review tool powered by DeepSeek-R1 AI and the Model Context Protocol (MCP).

## Features

- 🔍 Deep code analysis with DeepSeek-R1 AI
- 🚀 Real-time feedback via MCP
- 💀 Brutally honest code reviews
- 🎯 Security, performance, and best practices checks
- 🌐 Modern cyberpunk UI
- ⚡ Built with Next.js and TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- Together API key (for DeepSeek-R1)
- Redis URL (for SSE transport)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/deepshit.git
cd deepshit
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file:

```env
TOGETHER_API_KEY=your_api_key_here
TOGETHER_API_URL=https://api.together.xyz/v1
DEEPSEEK_MODEL=deepseek-ai/deepseek-coder-33b-instruct
REDIS_URL=your_redis_url_here
```

4. Run the development server:

```bash
npm run dev
```

### Using with Cursor

Add this to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "deepshit-mcp-code-critic": {
      "command": "npx",
      "args": ["mcp-remote", "https://your-deployment.vercel.app/sse"],
      "env": {
        "NODE_ENV": "development",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## Architecture

- `/app` - Next.js app router pages and API routes
- `/lib/mcp` - MCP server implementation
  - `/server.ts` - Main MCP server setup
  - `/tools` - MCP tool implementations
  - `/services` - External service integrations
  - `/utils` - Shared utilities

## Development

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [DeepSeek AI](https://deepseek.ai) for their amazing models
- [Model Context Protocol](https://modelcontextprotocol.io) for the MCP specification
- [Vercel](https://vercel.com) for their MCP adapter and hosting
