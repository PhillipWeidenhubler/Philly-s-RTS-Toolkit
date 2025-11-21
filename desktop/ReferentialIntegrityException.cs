using System;
using System.Collections.Generic;
using System.Linq;

namespace PhillyRTSToolkit
{
    public sealed class ReferentialIntegrityException : Exception
    {
        public ReferentialIntegrityException(string scope, string message, IEnumerable<string>? details = null, Exception? innerException = null)
            : base(message, innerException)
        {
            Scope = scope;
            Details = details?.ToArray() ?? Array.Empty<string>();
        }

        public string Scope { get; }

        public IReadOnlyList<string> Details { get; }
    }
}
