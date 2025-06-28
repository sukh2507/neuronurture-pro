
// import React, { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Heart, Eye, EyeOff } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from '@/hooks/use-toast';

// const Auth = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     role: 'mother'
//   });
  
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
//       const response = await fetch(`${baseUrl}${endpoint}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         localStorage.setItem('authToken', data.token);
//         localStorage.setItem('user', JSON.stringify(data.user));
        
//         toast({
//           title: "Success!",
//           description: isLogin ? "Welcome back!" : "Account created successfully!",
//         });

//         // Redirect based on role and needs
//         if (data.user.role === 'admin') {
//           navigate('/admin');
//         } else if (data.user.role === 'doctor') {
//           navigate('/doctor-dashboard');
//         } else if (data.user.needsChoice) {
//           navigate('/choice');
//         } else {
//           navigate('/dashboard');
//         }
//       } else {
//         toast({
//           title: "Error",
//           description: data.error || "Something went wrong",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Network error. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8" >
//           <div className="flex items-center justify-center gap-2 mb-4" onClick={() => navigate('/')}>
//             <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
//               <Heart className="h-8 w-8 text-white" />
//             </div>
//             <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
//               NeuroNurture
//             </span>
//           </div>
//           <p className="text-gray-600">
//             {isLogin ? 'Welcome back to your nurturing journey' : 'Begin your nurturing journey today'}
//           </p>
//         </div>

//         <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
//           <CardHeader className="text-center">
//             <CardTitle className="text-2xl font-bold text-gray-800">
//               {isLogin ? 'Sign In' : 'Create Account'}
//             </CardTitle>
//           </CardHeader>
          
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="your@email.com"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   required
//                   className="mt-1"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="password">Password</Label>
//                 <div className="relative mt-1">
//                   <Input
//                     id="password"
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="••••••••"
//                     value={formData.password}
//                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                     required
//                   />
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="icon"
//                     className="absolute right-0 top-0 h-full px-3"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </Button>
//                 </div>
//               </div>

//               {!isLogin && (
//                 <div>
//                   <Label htmlFor="role">I am a...</Label>
//                   <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
//                     <SelectTrigger className="mt-1">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="mother">Mother</SelectItem>
//                       <SelectItem value="doctor">Healthcare Professional</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               )}

//               <Button 
//                 type="submit" 
//                 className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
//                 disabled={loading}
//               >
//                 {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
//               </Button>
//             </form>

//             <div className="mt-6 text-center">
//               <p className="text-gray-600">
//                 {isLogin ? "Don't have an account? " : "Already have an account? "}
//                 <button
//                   type="button"
//                   onClick={() => setIsLogin(!isLogin)}
//                   className="text-pink-600 font-medium hover:underline"
//                 >
//                   {isLogin ? 'Sign up' : 'Sign in'}
//                 </button>
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Auth;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'mother'
  });
  
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch(`${baseUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          
          // Update user data in localStorage if needed
          localStorage.setItem('user', JSON.stringify(userData.user));
          
          // Redirect based on user role and needs
          if (userData.user.role === 'admin') {
            navigate('/admin');
          } else if (userData.user.role === 'doctor') {
            navigate('/doctor-dashboard');
          } else if (userData.user.needsChoice) {
            navigate('/choice');
          } else {
            navigate('/dashboard');
          }
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Network error, but keep token for now
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // ✅ ADD THIS LINE - Store userId separately
      localStorage.setItem('userId', data.user._id || data.user.id);
      
      toast({
        title: "Success!",
        description: isLogin ? "Welcome back!" : "Account created successfully!",
      });

      // Redirect based on role and needs
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (data.user.needsChoice) {
        navigate('/choice');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast({
        title: "Error",
        description: data.error || "Something went wrong",
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Network error. Please try again.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


  // Show loading spinner while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full mb-4 mx-auto w-fit">
            <Heart className="h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8" >
          <div className="flex items-center justify-center gap-2 mb-4" onClick={() => navigate('/')}>
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              NeuroNurture
            </span>
          </div>
          <p className="text-gray-600">
            {isLogin ? 'Welcome back to your nurturing journey' : 'Begin your nurturing journey today'}
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="role">I am a...</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="doctor">Healthcare Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-pink-600 font-medium hover:underline"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;