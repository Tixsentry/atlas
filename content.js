// Content script that listens for messages from the page
window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    if (event.data.type === 'MONITOR_COOKIE' || event.data.type === 'CANCEL') {
        chrome.runtime.sendMessage(event.data);
    }
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'COOKIE_RESPONSE') {
        window.postMessage({ type: 'COOKIE_RESPONSE', cookies: message.cookies }, '*');
    } else {
        window.postMessage(message, '*');
    }
});