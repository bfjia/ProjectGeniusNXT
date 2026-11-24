<!-- Source: https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-kpi (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Create key performance indicator (KPI) visualizations

**Applies to:** ✅ Power BI Desktop and Power BI service

A Key Performance Indicator (KPI) is a visual cue that communicates the amount of progress made toward a measurable goal. For more about KPIs, see [Key Performance Indicators (KPIs) in Power Pivot](https://support.microsoft.com/office/key-performance-indicators-kpis-in-power-pivot-e653edef-8a21-40e4-9ece-83a6c8c306aa).

## When to use a KPI

KPIs are a great choice:

-   To measure progress. Answers the question, "What am I ahead or behind on?"

-   To measure distance to a goal. Answers the question, "How far ahead or behind am I?"

## KPI requirements

A designer bases a KPI visual on a specific measure. The intention of the KPI is to help you evaluate the current value and status of a metric against a defined target. A KPI visual requires a *base* measure that evaluates to a value, a *target* measure or value, and a *threshold* or *goal*.

A KPI semantic model needs to contain goal values for a KPI. If your semantic model doesn't contain goal values, you can create them by adding an Excel sheet with goals to your data model or PBIX file.

-   [Power BI Desktop](#tabpanel_1_powerbi-desktop)
-   [Power BI service](#tabpanel_1_powerbi-service)

To follow along, use the [Retail Analysis sample PBIX file](https://download.microsoft.com/download/9/6/D/96DDC2FF-2568-491D-AAFA-AFDD6F763AE3/Retail%20Analysis%20Sample%20PBIX.pbix).

1.  From the upper left section of the menu bar, select **File** \> **Open report**.

2.  Find your copy of the **Retail Analysis Sample PBIX file**.

3.  Open the **Retail Analysis Sample PBIX file** in report view. ![](media/power-bi-visualization-kpi/power-bi-report-view.png)

4.  Select ![](media/power-bi-visualization-kpi/power-bi-yellow-tab.png) to add a new page.

To follow along, use the [Retail Analysis sample](../create-reports/sample-retail-analysis).

1.  On the Home page of the Power BI service, scroll down to **Getting started with Power BI** and select **Sample reports**.

    ![Screenshot of Discover content link to Samples.](media/power-bi-visualization-kpi/get-data-samples.png)

2.  Choose **Retail Analysis Sample**. Power BI loads the sample semantic model.

3.  From the menu bar, select **Edit** ![](media/power-bi-visualization-kpi/power-bi-edit-icon.png) .

4.  Select ![](media/power-bi-visualization-kpi/power-bi-yellow-tab.png) to add a new page.

Note

To share your report with a Power BI colleague, both you and your colleague need individual Power BI Pro licenses, or you need to save the report in Premium capacity.

## How to create a KPI

In this example, you create a KPI that measures the progress you made toward a sales goal.

1.  From the **Fields** pane, select **Sales** \> **Total Units This Year**. This value is the indicator.

2.  Add **Time** \> **FiscalMonth**. This value represents the trend.

    ![Screenshot of the X and Y axis wells.](media/power-bi-visualization-kpi/power-bi-initial-visualization-values.png)

3.  In the upper-right corner of the visual, select the **More options** ellipsis (...) and select **Sort axis** \> **FiscalMonth**.

    ![Screenshot of the ellipsis menu expanded with Sort axis and FiscalMonth.](media/power-bi-visualization-kpi/power-bi-sort-by-fiscal-month.png)

4.  Select the ellipsis again and choose **Sort axis** \> **Sort ascending**.

    ![Screenshot of the ellipsis menu expanded with Sort by ascending.](media/power-bi-visualization-kpi/power-bi-sort-by-ascending.png)

5.  Check that Power BI sorts the columns in ascending order by **FiscalMonth**.

    Important

    Once you convert the visualization to a KPI, there's **no** option to sort. You must sort the visualization now, if desired.

    Once you sort the KPI correctly, your visual looks like this:

    ![Screenshot of the visualization sorted correctly.](media/power-bi-visualization-kpi/power-bi-chart.png)

6.  Convert the visual to a KPI by selecting the **KPI** icon from the **Visualization** pane.

    ![Screenshot of the Visualizations pane with the KPI icon called out.](media/power-bi-visualization-kpi/power-bi-kpi-template.png)

7.  To add a goal, drag **Total Units Last Year** to the **Target** field.

    ![Screenshot of the Visualizations pane with the Value, Trend axis, and Trend fields filled in.](media/power-bi-visualization-kpi/power-bi-desktop-value-trend-axis-trend.png)

8.  Optionally, format the KPI by selecting the paint brush icon to open the **Format visual** pane.

    ![Screenshot of the Format visual pane.](media/power-bi-visualization-kpi/power-bi-format-visual.png)

    -   **Callout value** - controls the indicator's display units, decimal places, and text formatting.

    -   **Icons** - when set to **On**, the visual shows small icons next to the value, a green checkmark for an increasing value, and a red exclamation point for a decreasing value. The value's direction is set by **Trend axis**.

    -   **Trend axis** - when set to **On**, the visual shows the trend axis as the background of the KPI visual. People consider some KPIs better for *higher* values and consider some better for *lower* values. For example, earnings versus wait time. Typically a higher value of earnings is better versus a higher value of wait time. For this report, select **Direction** \> **High is good**. Optionally, change the color settings.

        ![Screenshot of the Trend axis formatting options.](media/power-bi-visualization-kpi/power-bi-format-trend-axis.png)

    -   **Target label** - when set to **On**, the visual shows the value's label. **Distance to goal** sets the style and direction of the distance from the goal.

        ![Screenshot of the Format distance to go pane.](media/power-bi-visualization-kpi/power-bi-format-distance-to-goal.png)

    -   **Date** - when set to **On**, the visual shows the date. Optionally, change the font, and its style and color.

KPIs are also available on your mobile devices.

## Considerations and troubleshooting

-   If your KPI doesn't look like the example, you might not have sorted by **FiscalMonth**. KPIs don't have a sort option. Start again and sort by **FiscalMonth** *before* you convert your visualization to a KPI.
-   In general, if your KPI doesn't display a trend axis, ensure that the column in the **Value** well is continuous and doesn't include a null value.

## Related content

-   [Tips and tricks for Power BI Map visualizations](power-bi-map-tips-and-tricks)

-   [Visualizations overview in Power BI](power-bi-visualizations-overview)

More questions? [Try the Power BI Community](https://community.powerbi.com/).

------------------------------------------------------------------------
