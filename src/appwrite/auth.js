import config from '../config/config.js';
import { Client, Account, ID } from "appwrite";

export class AuthServices {
    client = new Client();
    account;

    constructor() {
        this.client
            .setEndpoint(config.appwriteUrl)
            .setProject(config.appwriteProjectId);
        this.account = new Account(this.client);
            
    }

    async createAccount({email, password, name}) {
        try {
                console.log(email, password, name);
                const userAccount = await this.account.create(ID.unique(), email, password, name);
                console.log("after account created : ", userAccount);
            if (userAccount) {
                return this.login({email, password});
            } else {
               return  userAccount;
            }
        } catch (error) {
            throw error;
        }
    }

    async login({email, password}) {
        try {
            console.log(email, password);
            const userLoggedIn = await this.account.createEmailPasswordSession(email, password);
            if(userLoggedIn){
                this.verifyUser();

                const urlParams = new URLSearchParams(window.location.search);
                const userId = urlParams.get('userId');
                const secret = urlParams.get('secret');
                if (userId && secret) {
                    this.completeEmailVerification(userId, secret);
                }
            }

        } catch (error) {
            throw error;
        }
    }

    async verifyUser() {
        try {
            const user = await this.account.get();
    
            if (!user.emailVerification) {
                await this.account.createVerification('https://localhost:8000/verification'); 
                console.log('Verification email sent.');
            } else {
                console.log('User is already verified.');
            }
        } catch (error) {
            console.error('Error verifying user:', error);
        }
    }

    async completeEmailVerification(userId, secret) {
        try {
            await this.account.updateVerification(userId, secret);
            console.log('User email verified successfully.');
        } catch (error) {
            console.error('Error completing email verification:', error);
        }
    }

    async getCurrentUser() {
        try {
            return await this.account.get();
        } catch (error) {
            console.log("Appwrite serive :: getCurrentUser :: error", error);
        }

        return null;
    }

    async logout() {
        try {
            await this.account.deleteSessions();
        } catch (error) {
            console.log("Appwrite serive :: logout :: error", error);
        }
    }
}

const authServices = new AuthServices();

export default authServices;