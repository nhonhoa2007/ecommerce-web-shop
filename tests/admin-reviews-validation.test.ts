import assert from 'node:assert/strict';
import test from 'node:test';
import { validateReviewModeration } from '@server/modules/reviews/review-moderation';

test('moderation accepts a bounded reply or approval change', () => {
  assert.deepEqual(validateReviewModeration({ id: 'r1', reply: ' Cảm ơn bạn ' }), {
    valid: true, data: { id: 'r1', reply: 'Cảm ơn bạn' },
  });
  assert.equal(validateReviewModeration({ id: 'r1', isApproved: false }).valid, true);
});

test('moderation rejects malformed and empty changes', () => {
  for (const body of [null, {}, { id: 'r1' }, { id: 'r1', reply: 123 }, { id: 'r1', isApproved: 'yes' }, { id: 'r1', reply: 'x'.repeat(2001) }]) {
    assert.equal(validateReviewModeration(body).valid, false);
  }
});
