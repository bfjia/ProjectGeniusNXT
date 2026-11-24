# Power BI Report Authoring Toolkit

> **⚠️ Public preview.** The CLI command surface and library exports may change
> between 0.x versions. Pin to exact versions or expect breaking changes.

Command-line tooling for Power BI report (PBIR) authoring workflows: visual catalog
lookup, formatting capability discovery, PBIR literal expression encoding and
decoding, theme value helpers, and PBIR conformance validation. Designed for LLM
agent workflows that author or validate PBIR files programmatically.

> Scope: the toolkit reads, validates, and transforms local PBIR report files.
> Fabric authentication, workspace/report resolution, and LRO polling stay in
> `az rest` or a report-management workflow; this package only produces and
> consumes the deterministic report-definition payloads.

## Usage

```bash
npm install -g @microsoft/powerbi-report-authoring-cli
powerbi-report-author --help
```

## Commands

Run `powerbi-report-author --help` for the full list. Top-level command groups:

| Group | Examples | Purpose |
|---|---|---|
| `catalog` | `catalog list`, `catalog describe <visualType>` | Built-in visual types, roles, formatting keys |
| `formatting` | `formatting list-objects <visualType>`, `formatting describe-object <visualType> <object>`, `formatting describe-property`, `formatting search`, `formatting list-vcos`, `formatting effective-properties` | Discover formatting objects, properties, enum values, selectors |
| `expr` | `expr encode --kind <bool\|number\|integer\|string\|color\|themeColor> <value> [percent]`, `expr decode '<json>'` | Encode/decode PBIR literal expressions |
| `theme` | `theme encode --kind <…> <value>`, `theme shade-color <hex> <percent>` | Theme-JSON value helpers |
| `validate` | `validate <path-to-.pbip-or-.Report>` | Full PBIR conformance check (JSON Schema, IDs, formatting, theme, layout) |
| `preview` | `preview <folder> --host desktop --reload`, `preview <folder> --host desktop --reload-with-model` | Render through Desktop or the service; reload report files, optionally reload a local Desktop model definition, and capture screenshots |
| `preview-pages` / `preview-visuals` / `preview-filters` / `preview-themes` | `preview-visuals <path> [--with-derived]` | Read-only enumeration for audits |
| `pack` | `pack ./MyReport.Report --raw \| az rest ... --body @-` | Deterministically serialize a PBIR `.Report` folder into a Fabric create/update definition payload. Default output is the standard CLI envelope; use `--raw` for the raw Fabric body (e.g. for piping to `az rest`), `--mode update` or `create`, `--display-name`, and global `--out` as needed |
| `unpack` | `az rest ... | unpack ./MyReport.Report`, `unpack ./MyReport.Report --input definition.json --force` | Reconstruct a PBIR `.Report` folder from a Fabric `getDefinition` response read from stdin or `--input`; `--force` stages writes then swaps colliding files |
| `doctor` | `doctor` | Environment self-check (Node, ajv, metadata provider, schema reachability) |

`pack` and `unpack` are PBIR-only. PBIR-Legacy responses are rejected rather
than converted. Paths are normalized to forward slashes, sorted
lexicographically for deterministic output, and checked for traversal before any
write; local sync/cache artifacts such as `.pbir-sync.json` are not packed.
Common editor and OS artifacts are also skipped wherever they appear in an
included PBIR subtree: `.DS_Store`, `Thumbs.db`, `desktop.ini`,
`.editorconfig`, Office lock files beginning with `~$`, and Vim swap files
ending in `.swp` or `.swo`. Supported report-root parts are `.platform`,
`definition.pbir`, and `semanticModelDiagramLayout.json`; other files under
PBIR paths such as `StaticResources/` remain eligible for packing.

## Output contract

Every command emits exactly one JSON object on stdout using the
standard **shape-discriminated** envelope — success has a top-level `data`
field, failure has a top-level `error` field. `pack` follows this convention
by default. Pass `--raw` to emit the raw Fabric report-definition body instead
(e.g. `pack ./MyReport.Report --raw | az rest ... --body @-`).

Success:

```json
{ "data": { /* per-command shape */ } }
```

Failure (CLI level — invalid usage, file not found, unexpected exception):

```json
{ "error": { "code": "...", "message": "...", "retryable": false, "details": { "...": "..." } } }
```

By default the envelope is minified single-line JSON so it stays inline-readable
in agent harnesses (≈ 3× smaller than pretty-printed). Two global flags adjust
this:

- `--pretty` — 2-space indented JSON for human reading.
- `--out <file>` — write the full envelope to `<file>` and emit a one-line
  summary envelope on stdout (`{ "data": { "result": "...", "errorCount": ...,
  "warningCount": ..., "outFile": "..." } }` for `validate`,
  `{ "data": { "outFile": "..." } }` for other commands). Use when the artifact
  is large or you want to hand it off to another tool.

For `pack`, `--out <file>` writes the envelope by default, or the raw body when
combined with `--raw`; stdout remains the one-line summary envelope.

Progress messages and human-readable error output from the underlying
`commander` library (usage hints on bad CLI input) are written to stderr;
agent code paths only need to read stdout.

## `validate` diagnostic shape

`validate` emits diagnostics grouped by code:

```json
{
  "data": {
    "result": "succeeded" | "succeededWithWarnings" | "failed",
    "errorCount": N,
    "warningCount": N,
    "reportPath": "/abs/path/to/<Report>.Report",
    "diagnostics": {
      "<PBIR_CODE>": {
        "severity": "error" | "warning",
        "items": [
          { "message": "...", "file": "/abs/path/to/file.json", "path": "objects.foo.bar" },
          /* ... */
        ]
      }
    }
  }
}
```

`diagnostics` is omitted when `result === "succeeded"`. `severity` is hoisted
to the group level (it's intrinsic per code, so it doesn't vary across items).
`path` is a dotted JSON path within `file` (not a JSON Pointer / not JSONPath
RFC-9535 — just a readable dotted path). `process.exitCode` is `1` whenever
`result === "failed"`, `0` otherwise.

## Severity policy

Severity is intrinsic to each diagnostic code (no `--strict` flag, no env
vars). Catalog-violation codes emit as errors because they indicate real bugs,
not transient metadata staleness. Two codes stay as warnings to act as a
custom-visual escape hatch: `PBIR_VISUAL_TYPE_UNKNOWN` and
`PBIR_THEME_VISUAL_UNKNOWN`.

## Local development

This package has a workspace dependency on `@microsoft/powerbi-desktop-bridge-cli`
(the Desktop preview host imports it) and compiles against that package's built
`dist`. The canonical way to build the workspace is from the repository root,
which builds packages in topological order so the bridge is ready first:

```bash
pnpm install
pnpm -r run build      # or: pnpm -r run build:prod
```

If you instead run this package's own `npm run build` / `npm run test` on a fresh
clone where the bridge has not been built yet, a `prebuild` hook builds the bridge
first (a no-op once its `dist` exists), so the package's build and test scripts
work standalone. `npm run lint` has no such hook — run a root build (above) or the
package build once first so the bridge's types are available to `tsc`.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow [Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general). Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party's policies.

## Security

Microsoft takes the security of our software products and services seriously, which includes all source code repositories in our GitHub organizations.

**Please do not report security vulnerabilities through public GitHub issues.**

For security reporting information, locations, contact information, and policies, please review the latest guidance for Microsoft repositories at [https://aka.ms/SECURITY.md](https://aka.ms/SECURITY.md).

## Code of conduct

We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.

See the full [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
