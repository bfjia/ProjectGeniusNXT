<!-- Source: https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-upload-desktop-files (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Publish semantic models and reports from Power BI Desktop

**Applies to:** ✅ Power BI Desktop and Power BI service

When you publish a Power BI Desktop file to the Power BI service, you publish the data in the model to your Power BI workspace. The same is true for any reports you created in **Report** view. You’ll see a new semantic model with the same name and any reports in your Workspace navigator.

Publishing from Power BI Desktop has the same effect as using **Get Data** in Power BI to connect to and upload a Power BI Desktop file.

Note

Any changes you make to the report in Power BI won't be saved back to the original Power BI Desktop file. This includes when you add, delete, or change visualizations in reports.

## To publish a Power BI Desktop semantic model and reports

Note

The user interface and button locations in Power BI Desktop might vary depending on your version. If the screenshots don't match what you see, look for the **Publish** option in the **File** menu or on the **Home** ribbon.

1.  In Power BI Desktop, choose **File** \> **Publish** \> **Publish to Power BI** or select **Publish** on the **Home** ribbon.

    ![Screenshot of the Power BI Home ribbon, highlighting Publish.](media/desktop-upload-desktop-files/pbid_publish_publishbutton.png)

2.  Sign in to Power BI if you aren't already signed in.

3.  Select the destination. You can search your list of available workspaces to find the workspace into which you want to publish. The search box lets you filter your workspaces. Select the workspace, and then click the **Select** button to publish.

    ![Screenshot of the Publish to Power BI dialog.](media/desktop-upload-desktop-files/pbid_publish_select_destination.png)

When publishing is complete, you receive a link to your report. Select the link to open the report in your Power BI site.

![Screenshot of the successful Publishing to Power BI dialog.](media/desktop-upload-desktop-files/pbid_publish_success.png)

Note

If your Desktop file has a sensitivity label, the semantic model and report that are published will inherit that label, and the label will be considered automatically or manually applied depending on whether the label on the Desktop file was automatically or manually applied. This affects the behavior of sensitivity label downstream inheritance from the semantic model to its associated report. See [Downstream inheritance between semantic models and reports published from *.pbix* files](/en-us/fabric/governance/service-security-sensitivity-label-downstream-inheritance#downstream-inheritance-between-semantic-models-and-reports-published-from-.pbix-files) for detail.

## Republish or replace a semantic model published from Power BI Desktop

The semantic model, and any reports you created in Power BI Desktop, upload to your Power BI site when you publish a Power BI Desktop file. When you republish your Power BI Desktop file, the semantic model in your Power BI site is replaced with the updated semantic model from the Power BI Desktop file.

This process is straightforward, but you should know the following:

-   Directly publishing a protected .pbix file from Power BI Desktop to the Power BI service isn't supported for guest users, even if they have higher-level permissions. To update or publish reports from a protected .pbix file, guest users need to start from the Power BI service, using **Get Data**, for example.

-   Two or more semantic models in Power BI with the same name as the Power BI Desktop file could cause publishing to fail. Make sure you have only one semantic model in Power BI with the same name. You can also rename the file and publish, creating a new semantic model with same name as the file.

-   If you rename or delete a column or measure, any visualizations you already have in Power BI with that field could be broken.

-   Power BI ignores some format changes of existing columns. For example, if you change a column's format from 0.25 to 25%.

-   Say you have a refresh schedule that is configured for your existing semantic model in Power BI. When you add new data sources to your file and then republish, you have to sign into them before the next scheduled refresh.

-   When you republish a semantic model published from Power BI Desktop and have a refresh schedule defined, a semantic model refresh is started as soon as you republish.

-   When you make a change to a semantic model and then republish it, a message shows you how many workspaces, reports, and dashboards are potentially impacted by the change. The message then asks you to confirm that you want to replace the currently published semantic model with the one you modified. The message also provides a link to the full semantic model impact analysis in the Power BI service. From there, you can see more information and take action to mitigate the risks of your change.

    ![Screenshot of a Replace this semantic model warning dialog.](media/desktop-upload-desktop-files/pbid-dataset-impact-analysis-desktop-warning.png)

-   If the semantic model (and, if one exists, the report) in the Power BI service that you're overwriting has sensitivity labels that differ from the label in your *.pbix* file, a dialog appears. The dialog will prompt you to choose whether to keep the existing labels or overwrite them with the ones coming from your *.pbix* file.

    ![Screenshot of the dialog for choosing to keep or overwrite sensitivity labels in the service.](media/desktop-upload-desktop-files/pbid-dataset-overwrite-labels-desktop-dialog.png)

    [Learn more about semantic model impact analysis](../collaborate-share/service-dataset-impact-analysis).

Note

Some data connection in Power BI reports might include links to data, rather than including the data in the semantic model that's imported into the Power BI service. For example, DirectQuery connections link to data as updates or interactions occur, rather than importing the data itself. If linked data sources in your report are on premises, you might need a gateway to access them from Power BI. For more information, see [what is an on-premises data gateway?](../connect-data/service-gateway-onprem).

## Publish semantic models and reports from Power BI Desktop to a folder in a workspace (preview)

You can now publish reports and semantic models from Power BI Desktop into a folder in a workspace. To use this feature, follow the established pattern for publishing a semantic model and report. The workspace navigator provides the option to select a folder within a workspace for publishing. Folders are organizational units inside a workspace that enable users to efficiently organize and manage artifacts in the workspace.

To turn the capability on, select the **Publish dialogs support folder selection** setting by using the **Options and settings \> Options \> Preview features** menu in Power BI Desktop.

To learn more about creating folders in Microsoft Fabric workspaces, read the [create folders in Microsoft Fabric workspaces](/en-us/fabric/get-started/workspaces-folders) article.

## Considerations and limitations

-   Directly publishing a protected .pbix file from Power BI Desktop to the Power BI service isn't supported for guest users, even if they have higher-level permissions. To update or publish reports from a protected .pbix file, guest users need to start from the Power BI service, using **Get Data**, for example.
-   The following storage mode conversions aren't supported during republish:
    -   If you first publish a report using Import mode, you can't overwrite the report and the semantic model with a DirectQuery or Live Connect based report.
    -   If you first publish a report using a live connection, then change the storage mode or the target semantic model in Power BI Desktop, you can't overwrite the report when you republish.
-   In rare cases, publishing over an unstable network connection can result in duplicate copies of the report appearing in your workspace. To resolve the issue, you can safely remove the duplicates.

## Related content

You can do all sorts of things with Power BI Desktop. For more information on its capabilities, check out the following resources:

-   [What is Power BI?](../fundamentals/power-bi-overview)
-   [Query overview with Power BI Desktop](../transform-model/desktop-query-overview)
-   [Data types in Power BI Desktop](../transform-model/desktop-data-types)
-   [Tutorial: Shape and combine data in Power BI Desktop](../transform-model/desktop-shape-and-combine-data)
-   [Common query tasks in Power BI Desktop](../transform-model/desktop-common-query-tasks)

------------------------------------------------------------------------
