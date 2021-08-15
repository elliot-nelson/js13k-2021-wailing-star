// Font
//
// This file is generated by `gulp buildAssets`.

export const Font = {
    async init() {
        await new Promise(resolve => {
            let image = new Image();
            image.onload = resolve;
            image.src = Font.data.uri;
            Font.img = image;
        });
    },
    data:
/* <generated> */
{ uri:
   'data:image/png;base64,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' }
/* </generated> */
};
