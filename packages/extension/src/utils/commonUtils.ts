function padNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
}

export function getTimeStr(){
    const now = new Date();
    const year = now.getFullYear();
    const month = padNumber(now.getMonth() + 1);
    const day = padNumber(now.getDate());
    const hours = padNumber(now.getHours());
    const minutes = padNumber(now.getMinutes());
    const seconds = padNumber(now.getSeconds());
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

export let nanoid: () => string;
(async () => {
    const nanoidModule = await import('nanoid');
    nanoid = nanoidModule.nanoid;
})();
