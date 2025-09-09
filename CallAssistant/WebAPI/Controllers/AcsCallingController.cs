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

namespace WebAPI.Controllers
{
    [RoutePrefix("acs-calling")]
    public class AcsCallingController : ApiController
    {
        private static String AcsConnectionString =
            "";

        [Route("token")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetCommunicationUserToken()
        {
            try
            {
                var communicationIdentityClient = new CommunicationIdentityClient(AcsConnectionString);
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
