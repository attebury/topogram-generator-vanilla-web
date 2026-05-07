const manifest = require("./topogram-generator.json");

const DEFAULT_DESIGN_INTENT = Object.freeze({
  density: "comfortable",
  tone: "neutral",
  radiusScale: "medium",
  colorRoles: Object.freeze({ primary: "accent" }),
  typographyRoles: Object.freeze({ body: "readable", heading: "prominent" }),
  actionRoles: Object.freeze({ primary: "prominent" }),
  accessibility: Object.freeze({ contrast: "aa", focus: "visible" })
});
const DENSITY_VALUES = {
  compact: { spaceUnit: "0.75rem", pagePadding: "1.5rem 1rem 3rem", controlPadding: "0.55rem 0.75rem" },
  comfortable: { spaceUnit: "1rem", pagePadding: "2rem 1.25rem 4rem", controlPadding: "0.7rem 1rem" },
  spacious: { spaceUnit: "1.25rem", pagePadding: "2.5rem 1.5rem 5rem", controlPadding: "0.85rem 1.15rem" }
};
const RADIUS_VALUES = {
  none: { card: "0", control: "0", pill: "0" },
  small: { card: "8px", control: "8px", pill: "999px" },
  medium: { card: "14px", control: "12px", pill: "999px" },
  large: { card: "18px", control: "16px", pill: "999px" }
};
const COLOR_VALUES = { accent: "#0f5cc0", critical: "#b42318", danger: "#b42318", success: "#027a48", warning: "#b54708", neutral: "#516173", muted: "#607284" };
const TONE_VALUES = {
  neutral: { text: "#182026", muted: "#607284", background: "linear-gradient(180deg, #f5f7fb 0%, #edf2f7 100%)", surface: "#ffffff", surfaceSubtle: "#fbfcfe", border: "#d7e1ec" },
  operational: { text: "#182026", muted: "#607284", background: "linear-gradient(180deg, #f5f7fb 0%, #edf2f7 100%)", surface: "#ffffff", surfaceSubtle: "#fbfcfe", border: "#d7e1ec" },
  editorial: { text: "#1f2933", muted: "#5c6670", background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)", surface: "#ffffff", surfaceSubtle: "#f8fafc", border: "#d8dee8" },
  playful: { text: "#1f2937", muted: "#5b6472", background: "linear-gradient(180deg, #f7fbff 0%, #eef6ff 100%)", surface: "#ffffff", surfaceSubtle: "#f7fbff", border: "#d6e4f5" }
};

function cssToken(value) { return String(value || "default").replace(/[^A-Za-z0-9_-]/g, "_"); }
function mergeStringMap(source, fallback) { return { ...fallback, ...(source && typeof source === "object" ? source : {}) }; }
function normalizeDesignIntent(design) {
  const value = design && typeof design === "object" ? design : {};
  return {
    density: typeof value.density === "string" ? value.density : DEFAULT_DESIGN_INTENT.density,
    tone: typeof value.tone === "string" ? value.tone : DEFAULT_DESIGN_INTENT.tone,
    radiusScale: typeof value.radiusScale === "string" ? value.radiusScale : DEFAULT_DESIGN_INTENT.radiusScale,
    colorRoles: mergeStringMap(value.colorRoles, DEFAULT_DESIGN_INTENT.colorRoles),
    typographyRoles: mergeStringMap(value.typographyRoles, DEFAULT_DESIGN_INTENT.typographyRoles),
    actionRoles: mergeStringMap(value.actionRoles, DEFAULT_DESIGN_INTENT.actionRoles),
    accessibility: mergeStringMap(value.accessibility, DEFAULT_DESIGN_INTENT.accessibility)
  };
}
function tokenMapLines(map, prefix) {
  return Object.entries(map).sort(([left], [right]) => left.localeCompare(right)).map(([role, value]) => `  --topogram-design-${prefix}-${cssToken(role)}: ${cssToken(value)};`);
}
function renderDesignIntentCss(design) {
  const normalized = normalizeDesignIntent(design);
  const tone = TONE_VALUES[normalized.tone] || TONE_VALUES.neutral;
  const density = DENSITY_VALUES[normalized.density] || DENSITY_VALUES.comfortable;
  const radius = RADIUS_VALUES[normalized.radiusScale] || RADIUS_VALUES.medium;
  const primaryColor = COLOR_VALUES[normalized.colorRoles.primary] || COLOR_VALUES.accent;
  const dangerColor = COLOR_VALUES[normalized.colorRoles.danger] || COLOR_VALUES.critical;
  return `/* Topogram semantic design intent. Generators map normalized UI tokens to stack CSS here. */
:root {
  --topogram-design-density: ${cssToken(normalized.density)};
  --topogram-design-tone: ${cssToken(normalized.tone)};
  --topogram-design-radius-scale: ${cssToken(normalized.radiusScale)};
${tokenMapLines(normalized.colorRoles, "color").join("\n")}
${tokenMapLines(normalized.typographyRoles, "typography").join("\n")}
${tokenMapLines(normalized.actionRoles, "action").join("\n")}
${tokenMapLines(normalized.accessibility, "accessibility").join("\n")}
  --topogram-space-unit: ${density.spaceUnit};
  --topogram-page-padding: ${density.pagePadding};
  --topogram-control-padding: ${density.controlPadding};
  --topogram-radius-card: ${radius.card};
  --topogram-radius-control: ${radius.control};
  --topogram-radius-pill: ${radius.pill};
  --topogram-text-color: ${tone.text};
  --topogram-muted-color: ${tone.muted};
  --topogram-surface-background: ${tone.background};
  --topogram-surface-card: ${tone.surface};
  --topogram-surface-subtle: ${tone.surfaceSubtle};
  --topogram-border-color: ${tone.border};
  --topogram-action-primary-background: ${primaryColor};
  --topogram-action-primary-color: #ffffff;
  --topogram-action-danger-background: ${dangerColor};
  --topogram-focus-outline: 3px solid ${primaryColor};
}
`;
}
function requiredDesignMarkers(design) {
  return [
    { category: "density", role: null, value: design.density, marker: "--topogram-design-density" },
    { category: "tone", role: null, value: design.tone, marker: "--topogram-design-tone" },
    { category: "radius_scale", role: null, value: design.radiusScale, marker: "--topogram-design-radius-scale" },
    ...Object.entries(design.colorRoles).map(([role, value]) => ({ category: "color_roles", role, value, marker: `--topogram-design-color-${cssToken(role)}` })),
    ...Object.entries(design.typographyRoles).map(([role, value]) => ({ category: "typography_roles", role, value, marker: `--topogram-design-typography-${cssToken(role)}` })),
    ...Object.entries(design.actionRoles).map(([role, value]) => ({ category: "action_roles", role, value, marker: `--topogram-design-action-${cssToken(role)}` })),
    ...Object.entries(design.accessibility).map(([role, value]) => ({ category: "accessibility", role, value, marker: `--topogram-design-accessibility-${cssToken(role)}` }))
  ];
}
function buildDesignIntentCoverage(contract, files, cssPath) {
  const design = normalizeDesignIntent(contract?.design);
  const css = files[cssPath] || "";
  const markers = requiredDesignMarkers(design);
  const mapped = markers.filter((item) => css.includes(item.marker));
  const missing = markers.filter((item) => !css.includes(item.marker));
  return {
    coverage: {
      status: missing.length === 0 ? "mapped" : "unmapped",
      css_path: cssPath,
      tokens: { density: design.density, tone: design.tone, radius_scale: design.radiusScale, color_roles: design.colorRoles, typography_roles: design.typographyRoles, action_roles: design.actionRoles, accessibility: design.accessibility },
      mapped: mapped.map((item) => ({ category: item.category, role: item.role, value: item.value, marker: item.marker })),
      missing: missing.map((item) => ({ category: item.category, role: item.role, value: item.value, marker: item.marker }))
    },
    diagnostics: missing.map((item) => ({
      code: "design_intent_not_mapped",
      severity: "error",
      category: item.category,
      role: item.role,
      value: item.value,
      marker: item.marker,
      message: `UI design intent token '${item.category}${item.role ? `.${item.role}` : ""}' was not mapped into ${cssPath}.`,
      suggested_fix: "Render Topogram semantic design variables before writing the web stylesheet."
    }))
  };
}

function slugify(value) {
  return String(value || "page")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "page";
}

function routeFileName(routePath) {
  if (!routePath || routePath === "/") {
    return "index.html";
  }
  return `${slugify(routePath)}.html`;
}

function renderHtml({ title, brand, nav, body }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <header class="app-header">
      <a class="brand" href="./index.html">${brand}</a>
      <nav>
${nav.map((item) => `        <a href="./${item.file}">${item.title}</a>`).join("\n")}
      </nav>
    </header>
    <main>
${body}
    </main>
    <script src="./app.js" type="module"></script>
  </body>
</html>
`;
}

function renderStyles(design) {
  return `${renderDesignIntentCss(design)}

:root {
  color: var(--topogram-text-color);
  background: var(--topogram-surface-background);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  margin: 0;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--topogram-space-unit);
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--topogram-border-color);
  background: var(--topogram-surface-card);
}

.brand {
  color: var(--topogram-text-color);
  font-weight: 700;
  text-decoration: none;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
}

nav a {
  color: var(--topogram-action-primary-background);
  text-decoration: none;
}

main {
  display: grid;
  gap: var(--topogram-space-unit);
  max-width: 56rem;
  margin: 0 auto;
  padding: var(--topogram-page-padding);
}

.panel {
  border: 1px solid var(--topogram-border-color);
  border-radius: var(--topogram-radius-card);
  background: var(--topogram-surface-card);
  padding: 1.25rem;
}

.muted {
  color: var(--topogram-muted-color);
}

a:focus-visible {
  outline: var(--topogram-focus-outline);
  outline-offset: 2px;
}
`;
}

function renderBrowserScript() {
  return `const stamp = document.querySelector("[data-generated-at]");
if (stamp) {
  stamp.textContent = new Date().toLocaleString();
}
`;
}

function renderBuildScript() {
  return `import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && [".html", ".css", ".js"].includes(path.extname(entry.name))) {
    fs.copyFileSync(path.join(root, entry.name), path.join(dist, entry.name));
  }
}
console.log("Built vanilla web app to dist/.");
`;
}

function renderCheckScript() {
  return `import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const htmlFiles = fs.readdirSync(root).filter((entry) => entry.endsWith(".html"));
if (htmlFiles.length < 1) {
  throw new Error("Expected at least one HTML page.");
}
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (!html.includes("<main>") || !html.includes("./styles.css") || !html.includes("./app.js")) {
    throw new Error(\`\${file} is missing the expected page shell.\`);
  }
}
console.log(\`Checked \${htmlFiles.length} vanilla page(s).\`);
`;
}

function renderDevScript(component) {
  return `import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const port = Number(process.env.PORT || process.env.WEB_PORT || ${component.port || 5173});
const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"]
]);

http.createServer((req, res) => {
  const url = new URL(req.url || "/", \`http://localhost:\${port}\`);
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(root, requested));
  if (!filePath.startsWith(root)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404).end("Not found");
    return;
  }
  res.writeHead(200, { "content-type": types.get(path.extname(filePath)) || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}).listen(port, () => {
  console.log(\`Vanilla web app listening on http://localhost:\${port}\`);
});
`;
}

function routesFromContract(contract) {
  const screensById = new Map((contract.screens || []).map((screen) => [screen.id, screen]));
  const items = contract.navigation?.items || [];
  const routes = items.length > 0
    ? items.map((item) => {
        const screen = screensById.get(item.screenId) || {};
        return {
          screenId: item.screenId,
          path: item.route || screen.route || "/",
          title: screen.title || item.label || item.screenId || "Page"
        };
      })
    : (contract.screens || []).map((screen) => ({
        screenId: screen.id,
        path: screen.route || "/",
        title: screen.title || screen.id || "Page"
      }));
  return routes.map((route) => ({
    ...route,
    file: routeFileName(route.path)
  }));
}

function renderCoverage(contract, files, routes) {
  const diagnostics = [];
  const designIntent = buildDesignIntentCoverage(contract, files, "styles.css");
  diagnostics.push(...designIntent.diagnostics);
  const screens = routes.map((route) => {
    const rendered = Boolean(files[route.file]);
    if (!rendered) {
      diagnostics.push({
        code: "screen_route_not_rendered",
        severity: "error",
        screen: route.screenId,
        route: route.path,
        message: `Screen '${route.screenId}' has route '${route.path}' but no vanilla HTML page was generated.`,
        suggested_fix: "Check the vanilla web generator route emission for this screen."
      });
    }
    return {
      id: route.screenId,
      route: route.path,
      page: route.file,
      rendered,
      renderer: rendered ? "generator" : "missing",
      component_usages: []
    };
  });
  return {
    type: "generation_coverage",
    surface: "web",
    generator: manifest.id,
    projection: {
      id: contract.projection?.id,
      name: contract.projection?.name,
      platform: contract.projection?.platform
    },
    summary: {
      routed_screens: screens.length,
      rendered_screens: screens.filter((screen) => screen.rendered).length,
      implementation_screens: 0,
      generator_screens: screens.filter((screen) => screen.renderer === "generator").length,
      component_usages: 0,
      rendered_component_usages: 0,
      diagnostics: diagnostics.length,
      errors: diagnostics.filter((diagnostic) => diagnostic.severity === "error").length,
      warnings: diagnostics.filter((diagnostic) => diagnostic.severity === "warning").length
    },
    design_intent: designIntent.coverage,
    screens,
    diagnostics
  };
}

function assertGenerationCoverage(coverage) {
  const errors = (coverage.diagnostics || []).filter((diagnostic) => diagnostic.severity === "error");
  if (errors.length === 0) return;
  throw new Error(`Vanilla web generation coverage failed: ${errors.map((diagnostic) => diagnostic.message).join("; ")}`);
}

function generate(context) {
  const contract = context.contracts?.uiWeb;
  if (!contract) {
    throw new Error("Vanilla web generator requires contracts.uiWeb.");
  }
  const routes = routesFromContract(contract);
  const nav = routes.map(({ title, file }) => ({ title, file }));
  const projectionId = contract.projection?.id || context.projection?.id || "proj_ui_web";
  const brand = contract.appShell?.brand || "Topogram Hello";
  const files = {
    "package.json": `${JSON.stringify({
      name: projectionId,
      private: true,
      version: "0.1.0",
      type: "module",
      scripts: {
        dev: "node ./scripts/dev.mjs",
        build: "node ./scripts/build.mjs",
        check: "node ./scripts/check.mjs"
      }
    }, null, 2)}\n`,
    "styles.css": renderStyles(contract.design),
    "app.js": renderBrowserScript(),
    "scripts/build.mjs": renderBuildScript(),
    "scripts/check.mjs": renderCheckScript(),
    "scripts/dev.mjs": renderDevScript(context.component || {})
  };

  routes.forEach((route, index) => {
    files[route.file] = renderHtml({
      title: route.title,
      brand,
      nav,
      body: `      <section class="panel">
        <p class="muted">Page ${index + 1} of ${routes.length}</p>
        <h1>${route.title}</h1>
        <p>This page was generated from the <code>${projectionId}</code> Topogram web projection.</p>
        <p class="muted">Generated timestamp: <span data-generated-at>pending</span></p>
      </section>`
    });
  });

  const coverage = renderCoverage(contract, files, routes);
  assertGenerationCoverage(coverage);
  files["topogram/generation-coverage.json"] = `${JSON.stringify(coverage, null, 2)}\n`;
  files["topogram/ui-web-contract.json"] = `${JSON.stringify(contract, null, 2)}\n`;

  return {
    files,
    artifacts: {
      generator: manifest.id,
      projection: projectionId,
      routeCount: routes.length
    },
    diagnostics: []
  };
}

module.exports = {
  manifest,
  generate
};
