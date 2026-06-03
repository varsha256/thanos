import { test, expect } from '@playwright/test';
test.describe('Transport  Suite', {
  tag: '@smoke',
}, () => {

test('transport booking bike', async ({ page }) => {
    console.log("Worker "+process.env.TEST_WORKER_INDEX+":Transport module TC1 bike booking");

});

test('transport booking bike post booking ', async ({ page }) => {
    console.log("Worker "+process.env.TEST_WORKER_INDEX+":Transport module TC2 bike booking");

});
});