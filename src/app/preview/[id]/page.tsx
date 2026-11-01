import { notFound } from "next/navigation";
import { dbStore } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = dbStore.getProject(id, "admin");

  if (!project) {
    notFound();
  }

  const files = dbStore.getProjectFiles(id);
  const htmlFile = files.find((f) => f.path === "index.html");
  const cssFile = files.find((f) => f.path === "styles.css");
  const jsFile = files.find((f) => f.path === "app.js");

  if (!htmlFile) {
    return (
      <div style={{ background: "#0B1020", color: "#F4F3EF", padding: "2rem", fontFamily: "sans-serif" }}>
        <h2>Preview Ready</h2>
        <p>No index.html file found yet. Prompt VEYRA Copilot to generate your initial homepage.</p>
      </div>
    );
  }

  // Inject CSS and JS if separate files exist and are not already inlined
  let renderedHtml = htmlFile.content;

  if (cssFile && !renderedHtml.includes(cssFile.content)) {
    renderedHtml = renderedHtml.replace(
      "</head>",
      `<style>\n/* Injected styles.css */\n${cssFile.content}\n</style>\n</head>`
    );
  }

  if (jsFile && !renderedHtml.includes(jsFile.content)) {
    renderedHtml = renderedHtml.replace(
      "</body>",
      `<script>\n/* Injected app.js */\ntry {\n${jsFile.content}\n} catch (e) { console.error('Preview runtime error:', e); }\n</script>\n</body>`
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
      style={{ width: "100%", height: "100%", minHeight: "100vh" }}
    />
  );
}
