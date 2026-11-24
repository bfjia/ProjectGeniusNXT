# 10: Tooling reference

The full sources are vendored:
- `vendor/npm-readmes/*.README.md`
- `vendor/powerbi-modeling-mcp/{README.md,TROUBLESHOOTING.md,EULA.txt}`
- `vendor/skills-for-fabric/powerbi-authoring/skills/powerbi-report-cli/references/authoring/{powerbi-report-author-cli,powerbi-report-author-cli-part-02,preview*,powerbi-desktop}.md`
- `vendor/learn/agentic/*.md`
- `vendor/learn/publish/*.md`
- `vendor/github-copilot-docs/...`

## 1. `powerbi-report-author` (npm `@microsoft/powerbi-report-authoring-cli`, MIT, public preview)

- **Version and runtime:** 0.5.0 at the time of writing. Node ≥ 20 (the kit's conda env provides Node 22). **The owner** installs it into the env with `npm install -g @microsoft/powerbi-report-authoring-cli@0.5.0` (no admin; `01-setup.md` §3); agents never install it. The binary is `powerbi-report-author`.
- **Dependencies:** ajv, commander, playwright (only for the headless service preview), powerbi-client, `@microsoft/powerbi-core-visual-schema` (the visual catalog), and `@microsoft/powerbi-desktop-bridge-cli`.
- **Output contract:** every command prints **one JSON object** on stdout: `{"data": …}` on success or `{"error": {"code", "message", "retryable", "details"}}` on failure. Global flags: `--pretty` (indented) and `--out <file>` (write the full envelope to a file and print a one-line summary).
- **Commands used by the kit:**

| Command | Use |
|---|---|
| `validate <path-to-.pbip-or-.Report>` | Full PBIR conformance: JSON Schema, IDs, formatting, theme, layout. Output: `data.result ∈ succeeded \| succeededWithWarnings \| failed`, `errorCount`, `warningCount`, `diagnostics: {<PBIR_CODE>: {severity, items: [{message, file, path}]}}`. Exit code 1 when failed. Only `PBIR_VISUAL_TYPE_UNKNOWN` and `PBIR_THEME_VISUAL_UNKNOWN` are warnings by design (custom visuals). |
| `catalog list` / `catalog describe <visualType>` | Built-in visual types, **data roles** (names, kinds, cardinality) and formatting keys. Used to confirm role names (donut, combo) and for `raw_visual` authoring. |
| `formatting list-objects <type>` / `describe-object <type> <object>` / `describe-property <type> <object> <prop>` / `search <term>` / `list-vcos` / `effective-properties` | Discover formatting property names, enum values and selectors (e.g. the alt-text property). |
| `expr encode --kind bool\|number\|integer\|string\|color\|themeColor <value> [percent]` / `expr decode '<json>'` | PBIR literal encoding. |
| `theme encode …`, `theme shade-color <hex> <percent>` | Theme value helpers. |
| `scaffold <dir> --name <N> [--model-path ../<M>.SemanticModel] [--page-name "Page 1"] [--force] [--offline]` | A complete PBIP report shell. **Always pass `--offline`**: without it, it fetches schema versions from GitHub. Used only as the fallback when there's no blank PBIP. |
| `preview <folder> --host desktop --status \| --reload \| --reload-with-model \| --screenshot …` | Desktop preview through the bridge. The kit calls `powerbi-desktop` directly instead (§2). |
| `preview-pages \| preview-visuals \| preview-filters \| preview-themes <path>` | Read-only enumeration, useful for QA summaries. |
| `pack <.Report> [--raw] [--mode create\|update] [--display-name N]` | Serializes a `.Report` into a Fabric definition payload (for the optional REST publish adapter, §5.3). |
| `doctor` | Environment self-check (Node, ajv, metadata provider, schema reachability). Schema reachability will fail without GitHub; treat that as a warning. |

## 2. `powerbi-desktop` (npm `@microsoft/powerbi-desktop-bridge-cli`, MIT)

- **Version and runtime:** 1.1.0. Node ≥ 20. Windows only: it talks to Desktop over the named pipe `pbi-desktop-bridge-{processId}`, using JSON-RPC 2.0. Remote access isn't supported, and only one operation runs per Desktop instance at a time.
- **Desktop settings:** File → Options → Security → **Desktop Bridge**, "Enable external tool access…" (on by default). Admin policy can disable it: `HKLM\SOFTWARE\Policies\Microsoft\Power BI Desktop\DesktopNamedPipeBridge = 0`.
- **Output:** commands write machine-readable JSON to stdout and diagnostics to stderr.

| Command | Purpose |
|---|---|
| `powerbi-desktop open <path.pbip>` | Launch Desktop with a report and wait for the bridge. |
| `powerbi-desktop status [--pid P]` | Instances, current file, `semanticModelDir`, `serverName` (e.g. `localhost:49768`), `databaseName`, `hasUnsavedChanges`, and PBIR pages. |
| `powerbi-desktop manifest --pid P` | The bridge manifest. |
| `powerbi-desktop reload --pid P` | Reload the currently open PBIP/PBIR report definition. **Discards unsaved Desktop edits.** For semantic-model changes, reopen the PBIP if they aren't reflected. |
| `powerbi-desktop screenshot <page-id> --pid P [--scale 1-3]` | Capture one page as PNG (CLI default scale 2). |
| `powerbi-desktop screenshot-all --pid P --output-dir D [--scale 1-3]` | Capture every page in `pages.json`. |

Notes:
- Use `--wait-seconds` right after a reload, or when the report is still loading.
- Some builds always report `hasUnsavedChanges: true` (e.g. Desktop 2.157.627.0), so don't block on that flag. Instead, the kit warns the user before reloading: *"Reload will discard unsaved Desktop edits — save first if you changed anything."*

## 3. Power BI Modeling MCP (npm `@microsoft/powerbi-modeling-mcp`, MIT + EULA)

- **Version and runtime:** 1.0.1. Node ≥ 18. Platform binaries are published for win32-x64/arm64 and linux-x64/arm64. Connecting to **Desktop** requires Windows.
- **Install (by the owner, no admin):** `npm install -g @microsoft/powerbi-modeling-mcp@1.0.1` inside the conda env. Its `bin` entry is `index.js`, and it depends on platform packages that contain the server executable.
- **Config (both hosts):** the root `.mcp.json`, generated by `pbi mcp-config` with absolute paths: `{"mcpServers": {"powerbi-modeling": {"type": "stdio", "command": "<env>\\node.exe", "args": ["<npm root -g>\\@microsoft\\powerbi-modeling-mcp\\index.js", "--start", "--readonly"]}}}`.
- Microsoft's documented form, `"command": "npx", "args": ["-y", "@microsoft/powerbi-modeling-mcp@latest", "--start"]`, **downloads the package at every start**. The kit doesn't use it (no agent-triggered installs).
- **Flags:**
  - `--start` (required)
  - `--readwrite` (the default; it asks for confirmation before each edit)
  - `--readonly` (blocks writes; **recommended for the kit**: add it to `args`, because the kit never writes through the MCP)
  - `--compatibility PowerBI|Full`
  - `--authmode interactive|serviceprincipal`
  - `--accepteula`
  - `--audit-log-path`
- **Environment variables:** `PBI_MODELING_MCP_ACCEPT_EULA=true`, `PBI_MODELING_MCP_TENANT_ID`, `PBI_MODELING_MCP_ALLOWED_CONNECTION_HOSTS`, `PBI_MODELING_MCP_AUDIT_LOG_PATH`, plus `AZURE_*` for a service principal.
- **EULA:** the server blocks every tool until the EULA is accepted. In an interactive session, call `accept_eula` after the user explicitly agrees; the acceptance is stored at `%LOCALAPPDATA%\Microsoft\powerbi-authoring-mcp\config.json`.
- **Tools:** `connection_operations`, `database_operations` (incl. import/export of TMDL folders), `transaction_operations`, `model_operations`, `table_operations`, `column_operations`, `measure_operations`, `relationship_operations`, **`dax_query_operations`** (execute/validate DAX), `trace_operations`, `partition_operations`, `user_hierarchy_operations`, `calculation_group_operations`, `security_role_operations`, `perspective_operations`, `named_expression_operations`, `function_operations`, `culture_operations`, `object_translation_operations`, `calendar_operations`, `query_group_operations`.
  - The parameter schemas aren't documented. **Read them from the server's tool list at runtime**; the QA skill tells the agent to inspect the tool schema before calling.
- **MCP prompts:** `ConnectToPowerBIDesktop` (finds the Desktop AS instance by file name), `ConnectToPBIP` (loads TMDL), `ConnectToFabric`, `CreateDAXQuery`, `RunDAXQueryWithMetrics`, `AnalyzeDAXQuery`.
- **Natural-language connection phrases:**
  - `Connect to '<File Name>' in Power BI Desktop`
  - `Open semantic model from PBIP folder '<path to …SemanticModel\definition>'`
- **Limits:**
  - DAX query results are capped at 100,000 rows.
  - It can only do modeling operations, not report pages or diagram layout.
  - It connects to a service workspace through XMLA, which needs capacity, so it's **not usable against Pro workspaces**. The kit only uses it with Desktop.
  - Avoid registering the local and remote servers at the same time.
  - Query results go to the LLM, so the kit only runs aggregate queries.
- **Troubleshooting:** `vendor/powerbi-modeling-mcp/TROUBLESHOOTING.md`.

## 4. GitHub Copilot hosts

### 4.1 VS Code
- **Harness:** use the **Copilot** harness. The Local harness is deprecated and removed by Feb 2027. Prompt files and handoffs exist only in Local.
- **Customizations:** Command Palette → **Chat: Open Customizations** lists agents, skills and instructions, with errors.
- **MCP:** **MCP: List Servers** to start, stop or restart a server. It reads the root `.mcp.json` (`mcpServers`). `.vscode/mcp.json` is the Local-format file; don't use it for the kit.
- **Skills:** type `/skill-name`, or let Copilot auto-load a skill by its description.
- **Agents:** the agent dropdown in Chat; delegation to subagents goes through the `agent` tool.

### 4.2 Copilot CLI (npm `@github/copilot`, Node 22+, installed by the owner into the conda env; or `winget install --id GitHub.Copilot --scope user`)
- **Requirements:** a Copilot subscription, org policy that allows the CLI, and PowerShell 6+ on Windows. Log in with `/login`.
- **Locations it reads:**
  - agents: `.github/agents/*.agent.md` (repo), `~/.copilot/agents/` (user)
  - skills: `.github/skills/`, `.claude/skills/`, `.agents/skills/` (repo); `~/.copilot/skills/` (user)
  - instructions: `AGENTS.md`, `.github/copilot-instructions.md`, `.github/instructions/**/*.instructions.md`
  - MCP: `.mcp.json` and `.github/mcp.json` (project), `~/.copilot/mcp-config.json` (user)
- **Trust:** the first launch in a folder asks to trust it. Project MCP servers and hooks load only in trusted folders (`--trust-folder` for a one-off non-interactive run).
- **Slash commands:** `/agent`, `/skills list|info|reload|add`, `/mcp`, `/instructions`, `/permissions`, `/add-dir`, `/login`.
- **Choosing an agent:** `copilot --agent pbi-orchestrator`. The ID is the file name without `.agent.md`; `--agent "PBI Orchestrator"` matches by `name`.
- **Permissions:**
  - `--allow-tool='shell(.\pbi.cmd:*)'`, `--allow-tool='write'`, `--deny-tool='shell(git push)'`, `--available-tools=…`, `--allow-all-tools`
  - Deny rules always win.
  - Command-line flags apply only to the current session; approvals given interactively are saved in `permissions-config.json`.
- **Non-interactive:** `copilot -p "<prompt>" --agent <id> [--allow-tool …] [-s] [--no-ask-user] [--output-format=json]`. In `-p` mode, any request that needs approval is denied unless it's pre-allowed.

## 5. Publishing and refresh (no Fabric capacity)

### 5.1 Desktop publish (the default path)
- **Steps:** File → Publish → Publish to Power BI → choose the workspace. Desktop builds a temporary PBIX and publishes **both the metadata and the local data cache**, so refresh in Desktop first.
- **Republishing:** a model that has a refresh schedule refreshes immediately after republish. New data sources need sign-in before the next scheduled refresh.
- **Name clashes:** two semantic models with the same name in a workspace can make publishing fail.
- **Licensing:** a Pro license is needed to create Power BI items in workspaces other than My workspace. Pro and PPU workspaces live on shared capacity (PPU doesn't provision a Fabric capacity).

### 5.2 Refresh in the service
- **Limits:**
  - shared capacity (Pro): **8 scheduled refreshes per day**, including API-triggered ones; manual on-demand refreshes don't count
  - each refresh must finish within 2 hours on shared capacity
  - PPU/Premium: 48 per day
  - the schedule is deactivated after 4 consecutive failures, and paused after 2 months of inactivity
- **Local files (`File.Contents`):** need the **on-premises data gateway**. Personal mode supports File/Folder sources, but Microsoft recommends a standard gateway. The gateway must be running.
- **SharePoint Online / OneDrive for Business (`SharePoint.Files`):** a cloud source, so **no gateway**. Set credentials in Settings → Data source credentials (OAuth2, organizational account). Each user has one set of credentials per data source, and each model has one owner (take it over to change credentials).
- **OneDrive caveat:** replacing a file by *copying over* it can break OneDrive refresh, so replace it with the same name through upload or save.

### 5.3 Optional automated publish (Fabric REST; **unverified on Pro**, off by default)

**Endpoints**
- Create semantic model: `POST https://api.fabric.microsoft.com/v1/workspaces/{workspaceId}/semanticModels`, body `{"displayName", "description", "definition": {"parts": [{"path": "definition.pbism", "payload": "<base64>", "payloadType": "InlineBase64"}, {"path": "definition/database.tmdl", …}, {"path": "definition/model.tmdl", …}, {"path": "definition/tables/Sales.tmdl", …}, …, {"path": ".platform", …}]}}`. Scopes `SemanticModel.ReadWrite.All` or `Item.ReadWrite.All`; workspace Contributor role. Returns 201, or 202 (LRO).
- Update definition: `POST …/semanticModels/{id}/updateDefinition[?updateMetadata=True]`, body `{"definition": {"parts": […]}}`. All parts must be included.
- Create report: `POST …/workspaces/{workspaceId}/reports`, with the PBIR parts (`definition.pbir` with **byConnection** `"connectionString": "semanticmodelid=<id>"`, `definition/version.json`, `definition/report.json`, `definition/pages/...`, `StaticResources/...`, `.platform`). `powerbi-report-author pack <.Report> --raw --mode create --display-name N` produces this body.
- Update report: `POST …/reports/{id}/updateDefinition`.

**Long-running operations:** a 202 response carries the `Location`, `x-ms-operation-id` and `Retry-After` headers. Poll `GET https://api.fabric.microsoft.com/v1/operations/{id}` until `Succeeded` or `Failed`, then `GET …/operations/{id}/result`. A 429 response carries `Retry-After`.

**Authentication:** a delegated user token for `https://api.fabric.microsoft.com/` (e.g. `az account get-access-token --resource https://api.fabric.microsoft.com`; verify on the tenant). A service principal requires the tenant setting "Service principals can use Fabric APIs".

**Caveats:**
- The deploy isn't idempotent: retrying can create duplicates. Look the item up by name first, then update.
- RLS members and incremental-refresh partitions can't be set through the API.
- **Whether these endpoints work in Pro/PPU workspaces isn't stated in the docs.** The kit keeps this adapter disabled unless `project.yaml publish.automated: true`, and only after a successful manual test against a throwaway workspace.

**The Power BI REST "Post Import"** endpoint (`/v1.0/myorg/groups/{id}/imports`) accepts .pbix, .json, .xlsx and .rdl, **not PBIP**. It isn't used.
