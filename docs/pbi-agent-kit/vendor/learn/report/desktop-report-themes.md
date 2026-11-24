<!-- Source: https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-report-themes (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Use report themes in Power BI

**Applies to:** ✅ Power BI Desktop and Power BI service

Power BI *report themes* let you apply design changes to your entire report. You can change theme colors, set default visual formatting, and define [custom style presets](report-themes-create-custom#create-style-presets-in-custom-themes). When you apply a report theme, all visuals in your report use the colors and formatting from that theme as their default style.

You can use the formatting pane to format individual visuals. When formatted individually on the report canvas, the custom theme doesn't override those changes until you reset the visual to default.

To select report themes:

-   In Power BI Desktop, go to the **Design** ribbon and select a theme from the **Themes** gallery.
-   In the Power BI service, select **View** \> **Theme**.

The gallery shows:

-   **Built-in report themes** provide different kinds of predefined themes.
-   **[Organizational report themes](desktop-organizational-themes)** appear when your tenant admin makes additional custom report themes available.

At the bottom of the expanded gallery, select **Theme gallery** to browse community themes. The other theme commands are available directly on the **Design** ribbon, not in the expanded gallery.

The **Design** ribbon in Power BI Desktop also provides these theme commands:

-   **Customize theme** opens the **Theme** pane, where you can update theme settings, colors, text, visual properties, page defaults, and filter formatting.
-   **Import theme** lets you select a report theme file to use in the report.
-   **Download theme** exports the current theme so you can share it, edit it in a text editor, or use it in another report.

In the **Help** group, **How to create a theme** opens the documentation for creating report themes.

Note

The theme commands on the **Design** ribbon are available only in Power BI Desktop. In the Power BI service, use the **Theme** pane to import, export, or customize a theme.

## Understand how the report uses themes

Every report has a base theme defining the default colors and style used across all visuals. The styles include common styles across visuals, such as border, padding, and title font, and styles specific to visuals types, such as line style for line charts. Power BI adds the base theme when you create a report. New releases might update the base theme, but your report keeps its original base theme until you update it. The base theme is what is used for the default style of any new visual created. Microsoft manages the base theme as part of Power BI.

Individual visuals can be formatted differently using the format pane. You can pick another color from the theme colors or a color not in the theme colors. You can deviate from the theme on padding or title font, for just that visual. To revert the style of a visual back to the theme style, you can **reset to default** for the entire visual, or formatting section on that visual.

Note

**Reset to default** also removes formatting pane items controlling actions on buttons and images, all conditional formatting rules, images from URLs or data-bound fields, and other data-bound items such as reference labels.

If you want to modify the colors and styles for an entire report, including existing visuals and new visuals, you use a custom theme. The custom theme layers on top of the base theme, letting you override or add to any style or color defined in the base theme, including style presets for specific visual types.

With a custom theme applied, **reset to default** reverts a visual to the custom theme style, and for anything not defined in the custom theme, the base theme style. Custom themes can be created or modified in a limited way in Power BI Desktop and created or modified extensively in the `JSON` theme file. You can export any report's custom theme as a file for use in another report, and add a custom theme to a report by browsing for the `JSON` theme file.

Custom themes are also called report themes.

## Understand how theme colors are used by the report

Theme colors are used when you create any visuals in the report. The colors come from data colors in the theme. When you edit any color element in a visual, the dialog shows you the theme colors with various shades of those colors to pick from. You can also select **More colors** to pick any color you need.

It's best practice to use the theme colors. When you pick a theme color and then change the theme later, the visuals update to the new theme colors automatically. To avoid having to manually update every visual to new colors on a theme update, pick theme colors.

The colors in the color palette are relative to the current theme. For example, suppose you select the third color of the top row for a data point. If you change to a different theme, that data point's color automatically updates to the third color of the top row in the new theme. This behavior is similar to changing themes in Microsoft Office.

If you prefer a visual to not automatically update, don't use a theme color by going to **more colors** in the color palette. To return any visual to the theme colors, choose **reset to default** in the visual's formatting pane.

You can also reference theme colors by name in DAX measures for conditional formatting. When you use **Field value** format style, return the theme color name (like `good`, `bad`, or `neutral`) from your measure, and the visual uses the corresponding color from the current theme. For more information, see [Named theme colors](report-themes-create-custom#named-theme-colors).

### Colors used by dynamic and static series in visuals

When a visual has a series, Power BI applies colors in the order they appear in the theme's data colors. A visual has a series when you add a legend or use more than one measure in the values section.

A **dynamic series** is when you add a column to a legend or axis that then shows the series per value. These values are dynamic in that a column can have any number of values and the values may change based on interactions within the report, such as filters applied and slicer selections.

For example, if you show *Profit by Region* in a visual, you might have two sales regions, or you might have four or a different set of regions. The number and selected set of regions is dynamic, making this a dynamic series.

A **static series** is when you add more than one measure, or stack, measures in the field well of a visual. For *static series*, you control the number of members in the series and their order. For example, *Profit* and *Revenue* measures used in a visual are a static series.

Colors are assigned to the value of the series by the order they appear in the visual. The first theme color is assigned to the first in the series, and second theme color is assigned to the next, etc.

In the dynamic series example, if I have a visual showing *Profit* by *North* and *South* region, and another visual showing it by *East* and *North* regions, then the first values, *North* and *East* use the first color, and *South* and *North* use the second color. *North* has a different color as it's used in a different order in the visuals.

In the static series example, if I have *Profit* then *Revenue* in one visual, and *Revenue* then *Profit* in another visual, the colors are different.

You can always assign specific members of a series to a particular theme color by using the formatting pane: see more information about how to [change the color of a single data point](../visuals/service-tips-and-tricks-for-color-formatting#change-the-color-of-a-single-data-point).

Visual level color assignment can be undone at any time by choosing **reset to default** on the particular formatting pane section for that visual, and the visual again automatically uses the theme colors in the order the series members appear in the visual.

## Apply a built-in report theme

Built-in themes let you quickly apply a custom theme to your report. Any report custom theme previously added or adjusted in the report is replaced with what you select. Visuals formatted directly using the format pane maintain their customizations until you reset them to default.

1.  Select the **Design** ribbon.
2.  Select a theme from the **Themes** gallery.

The report theme is now applied to the report.

### Built-in report themes available

The following table shows the available built-in report themes.

| Built-in report theme | Default color sequence                                                                                                             |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Reset to default      | Removes any custom theme and reverts the report to the base theme.                                                                 |
| Bloom                 |  ![Screenshot of the color sequence for the Bloom theme.](media/desktop-report-themes/report-themes-color-scheme-bloom.png)        |
| Dark                  | Uses the Versa color palette with a dark background.                                                                               |
| Divergent             |  ![Screenshot of the color sequence for the Divergent theme.](media/desktop-report-themes/report-themes-color-scheme-divergent.png)|
| Frontier              |  ![Screenshot of the color sequence for the Frontier theme.](media/desktop-report-themes/report-themes-color-scheme-frontier.png)  |
| Innovate              |  ![Screenshot of the color sequence for the Innovate theme.](media/desktop-report-themes/report-themes-color-scheme-innovative.png)|
| Soft dark             | Uses the Versa color palette with a softer dark background.                                                                        |
| Tidal                 |  ![Screenshot of the color sequence for the Tidal theme.](media/desktop-report-themes/report-themes-color-scheme-tidal.png)        |
| Copilot default       | The theme Copilot uses when it generates report content.                                                                           |

The **Dark** and **Soft dark** themes use styling that closely follows the Fluent 2 base theme. Apply either theme if you prefer a dark report canvas while you design your report. Before you publish, select **Reset to default** to return the report to the default light theme.

Note

If your tenant uses [organizational themes](desktop-organizational-themes), you can specify which theme Copilot uses by default instead.

## Apply an organizational report theme

More themes might be available in the **Themes** gallery if your tenant admin adds them to [organizational themes](desktop-organizational-themes). These themes are applied like the built-in themes. They remove any previous custom theme and use the selected custom theme.

## Customize the current report theme

You can customize colors, text, visual properties, page settings, and the filter pane for the current report directly from the Theme pane in Power BI Desktop or the Power BI service. For details, see [Visual defaults in Power BI reports](power-bi-reports-visual-defaults#customize-current-theme-from-the-theme-pane).

For finer control, you can also modify the custom theme's [JSON file](report-themes-create-custom) in a text editor such as VS Code and browse for the theme file to add it to the report.

## Manage the base report theme

The base theme is the underlying default styling that Power BI applies before any customizations. When you apply a custom theme, it layers on top of the base theme. Power BI might update the base theme with new releases, but existing reports keep their original base theme until you update it.

For more information about available base themes and how to update or change your base theme, see [Visual defaults in Power BI reports](power-bi-reports-visual-defaults).

## Save a report theme file

You can export the currently applied report theme to a `JSON` file from Power BI Desktop or the Power BI service. After you export a report theme, you can reuse it in other reports.

To export the currently applied theme in Power BI Desktop, use either option:

-   On the **Design** ribbon, select **Download theme** to save the theme as a `JSON` file.
-   To export from the **Theme** pane, select **Customize theme** on the **Design** ribbon. Expand **Theme settings**, and then select **Export theme**.

## Apply a custom report theme `JSON` file

You can apply custom theme `JSON` files that you save from another report or that someone else shares with you to any other report in Power BI Desktop or the Power BI service.

To import a custom theme JSON file in Power BI Desktop, use either option:

-   On the **Design** ribbon, select **Import theme**, and then choose the JSON file.
-   To import from the **Theme** pane, select **Customize theme** on the **Design** ribbon. Expand **Theme settings**, select **Import theme**, and then choose the JSON file.

When successful, Power BI shows a dialog that the import was successful. A dialog also shows when it isn't successful with details on the error in the custom theme file.

Tip

To find theme files created by others, browse the [themes gallery](https://community.powerbi.com/t5/Themes-Gallery/bd-p/ThemesGallery) and download a theme to your machine. You can also use online tools or a text editor such as VS Code to create your own or edit an existing custom theme file.

### Custom report theme files you can use right now

Want to get started with report themes? Browse the [themes gallery](https://community.powerbi.com/t5/Themes-Gallery/bd-p/ThemesGallery) for custom themes. You can also download and import the following JSON files into your Power BI Desktop report:

-   [Waveform theme](https://community.powerbi.com/t5/Themes-Gallery/Waveform/m-p/140536). This report theme was introduced in the [blog post](https://powerbi.microsoft.com/blog/power-bi-desktop-march-feature-summary/) that announced the first release of report themes. [Download Waveform.json](https://go.microsoft.com/fwlink/?linkid=843924).

    ![Screenshot of the Waveform JSON theme.](media/desktop-report-themes/report-themes_10.png)

-   [Color-blind friendly theme](https://community.powerbi.com/t5/Themes-Gallery/Color-Blind-Friendly/m-p/140597). This report theme is easier to read for the visually impaired. [Download ColorblindSafe-Longer.json](https://go.microsoft.com/fwlink/?linkid=843923).

    ![Screenshot of the Color-blind Safe Longer JSON theme.](media/desktop-report-themes/report-themes_11.png)

-   Valentine's Day theme.

    ![Screenshot of the Valentine's Day JSON theme.](media/desktop-report-themes/report-themes_13.png)

Here's the code for the Valentine's Day JSON file:

``` lang-json
    {
        "name": "Valentine's Day",
        "dataColors": ["#990011", "#cc1144", "#ee7799", "#eebbcc", "#cc4477", "#cc5555", "#882222", "#A30E33"],
        "background":"#FFFFFF",
        "foreground": "#ee7799",
        "tableAccent": "#990011"
    }
```

Here are a few more report themes you can use as starting points:

-   [Sunflower-twilight](https://community.powerbi.com/t5/Themes-Gallery/Sunflower-Twilight/m-p/140749)
-   [Plum](https://community.fabric.microsoft.com/discussions/themesgallery/plum/140711)
-   [Loomy Lime](https://community.fabric.microsoft.com/discussions/ThemesGallery/loomy-lime/1130525)
-   [Sneaky Strawberry](https://community.fabric.microsoft.com/discussions/themesgallery/sneaky-strawberry/1130518)
-   [Autumn](https://community.fabric.microsoft.com/discussions/themesgallery/autumn/140746)
-   [High contrast](https://community.powerbi.com/t5/Themes-Gallery/Color-Blind-Friendly/m-p/140597)

Report themes can make your Power BI Desktop reports a colorful reflection of you, your organization, or even the current season or holiday.

### More sources of report themes

The following GitHub repository has sample JSON for all the different components in the JSON themes file: [Power BI Theme Templates](https://github.com/mattrudy/PowerBI-ThemeTemplates/blob/master/README.md).

In addition, try searching for ["Power BI theme generator"](https://www.bing.com/search?q=power+bi+theme+generator) on Bing.

## Create a custom theme file

To create your own custom report theme JSON files with complete control over colors, fonts, and visual styles, see [Create custom report themes in Power BI Desktop](report-themes-create-custom).

## Considerations and limitations

-   Applying a built-in theme removes any customizations you already added to the report.
-   Importing a custom theme also removes any existing customizations you already added to the report.
-   You can add more options to a custom theme when you edit the `JSON` file directly.

## Related content

-   [Visual defaults in Power BI reports](power-bi-reports-visual-defaults)
-   [Create custom report themes in Power BI Desktop](report-themes-create-custom)
-   [Design Power BI reports for accessibility](desktop-accessibility-creating-reports)
-   [Tips and tricks for color formatting](../visuals/service-tips-and-tricks-for-color-formatting)
-   [Conditional formatting in Power BI](../visuals/power-bi-visualization-conditional-formatting)

------------------------------------------------------------------------
