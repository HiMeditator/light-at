const imageExtensions = new Set([
    '.jpg', '.jpeg',   // JPEG 图片
    '.png',            // PNG 图片
    '.gif',            // GIF 图片
    '.bmp',            // BMP 图片
    '.webp',           // WebP 图片
    '.ico',            // 图标文件
    '.tiff', '.tif',   // TIFF 图片
    '.svg',            // SVG 矢量图
    '.raw',            // RAW 格式
    '.heic', '.heif',  // HEIF/HEIC 格式（iPhone 常用）
    '.avif',           // AVIF 格式
    '.apng',           // 动画 PNG
]);

/**
 * 根据文件后缀名判断指定路径的文件是否为图片
 * @param filePath 文件的绝对路径
 * @returns 如果是图片返回 true，否则返回 false
 */
export function isImageFileByExtName(filePath: string): boolean {
    // 常见的图片文件扩展名
    const lastDotIndex = filePath.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === filePath.length - 1) {
        return false;
    }
    const extension = filePath.slice(lastDotIndex).toLowerCase();
    return imageExtensions.has(extension);
}
