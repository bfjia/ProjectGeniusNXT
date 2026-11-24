<!-- Source: https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-report (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Power BI Desktop project report folder

This article describes the files and subfolders in a Microsoft Power BI Desktop project's **Report** folder. The files and subfolders here represent a Power BI report. Depending on your project, the report folder can include:

-   .pbi\\
    -   [localSettings.json](#pbilocalsettingsjson)
-   [CustomVisuals\\](#customvisuals)
-   StaticResources\\
    -   [RegisteredResources\\](#registeredresources)
-   [semanticModelDiagramLayout.json](#semanticmodeldiagramlayoutjson)
-   [definition.pbir](#definitionpbir)^([1](#required1))
-   [mobileState.json](#mobilestatejson)
-   [report.json](#reportjson)^([2](#required1))
-   [definition\\ folder](#definition-folder)^([3](#required3))
-   [.platform](#platform)

1 - This file is required.  
2 - This file is required for PBIR-Legacy format.  
3 - This file is required for PBIR format.

Not every project report folder includes all of the files and subfolders described here.

## Report files

#### .pbi\\localSettings.json

Contains report settings that apply only for the current user and local computer. It should be included in gitIgnore or other source control exclusions. By default, Git ignores this file.

For more information, see the [localSettings.json schema document](https://github.com/microsoft/json-schemas/tree/main/fabric/item/report/localSettings).

#### CustomVisuals\\

A subfolder that contains metadata for custom visuals in the report. Power BI supports three kinds of custom visuals:

-   Organizational store visuals - Organizations can approve and deploy custom visuals to Power BI for their organization. To learn more, see [Organization store](/en-us/power-bi/developer/visuals/power-bi-custom-visuals#organizational-store).
-   AppSource Power BI visuals - Also known as "Public custom visuals". These visuals are available from Microsoft AppSource. Report developers can install these visuals directly from Power BI Desktop.
-   Custom visual files - Also known as "Private custom visuals". The files can be loaded into the report by uploading a pbiviz package.

Only private custom visuals are loaded into the CustomVisuals folder. AppSource and Organization visuals are loaded automatically by Power BI Desktop.

#### RegisteredResources\\

A subfolder that includes resource files specific to the report and loaded by the user, like custom themes, images, and custom visuals (pbiviz files).

Developers are responsible for the files here and changes are supported. For example, you can change a file and after a Power BI Desktop restart, the new file is loaded into the report. This folder can unblock some useful scenarios, like:

-   Authoring custom themes outside of Power BI Desktop by using the public schema.
-   Applying batch changes by changing the resource file on multiple reports. For example, you can switch the corporate custom theme, change between light and dark themes, and change logo images.

Every resource file must have a corresponding entry in the report.json file. Edits to RegisteredResources files are only supported for already loaded resources that cause Power BI Desktop to register the resource in report.json.

#### semanticModelDiagramLayout.json

Contains data model diagrams describing the structure of the semantic model associated with the report. This file doesn't support external editing.

#### definition.pbir

Contains the overall definition of a report and core settings. This file also holds the reference to the semantic model used by the report. Power BI Desktop can open a PBIR file directly, just the same as if the report were opened from a PBIP file. Opening a PBIR file also opens the semantic model alongside if there's a relative reference using `byPath`.

Example definition.pbir:

``` lang-json
{  
  "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definitionProperties/2.0.0/schema.json",
  "version": "4.0",
  "datasetReference": {
    "byPath": {
      "path": "../Sales.Dataset"
    }    
  }
}
```

The definition includes the `datasetReference` property, which references the semantic model used in the report. The reference can be either:

`byPath` - Specifies a relative path to the target semantic model folder. Absolute paths aren't supported. A forward slash (/) is used as a folder separator. When used, Power BI Desktop also opens the semantic model in full edit mode.

`byConnection` - Specifies the connection to a semantic model in a Fabric workspace by using a connection string. When a `byConnection` reference is used, Power BI Desktop doesn't open the semantic model in edit mode.

-   [Version 2](#tabpanel_1_v2)
-   [Version 1](#tabpanel_1_v1)

Using a `byConnection` reference, the following properties must be specified:

| Property         | Description                                                                  |
|------------------|------------------------------------------------------------------------------|
| connectionString | The connection string referring to the semantic model in a Fabric workspace. |

Example using `byConnection`:

``` lang-json
{  
  "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definitionProperties/2.0.0/schema.json",
  "version": "4.0",
  "datasetReference": {
    "byConnection": {      
      "connectionString": "Data Source=\"powerbi://api.powerbi.com/v1.0/myorg/[WorkpaceName]\";initial catalog=[SemanticModelName];access mode=readonly;integrated security=ClaimsToken;semanticmodelid=[SemanticModelId]"
    }
  }
}
```

When deploying a report through [Fabric REST API](/en-us/rest/api/fabric/report/items), you only need to specify the `semanticmodelid` property. For example:

``` lang-json
{  
  "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definitionProperties/2.0.0/schema.json",
  "version": "4.0",
  "datasetReference": {
    "byConnection": {      
      "connectionString": "semanticmodelid=[SemanticModelId]"
    }
  }
}
```

Using a `byConnection` reference, the following properties must be specified:

| Property                  | Description                                                                                            |
|---------------------------|--------------------------------------------------------------------------------------------------------|
| connectionString          | The connection string referring to the semantic model in a Fabric workspace.                           |
| pbiModelDatabaseName      | The remote semantic model ID.                                                                          |
| connectionType            | Type of connection. For service remote semantic model, this value should be `pbiServiceXmlaStyleLive`. |
| pbiModelVirtualServerName | An internal property that should have the value, `sobe_wowvirtualserver`.                              |
| pbiServiceModelId         | An internal property that should have the value, `null`.                                               |
| name                      | An internal property that should have the value, `EntityDataSource`.                                   |

Example using `byConnection`:

``` lang-json
{
    "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definitionProperties/1.0.0/schema.json",
    "version": "4.0",
    "datasetReference": {  
      "byConnection": {
        "connectionString": "Data Source=powerbi://api.powerbi.com/v1.0/myorg/[WorkpaceName];Initial Catalog=[SemanticModelName];Integrated Security=ClaimsToken",
        "pbiServiceModelId": null,
        "pbiModelVirtualServerName": "sobe_wowvirtualserver",
        "pbiModelDatabaseName": "[Semantic Model Id]",
        "connectionType": "pbiServiceXmlaStyleLive",
        "name": "EntityDataSource"
      }
  }
}
```

Important

When deploying a report through [Fabric REST API](/en-us/rest/api/fabric/report/items), you must use `byConnection` references. This should not be confused with the [storage mode](../../transform-model/desktop-storage-mode) of a semantic model such as DirectQuery. The `datasetReference` in the report only specifies which semantic model the report connects to, it does not define how that model stores or accesses its data.

##### Multiple \*.pbir files

When the semantic model and report share the same workspace, [Fabric Git Integration](/en-us/fabric/cicd/git-integration/intro-to-git-integration) always exports definitions with a `byPath` reference to the semantic model. If you want to force the report to open in live connect (for example, to work with report-level measures), you can have multiple `*.pbir` files, such as one with a byPath connection and another with a byConnection connection. Fabric Git Integration processes only the *definition.pbir* file and ignores all other \*.pbir files. However, these files can coexist in the same repository.

``` lang-md
  ├── definition\
  ├── StaticResources\
  ├── .platform
  ├── definition-liveConnect.pbir
  └── definition.pbir
```

The `definition.pbir` file also specifies the supported report definition formats through the 'version' property.

| Version       | Supported formats                                                                                                |
|---------------|------------------------------------------------------------------------------------------------------------------|
| 1.0           | Report definition must be stored as PBIR-Legacy in the report.json file.                                         |
| 4.0 or higher | Report definition can be stored as PBIR-Legacy (report.json file) or [PBIR](#pbir-format) (\\definition folder). |

For more information, see the [definition.pbir schema document](https://github.com/microsoft/json-schemas/tree/main/fabric/item/report/definitionProperties).

#### mobileState.json

Contains report appearance and behavior settings when rendering on a mobile device. This file doesn't support external editing.

#### report.json

This file contains the report definition in the Power BI Report Legacy format (PBIR-Legacy) and doesn't support external editing.

#### definition\\ folder

This folder is only available if the Power BI project is saved using the [Power BI enhanced report format (PBIR)](#pbir-format). It replaces the [report.json](#reportjson) file.

#### .platform

Fabric platform file that holds properties vital for establishing and maintaining the connection between Fabric items and Git.

To learn more, see [Git integration automatically generated system files](/en-us/fabric/cicd/git-integration/source-code-format#automatically-generated-system-files).

## PBIR format

Saving your Power BI Project files (PBIP) using the Power BI Enhanced Report Format (PBIR) greatly improves change tracking and merge conflict resolution by using properly formatted JSON files.

![Screenshot of friendly PBIR diffs.](media/projects-report/pbir-diff.png)

Each page, visual, bookmark, etc., is organized into a separate, individual file within a folder structure. This format is ideal for codevelopment conflict resolution.

![Screenshot of friendly PBIR folder.](media/projects-report/pbir-folder.png)

Unlike PBIR-Legacy (report.json), PBIR is a publicly documented format that supports modifications from non-Power BI applications. Each file has a public JSON schema, which not only documents the file but also lets code editors like Visual Studio Code perform syntax validation while editing.

Some of the possible scenarios now available with PBIR include:

-   Copy pages/visuals/bookmarks between reports.
-   Ensure consistency of a set of visuals across all pages, by copying & pasting the visual files.
-   Easy find and replace across multiple reports files.
-   Apply a batch edit across all visuals using a script (for example, hide visual level filters)

### Save as a project using PBIR

When you save a project using PBIR, your report is saved within a folder named *\\definition* inside of the [report folder](projects-report):

![Screenshot of the definition folder inside a report PBIP folder.](media/projects-report/pbip-pbir-definitionfolder.png)

Learn more about the [PBIR folder structure](#pbir-folder-and-files).

### PBIR folder and files

The report definition is stored inside the `definition\` folder with the following structure:

``` lang-md
├── bookmarks\
│   ├── [bookmarkName].bookmark.json
|   └── bookmarks.json
├── pages\
│   ├── [pageName]\
│   |   ├── \visuals
|   │   |   ├── [visualName]\
|   |   │   │   |── mobile.json
|   |   |   └   └── visual.json
|   |   └── page.json
|   └── pages.json
├── version.json
├── reportExtensions.json
└── report.json
```

[TABLE]

Important

Some report metadata files, such as visual.json or bookmarks.json, can be saved with data values from your semantic model. For instance, if you apply a filter to a visual for the field 'Company' = 'Contoso', the value 'Contoso' will persist as part of the metadata. This also applies to other configurations like slicer selections, matrix custom columns width, and formatting for specific series.

#### PBIR naming convention

All names inside the square brackets (\[\]) in the preceding table follow a default naming convention but can be renamed to more user-friendly names. By default, pages, visuals, and bookmarks use their report object name as their file or folder name. These object names are initially a 20-character unique identifier, such as '90c2e07d8e84e7d5c026'.

![Screenshot of PBIR name property.](media/projects-report/pbir-objectname.png)

Renaming the 'name' property within each JSON file is supported but might break external references both inside and outside the report. The object name and/or file/folder name must consist of one or more word characters (letters, digits, underscores) or hyphens.

After renaming any PBIR files or folders, you must restart Power BI Desktop. Upon restart, Power BI Desktop will preserve the original file or folder names when saving.

#### Copy report object name

Each object in the report is saved in a separate folder or file, but the name of the folder isn't always obvious. To make this easier, you can copy the name of any report object name (including pages, visuals, bookmarks, and filters) directly from Power BI to your clipboard.

![Screenshot of a report with an arrow pointing from one of the visuals to the name of its corresponding file.](media/projects-report/computer-ai-generated-report.png)

-   [From the desktop](#tabpanel_2_desktop)
-   [From the service](#tabpanel_2_service)

1.  Go to **File \> Options and settings \> Report settings \> Report objects** and enable the *Copy object names when right clicking on report objects* setting. This only needs to be done once.

    ![Screenshot of the report objects report settings.](media/projects-report/report-objects-check-box.png)

2.  Right click on any report object and select *Copy object name*.

    ![Screenshot of a desktop report with copy object name selected.](media/projects-report/copy-object-name.png)

With the object name copied to your clipboard, you can easily enter it into the search bar of Windows Explorer or Visual Studio Code to locate or identify the object name within the PBIR folder.

![Screenshot of search bar with name of object.](media/projects-report/search-object-name.png)

1.  Enable the *Copy object names when right clicking on report objects* setting. This only needs to be done once. You don't need to enable it for each report.

    ![Screenshot of the report settings with the switch enabled.](media/projects-report/report-settings-service.png)

2.  When editing a report, right click on any report object and select *Copy object name*.

    ![Screenshot of a service report with copy object name selected.](media/projects-report/copy-object-name-service.png)

You can use the copied object for identifying file names in PBIR file format, or for performance troubleshooting through Workspace Monitoring or Log Analytics to link the DAX query to a visual in the report.

### PBIR Json Schemas

Each PBIR JSON file includes a [JSON schema](https://json-schema.org/) declaration at the top of the document. This schema URL is publicly accessible and can be used to learn more about the available properties and objects for each file. Additionally, it provides built-in IntelliSense and validation when editing with code editors like [Visual Studio Code](https://code.visualstudio.com/).

![Screenshot of prompt PBIR JSON Schema tooltip.](media/projects-report/pbir-jsonschema-tooltip.png)

The schema URL also defines the version of the document, which is expected to change as the report definition evolves.

All the JSON schemas are published [here](https://github.com/microsoft/json-schemas/tree/main/fabric/item/report/definition).

### PBIR annotations

You can include annotations as name-value pairs within the report definition for each `visual`, `page` and `report`. While Power BI Desktop ignores these annotations, they can be valuable for external applications like scripts.

For instance, you could specify the defaultPage for the report at the `report.json` file, which can then be utilized by a deployment script.

``` lang-json
{
  "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/report/1.0.0/schema.json",
  "themeCollection": {
    "baseTheme": {
      "name": "CY24SU06",
      "reportVersionAtImport": "5.55",
      "type": "SharedResources"
    }
  },
  ...
  "annotations": [
    {
      "name": "defaultPage",
      "value": "c2d9b4b1487b2eb30e98"
    }
  ]
}
```

### External changes to PBIR files

You can edit supported PBIR JSON files in a code editor like [Visual Studio Code](https://code.visualstudio.com/) or another external tool while the project remains open in Power BI Desktop. When you save the files, Power BI Desktop detects the changes and displays the **Apply external changes** banner. Select **Apply external changes** to reload the report definition without closing and reopening the project.

Before you edit PBIR files externally, save any changes in Power BI Desktop. If Power BI Desktop has unsaved changes when you apply the external changes, it warns you that the unsaved changes will be overwritten. For the complete workflow and limitations, see [Edit PBIP files outside Power BI Desktop](projects-external-editing).

PBIR files must conform to their JSON schemas. VS Code identifies issues such as an unsupported property name or an incorrect property type:

![Screenshot of prompt PBIR JSON Schema validation.](media/projects-report/pbir-jsonschema-validation.png)

External changes to PBIR content might result in errors when you apply the changes or open the files in Power BI Desktop. These errors can be of two types:

**Blocking errors** prevent Power BI Desktop from loading the report changes. These errors identify the issue and the file that you must fix before applying the changes again:

![Screenshot of prompt PBIR blocking error.](media/projects-report/pbir-error-blocking.png)

Errors such as an invalid schema or missing required properties are blocking errors. To identify these errors, open the file in VS Code and inspect the schema validation messages.

**Non-blocking errors** don't prevent Power BI Desktop from opening the report and are automatically resolved.

![Screenshot of prompt PBIR nonblocking error.](media/projects-report/pbir-error-nonblocking.png)

An invalid `activePageName` configuration is an example of a nonblocking error that Power BI Desktop fixes automatically. The warning gives you an opportunity to review the correction before you save the report and overwrite the external definition.

#### Common PBIR errors

**Scenario:** *After rename visual or page folder names, my visual or page no longer appears when opening the report.*

**Solution:** Verify whether the name complies with the [naming convention](#pbir-naming-convention). If it doesn't, Power BI Desktop ignores the file, or folder and treats it as private user files.

**Scenario:** *New report objects are named differently from others. For example, most page folders are named 'ReportSection0e71dafbc949c0853608', while a few are named '1b3c2ab12b603618070b'.*

**Solution:** PBIR adopted a new [naming convention](#pbir-naming-convention) for every object, but it only applies to new objects. When you save an existing report as PBIP, the current names must be preserved to prevent breaking references. If you want consistency, a script a batch rename is allowed.

**Scenario:** *I copied a bookmark file, and upon saving, most of the bookmark configuration was deleted.*

**Solution:** This behavior is intentional, report bookmarks capture the state of a report page along with all its visuals. Since the captured state originates from another report page with different visuals, any invalid visuals are removed from the bookmark configuration. If you also copy the dependent visuals and page, the bookmark maintain its configuration.

**Scenario:** *I copied a page folder from another report and encountered an error stating, "Values for the 'pageBinding.name' property must be unique."*

**Solution:** The pageBinding object is necessary to support drillthrough and page tooltips. Since they might be referenced by other pages, the name must be unique within the report. On the newly copied page, assign a unique value to resolve the error. After June 2024, this situation is no longer an issue because the pageBinding name is a GUID by default.

### Convert existing report to PBIR

PBIR is generally available and is the default report format. You can still open reports that use PBIR-Legacy in Power BI Desktop and the Power BI service. When you edit and save a PBIR-Legacy report, Power BI silently and automatically converts it to PBIR.

Before conversion, Power BI creates a backup of the report:

-   Power BI Desktop retains the backup for 30 days in one of the following locations:
    -   Microsoft Store version: `%USERPROFILE%\Microsoft\Power BI Desktop Store App\TempSaves\Backups`
    -   Executable installer version: `%USERPROFILE%\AppData\Local\Microsoft\Power BI Desktop\TempSaves\Backups`
-   The Power BI service retains the PBIR-Legacy backup for 28 days. To restore it, open **Report settings** from the workspace, and select **Restore as PBIR-Legacy**. This backup is created only for reports converted directly in the Power BI service.

Restoring a PBIR-Legacy backup doesn't prevent another conversion. To keep a report in PBIR-Legacy format, don't edit it in the Power BI service, or use a release of Power BI Desktop released before September 2026.

### PBIR considerations and limitations

Keep the following considerations and limitations in mind:

-   [Visual automatic filters](../../create-reports/power-bi-report-filter-types#automatic-filters) are persisted to the PBIR `visual.json` file only after the filter pane has been expanded at least once while editing the report.
-   If Power BI doesn't convert a PBIR-Legacy report to PBIR when you edit and save it, the conversion has encountered a product issue. [Create a support request](../../support/before-you-contact-support) to report the issue.

PBIR size limitations enforced by the service:

-   1,000 max pages per report.
-   1000 max visuals per page.
-   1,000 max resource package files per report.
-   300-mb max size for all resource package files.
-   300-mb max size of all report files.

Important

If you reach the limits above, you should consider optimizing your report. See the [Power BI Optimization document](../../guidance/power-bi-optimization#power-bi-reports).

[Fabric Git Integration](/en-us/fabric/cicd/git-integration/intro-to-git-integration) and [Fabric REST APIs](/en-us/rest/api/fabric/articles/item-management/item-management-overview) export report definitions using PBIR.

## Related content

-   [Power BI Desktop project semantic model folder](projects-dataset)
-   [Power BI Desktop projects](projects-overview)

------------------------------------------------------------------------
