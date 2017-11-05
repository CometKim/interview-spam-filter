// @flow

import fetch from 'node-fetch';
import XRegExp from 'xregexp';

// FIXME
const linkRegExp = XRegExp.cache('https?://(?<domain>[^/?#" ]+)/?(?<path>[^?#" ]+)?');

export const matchAllLinks = (content: string) => 
    XRegExp.match(content, linkRegExp, 'all');

export const extractNextLinks = async (link: string) => {
    const res = await fetch(link, { method: 'get', redirect: 'manual' });

    let nextLinks = [];

    if (res || res.ok) {
        if (res.status === 301 || res.status === 302) {
            nextLinks = [res.headers.get('location')];
        } else {
            const content = await res.text();
            nextLinks = [...matchAllLinks(content)];
        }
    }

    return nextLinks;
};

export const checkIfContainsSpamLink = (links: string[], spamLinkDomains: string[]) => 
    links
        .map(link => XRegExp.exec(link, linkRegExp).domain)
        .some(domain => spamLinkDomains.includes(domain));

export const isSpam = async (content: string, spamLinkDomains: string[], redirectionDepth: number) => {
    const links = matchAllLinks(content);

    // TODO: caching
    let currLinks = links;
    for (let currDepth = 0; currDepth < redirectionDepth; currDepth++) {
        const nextLinks = await Promise.all(currLinks.map(link => extractNextLinks(link)));
        const flatten = (ary) => ary.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
        currLinks = flatten([...currLinks, ...nextLinks]);
        console.log(currDepth, currLinks);
    }

    return checkIfContainsSpamLink(currLinks, spamLinkDomains);
};