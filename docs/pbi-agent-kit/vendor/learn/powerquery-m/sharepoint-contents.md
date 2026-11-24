<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/sharepoint-contents (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# SharePoint.Contents

## Syntax

    SharePoint.Contents(url as text, optional options as nullable record) as table

## About

Returns a hierarchical table containing the folders and files found at the specified SharePoint site, `url`. The table shows the items at the current level and doesn't recursively return every file in the site. For folders, the `Content` column contains a nested table that can be used to navigate to the folder contents. For files, the `Content` column contains the file contents as a binary value. To return a flat table of all files in the site and its subfolders, use [`SharePoint.Files`](sharepoint-files). Each row also contains the `Name`, `Extension`, `Date accessed`, `Date modified`, `Date created`, `Attributes`, and `Folder Path` columns. Folder rows have an empty `Extension` value. `Date accessed` is `null` for both folders and files. The `Folder Path` value is the absolute URL of the folder that contains the item. The site URL can't contain a query string or fragment. `options` may be specified to control the following options:

-   `ApiVersion`: A number (14 or 15) or the text "Auto" that specifies the SharePoint API version to use for this site. When not specified, API version 14 is used. When Auto is specified, the server version will be automatically discovered if possible, otherwise version defaults to 14. Non-English SharePoint sites require at least version 15.
-   `Implementation`: Optional. Specifies which version of the SharePoint connector to use. Accepted values are "2.0" or null. If the value is "2.0", the 2.0 implementation of the SharePoint connector is used. If the value is null, the original implementation of the SharePoint connector is used.

For `SharePoint.Contents`, the original implementation supports `ApiVersion` values 14, 15, and `"Auto"`. If `ApiVersion` isn't specified, version 14 is used. With implementation 2.0, `ApiVersion` doesn't need to be specified because API version 15 is used automatically. API version 14 isn't supported with implementation 2.0.

## Example 1

Return the top-level SharePoint contents using the original implementation. Because no options are specified, API version 14 is used.

**Usage**

``` lang-powerquery-m
SharePoint.Contents("https://contoso.sharepoint.com/sites/Contoso")
```

**Output**

`A hierarchical table containing the top-level folders and files in the site.`

## Example 2

Use the original implementation with automatic API selection to return every `.xlsx` file in the Shared Documents library. The extension comparison is case-insensitive.

**Usage**

``` lang-powerquery-m
let
    Source = SharePoint.Contents(
        "https://contoso.sharepoint.com/sites/Contoso",
        [ApiVersion = "Auto"]
    ),
    SharedDocuments = Source{[Name = "Shared Documents"]}[Content],
    ExcelWorkbooks = Table.SelectRows(
        SharedDocuments,
        each Comparer.OrdinalIgnoreCase([Extension], ".xlsx") = 0
    )
in
    ExcelWorkbooks
```

**Output**

`A table containing only the files in the Shared Documents library whose Extension value is .xlsx.`

## Example 3

Use implementation 2.0 to return the immediate contents of the Reports folder in the Shared Documents library. Implementation 2.0 uses API version 15 by default.

**Usage**

``` lang-powerquery-m
let
    Source = SharePoint.Contents(
        "https://contoso.sharepoint.com/sites/Contoso",
        [Implementation = "2.0"]
    ),
    SharedDocuments = Source{[Name = "Shared Documents"]}[Content],
    Reports = SharedDocuments{[Name = "Reports"]}[Content]
in
    Reports
```

**Output**

`A hierarchical table containing the immediate folders and files in the Reports folder.`

## Example 4

Return the binary content of Budget.xlsx by navigating the hierarchical contents of the site.

**Usage**

``` lang-powerquery-m
let
    Source = SharePoint.Contents(
        "https://contoso.sharepoint.com/sites/Contoso",
        [Implementation = "2.0"]
    ),
    SharedDocuments = Source{[Name = "Shared Documents"]}[Content],
    Reports = SharedDocuments{[Name = "Reports"]}[Content],
    Budget = Reports{[Name = "Budget.xlsx"]}[Content]
in
    Budget
```

**Output**

`The binary content of Budget.xlsx.`

------------------------------------------------------------------------
