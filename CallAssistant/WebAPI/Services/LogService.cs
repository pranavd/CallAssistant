using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Elmah;

namespace WebAPI.Services
{
    public class LogService
    {
        public static void LogElmahMessage(string message)
        {
            try
            {
                ErrorSignal.FromCurrentContext().Raise(
                    new Exception($"{message}")
                );
            }
            catch (Exception ex)
            {
                var exception = ex;
            }
        }
    }
}