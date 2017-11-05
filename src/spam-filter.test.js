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
                ['goo.gl'],
                ['bit.ly'],
                ['tvtv24.com'],
                ['www.filekok.com']
            ];

            const testCases = [
                isSpam('spam spam https://goo.gl/nVLutc', spamDomains[3], 1),
                isSpam('spam spam https://goo.gl/nVLutc', spamDomains[1], 1),
                isSpam('spam spam https://goo.gl/nVLutc', spamDomains[2], 2),
                isSpam('spam spam https://goo.gl/nVLutc', spamDomains[3], 2),
                isSpam('spam spam https://goo.gl/nVLutc', spamDomains[3], 3),
            ];

            const results = await Promise.all(testCases);

            expect(results[0]).toEqual(false);
            expect(results[1]).toEqual(true);
            expect(results[2]).toEqual(true);
            expect(results[3]).toEqual(false);
            expect(results[4]).toEqual(true);
        });
    });
});