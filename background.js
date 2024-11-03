let intervals = []

chrome.runtime.onMessage.addListener(async(message, sender, sendResponse) => {
    const { type, cookies, targetDomain: url } = message;

    const getCookieValue = ({url, name}) => {
        return new Promise(resolve => {
            chrome.cookies.get({ url, name }, (cookie) => {
                if (cookie) {
                    resolve({
                        name: cookie.name,
                        value: cookie.value,
                    });
                } else {
                    resolve(null);
                }
            });
        })
    }


    const monitorCookie = (name) => {
        return new Promise(async (resolve) => {
            const oldCookie = await getCookieValue({ url, name });

            chrome.tabs.sendMessage(sender.tab.id, {
                type: 'READY',
                url,
                cookies,
            });

            chrome.cookies.remove({ url, name }, () => {
                const pollForCookie = setInterval(() => {
                    chrome.cookies.get({ url, name }, (cookie) => {
                        if (cookie) {
                            clearInterval(pollForCookie);
                            resolve({
                                name,
                                value: cookie.value,
                            })
                            chrome.cookies.remove({ url, name }, () => {
                                chrome.cookies.set({ url, name, value: oldCookie.value });
                            });
                        }
                    });
                }, 1000);

                intervals.push(pollForCookie)
            });
        })
    }

    switch (type) {
        case 'MONITOR_COOKIE':
            const results = await Promise.all(cookies.map(cookie => monitorCookie(cookie)))
            return chrome.tabs.sendMessage(sender.tab.id, {
                type: 'COOKIE_RESPONSE',
                cookies: results
            });

        default:
            return chrome.tabs.sendMessage(sender.tab.id, {
                type: 'ERROR',
            });
    }
});