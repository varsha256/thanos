import { test, expect } from '@playwright/test';
test.describe.configure({mode:'default'})
test.describe('Food chain booking  Suite',{
  tag: '@regression'}, () => {

test('food booking chaining', async ({ page }) => {
      console.log("Worker "+process.env.TEST_WORKER_INDEX+": Food module TC1 chained booking");
         
});

test('food booking chaining post booking validation', async ({ page }) => {
console.log("Worker "+process.env.TEST_WORKER_INDEX+":Food module TC2 chained booking");
});
});