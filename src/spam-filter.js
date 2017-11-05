// @flow

import XRegExp from 'xregexp';

const linkRegExp = XRegExp.cache('(?i)https?://(?<domain>[^/?# ]+)([/?#]?\w+)?', 'g');

const extractAllLinks = (content: string) => {
    return XRegExp.match(content, linkRegExp);
};

export const isSpam = async (content: string, spamLinkDomains: string[], redirectionDepth: number) => {
    const links = extractAllLinks(content);

    return links
        .map(link => XRegExp.exec(link, linkRegExp).domain)
        .some(domain => spamLinkDomains.includes(domain));
};