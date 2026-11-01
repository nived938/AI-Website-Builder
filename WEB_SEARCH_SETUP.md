# Web Search & Internet Research Setup

VEYRA Studio empowers the AI to search the internet for real-world content, current market data, and industry references when requested by the user.

## 1. Supported Providers
1. **Tavily Search** (Recommended for AI agents):
   - Sign up at [tavily.com](https://tavily.com) to obtain an API key.
2. **Brave Search**:
   - Sign up at [brave.com/search/api](https://brave.com/search/api).

## 2. Environment Configuration
In `.env.local`:
```env
SEARCH_PROVIDER=tavily
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxx
# OR
SEARCH_PROVIDER=brave
BRAVE_SEARCH_API_KEY=BSAxxxxxxxxxxxxxxxxxxxx
```

## 3. Security & SSRF Protection
All outgoing research requests strictly implement:
- **Private IP & Loopback Blocking**: Automatically blocks `127.0.0.1`, `localhost`, `0.0.0.0`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, and cloud metadata IP `169.254.169.254`.
- **Payload Limits**: Truncates retrieved HTML/text to 25KB per source.
- **Content Sanitization**: Strips executable script tags and treats all web text as untrusted reference material.
- **Citation Registry**: Stores source titles, URLs, domains, and publication timestamps in `web_sources`.
