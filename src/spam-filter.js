// @flow

import fetch from 'node-fetch';
import XRegExp from 'xregexp';

import * as ArrayUtils from './utils/array-utils';

// FIXME
const linkRegExp = XRegExp.cache('https?://(?<domain>[^/?#" ]+)/?(?<path>[^?#" ]+)?');

export const matchAllLinks = (content: string): string[] => 
    XRegExp.match(content, linkRegExp, 'all');

export const extractNextLinks = async (link: string): Promise<string[]> => {
    const res = await fetch(link, { method: 'get', redirect: 'manual' });

    let nextLinks: string[] = [];

    if (res || res.ok) {
        if (res.status === 301 || res.status === 302) {
            nextLinks = [res.headers.get('location')];
        } else {
            const content = await res.text();
            nextLinks = matchAllLinks(content);
        }
    }

    return nextLinks;
};

export const checkIfContainsSpamLink = (links: string[], spamLinkDomains: string[]): boolean => 
    links
        .map(link => XRegExp.exec(link, linkRegExp)['domain'])
        .some(domain => spamLinkDomains.includes(domain));

export const isSpam = async (content: string, spamLinkDomains: string[], redirectionDepth: number): Promise<boolean> => {
    const links = matchAllLinks(content);

    // TODO: caching
    let currLinks = links;
    for (let currDepth = 0; currDepth < redirectionDepth; currDepth++) {
        console.log(currDepth, currLinks);

        const nextLinks = await Promise.all(
            currLinks.map(link => extractNextLinks(link))
        );

        currLinks = ArrayUtils.flatten([currLinks, nextLinks]);
    }

    return checkIfContainsSpamLink(currLinks, spamLinkDomains);
};