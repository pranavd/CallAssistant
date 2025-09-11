using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Azure.Communication;
using Azure.Communication.Identity;
using Azure.Core;
using Microsoft.Identity.Client;

namespace WebAPI.Controllers
{
    [RoutePrefix("acs-calling")]
    public class AcsCallingController : ApiController
    {
        private static string _acsConnectionString = Environment.GetEnvironmentVariable("ACS_CONNECTION_STRING");

        [Route("token")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetCommunicationUserToken()
        {
            try
            {
                var communicationIdentityClient = new CommunicationIdentityClient(_acsConnectionString);
                var user = await communicationIdentityClient.CreateUserAsync();
                var token = await communicationIdentityClient.GetTokenAsync(user, new List<CommunicationTokenScope>()
                {
                    CommunicationTokenScope.VoIP, CommunicationTokenScope.VoIPJoin
                });

                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    Token = token.Value.Token,
                    ExpiresOn = token.Value.ExpiresOn,
                    UserId = user.Value.Id,
                    TokenType = token.Value.TokenType,
                });
            }
            catch (Exception e)
            {
                var exception = e;
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e);
            }
        }

        [Route("teams/token")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetCommunicationUserTeamsToken()
        {
            try
            {
                var clientId = Environment.GetEnvironmentVariable("APP_CLIENT_ID");
                var tenantId = Environment.GetEnvironmentVariable("APP_CLIENT_TENANT");
                var clientSecret = Environment.GetEnvironmentVariable("APP_CLIENT_SECRET");
                var authority = $"https://login.microsoftonline.com/{tenantId}";
                var redirectUri = "http://localhost";
                var scopes = new string[] { "https://graph.microsoft.com/.default" };

                // Create an instance of PublicClientApplication
                var app = ConfidentialClientApplicationBuilder.Create(clientId)
                    .WithClientSecret(clientSecret)
                    .WithAuthority(new Uri($"https://login.microsoftonline.com/{tenantId}"))
                    .Build();

                var result = await app.AcquireTokenForClient(scopes)
                    .ExecuteAsync();

                var communicationIdentityClient = new CommunicationIdentityClient(_acsConnectionString);
                var user = await communicationIdentityClient.CreateUserAsync();
                var token = await communicationIdentityClient.GetTokenAsync(user, new List<CommunicationTokenScope>()
                {
                    CommunicationTokenScope.VoIP, CommunicationTokenScope.VoIPJoin
                });

                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    Token = token.Value.Token,
                    ExpiresOn = token.Value.ExpiresOn,
                    UserId = user.Value.Id,
                    TokenType = token.Value.TokenType,
                });
            }
            catch (Exception e)
            {
                var exception = e;
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e);
            }
        }
    }
}
