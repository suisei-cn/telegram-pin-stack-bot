export function getIdList(str: string): number[] {
    try {
        const ret = [];
        const target = str.replace(/,/g, " ").replace(/ +/g, " ").split(" ");
        for (const item of target) {
            if (!isNaN(Number(item))) {
                ret.push(Number(item));
                continue;
            }
            // https://t.me/chan/404
            // https://telegram.me/chan/404
            // https://telegram.me/s/chan/404
            // t.me/chanenel/404
            let match1 = item.match(/(https:\/\/)?t(elegram)?\.me\/(s\/)?[a-zA-Z_]+\/([0-9]+)/);
            if (match1 !== null && match1[4]) {
                let num = Number(match1[4]);
                if (!isNaN(num))
                    ret.push(num);
                continue;
            }

            // https://t.me/c/114514/1919
            // https://telegram.me/c/114514/1919
            // t.me/c/114514/1919
            let match2 = item.match(/(https:\/\/)?t(elegram)?\.me\/c\/[0-9]+\/([0-9]+)/);
            if (match2 !== null && match2[3]) {
                let num = Number(match2[3]);
                if (!isNaN(num))
                    ret.push(num);
                continue;
            }
        }
        return ret;
    } catch (e) {
        return [];
    }
}