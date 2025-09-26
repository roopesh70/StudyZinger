
'use client';
import { useState } from 'react';
import { useAuth } from '@/firebase';
import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, GraduationCap } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginPage() {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    google: false,
    email: false,
  });

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(prev => ({ ...prev, google: true }));

    const provider = new GoogleAuthProvider();
    const returnTo = searchParams.get('returnTo') || '/';

    sessionStorage.setItem('returnTo', returnTo);

    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Error during sign-in redirect:', error);
      setLoading(prev => ({ ...prev, google: false }));
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: (error as Error).message,
      });
    }
  };

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const handleEmailLogin = async (values: z.infer<typeof loginSchema>) => {
    if (!auth) return;
    setLoading(prev => ({ ...prev, email: true }));
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // Redirect is handled by the auth state listener in the callback page
    } catch (error) {
      console.error('Error signing in with email:', error);
      toast({
        variant: 'destructive',
        title: 'Sign-In Failed',
        description: 'Invalid email or password. Please try again.',
      });
    } finally {
      setLoading(prev => ({ ...prev, email: false }));
    }
  };

  const handleEmailRegister = async (
    values: z.infer<typeof registerSchema>
  ) => {
    if (!auth) return;
    setLoading(prev => ({ ...prev, email: true }));
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      await updateProfile(userCredential.user, {
        displayName: values.name,
      });
      // Redirect is handled by the auth state listener in the callback page
    } catch (error: any) {
      console.error('Error registering with email:', error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        description =
          'This email is already in use. Please try logging in instead.';
      }
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description,
      });
    } finally {
      setLoading(prev => ({ ...prev, email: false }));
    }
  };

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2">
        <GraduationCap className="size-10 text-primary" />
        <h1 className="font-script text-6xl text-primary">zinger</h1>
      </div>
      <Tabs defaultValue="login" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="register">Create Account</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back!</CardTitle>
              <CardDescription>
                Sign in to access your personalized study plans.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(handleEmailLogin)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            {...field}
                            type="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            {...field}
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading.email}>
                    {loading.email && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </Form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                onClick={handleGoogleLogin}
                className="w-full"
                variant="outline"
                disabled={loading.google}
              >
                {loading.google ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.3 109.8 11.8 244 11.8c70.3 0 129.8 27.8 175.3 74.3l-66.2 63.8C321.3 122.3 286.2 101.8 244 101.8c-63.9 0-116.3 52.3-116.3 116.3s52.4 116.3 116.3 116.3c69.1 0 106.3-43.9 111.3-66.9H244v-83.8h235.9c2.3 12.7 3.6 26.4 3.6 40.9z"
                    ></path>
                  </svg>
                )}
                Google
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create an Account</CardTitle>
              <CardDescription>
                Get started with your AI-powered study partner today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(handleEmailRegister)}
                  className="space-y-4"
                >
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            {...field}
                            type="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            {...field}
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading.email}>
                    {loading.email && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

    