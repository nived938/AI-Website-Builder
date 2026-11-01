# SEO Architecture: Platform & Generated Websites

## 1. VEYRA Studio Platform SEO
- **Server-Side Rendered (SSR)**: Marketing landing pages, features, pricing, templates, and documentation are pre-rendered with semantic HTML.
- **Dynamic Metadata**: Built-in Open Graph (OG), Twitter cards, canonical tags, and structured JSON-LD (`SoftwareApplication` schema).
- **Robots & Sitemap**:
  - `sitemap.xml`: Auto-generated for all public routes.
  - `robots.txt`: Blocks search indexing of `/dashboard`, `/builder`, `/admin`, and private project previews.

## 2. In-Builder SEO Audit for Generated Websites
The workspace includes a dedicated SEO analysis inspector:
- **Heading Hierarchy Check**: Ensures a single `<h1>` tag followed by logical `<h2>` and `<h3>` tags.
- **Meta Description & Title Generator**: AI prompt action to craft high-CTR titles (<60 chars) and descriptions (<160 chars).
- **Image Alt-Text Inspector**: Flags `<img>` tags missing descriptive `alt` attributes.
- **Mobile Responsive Viewport**: Automatically generates `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- **JSON-LD Schema Injector**: Automatically embeds LocalBusiness, Product, or Organization structured data.
