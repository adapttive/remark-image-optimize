const visit = require("unist-util-visit");
const merge = require("lodash/fp/merge");
const request = require("sync-request");
const buffer = require("buffer");

const FONT_SIZE_AUTO = "auto";
const FONT_SIZE_RATIO = 4;
const DEFAULT_SETTINGS = {
  loading: "lazy",
  cloudinary: {
    regex: /(https?)\:\/\/(res.cloudinary.com)\/([^/]+)\/(image|video|raw)\/(upload|authenticated)\/(?:(.*)\/)?(?:(v[0-9]+)\/)?(.+)(?:\.[a-z]{3})?/gm,
    format: {
      enable: false,
      convert: "webp",
      extensions: "*",
    },
    quality: {
      enable: false,
      params: "f_auto,q_auto,w_auto,dpr_auto",
    },
    alt: {
      enable: false,
    },
    copyright: {
      enable: false,
      text: "©%20mydomain.com",
      position: "g_south_east,x_5,y_5",
      params: "l_text:#{font}:#{text},#{position},co_rgb:#{color},fl_relative,w_0.15,",
      color: "fff",
      font: "Poppins_#{font-size}_bold",
      "font-size": FONT_SIZE_AUTO,
      "font-size-ratio": FONT_SIZE_RATIO
    },
  },
  css: {
    p: {},
    img: {},
  },
};

module.exports = imageOptimize;

function imageOptimize(options) {
  const { loading, cloudinary, css } = merge(DEFAULT_SETTINGS, options);

  return function transformer(tree) {
    visit(tree, "image", visitor);

    function visitor(node, index, parent) {
      try {
        // change image extension, default to .webp
        if (cloudinary?.format?.enable) {
          if (cloudinary?.format?.extensions == "*") {
            node.url = node.url.replace(
              /\.[^.]+$/,
              `.${cloudinary.format.convert}`
            );
          } else {
            const pattern = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gim;
            const ext = node.url.match(pattern)[0];
            if (cloudinary?.format?.extensions.includes(ext)) {
              node.url = node.url.replace(
                /\.[^.]+$/,
                `.${cloudinary.format.convert}`
              );
            }
          }
        }

        // generate and add image alt text by filename
        if (
          cloudinary?.alt?.enable &&
          (node.alt == null || node.alt.length < 1)
        ) {
          const url = node.url;
          const alt = url
            .replace(/\?.*$/, "")
            .split("/")
            .pop()
            .replace(/\.[^.]+$/, "")
            .split("_")
            .map((word) =>
              word
                .toLowerCase()
                .replace(/\w/, (firstLetter) => firstLetter.toUpperCase())
            )
            .slice(0, -1)
            .join(" ");
          node.alt = alt;
        }

        // add copyright label
        if (cloudinary?.copyright?.enable) {
          if (cloudinary.copyright["font-size"] == FONT_SIZE_AUTO) {
            cloudinary.copyright["font-size"] = getFontSize(
              node.url,
              cloudinary
            );
          }

          const font = cloudinary.copyright.font.format(cloudinary.copyright);
          cloudinary.copyright.font = font;
          const params = cloudinary.copyright.params.format(
            cloudinary.copyright
          );
          node.url = node.url.replace(
            cloudinary.regex,
            `$1://$2/$3/$4/$5/${params}/$6/$7/$8`
          );
        }

        const attributes = {
          src: node.url,
          alt: node.alt,
          loading: loading,
        };

        // add style and css to image and <p> container
        if (css?.img?.className) {
          attributes["class"] = css.img.className;
        }

        if (css?.img?.style) {
          attributes["style"] = css.img.style;
        }

        let result = "";
        if (css?.p?.className) {
          result += `<p class="${css.p.className}">`;
        } else {
          result += "<p>";
        }

        result += "<img";
        for (const key of Object.keys(attributes)) {
          result += " " + key + '="' + attributes[key] + '"';
        }
        result += "></p>";

        parent.type = "html";
        parent.value = result;
      } catch (e) {
        console.log(e);
      }
    }
  };
}

function getFontSize(url, cloudinary) {
  // https://res.cloudinary.com/demo/image/upload/ar_0.7,c_fill,g_auto:subject,w_750/fl_getinfo/boat_lake2.jpg
  const params = "fl_getinfo";
  const infoUrl = url.replace(cloudinary.regex, `$1://$2/$3/$4/$5/${params}/$6/$7/$8`);
  const response = request("GET", infoUrl);
  let content = response.getBody();
  if (typeof content !== "string" && buffer.Buffer.isBuffer(content)) {
    content = content.toString();
  }

  const data = JSON.parse(content);
  let size = 14
  if (data?.output) {
    const countOfChar = cloudinary.copyright.text.length;
    size = parseInt(((data?.output?.width + data?.output?.height)/cloudinary.copyright["font-size-ratio"]) / countOfChar);
  }

  return size;
}

String.prototype.format = function (options) {
  var option,
    regex,
    formatted = this;
  for (option in options) {
    regex = new RegExp("#{" + option + "}", "g");
    formatted = formatted.replace(regex, options[option]);
  }

  return formatted;
};
