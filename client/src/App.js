import logo from './logo.svg';
import './App.css';
import Game from './components/Game';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: '5t3rrqcph5am1l1a19rg8hkb0d',
      userPoolId: 'us-east-1_M9G0voy5H',
      loginWith: {
        oauth: {
          domain: 'tic-tac-docker.auth.us-east-1.amazoncognito.com',
          scopes: ['openid','email','phone'],
          redirectSignIn: 'http://localhost:8081/',
          redirectSignOut: 'http://localhost:8081/',
          responseType: 'code',
        },
        username: 'true',
      }
    }
  }
});

function App() {
  return (
    <Authenticator signUpAttributes={['email']}>
      {({ signOut, user }) => (
        <div className="App">
          <Game logout={signOut} user={user} />
      </div>
      )}
    </Authenticator>
  );
}

export default App;
