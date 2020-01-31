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

    let resizedImage = {
        width: originalImage.width,
        height: originalImage.height
    }

    if (originalImage.height < 400 || originalImage.width < 400) {
        if (originalImage.height < originalImage.width) {
            resizedImage.height = 400;
            resizedImage.width *= (400/originalImage.height);
        } else if (originalImage.height > originalImage.width) {
            resizedImage.width = 400;
            resizedImage.height *= (400/originalImage.width);
        } else {
            resizedImage.height = 400;
            resizedImage.width = 400;
        }
    }

    let redditLogo = await Canvas.loadImage(__dirname + '/watermark.svg');
    let canv = Canvas.createCanvas(resizedImage.width, resizedImage.height * 1.125);
    let ctx = canv.getContext('2d');
    let watermarkHeight = canv.height - resizedImage.height;

    ctx.fillStyle = '#272729';
    ctx.fillRect(0, 0, canv.width, canv.height);
    ctx.drawImage(originalImage, 0, 0, resizedImage.width, resizedImage.height);
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
    if (ctx.measureText(txtBase).width > resizedImage.width - width - 30) {
        //txt = `Posted in r/${subreddit}`;
        isUsingShorthand = true;
    }
    let addText = (txt, bold) => {
        ctx.font = `${bold ? 'bold ' : ''}${txtSize}px Helvetica`;
        ctx.fillText(txt, sideSpacing + textWidthOffset, resizedImage.height + txtHoffset, resizedImage.width - 20 - width);
        textWidthOffset += ctx.measureText(txt).width;
        console.log(textWidthOffset);
    }
    addText('Posted in ', false);
    addText(`r/${subreddit}`, true);
    if (!isUsingShorthand) {
        addText(' by ', false);
        addText(`u/${author}`, true);
    }
    //ctx.fillText(txt, sideSpacing, resizedImage.height + txtHoffset, resizedImage.width - 20 - width);
    if (textWidthOffset <= resizedImage.width - sideSpacing - width) {
        ctx.drawImage(redditLogo, resizedImage.width - sideSpacing - width, resizedImage.height + imgHoffset, width, height);
    }
    return canv.toBuffer();
}

module.exports = imageTransformer;