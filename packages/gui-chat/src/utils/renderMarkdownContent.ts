import katex from 'katex';
import hljs from 'highlight.js';
import * as marked from 'marked';
import { faInfo, faClipboard, faCheck } from '@fortawesome/free-solid-svg-icons'

const supportLanguges = hljs.listLanguages();

export async function renderMarkdownContent(htmlNode: HTMLElement, content: string, lightweight: boolean = false) {
    if(!content) return;
    const contentKaTeX = renderMathFormulas(content);
    const contentHTML = await marked.parse(contentKaTeX);
    htmlNode.innerHTML = contentHTML;
    if (!lightweight) {
        finalizeRendering(htmlNode);
    }
}

export function finalizeRendering(htmlNode: HTMLElement) {
    htmlNode.querySelectorAll('pre code').forEach( (code) => {
        const pre = code.parentNode;
        if(pre?.querySelector('.code-info-div') === null){
            const codeClasses = code.className.split(' ');
            let language = 'undefined';
            for(let codeClass of codeClasses){
                if(codeClass.startsWith('language-')){
                    language = codeClass.substring(9);
                    if(!supportLanguges.includes(language)){
                        code.className = code.className.replace(codeClass, '');
                        language = '*' + language;
                    }
                    break;
                }
            }
            const codeInfoDiv = document.createElement('div');
            codeInfoDiv.className = 'code-info-div';
            const svgInfo = createSvgWithTitle(
                faInfo.icon[4] as string,
                faInfo.icon[0],
                faInfo.icon[1],
                language
            );
            const svgCopy = createSvgWithTitle(
                faClipboard.icon[4] as string,
                faClipboard.icon[0],
                faClipboard.icon[1],
                'copy'
            );
            svgCopy.addEventListener('click', () => {
                const path = svgCopy.querySelector('path');
                path?.setAttribute('d', faCheck.icon[4] as string);
                navigator.clipboard.writeText(code.textContent || '');
                setTimeout(() => {
                    path?.setAttribute('d', faClipboard.icon[4] as string);
                }, 500);
            });
            codeInfoDiv.appendChild(svgInfo);
            codeInfoDiv.appendChild(svgCopy);
            pre.appendChild(codeInfoDiv);
        }
        hljs.highlightElement(code as HTMLElement);
    });
    // console.log(htmlNode.innerHTML);
}

function renderMathFormulas(markdownText: string) {
    if(!markdownText) return '';
    const regexCodeBlock = /```[\s\S]*?```|`[^`]*`/g;

    const regexInlineDollar = /\$(.*?)\$/g;
    const regexBlockDollar = /\$\$(.*?)\$\$/gs;
    const regexInlineParentheses = /\\\((.*?)\\\)/g;
    const regexBlockBrackets = /\\\[([\s\S]*?)\\\]/g;

    const placeholders: string[] = [];
    let placeholderIndex = 0;
    const textWithoutCode = markdownText.replace(regexCodeBlock, (match) => {
        placeholders.push(match);
        return `__CODE_PLACEHOLDER_${placeholderIndex++}__`;
    });

    let replacedText = textWithoutCode;
    replacedText = replacedText.replace(regexBlockDollar, (match, p1) => {
        return katex.renderToString(p1, {
            displayMode: true,
            throwOnError: false
        });
    });
    replacedText = replacedText.replace(regexInlineDollar, (match, p1) => {
        return katex.renderToString(p1, { throwOnError: false });
    });
    replacedText = replacedText.replace(regexBlockBrackets, (match, p1) => {
        return katex.renderToString(p1, {
            displayMode: true,
            throwOnError: false
        });
    });
    replacedText = replacedText.replace(regexInlineParentheses, (match, p1) => {
        return katex.renderToString(p1, { throwOnError: false });
    });
    placeholders.forEach((code, index) => {
        // replacedText = replacedText.replace(`__CODE_PLACEHOLDER_${index}__`, code);
        replacedText = replacedText.split(`__CODE_PLACEHOLDER_${index}__`).join(code);
    });
    return replacedText;
}

function createSvg(pathData: string, width: number, height: number){
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const size = `0 0 ${width} ${height}`;
    svg.setAttribute('viewBox', size);
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);
    return svg;
}

function createSvgWithTitle(pathData: string, width: number, height: number, titleText: string) {
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const size = `0 0 ${width} ${height}`;
    svg.setAttribute('viewBox', size);
    let title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = titleText;
    svg.appendChild(title);
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);
    return svg;
}
