<!-- Source: https://learn.microsoft.com/en-us/powerquery-m/folder-files (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Folder.Files

## Syntax

    Folder.Files(path as text, optional options as nullable record) as table

## About

Returns a table containing a row for each file found in the specified folder and all its subfolders.

-   `path`: The path to the folder you want to retrieve the files from. The supplied folder path must be a valid absolute path.
-   `options`: (Optional) This parameter is currently intended for internal use only.

Each row of the returned table contains properties of the file and a link to its content.

## Example

Return a table containing all of the files found in C:\\test-examples\\example-folder and all of its subfolders.

**Usage**

``` lang-powerquery-m
Folder.Files("C:\test-examples\example-folder")
```

**Output**

`A table containing the files, their properties, and a link to their content.`

------------------------------------------------------------------------
