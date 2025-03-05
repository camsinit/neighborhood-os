import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@supabase/auth-helpers-react';
import AuthHeader from './AuthHeader';
import Switch from './Switch';

// Define the props interface for AuthForm
interface AuthFormProps {
  view?: 'sign_in' | 'sign_up' | 'magic_link' | 'forgotten_password';
}

// Define the state interface for authentication form
interface AuthFormState {
  view: 'sign_in' | 'sign_up' | 'magic_link' | 'forgotten_password';
}

export default function AuthForm({ view = 'sign_in' }: AuthFormProps) {
  const [authView, setAuthView] = useState<AuthFormState['view']>(view);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();

  const returnTo = location.search.includes('returnTo')
    ? location.search.split('returnTo=')[1]
    : '/dashboard';

  const handleViewChange = (newView: AuthFormState['view']) => {
    setAuthView(newView);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <AuthHeader />
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="default"
            view={authView}
            redirectTo={`${window.location.origin}${returnTo}`}
            providers={['google', 'github']}
            magicLink={true}
            // @ts-expect-error
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Password',
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Password',
                },
              },
            }}
            // @ts-expect-error
            className={{
              button:
                'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline',
              input:
                'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
              label: 'block text-gray-700 text-sm font-bold mb-2',
              link: 'inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800',
            }}
          />
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          {/* <Switch
            checked={authView === 'sign_up'}
            onChange={(checked: boolean) => {
              handleViewChange(checked ? 'sign_up' : 'sign_in');
            }}
          />
          <p className="text-sm text-gray-500 mt-2">
            {authView === 'sign_in'
              ? 'Don\'t have an account? Sign up.'
              : 'Already have an account? Sign in.'}
          </p> */}
        </CardFooter>
      </Card>
    </div>
  );
}
