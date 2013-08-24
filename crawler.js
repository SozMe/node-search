var Crawler = require("crawler").Crawler;
var m = require("mongous").Mongous;

function sanitizeUrl (url) {
	if (url[url.length - 1] == "/")
		url = url.slice(0, -1);
	if (url.indexOf("#") != -1)
		url = url.split(url.indexOf("#"))[0];
	return url;
}

function handle (url) {
	return function (reply) {
					console.log(url);
					// console.log(reply.documents);
					if (!reply.documents.length) {
						// console.log(url);
						m("search.cachedurls").save({url: url});
						m("search.urls").save({url: url});
						c.queue(url);
					} else {
						console.log("already parsed");
					}
		};
}

var urlparse = require("url");

var c = new Crawler({
	"maxConnections":10,

	"callback":function(error,result,$) {

		if ($ !== undefined) {
			$("a").each(function (index, a) {
				// if (a.attribs.href !== undefined){

					// sanitizedUrl = sanitizeUrl(urlparse.resolve("http://", a.href));
					sanitizedUrl = sanitizeUrl(a.href);
					m("search.cachedurls").find({url: sanitizedUrl}, handle(sanitizedUrl));
				// }
			});
		}
	}
});

c.queue("http://www.wikipedia.org/");
