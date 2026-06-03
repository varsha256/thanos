import {test, expect} from '@playwright/test';
import {LoginPage} from '../../pages/LoginPage';

test.describe('Login Tests' ,() =>{
 let loginPage : LoginPage;

    test.beforeEach(async ({page})=>{
       
        loginPage = new LoginPage(page);
        await loginPage.navigate();

    });
test('Verify sucess login' ,async() =>{

   
    await loginPage.login("student", "Password123");

});

test('Verify failed login' ,async() =>{

   
    await loginPage.errorMessage("Your username is invalid!");

});

});
