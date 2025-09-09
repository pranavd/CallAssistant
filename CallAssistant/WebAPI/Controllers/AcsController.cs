using Newtonsoft.Json.Linq;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.Identity.Json;
using WebAPI.Services;

namespace WebAPI.Controllers
{
    [RoutePrefix("acs")]
    public class AcsController : ApiController
    {
        public static ConcurrentBag<SortedDictionary<DateTimeOffset, KeyValuePair<string, object>>> events = new ConcurrentBag<SortedDictionary<DateTimeOffset, KeyValuePair<string, object>>>();

        public AcsController()
        {
            events.Add(new SortedDictionary<DateTimeOffset, KeyValuePair<string, object>>());
        }

        [Route("events"), HttpPost]
        public HttpResponseMessage handleEventsPost(object data)
        {
            string validationCode = string.Empty;
            try
            {
                var json = Newtonsoft.Json.JsonConvert.SerializeObject(data);
                LogService.LogElmahMessage(json);

                var jArray = JArray.Parse(json);
                var eventType = jArray[0]?["eventType"]?.ToString();
                events.First().Add(DateTimeOffset.UtcNow, new KeyValuePair<string, object>(eventType, data));

                if (eventType == "Microsoft.EventGrid.SubscriptionValidationEvent")
                {
                    validationCode = jArray[0]?["data"]?["validationCode"]?.ToString();
                    var response = new HttpResponseMessage(HttpStatusCode.OK);
                    response.Content = new StringContent(validationCode);
                    response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
                    return response;
                }

                return new HttpResponseMessage(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return new HttpResponseMessage(HttpStatusCode.OK);
            }
        }

        [Route("events"), HttpGet]
        public HttpResponseMessage handleEventsPost([FromUri] string validationToken = null, [FromUri] string validationCode = null)
        {
            var payload = Request.Content.ReadAsStringAsync().Result; var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new StringContent(validationCode);
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/plain");

            return response;
        }

        [Route("test"), HttpGet]
        public string Test()
        {
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(events);
            //LogService.LogElmahMessage(json);
            return "Success";
        }
    }
}
