# Topogram Generator: Vanilla Web

Package-backed Topogram generator for vanilla HTML, CSS, and JavaScript web
apps.

This package is the first extraction proof for the generator-pack boundary:
Topogram core builds the normalized `ui-web-contract`, then this package turns
that contract into framework-specific files.

## Manifest

- Generator id: `@attebury/topogram-generator-vanilla-web`
- Surface: `web`
- Projection platform: `ui_web`
- Stack: vanilla HTML/CSS/JS
- Package manifest: `topogram-generator.json`
- Adapter export: `index.cjs`

Topology binding:

```json
{
  "id": "app_web",
  "type": "web",
  "projection": "proj_ui_web",
  "generator": {
    "id": "@attebury/topogram-generator-vanilla-web",
    "version": "1",
    "package": "@attebury/topogram-generator-vanilla-web"
  },
  "port": 5173
}
```

## Verify Locally

From this repo:

```bash
npm run check
```

The smoke test packs this generator, installs it beside `@attebury/topogram` in
a temporary consumer project, runs `topogram check`, runs `topogram generate`,
compiles the generated app bundle, and verifies the generated two-page vanilla
web app.

Use a different Topogram CLI package with:

```bash
TOPOGRAM_CLI_PACKAGE_SPEC=@attebury/topogram@latest npm run check
```
