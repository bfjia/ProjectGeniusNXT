<!-- Source: https://learn.microsoft.com/en-us/rest/api/fabric/articles/get-started/fabric-api-quickstart (retrieved 2026-11-23, converted from HTML; © Microsoft, see learn.microsoft.com terms) -->

# Fabric API quickstart

## Introduction

To work with Fabric APIs, like many other Microsoft services, you first need to get a Microsoft Entra token for Fabric service, then use that token in the authorization header of the API call.

In this quickstart tutorial, you'll create a C# console app, which will acquire an Entra ID token using MSAL.Net library, then use C# HttpClient to call List workspaces API.

## Create app registration

To get a Microsoft Entra token, you first need to register an application with Microsoft Entra ID.

To learn more about registering an application and different properties of the application and how it might be applicable to your scenario, see [Register an app in the Microsoft identity platform](/en-us/entra/identity-platform/quickstart-register-app).

In this quickstart tutorial, you'll create a public client with redirect URI = http://localhost

1.  Sign in to the [Microsoft Entra admin center](https://entra.microsoft.com/) as at least a [Cloud Application Administrator](/en-us/entra/identity/role-based-access-control/permissions-reference#cloud-application-administrator).

2.  Browse to Applications \> App registrations.

3.  Click on New registration.

4.  Enter a display Name for your application, and add Public client redirect URI `http://localhost`

    ![Screenshot that shows a form of app registration.](../../../../docs-ref-conceptual/media/get-started/app-registration.png)

5.  Select **Register**.

6.  Copy the **Application (client) ID** and paste it in a notepad to be used later.

![Screenshot that shows an app in azure post registration.](../../../../docs-ref-conceptual/media/get-started/app-example.png)

## Get token

In this tutorial you'll use MSAL.Net to acquire an Entra ID token for Fabric service with the following scopes: Workspace.ReadWrite.All, Item.ReadWrite.All.

For more information about token acquisition with MSAL.Net to, see [Token Acquisition - Microsoft Authentication Library for .NET](/en-us/entra/msal/dotnet/acquiring-tokens/overview).

Paste the Application (client) ID you copied earlier and paste it for ClientId variable.

### C# code sample for acquiring a Microsoft Entra access token

``` lang-csharp
#region parameters section 
string ClientId = "YourApplicationId"; 
string Authority = "https://login.microsoftonline.com/organizations"; 
string RedirectURI = "http://localhost"; 
#endregion 

#region Acquire a token for Fabric APIs 
// In this sample we acquire a token for Fabric service with the scopes  
// Workspace.ReadWrite.All and Item.ReadWrite.All 
string[] scopes = new string[] { "https://api.fabric.microsoft.com/Workspace.ReadWrite.All https://api.fabric.microsoft.com/Item.ReadWrite.All" }; 

PublicClientApplicationBuilder PublicClientAppBuilder = 
        PublicClientApplicationBuilder.Create(ClientId) 
        .WithAuthority(Authority) 
        .WithRedirectUri(RedirectURI); 

IPublicClientApplication PublicClientApplication = PublicClientAppBuilder.Build(); 

AuthenticationResult result = await PublicClientApplication.AcquireTokenInteractive(scopes) 
        .ExecuteAsync() 
        .ConfigureAwait(false); 

Console.WriteLine(result.AccessToken); 
#endregion 
```

### Call list workspaces API

In this section you will:

1.  Create the C# HttpClient with the token we acquired in previous section.
2.  Add `https://api.fabric.microsoft.com/v1/` as the base URL for the client.
3.  Call List workspaces API and Write the response to the console.

#### C# code sample of creating an http client and calling List Workspaces API

``` lang-csharp
// Create client 
HttpClient client = new HttpClient(); 
client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", result.AccessToken); 
string baseUrl = "https://api.fabric.microsoft.com/v1/"; 
client.BaseAddress = new Uri(baseUrl); 

// Call list workspaces API 
HttpResponseMessage response = await client.GetAsync("workspaces"); 
string responseBody = await response.Content.ReadAsStringAsync(); 
Console.WriteLine(responseBody); 
```

### Full C# console app code sample

``` lang-csharp
using Microsoft.Identity.Client; 
using System.Net.Http.Headers; 

#region parameters section 
string ClientId = "YourApplicationId";  
string Authority = "https://login.microsoftonline.com/organizations"; 
string RedirectURI = "http://localhost";  
#endregion 

#region Acquire a token for Fabric APIs 
// In this sample we acquire a token for Fabric service with the scopes Workspace.ReadWrite.All and Item.ReadWrite.All 
string[] scopes = new string[] { "https://api.fabric.microsoft.com/Workspace.ReadWrite.All https://api.fabric.microsoft.com/Item.ReadWrite.All" }; 

PublicClientApplicationBuilder PublicClientAppBuilder = 
        PublicClientApplicationBuilder.Create(ClientId) 
        .WithAuthority(Authority) 
        .WithRedirectUri(RedirectURI); 

IPublicClientApplication PublicClientApplication = PublicClientAppBuilder.Build(); 

AuthenticationResult result = await PublicClientApplication.AcquireTokenInteractive(scopes) 
        .ExecuteAsync() 
        .ConfigureAwait(false); 

Console.WriteLine(result.AccessToken); 
#endregion 

#region Create an HTTP client and call the Fabric APIs 
// Create client 
HttpClient client = new HttpClient(); 
client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", result.AccessToken); 
string baseUrl = "https://api.fabric.microsoft.com/v1/"; 
client.BaseAddress = new Uri(baseUrl); 

// Call list workspaces API 
HttpResponseMessage response = await client.GetAsync("workspaces"); 
string responseBody = await response.Content.ReadAsStringAsync(); 
Console.WriteLine(responseBody); 
#endregion 
```

------------------------------------------------------------------------
