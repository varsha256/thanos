import {Page , Locator , expect} from '@playwright/test';
import testData from '../test-data.json';

export class LoginPage{


    readonly page : Page;

    readonly email: Locator;

    readonly password: Locator;

    readonly submitBtn: Locator;

    readonly errMsg: Locator;



    constructor ( page: Page){
        this.page= page;
        this.email= page.getByLabel('username');
        this.password= page.getByLabel('password');
        this.submitBtn= page.getByRole('button', {name : 'submit'});
        this.errMsg= page.locator('#error');


    }

    async navigate(){
        await this.page.goto('/practice-test-login/');
    }
    async login(email: string , password : string){
        await this.email.fill(email);
        await this.password.fill(password);
        await this.submitBtn.click();
        await expect(this.page).toHaveURL('/logged-in-successfully/');

    }

    async errorMessage(msg: string){
        await this.email.fill(testData.incorrectusr);
        await this.password.fill(testData.incorrectusr);
        await this.submitBtn.click();
        await expect(this.errMsg).toHaveText(msg);

    }

}
