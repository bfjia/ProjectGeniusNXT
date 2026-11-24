# What the implementation needs from you (the project owner)

This file lists everything the plan (`00-PLAN.md`) needs from you: decisions to confirm, accounts and permissions, artifacts to provide, tasks only you can run (on Windows, with Power BI Desktop), information to pass to the implementer, and reviews. Each item says **when** it's needed (milestone), whether it's **blocking**, and the **fallback** if you can't provide it.

---

## 1. Summary checklist

> **Machine details, accounts and permissions are checked by the implementation agent**, not collected by you. At the start of M0 it runs the read-only checks in `11-environment-check.md` on the implementation computer, writes `ENVIRONMENT-CHECK.md`, and asks you only about failures and the few things it can't detect: your license type, workspace, SharePoint location, and whether to request policy changes from IT.

> **No admin rights are assumed, and agents never install anything.** When something is missing, the agent stops **before implementing** and gives you the exact per-user command (from `01-setup.md` §1–§4), or tells you to ask IT. You run it, and the agent re-checks and continues. Nothing is installed or reconfigured on your behalf.

| # | Item | Needed by | Blocking? | Section |
|---|---|---|---|---|
| 1 | Confirm the open decisions (defaults are proposed) | M0 | No (defaults apply) | §2 |
| 2 | Answer the environment-check questions the agent raises (only failures and owner-confirm items) | M0 | Depends on the item | §3, `11-environment-check.md` |
| 3 | **Run the install commands the agent lists** (all per-user, no admin), or ask IT; resolve blocked access (e.g. Copilot CLI/MCP policy, npm/conda mirrors) | M0, before implementation starts | Yes for required items | §3, `01-setup.md` §1–§4 |
| 4 | Power BI Pro/PPU license + a test workspace (Contributor or higher) | M10 | Only for publishing tests | §3 |
| 5 | **Blank PBIP saved by your Power BI Desktop** + Desktop version | M5–M6 (ideal), M10 (required) | Yes for M10 | §4.1 |
| 6 | **Visual gallery PBIP** (about 15 min) | after M9 | No (built-in templates as fallback) | §4.2 |
| 7 | **A local copy of the spreadsheets** for development (+ brief); anonymized is fine | M2 (tuning), M10 (real run) | No for M2; yes for M10 step 6 | §4.3, §4.5 |
| 8 | **The SharePoint link** the production dashboard will read from (if applicable) | before publish (M10) | Only for the production publish | §4.5 |
| 9 | Branding colors / theme (optional) | M6 | No | §4.4 |
| 10 | The few facts only you know (workspace, SharePoint location, locale, audience) | M0/M10 | No, but saves time | §5 |
| 11 | Windows test sessions (open/refresh in Desktop, MCP, screenshots, Copilot UI checks) | M5–M10 | Yes for the e2e acceptance | §6 |
| 12 | Reviews: context guide, KPI patterns for your domain, example dashboard | M2, M4, M6, M9 | No, but strongly recommended | §7 |
| 13 | Accept the Power BI Modeling MCP EULA (personally) | M7/M10 | Only for automated DAX reconciliation | §6.4 |

---

## 2. Decisions to confirm (the implementer uses these defaults unless you say otherwise)

| Decision | Default in the plan | Alternatives | Impact |
|---|---|---|---|
| Where the spreadsheets live | **Development: a local copy** (`source.mode: local`, files in `projects/<Name>/input/` or a local folder). **Production: the SharePoint link** you provide later (`source.mode: sharepoint`), switched with `pbi set-source` before publishing. | Stay local in production (network or local drive) | Local production needs an on-premises data gateway (personal mode is fine) on an always-on machine for scheduled refresh in the service. SharePoint doesn't. The local and SharePoint copies must use **the same file names, sheet names and layouts**. |
| Kit location on Windows | `%USERPROFILE%\pbi\PowerBIAgent` (short, user-writable, not under OneDrive) | Any short path you can write to without admin | Windows' 260-character limit; OneDrive can lock files while Desktop has them open. |
| Default gate mode | `gated` (approve KPIs, design, publish) | `fast` | Fast mode auto-approves KPIs and design, logging every assumption. Publish always needs you. |
| Locale / currency / fiscal year start | `en-US` / `USD` / January | e.g. `en-CA` / `CAD` / April | Drives date/number parsing, format strings and the fiscal columns. Set per project in `project.yaml`. |
| Theme | Neutral corporate (`08-report-design.md` §5) | Your brand colors (§4.4) | Only cosmetic. |
| Use of the Modeling MCP | Enabled, **read-only**, DAX reconciliation only | Disabled (manual paste of DAX results) | Without it, QA asks you to paste query results from Desktop's DAX query view. |
| Automated (REST) publishing | **Off** (publish from Desktop) | On, after a successful test on a throwaway workspace | Fabric REST on Pro workspaces is undocumented. Desktop publish always works. |
| Version control | Local `git`, no remote | A remote of your choice | Generated PBIPs diff cleanly in git. |
| Hosts to support | VS Code (Copilot harness) **and** Copilot CLI | One of them | Both are designed for; both get tested in M8/M10. |

**Tell the implementer** any changes (e.g. "spreadsheets will be on a network share", "fiscal year starts in April").

---

## 3. Accounts, licenses and permissions

The implementation agent verifies everything it can on the implementation computer (`11-environment-check.md`): OS, shells, installed software and versions, network/proxy reachability of npm, conda, the Marketplace and the Copilot and Power BI endpoints, npm install permissions, Power BI Desktop version and policies, Copilot CLI sign-in and policy, and MCP availability. It reports the results in `ENVIRONMENT-CHECK.md`. **Your part is to resolve what it can't fix itself.** The requirements are listed here so you know what may come up:

1. **GitHub Copilot.** An active subscription for the account used in VS Code and the CLI. If it's org-managed, ask your admin to make sure that:
   - **Copilot CLI** is enabled in the org/enterprise Copilot policies
   - **MCP servers in Copilot** is enabled (otherwise the `powerbi-modeling` tools won't appear)
   - the model(s) you want are allowed
2. **Software installs** (one time, **run by you; no admin needed**):
   - per-user winget and Microsoft Store packages: Miniconda ("Just Me"), VS Code (User Installer), Power BI Desktop and PowerShell 7 from the Microsoft Store, and Git (optional)
   - Node.js 22 comes with the conda environment, so no system Node install is needed
   - npm packages: `@microsoft/powerbi-report-authoring-cli@0.5.0`, `@microsoft/powerbi-desktop-bridge-cli@1.1.0`, and `@microsoft/powerbi-modeling-mcp@1.0.1`, and `@github/copilot` if you don't have Copilot CLI yet. All of these are installed **by you** into the conda env (no admin). The MCP is then registered with `.\pbi.cmd mcp-config`, which writes a config file and installs nothing.
   - conda-forge packages (the `environment.yml` list).
   - VS Code extensions (GitHub Copilot + Chat, TMDL, Python, YAML).
   - **If the public npm registry, conda-forge or the Marketplace are blocked:** ask IT for the internal mirror URLs and give them to the implementer. **Fallback without npm:** the kit still works (Python core + vendored schemas), but you lose official PBIR validation, Desktop reload/screenshots and MCP reconciliation; reconciliation becomes manual.
3. **Power BI.** A Pro (or PPU) license, plus a **test workspace** where you're at least Contributor (for the publish test in M10). Give the workspace name to the implementer. No Fabric capacity is needed.
4. **Power BI Desktop policies.** The Desktop Bridge must not be disabled by policy: check that the registry value `HKLM\SOFTWARE\Policies\Microsoft\Power BI Desktop\DesktopNamedPipeBridge` is absent or `1`.
5. **Refresh in the service:**
   - SharePoint mode: access to the SharePoint/OneDrive for Business folder (give the site URL and folder path, §5).
   - Local mode: an on-premises data gateway (personal mode) on an always-on machine. Installing it usually needs IT or admin rights, so **SharePoint mode is strongly recommended** for production.

---

## 4. Artifacts to provide

### 4.1 Blank PBIP (required by M10; ideally by M5)
Why: the generator copies the file shapes and `$schema` versions from a PBIP that **your** Desktop saved. That avoids "This version of Power BI does not support…" errors.
1. Update Power BI Desktop to the current release (September 2026 or later saves PBIR by default).
2. Open Desktop and create a new blank report. Don't add data.
3. **File → Save as → Save as type: Power BI project files (*.pbip)**, name it `Blank`.
4. Check the saved folder:
   - `Blank.pbip`
   - `Blank.Report\definition\` (PBIR). If you see `Blank.Report\report.json` instead, Desktop is too old.
   - `Blank.SemanticModel\definition\` (TMDL). If you see `model.bim` instead, enable the TMDL option under **File → Options → Preview features** and save again.
5. Create `DESKTOP_VERSION.txt` next to it containing the version from **Help → About** (e.g. `2.159.xxx.0, November 2026`).
6. Zip the folder (it contains no data) and give it to the implementer, or put it at `tools/templates/blank-pbip/` in the kit.

*Fallback until it's provided:* the implementer generates a provisional blank (from `powerbi-report-author scaffold --offline` plus a hand-written model shell), marked `PROVISIONAL.txt`. It's fine for development but must be replaced before M10.

### 4.2 Visual gallery PBIP (after M9; recommended)
Why: visual JSON details (data-role names, title binding, color by measure, comparison labels on cards) vary between Desktop versions. Harvesting them from your Desktop makes the generated visuals match exactly.
1. Run `.\pbi.cmd gallery-model $env:USERPROFILE\pbi\gallery` (the implementer provides this command in M9).
2. Open `%USERPROFILE%\pbi\gallery\Gallery.pbip` and click **Refresh**.
3. Follow `GALLERY-INSTRUCTIONS.md`. You'll add about 14 standard visuals with specified fields, set one title and one bar color through **fx → Field value**, and add alt text to one visual. Save.
4. Run `.\pbi.cmd harvest-templates $env:USERPROFILE\pbi\gallery\Gallery.pbip`, or zip the gallery folder and send it to the implementer.

*Fallback:* built-in templates derived from Microsoft's examples (`visualContainer` 2.9.0, which Desktop upgrades on save). Some details, such as donut and combo roles, are then verified with `powerbi-report-author catalog describe`.

### 4.3 Sample data and brief (optional for M2; needed for the real run in M10)
- 1–3 representative spreadsheets as a **local copy** (anonymize or remove personal data such as names and emails), ideally including any messy real-world features (title rows, merged cells, monthly columns). Development always runs against local copies (§4.5).
- A filled brief using `06-context-guide.md` §2 (the 5-question minimum is enough).
- Any existing KPI definitions document (paste the relevant parts, or fill `kpi-definitions.csv`).
- These tune the profiler heuristics and the KPI pattern library to your domain.

### 4.4 Branding (optional, M6)
Primary, secondary and accent colors (hex); good/warning/bad colors if your organization has standards; font (default Segoe UI); a logo (v1 doesn't place logos, but it can be added later).

### 4.5 Data location: a local copy for development, the SharePoint link for production
1. **During development (always):** put a local copy of the spreadsheets in `projects/<Name>/input/`, or in a local folder you name. The project uses `source.mode: local`, and `source.local_folder` points to that folder as Windows sees it. Profiling, building, Desktop refresh and QA all run against this copy. No SharePoint access is needed yet.
2. **For production (when the dashboard will be published and refreshed from SharePoint or OneDrive for Business):** give the agent the link. Any of these works:
   - the **folder URL** from the browser address bar while viewing the folder in SharePoint, e.g. `https://contoso.sharepoint.com/sites/Finance/Shared%20Documents/PowerBI/RetailOps`
   - a **file URL** (Details pane → Path → Copy, or the file's "Copy path"), e.g. `…/Shared Documents/PowerBI/RetailOps/Sales.xlsx`
   - a OneDrive for Business URL, e.g. `https://contoso-my.sharepoint.com/personal/jane_contoso_com/Documents/PowerBI`
   - Avoid *sharing links* such as `https://contoso.sharepoint.com/:x:/g/…?e=…`. They hide the real path. If that's all you have, open it and copy the address of the containing folder instead.
3. The agent runs `pbi set-source -p <Name> --sharepoint-url "<link>"`. It derives the site URL and folder path, switches `source.mode` to `sharepoint`, rebuilds, and adds a publish-checklist item to confirm that **the SharePoint files have exactly the same names, sheets and layouts as the local copy**.
4. **Test it before publishing.** Open the rebuilt PBIP in Desktop, sign in to SharePoint when prompted (Organizational account), and click Refresh. Then publish and set the data source credentials in the service (OAuth2). No gateway is needed.
5. To go back to local development at any time, run `pbi set-source -p <Name> --local "<folder>"`.

---

## 5. Information

### 5.1 Collected automatically by the implementation agent (no action from you)
The environment check (`11-environment-check.md`) records:
- the OS and architecture, whether it's running in WSL, the PowerShell version, path-length and OneDrive risks
- the versions of winget, git, Node/npm, conda, Python, VS Code (+ extensions), Copilot CLI and Power BI Desktop (MSI or Store)
- proxy settings and package-registry configuration
- reachability of npm, conda-forge, the VS Code Marketplace, Copilot, and the Power BI/Entra endpoints
- npm global-install permission
- Power BI Desktop policies (Desktop Bridge)
- whether a data gateway is installed
- Copilot CLI sign-in and policy status
- MCP availability (after M8)

If the agent is working on a different computer from your Windows/Power BI machine, it will ask you to run the same check there at M10 (it gives you the commands, or runs them in a session with you).

### 5.2 Only you can tell the agent (it will ask when needed)
- Internal npm/conda mirror URLs, **if** the check shows the public registries are blocked.
- Your Power BI license type (Pro or PPU) and the test workspace name and role (§3.3).
- The production SharePoint/OneDrive link, when you're ready (§4.5).
- Your preferred locale, currency, fiscal year start and week start.
- Who the typical dashboard audience is in your organization (executives, managers, analysts). It informs the default page set.

---

## 6. Tasks only you can run (Windows + Power BI Desktop)

The implementer will ask for these and give exact commands. Plan for 3–4 short sessions.

### 6.1 Setup (M0–M1; about 45 min)
The implementation agent first runs the environment check (`11-environment-check.md`) and tells you what's missing. Then **you** run the per-user commands it lists (`01-setup.md` §1–§4) for whatever's missing. The agent never installs anything:
- install the software
- set the Desktop options (Preview: *Detect and reload external PBIP changes*; Security: Desktop Bridge on; Auto date/time off)
- create the conda env
- run `.\pbi.cmd doctor` and share the output

Anything that requires your sign-in (Copilot `/login`, Power BI Desktop sign-in) must be done by you.

### 6.2 Model and report checks (M5–M6; about 20 min each round)
- Open the generated example `.pbip` in Desktop and click **Refresh**. Report any error message verbatim (with a screenshot).
- Browse each page; note visuals that are blank, clipped or show errors.
- Optional: `.\pbi.cmd screenshots -p _example` (with Desktop open) and send the PNGs.

### 6.3 Copilot customization checks (M8; about 20 min)
- **VS Code:**
  - Command Palette → **Chat: Open Customizations**: 7 agents and 8 skills, with no errors.
  - Type `/` in Chat and check that the `pbi-*` skills are listed.
  - **MCP: List Servers** shows `powerbi-modeling` running.
- **Copilot CLI** (in the kit folder): trust the folder, then:
  - `/agent` lists the 7 agents
  - `/skills list` lists the 8 skills
  - `/mcp` shows `powerbi-modeling`
  - `/instructions` shows AGENTS.md plus 4 instruction files
- **Smoke test:** `copilot -p "Run pbi status for project _example and report the next action" --agent pbi-orchestrator --allow-tool='shell(.\pbi.cmd:*)' -s`

### 6.4 QA run with the MCP (M7/M10; about 20 min)
- Read `reference/powerbi-modeling-mcp/EULA.txt`. If you agree, tell the agent explicitly ("I accept the Power BI Modeling MCP EULA") when it asks. **Only you can accept it.**
- With the example PBIP open in Desktop, run the `pbi-qa` agent and let it run the reconciliation queries. Confirm the pass/fail report.

### 6.5 Verification log (M10; about 30 min, together with the implementer)
Go through the 14 items in `09-format-reference.md` §6 with the implementer, e.g. "the Date table loads", "titles bound to measures render", "bar colors follow the Color measure", "SharePoint-mode refresh works without a gateway".

### 6.6 Real project (M10; about 1 hour)
Run one real dashboard end to end in gated mode with your own data and brief. Approve or adjust at the KPI and design gates, and give feedback on KPI quality and usefulness.

### 6.7 Publish test (M10; about 20 min)
1. Upload a copy of the example input files to a SharePoint test folder and give the agent its link.
2. The agent runs `pbi set-source … --sharepoint-url` and rebuilds.
3. Refresh in Desktop (sign in to SharePoint when prompted).
4. Publish to the test workspace, set the data source credentials (SharePoint OAuth2), schedule a refresh, and confirm that it succeeds.

---

## 7. Reviews (strongly recommended)

| When | What | Why |
|---|---|---|
| M2 | `docs/CONTEXT-GUIDE.md` + the brief template (from `06-context-guide.md`) | Make sure the wording fits your users and organization. |
| M4 | The KPI pattern library (`07-kpi-framework.md` §4) for **your** domain(s) | Add or adjust the KPI patterns your organization actually uses. Add a domain section if needed (e.g. specific public-health or lab metrics). |
| M6 | The example dashboard (wireframes + Desktop render) | Confirm the page structure and visual style meet your expectations before the design rules are finalized. |
| M9 | `docs/USER-GUIDE.md`, `docs/SETUP.md` | They should be usable by your colleagues without help. |

---

## 8. If something is unavailable: impact and fallback

| Unavailable | Impact | Fallback |
|---|---|---|
| Copilot CLI disabled by policy | The CLI host can't be tested | VS Code only; the files stay CLI-compatible. |
| MCP servers disabled by policy | No automated DAX reconciliation | Manual: paste the DAX query results (`work/reconcile/queries.dax`) from Desktop's DAX query view. |
| npm blocked | No official PBIR validation, bridge or MCP | Python core + vendored-schema validation; manual Desktop checks. |
| Blank PBIP not provided | Risk of schema-version errors in Desktop | Provisional blank; validate against your Desktop as early as possible. |
| Gallery not built | Small risk that some visual details differ | Built-in templates + `catalog describe`. |
| No test workspace | Publishing untested | The publish checklist is still generated; test later. |
| No real data | Heuristics tuned only on synthetic data | Provide data later; M10 step 6 is postponed. |
| A component only has an admin installer, or is blocked by policy | That feature is unavailable until IT helps | Use the per-user alternative (Store apps, Miniconda "Just Me", Node from the conda env, npm tools inside the env), or ask IT. The agent says which features are affected. |
| No SharePoint link yet | The production refresh path is untested | Keep developing on the local copy; switch with `pbi set-source` when the link exists. Publishing a local-mode model needs a gateway for scheduled refresh. |
| The implementation computer has no Power BI Desktop (e.g. Linux/WSL) | Desktop-dependent checks can't run there | The agent defers them to your Windows machine (§6) and re-runs the environment check there. |
