using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using DotNetEnv;

namespace WebAPI
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            string envFilePath = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, ".env.dev");
            var envEnumerable = Env.Load(envFilePath);

            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }
    }
}
