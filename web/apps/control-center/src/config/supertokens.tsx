import SuperTokens, { SuperTokensWrapper } from 'supertokens-auth-react';
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword';
import { EmailPasswordPreBuiltUI } from 'supertokens-auth-react/recipe/emailpassword/prebuiltui';
import Session from 'supertokens-auth-react/recipe/session';

SuperTokens.init({
  appInfo: {
    appName: '__DISPLAY_NAME__ Control Center',
    apiDomain: 'http://localhost',
    websiteDomain: 'http://localhost',
    apiBasePath: '/api/__SLUG__/auth/v0',
    websiteBasePath: '/auth',
  },
  recipeList: [
    EmailPassword.init({
      signInAndUpFeature: {
        signUpForm: {
          formFields: [
            {
              id: 'email',
              label: 'Email',
              placeholder: 'Enter your email',
            },
            {
              id: 'password',
              label: 'Password',
              placeholder: 'Enter your password',
            },
          ],
        },
      },
    }),
    Session.init(),
  ],
});

export { SuperTokensWrapper, EmailPasswordPreBuiltUI };
