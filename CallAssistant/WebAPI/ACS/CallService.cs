using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Azure.Communication;
using Azure.Communication.CallAutomation;

namespace WebAPI.ACS
{
    public class CallService
    {
        public void MakeCall(string meetingUrl, string acsConnectionString, string sourceUserId)
        {
            // Step 1: Create CallAutomationClient
            var client = new CallAutomationClient(acsConnectionString);
            var connectCallOptions = new ConnectCallOptions(new ServerCallLocator(""), new Uri(""))
            {
                MediaStreamingOptions = new MediaStreamingOptions(MediaStreamingAudioChannel.Mixed),
                TranscriptionOptions = new TranscriptionOptions("en-US", StreamingTransport.Websocket)
            };
            var connectCallResult = client.ConnectCall(connectCallOptions);
            var callMedia = connectCallResult.Value.CallConnection.GetCallMedia();
            var mediaStreamingOptions = new MediaStreamingOptions(MediaStreamingAudioChannel.Mixed)
            {
                TransportUri = new Uri("wss"),
                AudioFormat = AudioFormat.Pcm16KMono,
                EnableBidirectional = false,
                EnableDtmfTones = false,
            };
            callMedia.StartMediaStreaming(new StartMediaStreamingOptions() { });
        }
    }
}