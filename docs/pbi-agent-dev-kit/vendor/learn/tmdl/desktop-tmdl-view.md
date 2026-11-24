<!-- Source: https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-tmdl-view (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Work with TMDL view

**TMDL view** in Power BI Desktop and Power BI service lets you script, modify, and apply changes to semantic model objects by using a modern code editor and [Tabular Model Definition Language (TMDL)](../developer/projects/projects-dataset). It improves development efficiency and provides complete visibility and control over semantic model metadata.

TMDL view offers an alternative experience to semantic modeling by using code instead of a graphical user interface such as [Model view](desktop-relationship-view).

TMDL view offers the following advantages:

-   **Enhanced development efficiency** with a rich code editor that includes search-and-replace, keyboard shortcuts, multi-line edits and more.
-   **Increase reusability** by easily scripting, sharing, and reusing TMDL scripts among semantic model developers. For example, use a centralized SharePoint site to easily share reusable semantic model objects such as calendar tables, or time intelligence calculation groups.
-   **More control and transparency** by showing all semantic model objects and properties, and allowing changes to items not available in the Power BI user interface, such as *[IsAvailableInMDX](/en-us/dotnet/api/microsoft.analysisservices.tabular.column.isavailableinmdx)* or *[DetailRowsDefinition](/en-us/dotnet/api/microsoft.analysisservices.tabular.measure.detailrowsdefinition)*.

Note

**TMDL View in Power BI Desktop** is **Generally Available**, while **TMDL View on the web** is available in **Preview**.

## Script to TMDL

In Power BI Desktop, select the **TMDL view** icon located along the left side of the window, as shown in the following image.

![Screenshot of Tabular Model Definition Language T-M-D-L view.](media/desktop-tabular-model-definition-language-view/tmdl-view-01.png)

In the Power BI service or Fabric portal workspace, select **TMDL View (Preview)**.

![Screenshot showing the TMDL View button in Power BI service.](media/desktop-tabular-model-definition-language-view/service-tmdl-view.png)

When TMDL view opens the code editor is initially empty. You can script any semantic model object such as a table, measure, or column by selecting the objects from the **Data pane** and dragging them onto the code editor:

![Screenshot of dragging a semantic model object onto the T-M-D-L view canvas.](media/desktop-tabular-model-definition-language-view/tmdl-view-02.png)

When using TMDL view and dragging the object from the Data pane, Power BI scripts the entire object metadata into the current tab as TMDL, or opens a new tab if the current tab isn't empty, as a [*createOrReplace*](/en-us/analysis-services/tmdl/tmdl-scripts#createorreplace-command) TMDL script of the selected objects, as shown in the following image:

![Screenshot of the T-M-D-L metadata being created automatically.](media/desktop-tabular-model-definition-language-view/tmdl-view-03.png)

Alternatively, you can right-click an object in the Data view and select **Script TMDL** to new tab or to the clipboard, shown in the following image:

![Screenshot of right-clicking on an object in Data view to have Power BI create T-M-D-L metadata code.](media/desktop-tabular-model-definition-language-view/tmdl-view-04.png)

Tip

-   You can script entire sections - measures, tables or columns - by dragging the section into code editor to script all objects within the section.
-   Multi selection is supported by pressing the CTRL key before scripting the objects into the TMDL view code editor.

## Code editor

Once you've scripted a semantic model object or pasted TMDL script into the code editor, you can use the comprehensive code experience features offered by the TMDL view code editor. The code experience features enable you to either explore the model metadata, or make modifications that can later be applied to the semantic model.

### Semantic highlighting

Semantic highlighting is built into the code editor, which improves readability by applying different colors to parts of your code based on meaning. Such color coding makes it easier to understand the structure and functionality of your TMDL code, as shown in the following image.

![Screenshot of color coding and semantic highlighting for T-M-D-L metadata code.](media/desktop-tabular-model-definition-language-view/tmdl-view-05.png)

You can also expand or collapse sections of your TMDL script, as shown in the following image:

![Screenshot of collapsing sections of code in the code editor.](media/desktop-tabular-model-definition-language-view/tmdl-view-06.png)

### Autocomplete

Autocomplete is built into the code editor, and offers intelligent suggestions while you type. Autocomplete can speed up your workflow, reduce the chance of errors, and help you understand your code options by dynamically suggesting possible values or properties by taking into consideration the cursor position.

![Screenshot of autocomplete in the code editor.](media/desktop-tabular-model-definition-language-view/tmdl-view-07.png)

You can also trigger the autocomplete feature in any location by pressing *Ctrl+Space*.

### Tooltips

The context tooltip shows on mouse hover, providing information about each TMDL object or property.

![Screenshot of a context tooltip shown on mouse hover in the code editor, displaying information about a TMDL object or property.](media/desktop-tabular-model-definition-language-view/tmdl-view-20.png)

### Code actions

When the cursor is on a squiggle or selected text, the TMDL view displays a light bulb icon indicating available Code Actions, such as generating lineage tags or correcting property name misspellings.

![Screenshot of the TMDL view in the code editor showing a light bulb icon next to a squiggle, indicating available Code Actions like generating lineage tags.](media/desktop-tabular-model-definition-language-view/tmdl-view-21.png)

![Screenshot of the TMDL view in the code editor showing a light bulb icon next to a squiggle, indicating available Code Actions like correcting property name misspellings.](media/desktop-tabular-model-definition-language-view/tmdl-view-22.png)

### Code formatting

Format your TMDL code by pressing Shift + Alt + F or by clicking the Format option in the ribbon.

![Screenshot of the code editor with TMDL code being formatted using the Format option in the ribbon.](media/desktop-tabular-model-definition-language-view/tmdl-view-23.png)

You can also format selected text using the "Format Selection" option in the context menu.

![Screenshot of the code editor with TMDL code being formatted the Shift + Alt + F keyboard shortcut.](media/desktop-tabular-model-definition-language-view/tmdl-view-24.png)

### Error diagnostics

The code editor's built-in error diagnostics help you identify and fix issues by highlighting TMDL language errors in the code editor, with detailed messages that provide guidance on resolving them. Additionally, an error summary is available in the **Problems pane**, allowing easy navigation to the error location in the code editor, as shown in the following image.

![Screenshot of error diagnostics in the code editor.](media/desktop-tabular-model-definition-language-view/tmdl-view-08.png)

## Apply changes to the semantic model

When you're ready, you can select the **Apply** button to execute the TMDL script against the semantic model, and have your TMDL code changes applied.

![Screenshot of applying your script using the apply button in the code editor.](media/desktop-tabular-model-definition-language-view/tmdl-view-09.png)

When successful, a notification is displayed and your modeling change are applied to the semantic model.

![Screenshot of success banner in the code editor indicating changes were successfully applied.](media/desktop-tabular-model-definition-language-view/tmdl-view-10.png)

In the event of a failure, an error notification is displayed to show that your modeling changes weren't applied to the semantic model. You can view more information about the error by selecting the *Show details* link in the notification, which then expands the **Output pane** and displays error details.

![Screenshot of failure banner in the code editor indicating changes weren't successful.](media/desktop-tabular-model-definition-language-view/tmdl-view-11.png)

Note

TMDL view modifies only the semantic model metadata, without refreshing data or affecting the report. If your changes require a data refresh, such as altering a PowerQuery expression or calculated column expression, you must manually refresh the table or model for the changes to take effect. Additionally, renaming a field in TMDL view may break visuals within the report that use that field.

## Preview changes to the semantic model

TMDL view enables you to preview script changes by showing a preview of the semantic model before and after script execution, shown as a TMDL code diff. Previewing script changes is particularly useful when copying scripts from other sources, letting you to assess their impact before running them against your semantic model.

Selecting the **Preview** button displays a TMDL diff of the semantic model before and after executing the TMDL script in the opened tab.

![Screenshot of the preview button to preview script changes.](media/desktop-tabular-model-definition-language-view/tmdl-view-15.png)

A side-by-side window appears in the right pane, as shown in the following image.

[![Screenshot of preview view pane for pending script changes.](media/desktop-tabular-model-definition-language-view/tmdl-view-16.png)](media/desktop-tabular-model-definition-language-view/tmdl-view-16.png#lightbox)

Red and green boxes highlight the changes, with red boxes indicated removed or changed lines, and green indicating new lines.

![Screenshot of red and green highlights for pending script changes.](media/desktop-tabular-model-definition-language-view/tmdl-view-17.png)

Note

The comparison isn't directly against the TMDL script currently displayed, but rather a comprehensive semantic model comparison before and after executing the script. So, some properties may be ordered differently than what is shown in the tab, adhering to the default TMDL property/object ordering.

The preview is read-only, but you can keep editing your script. To refresh the preview after changes, select the **Update Preview** button, as shown in the banner in the following image.

![Screenshot of the update preview button.](media/desktop-tabular-model-definition-language-view/tmdl-view-18.png)

There's a toolbar in the top right corner of the preview screen that enables navigation of all code diffs, enabling you to toggle between *inline* or *side-by-side* diff, viewing or hiding unchanged regions, and closing the preview view.

![Screenshot of the toolbar for script preview.](media/desktop-tabular-model-definition-language-view/tmdl-view-19.png)

There are a few considerations to keep in mind when previewing changes to the semantic model:

-   TMDL view resets view configurations to default on each preview execution.
-   A preview runs only with a valid TMDL change. Invalid TMDL scripts won't execute a preview and an error is displayed in the Output pane.

## TMDL script tabs

In TMDL view you can have multiple script tabs at once, any of which can be renamed or removed.

![Screenshot of multiple tabs in the T-M-D-L view.](media/desktop-tabular-model-definition-language-view/tmdl-view-12.png)

The *Problems* and *Output* panes display errors and messages specific to the script tab that's currently selected and displayed. Switching to a different TMDL script tab refreshes both of those panes with information specific to the selected and currently shown tab.

You can select the *Clear* button to empty the *Output* pane messages.

![Screenshot of the clear button used to empty output pane messages.](media/desktop-tabular-model-definition-language-view/tmdl-view-14.png)

Messages are kept only for each Power BI Desktop session, so restarting Power BI Desktop clears all output messages for all script tabs.

In TMDL view in Power BI Desktop, the report file saves the contents of the TMDL view tabs, so you can continue where you left off the next time you open the Power BI Desktop report file. When saving to a [Power BI Project (PBIP)](/en-us/power-bi/developer/projects/projects-dataset), each script tab is saved as a .tmdl file in the *\\TMDLScripts* folder, as shown in the following image.

![Screenshot of the file structure for saving tabs in a Power BI Desktop file.](media/desktop-tabular-model-definition-language-view/tmdl-view-13.png)

Tip

You can open and edit TMDL scripts in Visual Studio Code, and they properly reload after restarting Power BI Desktop.

In TMDL view on the web, script tabs and script contents aren't persisted. They're discarded when the semantic model or browser session is closed.

## Compatibility level upgrade prompt

The [compatibility level](/en-us/analysis-services/tabular-models/compatibility-level-for-tabular-models-in-analysis-services) of a Power BI semantic model determines the features that are accessible. TMDL view allows you to add any Analysis Services object or property, even if it's not available at the current compatibility level. When applying a change that necessitates a compatibility level upgrade, TMDL view provides a prompt indicating which object or objects require the upgrade.

![Screenshot of the TMDL view in Power BI with a Compatibility Level Upgrade prompt. The message indicates that the current compatibility level of 1550 is below the required level of 1601 for the FormatStringDefinition property and asks whether to upgrade and re-apply the change.](media/desktop-tabular-model-definition-language-view/tmdl-view-25.png)

## Object renaming with TMDL view

To rename an object within the TMDL view, it is necessary to script its parent. For instance, renaming a column requires scripting the table, while renaming a table necessitates scripting the entire semantic model. Learn more about tabular object model hierarchy in the following document: [Tabular object model hierarchy](/en-us/analysis-services/tom/introduction-to-the-tabular-object-model-tom-in-analysis-services-amo?view=asallproducts-allversions#tabular-object-model-hierarchy&preserve-view=true).

With the TMDL view, bulk renaming can be performed efficiently using simple find and replace patterns. For instance, you can rename all table columns to lowercase by following these steps.

Open the TMDL view, script the table you intend to modify.

Press CTRL+F to open the find and replace dialog, ensure that the Regular Expression option is enabled.

![Screenshot of the TMDL view in Power BI showing the Find and Replace feature in use. The Replace input is active with an option to toggle between Find and Replace modes, highlighted in the toolbar above the code editor.](media/desktop-tabular-model-definition-language-view/tmdl-view-26.png)

Enter the following patterns in the find and replace fields and select **Replace All.**

| Action  | Pattern/Replacement   |
|---------|-----------------------|
| Find    | `(^\s+column\s+)(.+)` |
| Replace | `$1\L$2`              |

![Screenshot of a Power BI data model configuration screen showing a Product table definition with two columns: product (string) and productkey (int64), along with their metadata properties.](media/desktop-tabular-model-definition-language-view/tmdl-view-27.png)

Run your TMDL script to rename all table columns to lowercase instantly:

![Screenshot of a Power BI Product table showing 14 columns including brand, category, color, manufacturer, product, productkey, subcategory, unit cost, unit price, and weight attributes.](media/desktop-tabular-model-definition-language-view/tmdl-view-28.png)

Notice that column name will differ from the sourceColumn property.

![Screenshot of a Power BI data model configuration showing the productKey column definition with int64 datatype, where the sourceColumn is mapped to ProductKey in the source data.](media/desktop-tabular-model-definition-language-view/tmdl-view-29.png)

Synchronization between the semantic model table and Power Query query relies on sourceColumn, keeping names independent. When you open the Power Query editor, it will display the column names that match the sourceColumn, rather than the model's column name. Additionally, renaming a column in the user interface will not automatically add a rename step to the query until sourceColumn and column name are identical.

![Screenshot of the Power BI Query Editor showing product data with columns for ProductKey, Product Code, Product, and Manufacturer, with 16 queries visible in the navigation pane.](media/desktop-tabular-model-definition-language-view/tmdl-view-30.png)

## TMDL view and Power BI project

When you save your work as a Power BI project (PBIP), you gain access to your semantic model definition metadata as [TMDL files](/en-us/power-bi/developer/projects/projects-dataset#tmdl-format), providing a useful source control and co-development experience, while also allowing you to [make changes](/en-us/power-bi/developer/projects/projects-dataset#make-external-changes-to-tmdl-files) to the semantic model outside of Power BI Desktop. However, if you modify the TMDL files within the PBIP, you must restart Power BI Desktop to reload those changes. In contrast, the TMDL view follows a scripting mental model, enabling you to efficiently apply changes directly to the semantic model being edited in Power BI Desktop using TMDL, regardless of whether the file format is PBIX or PBIP.

You can seamlessly integrate both experiences. For instance, you can update the TMDL definition in PBIP for quick changes without launching Power BI Desktop, and utilize the TMDL view when Power BI Desktop is already open to efficiently implement a series of changes to the semantic model using TMDL. Both approaches offer a rich and consistent TMDL coding experience.

Tip

For an enhanced TMDL authoring experience when editing TMDL files externally in Visual Studio Code, use the [TMDL Visual Studio Code Extension](https://marketplace.visualstudio.com/items?itemName=CPIM.TMDL-language-support). This extension provides DAX and Power Query semantic highlighting, autocomplete, diagnostics, code actions, code formatting, breadcrumb navigation, and localization support for TMDL documents.

## TMDL view in Power BI service (preview)

Use TMDL view on the web to script, modify, and apply changes to your published semantic models. TMDL view on the web offers the same experience as Power BI Desktop with a few exceptions.

| Key Difference                                                        | TMDL View in Power BI Desktop                                                                         | TMDL View on the Web (Preview)                                                                                                                                                            |
|-----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **View mode and Edit mode**                                           | No distinct modes - you can make and apply changes to the model at any time.                          | Introduces two modes: **View mode** (to script and preview changes) and **Edit mode** (to apply them to the model). This feature enables safer experimentation before committing changes. |
| **Script persistence**                                                | TMDL scripts are saved as part of the semantic model. A model might contain previously saved scripts. | Scripts aren't persisted. The system discards them when the semantic model or browser is closed. Previously saved scripts aren't displayed.                                               |
| **[Version history support](service-semantic-model-version-history)** | Not available.                                                                                        | Leverages workspace version history to restore previous versions of the semantic model if needed.                                                                                         |
| **Write permissions**                                                 | Not applicable. Desktop authoring doesn't rely on workspace permission levels.                        | Requires [write permissions on the semantic model](../connect-data/service-datasets-permissions)\*\* to open and use the experience.                                                      |

## Common use cases for TMDL view

**Scenario:** I need to reuse or share a semantic model table with its complete definition, including columns, Power Query expression, and sort by configuration, and others in another semantic model.

**Solution:** Open the semantic model with the table, script it using the TMDL view. Copy the script to the other Power BI Desktop window, open the TMDL view tab, and apply the script.

  

------------------------------------------------------------------------

**Scenario:** I've named all my tables with the prefixes "dim\_" or "fact\_". I'd like to remove these prefixes without manually updating each of the over 100 tables.

**Solution:** Open the TMDL view, script the semantic model, search for the prefix (regular expressions are supported) and replace it with an empty text.

  

------------------------------------------------------------------------

**Scenario:** I need to create a perspective in my semantic model to use the [personalized visuals feature](../create-reports/power-bi-personalize-visuals). However, I can't create or edit it using the graphical interface of Power BI Desktop.

**Solution:** Open the TMDL view, create a new empty tab (or use the script from an existing perspective), then create or edit the perspective using TMDL. This method also applies to other semantic model metadata that lack a graphical interface, such as translations, detail row expressions and others.

``` lang-tmdl
createOrReplace
      perspective SalesView
        perspectiveTable Sales
            perspectiveMeasure 'Sales Amount'
            perspectiveMeasure 'Sales Qty'
            perspectiveColumn Quantity
            perspectiveColumn 'Amount'
```

  

------------------------------------------------------------------------

**Scenario:** I need to modify the Power Query expression of my table without triggering a refresh.

**Solution:** Script the table, modify the Power Query expression, and apply the changes. TMDL view doesn't require refreshing your data.

  

------------------------------------------------------------------------

**Scenario:** I need switch the storage mode of my table from DirectQuery to Import, and vice-versa

**Solution:** Script the table, update the partition mode, and apply changes.

  

------------------------------------------------------------------------

**Scenario:** I need to back up my semantic model definition before making significant changes and easily roll back to a previous definition, if needed.

**Solution:** Script the semantic model or specific parts you want to back up, make your changes in other views, and if needed, return to the TMDL view to restore the previous metadata by running the saved script.

  

------------------------------------------------------------------------

## Considerations and limitations

-   You can use the TMDL view to edit any object or property within a semantic model. However, incomplete or incorrect modifications may lead to unexpected behavior. For more guidance on these operations, refer to the [Model Authoring article](../developer/projects/projects-overview#model-authoring).
-   The *Command palette* displays some commands that aren't currently supported.
-   Setting up the *initial* Git integration *from* the workspace won't include TMDL View scripts saved in published semantic model. Learn more in the [Fabric Git integration](/en-us/fabric/cicd/git-integration/git-get-started?wt.mc_id=fabric_inproduct_gitintegration&tabs=commit-to-git#connect-a-workspace-to-an-azure-repo) article.

## Related content

The following articles describe more about TMDL and its uses.

-   [Get started with TMDL](/en-us/analysis-services/tmdl/tmdl-how-to)
-   [Tabular Model Definition Language (TMDL)](/en-us/analysis-services/tmdl/tmdl-overview)
-   [Power BI Desktop projects](../developer/projects/projects-overview)
-   [Power BI Desktop project semantic model folder](../developer/projects/projects-dataset)

------------------------------------------------------------------------
