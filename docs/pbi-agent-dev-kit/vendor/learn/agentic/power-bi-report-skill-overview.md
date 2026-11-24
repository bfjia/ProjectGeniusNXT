<!-- Source: https://learn.microsoft.com/en-us/power-bi/developer/agentic/power-bi-report-skill-overview (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Power BI Report skill

The **Power BI Report skill** (`powerbi-report-cli`) is a unified AI-agent skill for planning, designing, authoring, validating, and managing Power BI reports. It routes requests across four integrated capabilities—**report planning**, **report design**, **report authoring**, and **report management**—distributed as **Markdown modules within one skill**. Users install and invoke one skill rather than coordinating separate companion skills.

The skill works with **PBIR (Power BI Report)** definitions in **PBIP (Power BI Project)** files and with reports hosted in Microsoft Fabric. It is distributed through the [Power BI authoring plugin](https://github.com/microsoft/skills-for-fabric/tree/main/plugins/powerbi-authoring) in the [Skills for Fabric](https://github.com/microsoft/skills-for-fabric) marketplace.

Combined with the [Power BI MCP servers](../mcp/mcp-servers-overview) and Power BI development tools, the skill supports an end-to-end workflow across semantic-model inspection, report planning, visual design, PBIR authoring, host-aware visual verification, and Fabric report management.

## Integrated capabilities

The skill uses a shared entry point and loads the appropriate module or modules for each request.

| Module                 | Responsibility                                                                                                                                                                       |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SKILL.md`             | Routes user intent, defines shared workflows and boundaries, and coordinates the capability modules.                                                                                 |
| `report-planning.md`   | Gathers requirements, inspects dependencies, defines scope and audiences, creates the page plan, and records approval.                                                               |
| `report-design.md`     | Produces or reviews layout, visual selection, information hierarchy, themes, colors, typography, and accessibility.                                                                  |
| `report-authoring.md`  | Creates and modifies PBIR/PBIP report definitions, validates their structure, and verifies rendered results through Power BI Desktop when available or a headless browser otherwise. |
| `report-management.md` | Lists, downloads, creates, updates, publishes, and deletes Power BI reports in Fabric workspaces.                                                                                    |

These modules are implementation details of one skill. Users don't need to install or invoke them independently.

## Choose the right workflow

The skill routes requests according to intent and can enter the workflow at any stage.

| Request                                           | Starting capability                                     | Typical next step                                      |
|---------------------------------------------------|---------------------------------------------------------|--------------------------------------------------------|
| “Build a sales dashboard”                         | Planning                                                | Design, authoring, validation, and optional publishing |
| “What pages and KPIs should this report contain?” | Planning                                                | Design or approval                                     |
| “Make this report look professional”              | Design                                                  | Authoring and visual verification                      |
| “Review this report's layout and accessibility”   | Design                                                  | Approved design changes                                |
| “Add a card showing `[Total Sales]`”              | Authoring                                               | Validation and rendered-output verification            |
| “Create a report from this semantic model”        | Authoring, or planning when requirements are incomplete | Validation and optional publishing                     |
| “Validate or fix this PBIR report”                | Authoring                                               | Host-aware rendered-output verification                |
| “Publish this report to a Fabric workspace”       | Management                                              | Confirm deployment result                              |
| “Download or update a report from Fabric”         | Management                                              | Authoring or local review                              |

## Common scenarios

Use the Power BI Report skill to:

-   Plan a new report from an existing semantic model.
-   Define report audiences, goals, pages, KPIs, filters, and delivery requirements.
-   Create a design brief covering layout, visual selection, themes, colors, and typography.
-   Critique and modernize an existing report while preserving its analytical intent.
-   Create or modify pages, visuals, slicers, filters, bookmarks, formatting, and themes in PBIR.
-   Replace legacy visuals with supported modern visuals and restore their field bindings and formatting.
-   Diagnose empty visuals, error icons, invalid `queryState`, or incorrect role bindings.
-   Validate report definitions and capture rendered screenshots through the `powerbi-report-author` CLI.
-   Detect the available preview host and use Power BI Desktop when installed or the headless browser flow otherwise.
-   Publish, download, update, list, or delete reports in Fabric workspaces.

## Example prompts

-   “Plan an executive sales report using this semantic model.”
-   “Create a design brief for a three-page operations dashboard.”
-   “Modernize this report and improve its visual hierarchy and accessibility.”
-   “Add KPI cards, a clustered column chart, and a date slicer to the overview page.”
-   “Validate the PBIR files and fix any structural errors.”
-   “Detect the available preview host, verify the updated layout, and capture screenshots.”
-   “Publish this report to the Finance workspace.”
-   “Download the current Fabric report definition so I can edit it locally.”

## End-to-end workflow

For a new report, use the following default workflow:

1.  **Plan** — Identify the audience, business goals, required insights, semantic-model dependencies, page scope, and delivery target.
2.  **Design** — Define each page's purpose, layout, visual hierarchy, chart choices, interactions, theme, and accessibility requirements.
3.  **Author** — Create or update the PBIR files, bind visuals to model fields and measures, and apply formatting.
4.  **Validate** — Run structural validation, and reload and inspect the report in Desktop;
5.  **Manage** — Publish or update the report in the target Fabric workspace when deployment is requested.

You don't need the complete sequence for every task. A precise edit can begin with authoring, a visual-review request can begin with design, and a deployment request can begin with management.

The following chart shows the primary entry points and how work can move between capabilities:

[![Flowchart showing Report skills workflow.](media/power-bi-report-skill-flowchart.png)](media/power-bi-report-skill-flowchart.png#lightbox)

Users can also start directly with **Design**, **Author**, **Validate**, or **Manage** when earlier stages are already complete.

## How the skill complements Power BI tools

| Layer                           | Tool or capability                                             | Responsibility                                                                                                            |
|---------------------------------|----------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| Semantic model                  | [Power BI MCP servers](../mcp/mcp-servers-overview)            | Create and update tables, columns, relationships, measures, and DAX.                                                      |
| Report planning and design      | **Power BI Report skill**                                      | Define requirements, report structure, layout, visual choices, themes, and accessibility.                                 |
| Report authoring and validation | **Power BI Report skill** with the `powerbi-report-author` CLI | Create and edit PBIR and PBIP definitions, validate structure, detect the preview host, and capture rendered screenshots. |
| Preview host                    | Power BI Desktop or headless browser                           | Use Desktop when installed; otherwise, use the headless-browser flow.                                                     |
| Fabric report lifecycle         | **Power BI Report skill**                                      | Create, download, update, publish, list, and delete Fabric report items.                                                  |

## Scope and boundaries

Choose this skill for the **report layer**: requirements, report structure, pages, visuals, filters, slicers, interactions, bookmarks, formatting, themes, validation, and Fabric report lifecycle operations.

For semantic-model development—including tables, columns, relationships, measures, and DAX—use the [Power BI MCP servers](../mcp/mcp-servers-overview).

Report management covers report items in Fabric. It doesn't replace workspace administration, deployment-pipeline administration, capacity management, or semantic-model permission management.

## Considerations

-   **File support** — Local report authoring requires PBIP projects that use the PBIR report format.
-   **Validation** — Structural validation doesn't replace visual verification. Run the `powerbi-report-author` CLI host preview command after meaningful authoring changes. The agent uses Power BI Desktop when it's installed and falls back to the headless browser when it isn't.
-   **Source control** — Commit a baseline before allowing an agent to make substantial PBIR changes so that changes can be reviewed or reverted.
-   **Source of truth** — Save manual Power BI Desktop changes before asking the agent to modify the report. The PBIR files on disk are the source of truth for local authoring.
-   **Model dependencies** — Report visuals depend on existing tables, columns, and measures. Create missing model objects with the modeling tools before binding report visuals to them.
-   **Legacy visuals** — Avoid creating visuals scheduled for deprecation, including Q&A, Bing Maps, and filled maps. Prefer supported modern visuals.
-   **Auto-mode** - Agent assumes all permissions are enabled in auto-mode; we recommend using "interactive" mode for production ready reports.

------------------------------------------------------------------------
