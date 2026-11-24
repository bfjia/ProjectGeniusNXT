<!-- Source: https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-git (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Power BI Desktop projects Git integration

Git integration in Microsoft Visual Studio Code (VS Code) enables Pro BI developers working with Power BI Desktop projects to streamline development processes, source control, and collaboration with Git repositories.

With Git integration, you can:

-   Backup and version your work.
-   Revert to previous states.
-   Collaborate with others or work alone using Git branches.
-   Use the capabilities of familiar source control tools, like Azure DevOps.

## Prerequisites

-   Familiarity with Git. See [Git and GitHub learning resources](https://docs.github.com/en/get-started/quickstart/git-and-github-learning-resources).
-   [Download](/en-us/devops/develop/git/install-and-set-up-git) and install Git.
-   [Download](https://code.visualstudio.com/) and install VS Code development environment. It has native integration with Git. To learn more, see [Using Git source control in VS Code](https://code.visualstudio.com/docs/sourcecontrol/overview).

## Create a local Git repo using VS Code

1.  In VS Code, open a Power BI Desktop project folder:

    ![Image showing open folder in VS Code.](media/projects-git/open-pbip-folder.png)

2.  Initialize a Git repository by selecting **Source Control** \> **Initialize Repository**:

    ![Image showing Initialize Repository in VS Code.](media/projects-git/initialize-git-repo.png)

3.  Do an initial Commit and enter a message:

    ![Image showing a commit in VS Code.](media/projects-git/commit.png)

From now on, any changes you make in Power BI Desktop changes a file in the folder tracked by your local Git. For example, in Power BI Desktop, when you change a DAX formula for a measure and then save, it triggers a Git diff on the model.bim file.

![Image showing a measure change in VS Code.](media/projects-git/measure-change.png)

With Git integration, you can not only backup your work, but also track your change history. For example, with GitGraph, a popular free VS Code extension, you can easily track all your changes.

![Image showing GitGraph in VS Code.](media/projects-git/gitgraph.png)

## Related content

-   [Power BI Desktop projects Azure DevOps integration](projects-azdo)
-   [Power BI Desktop project semantic model folder](projects-dataset)
-   [Power BI Desktop project report folder](projects-report)

------------------------------------------------------------------------
