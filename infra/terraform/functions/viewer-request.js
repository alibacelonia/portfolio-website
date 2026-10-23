// CloudFront Function (cloudfront-js-2.0), viewer-request. Rendered by Terraform templatefile().
var PRIMARY_HOST = "${primary_host}";

function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : "";

  // Secondary custom domains (e.g. www) redirect to the primary host. The *.cloudfront.net
  // hostname is left alone so the distribution can be tested before DNS changes.
  if (PRIMARY_HOST && host && host !== PRIMARY_HOST && host.indexOf(".cloudfront.net") === -1) {
    var query = "";
    var keys = Object.keys(request.querystring);
    if (keys.length > 0) {
      query =
        "?" +
        keys
          .map(function (key) {
            return key + "=" + request.querystring[key].value;
          })
          .join("&");
    }
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: "https://" + PRIMARY_HOST + request.uri + query } },
    };
  }

  // next.config.ts uses trailingSlash, so pages live at /path/index.html.
  if (request.uri.endsWith("/")) {
    request.uri += "index.html";
  }
  return request;
}
