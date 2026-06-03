import { test, expect } from '@playwright/test';
test.describe('Food normal  Suite',{
  tag: '@smoke'}, () => {

test('food booking normal', async ({ page }) => {
      console.log("Worker "+process.env.TEST_WORKER_INDEX+":Food module TC1 food booking");

});

test('food booking normal post booking validation', async ({ page }) => {
console.log("Worker "+process.env.TEST_WORKER_INDEX+":Food module TC2 food booking");

});
});
