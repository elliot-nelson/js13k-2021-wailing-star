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
