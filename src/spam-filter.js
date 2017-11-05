// @flow

import fetch from 'node-fetch';
import XRegExp from 'xregexp';

import * as ArrayUtils from './utils/array-utils';

// FIXME: 미치겠다.
const linkRegExp = XRegExp.cache('https?://(?<domain>[^/?#" ]+)/?(?<path>[^?#" ]+)?');

// FIXME: Tree 모델을 쓰면 아주 적절할 것 같음
const linkCache: { [link: string]: string[] } = {};

const matchAllLinks = (content: string): string[] => 
    XRegExp.match(content, linkRegExp, 'all');

// FIXME: 이쪽에서 재귀 쓰도록 변경하면 적절할 것 같음
const extractNextLinks = async (link: string): Promise<string[]> => {
    const cache = linkCache[link];

    if (cache) {
        console.log(`Cache hit for ${link}`);
        return cache;
    }

    const res = await fetch(link, { method: 'get', redirect: 'manual' });

    let nextLinks: string[] = [];

    if (res || res.ok) {
        if (res.status === 301 || res.status === 302) {
            nextLinks = [res.headers.get('location')];
        } else {
            const content = await res.text();
            nextLinks = matchAllLinks(content);
        }

        linkCache[link] = nextLinks;
    }

    return nextLinks;
};

const checkIfContainsSpamLink = (links: string[], spamLinkDomains: string[]): boolean => 
    links
        .map(link => XRegExp.exec(link, linkRegExp)['domain'])
        .some(domain => spamLinkDomains.includes(domain));

export const isSpam = async (content: string, spamLinkDomains: string[], redirectionDepth: number): Promise<boolean> => {
    const links = matchAllLinks(content);

    let currLinks = links;
    for (let currDepth = 0; currDepth < redirectionDepth; currDepth++) {
        console.log(currDepth, currLinks);

        const nextLinks = await Promise.all(
            currLinks.map(link => extractNextLinks(link))
        );

        currLinks = ArrayUtils.flatten([currLinks, nextLinks]);
        currLinks = ArrayUtils.uniq(currLinks);
    }

    return checkIfContainsSpamLink(currLinks, spamLinkDomains);
};