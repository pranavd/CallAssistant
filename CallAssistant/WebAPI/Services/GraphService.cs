using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web;
using Azure.Identity;
using Microsoft.Graph;
using Microsoft.Graph.Models;

namespace WebAPI.Services
{
    public class GraphService
    {
        private GraphServiceClient _graphServiceClient = null;
        private readonly string _clientId = ConfigurationManager.AppSettings["ClientId"];
        private readonly string _clientSecret = ConfigurationManager.AppSettings["ClientSecret"];
        private readonly string _tenantId = ConfigurationManager.AppSettings["TenantId"];
        private readonly string _host = ConfigurationManager.AppSettings["Host"];

        public GraphService()
        {
            try
            {
                var clientSecretCredential = new ClientSecretCredential(_tenantId, _clientId, _clientSecret,
                    new TokenCredentialOptions() { AuthorityHost = AzureAuthorityHosts.AzurePublicCloud });

                var scopes = new[] { "https://graph.microsoft.com/.default" };

                _graphServiceClient = new GraphServiceClient(clientSecretCredential, scopes);
            }
            catch (Exception e)
            {
                throw new Exception("failed to create graph client", e);
            }
        }

        public User GetUserDetails(string email)
        {
            try
            {
                var user = _graphServiceClient.Users[email].GetAsync().Result;
                return user;
            }
            catch (Exception e)
            {
                throw new Exception("error while getting user details");
            }
        }

        public async Task<Call> JoinOnlineMeeting(string eventId, string userId)
        {
            try
            {
                var eventDetails = await GetEventDetails(eventId, userId);

                if (eventDetails.IsOnlineMeeting != true || eventDetails.OnlineMeeting == null) throw new Exception("not an online meeting");

                var user = GetUserDetails(eventDetails.Organizer.EmailAddress.Address);

                var joinUrl = eventDetails.OnlineMeeting.JoinUrl;

                var uri = new Uri(joinUrl);
                var encodedSegment = uri.Segments
                    .FirstOrDefault(s => s.StartsWith("19%3a") && s.Contains("thread.v2"));

                if (encodedSegment == null)
                {
                    throw new Exception("not valid join url");
                }

                encodedSegment = encodedSegment.TrimEnd('/');
                var threadId = WebUtility.UrlDecode(encodedSegment);

                var requestBody = new Call
                {
                    OdataType = "#microsoft.graph.call",
                    CallbackUri = $"{_host}/api/calling",
                    RequestedModalities = new List<Modality?>
                    {
                        Modality.Audio
                    },
                    MediaConfig = new ServiceHostedMediaConfig
                    {
                        OdataType = "#microsoft.graph.serviceHostedMediaConfig"
                    },
                    ChatInfo = new ChatInfo
                    {
                        OdataType = "#microsoft.graph.chatInfo",
                        ThreadId = threadId,
                        MessageId = "0",
                    },
                    MeetingInfo = new OrganizerMeetingInfo
                    {
                        OdataType = "#microsoft.graph.organizerMeetingInfo",
                        Organizer = new IdentitySet
                        {
                            OdataType = "#microsoft.graph.identitySet",
                            User = new Identity
                            {
                                OdataType = "#microsoft.graph.identity",
                                Id = user.Id,
                                DisplayName = user.DisplayName,
                                AdditionalData = new Dictionary<string, object>
                                {
                                    {
                                        "tenantId" , _tenantId
                                    },
                                },
                            },
                        },
                        AdditionalData = new Dictionary<string, object>
                        {
                            {
                                "allowConversationWithoutHost" , true
                            },
                        },
                    },
                    TenantId = _tenantId,
                };

                var call = _graphServiceClient.Communications.Calls.PostAsync(requestBody).Result;

                return call;
            }
            catch (Exception e)
            {
                throw new Exception("failed while joining online meeting", e);
            }
        }

        public async Task<Event> GetEventDetails(string eventId, string userId)
        {
            try
            {
                var eventDetails = await _graphServiceClient.Users[userId].Events[eventId].GetAsync();
                if (eventDetails == null) throw new Exception("event details not found");

                //if (eventDetails.IsOnlineMeeting == true && eventDetails.OnlineMeeting != null)
                //{
                //    var onlineMeeting = _graphServiceClient.Users[userId].OnlineMeetings.GetAsync(configuration =>
                //     {
                //         configuration.QueryParameters.Filter = $"JoinWebUrl eq '{eventDetails.OnlineMeeting.JoinUrl}'";
                //     }).Result;

                //    return eventDetails;
                //}
                //throw new Exception("online meeting not found");

                return eventDetails;

            }
            catch (Exception e)
            {
                throw new Exception("error while getting meeting details by id", e);
            }
        }
    }
}