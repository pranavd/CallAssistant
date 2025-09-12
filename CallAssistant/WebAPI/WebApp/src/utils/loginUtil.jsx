
import { PublicClientApplication } from "@azure/msal-browser";
import { AzureCommunicationTokenCredential, getIdentifierRawId } from "@azure/communication-common";
import { CommunicationIdentityClient } from "@azure/communication-identity";
import { AzureLogger, setLogLevel } from "@azure/logger";

const CLIENT_ID = "0d484f5d-9a2f-437a-b4be-8ae9073c1536";
const TENANT_ID = "599254d5-5f95-4f88-9bda-70ccd1dfe125";
const ACS_CONNECTION_STRING = "endpoint=https://oncallbot-acs.unitedstates.communication.azure.com/;accesskey=1L9ZtnpnOO0kgE5BMwhwp5EnPZlCPQEgCTlbOnorXGPMfG2UEcb9JQQJ99BIACULyCphgowcAAAAAZCSakcV";

const msalConfig = {
    auth: {
        clientId: CLIENT_ID,
        authority: `https://login.microsoftonline.com/${TENANT_ID}`,
        redirectUri: window.location.origin,
    },
};

const loginRequest = {
    scopes: [
        "https://auth.msft.communication.azure.com/Teams.ManageCalls",
        "https://auth.msft.communication.azure.com/Teams.ManageChats",
    ],
};

const msalInstance = new PublicClientApplication(msalConfig);

export async function getAcsTokenForGuestUser() {
    try {
        const communicationIdentityClient = new CommunicationIdentityClient(ACS_CONNECTION_STRING);
        const user = await communicationIdentityClient.createUser();
        const tokenInfo = await communicationIdentityClient.getToken(user, ["voip.join", "voip"]);
        sessionStorage.setItem('acs_token', JSON.stringify(tokenInfo));
    } catch (error) {
        console.log("Error while getting ACS token for guest uer", error);
    }
}

export async function getAcsTokenForTeams() {
    try {
        const cachedToken = sessionStorage.getItem('acs_token');
        if (cachedToken) {
            // return cachedToken;
        }
        const aadResponse = await loginAndGetAADToken();
        const userId = await getIdentifierRawId({ microsoftTeamsUserId: aadResponse.uniqueId });
        const communicationIdentityClient = new CommunicationIdentityClient(ACS_CONNECTION_STRING);
        const acsToken = await communicationIdentityClient.getTokenForTeamsUser({
            teamsUserAadToken: aadResponse.accessToken,
            clientId: CLIENT_ID,
            userObjectId: aadResponse.uniqueId

        });

        sessionStorage.setItem('acs_token', JSON.stringify(acsToken.token));
        sessionStorage.setItem('acs_user_id', JSON.stringify(userId));

        // const customId = "pdaipuria@61yn2p.onmicrosoft.com";
        // const identityTokenResponse = await communicationIdentityClient.createUserAndToken(["voip"], { customId });
        // console.log(identityTokenResponse);
        // sessionStorage.setItem('acs_token', JSON.stringify(identityTokenResponse));

    } catch (error) {
        console.log("Error while getting acs token", error);
    }
}

async function loginAndGetAADToken() {
    try {
        await msalInstance.initialize();
        const loginResponse = await msalInstance.loginPopup(loginRequest);
        const account = loginResponse.account;
        const tokenResponse = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account,
        });
        return tokenResponse;
    } catch (error) {
        // fallback to interactive if silent fails
        const tokenResponse = await msalInstance.acquireTokenPopup(loginRequest);
        return tokenResponse;
    }
}