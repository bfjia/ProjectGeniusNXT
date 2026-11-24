# 01: Setup instructions

> The implementer copies this document, adapted to the final file names, into the kit as `docs/SETUP.md`. It is written for the **end user**. A short section at the end covers the implementer's own dev machine.

---

## 0. Overview: what gets installed, and who installs it

**Ground rules**
- **No administrator rights are assumed.** Every component below has a **per-user** install option. If your organization blocks one, ask IT to install it (or use the listed fallback).
- **The agents never install anything.** That covers the implementation agent and the Copilot agents in the finished kit. They don't run `winget`, `npm install`, `pip install`, `conda create/install`, `code --install-extension` or `npx -y`, and they don't change PATH, registry, npm or conda configuration. When something is missing, the agent **stops before implementing**, lists what's missing with the exact commands from this document, and waits for you to run them (or to get IT to install them). Then it re-checks.

| Component | Required? | No-admin install | Why |
|---|---|---|---|
| Windows 10/11 | Required | n/a | Power BI Desktop, the Desktop Bridge and the Modeling MCP's Desktop connection are Windows-only. |
| Power BI Desktop (release from Sept 2026 or later) | Required | **Microsoft Store** app (per-user, auto-updates) | Opens and validates the generated PBIP, refreshes data, publishes. The MSI download needs admin, so use the Store version. |
| Power BI Pro (or PPU) license + a workspace | Required to publish | n/a | No Fabric capacity is needed. Publishing uses Desktop (File → Publish). |
| VS Code + GitHub Copilot (Chat) extension | Required (one of the two hosts) | VS Code **User Installer**; extensions are per-user | Copilot agent host #1. Use the **Copilot** harness (the Local harness is deprecated and removed by Feb 2027). |
| PowerShell 7 | Required for Copilot CLI | **Microsoft Store** "PowerShell" (per-user) | Copilot CLI needs PowerShell 6+ on Windows. Windows PowerShell 5.1 isn't enough. |
| GitHub Copilot CLI | Required (second host) | `npm install -g @github/copilot` inside the conda env, or winget with `--scope user` | Copilot agent host #2. Needs Node 22+. |
| GitHub Copilot subscription | Required | n/a | Your org must allow Copilot CLI and MCP servers in Copilot policies. |
| Miniconda (Windows) | Required | Installer option **"Just Me"** (per-user) | Provides the `pbiagent` environment: Python, **and Node.js 22**, so no system Node install (which needs admin) is required. |
| Node.js 22 | Required for the Microsoft tools and Copilot CLI | **Comes with the conda env** (`nodejs=22` from conda-forge) | If you already have Node ≥ 22 on PATH, that works too. |
| `@microsoft/powerbi-report-authoring-cli` 0.5.0 | Strongly recommended | `npm install -g` inside the conda env | `powerbi-report-author validate` is the official PBIR conformance check. It also provides `catalog describe` for visual roles. |
| `@microsoft/powerbi-desktop-bridge-cli` 1.1.0 | Recommended | same | Reloads Desktop after rebuilds and takes page screenshots for visual QA. |
| `@microsoft/powerbi-modeling-mcp` 1.0.1 | Recommended | same; it's **pre-installed**, never fetched at startup (`npx -y` isn't used) | Lets the QA agent run DAX queries against the open Desktop model to reconcile KPI values. |
| Git for Windows | Optional | winget `--scope user` if available, otherwise skip or ask IT | Local version history only. |
| On-premises data gateway | Only if production files stay on a local or network drive | Usually needs IT | **Avoided by publishing from SharePoint/OneDrive for Business** (`source.mode: sharepoint`). |

Everything comes from **winget/Microsoft Store, conda-forge and npm**. Nothing needs GitHub access at runtime. If your network blocks the public npm registry or conda-forge, ask IT for the internal mirror URLs. You (not the agent) then set them with `npm config set registry <url>` / `conda config --add channels <url>`.

The conda environment uses **conda-forge only** (`channels: [conda-forge, nodefaults]`). That avoids the Anaconda `defaults` channel, which some organizations restrict for licensing reasons.

---

## 1. Install the software (Windows, PowerShell, no admin)

Open **Windows Terminal → PowerShell** and run the commands below. Skip anything you already have. **None of them need administrator rights.** If a command fails with an access or policy error, note it and ask IT for that component; the agent will tell you which features are affected.

```powershell
# Miniconda, per-user ("Just Me"). If winget's user scope isn't offered, download the Windows installer
# from the Anaconda website and choose "Just Me (recommended)" — no admin needed.
winget install --id Anaconda.Miniconda3 --scope user

# VS Code (User Installer)
winget install --id Microsoft.VisualStudioCode --scope user

# Power BI Desktop from the Microsoft Store (per-user). Or open the Microsoft Store app and search "Power BI Desktop".
winget install --id 9NTXR16HNW1T --source msstore

# PowerShell 7 from the Microsoft Store (per-user). Or search "PowerShell" in the Microsoft Store app.
winget install --id 9MZ1SNWT0N5D --source msstore

# Optional: Git, per-user (skip if winget reports no user-scope installer)
winget install --id Git.Git --scope user
```

Close and reopen the terminal (open **PowerShell 7**, `pwsh`), then check:

```powershell
pwsh --version          # 7.x
conda --version
code --version
git --version           # optional
```

Node.js, the Microsoft tools and (optionally) Copilot CLI are installed **into the conda environment** in §2–§3. That's why they aren't in this list.

### 1.1 VS Code extensions (per-user)

In VS Code, install (Extensions view, or `code --install-extension <id>`):
- **GitHub Copilot** and **GitHub Copilot Chat** (sign in with your GitHub account).
- **TMDL** (`analysis-services.TMDL`): syntax highlighting and diagnostics for `.tmdl` files.
- **Python** (`ms-python.python`) and **YAML** (`redhat.vscode-yaml`). The YAML extension validates the kit's spec files against their JSON schemas.
- **Don't** install the Power BI Modeling MCP extension as well. The kit registers the MCP through `.mcp.json`, and two registrations conflict.

If your organization restricts extensions, ask IT to allow these IDs.

In the Copilot Chat view, choose the **Copilot** harness (the Session Target control), not **Local**.

### 1.2 Power BI Desktop options (one time)

Open Power BI Desktop and go to **File → Options and settings → Options**. These are per-user settings; no admin is needed.

1. **Preview features**: enable **Detect and reload external PBIP changes** (Desktop August 2026 or later), then restart Desktop. When the kit rebuilds files, Desktop shows an *Apply external changes* banner instead of requiring a reopen.
2. **Security → Desktop Bridge**: make sure **Enable external tool access to Power BI Desktop through secure local APIs** is on (it's the default). It's needed for `powerbi-desktop reload/screenshot`. If it's greyed out, an IT policy disables it; the kit then skips reload and screenshots.
3. **Global → Data Load → Time intelligence**: turn **Auto date/time for new files** off. The kit generates its own Date table.
4. **Global → Regional settings**: note the locale. Put the same locale in `project.yaml` (`locale:`) so text→date/number conversions match.
5. **Report settings → Report objects** (optional): enable **Copy object names when right clicking on report objects**. It helps when you reference visuals in feedback.

---

## 2. Get the kit and create the environment (you run these)

1. **Choose a short local path you can write to without admin.** Windows limits project paths to 260 characters (enabling long paths needs admin, so keep paths short), and OneDrive sync can lock files while Desktop has them open.
   - Recommended: `%USERPROFILE%\pbi\PowerBIAgent` (e.g. `C:\Users\<you>\pbi\PowerBIAgent`).
   - Use `C:\pbi\…` only if you're allowed to create folders at the drive root.
   - If the kit must stay on OneDrive, set `output.root` in each `project.yaml` to a short, non-synced folder such as `%USERPROFILE%\pbi\out`.
2. **Create the conda environment** from the kit root. It includes Python 3.11 **and Node.js 22**:

```powershell
cd $env:USERPROFILE\pbi\PowerBIAgent
conda env create -f environment.yml      # creates env "pbiagent" (per-user, no admin)
conda activate pbiagent
node --version                           # v22.x
npm config get prefix                    # should point inside the pbiagent env (no admin needed for -g installs)
.\pbi.cmd --version                      # the kit runs from source; no pip install needed
```

To update later, run `conda env update -f environment.yml --prune`.

3. **Use the wrapper scripts.** Agents call the tools through wrappers, so they work without `conda activate`:
   - Windows: `.\pbi.cmd <command>`. It sets `PYTHONPATH=<kit>\tools`, then calls `conda run --no-capture-output -n pbiagent python -m pbiagent <command>`.
   - Linux/macOS/WSL: `./pbi <command>`.

---

## 3. Install the Microsoft Power BI tools and Copilot CLI into the env (you run these)

```powershell
conda activate pbiagent
$env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1"     # the report CLI pulls in playwright; the kit doesn't need its browsers
npm install -g @microsoft/powerbi-report-authoring-cli@0.5.0
npm install -g @microsoft/powerbi-desktop-bridge-cli@1.1.0
npm install -g @microsoft/powerbi-modeling-mcp@1.0.1

# Copilot CLI, if you don't already have it (needs Node 22+, which the env provides):
npm install -g @github/copilot
#   (alternative without the env: winget install --id GitHub.Copilot --scope user)

powerbi-report-author --version
powerbi-report-author doctor --pretty     # environment self-check; "schema reachability" may warn without GitHub; that's fine
powerbi-desktop --help
copilot --version
```

Notes:
- These are installed inside the `pbiagent` environment, so no admin is needed. The kit's tools always run them through the env.
- If you installed Copilot CLI into the env, start it from an activated env (`conda activate pbiagent`, then `copilot`).
- Versions are pinned because the Microsoft packages are public preview and may break between 0.x versions. Upgrading is your decision. To upgrade, change the version, re-run, then run `.\pbi.cmd selftest`.
- `powerbi-report-author scaffold` normally fetches the newest schema versions from GitHub. The kit always passes `--offline`, so nothing is fetched.

### 3.1 Sign in to Copilot CLI (only you can do this)

```powershell
conda activate pbiagent     # if Copilot CLI was installed into the env
copilot
# inside the CLI:
/login
```

Follow the browser prompt. Type `/exit` to quit.

---

## 4. Configure the Power BI Modeling MCP server (optional, recommended)

The MCP server is **pre-installed** (§3) and started directly with Node. Unlike the `npx -y` form in Microsoft's docs, this never downloads anything at startup. Generate the kit's `.mcp.json` with:

```powershell
.\pbi.cmd mcp-config      # writes .mcp.json using the env's node.exe and the installed package path
```

The result looks like this (both VS Code's Copilot harness and Copilot CLI read it; the paths are machine-specific):

```json
{
  "mcpServers": {
    "powerbi-modeling": {
      "type": "stdio",
      "command": "C:\\Users\\<you>\\miniconda3\\envs\\pbiagent\\node.exe",
      "args": ["C:\\Users\\<you>\\miniconda3\\envs\\pbiagent\\node_modules\\@microsoft\\powerbi-modeling-mcp\\index.js", "--start", "--readonly"]
    }
  }
}
```
`--readonly` is intentional. The kit only reads from the model (DAX queries, structure checks) and never writes through the MCP. `.mcp.json` is machine-specific, so it's in `.gitignore`.

### 4.1 Accept the EULA (one time; only you can do this)

Read `reference/powerbi-modeling-mcp/EULA.txt`. The server blocks every tool until the EULA is accepted. Two ways to accept:
- **Interactive (recommended):** the first time the QA agent uses the MCP, it asks you. Reply "I accept the Power BI Modeling MCP EULA" and the agent calls the `accept_eula` tool. Acceptance is stored in `%LOCALAPPDATA%\Microsoft\powerbi-authoring-mcp\config.json` (per-user).
- **Unattended:** after reading the EULA, run `.\pbi.cmd mcp-config --accept-eula`, which adds `"--accepteula"` to `args`.

### 4.2 Check that it's loaded

- **VS Code:** Command Palette → **MCP: List Servers** → `powerbi-modeling` should show as running. If its tools don't appear in Copilot Chat, check that the **MCP servers in Copilot** policy is enabled for your account or org on GitHub.com (ask IT/admin if not).
- **Copilot CLI:** start `copilot` in the kit folder and answer **Yes** to "trust this folder". Project MCP servers load only in trusted folders. Then run `/mcp` to list the servers.

What the kit uses the MCP for:
- connecting to the open Desktop file (`Connect to '<Name>' in Power BI Desktop`)
- running DAX `EVALUATE` queries for KPI reconciliation
- optionally loading the PBIP `definition` folder to check that the TMDL parses

DAX queries return at most 100,000 rows. If the MCP isn't available (not installed, or blocked by policy), QA falls back to giving you DAX queries to paste into Desktop's DAX query view.

---

## 5. Provide the blank PBIP template (required, one time)

The generator copies schema versions and boilerplate from a PBIP that **your** Power BI Desktop saved. This prevents "This version of Power BI does not support the version you have provided" errors.

1. Open Power BI Desktop and create a new blank report. Don't add any data.
2. Go to **File → Save as**, choose the type **Power BI project files (*.pbip)**, name it `Blank`, and save it into `<kit>\tools\templates\blank-pbip\`.
3. Close Desktop.
4. Check the folder. It must contain `Blank.pbip`, `Blank.Report\definition\` (PBIR) and `Blank.SemanticModel\definition\` (TMDL). If you see `Blank.SemanticModel\model.bim` instead of `definition\`, go to **Options → Preview features**, enable the TMDL storage option, and save again. If you see `Blank.Report\report.json` at the report root instead of `definition\`, your Desktop is too old; update it.
5. Write your Desktop version (**Help → About**) into `tools\templates\blank-pbip\DESKTOP_VERSION.txt`.
6. Run `.\pbi.cmd template check`. It reports the detected schema versions and any problems.

## 6. Build the visual template gallery (recommended, about 15 minutes, one time)

The kit includes built-in visual templates, but harvesting real visuals from your Desktop version is the most reliable approach.

1. Run `.\pbi.cmd gallery-model $env:USERPROFILE\pbi\gallery`. This creates `%USERPROFILE%\pbi\gallery\Gallery.pbip` (a small model with embedded sample data) and `GALLERY-INSTRUCTIONS.md`.
2. Open `Gallery.pbip` in Desktop and click **Refresh**.
3. Follow `GALLERY-INSTRUCTIONS.md`. For each listed visual it gives the exact page, visual type, fields and title. Save after each page.
4. Close Desktop, then run `.\pbi.cmd harvest-templates $env:USERPROFILE\pbi\gallery\Gallery.pbip`. Templates are written to `tools\templates\gallery\` and the built-in ones are no longer used.

---

## 7. Verify the setup

```powershell
.\pbi.cmd doctor
```

Expected output: every line `OK`, or `WARN` for optional parts.

| Check | OK means |
|---|---|
| python / packages | the conda env is present with the required packages |
| blank-pbip | the template was found and PBIR + TMDL detected; the schema versions are listed |
| gallery templates | harvested (OK), or built-in templates in use (WARN) |
| vendored schemas | `reference/json-schemas` was found and the schema versions used by the blank are present |
| node | version 22 or later (from the conda env or on PATH) |
| powerbi-report-author | found, and `doctor` passes |
| powerbi-desktop (bridge) | found. "No running instance" is fine. |
| Power BI Desktop | an install was detected |
| .mcp.json | present and parseable; its `command`/`args` paths exist (regenerate with `.\pbi.cmd mcp-config`) |

If something is missing, `doctor` prints the exact no-admin command for **you** to run. The kit never installs anything itself.

Then run the self-test: `.\pbi.cmd selftest`. It builds `projects\_example` from the bundled synthetic workbook and validates it. Open `projects\_example\output\HarborOutfitters\HarborOutfitters.pbip` in Desktop and click **Refresh**. It should load without errors.

---

## 8. Daily use (quick start)

### VS Code
1. Open the kit folder in VS Code and select the **Copilot** harness in Chat.
2. Put your spreadsheets in `projects\<Name>\input\` (or let the agent run `pbiagent init`).
3. Fill in `projects\<Name>\context\brief.md` (see `docs\CONTEXT-GUIDE.md`). Five minutes on the "minimum brief" already helps a lot.
4. In Chat, choose the **pbi-orchestrator** agent and type: `/pbi-new-dashboard <Name>`. You can also describe what you want in plain words.
5. Answer the agent's questions. At each gate (KPIs, design, publish), review the generated file and reply `approve` or give feedback.

### Copilot CLI

```powershell
cd $env:USERPROFILE\pbi\PowerBIAgent
copilot --agent pbi-orchestrator
# then type, e.g.:  Build a dashboard for project RetailOps
```

Recommended permissions, so the agent doesn't ask for every command:

```powershell
copilot --agent pbi-orchestrator `
  --allow-tool='shell(.\pbi.cmd:*)' --allow-tool='shell(conda:*)' `
  --allow-tool='shell(powerbi-report-author:*)' --allow-tool='shell(powerbi-desktop:*)' `
  --allow-tool='write' --deny-tool='shell(git push)'
```

### Fast mode (no gates)
Set `mode: fast` in `project.yaml`, or tell the orchestrator "fast mode". The agent records every assumption in `docs\assumptions-and-decisions.md`.

---

## 9. Publishing (no Fabric capacity needed)

1. The publisher agent runs `.\pbi.cmd publish-check <Name>` and shows you the checklist.
2. Open the `.pbip` in Desktop and click **Refresh**, then **File → Publish → Publish to Power BI**, and choose your workspace.
3. In the Power BI service, open the semantic model's **Settings**:
   - **Data source credentials**: sign in (SharePoint/OneDrive: OAuth2 with your organizational account).
   - **Gateway connection**: needed only if the spreadsheets are on a local or network drive (`source.mode: local`). Install the **on-premises data gateway (personal mode)** on an always-on machine. Installing a gateway usually needs IT, which is another reason to publish from SharePoint.
   - **Scheduled refresh**: Pro allows up to 8 per day; PPU allows 48.
4. Recommended: **develop on a local copy, publish from SharePoint.**
   - While building and testing, keep a local copy of the spreadsheets (`source.mode: local`).
   - Before publishing, upload the same files (same names, sheets and layouts) to SharePoint or OneDrive for Business and give the agent the folder link. The agent runs `.\pbi.cmd set-source -p <Name> --sharepoint-url "<link>"`, which switches to `source.mode: sharepoint` and rebuilds.
   - Refresh once in Desktop (sign in with your organizational account), then publish. No gateway is needed.
   - Use the folder address from the browser, or "Copy path" in the file details. Token sharing links (`…/:x:/g/…?e=…`) don't reveal the folder, so they can't be used.

---

## 10. Using WSL instead of Windows (limited)

Running VS Code or Copilot CLI inside WSL works for profiling, generation and offline validation. Desktop integration (MCP DAX reconciliation, the Desktop Bridge) is not available there, because those tools must run on the same Windows host as Power BI Desktop. If you use WSL:
- install Miniconda and Node inside WSL
- use `./pbi`
- keep `source.local_folder` as a **Windows** path, e.g. `D:\Data\X`, because Power BI Desktop reads it
- open the PBIP from Windows Explorer (`\\wsl$\...` paths are not supported by Desktop; keep the kit on a Windows drive such as `/mnt/c/pbi`)

---

## 11. Troubleshooting

| Symptom | Fix |
|---|---|
| Desktop: "This version of Power BI does not support the version you have provided in X" | A schema version in the generated files is newer than your Desktop supports. Update Desktop, or re-save the blank PBIP with your current Desktop and rebuild. |
| Desktop: `UnrecognizedSchemaVersion` | Wrong `$schema` family in a file. Run `.\pbi.cmd validate <Name>`, then rebuild. Report it as a kit bug. |
| Desktop won't open: TMDL parse error with a line number | Open the named `.tmdl` file at that line. Usually caused by bad indentation or quoting in a hand edit. Rebuild from the specs, or fix the spec. |
| Refresh error `DataSource.NotFound` / file not found | `source.local_folder` in `project.yaml` must be the folder **as Windows sees it**. Rebuild, or change the `SourceFolder` parameter in Desktop (**Transform data → Edit parameters**). |
| Refresh error `Formula.Firewall` | A table combines sources with different privacy levels. In Desktop: **File → Options → Current file → Privacy → Ignore privacy levels**, or set both sources to Organizational. Report it, because the generator should not produce cross-source queries. |
| MCP tools missing in VS Code | Run **MCP: List Servers** → restart `powerbi-modeling`. Check the Copilot MCP policy on GitHub.com. Make sure it isn't registered twice (extension + `.mcp.json`). |
| MCP: every call fails with an EULA message | Accept the EULA (section 4.1). |
| Copilot CLI ignores `.mcp.json` | Trust the folder (restart `copilot` in the kit root), then check `/mcp`. |
| `powerbi-desktop status` shows no instances | Desktop isn't running, or the Desktop Bridge security option is off, or an admin policy disabled it (registry `HKLM\SOFTWARE\Policies\Microsoft\Power BI Desktop\DesktopNamedPipeBridge = 0`). |
| Long-path errors | Move the kit or `output.root` to a shorter path such as `%USERPROFILE%\pbi`. |
| OneDrive "file in use" or conflict copies | Pause OneDrive sync while working, or move `output.root` out of OneDrive. |

---

## 12. Implementer dev-machine notes (not for end users)

- Development and unit tests can run on Linux/WSL or Windows, with the Python 3.11 + Node 22 conda env. `powerbi-report-author` also works on Linux for `validate`, `catalog` and `scaffold --offline`. **The implementation agent installs nothing.** The person operating the dev machine runs the install commands in §1–§3 when the agent asks.
- These tasks need a Windows machine with Desktop, so ask the user to run them: the end-to-end acceptance (open in Desktop, refresh, MCP reconciliation, bridge screenshots), saving the blank PBIP, and building the gallery.
- Until the user supplies the blank PBIP, develop against the shell from `powerbi-report-author scaffold <tmp> --name Blank --offline` plus a hand-written semantic-model shell (see `09-format-reference.md` §2). Mark these as provisional in `tools/templates/blank-pbip/PROVISIONAL.txt`.
