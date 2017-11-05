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

        it.skip('should return TRUE when the content includes any link which redirect to link matches to spam domains', async () => {

        });

        it.skip('should return TRUE when the content includes any link which contains any link on html body matches to spam domains', async () => {

        });
    });
});