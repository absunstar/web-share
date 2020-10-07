function test_rss() {
    site.getContent({
        url: 'https://www.alarabiya.net/.mrss/ar.xml'
    }, (text) => {
        rss = JSON.parse(xml_to_json(get_xml_dom(text), ""));
        let link = rss.rss.channel.link;
        spider.get_page_info(link, () => {

        })
        console.log('rss ready ...');
    });
}
function get_xml_dom(text) {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(text, "text/xml");
    return xmlDoc;
};

function xml_to_json(xml, tab = "") {
    var X = {
        toObj: function (xml) {
            var o = {};
            if (xml.nodeType == 1) {
                if (xml.attributes.length) {
                    for (var i = 0; i < xml.attributes.length; i++) {
                        o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                    }
                }

                if (xml.firstChild) {
                    var textChild = 0,
                        cdataChild = 0,
                        hasElementChild = false;
                    for (var n = xml.firstChild; n; n = n.nextSibling) {
                        if (n.nodeType == 1) hasElementChild = true;
                        else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++;
                        else if (n.nodeType == 4) cdataChild++;
                    }
                    if (hasElementChild) {
                        if (textChild < 2 && cdataChild < 2) {
                            X.removeWhite(xml);
                            for (var n = xml.firstChild; n; n = n.nextSibling) {
                                if (n.nodeType == 3)
                                    o["#text"] = X.escape(n.nodeValue);
                                else if (n.nodeType == 4)
                                    o["#cdata"] = X.escape(n.nodeValue);
                                else if (o[n.nodeName]) {
                                    if (o[n.nodeName] instanceof Array)
                                        o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                    else
                                        o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                } else
                                    o[n.nodeName] = X.toObj(n);
                            }
                        } else {
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o["#text"] = X.escape(X.innerXml(xml));
                        }
                    } else if (textChild) {
                        if (!xml.attributes.length)
                            o = X.escape(X.innerXml(xml));
                        else
                            o["#text"] = X.escape(X.innerXml(xml));
                    } else if (cdataChild) {
                        if (cdataChild > 1)
                            o = X.escape(X.innerXml(xml));
                        else {
                            for (var n = xml.firstChild; n; n = n.nextSibling) {
                                o["#cdata"] = X.escape(n.nodeValue);
                            }
                        }

                    }
                }
                if (!xml.attributes.length && !xml.firstChild) o = null;
            } else if (xml.nodeType == 9) {
                o = X.toObj(xml.documentElement);
            } else
                alert("unhandled node type: " + xml.nodeType);
            return o;
        },
        toJson: function (o, name, ind) {
            var json = name ? ("\"" + name + "\"") : "";
            if (o instanceof Array) {
                for (var i = 0, n = o.length; i < n; i++) {
                    o[i] = X.toJson(o[i], "", ind + "\t");
                }
                json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
            } else if (o == null)
                json += (name && ":") + "null";
            else if (typeof (o) == "object") {
                var arr = [];
                for (var m in o) {
                    arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                }
                json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
            } else if (typeof (o) == "string")
                json += (name && ":") + "\"" + o.toString() + "\"";
            else
                json += (name && ":") + o.toString();
            return json;
        },
        innerXml: function (node) {
            var s = ""
            if ("innerHTML" in node)
                s = node.innerHTML;
            else {
                var asXml = function (n) {
                    var s = "";
                    if (n.nodeType == 1) {
                        s += "<" + n.nodeName;
                        for (var i = 0; i < n.attributes.length; i++) {
                            s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                        }
                        if (n.firstChild) {
                            s += ">";
                            for (var c = n.firstChild; c; c = c.nextSibling) {
                                s += asXml(c);
                            }
                            s += "</" + n.nodeName + ">";
                        } else
                            s += "/>";
                    } else if (n.nodeType == 3)
                        s += n.nodeValue;
                    else if (n.nodeType == 4)
                        s += "<![CDATA[" + n.nodeValue + "]]>";
                    return s;
                };
                for (var c = node.firstChild; c; c = c.nextSibling) {
                    s += asXml(c);
                }
            }
            return s;
        },
        escape: function (txt) {
            return txt.replace(/[\\]/g, "\\\\")
                .replace(/[\"]/g, '\\"')
                .replace(/[\n]/g, '\\n')
                .replace(/[\r]/g, '\\r');
        },
        removeWhite: function (e) {
            e.normalize();
            for (var n = e.firstChild; n;) {
                if (n.nodeType == 3) {
                    if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
                        var nxt = n.nextSibling;
                        e.removeChild(n);
                        n = nxt;
                    } else
                        n = n.nextSibling;
                } else if (n.nodeType == 1) {
                    X.removeWhite(n);
                    n = n.nextSibling;
                } else
                    n = n.nextSibling;
            }
            return e;
        }
    };
    if (xml.nodeType == 9)
        xml = xml.documentElement;
    var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
    return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
};

function json_to_xml(o, tab) {
    var toXml = function (v, name, ind) {
            var xml = "";
            if (v instanceof Array) {
                for (var i = 0, n = v.length; i < n; i++)
                    xml += ind + toXml(v[i], name, ind + "\t") + "\n";
            } else if (typeof (v) == "object") {
                var hasChild = false;
                xml += ind + "<" + name;
                for (var m in v) {
                    if (m.charAt(0) == "@")
                        xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                    else
                        hasChild = true;
                }
                xml += hasChild ? ">" : "/>";
                if (hasChild) {
                    for (var m in v) {
                        if (m == "#text")
                            xml += v[m];
                        else if (m == "#cdata")
                            xml += "<![CDATA[" + v[m] + "]]>";
                        else if (m.charAt(0) != "@")
                            xml += toXml(v[m], m, ind + "\t");
                    }
                    xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
                }
            } else {
                xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
            }
            return xml;
        },
        xml = "";
    for (var m in o)
        xml += toXml(o[m], m, "");
    return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
};