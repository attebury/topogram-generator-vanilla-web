# @topogram/generator-vanilla-web Agent Guide

> Agent operating rules for maintaining this Topogram generator package safely.

Status: current
Audience: coding agents and humans maintaining this package
Use when: you are editing adapter code, fixtures, package metadata, workflows, docs, or release proof.

## Rules

- Generators realize normalized Topogram contracts for one runtime stack.
- Do not move stack-specific rendering assumptions into Topogram core.
- Package checks must prove generated output by compiling, checking, or running it where practical.
- Keep evidence and diagnostics portable; do not leak machine-local paths.
- Keep `llms.txt` and `llms-full.txt` current when README or agent guidance changes.
- Run `npm run release:preflight` before publishing or broad sharing.

## Local Engine Testing

```bash
TOPOGRAM_CLI=/absolute/path/to/topogram/engine/src/cli.js npm run check
```
