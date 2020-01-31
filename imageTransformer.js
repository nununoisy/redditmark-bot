const Canvas = require('canvas');

/**
 * Adds a reddit saved image affiliation watermark to an image.
 * @param {String} url 
 * @param {number} height 
 * @param {number} width 
 * @param {String} subreddit 
 * @param {String} author 
 * @returns {Promise<Buffer>}
 */
async function imageTransformer(url, subreddit, author) {
    let originalImage = await Canvas.loadImage(url);

    if (originalImage.height < 200 || originalImage.width < 200) {
        throw new Error("image too small");
    }

    let redditLogo = await Canvas.loadImage(__dirname + '/watermark.svg');
    let canv = Canvas.createCanvas(originalImage.width, originalImage.height * 1.125);
    let ctx = canv.getContext('2d');
    let watermarkHeight = canv.height - originalImage.height;

    ctx.fillStyle = '#272729';
    ctx.fillRect(0, 0, canv.width, canv.height);
    ctx.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height);
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    let isUsingShorthand = false;
    let txtBase = `Posted in r/${subreddit} by u/${author}`;
    let txtSize = Math.floor(watermarkHeight * 0.3);
    var textWidthOffset = 0;
    let width = (watermarkHeight * 0.5) / 0.325;
    let height = watermarkHeight * 0.5;
    let txtHoffset = Math.floor(watermarkHeight/2);
    let sideSpacing = Math.floor(watermarkHeight/3);
    let imgHoffset = Math.floor(watermarkHeight * 0.25);
    ctx.font = `${txtSize}px Helvetica`;
    if (ctx.measureText(txtBase).width > originalImage.width - width - 30) {
        //txt = `Posted in r/${subreddit}`;
        isUsingShorthand = true;
    }
    let addText = (txt, bold) => {
        ctx.font = `${bold ? 'bold ' : ''}${txtSize}px Helvetica`;
        ctx.fillText(txt, sideSpacing + textWidthOffset, originalImage.height + txtHoffset, originalImage.width - 20 - width);
        textWidthOffset += ctx.measureText(txt).width;
        console.log(textWidthOffset);
    }
    addText('Posted in ', false);
    addText(`r/${subreddit}`, true);
    if (!isUsingShorthand) {
        addText(' by ', false);
        addText(`u/${author}`, true);
    }
    //ctx.fillText(txt, sideSpacing, originalImage.height + txtHoffset, originalImage.width - 20 - width);
    ctx.drawImage(redditLogo, originalImage.width - sideSpacing - width, originalImage.height + imgHoffset, width, height);
    return canv.toBuffer();
}

module.exports = imageTransformer;