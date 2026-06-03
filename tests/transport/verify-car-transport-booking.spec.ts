import { test, expect } from '@playwright/test';
test.describe('Transport  Suite', {
  tag: '@regression',
}, () => {

test('transport booking car', async ({ page }) => {
   console.log("Worker "+process.env.TEST_WORKER_INDEX+":Transport module TC1 car booking");

});

test('transport booking car post booking', async ({ page }) => {
   console.log("Worker "+process.env.TEST_WORKER_INDEX+":Transport module TC2 car booking");

});
});