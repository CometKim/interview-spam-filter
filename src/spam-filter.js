// @flow

import fetch from 'node-fetch';
import XRegExp from 'xregexp';

const linkRegExp = XRegExp.cache('(?i)https?://(?<domain>[^/?# ]+)[^." ]?');

const extractAllLinks = (content: string) => {
    return XRegExp.match(content, linkRegExp, 'all');
};

export const isSpam = async (content: string, spamLinkDomains: string[], redirectionDepth: number) => {
    const checkIfContainsSpamLink = (links) => links
        .map(link => XRegExp.exec(link, linkRegExp).domain)
        .some(domain => spamLinkDomains.includes(domain));

    let links = extractAllLinks(content);

    for(let currDepth = 0; currDepth < redirectionDepth; ++currDepth) {
        links = await links.reduce(async (prevLinks, link) => {
            const res = await fetch(link, { method: 'get', redirect: 'manual' });

            if (res || res.ok) {
                if (res.status === 301 || res.status === 302) {
                    return [...prevLinks, res.headers.get('location')];
                } else {
                    const content = await res.text();
                    return [...prevLinks, ...extractAllLinks(content)];
                }
            }
        }, []);
    }

    return checkIfContainsSpamLink(links);
};