# @adapttive/remark-image-optimize

Native lazy loading, class and style attributes with cloudinary optimizations.

**Options**

```js
{
    loading: "auto", // "lazy" | "eager"
    cloudinary: {
        format: {
            enable: true,
            convert: "webp",
            extensions: "*" // [".png", ".jpeg", ".jpg"]
        },
        quality: {
            enable: true,
            params: "f_auto,q_auto,w_auto,dpr_auto",
        },
        alt: {
            enable: false
        },
        copyright: {
            enable: true,
            text: "©%20adapttive.com"
        }
    },
    css: {
      img: {
        style: "width:500px;height:600px;",
        className: "image"
      },
      p: {
        style: "width:500px;height:600px;",
        className: "para"
      }
    }
}
```

Check [usage.js](./usage.js) for example code.