// @flow

import { isSpam } from './spam-filter';

describe('SpamFilter', () => {
    describe('isSpam', () => {
        it('should return TRUE when the content includes any link which matches to spam domains', async () => {
            const spamDomains = ['www.naver.com', 'www.daum.net'];

            const testCases = [
                isSpam('content content https://www.naver.com', spamDomains, 0),
                isSpam('content content https://www.google.com https://www.daum.net', spamDomains, 0),
                isSpam('content content https://www.google.com', spamDomains, 0)
            ];

            const results = await Promise.all(testCases);

            expect(results[0]).toEqual(true);
            expect(results[1]).toEqual(true);
            expect(results[2]).toEqual(false);
        });

        it('should return TRUE when the content includes any link which redirect to link OR contains link matches to spam domains', async () => {
            const spamDomains = [
                ['bit.ly'],
                ['goo.gl'],
                ['tvtv24.com'],
                ['www.filekok.com']
            ];

            const testCases = [
                isSpam('spam spam http://bit.ly/2yTkW52', spamDomains[3], 1),
                isSpam('spam spam http://bit.ly/2yTkW52', spamDomains[1], 1),
                isSpam('spam spam http://bit.ly/2yTkW52', spamDomains[2], 2),
                // isSpam('spam spam http://bit.ly/2yTkW52', spamDomains[3], 2), // N/A
                // isSpam('spam spam http://bit.ly/2yTkW52', spamDomains[3], 3), // N/A
            ];

            const results = await Promise.all(testCases);

            expect(results[0]).toEqual(false);
            expect(results[1]).toEqual(true);
            expect(results[2]).toEqual(true);
            // expect(results[3]).toEqual(false);
            // expect(results[4]).toEqual(true);
        });
    });
});