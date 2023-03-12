const remark = require("remark");
const html = require("remark-html");
const gfm = require("remark-gfm");
const imageOptimizePlugin = require("./src/index");

const image =
  "![Serverless Vs Traditional Infra](https://res.cloudinary.com/adapttive/image/upload/v1675771119/serverless_vs_traditional_infra_83744bc14e.png)";

remark()
  .use(html)
  .use(gfm)
  .use(imageOptimizePlugin)
  .process(image, function (err, output) {
    const result = {
      type: "Optimize Image with Defaults",
      result: {
        input: image,
        output: output.toString(),
      },
      error: err,
    };
    console.info(result);
    console.error("error: ", err);
  });

const images = [
  "![](https://res.cloudinary.com/adapttive/image/upload/v1675771119/serverless_vs_traditional_infra_83744bc14e.png)",
  "![](https://res.cloudinary.com/adapttive/image/upload/v1613929740/Traefik_Dashboard_c8632f6ed1.png)",
];

for (const item of images) {
  const options = {
    loading: "auto",
    cloudinary: {
      format: {
        enable: true,
        convert: "webp",
        extensions: [".png", ".jpeg", ".jpg"],
      },
      quality: {
        enable: true,
        params: "f_auto,q_auto,w_auto,dpr_auto",
      },
      alt: {
        enable: true,
      },
      copyright: {
        enable: true,
        text: "©%20adapttive.com",
      },
    },
    css: {
      img: {
        style: "width:500px;height:600px;",
        className: "image",
      },
      p: {
        style: "width:500px;height:600px;",
        className: "para",
      },
    },
  };
  remark()
    .use(html)
    .use(gfm)
    .use(imageOptimizePlugin, options)
    .process(item, function (err, output) {
      const result = {
        type: "Optimize Image with Options",
        result: {
          input: item,
          output: output.toString(),
        },
        error: err,
      };
      console.info(result);
      console.error("error: ", err);
    });
}
