# Which vendored Microsoft skill files apply to the PBI Agent Kit

**Context:** the owner's organization has **not approved Microsoft Fabric**. The kit uses **only** local Power BI Desktop + PBIP authoring, and publishes to a Power BI **Pro/PPU workspace** from Desktop. Pro/PPU is standard Power BI, running on the tenant's shared capacity; it isn't a Fabric capacity and creates no Fabric items.

Microsoft's repository is named `skills-for-fabric` because it hosts skills for many Fabric workloads. Its `powerbi-authoring` plugin mixes two kinds of content:
- **local PBIP authoring** (file formats, DAX, TMDL, visual JSON, design), which applies
- **Fabric/service management** (REST APIs, deployment, Direct Lake, XMLA, Fabric CLI), which does **not** apply

The plugin isn't installed; these files are read-only reference.

## ✅ Applicable: use these
| File (under `powerbi-authoring/skills/`) | Used for |
|---|---|
| `semantic-model-authoring/references/tmdl-guidelines.md` | TMDL syntax and examples. Ignore its Direct Lake table example. |
| `semantic-model-authoring/references/pbip.md` | PBIP shell files. Use the `byPath` binding; ignore the `byConnection` example. |
| `semantic-model-authoring/references/modeling-guidelines.md` | Star schema, measures, descriptions, formats. Ignore the Direct Lake notes. |
| `semantic-model-authoring/references/naming-conventions.md` | Naming. |
| `semantic-model-authoring/references/dax-guidelines.md` | DAX style and correctness. |
| `semantic-model-authoring/references/dax-perf-patterns.md`, `dax-perf-decision-guide.md` | DAX performance. Ignore the workspace/XMLA tracing parts; local Desktop only. |
| `semantic-model-authoring/references/field-parameters.md` | Field parameters (future use). |
| `semantic-model-authoring/references/metadata-discovery.md` | DAX `INFO.*` queries, run against the local Desktop model via the MCP only. |
| `semantic-model-authoring/references/semantic-model-ai-readiness.md` | Optional guidance on descriptions and naming. |
| `powerbi-report-cli/references/authoring.md`, `authoring-part-02.md`, `authoring-part-03.md`, `authoring-part-04.md` | PBIR file structure, schema versions, the scaffold rules (always with `--offline`). Skip any section about publishing to a workspace. |
| `powerbi-report-cli/references/authoring/*.md`, **except** the preview files' "service host" sections | Visual JSON, formatting, expressions, filters, slicers, cards, tables, themes, conditional formatting, model binding (`byPath` only), Desktop preview, version control. |
| `powerbi-report-cli/references/design.md`, `design/**` | Design guidance: layout, chart selection, color, typography, accessibility, archetypes. |
| `powerbi-report-cli/SKILL.md`, `semantic-model-authoring/SKILL.md` | Background only. Their workflows include Fabric steps; follow the kit's skills instead. |

## ❌ Not applicable (Fabric/service): don't follow
| File | Why |
|---|---|
| `semantic-model-authoring/references/semantic-model-rest-api.md` | Fabric REST APIs (create/update/deploy semantic models in workspaces). |
| `semantic-model-authoring/references/connection-binding.md` | Binding data sources for models deployed to Fabric. |
| `semantic-model-authoring/references/direct-lake-guidelines.md` | Direct Lake requires Fabric capacity and OneLake. |
| `powerbi-report-cli/references/management.md`, `management-part-02..04.md` | Publishing and managing report items in Fabric workspaces via REST/`az rest`. |
| `powerbi-report-cli/references/planning.md`, `planning-part-02.md` | Mostly applicable for planning concepts, but the parts that plan **from a semantic model in a Fabric workspace** (XMLA/REST discovery) don't apply. Plan from the local `model.yaml`/TMDL instead. |
| `powerbi-report-cli/references/authoring/preview*.md`: the `--host service` sections | Service preview needs a published model plus `az` sign-in. The kit uses only `--host desktop` or the `powerbi-desktop` CLI. |
| `../common/COMMON-CLI.md`, `COMMON-CORE.md`, `ITEM-DEFINITIONS-CORE.md` (in `powerbi-authoring/common/`) | Fabric CLI and REST core concepts. |
| `_unused-plugin-manifests/*` | Plugin registration files, deliberately disabled. |

## Also not applicable elsewhere in the bundle
- `vendor/learn/publish/{create-semantic-model, update-semantic-model-definition, create-report, update-report-definition, semantic-model-definition, report-definition, item-management-overview, long-running-operation, fabric-api-quickstart}.md`: Fabric REST, kept only as background.
- Modeling MCP features that connect to a **Fabric/service workspace** (the `ConnectToFabric` prompt, XMLA endpoints). The kit connects the MCP only to the **local Power BI Desktop** instance.
- `powerbi-report-author pack` / `unpack`: Fabric definition payloads, not used.
