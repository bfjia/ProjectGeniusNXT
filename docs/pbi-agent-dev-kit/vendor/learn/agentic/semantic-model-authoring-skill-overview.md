<!-- Source: https://learn.microsoft.com/en-us/power-bi/developer/agentic/semantic-model-authoring-skill-overview (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# What is the Power BI Semantic Model Authoring skill?

Important

This feature is in preview.

The Power BI [`semantic-model-authoring`](https://github.com/microsoft/skills-for-fabric/blob/main/skills/semantic-model-authoring/SKILL.md) skill lets AI agents create, edit, deploy, and manage Power BI semantic models across Power BI Desktop, PBIP projects, and the Fabric Service. The skill ships in the [**Skills for Fabric**](https://github.com/microsoft/skills-for-fabric) marketplace, bundled inside the `powerbi-authoring` plugin.

The skill covers a broad range of semantic model tasks, for example:

-   Creating new semantic models in Import, DirectQuery, or Direct Lake mode.
-   Editing existing models - tables, columns, relationships, measures, and DAX.
-   Optimizing DAX performance and analyzing models against best practices.
-   Preparing semantic models for AI consumption by Fabric Copilot and Power BI Data Agents.
-   Deploying models to Fabric workspaces, refreshing them, and managing data sources, parameters, and permissions.

## Prerequisites

Before you begin, ensure you have:

-   **The `powerbi-authoring` plugin installed** - Follow the instructions in [Power BI Agentic overview](power-bi-agentic-overview#get-started) to install the plugin. Installing the plugin makes the `semantic-model-authoring` skill available and registers the Power BI Authoring MCP server.
-   **A semantic model** - Power BI Desktop with a model open, a PBIP project on disk, or a semantic model in a Fabric workspace.

## Get started

1.  Open Power BI Desktop with a semantic model loaded.

2.  In GitHub Copilot, run a smoke-test prompt to confirm the skill and MCP server are wired up correctly:

    ``` lang-text
    /semantic-model-authoring Connect to Power BI Desktop and analyze the semantic model against best practices
    ```

The agent loads the `semantic-model-authoring` skill, connects to Power BI Desktop through the Power BI Authoring MCP server, inventories the model, and reports findings grouped by severity. If the agent prompts you to register the MCP server or install the plugin, revisit the install steps before continuing.

Tip

To make sure a specific skill is loaded, invoke it explicitly with a slash command - for example, `/semantic-model-authoring [your prompt]`.

### Why the Power BI MCP server matters

The `semantic-model-authoring` skill doesn't have a hard dependency on the Power BI Authoring MCP server, but it's strongly recommended. The skill **Tool Selection Priority** routes authoring operations to the MCP server first because it's the most reliable and full-featured path.

When the MCP server isn't registered, the skill falls back to direct TMDL file editing (PBIP) or REST `getDefinition` / `updateDefinition` round-trips (Fabric workspace). Authoring against Power BI Desktop with no PBIP and no MCP isn't supported - the agent stops and asks you to register the MCP server or save the model as PBIP.

For manual installation or advanced configuration, see the [Power BI Authoring MCP documentation](/en-us/power-bi/developer/mcp/power-bi-authoring-mcp).

## Example: Prepare a semantic model for AI

Use this example to validate your setup end to end. The prompt invokes the skill's **Semantic Model AI Readiness** workflow, which loads the `semantic-model-ai-readiness.md` reference and walks the readiness checklist to configure your model for conversational AI experiences such as Fabric Copilot and Power BI Data Agents.

1.  **Open your model.** Start Power BI Desktop and open the PBIX or PBIP whose semantic model you want to prepare for AI consumption.

2.  **Start GitHub Copilot** in the folder of your project.

3.  **Run the prompt:**

    ``` lang-text
    /semantic-model-authoring Connect to Power BI Desktop and prepare the semantic model for AI
    ```

    The slash command loads the `semantic-model-authoring` skill. The skill recognizes the AI-readiness intent, loads the [`semantic-model-ai-readiness.md`](https://github.com/microsoft/skills-for-fabric/blob/main/skills/semantic-model-authoring/references/semantic-model-ai-readiness.md) reference, and runs the [**Semantic Model AI Readiness**](https://github.com/microsoft/skills-for-fabric/blob/main/skills/semantic-model-authoring/SKILL.md#workflow-semantic-model-ai-readiness) workflow.

4.  **Review and approve.** The agent inventories the model, evaluates it against the readiness checklist, and presents findings grouped by severity. Each finding is tagged as agent-applicable or user-action-required. Approve the fixes you want applied.

5.  **Apply and validate.** The agent applies approved changes through the MCP server (or through TMDL edits if MCP isn't registered), saves the model, and recommends testing representative natural-language prompts in Copilot or your Data Agent.

## Example: Create a semantic model on top of a Fabric Lakehouse

This example exercises the skill's **Create new Semantic Model** workflow against a Lakehouse data source, which produces a Direct Lake model.

1.  **Prepare the Lakehouse.** In the Fabric portal:

    1.  Create a workspace - for example, `SalesAnalytics`.
    2.  In that workspace, create a Lakehouse - for example, `SalesLakehouse`.
    3.  Load the Lakehouse with sample data. The fastest path is to open the Lakehouse and select **Start with sample data** to load the built-in **Public holidays** or **NYC Taxi** datasets, or upload your own files to **Files** and load them to **Tables**.

2.  **Start GitHub Copilot** in any folder.

3.  **Run the prompt** with your workspace and Lakehouse names:

    ``` lang-text
    /semantic-model-authoring Create a semantic model on top of Lakehouse SalesLakehouse in workspace SalesAnalytics
    ```

    The slash command loads the `semantic-model-authoring` skill, which runs the [**Create new Semantic Model**](https://github.com/microsoft/skills-for-fabric/blob/main/skills/semantic-model-authoring/SKILL.md#workflow-create-new-semantic-model) workflow. The agent:

    1.  Resolves the workspace and Lakehouse IDs and discovers the Lakehouse schema (tables, columns, data types).
    2.  Creates a **Direct Lake** semantic model following, and loads the relevant modeling guidelines.
    3.  Deploys the model to the target workspace

4.  **Verify in Fabric.** Open the workspace and confirm the new semantic model appears.

## Troubleshooting

-   **Skill isn't being loaded** - Verify plugin installation and registration by following [Power BI Agentic overview](power-bi-agentic-overview#get-started). If setup is correct and the skill still isn't selected, the agent might miss the skill during progressive disclosure. Test with an explicit slash command, then add more intent details to your prompt:
-   **MCP server isn't loading** - Restart GitHub Copilot CLI after installing or registering the plugin so the new MCP configuration is picked up. Then run `/mcp show` to confirm Power BI MCP appears and is working.

## Related content

-   [Power BI MCP servers overview](../mcp/mcp-servers-overview)
-   [MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)
-   [Prepare your data for AI](/en-us/power-bi/create-reports/copilot-prepare-data-ai)

------------------------------------------------------------------------
