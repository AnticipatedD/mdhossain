# Partner Center authentication - Partner app developer | Microsoft Learn

**Applies to**: Partner Center | Partner Center operated by 21Vianet | Partner Center for Microsoft Cloud for US Government

Partner Center uses Microsoft Entra ID for authentication. When interacting with the Partner Center API, SDK, or PowerShell module you must correctly configure a Microsoft Entra application and then request an access token. Access tokens obtained using app only or app + user authentication can be used with the Partner Center. However, there are three important items that need to be considered

- **Use multifactor authentication when accessing the Partner Center API using app + user authentication.** For more information regarding this change, see [Enable secure application model](enable-secure-app-model).

Important

Beginning April 1, 2026 all App+User usage of Partner Center APIs will enforce the usage of MFA.

To help prepare for this requirement, beginning October 2025 APIs will look for the MFA token and will provide confirmation of its presence in the response. For more information, see [Validating API calls are integrated with MFA](enable-secure-app-model#validating-api-calls-are-integrated-with-mfa).

- Not all of the operations the Partner Center API support app only authentication. There are certain scenarios where you'll be required to use app + user authentication. Under the *Prerequisites* heading on each [article](scenarios), you find documentation that states whether app only authentication, app + user authentication, or both are supported.
- There are two different types of applications - web apps and native apps. Web apps support both app-only **and** app + user authentication, however, native apps **only** support app + user authentication.

Important

Azure Active Directory (Azure AD) Graph is deprecated as of June 30, 2023. Going forward, we're making no further investments in Azure AD Graph. Azure AD Graph APIs have no SLA or maintenance commitment beyond security-related fixes. Investments in new features and functionalities will only be made in Microsoft Graph.

We'll retire Azure AD Graph in incremental steps so that you have sufficient time to migrate your applications to Microsoft Graph APIs. At a later date that we will announce, we will block the creation of any new applications using Azure AD Graph.

To learn more, see [Important: Azure AD Graph Retirement and Powershell Module Deprecation](https://techcommunity.microsoft.com/t5/microsoft-entra-azure-ad-blog/important-azure-ad-graph-retirement-and-powershell-module/ba-p/3848270).

## Initial setup

1. To begin, you need to make sure that you have both a primary Partner Center account, and an integration sandbox Partner Center account. For more information, see [Set up Partner Center accounts for API access](set-up-api-access-in-partner-center). Make note of the Microsoft Entra App registration ID and Secret (client secret is required for App only identification) for both your primary account and your integration sandbox account.
2. Sign in to Microsoft Entra ID from the Azure portal. In **permissions to other applications**, set permissions for **Windows Azure Active Directory** to **Delegated Permissions**, and select both **Access the directory as the signed-in user** and **Sign in and read user profile**.
3. In the Azure portal, **Add application**. Search for "Microsoft Partner Center," which is the Microsoft Partner Center application. Set the **Delegated Permissions** to **Access Partner Center API**. If you're using Partner Center for Microsoft Cloud for US Government, this step is mandatory. If you're using Partner Center global instance, this step is optional. CSP Partners can use the App Management feature in Partner Center to bypass this step for Partner Center global instance.

## App-only authentication

If you would like to use app-only authentication to access the Partner Center REST API, .NET API, Java API, or PowerShell module then you can do so by using the following instructions.

## .NET (app-only authentication)

```csharp
public static IAggregatePartner GetPartnerCenterTokenUsingAppCredentials()
{
    IPartnerCredentials partnerCredentials =
        PartnerCredentials.Instance.GenerateByApplicationCredentials(
            PartnerApplicationConfiguration.ApplicationId,
            PartnerApplicationConfiguration.ApplicationSecret,
            PartnerApplicationConfiguration.ApplicationDomain);

    // Create operations instance with partnerCredentials.
    return PartnerService.Instance.CreatePartnerOperations(partnerCredentials);
}
```

## Java (app-only authentication)

The [Partner Center Java SDK](https://github.com/microsoft/partner-center-java) can be used to manage Partner Center resources. It's an open-source project maintained by the partner community and not officially supported by Microsoft. You can [get help from the community](https://stackoverflow.com/questions/tagged/partner+center) or [open an issue on GitHub](https://github.com/microsoft/partner-center-java/issues) if you experience a problem.

```java
public IAggregatePartner getAppPartnerOperations()
{
    IPartnerCredentials appCredentials =
        PartnerCredentials.getInstance().generateByApplicationCredentials(
        PartnerApplicationConfiguration.getApplicationId(),
        PartnerApplicationConfiguration.getApplicationSecret(),
        PartnerApplicationConfiguration.getApplicationDomain());

    return PartnerService.getInstance().createPartnerOperations( appCredentials );
}
```

## REST (app-only authentication)

### REST request

```http
POST https://login.microsoftonline.com/{tenantId}/oauth2/token HTTP/1.1
Accept: application/json
return-client-request-id: true
Content-Type: application/x-www-form-urlencoded; charset=utf-8
Host: login.microsoftonline.com
Content-Length: 194
Expect: 100-continue

resource=https%3A%2F%2Fapi.partnercenter.microsoft.com&client_id={client-id-here}&client_secret={client-secret-here}&grant_type=client_credentials
```

### REST response

```http
HTTP/1.1 200 OK
Cache-Control: no-cache, no-store
Pragma: no-cache
Content-Type: application/json; charset=utf-8
Expires: -1
Content-Length: 1406

{"token_type":"Bearer","expires_in":"3600","ext_expires_in":"3600","expires_on":"1546469802","not_before":"1546465902","resource":"https://api.partnercenter.microsoft.com","access_token":"value-has-been-removed"}
```

## App + User authentication

The Secure Application Model is now used to provide secure, scalable, and future-proof authentication for Partner Center API access. This approach improves security by using modern authentication mechanisms such as app-only and app+user access tokens via Azure AD. For more information, see [Enable secure application model](partner-center-authentication).

### Partner consent

The partner consent process is an interactive process where the partner authenticates using multifactor authentication, consents to the application, and a refresh token is stored in a secure repository such as Azure Key Vault. We recommend that a dedicated account for integration purposes be used for this process.

Important

The appropriate multifactor authentication solution should be enabled for the service account used in the partner consent process. If it isn't then the resulting refresh token will not be compliant with security requirements.

### Samples for App + User authentication

The partner consent process can be performed in many ways. To help partners understand how to perform each required operation, we've developed the following samples. When you implement the appropriate solution in your environment, it's important that you develop a solution that is compliant with your coding standards and security policies.

## .NET (app+user authentication)

The [partner consent](https://github.com/Microsoft/Partner-Center-DotNet-Samples/tree/master/secure-app-model/keyvault) sample project demonstrates how to utilize a website developed using ASP.NET to capture consent, request a refresh token, and securely store it in Azure Key Vault. Perform the following steps to create the required prerequisites for this sample.

1. Create an instance of Azure Key Vault using the Azure portal or the following PowerShell commands. Before executing the command, be sure to modify the parameter values accordingly. The vault name must be unique.

    ```azurepowershell
    Login-AzureRmAccount
    
    # Create a new resource group
    New-AzureRmResourceGroup -Name ContosoResourceGroup -Location EastUS
    
    New-AzureRmKeyVault -Name 'Contoso-Vault' -ResourceGroupName 'ContosoResourceGroup' -Location 'East US'
    ```

    For more information about creating an Azure Key Vault, see [Quickstart: Set and retrieve a secret from Azure Key Vault using the Azure portal](/en-us/azure/key-vault/quick-create-portal) or [Quickstart: Set and retrieve a secret from Azure Key Vault using PowerShell](/en-us/azure/key-vault/quick-create-powershell). Then set and retrieve a secret.
2. Create a Microsoft Entra Application and a key using the Azure portal or the following commands.

    ```powershell
    Connect-MgGraph -Scopes "Application.ReadWrite.OwnedBy"
    
    $Context = Get-MgContext
    
    $app = New-MgApplication -DisplayName 'My Vault Access App' -Web @{ RedirectUris = 'https://$($Context.TenantId)/$((New-Guid).ToString())' }
    $password = Add-MgApplicationPassword -ApplicationId $app.AppId
    
    Write-Host "ApplicationId       = $($app.AppId)"
    Write-Host "ApplicationSecret   = $($password.SecretText)"
    ```

    Be sure to make note of the application identifier and secret values because they'll be used in the steps below.
3. Grant the newly create Microsoft Entra application the read secrets permissions using the Azure portal or the following commands.

    ```powershell
    # Connect to Microsoft Graph
    Connect-MgGraph -Scopes "User.Read"
    
    # Get the application
    $app = Get-MgApplication -Filter "appId eq 'ENTER-APP-ID-HERE'"
    
    # Set the Key Vault access policy
    Set-AzKeyVaultAccessPolicy -VaultName ContosoVault -ObjectId $app.Id -PermissionsToSecrets get
    ```
4. Create a Microsoft Entra application that is configured for Partner Center. Perform the following actions to complete this step.

    - Browse to the [App management](https://aka.ms/accountexp/appMgmt) feature of Partner Center
    - Select *Add new web app* to create a new Microsoft Entra application.

    Be sure to document the *App ID*, *Account ID*\*, and *Key* values because they'll be used in the steps below.
5. Clone the [Partner-Center-DotNet-Samples](https://github.com/Microsoft/Partner-Center-DotNet-Samples) repository using Visual Studio or the following command.

    ```bash
    git clone https://github.com/Microsoft/Partner-Center-DotNet-Samples.git
    ```
6. Open the *PartnerConsent* project found in the `Partner-Center-DotNet-Samples\secure-app-model\keyvault` directory.
7. Populate the application settings found in the [web.config](https://github.com/Microsoft/Partner-Center-DotNet-Samples/blob/master/secure-app-model/keyvault/PartnerConsent/Web.config)

    ```xml
    <!-- AppID that represents CSP application -->
    <add key="ida:CSPApplicationId" value="" />
    <!--
        Please use certificate as your client secret and deploy the certificate to your environment.
        The following application secret is for sample application only. please do not use secret directly from the config file.
    -->
    <add key="ida:CSPApplicationSecret" value="" />
    
    <!--
        Endpoint address for the instance of Azure KeyVault. This is
        the DNS Name for the instance of Key Vault that you provisioned.
     -->
    <add key="KeyVaultEndpoint" value="" />
    
    <!-- App ID that is given access for KeyVault to store refresh tokens -->
    <add key="ida:KeyVaultClientId" value="" />
    
    <!--
        Please use certificate as your client secret and deploy the certificate
        to your environment. The following application secret is for sample
        application only. please do not use secret directly from the config file.
    -->
    <add key="ida:KeyVaultClientSecret" value="" />
    ```

    Important

    Sensitive information such as application secrets should not be stored in configuration files. It was done here because this is a sample application. With your production application we strongly recommend that you use certificate-based authentication. For more information, see [Certificate credentials for application authentication](/en-us/azure/active-directory/develop/active-directory-certificate-credentials).
8. When you run this sample project, it prompts you for authentication. After successfully authenticating, an access token is requested from Microsoft Entra ID. The information returned from Microsoft Entra ID includes a refresh token that is stored in the configured instance of Azure Key Vault.

## Java (app+user authentication)

The [partner consent](https://github.com/Microsoft/Partner-Center-Java-Samples/tree/master/secure-app-model/keyvault) sample project demonstrates how to utilize a website developed using JSP to capture consent, request a refresh token, and secure store in Azure Key Vault. Perform the following to create the required prerequisites for this sample.

1. Create an instance of Azure Key Vault using the Azure portal or the following PowerShell commands. Before executing the command, be sure to modify the parameter values accordingly. The vault name must be unique.

    ```azurepowershell
    Login-AzureRmAccount
    
    # Create a new resource group
    New-AzureRmResourceGroup -Name ContosoResourceGroup -Location EastUS
    
    New-AzureRmKeyVault -Name 'Contoso-Vault' -ResourceGroupName 'ContosoResourceGroup' -Location 'East US'
    ```

    For more information about creating an Azure Key Vault, see [Quickstart: Set and retrieve a secret from Azure Key Vault using the Azure portal](/en-us/azure/key-vault/quick-create-portal) or [Quickstart: Set and retrieve a secret from Azure Key Vault using PowerShell](/en-us/azure/key-vault/quick-create-powershell).
2. Create a Microsoft Entra Application and a key using the Azure portal or the following commands.

    ```powershell
    Connect-MgGraph -Scopes "Application.ReadWrite.OwnedBy"
    
    $Context = Get-MgContext
    
    $app = New-MgApplication -DisplayName 'My Vault Access App' -IdentifierUri 'https://$($Context.TenantDomain)/$((New-Guid).ToString())'
    $password = Add-MgApplicationPassword -ApplicationId $app.AppId
    
    Write-Host "ApplicationId       = $($app.AppId)"
    Write-Host "ApplicationSecret   = $($password.SecretText)"
    ```

    Be sure to document the application identifier and secret values because they'll be used in the steps below.
3. Grant the newly created Microsoft Entra application the read secrets permissions using the Azure portal or the following commands.

    ```powershell
    Connect-MgGraph -Scopes "User.Read"
    $app = Get-MgApplication -Filter "appId eq 'ENTER-APP-ID-HERE'"
    
    Set-AzKeyVaultAccessPolicy -VaultName ContosoVault -ObjectId $app.Id -PermissionsToSecrets get
    ```
4. Create a Microsoft Entra application that is configured for Partner Center. Perform the following to complete this step.

    - Browse to the [App management](https://aka.ms/accountexp/appMgmt) feature of Partner Center
    - Select *Add new web app* to create a new Microsoft Entra application.

    Be sure to document the *App ID*, *Account ID*\*, and *Key* values because they'll be used in the steps below.
5. Clone the [Partner-Center-Java-Samples](https://github.com/Microsoft/Partner-Center-Java-Samples) repository using the following command

    ```bash
    git clone https://github.com/Microsoft/Partner-Center-Java-Samples.git
    ```
6. Open the *PartnerConsent* project found in the `Partner-Center-Java-Samples\secure-app-model\keyvault` directory.
7. Populate the application settings found in the [web.xml](https://github.com/Microsoft/Partner-Center-Java-Samples/blob/master/secure-app-model/keyvault/partnerconsent/src/main/webapp/WEB-INF/web.xml) file

    ```xml
    <filter>
        <filter-name>AuthenticationFilter</filter-name>
        <filter-class>com.microsoft.store.samples.partnerconsent.security.AuthenticationFilter</filter-class>
        <init-param>
            <param-name>client_id</param-name>
            <param-value></param-value>
        </init-param>
        <init-param>
            <param-name>client_secret</param-name>
            <param-value></param-value>
        </init-param>
        <init-param>
            <param-name>keyvault_base_url</param-name>
            <param-value></param-value>
        </init-param>
        <init-param>
            <param-name>keyvault_client_id</param-name>
            <param-value></param-value>
        </init-param>
        <init-param>
            <param-name>keyvault_client_secret</param-name>
            <param-value></param-value>
        </init-param>
        <init-param>
            <param-name>keyvault_certifcate_path</param-name>
            <param-value></param-value>
        </init-param>
    </filter>
    ```

    Important

    Sensitive information such as application secrets should not be stored in configurations files. It was done here because this is a sample application. With your production application, we strongly recommend that you use certificate based authenticate. For more information, see [Key Vault Certificate authentication](https://github.com/Azure-Samples/key-vault-java-certificate-authentication).
8. When you run this sample project, it prompts you for authentication. After successfully authenticating, an access token is requested from Microsoft Entra ID. The information returned from Microsoft Entra ID includes a refresh token that is stored in the configured instance of Azure Key Vault.

## Cloud Solution Provider authentication

Cloud Solution Provider partners can use the refresh token obtained through the partner consent process.

### Samples for Cloud Solution Provider authentication

To help partners understand how to perform each required operation, we've developed the following samples. When you implement the appropriate solution in your environment, it's important that you develop a solution that is compliant with your coding standards and security policies.

## .NET (CSP authentication)

1. If you haven't already done so, perform the partner consent process.
2. Clone the [Partner-Center-DotNet-Samples](https://github.com/Microsoft/Partner-Center-DotNet-Samples) repository using Visual Studio or the following command

    ```bash
    git clone https://github.com/Microsoft/Partner-Center-DotNet-Samples.git
    ```
3. Open the `CSPApplication` project found in the `Partner-Center-DotNet-Samples\secure-app-model\keyvault` directory.
4. Update the application settings found in the [App.config](https://github.com/Microsoft/Partner-Center-DotNet-Samples/blob/master/secure-app-model/keyvault/CSPApplication/App.config) file.

    ```xml
    <!-- AppID that represents CSP application -->
    <add key="ida:CSPApplicationId" value="" />
    <!--
        Please use certificate as your client secret and deploy the certificate to your environment.
        The following application secret is for sample application only. please do not use secret directly from the config file.
    -->
    <add key="ida:CSPApplicationSecret" value="" />
    
    <!-- Endpoint address for the instance of Azure KeyVault -->
    <add key="KeyVaultEndpoint" value="" />
    
    <!-- AppID that is given access for keyvault to store the refresh tokens -->
    <add key="ida:KeyVaultClientId" value="" />
    
    <!--
        Please use certificate as your client secret and deploy the certificate to your environment.
        The following application secret is for sample application only. please do not use secret directly from the config file.
    -->
    <add key="ida:KeyVaultClientSecret" value="" />
    ```
5. Set the appropriate values for the **PartnerId** and **CustomerId** variables found in the [Program.cs](https://github.com/Microsoft/Partner-Center-DotNet-Samples/blob/master/secure-app-model/keyvault/CSPApplication/Program.cs) file.

    ```csharp
    // The following properties indicate which partner and customer context the calls are going to be made.
    string PartnerId = "<Partner tenant id>";
    string CustomerId = "<Customer tenant id>";
    ```
6. When you run this sample project, it obtains the refresh token obtained during the partner consent process. Then, it requests an access token to interact with the Partner Center SDK on the partner's behalf. Finally, it requests an access token to interact with Microsoft Graph on behalf of the specified customer.

## Java (CSP authentication)

1. If you haven't done so already, perform the partner consent process.
2. Clone the [Partner-Center-Java-Samples](https://github.com/Microsoft/Partner-Center-Java-Samples) repository using Visual Studio or the following command

    ```bash
    git clone https://github.com/Microsoft/Partner-Center-Java-Samples.git
    ```
3. Open the `cspsample` project found in the `Partner-Center-Java-Samples\secure-app-model\keyvault` directory.
4. Update the application settings found in the [application.properties](https://github.com/Microsoft/Partner-Center-Java-Samples/blob/master/secure-app-model/keyvault/cspsample/src/main/resources/application.properties) file.

    ```java
    azuread.authority=https://login.microsoftonline.com
    keyvault.baseurl=
    keyvault.clientId=
    keyvault.clientSecret=
    partnercenter.accountId=
    partnercenter.clientId=
    partnercenter.clientSecret=
    ```
5. When you run this sample project, it obtains the refresh token obtained during the partner consent process. Then, it requests an access token to interact with the Partner Center SDK on the partner's behalf.
6. Optional - uncomment the *RunAzureTask* and *RunGraphTask* function calls if you want to see how to interact with Azure Resource Manager and Microsoft Graph on behalf of the customer.

## Control Panel Provider authentication

Control panel vendors need to have each partner they support perform the partner consent process. Once that is completed the refresh token obtained through that process is used to access the Partner Center REST API and .NET API.

Note

Control panel vendors should have at minimum the **Cloud Application Administrator** role in the customer's tenant.

### Samples for Cloud Panel Provider authentication

To help control panel vendors understand how to perform each required operation, we've developed the following samples. When you implement the appropriate solution in your environment, it's important that you develop a solution that is compliant with your coding standards and security policies.

## .NET (CPV authentication)

1. Develop and deploy a process for Cloud Solution Provider partners to provide the appropriate consent. For more information an example, see partner consent.

    Important

    User credentials from a Cloud Solution Provider partner should not be stored. The refresh token obtained through the partner consent process should be stored and used to request access tokens for interacting with any Microsoft API.
2. Clone the [Partner-Center-DotNet-Samples](https://github.com/Microsoft/Partner-Center-DotNet-Samples) repository using Visual Studio or the following command

    ```bash
    git clone https://github.com/Microsoft/Partner-Center-DotNet-Samples.git
    ```
3. Open the `CPVApplication` project found in the `Partner-Center-DotNet-Samples\secure-app-model\keyvault` directory.
4. Update the application settings found in the [App.config](https://github.com/Microsoft/Partner-Center-DotNet-Samples/blob/master/secure-app-model/keyvault/CPVApplication/App.config) file.

    ```xml
    <!-- AppID that represents Control panel vendor application -->
    <add key="ida:CPVApplicationId" value="" />
    
    <!--
        Please use certificate as your client secret and deploy the certificate to your environment.
        The following application secret is for sample application only. please do not use secret directly from the config file.
    -->
    <add key="ida:CPVApplicationSecret" value="" />
    
    <!-- Endpoint address for the instance of Azure KeyVault -->
    <add key="KeyVaultEndpoint" value="" />
    
    <!-- AppID that is given access for keyvault to store the refresh tokens -->
    <add key="ida:KeyVaultClientId" value="" />
    
    <!--
        Please use certificate as your client secret and deploy the certificate to your environment.
        The following application secret is for sample application only. please do not use secret directly from the config file.
    -->
    <add key="ida:KeyVaultClientSecret" value="" />
    ```
5. Set the appropriate values for the **PartnerId** and **CustomerId** variables found in the [Program.cs](https://github.com/Microsoft/Partner-Center-DotNet-Samples/blob/master/secure-app-model/keyvault/CPVApplication/Program.cs) file.

    ```csharp
    // The following properties indicate which partner and customer context the calls are going to be made.
    string PartnerId = "<Partner tenant id>";
    string CustomerId = "<Customer tenant id>";
    ```
6. When you run this sample project, it obtains the refresh token for the specified partner. Then, it requests an access token to access Partner Center and Microsoft Graph on behalf of the partner. The next task it performs is the deletion and creation of permission grants into the customer tenant. Since there's no relationship between the control panel vendor and the customer, these permissions need to be added using the Partner Center API. The following example shows how to accomplish that.

    ```csharp
    JObject contents = new JObject
    {
        // Provide your application display name
        ["displayName"] = "CPV Marketplace",
    
        // Provide your application id
        ["applicationId"] = CPVApplicationId,
    
        // Provide your application grants
        ["applicationGrants"] = new JArray(
            JObject.Parse("{\"enterpriseApplicationId\": \"00000003-0000-0000-c000-000000000000\", \"scope\":\"Domain.ReadWrite.All,User.ReadWrite.All,Directory.Read.All\"}"), // for Microsoft Graph access,  Directory.Read.All
            JObject.Parse("{\"enterpriseApplicationId\": \"797f4846-ba00-4fd7-ba43-dac1f8f63013\", \"scope\":\"user_impersonation\"}")) // for Azure Resource Manager access
    };
    
    /**
     * The following steps have to be performed once per customer tenant if your application is
     * a control panel vendor application and requires customer tenant Microsoft Graph access.
     **/
    
    // delete the previous grant into customer tenant
    JObject consentDeletion = await ApiCalls.DeleteAsync(
        tokenPartnerResult.Item1,
        string.Format("https://api.partnercenter.microsoft.com/v1/customers/{0}/applicationconsents/{1}", CustomerId, CPVApplicationId));
    
    // create new grants for the application given the setting in application grants payload.
    JObject consentCreation = await ApiCalls.PostAsync(
        tokenPartnerResult.Item1,
        string.Format("https://api.partnercenter.microsoft.com/v1/customers/{0}/applicationconsents", CustomerId),
        contents.ToString());
    ```

After these permissions have been established, the sample performs operations using Microsoft Graph on behalf of the customer.

Note

For more information about Microsoft Graph, see the [Microsoft Graph overview](/en-us/graph/migrate-azure-ad-graph-overview).

## Java (CPV authentication)

1. Develop and deploy a process for Cloud Solution Provider partners to provide the appropriate consent. For more information and an example, see the partner consent.

    Important

    User credentials from a Cloud Solution Provider partner should not be stored. The refresh token obtained through the partner consent process should be stored and used to request access tokens for interacting with any Microsoft API.
2. Clone the [Partner-Center-Java-Samples](https://github.com/Microsoft/Partner-Center-Java-Samples) repository using the following command

    ```bash
    git clone https://github.com/Microsoft/Partner-Center-Java-Samples.git
    ```
3. Open the `cpvsample` project found in the `Partner-Center-Java-Samples\secure-app-model\keyvault` directory.
4. Update the application settings found in the [application.properties](https://github.com/Microsoft/Partner-Center-Java-Samples/blob/master/secure-app-model/keyvault/cpvsample/src/main/resources/application.properties) file.

    ```java
    azuread.authority=https://login.microsoftonline.com
    keyvault.baseurl=
    keyvault.clientId=
    keyvault.clientSecret=
    partnercenter.accountId=
    partnercenter.clientId=
    partnercenter.clientSecret=
    partnercenter.displayName=
    ```

    The value for the `partnercenter.displayName` should be the display name of your marketplace application.
5. Set the appropriate values for the **partnerId** and **customerId** variables found in the [Program.java](https://github.com/Microsoft/Partner-Center-Java-Samples/blob/master/secure-app-model/keyvault/cpvsample/src/main/java/com/microsoft/store/samples/secureappmodel/cpvsample/Program.java) file.

    ```java
    partnerId = "SPECIFY-THE-PARTNER-TENANT-ID-HERE";
    customerId = "SPECIFY-THE-CUSTOMER-TENANT-ID-HERE";
    ```
6. When you run this sample project, it obtains the refresh token for the specified partner. Then, it requests an access token to access Partner Center on behalf of the partner. The next task it performs is the deletion and creation of permission grants into the customer tenant. Since there's no relationship between the control panel vendor and the customer, these permissions need to be added using the Partner Center API. The following example shows how to grant the permissions.

    ```java
    ApplicationGrant azureAppGrant = new ApplicationGrant();
    
    azureAppGrant.setEnterpriseApplication("797f4846-ba00-4fd7-ba43-dac1f8f63013");
    azureAppGrant.setScope("user_impersonation");
    
    ApplicationGrant graphAppGrant = new ApplicationGrant();
    
    graphAppGrant.setEnterpriseApplication("00000002-0000-0000-c000-000000000000");
    graphAppGrant.setScope("Domain.ReadWrite.All,User.ReadWrite.All,Directory.Read.All");
    
    ApplicationConsent consent = new ApplicationConsent();
    
    consent.setApplicationGrants(Arrays.asList(azureAppGrant, graphAppGrant));
    consent.setApplicationId(properties.getProperty(PropertyName.PARTNER_CENTER_CLIENT_ID));
    consent.setDisplayName(properties.getProperty(PropertyName.PARTNER_CENTER_DISPLAY_NAME));
    
    // Deletes the existing grant into the customer it is present.
    partnerOperations.getServiceClient().delete(
        partnerOperations,
        new TypeReference<ApplicationConsent>(){},
        MessageFormat.format(
            "customers/{0}/applicationconsents/{1}",
            customerId,
            properties.getProperty(PropertyName.PARTNER_CENTER_CLIENT_ID)));
    
    // Consent to the defined applications and the respective scopes.
    partnerOperations.getServiceClient().post(
        partnerOperations,
        new TypeReference<ApplicationConsent>(){},
        MessageFormat.format(
            "customers/{0}/applicationconsents",
            customerId),
        consent);
    ```

Uncomment the *RunAzureTask* and *RunGraphTask* function calls if you want to see how to interact with Azure Resource Manager and Microsoft Graph on behalf of the customer. 

---
Copyright © 2026 [MD ABUL HOSSAIN](https://learn.microsoft.com/en-gb/users/mdhossain). All Rights Reserved. 
