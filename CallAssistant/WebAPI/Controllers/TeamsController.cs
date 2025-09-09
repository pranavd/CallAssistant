using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Results;
using Microsoft.Identity.Json;
using Newtonsoft.Json;
using WebAPI.Services;
using JsonConvert = Newtonsoft.Json.JsonConvert;

namespace WebAPI.Controllers
{
    [RoutePrefix("api")]
    public class TeamsController : ApiController
    {
        public static ConcurrentBag<string> callNotifications = new ConcurrentBag<string>();
        public static ConcurrentBag<string> callIds = new ConcurrentBag<string>();
        public static ConcurrentBag<string> messagelNotifications = new ConcurrentBag<string>();
        public static ConcurrentBag<KeyValuePair<DateTimeOffset, object>> callingNotifications = new ConcurrentBag<KeyValuePair<DateTimeOffset, object>>();
        public static ConcurrentBag<string> changeNotifications = new ConcurrentBag<string>();

        [Route("test"), HttpGet]
        public async Task<string> Test()
        {
            var _callingNotifications = JsonConvert.SerializeObject(callingNotifications);
            var _messagelNotifications = JsonConvert.SerializeObject(messagelNotifications);
            var _callNotifications = JsonConvert.SerializeObject(callNotifications);
            var _callIds = JsonConvert.SerializeObject(callIds);
            return "Success";
        }

        [Route("meeting/join/id"), HttpGet]
        public async Task<HttpResponseMessage> JoinMeetingById([FromUri] string eventId, [FromUri] string userId)
        {
            var graphService = new GraphService();
            var call = await graphService.JoinOnlineMeeting(eventId, userId);
            callIds.Add(call.Id);
            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        [Route("calls"), HttpPost]
        public void Calls(object data)
        {
            var json = JsonConvert.SerializeObject(data);
            callNotifications.Add(json);
        }

        [Route("messages"), HttpPost]
        public void Messages(object data)
        {
            var json = JsonConvert.SerializeObject(data);
            messagelNotifications.Add(json);
        }

        [Route("calling"), HttpPost]
        public void Calling(object data)
        {
            var json = JsonConvert.SerializeObject(data);
            callingNotifications.Add(new KeyValuePair<DateTimeOffset, object>(DateTimeOffset.UtcNow, data));
        }

        [Route("lifecycle"), HttpPost]
        public HttpResponseMessage ChangeNotificationsLifecycle([FromUri] string validationToken = null)
        {
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new StringContent(validationToken);
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/plain");

            return response;
        }

        [HttpGet]
        [Route("notifications")]
        public HttpResponseMessage Get([FromUri] string validationToken = null)
        {
            if (!string.IsNullOrEmpty(validationToken))
            {
                // This is the validation request.
                // Log it for your records.
                System.Diagnostics.Debug.WriteLine($"Received validation token: {validationToken}");

                // Return the token in the response body.
                // The status must be 200 OK and Content-Type must be text/plain.
                var response = new HttpResponseMessage(HttpStatusCode.OK);
                //response.Content = new StringContent(validationToken);
                response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/plain");

                return response;
            }
            else
            {
                // If there is no validation token, it's a bad request.
                return Request.CreateResponse(HttpStatusCode.BadRequest, "Missing validationToken.");
            }
        }

        [HttpPost]
        [Route("notifications")]
        public HttpResponseMessage Post([FromUri] string validationToken = null)
        {
            // At this point, you've successfully validated your endpoint.
            // This is where you will add your code to process the notification payload.
            // You can deserialize the request body here to access the notification details.

            // The 'Request.Content.ReadAsStringAsync()' call can be used to get the raw JSON.
            // You can then deserialize this JSON into a C# object.

            // Log the incoming notification for now.
            var payload = Request.Content.ReadAsStringAsync().Result;

            // Per Microsoft Graph requirements, you must return a 202 Accepted status
            // to acknowledge that you've received the notification.
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            if (validationToken == null)
            {
                response.Content = new StringContent("");
            }
            else
            {
                response.Content = new StringContent(validationToken);
            }

            //response.Content = new StringContent("");
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/plain");

            return response;
        }
    }
}